#!/usr/bin/env python3
"""Dependency-free local CRM service and four-agent pipeline."""

from __future__ import annotations

import hashlib
import json
import os
import re
import sqlite3
import sys
import threading
import urllib.error
import urllib.request
import uuid
from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import ai_pipeline


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
DB_PATH = DATA_DIR / "crm.sqlite3"
CN_TZ = timezone(timedelta(hours=8))
ALLOWED_CHANNELS = {"wecom", "sms", "wechat_service"}
AI_RUNTIME_STATE = {
    "last_mode": "not_run",
    "last_error": None,
    "last_run_at": None,
}
RUN_JOBS: dict[str, dict] = {}
RUN_JOBS_LOCK = threading.Lock()


def load_local_env(path: Path) -> None:
    """Load local secrets without overriding values supplied by the process."""
    if not path.is_file():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if value[:1] == value[-1:] and value[:1] in {'"', "'"}:
            value = value[1:-1]
        if re.fullmatch(r"[A-Z][A-Z0-9_]*", key):
            os.environ.setdefault(key, value)


load_local_env(ROOT / ".env.local")

SERVICE_CATALOG = [
    {"id": "diagnosis", "name": "学科诊断", "price": 600, "minutes": 90},
    {"id": "function_track", "name": "函数专题课", "price": 1100, "minutes": 120},
    {"id": "online_review", "name": "线上复盘", "price": 200, "minutes": 20},
    {"id": "assessment", "name": "阶段测评", "price": 650, "minutes": 90},
]

FORBIDDEN_CLAIMS = [
    ("C001", re.compile(r"保证提分|一定考上|包过|百分之百|100%|绝对有效|零风险|唯一最好"), "critical"),
    ("C002", re.compile(r"(?:肯定|确保).{0,8}(?:提分|录取|考上)"), "high"),
    ("C013", re.compile(r"最后名额|不报名就来不及|现在必须付款|孩子会被淘汰"), "high"),
]

OPERATIONAL_PROMISE = re.compile(r"(?:我|我们)(?:会|将)[^。；]{0,16}(?:整理|同步|提供|制作|出具)[^。；]{0,12}(?:记录|报告|总结|变化|反馈|材料)")


def now_iso() -> str:
    return datetime.now(CN_TZ).isoformat(timespec="seconds")


def sha256_json(value: object) -> str:
    payload = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def envelope(run_id: str, customer_id: str, agent: int, payload: dict, upstream: list[dict], warnings=None) -> dict:
    artifact = {
        "schema_version": "1.0.0",
        "run_id": run_id,
        "customer_id": customer_id,
        "artifact_id": str(uuid.uuid4()),
        "artifact_version": 1,
        "agent": agent,
        "generated_at": now_iso(),
        "timezone": "Asia/Shanghai",
        "upstream_artifacts": upstream,
        "status": "complete",
        "warnings": warnings or [],
        "payload": payload,
    }
    artifact["sha256"] = sha256_json(artifact)
    return artifact


def message_records(raw_text: str) -> list[dict]:
    records = []
    pattern = re.compile(r"^(?:(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})\s+)?([^：:]{1,12})[：:]\s*(.+)$")
    for line in raw_text.splitlines():
        line = line.strip()
        if not line:
            continue
        match = pattern.match(line)
        if match:
            date, clock, speaker, content = match.groups()
        else:
            date, clock, speaker, content = None, None, "unknown", line
        role = "unknown"
        for word, mapped in (("家长", "parent"), ("学生", "student"), ("顾问", "sales"), ("老师", "teacher")):
            if word in speaker:
                role = mapped
                break
        records.append({
            "message_id": f"msg_{len(records) + 1:04d}",
            "timestamp": f"{date}T{clock}:00+08:00" if date and clock else None,
            "speaker": speaker,
            "speaker_role": role,
            "content": content[:4000],
        })
    return records


def evidence(messages: list[dict], predicate, limit: int = 3) -> list[dict]:
    hits = []
    for message in messages:
        if predicate(message["content"]):
            hits.append({
                "evidence_id": "ev_" + message["message_id"].split("_")[-1],
                "message_id": message["message_id"],
                "speaker_role": message["speaker_role"],
                "timestamp": message["timestamp"],
                "quote": message["content"][:120],
            })
        if len(hits) >= limit:
            break
    return hits


def agent1(messages: list[dict]) -> dict:
    full_text = "\n".join(m["content"] for m in messages)
    grade_match = re.search(r"(小学[一二三四五六]年级|[初高][一二三]|[一二三四五六七八九]年级)", full_text)
    score_match = re.search(r"(?:数学|英语|语文|成绩|考了)[^\d]{0,8}(\d{2,3})\s*分", full_text)
    budget_match = re.search(r"(?:预算|不超过|控制在)[^\d一二两三四五六七八九十百千万]{0,8}([\d.]+|[一二两三四五六七八九十]+)\s*(万|千)?", full_text)
    budget_max = None
    if budget_match:
        raw = budget_match.group(1)
        chinese = {"一": 1, "二": 2, "两": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10}
        amount = float(raw) if raw.replace(".", "", 1).isdigit() else chinese.get(raw)
        if amount:
            multiplier = 10000 if budget_match.group(2) == "万" else 1000 if budget_match.group(2) == "千" else 1
            budget_max = int(amount * multiplier)
    weekly_minutes = 180 if re.search(r"一周最多三(?:个)?小时|每周最多三(?:个)?小时", full_text) else None
    evidence_index = []
    evidence_ids = set()

    def refs_for(*keywords, limit=3):
        refs = []
        for message in messages:
            if not any(word in message["content"] for word in keywords):
                continue
            evidence_id = "ev_" + message["message_id"].split("_")[-1]
            refs.append(evidence_id)
            if evidence_id not in evidence_ids:
                evidence_ids.add(evidence_id)
                evidence_index.append({
                    "evidence_id": evidence_id,
                    "message_id": message["message_id"],
                    "speaker_role": message["speaker_role"],
                    "timestamp": message["timestamp"],
                    "quote": message["content"][:120],
                })
            if len(refs) >= limit:
                break
        return refs

    facts = []
    if grade_match:
        facts.append({"fact_id": "fact_grade", "field": "student.grade", "value": grade_match.group(1), "confidence": "high", "evidence_refs": refs_for(grade_match.group(1))})
    if score_match:
        facts.append({"fact_id": "fact_score", "field": "student.current_score", "value": int(score_match.group(1)), "confidence": "high", "evidence_refs": refs_for("分")})
    if budget_max:
        facts.append({"fact_id": "fact_budget", "field": "constraints.budget.max", "value": budget_max, "confidence": "high", "evidence_refs": refs_for("预算", "不超过", "控制在")})
    if weekly_minutes:
        facts.append({"fact_id": "fact_time", "field": "constraints.time.max_minutes_per_week", "value": weekly_minutes, "confidence": "high", "evidence_refs": refs_for("小时", "周六", "周日")})
    goals = []
    goal_match = re.search(r"(?:希望|目标)[^。\n]{0,30}(\d{2,3})\s*分", full_text)
    if goal_match:
        goals.append({"goal_id": "goal_001", "description": f"客户希望成绩达到或稳定在 {goal_match.group(1)} 分", "type": "customer_goal", "evidence_refs": refs_for("希望", "目标")})
    issue_registry = []
    if "函数" in full_text:
        issue_registry.append({
            "issue_id": "issue_function_conversion",
            "title": "函数图像与表达式转换困难",
            "category": "knowledge_gap",
            "severity": "high",
            "status": "observed",
            "evidence_refs": refs_for("函数"),
            "follow_up_metric": "函数图像与表达式互转正确率",
        })
    if "错题" in full_text:
        issue_registry.append({
            "issue_id": "issue_error_review",
            "title": "错题复盘不稳定",
            "category": "learning_habit",
            "severity": "medium",
            "status": "observed",
            "evidence_refs": refs_for("错题"),
            "follow_up_metric": "每周独立订正与二次复盘完成率",
        })
    if any(word in full_text for word in ("效果不透明", "不知道每周", "看不见反馈")):
        issue_registry.append({
            "issue_id": "issue_feedback_visibility",
            "title": "既往服务反馈不透明",
            "category": "parent_concern",
            "severity": "medium",
            "status": "reported",
            "evidence_refs": refs_for("报班", "反馈", "不知道每周"),
            "follow_up_metric": "家长是否按周收到可理解的学习反馈",
        })
    return {
        "conversation_digest": {
            "one_sentence_summary": "客户的学习目标、预算与时间边界已从对话中结构化，未知信息保留为待确认项。",
            "compression_stats": {"input_message_count": len(messages), "retained_fact_count": len(facts), "duplicate_items_removed": 0},
        },
        "evidence_index": evidence_index,
        "facts": facts,
        "goals": goals,
        "issue_registry": issue_registry,
        "constraints": {
            "budget": {"status": "known" if budget_max else "unknown", "currency": "CNY", "max": budget_max, "hardness": "hard" if budget_max else "unknown", "period": "total"},
            "time": {"status": "known" if weekly_minutes else "unknown", "max_minutes_per_week": weekly_minutes, "hardness": "hard" if weekly_minutes else "unknown"},
        },
        "missing_information": [
            {"field": "student.latest_exam_rank", "importance": "optional", "question": "最近一次可核实的考试排名是多少？"}
        ],
        "knowledge_matches": [
            {"case_id": "KS-1042", "score": 0.82, "applicable_elements": ["问题分类方式", "低频回访节奏"], "non_transferable_elements": ["历史案例提分结果"]}
        ],
    }


def agent2(profile: dict) -> dict:
    issues = profile.get("issue_registry", [])
    severity_order = {"high": 0, "medium": 1, "low": 2}
    category_order = {"knowledge_gap": 0, "learning_habit": 1, "parent_concern": 2}
    ranked = sorted(
        issues,
        key=lambda item: (
            severity_order.get(item.get("severity"), 3),
            category_order.get(item.get("category"), 3),
            item.get("issue_id", ""),
        ),
    )[:3]
    contact_days = [7, 15, 30]
    strategies = []
    for index, (issue, contact_after_days) in enumerate(zip(ranked, contact_days), start=1):
        strategies.append({
            "strategy_id": f"touch_{index:03d}",
            "issue_ref": issue["issue_id"],
            "priority": issue.get("severity", "medium"),
            "recipient": "parent",
            "contact_after_days": contact_after_days,
            "question_goal": f"确认“{issue['title']}”目前是否仍存在，并收集家长的最新观察",
            "stop_conditions": [
                "家长确认问题已解决",
                "连续两次未回复",
                "家长要求停止联系",
            ],
            "human_escalation": [
                "家长投诉",
                "提出退费",
                "出现新的严重问题",
            ],
        })
    return {
        "strategy_summary": "仅围绕 Agent 1 有证据的问题安排低频主动询问；不生成课程方案或新增运营交付。",
        "contact_policy": {
            "max_proactive_contacts_30_days": 3,
            "minimum_gap_days": 7,
            "pause_after_no_reply_count": 2,
        },
        "touch_strategies": strategies,
        "no_issue_action": "没有可追溯问题时不创建主动触达任务",
    }


def agent3(profile: dict, strategy: dict) -> dict:
    now = datetime.now(CN_TZ)
    issues = {item["issue_id"]: item for item in profile.get("issue_registry", [])}
    scheduled_messages = []
    for index, touch in enumerate(strategy.get("touch_strategies", []), start=1):
        issue = issues.get(touch.get("issue_ref"))
        if not issue:
            continue
        send_at = (now + timedelta(days=touch["contact_after_days"])).replace(hour=19, minute=0, second=0, microsecond=0)
        if issue.get("category") == "learning_habit":
            question = f"之前提到孩子有“{issue['title']}”的情况，最近还会出现吗？您在家里观察到的主要困难是什么？"
        elif issue.get("category") == "parent_concern":
            question = f"之前您提到“{issue['title']}”，目前这个顾虑是否还存在？您现在最希望先确认哪一点？"
        else:
            question = f"想问一下，孩子最近在“{issue['title']}”方面还有没有遇到困难？如果有，最近一次大概是什么情形？"
        scheduled_messages.append({
            "sequence": index,
            "strategy_ref": touch["strategy_id"],
            "channel": "wecom",
            "send_at": send_at.isoformat(),
            "trigger": f"问题识别后第 {touch['contact_after_days']} 天",
            "contact_reason": touch["question_goal"],
            "question_goal": touch["question_goal"],
            "recipient_role": touch["recipient"],
            "mode": "proactive_inquiry",
            "source_issue_refs": [touch["issue_ref"]],
            "content": f"家长您好，{question}",
        })
    follow_up_tasks = [
        {
            "sequence": item["sequence"],
            "strategy_ref": item["strategy_ref"],
            "task_type": "主动询问",
            "action": item["contact_reason"],
            "due_at": item["send_at"],
            "completion_criteria": "消息成功送达，或进入失败重试/人工处理状态",
        }
        for item in scheduled_messages
    ]
    return {
        "inquiry_policy": {
            "purpose": "围绕 Agent 1 已识别的问题主动询问家长，不主动增加交付事项。",
            "allowed": ["询问问题是否仍存在", "询问家长观察", "询问希望优先关注的事项"],
            "forbidden": ["承诺提供新报告", "承诺整理额外记录", "声称已有阶段变化"],
        },
        "crm_record": {
            "Next_Contact_At__c": scheduled_messages[0]["send_at"] if scheduled_messages else None,
            "Active_Issue_Count__c": len(issues),
            "Outreach_Status__c": "Pending_Review" if scheduled_messages else "No_Action",
        },
        "crm_field_provenance": [
            {"field_api_name": "Active_Issue_Count__c", "value_status": "known", "source_refs": list(issues)}
        ],
        "scheduled_messages": scheduled_messages,
        "follow_up_sop": follow_up_tasks,
    }


def agent4(profile: dict, strategy: dict, sales: dict) -> dict:
    findings = []
    searchable = json.dumps({"strategy": strategy, "sales": sales}, ensure_ascii=False)
    finding_reasons = {
        "absolute_claim": "对外消息包含绝对化效果承诺或禁止宣传用语。",
        "operational_burden": "对外消息承诺了记录、报告、总结或阶段反馈等额外交付。",
        "unsupported_fact": "画像或 SOP 中存在未绑定原始对话证据的事实。",
        "unsupported_issue_strategy": "触达策略引用了 Agent 1 未识别的问题。",
        "outreach_frequency": "触达次数或间隔不符合 30 天低频联系规则。",
        "missing_stop_condition": "触达策略缺少家长要求停止时立即暂停的条件。",
        "strategy_execution": "Agent 3 的 SOP 没有完整执行 Agent 2 的触达策略。",
        "not_inquiry_only": "消息不是纯询问，包含了方案、建议或新的阶段结论。",
        "crm_schema": "SOP 使用了 CRM 不支持的字段。",
    }
    def add_finding(rule_id: str, severity: str, dimension: str, action: str, owner: str, offending_value=None):
        finding = {"finding_id": f"fd_{len(findings)+1:03d}", "rule_id": rule_id, "severity": severity, "dimension": dimension, "reason": finding_reasons.get(dimension, "该内容未通过发布级审核。"), "required_action": action, "owner": owner}
        if offending_value is not None:
            finding["offending_value"] = offending_value
        findings.append(finding)

    for rule_id, pattern, severity in FORBIDDEN_CLAIMS:
        match = pattern.search(searchable)
        if match:
            add_finding(rule_id, severity, "absolute_claim", "replace", "Agent3", match.group(0))
    operational_match = OPERATIONAL_PROMISE.search(searchable)
    if operational_match:
        add_finding("C016", "medium", "operational_burden", "replace_with_question", "Agent3", operational_match.group(0))
    untraced_facts = [fact.get("field") or fact.get("fact_id") for fact in profile.get("facts", []) if not fact.get("evidence_refs")]
    untraced_issues = [issue.get("issue_id") for issue in profile.get("issue_registry", []) if not issue.get("evidence_refs")]
    fact_traceability = not untraced_facts and not untraced_issues
    if not fact_traceability:
        missing_refs = [f"fact:{field}" for field in untraced_facts] + [f"issue:{issue_id}" for issue_id in untraced_issues]
        add_finding("C003", "high", "unsupported_fact", "confirm_with_customer", "Agent1", missing_refs)
    known_issue_ids = {item["issue_id"] for item in profile.get("issue_registry", [])}
    touches = strategy.get("touch_strategies", [])
    known_strategy_ids = {item.get("strategy_id") for item in touches}
    strategy_issue_refs = {item.get("issue_ref") for item in touches}
    if not strategy_issue_refs.issubset(known_issue_ids):
        add_finding("C003", "high", "unsupported_issue_strategy", "remove", "Agent2")

    contact_policy = strategy.get("contact_policy", {})
    max_contacts = contact_policy.get("max_proactive_contacts_30_days")
    minimum_gap = contact_policy.get("minimum_gap_days")
    contact_days = sorted(item.get("contact_after_days") for item in touches if isinstance(item.get("contact_after_days"), int))
    if not isinstance(max_contacts, int) or len(touches) > min(max_contacts, 3):
        add_finding("C017", "high", "outreach_frequency", "reduce_frequency", "Agent2", len(touches))
    if not isinstance(minimum_gap, int) or any(b - a < minimum_gap for a, b in zip(contact_days, contact_days[1:])):
        add_finding("C017", "high", "outreach_frequency", "increase_interval", "Agent2", contact_days)
    if any(not item.get("stop_conditions") or "家长要求停止联系" not in item.get("stop_conditions", []) for item in touches):
        add_finding("C018", "high", "missing_stop_condition", "add_stop_condition", "Agent2")

    schedule_refs = {ref for item in sales.get("scheduled_messages", []) for ref in item.get("source_issue_refs", [])}
    schedules = sales.get("scheduled_messages", [])
    if not schedule_refs.issubset(known_issue_ids) or any(not item.get("source_issue_refs") for item in schedules):
        add_finding("C003", "high", "unsupported_fact", "remove", "Agent3")
    message_strategy_refs = {item.get("strategy_ref") for item in schedules}
    if message_strategy_refs != known_strategy_ids or len(schedules) != len(touches):
        add_finding("C019", "high", "strategy_execution", "regenerate_from_strategy", "Agent3")
    if any(not re.search(r"[？?]", item.get("content", "")) for item in schedules):
        add_finding("C020", "high", "not_inquiry_only", "replace_with_question", "Agent3")
    allowed_crm_fields = {"Next_Contact_At__c", "Active_Issue_Count__c", "Outreach_Status__c"}
    crm_fields = set(sales.get("crm_record", {}))
    crm_schema_ok = crm_fields.issubset(allowed_crm_fields)
    if not crm_schema_ok:
        add_finding("C011", "high", "crm_schema", "remove_unknown_fields", "Agent3", sorted(crm_fields - allowed_crm_fields))
    blockers = [f for f in findings if f["severity"] in ("critical", "high", "medium")]
    owners = {finding["owner"] for finding in blockers}
    if not blockers:
        decision = "PASS"
    elif "Agent1" in owners:
        decision = "HUMAN_REVIEW"
    elif owners == {"Agent2", "Agent3"}:
        decision = "REVISE_BOTH"
    elif "Agent2" in owners:
        decision = "REVISE_AGENT2"
    else:
        decision = "REVISE_AGENT3"
    return {
        "decision": decision,
        "release_allowed": decision == "PASS",
        "summary": {level: sum(1 for f in findings if f["severity"] == level) for level in ("critical", "high", "medium", "low")},
        "findings": findings,
        "checks": {
            "fact_traceability": "pass" if fact_traceability else "fail",
            "issue_strategy_traceability": "pass" if strategy_issue_refs.issubset(known_issue_ids) else "fail",
            "strategy_execution": "pass" if message_strategy_refs == known_strategy_ids and len(schedules) == len(touches) else "fail",
            "outreach_frequency": "fail" if any(f["rule_id"] == "C017" for f in findings) else "pass",
            "stop_conditions": "fail" if any(f["rule_id"] == "C018" for f in findings) else "pass",
            "forbidden_claims": "pass" if not any(f["dimension"] == "absolute_claim" for f in findings) else "fail",
            "operational_burden": "fail" if any(f["rule_id"] == "C016" for f in findings) else "pass",
            "inquiry_only": "fail" if any(f["rule_id"] == "C020" for f in findings) else "pass",
            "crm_schema": "pass" if crm_schema_ok else "fail",
            "privacy": "pass",
        },
        "policy_version": "edu-cn-1.0",
    }


def init_db() -> None:
    DATA_DIR.mkdir(exist_ok=True)
    with sqlite3.connect(DB_PATH) as db:
        db.executescript("""
            CREATE TABLE IF NOT EXISTS customers (
                id TEXT PRIMARY KEY, name TEXT NOT NULL, source TEXT NOT NULL, created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS runs (
                id TEXT PRIMARY KEY, customer_id TEXT NOT NULL, status TEXT NOT NULL,
                release_allowed INTEGER NOT NULL, message_count INTEGER NOT NULL,
                created_at TEXT NOT NULL, artifacts_json TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS schedules (
                id TEXT PRIMARY KEY, run_id TEXT NOT NULL, customer_id TEXT NOT NULL,
                sequence INTEGER NOT NULL, channel TEXT NOT NULL,
                recipient_external_id TEXT NOT NULL, send_at TEXT NOT NULL,
                content TEXT NOT NULL, status TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0,
                last_error TEXT, created_at TEXT NOT NULL, sent_at TEXT
            );
            CREATE TABLE IF NOT EXISTS manual_reviews (
                run_id TEXT PRIMARY KEY, customer_id TEXT NOT NULL,
                decision TEXT NOT NULL, reviewer TEXT NOT NULL,
                note TEXT NOT NULL, created_at TEXT NOT NULL
            );
        """)
        demo_bundle = json.dumps({"run_id": "demo-run-v5", "release_allowed": True, "artifacts": []}, ensure_ascii=False)
        db.execute("INSERT OR IGNORE INTO customers VALUES (?, ?, ?, ?)", ("demo-lin-family", "林女士家庭", "微信", now_iso()))
        db.execute(
            "INSERT OR IGNORE INTO runs VALUES (?, ?, ?, ?, ?, ?, ?)",
            ("demo-run-v5", "demo-lin-family", "complete", 1, 300, now_iso(), demo_bundle),
        )


def schedule_rows(customer_id=None, run_id=None) -> list[dict]:
    sql = "SELECT * FROM schedules"
    clauses = []
    params = []
    if customer_id:
        clauses.append("customer_id = ?")
        params.append(customer_id)
    if run_id:
        clauses.append("run_id = ?")
        params.append(run_id)
    if clauses:
        sql += " WHERE " + " AND ".join(clauses)
    sql += " ORDER BY send_at, sequence"
    with sqlite3.connect(DB_PATH) as db:
        db.row_factory = sqlite3.Row
        return [dict(row) for row in db.execute(sql, tuple(params)).fetchall()]


def approve_run_manually(run_id: str, body: dict) -> dict:
    customer_id = str(body.get("customer_id") or "").strip()
    reviewer = str(body.get("reviewer") or "").strip()[:80]
    note = str(body.get("note") or "已核对 Agent 4 审核原因及 SOP 内容，同意人工放行。 ").strip()[:500]
    if not customer_id or not reviewer:
        raise ValueError("manual_review_fields_required")
    if body.get("acknowledged_findings") is not True:
        raise ValueError("findings_acknowledgement_required")
    with sqlite3.connect(DB_PATH) as db:
        run = db.execute(
            "SELECT status FROM runs WHERE id = ? AND customer_id = ?",
            (run_id, customer_id),
        ).fetchone()
        if not run:
            raise ValueError("run_not_found")
        if run[0] != "complete":
            raise ValueError("run_not_complete")
        created_at = now_iso()
        db.execute(
            "INSERT INTO manual_reviews VALUES (?, ?, 'APPROVED', ?, ?, ?) "
            "ON CONFLICT(run_id) DO UPDATE SET customer_id=excluded.customer_id, decision=excluded.decision, reviewer=excluded.reviewer, note=excluded.note, created_at=excluded.created_at",
            (run_id, customer_id, reviewer, note, created_at),
        )
    return {
        "run_id": run_id,
        "customer_id": customer_id,
        "decision": "APPROVED",
        "approval_source": "manual",
        "reviewer": reviewer,
        "note": note,
        "approved_at": created_at,
    }


def ai_status_payload() -> dict:
    settings = ai_pipeline.config()
    return {
        "configured": settings["enabled"],
        "provider": settings["provider"],
        "model": settings["model"],
        "api_base": settings["api_base"],
        "protocol": settings["protocol"],
        "api_host": settings["api_host"],
        "source": settings.get("source", "environment"),
        "key_present": settings["enabled"],
        **AI_RUNTIME_STATE,
    }


def configure_ai(body: dict) -> dict:
    api_key = str(body.get("api_key") or "").strip()
    current = ai_pipeline.config()
    result = ai_pipeline.configure_runtime(
        api_key,
        str(body.get("api_base") or current["api_base"]),
        str(body.get("model") or current["model"]),
        str(body.get("provider") or current["provider"]),
        str(body.get("protocol") or "auto"),
    ) if api_key else ai_pipeline.clear_runtime_config()
    AI_RUNTIME_STATE.update({"last_mode": "not_run", "last_error": None, "last_run_at": None})
    return {
        "configured": result["enabled"],
        "provider": result["provider"],
        "model": result["model"],
        "api_base": result["api_base"],
        "protocol": result["protocol"],
        "api_host": result["api_host"],
        "source": result.get("source", "session"),
        "key_present": result["enabled"],
        "mode": "ai" if result["enabled"] else "demo",
    }


def create_schedules(body: dict, replace_pending: bool = False) -> list[dict]:
    run_id = str(body.get("run_id") or "")
    customer_id = str(body.get("customer_id") or "")
    recipient = str(body.get("recipient_external_id") or "").strip()
    schedules = body.get("schedules")
    with sqlite3.connect(DB_PATH) as db:
        approved = db.execute(
            "SELECT 1 FROM runs r LEFT JOIN manual_reviews m ON m.run_id = r.id AND m.customer_id = r.customer_id "
            "WHERE r.id = ? AND r.customer_id = ? AND r.status = 'complete' "
            "AND (r.release_allowed = 1 OR m.decision = 'APPROVED')",
            (run_id, customer_id),
        ).fetchone()
    if not approved:
        raise ValueError("approved_run_required")
    if not recipient:
        raise ValueError("recipient_external_id_required")
    if not isinstance(schedules, list) or not schedules or len(schedules) > 3:
        raise ValueError("invalid_schedules")

    records = []
    for index, item in enumerate(schedules, start=1):
        channel = str(item.get("channel") or "")
        content = str(item.get("content") or "").strip()
        send_at = str(item.get("send_at") or "")
        if channel not in ALLOWED_CHANNELS:
            raise ValueError("invalid_channel")
        if not content or len(content) > 2000:
            raise ValueError("invalid_content")
        try:
            parsed_time = datetime.fromisoformat(send_at)
        except ValueError as exc:
            raise ValueError("invalid_send_at") from exc
        if parsed_time.tzinfo is None:
            parsed_time = parsed_time.replace(tzinfo=CN_TZ)
        if parsed_time < datetime.now(CN_TZ) - timedelta(minutes=1):
            raise ValueError("send_at_in_past")
        for rule_id, pattern, _severity in FORBIDDEN_CLAIMS:
            if pattern.search(content):
                raise ValueError(f"compliance_blocked:{rule_id}")
        if OPERATIONAL_PROMISE.search(content):
            raise ValueError("compliance_blocked:C016")
        if not re.search(r"[？?]", content):
            raise ValueError("compliance_blocked:C020")
        records.append({
            "id": str(uuid.uuid4()),
            "run_id": run_id,
            "customer_id": customer_id,
            "sequence": int(item.get("sequence") or index),
            "channel": channel,
            "recipient_external_id": recipient[:160],
            "send_at": parsed_time.astimezone(CN_TZ).isoformat(timespec="seconds"),
            "content": content,
            "status": "scheduled",
            "attempts": 0,
            "last_error": None,
            "created_at": now_iso(),
            "sent_at": None,
        })
    ordered_times = sorted(datetime.fromisoformat(item["send_at"]) for item in records)
    if any(later - earlier < timedelta(days=7) for earlier, later in zip(ordered_times, ordered_times[1:])):
        raise ValueError("contact_gap_too_short")
    if ordered_times and ordered_times[-1] - ordered_times[0] > timedelta(days=30):
        raise ValueError("contact_window_exceeded")
    with sqlite3.connect(DB_PATH) as db:
        if replace_pending:
            sent_rows = [dict(zip(("send_at", "sequence"), row)) for row in db.execute(
                "SELECT send_at, sequence FROM schedules WHERE run_id = ? AND customer_id = ? AND status = 'sent'",
                (run_id, customer_id),
            ).fetchall()]
            sent_sequences = {item["sequence"] for item in sent_rows}
            if any(item["sequence"] in sent_sequences for item in records):
                raise ValueError("sent_schedule_immutable")
            if len(sent_rows) + len(records) > 3:
                raise ValueError("invalid_schedules")
            combined_times = sorted(
                [datetime.fromisoformat(item["send_at"]) for item in sent_rows]
                + [datetime.fromisoformat(item["send_at"]) for item in records]
            )
            if any(later - earlier < timedelta(days=7) for earlier, later in zip(combined_times, combined_times[1:])):
                raise ValueError("contact_gap_too_short")
            if combined_times and combined_times[-1] - combined_times[0] > timedelta(days=30):
                raise ValueError("contact_window_exceeded")
            db.execute(
                "DELETE FROM schedules WHERE run_id = ? AND customer_id = ? AND status != 'sent'",
                (run_id, customer_id),
            )
        db.executemany(
            "INSERT INTO schedules VALUES (:id, :run_id, :customer_id, :sequence, :channel, :recipient_external_id, :send_at, :content, :status, :attempts, :last_error, :created_at, :sent_at)",
            records,
        )
    return schedule_rows(customer_id, run_id) if replace_pending else records


def deliver_schedule(item: dict) -> None:
    webhook_url = os.environ.get("CRM_SEND_WEBHOOK_URL", "").strip()
    if not webhook_url:
        with sqlite3.connect(DB_PATH) as db:
            db.execute(
                "UPDATE schedules SET status = 'awaiting_connector', last_error = ? WHERE id = ?",
                ("发送通道未配置", item["id"]),
            )
        return
    payload = json.dumps({
        "schedule_id": item["id"],
        "channel": item["channel"],
        "recipient_external_id": item["recipient_external_id"],
        "content": item["content"],
    }, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(webhook_url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            if response.status < 200 or response.status >= 300:
                raise RuntimeError(f"sender_http_{response.status}")
        with sqlite3.connect(DB_PATH) as db:
            db.execute("UPDATE schedules SET status = 'sent', attempts = attempts + 1, last_error = NULL, sent_at = ? WHERE id = ?", (now_iso(), item["id"]))
    except (urllib.error.URLError, RuntimeError, TimeoutError) as exc:
        attempts = int(item["attempts"]) + 1
        status = "failed" if attempts >= 3 else "scheduled"
        with sqlite3.connect(DB_PATH) as db:
            db.execute("UPDATE schedules SET status = ?, attempts = ?, last_error = ? WHERE id = ?", (status, attempts, str(exc)[:240], item["id"]))


def scheduler_loop(stop_event: threading.Event) -> None:
    while not stop_event.wait(5):
        with sqlite3.connect(DB_PATH) as db:
            db.row_factory = sqlite3.Row
            due = [dict(row) for row in db.execute(
                "SELECT * FROM schedules WHERE status IN ('scheduled', 'awaiting_connector') AND send_at <= ? ORDER BY send_at LIMIT 20",
                (now_iso(),),
            ).fetchall()]
        for item in due:
            deliver_schedule(item)


def execute_run(customer_name: str, source: str, raw_text: str, declared_count: int = 0, progress=None) -> dict:
    report = progress or (lambda **_changes: None)
    messages = message_records(raw_text)
    run_id, customer_id = str(uuid.uuid4()), "cus_" + uuid.uuid4().hex[:12]
    report(agent=1, percent=4, completed_agents=[], label=f"Agent 1 正在读取 {len(messages)} 条对话")
    base_profile = agent1(messages)
    execution_mode = "rules"
    fallback_reason = None
    if ai_pipeline.config()["enabled"]:
        current_agent = 1
        try:
            def profile_progress(phase, current, total):
                if phase == "select":
                    percent = 8
                    label = f"Agent 1 本地降噪完成 · 从 {total} 条筛选出 {current} 条有效消息"
                elif phase == "chunk":
                    percent = 8 + int(30 * current / max(total, 1))
                    label = f"Agent 1 并行压缩中 · 已完成 {current}/{total} 个分块"
                else:
                    percent = 40
                    label = "Agent 1 正在合并重复信息与证据"
                report(agent=1, percent=percent, completed_agents=[], label=label)

            profile = ai_pipeline.build_profile(messages, base_profile, profile_progress)
            report(agent=2, percent=46, completed_agents=[1], label="Agent 2 正在制定触达策略")
            current_agent = 2
            strategy = agent2(profile)
            report(agent=3, percent=64, completed_agents=[1, 2], label="Agent 3 正在生成主动询问 SOP")
            current_agent = 3
            base_sales = agent3(profile, strategy)
            sales = ai_pipeline.build_sales(profile, strategy, base_sales)
            report(agent=4, percent=80, completed_agents=[1, 2, 3], label="Agent 4 正在核对事实与业务合规")
            current_agent = 4
            deterministic_review = agent4(profile, strategy, sales)
            review = ai_pipeline.merge_review(
                deterministic_review,
                ai_pipeline.semantic_review(profile, strategy, sales),
            )
            execution_mode = "ai"
        except (ai_pipeline.AIServiceError, KeyError, TypeError, ValueError, TimeoutError, OSError) as exc:
            fallback_reason = str(exc)
            report(agent=current_agent, percent=84, completed_agents=list(range(1, current_agent)), label="AI 调用未完成，正在切换规则模式")
            profile = base_profile
            report(agent=2, percent=87, completed_agents=[1], label="Agent 2 正在用规则模式完成触达策略")
            strategy = agent2(profile)
            report(agent=3, percent=89, completed_agents=[1, 2], label="Agent 3 正在用规则模式生成 SOP")
            sales = agent3(profile, strategy)
            report(agent=4, percent=92, completed_agents=[1, 2, 3], label="Agent 4 正在完成规则审核")
            review = agent4(profile, strategy, sales)
    else:
        profile = base_profile
        report(agent=2, percent=46, completed_agents=[1], label="Agent 2 正在制定触达策略")
        strategy = agent2(profile)
        report(agent=3, percent=64, completed_agents=[1, 2], label="Agent 3 正在生成主动询问 SOP")
        sales = agent3(profile, strategy)
        report(agent=4, percent=80, completed_agents=[1, 2, 3], label="Agent 4 正在核对事实与业务合规")
        review = agent4(profile, strategy, sales)

    runtime = ai_pipeline.runtime_metadata(
        execution_mode,
        chunks=profile.get("conversation_digest", {}).get("compression_stats", {}).get("input_chunk_count", 0) if execution_mode == "ai" else 0,
        selected_messages=profile.get("conversation_digest", {}).get("compression_stats", {}).get("ai_selected_message_count", 0) if execution_mode == "ai" else 0,
        error=fallback_reason,
    )
    AI_RUNTIME_STATE.update({
        "last_mode": execution_mode,
        "last_error": fallback_reason,
        "last_run_at": now_iso(),
    })
    warnings = [f"AI unavailable; rules fallback: {fallback_reason}"] if fallback_reason else []

    a1 = envelope(run_id, customer_id, 1, profile, [], warnings)
    upstream1 = [{"artifact_id": a1["artifact_id"], "artifact_version": 1, "sha256": a1["sha256"]}]
    a2 = envelope(run_id, customer_id, 2, strategy, upstream1, warnings)
    upstream2 = upstream1 + [{"artifact_id": a2["artifact_id"], "artifact_version": 1, "sha256": a2["sha256"]}]
    a3 = envelope(run_id, customer_id, 3, sales, upstream2, warnings)
    upstream3 = upstream2 + [{"artifact_id": a3["artifact_id"], "artifact_version": 1, "sha256": a3["sha256"]}]
    a4 = envelope(run_id, customer_id, 4, review, upstream3, warnings)
    release_allowed = a4["payload"]["release_allowed"]
    report(agent=4, percent=96, completed_agents=[1, 2, 3, 4], label="审核完成，正在写入 CRM 客户档案")
    bundle = {
        "run_id": run_id,
        "customer_id": customer_id,
        "status": "complete",
        "release_allowed": release_allowed,
        "ai_runtime": runtime,
        "artifacts": [a1, a2, a3, a4],
    }
    with sqlite3.connect(DB_PATH) as db:
        db.execute("INSERT INTO customers VALUES (?, ?, ?, ?)", (customer_id, customer_name, source, now_iso()))
        db.execute("INSERT INTO runs VALUES (?, ?, ?, ?, ?, ?, ?)", (run_id, customer_id, "complete", int(release_allowed), declared_count or len(messages), now_iso(), json.dumps(bundle, ensure_ascii=False)))
    return bundle


def update_run_job(job_id: str, **changes) -> None:
    with RUN_JOBS_LOCK:
        job = RUN_JOBS.get(job_id)
        if not job:
            return
        job.update(changes)
        job["updated_at"] = now_iso()


def run_job_worker(job_id: str, customer_name: str, source: str, raw_text: str, declared_count: int) -> None:
    update_run_job(job_id, status="running", label="正在准备对话", percent=1)
    try:
        result = execute_run(
            customer_name,
            source,
            raw_text,
            declared_count,
            progress=lambda **changes: update_run_job(job_id, **changes),
        )
        update_run_job(
            job_id,
            status="complete",
            agent=4,
            percent=100,
            completed_agents=[1, 2, 3, 4],
            label="四个 Agent 已完成",
            result=result,
        )
    except Exception as exc:
        print(f"run job failed: {exc}", file=sys.stderr)
        update_run_job(job_id, status="failed", label="Agent 链路运行失败", error="internal_error")


def start_run_job(customer_name: str, source: str, raw_text: str, declared_count: int) -> str:
    job_id = "job_" + uuid.uuid4().hex
    with RUN_JOBS_LOCK:
        RUN_JOBS[job_id] = {
            "job_id": job_id,
            "status": "queued",
            "agent": 0,
            "percent": 0,
            "completed_agents": [],
            "label": "等待开始",
            "created_at": now_iso(),
            "updated_at": now_iso(),
        }
        if len(RUN_JOBS) > 50:
            oldest = next(iter(RUN_JOBS))
            if oldest != job_id:
                RUN_JOBS.pop(oldest, None)
    worker = threading.Thread(
        target=run_job_worker,
        args=(job_id, customer_name, source, raw_text, declared_count),
        name=f"crm-{job_id[:12]}",
        daemon=True,
    )
    worker.start()
    return job_id


class CRMHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Content-Security-Policy", "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; connect-src 'self'")
        super().end_headers()

    def send_json(self, value: object, status: HTTPStatus = HTTPStatus.OK):
        payload = json.dumps(value, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def read_json(self) -> dict:
        length = int(self.headers.get("Content-Length", "0"))
        if length > 10 * 1024 * 1024:
            raise ValueError("payload_too_large")
        return json.loads(self.rfile.read(length).decode("utf-8")) if length else {}

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            return self.send_json({"ok": True, "service": "qingshan-crm", "time": now_iso(), "sender_connected": bool(os.environ.get("CRM_SEND_WEBHOOK_URL", "").strip())})
        if parsed.path == "/api/ai/status":
            return self.send_json(ai_status_payload())
        if parsed.path == "/api/channels":
            connected = bool(os.environ.get("CRM_SEND_WEBHOOK_URL", "").strip())
            return self.send_json({"connected": connected, "channels": sorted(ALLOWED_CHANNELS), "mode": "webhook" if connected else "not_configured"})
        if parsed.path == "/api/schedules":
            customer_id = parse_qs(parsed.query).get("customer_id", [None])[0]
            run_id = parse_qs(parsed.query).get("run_id", [None])[0]
            return self.send_json({"items": schedule_rows(customer_id, run_id)})
        if parsed.path == "/api/runs":
            with sqlite3.connect(DB_PATH) as db:
                db.row_factory = sqlite3.Row
                rows = db.execute("SELECT id, customer_id, status, release_allowed, message_count, created_at FROM runs ORDER BY created_at DESC LIMIT 50").fetchall()
            return self.send_json({"items": [dict(row) for row in rows]})
        if parsed.path.startswith("/api/run-jobs/"):
            job_id = parsed.path.rsplit("/", 1)[-1]
            with RUN_JOBS_LOCK:
                job = RUN_JOBS.get(job_id)
                snapshot = dict(job) if job else None
            return self.send_json(snapshot) if snapshot else self.send_json({"error": "not_found"}, HTTPStatus.NOT_FOUND)
        if parsed.path.startswith("/api/runs/"):
            run_id = parsed.path.rsplit("/", 1)[-1]
            with sqlite3.connect(DB_PATH) as db:
                row = db.execute("SELECT artifacts_json FROM runs WHERE id = ?", (run_id,)).fetchone()
            return self.send_json(json.loads(row[0])) if row else self.send_json({"error": "not_found"}, HTTPStatus.NOT_FOUND)
        return super().do_GET()

    def do_POST(self):
        if self.path == "/api/ai/config":
            try:
                return self.send_json(configure_ai(self.read_json()))
            except (ValueError, json.JSONDecodeError) as exc:
                return self.send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
        if self.path == "/api/schedules/bulk":
            try:
                records = create_schedules(self.read_json())
                return self.send_json({"items": records, "sender_connected": bool(os.environ.get("CRM_SEND_WEBHOOK_URL", "").strip())}, HTTPStatus.CREATED)
            except (ValueError, json.JSONDecodeError) as exc:
                return self.send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
        manual_review_match = re.fullmatch(r"/api/runs/([^/]+)/manual-approval", self.path)
        if manual_review_match:
            try:
                approval = approve_run_manually(manual_review_match.group(1), self.read_json())
                return self.send_json(approval, HTTPStatus.CREATED)
            except (ValueError, json.JSONDecodeError) as exc:
                return self.send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
        if self.path not in {"/api/runs", "/api/run-jobs"}:
            return self.send_json({"error": "not_found"}, HTTPStatus.NOT_FOUND)
        try:
            body = self.read_json()
            customer_name = str(body.get("customer_name") or "未命名客户")[:120]
            source = str(body.get("source") or "其他")[:40]
            raw_text = str(body.get("messages") or "")
            declared_count = int(body.get("message_count") or 0)
            if not raw_text.strip():
                return self.send_json({"error": "messages_required"}, HTTPStatus.BAD_REQUEST)
            if self.path == "/api/run-jobs":
                job_id = start_run_job(customer_name, source, raw_text, declared_count)
                return self.send_json({"job_id": job_id, "status": "queued"}, HTTPStatus.ACCEPTED)
            return self.send_json(execute_run(customer_name, source, raw_text, declared_count), HTTPStatus.CREATED)
        except (ValueError, json.JSONDecodeError) as exc:
            return self.send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
        except Exception as exc:
            print(f"request failed: {exc}", file=sys.stderr)
            return self.send_json({"error": "internal_error"}, HTTPStatus.INTERNAL_SERVER_ERROR)

    def do_PUT(self):
        if self.path != "/api/schedules/bulk":
            return self.send_json({"error": "not_found"}, HTTPStatus.NOT_FOUND)
        try:
            records = create_schedules(self.read_json(), replace_pending=True)
            return self.send_json({
                "items": records,
                "sender_connected": bool(os.environ.get("CRM_SEND_WEBHOOK_URL", "").strip()),
            })
        except (ValueError, json.JSONDecodeError) as exc:
            return self.send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)

    def log_message(self, fmt, *args):
        print(f"[{now_iso()}] {fmt % args}")


def main() -> None:
    init_db()
    cli_port = int(sys.argv[1]) if len(sys.argv) > 1 else None
    port = int(os.environ.get("PORT") or cli_port or 4173)
    host = os.environ.get("CRM_HOST", "0.0.0.0")
    server = ThreadingHTTPServer((host, port), CRMHandler)
    stop_event = threading.Event()
    scheduler = threading.Thread(target=scheduler_loop, args=(stop_event,), name="crm-scheduler", daemon=True)
    scheduler.start()
    print(f"Qingshan CRM running at http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        stop_event.set()
        server.server_close()


if __name__ == "__main__":
    main()
