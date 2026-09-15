const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const demoMessages = [
  { id: 176, time: '09-06 19:24', speaker: '家长', content: '孩子目前初二，数学最近一次月考是 76 分，其他科目还可以。', evidence: true },
  { id: 181, time: '09-06 19:31', speaker: '顾问', content: '数学里目前哪个模块最吃力？平时错题会回看吗？' },
  { id: 184, time: '09-06 19:34', speaker: '家长', content: '函数这块丢分最多。作业会做完，但错题本经常记了就不看。', evidence: true },
  { id: 203, time: '09-08 12:05', speaker: '家长', content: '之前也报过大班，最大的问题是不知道每周到底学会了什么，所以这次想先看看诊断。', evidence: true },
  { id: 219, time: '09-10 18:42', speaker: '顾问', content: '您对这个学期的目标和投入时间有什么预期？' },
  { id: 224, time: '09-10 18:47', speaker: '家长', content: '希望期末能稳定到 85 分以上，过程最好能看得见，不想只是一直刷题。', evidence: true },
  { id: 227, time: '09-10 18:51', speaker: '家长', content: '整个学期预算不超过两万。周六上午和周日下午方便，一周最多三个小时。', evidence: true },
  { id: 242, time: '09-11 20:10', speaker: '学生', content: '学校最近开始讲一次函数，我看图像和式子互相转换的时候容易弄混。', evidence: true },
  { id: 271, time: '09-12 16:38', speaker: '家长', content: '如果前两周能看到具体诊断和老师反馈，我再决定后面长期怎么上。', evidence: true },
  { id: 298, time: '今天 09:12', speaker: '顾问', content: '收到，我们会根据已经提到的问题，在合适的时间主动向您确认近况。' }
];

const customerProfiles = [
  {id:'lin', family:'林女士家庭', contact:'林女士', phone:'138****1024', channel:'企业微信', student:'林梓轩', grade:'初二', school:'杭州文澜实验学校', city:'杭州', stage:'持续跟进', intent:'中意向', owner:'陈顾问', source:'微信', messages:300, lastContact:'今天 09:12', nextContact:'今天 18:00', current:'数学 76 分，函数模块薄弱', habit:'作业完成，错题复盘不稳定', goal:'期末数学稳定在 85 分以上', deadline:'本学期期末前，约 12 周', budget:'不超过 ¥20,000 / 学期', availability:'周六上午、周日下午；每周最多 3 小时', concern:'曾报班效果不透明，希望先确认问题是否改善', issues:[['函数图像与表达式转换困难','高'],['错题复盘不稳定','中'],['既往服务反馈不透明','中']], latest:'收到，我们会根据已经提到的问题，在合适的时间主动向您确认近况。', sop:'第 7、15、30 天主动询问', review:'PASS · 可发送'},
  {id:'zhou', family:'周先生家庭', contact:'周先生', phone:'186****5731', channel:'电话 / 企业微信', student:'周惟一', grade:'高一', school:'杭州第十四中学', city:'杭州', stage:'需求确认', intent:'高意向', owner:'陈顾问', source:'电话转写', messages:186, lastContact:'昨天 20:42', nextContact:'今天 19:30', current:'物理 63 分，受力分析失分集中', habit:'会列公式，但复杂情境下画图步骤容易遗漏', goal:'先稳定基础题和中档题得分', deadline:'期中考试前，约 7 周', budget:'¥12,000 - ¥16,000', availability:'周二晚、周六晚；每周最多 2.5 小时', concern:'担心额外训练影响学校作业', issues:[['多物体受力分析混乱','高'],['审题后建模步骤遗漏','中'],['校内作业时间冲突','中']], latest:'最近综合题经常卡在第一问，孩子说不知道从哪个物体开始分析。', sop:'第 7 天询问最近一次卡题情形；第 15 天确认时间冲突', review:'PASS · 可发送'},
  {id:'zhao', family:'赵女士家庭', contact:'赵女士', phone:'137****6689', channel:'企业微信', student:'赵可欣', grade:'初三', school:'杭州采荷中学', city:'杭州', stage:'已出策略', intent:'高意向', owner:'李顾问', source:'企业微信', messages:264, lastContact:'今天 08:46', nextContact:'明天 10:00', current:'英语 88 分，阅读速度偏慢', habit:'词汇量尚可，长难句容易反复回读', goal:'中考英语达到 105 分左右', deadline:'中考前，约 9 个月', budget:'不超过 ¥15,000', availability:'周三晚、周日上午；每周 2 小时', concern:'希望联系频率低，不在工作时间电话沟通', issues:[['阅读理解速度偏慢','高'],['长难句结构识别不稳','中'],['工作时间不便接听','中']], latest:'可以微信联系，电话尽量安排在周日白天。', sop:'第 7 天微信询问阅读耗时；第 15 天询问长难句情况', review:'PASS · 可发送'},
  {id:'song', family:'宋先生家庭', contact:'宋先生', phone:'159****2046', channel:'微信', student:'宋嘉禾', grade:'六年级', school:'杭州市学军小学', city:'杭州', stage:'首次咨询', intent:'低意向', owner:'王顾问', source:'微信', messages:72, lastContact:'9 月 12 日 17:20', nextContact:'9 月 15 日 16:00', current:'数学 82 分，计算准确率波动', habit:'完成速度快，但检查步骤较少', goal:'平稳衔接初中，不增加明显学习压力', deadline:'本学年结束前', budget:'待确认', availability:'周六下午；具体时长待确认', concern:'明确不希望高频联系或增加额外作业', issues:[['分数计算易出现符号错误','中'],['完成后缺少检查','中'],['家长担心学习负荷','中']], latest:'我们先了解一下，不急着安排课程，也不要频繁联系。', sop:'第 15 天仅询问计算错误是否仍出现', review:'PASS · 低频触达'},
  {id:'jiang', family:'蒋女士家庭', contact:'蒋女士', phone:'135****8193', channel:'企业微信', student:'蒋思源', grade:'高二', school:'杭州高级中学', city:'杭州', stage:'诊断完成', intent:'中意向', owner:'陈顾问', source:'企业微信', messages:218, lastContact:'9 月 13 日 21:08', nextContact:'9 月 16 日 19:00', current:'化学 71 分，化学平衡与实验推断薄弱', habit:'基础概念能复述，综合题证据链不完整', goal:'阶段考试化学稳定在 80 分以上', deadline:'本学期期中前', budget:'约 ¥18,000 / 学期', availability:'周日下午；每周最多 3 小时', concern:'学校活动多，排期需要至少提前三天确认', issues:[['化学平衡移动判断不稳','高'],['实验现象到结论推断跳步','高'],['临时活动导致时间变化','中']], latest:'周末有竞赛活动，后续时间最好提前确认，不要临时安排。', sop:'第 7 天询问平衡判断问题；第 15 天确认可联系时间', review:'PASS · 可发送'},
  {id:'xu', family:'徐女士家庭', contact:'徐女士', phone:'188****4415', channel:'短信 / 微信', student:'徐子墨', grade:'初一', school:'杭州市公益中学', city:'杭州', stage:'待修订', intent:'中意向', owner:'李顾问', source:'短信', messages:143, lastContact:'今天 09:02', nextContact:'等待人工确认', current:'英语 74 分，词汇记忆保持率偏低', habit:'能完成当天背诵，一周后回忆明显下降', goal:'先改善词汇复现和课内阅读理解', deadline:'下次月考前，约 5 周', budget:'¥6,000 - ¥8,000', availability:'周一、周四晚；每次不超过 60 分钟', concern:'家长对效果敏感，原话中出现绝对化期待', issues:[['词汇一周后遗忘明显','高'],['复习间隔不稳定','中'],['家长期待需要澄清','高']], latest:'如果做了是不是就一定能把成绩提上去？', sop:'暂停自动发送，顾问先人工澄清预期', review:'REVISE_AGENT3 · 暂不可发送'},
  {id:'tang', family:'唐先生家庭', contact:'唐先生', phone:'133****9907', channel:'电话', student:'唐雨桐', grade:'初三', school:'杭州育才中学', city:'杭州', stage:'人工复核', intent:'中意向', owner:'王顾问', source:'电话转写', messages:97, lastContact:'昨天 18:35', nextContact:'9 月 17 日 20:00', current:'语文 91 分，作文素材组织较弱', habit:'阅读积累较多，写作时选材容易散', goal:'作文结构更稳定，语文保持 100 分左右', deadline:'下一次模拟考前', budget:'待确认', availability:'周日晚上；工作日不确定', concern:'家庭成员对是否继续沟通意见不一致', issues:[['作文中心与素材衔接松散','中'],['写作时间分配不稳','中'],['联系授权待确认','高']], latest:'孩子妈妈还没决定，后续先不要自动发消息，我确认后再说。', sop:'停止自动触达，等待家长明确授权', review:'HUMAN_REVIEW · 已暂停'},
  {id:'he', family:'何女士家庭', contact:'何女士', phone:'152****3168', channel:'企业微信', student:'何亦辰', grade:'高三', school:'杭州第二中学', city:'杭州', stage:'持续跟进', intent:'高意向', owner:'陈顾问', source:'企业微信', messages:326, lastContact:'今天 07:55', nextContact:'9 月 18 日 19:00', current:'物理 68 分，电磁综合题得分不稳定', habit:'基础题速度较快，综合题容易因时间紧张放弃后半问', goal:'优先提高综合题前两问完成率', deadline:'一模前，约 14 周', budget:'不超过 ¥10,000', availability:'周六晚；每周最多 90 分钟', concern:'高三时间非常紧，只接受必要的低频沟通', issues:[['电磁综合题过程拆解困难','高'],['考试时间分配失衡','高'],['每周可用时间有限','高']], latest:'时间比较紧，后面只要问关键问题就行，不用额外发材料。', sop:'第 7 天询问最近一次综合题完成情况；其余按回复决定', review:'PASS · 可发送'}
];

function customerTone(value) {
  if (['高意向','PASS · 可发送'].includes(value)) return 'green';
  if (['低意向','待修订','人工复核'].includes(value)) return 'amber';
  return '';
}

let activeCustomerId = 'lin';
const generatedCustomers = new Set();
const freshRuns = new Set();
const runContexts = new Map();
const generatedBlueprints = new Map();
const reviewResults = new Map();
const importedConversations = new Map();
const seededConversations = new Map();
let agentRunInProgress = false;

function currentCustomer() {
  return customerProfiles.find(item => item.id === activeCustomerId) || customerProfiles[0];
}

function customerApproved(customer) {
  return customer.manualApproved === true || (customer.review.startsWith('PASS') && customer.lastRunApproved !== false);
}

function customerReviewLabel(customer) {
  if (customer.manualApproved) return `人工审核通过 · ${customer.manualReviewer || '顾问'} · 可发送`;
  const labels = {
    PASS:'PASS · 可发送',
    HUMAN_REVIEW:'HUMAN_REVIEW · 需要人工复核',
    REVISE_AGENT1:'REVISE_AGENT1 · 画像证据需修订',
    REVISE_AGENT2:'REVISE_AGENT2 · 触达策略需修订',
    REVISE_AGENT3:'REVISE_AGENT3 · SOP 内容需修订',
    REVISE_BOTH:'REVISE_BOTH · 策略与 SOP 需修订'
  };
  return labels[customer.lastReviewDecision] || customer.review;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
}

function reviewReasonsMarkup(customer) {
  const findings = reviewResults.get(customer.id)?.findings || [];
  const fallbackReasons = {
    xu:'家长提出了绝对化效果期待，需要顾问先澄清合理预期。',
    tang:'家长明确要求确认前不要自动联系，需要先取得继续沟通授权。'
  };
  const reasonByDimension = {
    absolute_claim:'对外消息包含绝对化效果承诺或禁止宣传用语。',
    operational_burden:'消息承诺了记录、报告、总结或阶段反馈等额外交付。',
    unsupported_fact:'画像或 SOP 中存在未绑定原始对话证据的事实。',
    unsupported_issue_strategy:'触达策略引用了 Agent 1 未识别的问题。',
    outreach_frequency:'触达次数或间隔不符合 30 天低频联系规则。',
    missing_stop_condition:'策略缺少家长要求停止时立即暂停的条件。',
    strategy_execution:'Agent 3 的 SOP 没有完整执行 Agent 2 的触达策略。',
    not_inquiry_only:'消息不是纯询问，包含了方案、建议或新的阶段结论。',
    crm_schema:'SOP 使用了 CRM 不支持的字段。'
  };
  const actionLabels = {
    confirm_with_customer:'补充原文证据或由顾问确认', remove:'删除无依据内容', replace:'改写后重新审核',
    replace_with_question:'改成纯询问', reduce_frequency:'减少触达次数', increase_interval:'拉开触达间隔',
    add_stop_condition:'补充停止联系条件', regenerate_from_strategy:'按触达策略重新生成', human_review:'转人工复核',
    remove_unknown_fields:'移除不支持的字段'
  };
  const items = findings.length ? findings : [{rule_id:'人工复核', severity:'medium', owner:'顾问', reason:fallbackReasons[customer.id] || 'Agent 4 要求顾问确认后再发送。', required_action:'human_review'}];
  return `<div class="review-reason-block"><span>未通过原因</span><ul>${items.map(item => {
    const reason = item.reason || reasonByDimension[item.dimension] || '该内容未通过发布级审核。';
    const offending = item.offending_value !== undefined ? ` 触发内容：${JSON.stringify(item.offending_value)}` : '';
    const action = actionLabels[item.required_action] || '人工确认后重新审核';
    return `<li><div><b>${escapeHtml(item.rule_id || '审核项')}</b><strong>${escapeHtml(reason + offending)}</strong></div><small>责任：${escapeHtml(item.owner || '顾问')} · 处理：${escapeHtml(action)}</small></li>`;
  }).join('')}</ul></div>`;
}

function currentRunContext() {
  return runContexts.get(activeCustomerId) || (activeCustomerId === 'lin' ? {runId:'demo-run-v5',customerId:'demo-lin-family'} : null);
}

function currentMessages() {
  const imported = importedConversations.get(activeCustomerId);
  if (imported) return imported.messages;
  const customer = currentCustomer();
  if (!seededConversations.has(customer.id)) {
    seededConversations.set(customer.id, parseImportedConversation(buildRealisticDemoConversation(customer, customer.messages)));
  }
  return seededConversations.get(customer.id);
}

function currentConversationSource() {
  return importedConversations.get(activeCustomerId)?.source || currentCustomer().source;
}

function currentMessageCount() {
  return importedConversations.get(activeCustomerId)?.messages.length || currentCustomer().messages;
}

function sourceIdFromMessageRef(value) {
  const match = String(value || '').match(/(\d+)$/);
  return match ? Number(match[1]) : null;
}

function sourceForIssue(issue, evidenceById) {
  for (const evidenceRef of issue?.evidence_refs || []) {
    const evidence = evidenceById.get(evidenceRef);
    const sourceId = sourceIdFromMessageRef(evidence?.message_id || evidenceRef);
    if (sourceId && currentMessages().some(message => message.id === sourceId)) return sourceId;
  }
  return null;
}

function parseImportedConversation(rawText) {
  const pattern = /^(?:(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})\s+)?([^：:]{1,12})[：:]\s*(.+)$/;
  return rawText.split('\n').map(line => line.trim()).filter(Boolean).map((line, index) => {
    const match = line.match(pattern);
    if (!match) return {id:index + 1, time:'导入记录', speaker:'未知', content:line, imported:true};
    const [, date, clock, speaker, content] = match;
    return {
      id:index + 1,
      time:date && clock ? `${date} ${clock}` : '导入记录',
      speaker:speaker.trim(),
      content:content.trim(),
      imported:true
    };
  });
}

function invalidateCustomerRun(customer) {
  generatedCustomers.delete(customer.id);
  freshRuns.delete(customer.id);
  runContexts.delete(customer.id);
  generatedBlueprints.delete(customer.id);
  reviewResults.delete(customer.id);
  delete customer.lastRunApproved;
  delete customer.lastReviewDecision;
  delete customer.manualApproved;
  delete customer.manualReviewer;
  persistedSchedules = [];
  scheduleBlueprints = [];
  sopEditMode = false;
}

const agentArtifacts = {
  1: {
    eyebrow: 'AGENT 1 · 理解客户 · v5', title: '对话压缩与客户画像', subtitle: '300 条消息压缩为 18 个可追溯事实，识别出 3 个待跟踪问题',
    html: `
      <section class="artifact-section"><h3>压缩摘要</h3><div class="artifact-section-body"><div class="artifact-row"><label>一句话总结</label><p>初二学生数学函数模块薄弱；家庭重视过程透明，倾向先用短期诊断验证服务，预算和时间边界明确。</p><code>digest.summary</code></div><div class="artifact-row"><label>压缩统计</label><p>输入 300 条 · 保留 18 个事实 · 合并 42 个重复项 · 标记 2 个待确认项</p><code>stats</code></div></div></section>
      <section class="artifact-section"><h3>关键事实与证据</h3><div class="artifact-section-body"><div class="artifact-row"><label>当前水平</label><p>最近一次月考数学 76 分，函数模块丢分最多。</p><button class="source-link" data-source="184">ev_184</button></div><div class="artifact-row"><label>目标</label><p>期末数学希望稳定在 85 分以上，这是客户表达的目标，不作为效果承诺。</p><button class="source-link" data-source="224">ev_224</button></div><div class="artifact-row"><label>预算硬约束</label><p>学期总预算不超过 ¥20,000。</p><button class="source-link" data-source="227">ev_227</button></div><div class="artifact-row"><label>时间硬约束</label><p>周六上午、周日下午可用；每周最多 180 分钟。</p><button class="source-link" data-source="227">ev_227</button></div></div></section>
      <section class="artifact-section"><h3>孩子问题清单</h3><div class="artifact-section-body"><div class="artifact-row"><label>issue_function</label><p>函数图像与表达式转换困难 · 高优先级 · 跟踪互转正确率</p><button class="source-link" data-source="242">ev_242</button></div><div class="artifact-row"><label>issue_review</label><p>错题复盘不稳定 · 中优先级 · 跟踪二次复盘完成率</p><button class="source-link" data-source="184">ev_184</button></div><div class="artifact-row"><label>issue_feedback</label><p>既往服务反馈不透明 · 家长顾虑 · 跟踪每周反馈可见性</p><button class="source-link" data-source="203">ev_203</button></div></div></section>
      <section class="artifact-section"><h3>知识库匹配</h3><div class="artifact-section-body"><div class="artifact-row"><label>案例 KS-1042</label><p>同年级、相似函数薄弱点；只参考问题分类和低频回访节奏，不迁移历史结果。</p><code>82% 匹配</code></div><div class="artifact-row"><label>案例 KS-0871</label><p>相似的家长顾虑；只参考确认问题是否仍存在的提问方式。</p><code>76% 匹配</code></div><div class="artifact-row"><label>待确认</label><p>最近一次区统考排名；校内教材版本。</p><code>2 items</code></div></div></section>`
  },
  2: {
    eyebrow: 'AGENT 2 · 触达决策 · v5', title: '问题跟踪与触达策略', subtitle: '决定是否联系、何时联系、问谁，以及何时停止，不生成课程或服务方案',
    html: `
      <section class="artifact-section"><h3>3 个触达决策</h3><div class="artifact-section-body"><div class="sop-step"><span>01</span><div><h4>函数转换困难 · 高优先级</h4><p>第 7 天询问家长：问题是否仍存在，最近一次是什么情形。</p></div><time>D+7</time></div><div class="sop-step"><span>02</span><div><h4>错题复盘不稳定 · 中优先级</h4><p>第 15 天询问家长：最近是否还会出现，主要困难是什么。</p></div><time>D+15</time></div><div class="sop-step"><span>03</span><div><h4>反馈透明度顾虑 · 中优先级</h4><p>第 30 天询问家长：顾虑是否仍存在，现在最想确认哪一点。</p></div><time>D+30</time></div></div></section>
      <section class="artifact-section"><h3>触达边界</h3><div class="artifact-section-body"><div class="check-list"><div class="check-item"><span>30 天主动联系</span><b>最多 3 次</b></div><div class="check-item"><span>最小联系间隔</span><b>7 天</b></div><div class="check-item"><span>连续未回复</span><b>2 次后暂停</b></div><div class="check-item"><span>家长要求停止</span><b>立即停止</b></div></div></div></section>
      <section class="artifact-section"><h3>人工升级条件</h3><div class="artifact-section-body"><p style="margin:0;font-size:12px;line-height:1.7">家长投诉、提出退费或出现新的严重问题时，不继续自动触达，转交顾问人工处理。</p></div></section>`
  },
  3: {
    eyebrow: 'AGENT 3 · 主动询问 · v5', title: '问题驱动的主动询问 SOP', subtitle: '严格执行 Agent 2 的触达策略，只询问，不承诺新增记录、报告或阶段总结',
    html: `
      <section class="artifact-section"><h3>策略驱动的主动询问序列</h3><div class="artifact-section-body"><div class="sop-step"><span>1</span><div><h4>询问函数问题是否仍存在</h4><p>依据 touch_001 · issue_function_conversion</p></div><time>D+7</time></div><div class="sop-step"><span>2</span><div><h4>半个月询问错题复盘情况</h4><p>依据 touch_002 · issue_error_review</p></div><time>D+15</time></div><div class="sop-step"><span>3</span><div><h4>询问反馈透明度顾虑</h4><p>依据 touch_003 · issue_feedback_visibility</p></div><time>D+30</time></div></div></section>
      <section class="artifact-section"><h3>执行约束</h3><div class="artifact-section-body"><div class="check-list"><div class="check-item"><span>绑定审核版本</span><b>v5 PASS</b></div><div class="check-item"><span>策略引用完整</span><b>3 / 3</b></div><div class="check-item"><span>新增运营交付</span><b>0 项</b></div><div class="check-item"><span>失败重试</span><b>最多 3 次</b></div></div></div></section>`
  },
  4: {
    eyebrow: 'AGENT 4 · 合规闸门 · v5', title: '事实与业务合规报告', subtitle: '11 项发布级检查全部通过；只有 PASS 产物才能写入 CRM 并对外发送',
    html: `
      <section class="artifact-section"><h3>审核结论</h3><div class="artifact-section-body"><div class="artifact-row"><label>最终决策</label><p><span class="approved"><i>✓</i> PASS · 允许发布</span></p><code>release_allowed: true</code></div><div class="artifact-row"><label>审查摘要</label><p>严重 0 · 高风险 0 · 中风险 0 · 提示 0</p><code>policy edu-cn-1.0</code></div><div class="artifact-row"><label>版本绑定</label><p>画像 v5 · 触达策略 v5 · 主动询问 SOP v5；上游哈希一致。</p><code>bundle_8bc7</code></div></div></section>
      <section class="artifact-section"><h3>发布级检查</h3><div class="artifact-section-body"><div class="check-list"><div class="check-item"><span>事实引用完整</span><b>通过</b></div><div class="check-item"><span>问题引用完整</span><b>通过</b></div><div class="check-item"><span>A3 执行 A2 策略</span><b>通过</b></div><div class="check-item"><span>30 天触达频率</span><b>通过</b></div><div class="check-item"><span>停止联系条件</span><b>通过</b></div><div class="check-item"><span>绝对化宣传</span><b>通过</b></div><div class="check-item"><span>额外运营承诺</span><b>0 项</b></div><div class="check-item"><span>消息只包含询问</span><b>通过</b></div><div class="check-item"><span>CRM 字段合法</span><b>通过</b></div><div class="check-item"><span>隐私最小化</span><b>通过</b></div><div class="check-item"><span>任务时间有效</span><b>通过</b></div></div></div></section>`
  }
};

const pageTemplates = {
  customers: `
    <div class="page-wrap"><div class="page-heading"><div><h1>全部客户</h1><p>8 个演示客户 · 档案字段已补全</p></div><button class="primary-btn" data-action="import">＋ 新增客户</button></div>
    <div class="metric-grid"><div class="metric"><span>客户总数</span><b>8</b><small>均已建立画像</small></div><div class="metric"><span>待主动询问</span><b>5</b><small>2 项今天到期</small></div><div class="metric"><span>高意向</span><b>3</b><small>优先低频跟进</small></div><div class="metric"><span>暂停自动触达</span><b>2</b><small>需要修订或人工确认</small></div></div>
    <div class="data-table customer-table"><div class="table-row header"><span>客户</span><span>核心问题</span><span>阶段</span><span>意向度</span><span>负责人</span><span>下次触达</span><span></span></div>
    ${customerProfiles.map(customer=>`<div class="table-row customer-row" role="button" tabindex="0" data-customer-id="${customer.id}"><div class="person-cell"><span class="avatar small">${customer.family[0]}</span><span><strong>${customer.family}</strong><small>${customer.student} · ${customer.grade} · ${customer.messages} 条对话</small></span></div><span class="issue-preview">${customer.issues[0][0]}</span><span class="status-chip ${customerTone(customer.stage)}">${customer.stage}</span><span class="status-chip ${customerTone(customer.intent)}">${customer.intent}</span><span>${customer.owner}</span><span>${customer.nextContact}</span><button class="icon-plain" aria-label="查看${customer.family}详情">›</button></div>`).join('')}</div></div>`,
  inbox: `<div class="page-wrap"><div class="page-heading"><div><h1>对话导入</h1><p>把散落在微信、电话与表格中的咨询记录转成结构化客户资产</p></div><button class="primary-btn" data-action="import">＋ 导入对话</button></div><div class="data-table"><div class="table-row header"><span>导入批次</span><span>来源</span><span>消息数</span><span>处理状态</span><span>创建时间</span><span></span></div><div class="table-row"><strong>林女士家庭 · 历史对话</strong><span>微信</span><span>300 条</span><span class="status-chip green">处理完成</span><span>今天 09:18</span><button class="icon-plain">›</button></div><div class="table-row"><strong>周先生家庭 · 咨询记录</strong><span>电话转写</span><span>86 条</span><span class="status-chip green">处理完成</span><span>昨天 20:42</span><button class="icon-plain">›</button></div><div class="table-row"><strong>待归属记录</strong><span>企业微信</span><span>42 条</span><span class="status-chip amber">需要确认</span><span>昨天 17:05</span><button class="icon-plain">›</button></div></div></div>`,
  agents: `<div class="page-wrap"><div class="page-heading"><div><h1>Agent 中心</h1><p>四个 Agent 按严格契约协作，任何中间产物都可追溯和重跑</p></div><button class="primary-btn" data-action="run">运行当前客户</button></div><div class="data-table">${[1,2,3,4].map(n=>`<div class="table-row"><div class="person-cell"><span class="agent-number">A${n}</span><span><strong>${['理解客户','触达决策','主动询问','合规闸门'][n-1]}</strong><small>${['压缩、问题识别、画像与案例检索','决定是否联系、时间与停止条件','按策略生成定时询问 SOP','事实、频率、停止条件与内容审查'][n-1]}</small></span></div><span class="status-chip green">运行正常</span><span>v5</span><span>18 分钟前</span><span>${['1.8s','1.2s','0.9s','0.6s'][n-1]}</span><button class="icon-plain" data-agent="${n}">›</button></div>`).join('')}</div></div>`,
  compliance: `<div class="page-wrap"><div class="page-heading"><div><h1>合规审核</h1><p>Agent 4 是最终发布闸门，未通过的触达内容不会进入发送队列</p></div></div><div class="metric-grid"><div class="metric"><span>今日审核</span><b>27</b><small>通过 24</small></div><div class="metric"><span>待修订</span><b>2</b><small>均已退回责任 Agent</small></div><div class="metric"><span>人工复核</span><b>1</b><small>涉及联系偏好</small></div><div class="metric"><span>自动通过率</span><b>88.9%</b><small>近 30 日</small></div></div><div class="data-table"><div class="table-row header"><span>客户 / 版本</span><span>结论</span><span>问题数</span><span>责任方</span><span>审核时间</span><span></span></div><div class="table-row"><strong>林女士家庭 · v5</strong><span class="status-chip green">PASS</span><span>0</span><span>—</span><span>今天 09:26</span><button class="icon-plain" data-agent="4">›</button></div><div class="table-row"><strong>徐女士家庭 · v2</strong><span class="status-chip amber">待修订</span><span>1 高风险</span><span>Agent 3</span><span>今天 09:12</span><button class="icon-plain">›</button></div><div class="table-row"><strong>唐先生家庭 · v1</strong><span class="status-chip amber">人工复核</span><span>2 项未知</span><span>合规专员</span><span>昨天 21:03</span><button class="icon-plain">›</button></div></div></div>`,
  knowledge: `<div class="page-wrap"><div class="page-heading"><div><h1>知识库</h1><p>管理 Agent 可检索的服务目录、案例结构与合规政策</p></div><button class="primary-btn">＋ 添加文档</button></div><div class="metric-grid"><div class="metric"><span>相似案例</span><b>1,248</b><small>已去除结果迁移</small></div><div class="metric"><span>服务目录</span><b>36</b><small>12 项在售</small></div><div class="metric"><span>合规规则</span><b>42</b><small>版本 edu-cn-1.0</small></div><div class="metric"><span>索引状态</span><b>100%</b><small>更新于 09:24</small></div></div><div class="data-table"><div class="table-row header"><span>知识集合</span><span>类型</span><span>文档数</span><span>版本</span><span>最近更新</span><span></span></div><div class="table-row"><strong>教育咨询案例库</strong><span>案例</span><span>1,248</span><span>2026.09</span><span>今天 09:24</span><button class="icon-plain">›</button></div><div class="table-row"><strong>课程与服务目录</strong><span>结构化目录</span><span>36</span><span>v18</span><span>昨天 18:00</span><button class="icon-plain">›</button></div><div class="table-row"><strong>中国教育营销合规规则</strong><span>政策</span><span>42</span><span>edu-cn-1.0</span><span>9 月 10 日</span><button class="icon-plain">›</button></div></div></div>`
};

function renderPendingPanel(title, agentNumber) {
  return `<div class="agent-empty"><span class="agent-number">A${agentNumber}</span><h2>${title}尚未生成</h2><p>当前学生还没有运行四 Agent 分析。</p><button class="primary-btn generate-agent-output">运行全部 Agent</button></div>`;
}

function renderPlanPanel() {
  const customer = currentCustomer();
  if (!generatedCustomers.has(customer.id)) return renderPendingPanel('触达策略', 2);
  const approved = customerApproved(customer);
  const days = [7,15,30];
  return `<div class="section-heading"><div><h2>${customer.student} · 问题跟踪与触达策略</h2><p>${customer.issues.length} 个问题 · 30 天最多主动联系 3 次</p></div>${approved ? '<span class="approved"><i>✓</i> 可执行</span>' : '<span class="review-warning">! 待人工复核</span>'}</div>${approved ? '' : `<section class="sop-review-warning"><strong>AI 审核未放行</strong><span>${customerReviewLabel(customer)}。以下策略已保留为草稿，人工确认前不会执行。</span></section>`}<div class="plan-timeline">${customer.issues.slice(0,3).map((issue,index)=>`<div class="phase"><span class="phase-index">${String(index+1).padStart(2,'0')}</span><div><span class="phase-time">第 ${days[index]} 天</span><h3>${issue[0]}</h3><p>询问问题是否仍存在，并请家长描述最近一次情形。</p><small>${issue[1]}优先级 · 联系家长</small></div></div>`).join('')}</div><div class="artifact-section" style="margin-top:14px"><h3>停止与人工升级</h3><div class="artifact-section-body"><p style="margin:0;font-size:12px;line-height:1.7">问题已解决、连续两次未回复或家长要求停止时，自动触达立即暂停；发生投诉、退费或新的严重问题时转人工处理。</p></div></div>`;
}

let scheduleBlueprints = [];

function buildScheduleBlueprints(customer) {
  const days = [7,15,30];
  const messages = currentMessages();
  const source = (messages.find(item=>item.evidence) || messages[0]).id;
  return customer.issues.slice(0,3).map((issue,index)=>({
    title:`询问“${issue[0]}”是否仍存在`, offset:days[index], hour:19,
    trigger:`touch_${String(index+1).padStart(3,'0')} · 问题识别后第 ${days[index]} 天`,
    issues:issue[0], source,
    content:`${customer.contact}您好，之前提到孩子有“${issue[0]}”的情况，最近还会出现吗？如果有，您观察到的主要情形是什么？`
  }));
}

let sopEditMode = false;
let persistedSchedules = [];

function localDateTime(offset, hour) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  date.setHours(hour, 0, 0, 0);
  if (offset === 0 && date <= new Date()) date.setDate(date.getDate() + 1);
  const pad = number => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function renderSopPanel() {
  const customer = currentCustomer();
  if (!generatedCustomers.has(customer.id)) return renderPendingPanel('自动跟进 SOP', 3);
  const approved = customerApproved(customer);
  return `
    <div class="section-heading"><div><h2>${customer.student} · 主动询问 SOP</h2><p>Agent 3 严格执行 Agent 2 的低频触达策略，只负责定时提问</p></div>${approved ? '<span class="approved"><i>✓</i> 可发送</span>' : '<span class="review-warning">! 未通过 AI 审核</span>'}</div>
    ${approved ? '' : `<section class="sop-review-warning"><strong>仅供人工复核</strong><div><span>${customerReviewLabel(customer)}。可以检查原文、修改发送时间和内容、运行发送演示；审核通过前不能写入正式发送队列。</span>${reviewReasonsMarkup(customer)}<div class="manual-review-actions"><button type="button" class="secondary-btn" id="manual-approve">人工审核通过，允许发送</button><small>操作将记录审核人、时间和当前 Agent 运行版本。</small></div></div></section>`}
    <section class="issue-source-band"><div><span class="agent-number">A1</span><strong>识别 ${customer.issues.length} 个持续问题</strong></div><div class="issue-tags">${customer.issues.map(issue=>`<span>${issue[0]} · ${issue[1]}</span>`).join('')}</div><span class="flow-arrow">→ A2 定触达策略 → A3 定时询问</span></section>
    <section class="scheduler-toolbar">
      <div class="channel-health"><span class="status-dot" id="channel-dot"></span><div><strong id="channel-status">正在检查发送通道</strong><small id="channel-help">企业微信、短信或服务号</small></div></div>
      <div class="scheduler-controls"><label>发送渠道<select id="schedule-channel"><option value="wecom">企业微信客户联系</option><option value="sms">短信</option><option value="wechat_service">微信服务号</option></select></label><label>客户外部联系人 ID<input id="recipient-id" value="wm_demo_${customer.id}" placeholder="例如 wm_xxxxxx"></label><button class="secondary-btn" id="open-send-demo">发送演示</button><button class="secondary-btn hidden" id="edit-sop">修改排期</button><button class="primary-btn" id="activate-sop" ${approved ? '' : 'disabled title="需要人工复核通过后才能启用"'}>${approved ? '启用自动跟进' : '审核未通过 · 暂不可启用'}</button></div>
    </section>
    <div class="schedule-list">${scheduleBlueprints.map((item,index)=>`
      <article class="schedule-item" data-sequence="${index+1}">
        <div class="schedule-index"><input type="checkbox" checked aria-label="启用第 ${index+1} 条消息"><span>${String(index+1).padStart(2,'0')}</span></div>
        <div class="schedule-main"><div class="schedule-title"><div><h3>${item.title}</h3><span>触发：${item.trigger}</span></div><b class="schedule-state ${approved ? 'draft' : 'waiting'}">${approved ? '待启用' : '待人工复核'}</b></div>${item.source ? `<button class="issue-reference" data-source="${item.source}">依据 A1：${item.issues} <span>查看原文 ›</span></button>` : `<div class="issue-reference">依据 A1：${item.issues} <span>原文引用待更新</span></div>`}<div class="editable-label"><span>发送内容</span><button type="button" class="reset-message">恢复 AI 原文</button></div><textarea aria-label="${item.title}消息正文">${item.content}</textarea><div class="schedule-meta"><label>发送日期与时间<input class="send-at" type="datetime-local" value="${item.sendAt || localDateTime(item.offset,item.hour)}"></label><span class="char-count">${item.content.length} / 2000 字</span><span>失败自动重试 3 次</span></div></div>
      </article>`).join('')}</div>
    <div class="schedule-note"><strong>发送规则</strong><span>只有绑定 Agent 4 PASS 版本的消息才能进入队列。修改正文后会再次执行违规用语检查；渠道未连接时任务会保留，不会误标为已发送。</span></div>`;
}

function renderTasksPanel() {
  const customer = currentCustomer();
  if (!generatedCustomers.has(customer.id)) return renderPendingPanel('跟进任务', 3);
  if (!customerApproved(customer)) return `<div class="agent-empty blocked"><span class="agent-number">A4</span><h2>没有可执行任务</h2><p>${customerReviewLabel(customer)}。SOP 草稿已保留，但当前学生不会进入自动发送队列。</p></div>`;
  return `<div class="section-heading"><div><h2>${customer.student} · 问题跟进任务</h2><p>Agent 3 已生成 ${scheduleBlueprints.length} 个主动询问节点</p></div></div><section class="artifact-section"><div class="artifact-section-body">${scheduleBlueprints.map((item,index)=>`<div class="sop-step"><span>${index+1}</span><div><h4>${item.title}</h4><p>只询问近期情况与家长观察，不承诺新增交付。</p></div><time>第 ${item.offset} 天 19:00</time></div>`).join('')}</div></section>`;
}

function renderMessages(query = '') {
  const filtered = currentMessages().filter(m => `${m.speaker}${m.content}${m.id}`.toLowerCase().includes(query.toLowerCase()));
  $('#conversation-list').innerHTML = filtered.length ? filtered.map(m => `<div class="message"><span class="message-id">#${m.id}</span><div><span class="message-speaker">${m.speaker}</span><span class="message-time">${m.time}</span></div><span class="message-content">${m.content}</span>${m.evidence ? `<button class="source-link evidence-tag" data-source="${m.id}">已引用</button>` : '<span></span>'}</div>`).join('') : '<div class="empty-state"><div><span>⌕</span><h2>没有匹配的对话</h2><p>换一个关键词试试</p></div></div>';
  bindSourceLinks();
}

function bindSourceLinks(root = document) {
  $$('[data-source]', root).forEach(btn => btn.onclick = () => openSource(Number(btn.dataset.source)));
}

function openSource(id) {
  const messages = currentMessages();
  const message = messages.find(m => m.id === id);
  if (!message) {
    toast('原文定位失败', `没有找到消息 #${id}，请重新运行 Agent 更新证据引用`);
    return;
  }
  $('#source-title').textContent = `消息 #${message.id}`;
  $('#source-quote').textContent = `“${message.content}”`;
  $('#source-meta').textContent = `${message.speaker} · ${message.time} · 微信历史对话 · evidence_id: ev_${message.id}`;
  $('#source-dialog').showModal();
}

function currentAgentArtifact(number) {
  const customer = currentCustomer();
  if (!generatedCustomers.has(customer.id)) return {
    eyebrow:`AGENT ${number} · 尚未运行`, title:'当前没有 Agent 产物', subtitle:`请先为 ${customer.student} 运行全部 Agent`,
    html:`<div class="agent-empty"><span class="agent-number">A${number}</span><h2>尚未生成</h2><p>运行完成后，这里会显示该学生对应的结构化产物。</p></div>`
  };
  const days = [7,15,30];
  if (number === 1) return {eyebrow:'AGENT 1 · 理解客户',title:`${customer.student} · 对话压缩与客户画像`,subtitle:`${currentMessageCount()} 条历史消息，识别 ${customer.issues.length} 个问题`,html:`<section class="artifact-section"><h3>压缩摘要</h3><div class="artifact-section-body"><div class="artifact-row"><label>当前情况</label><p>${customer.current}</p><code>fact</code></div><div class="artifact-row"><label>学习习惯</label><p>${customer.habit}</p><code>fact</code></div><div class="artifact-row"><label>家长顾虑</label><p>${customer.concern}</p><code>signal</code></div></div></section><section class="artifact-section"><h3>问题清单</h3><div class="artifact-section-body">${customer.issues.map((issue,index)=>`<div class="artifact-row"><label>issue_${index+1}</label><p>${issue[0]}</p><code>${issue[1]}优先级</code></div>`).join('')}</div></section>`};
  if (number === 2) return {eyebrow:'AGENT 2 · 触达决策',title:`${customer.student} · 低频触达策略`,subtitle:'只决定何时询问、询问什么和何时停止',html:`${customerApproved(customer) ? '' : `<section class="sop-review-warning"><strong>待人工复核</strong><span>${customerReviewLabel(customer)}。策略草稿已保留，但不会自动执行。</span></section>`}<section class="artifact-section"><h3>触达决策</h3><div class="artifact-section-body">${customer.issues.slice(0,3).map((issue,index)=>`<div class="sop-step"><span>${index+1}</span><div><h4>${issue[0]}</h4><p>询问问题是否仍存在，以及家长观察到的最近情形。</p></div><time>D+${days[index]}</time></div>`).join('')}</div></section>`};
  if (number === 3) return {eyebrow:'AGENT 3 · 主动询问',title:`${customer.student} · 定时询问 SOP`,subtitle:customerApproved(customer) ? `${scheduleBlueprints.length} 条可编辑的未来询问` : `${scheduleBlueprints.length} 条待人工复核的 SOP 草稿`,html:`${customerApproved(customer) ? '' : `<section class="sop-review-warning"><strong>未通过 AI 审核</strong><div><span>${customerReviewLabel(customer)}。以下内容仅供人工复核，暂不可发送。</span>${reviewReasonsMarkup(customer)}</div></section>`}<section class="artifact-section"><h3>询问序列</h3><div class="artifact-section-body">${scheduleBlueprints.map((item,index)=>`<div class="sop-step"><span>${index+1}</span><div><h4>${item.title}</h4><p>${item.content}</p></div><time>D+${item.offset}</time></div>`).join('')}</div></section>`};
  return {eyebrow:'AGENT 4 · 合规闸门',title:`${customer.student} · 合规审核`,subtitle:customerApproved(customer) ? '审核通过，可以生成并编辑 SOP' : 'SOP 草稿已保留，未通过前不进入发送队列',html:`${customerApproved(customer) ? '' : `<section class="sop-review-warning"><strong>审核未通过</strong><div>${reviewReasonsMarkup(customer)}</div></section>`}<section class="artifact-section"><h3>审核结论</h3><div class="artifact-section-body"><div class="artifact-row"><label>最终决策</label><p><span class="review-badge ${customerApproved(customer) ? 'pass' : 'hold'}">${customerReviewLabel(customer)}</span></p><code>release_allowed: ${customerApproved(customer)}</code></div><div class="artifact-row"><label>SOP 草稿</label><p>${scheduleBlueprints.length} 条已生成，可供人工检查和修改。</p><code>draft_retained: true</code></div><div class="artifact-row"><label>触达频率</label><p>30 天最多 3 次，最小间隔 7 天。</p><code>checked</code></div><div class="artifact-row"><label>额外承诺</label><p>只允许主动询问，不承诺报告、记录或阶段结果。</p><code>checked</code></div></div></section>`};
}

function openAgent(number) {
  const artifact = currentAgentArtifact(number);
  $('#detail-eyebrow').textContent = artifact.eyebrow;
  $('#detail-title').textContent = artifact.title;
  $('#detail-subtitle').textContent = artifact.subtitle;
  $('#detail-content').innerHTML = artifact.html;
  bindSourceLinks($('#detail-content'));
  $('#detail-dialog').showModal();
}

function toast(title, message = '') {
  const el = $('#toast');
  $('strong', el).textContent = title;
  $('small', el).textContent = message;
  el.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

function showAiRuntime(data = {}) {
  const state = $('#ai-state');
  if (!state) return;
  const runtimeMode = data.mode || data.last_mode;
  if (runtimeMode === 'ai' || runtimeMode === 'openai') {
    $('#ai-mode').textContent = 'AI 四 Agent 已启用';
    const selected = Number(data.agent1_selected_message_count || 0);
    $('#ai-detail').textContent = `${data.provider || 'AI 服务'} · ${data.model || '已配置模型'} · ${selected ? `本地降噪后提交 ${selected} 条消息` : '对话分块压缩'}`;
    state.textContent = 'AI 模式';
    state.className = 'runtime-state ready';
  } else if (data.configured) {
    const fallback = runtimeMode === 'rules' && data.last_error;
    $('#ai-mode').textContent = fallback ? 'AI 请求未完成，已安全回退' : 'AI 服务已配置';
    $('#ai-detail').textContent = fallback ? `当前使用规则模式 · ${data.last_error}` : `${data.provider || 'AI 服务'} · ${data.model} · 等待运行`;
    state.textContent = runtimeMode === 'rules' ? '已回退' : '待运行';
    state.className = 'runtime-state waiting';
  } else {
    $('#ai-mode').textContent = '演示模式';
    $('#ai-detail').textContent = location.protocol.startsWith('http') ? '未配置 API Key，运行时使用本地规则' : '请通过本地服务打开以配置 API';
    state.textContent = '演示';
    state.className = 'runtime-state';
  }
}

function openAiConfig() {
  if (!location.protocol.startsWith('http')) return toast('无法配置 AI', '请通过本地服务地址打开此页面');
  const current = window.aiStatus || {};
  $('#ai-api-base').value = current.api_base || 'https://api.openai.com/v1';
  $('#ai-model').value = current.model || '';
  $('#ai-protocol').value = current.protocol || 'auto';
  $('#ai-provider').value = current.provider && current.provider !== '演示模式' ? current.provider : '';
  $('#ai-api-key').value = '';
  $('#ai-config-current').textContent = current.configured ? `当前已配置：${current.provider || '兼容 AI 服务'} · Key 已隐藏` : '当前未配置 Key，将使用演示模式。';
  $('#ai-config-dialog').showModal();
}

async function saveAiConfig(event) {
  if (event.submitter?.id !== 'save-ai-config') return;
  event.preventDefault();
  const button = $('#save-ai-config');
  const apiKey = $('#ai-api-key').value.trim();
  if (!apiKey) return toast('还没有填写 API Key', '如需体验 AI，请粘贴兼容服务的 Key');
  button.disabled = true;
  button.textContent = '正在连接...';
  try {
    const response = await fetch('/api/ai/config', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({api_key: apiKey, api_base: $('#ai-api-base').value.trim(), model: $('#ai-model').value.trim(), provider: $('#ai-provider').value.trim(), protocol: $('#ai-protocol').value})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'ai_config_failed');
    window.aiStatus = data;
    showAiRuntime(data);
    $('#ai-config-dialog').close();
    toast('AI 已启用', `${data.provider} · ${data.model}，下一次运行将调用兼容 API`);
  } catch (error) {
    const messages = {invalid_api_base:'API Base 必须是有效的 http/https 地址', api_key_too_long:'API Key 长度超过限制', ai_config_too_long:'模型或服务名称过长', invalid_api_protocol:'接口格式不受支持'};
    toast('AI 配置失败', messages[error.message] || '请检查地址、模型名和本地服务状态');
  } finally {
    button.disabled = false;
    button.textContent = '保存并启用 AI';
  }
}

async function clearAiConfig() {
  const button = $('#clear-ai-config');
  button.disabled = true;
  try {
    const response = await fetch('/api/ai/config', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({api_key: ''})});
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'ai_config_failed');
    window.aiStatus = data;
    showAiRuntime(data);
    $('#ai-config-dialog').close();
    toast('已切回演示模式', '不会调用外部 AI，运行仍会生成本地演示结果');
  } catch (_) {
    toast('切换失败', '请检查本地服务状态后重试');
  } finally {
    button.disabled = false;
  }
}

async function loadAiStatus() {
  if (!location.protocol.startsWith('http')) return showAiRuntime({configured:false});
  try {
    const response = await fetch('/api/ai/status');
    if (!response.ok) throw new Error('status_unavailable');
    window.aiStatus = await response.json();
    showAiRuntime(window.aiStatus);
  } catch (_) {
    $('#ai-mode').textContent = 'AI 状态暂不可用';
    $('#ai-detail').textContent = '本地服务未连接';
    $('#ai-state').textContent = '离线';
    $('#ai-state').className = 'runtime-state waiting';
  }
}

function switchView(name) {
  $$('.view').forEach(v => v.classList.remove('active-view'));
  $(`#${name}-view`).classList.add('active-view');
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === name));
  const labels = {workspace:'客户工作台',customers:'全部客户',inbox:'对话导入',agents:'Agent 中心',compliance:'合规审核',knowledge:'知识库'};
  $('.breadcrumb span').textContent = labels[name];
  $('.breadcrumb strong').textContent = name === 'workspace' ? currentCustomer().family : '';
  if (name !== 'workspace') {
    const target = $(`#${name}-view`);
    if (!target.innerHTML) target.innerHTML = pageTemplates[name];
    bindDynamicActions(target);
  }
  $('.sidebar').classList.remove('open');
}

function renderOverviewPanel() {
  const customer = currentCustomer();
  const messageCount = currentMessageCount();
  return `<div class="section-heading"><div><h2>${customer.student} · 客户画像</h2><p>${messageCount} 条历史对话 · 关键信息均来自客户档案</p></div><button class="text-btn" data-open-agent="1">查看 Agent 1 产物 <span>›</span></button></div><div class="profile-grid"><div class="profile-block"><h3><span class="mini-icon blue">人</span> 学生情况</h3><dl><div><dt>学生 / 年级</dt><dd>${customer.student} · ${customer.grade}</dd></div><div><dt>学校</dt><dd>${customer.school}</dd></div><div><dt>当前水平</dt><dd>${customer.current}</dd></div><div><dt>学习习惯</dt><dd>${customer.habit}</dd></div></dl></div><div class="profile-block"><h3><span class="mini-icon green">标</span> 目标与动机</h3><dl><div><dt>核心目标</dt><dd>${customer.goal}</dd></div><div><dt>目标期限</dt><dd>${customer.deadline}</dd></div><div><dt>沟通状态</dt><dd>${customer.stage} · ${customer.intent}</dd></div></dl></div><div class="profile-block"><h3><span class="mini-icon amber">¥</span> 预算与时间</h3><dl><div><dt>预算</dt><dd>${customer.budget}</dd></div><div><dt>可用时间</dt><dd>${customer.availability}</dd></div><div><dt>偏好渠道</dt><dd>${customer.channel}</dd></div></dl></div><div class="profile-block"><h3><span class="mini-icon red">!</span> 顾虑与风险</h3><dl><div><dt>家长顾虑</dt><dd>${customer.concern}</dd></div><div><dt>合规状态</dt><dd>${generatedCustomers.has(customer.id) ? customerReviewLabel(customer) : '待 Agent 4 审核'}</dd></div><div><dt>负责人</dt><dd>${customer.owner}</dd></div></dl></div></div><div class="insight-band"><div class="insight-title"><span>AI</span><div><h3>${generatedCustomers.has(customer.id) ? 'Agent 分析已完成' : '等待运行 Agent'}</h3><p>${generatedCustomers.has(customer.id) ? `已识别 ${customer.issues.length} 个问题，可查看触达策略与 SOP` : '客户基础资料已载入，尚未生成触达策略和 SOP'}</p></div></div><div class="insight-stats"><span><b>${messageCount}</b>历史消息</span><span><b>${customer.issues.length}</b>候选问题</span><span><b>${generatedCustomers.has(customer.id) ? '4/4' : '0/4'}</b>Agent</span></div></div>`;
}

function bindWorkspacePanels() {
  $$('.generate-agent-output').forEach(button => button.onclick = () => runAgents());
  $$('[data-open-agent]').forEach(button => button.onclick = () => openAgent(Number(button.dataset.openAgent)));
  bindSourceLinks();
  if ($('#manual-approve')) $('#manual-approve').onclick = approveCurrentRun;
  if ($('#activate-sop')) {
    $('#activate-sop').onclick = activateSop;
    $('#open-send-demo').onclick = openSendDemo;
    $('#edit-sop').onclick = toggleSopEdit;
    $$('.schedule-item').forEach((row,index) => {
      $('textarea',row).oninput = () => markScheduleEdited(row);
      $('.send-at',row).onchange = () => markScheduleEdited(row);
      $('.reset-message',row).onclick = () => {
        $('textarea',row).value = scheduleBlueprints[index].content;
        $('.send-at',row).value = scheduleBlueprints[index].sendAt || localDateTime(scheduleBlueprints[index].offset,scheduleBlueprints[index].hour);
        markScheduleEdited(row);
      };
    });
  }
}

function renderWorkspacePanels() {
  const customer = currentCustomer();
  scheduleBlueprints = generatedCustomers.has(customer.id) ? (generatedBlueprints.get(customer.id) || buildScheduleBlueprints(customer)) : [];
  $('#tab-overview').innerHTML = renderOverviewPanel();
  $('#tab-plan').innerHTML = renderPlanPanel();
  $('#tab-sop').innerHTML = renderSopPanel();
  $('#tab-tasks').innerHTML = renderTasksPanel();
  const messages = currentMessages();
  $('.tab[data-tab="conversation"] span').textContent = currentMessageCount();
  $('.tab[data-tab="tasks"] span').textContent = customerApproved(customer) ? scheduleBlueprints.length : 0;
  $('.conversation-toolbar p').textContent = `${currentMessageCount()} 条历史消息 · ${currentConversationSource()}导入`;
  renderMessages($('#message-search').value || '');
  bindWorkspacePanels();
}

function updateWorkspaceHeader() {
  const customer = currentCustomer();
  $('.customer-title > .avatar').textContent = customer.family[0];
  $('.customer-title h1').textContent = customer.family;
  $('.stage-pill').textContent = customer.stage;
  $('.risk-pill').textContent = customer.intent;
  $('.customer-title p').textContent = `学生：${customer.student} · ${customer.grade} · ${customer.city} · 负责人：${customer.owner}`;
  $('.breadcrumb strong').textContent = customer.family;
  $('#student-switcher').value = customer.id;
  const generated = generatedCustomers.has(customer.id);
  const approved = generated && customerApproved(customer);
  $('.agent-panel-head p').textContent = generated ? '当前产物 v5' : '尚未运行';
  $('#status-strip .status-dot').className = `status-dot ${generated ? (customerApproved(customer) ? 'ready' : 'waiting') : 'waiting'}`;
  $('#status-strip strong').textContent = generated ? (customerApproved(customer) ? '本次分析已通过合规审核' : '本次分析需要人工复核') : '尚未运行 Agent，当前没有 SOP';
  $('#status-strip .status-main > span:last-child').textContent = generated ? '刚刚生成' : `${currentMessageCount()} 条对话待分析`;
  $('.next-action h3').textContent = generated ? (customerApproved(customer) ? '查看主动询问 SOP' : '复核 SOP 草稿') : '运行 Agent 生成 SOP';
  $('.next-action p').textContent = generated ? (customerApproved(customer) ? `${scheduleBlueprints.length || customer.issues.length} 个询问节点已生成，只收集家长反馈。` : `${scheduleBlueprints.length} 条 SOP 草稿已生成，人工复核通过前不会发送。`) : '完成问题识别、触达决策和合规审核后，才会出现 SOP。';
  $('#open-script').textContent = generated ? (customerApproved(customer) ? '查看并设置排期' : '查看待复核 SOP') : '运行全部 Agent';
  $('#open-script').dataset.mode = generated ? 'sop' : 'run';
  $('#release-status').className = `release-state ${approved ? 'pass' : generated ? 'hold' : 'pending'}`;
  $('#release-status').textContent = approved ? '可发送' : generated ? '未放行' : '待运行';
  $('#audit-trace').textContent = generated ? `${customer.issues.length} / ${customer.issues.length}` : '待检查';
  $('#audit-frequency').textContent = generated ? (approved ? '通过' : '未放行') : '待检查';
  $('#audit-frequency').className = approved ? 'good' : '';
  $('#audit-promise').textContent = generated ? '0 项' : '待检查';
  $('#audit-promise').className = approved ? 'good' : '';
  $('#audit-manual').textContent = generated ? (approved ? '无需' : '需要') : '待检查';
  $$('.agent-step').forEach(step => {
    step.classList.toggle('complete', generated);
    $('.step-status',step).textContent = generated ? '✓' : '—';
    $('.agent-copy em',step).textContent = generated ? (Number(step.dataset.agent) === 1 ? `${customer.issues.length} 个问题已识别` : Number(step.dataset.agent) === 2 ? `${Math.min(3,customer.issues.length)} 个触达策略` : Number(step.dataset.agent) === 3 ? `${scheduleBlueprints.length} 个询问节点` : customerReviewLabel(customer)) : '尚未运行';
  });
}

function selectCustomer(customerId) {
  if (!customerProfiles.some(item => item.id === customerId)) return;
  activeCustomerId = customerId;
  persistedSchedules = [];
  sopEditMode = false;
  renderWorkspacePanels();
  updateWorkspaceHeader();
  switchView('workspace');
  $$('.tab').forEach(tab => tab.classList.toggle('active',tab.dataset.tab === 'overview'));
  $$('.tab-panel').forEach(panel => panel.classList.toggle('active',panel.id === 'tab-overview'));
}

function openCustomerDetail(customerId) {
  const customer = customerProfiles.find(item => item.id === customerId);
  if (!customer) return;
  $('#customer-detail-eyebrow').textContent = `演示客户 · ${customer.source} · ${customer.messages} 条对话`;
  $('#customer-detail-title').textContent = customer.family;
  $('#customer-detail-subtitle').textContent = `${customer.student} · ${customer.grade} · ${customer.school}`;
  $('#customer-detail-content').innerHTML = `
    <section class="customer-detail-hero">
      <span class="avatar large">${customer.family[0]}</span>
      <div><div class="customer-detail-name"><strong>${customer.contact}</strong><span class="status-chip ${customerTone(customer.intent)}">${customer.intent}</span><span class="status-chip ${customerTone(customer.stage)}">${customer.stage}</span></div><p>${customer.city} · ${customer.owner}负责 · 最近联系 ${customer.lastContact}</p></div>
      <span class="review-badge ${customerApproved(customer) ? 'pass' : 'hold'}">${customerReviewLabel(customer)}</span>
    </section>
    <div class="customer-detail-grid">
      <section><h3>联系方式</h3><dl><div><dt>家长</dt><dd>${customer.contact}</dd></div><div><dt>手机</dt><dd>${customer.phone}</dd></div><div><dt>偏好渠道</dt><dd>${customer.channel}</dd></div><div><dt>客户来源</dt><dd>${customer.source}</dd></div></dl></section>
      <section><h3>学生情况</h3><dl><div><dt>学生 / 年级</dt><dd>${customer.student} · ${customer.grade}</dd></div><div><dt>学校</dt><dd>${customer.school}</dd></div><div><dt>当前情况</dt><dd>${customer.current}</dd></div><div><dt>学习习惯</dt><dd>${customer.habit}</dd></div></dl></section>
      <section><h3>目标与约束</h3><dl><div><dt>家长目标</dt><dd>${customer.goal}</dd></div><div><dt>目标时间</dt><dd>${customer.deadline}</dd></div><div><dt>预算</dt><dd>${customer.budget}</dd></div><div><dt>可用时间</dt><dd>${customer.availability}</dd></div></dl></section>
      <section><h3>家长顾虑</h3><p>${customer.concern}</p><h3 class="detail-subheading">最近沟通</h3><blockquote>${customer.latest}</blockquote></section>
    </div>
    <section class="customer-issues"><div class="detail-section-head"><div><h3>Agent 1 问题清单</h3><p>${customer.issues.length} 个有对话依据的问题</p></div><span>${customer.messages} 条历史消息</span></div>${customer.issues.map((issue,index)=>`<div class="customer-issue-row"><span>${String(index+1).padStart(2,'0')}</span><strong>${issue[0]}</strong><b class="severity-${issue[1] === '高' ? 'high' : 'medium'}">${issue[1]}优先级</b></div>`).join('')}</section>
    <section class="customer-followup"><div><span>下一次触达</span><strong>${customer.nextContact}</strong></div><div><span>主动询问 SOP</span><strong>${customer.sop}</strong></div></section>`;
  $('#switch-customer-workspace').dataset.customerId = customer.id;
  $('#customer-detail-dialog').showModal();
}

function filterCustomers(query) {
  const normalized = query.trim().toLowerCase();
  $$('.customer-row').forEach(row => {
    row.hidden = normalized && !row.textContent.toLowerCase().includes(normalized);
  });
}

function openImportDialog() {
  const customer = currentCustomer();
  $('#import-customer').value = customer.family;
  $('#import-source').value = customer.source === '电话转写' ? '电话转写' : customer.source.includes('企业微信') ? '企业微信' : customer.source === '微信' ? '微信' : '其他';
  $('#use-sample').textContent = '载入 300 条模拟对话';
  $('#import-dialog').showModal();
}

function bindDynamicActions(root = document) {
  $$('[data-action="import"]', root).forEach(btn => btn.onclick = openImportDialog);
  $$('[data-action="run"]', root).forEach(btn => btn.onclick = () => { switchView('workspace'); runAgents(); });
  $$('[data-agent]', root).forEach(btn => btn.onclick = () => openAgent(Number(btn.dataset.agent)));
  $$('[data-customer-id]', root).forEach(row => {
    row.onclick = () => openCustomerDetail(row.dataset.customerId);
    row.onkeydown = event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openCustomerDetail(row.dataset.customerId);
      }
    };
  });
}

function renderAgentRunProgress(job = {}) {
  const currentAgent = Number(job.agent || 0);
  const completed = new Set(job.completed_agents || []);
  $$('.agent-step').forEach(step => {
    const agent = Number(step.dataset.agent);
    const isComplete = completed.has(agent);
    const isRunning = job.status === 'running' && currentAgent === agent && !isComplete;
    step.classList.toggle('complete', isComplete);
    step.classList.toggle('running', isRunning);
    $('.step-status', step).textContent = isComplete ? '✓' : isRunning ? '••' : '—';
    $('.agent-copy em', step).textContent = isComplete ? '已完成' : isRunning ? job.label : '等待上游 Agent';
  });
  $$('.connector').forEach((connector, index) => connector.classList.toggle('complete', completed.has(index + 1)));
  $('#run-percent').textContent = `${Number(job.percent || 0)}%`;
  $('#run-bar').style.width = `${Number(job.percent || 0)}%`;
}

async function createAndWaitForRun(payload, signal, onProgress) {
  const startResponse = await fetch('/api/run-jobs', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    signal,
    body:JSON.stringify(payload)
  });
  const startData = await startResponse.json().catch(() => ({}));
  if (!startResponse.ok || !startData.job_id) throw new Error(startData.error || `http_${startResponse.status}`);
  while (true) {
    const response = await fetch(`/api/run-jobs/${encodeURIComponent(startData.job_id)}`, {signal});
    const job = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(job.error || `http_${response.status}`);
    onProgress(job);
    if (job.status === 'complete') return job.result;
    if (job.status === 'failed') throw new Error(job.error || 'run_failed');
    await new Promise(resolve => setTimeout(resolve, 650));
  }
}

async function runAgents(importedCount = 300, rawText = '') {
  if (agentRunInProgress) return toast('Agent 正在运行', '请等待当前链路完成后再重试');
  agentRunInProgress = true;
  const customer = currentCustomer();
  const analysisText = rawText || currentMessages().map(message => `${message.time} ${message.speaker}：${message.content}`).join('\n');
  const actualCount = rawText ? importedCount : currentMessageCount();
  const progress = $('#run-progress');
  const button = $('#run-all');
  const actionButton = $('#open-script');
  const configButton = $('#configure-ai');
  progress.classList.remove('hidden');
  button.disabled = true;
  actionButton.disabled = true;
  configButton.disabled = true;
  $('#student-switcher').disabled = true;
  $('#status-strip .status-dot').className = 'status-dot running';
  $('#status-strip strong').textContent = 'Agent 正在分析，发布内容暂时锁定';
  $('#status-strip .status-main > span:last-child').textContent = `已接收 ${actualCount} 条消息`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);
  const startedAt = Date.now();
  let activeProgressLabel = `正在提交 ${actualCount} 条对话`;
  const elapsedTimer = setInterval(() => {
    const seconds = Math.floor((Date.now() - startedAt) / 1000);
    $('#run-label').textContent = `${activeProgressLabel} · ${seconds} 秒`;
  }, 1000);
  const runPayload = {
      customer_name: rawText ? ($('#import-customer').value || '未命名客户') : customer.family,
      source: rawText ? $('#import-source').value : customer.source,
      messages: analysisText,
      message_count: actualCount
  };
  const backendPromise = location.protocol.startsWith('http') ? createAndWaitForRun(runPayload, controller.signal, job => {
    activeProgressLabel = job.label || 'Agent 正在处理';
    $('#run-label').textContent = activeProgressLabel;
    renderAgentRunProgress(job);
    const agentName = ['准备中','理解客户','触达决策','主动询问','合规闸门'][Number(job.agent || 0)];
    $('#status-strip strong').textContent = job.status === 'complete' ? '四个 Agent 已完成' : `正在运行 Agent ${job.agent || 1} · ${agentName}`;
    $('#status-strip .status-main > span:last-child').textContent = `${Number(job.percent || 0)}%`;
  }) : Promise.resolve(null);
  renderAgentRunProgress({status:'running', agent:1, percent:1, completed_agents:[], label:'正在提交对话'});
  $('#run-label').textContent = activeProgressLabel;
  let backendRun;
  try {
    backendRun = await backendPromise;
  } catch (error) {
    const timedOut = error.name === 'AbortError';
    $('#status-strip .status-dot').className = 'status-dot waiting';
    $('#status-strip strong').textContent = timedOut ? 'AI 响应超时，未生成 SOP' : 'Agent 运行失败，未生成 SOP';
    $('#status-strip .status-main > span:last-child').textContent = timedOut ? '超过 5 分钟，可稍后重试' : '请稍后重试';
    return toast(timedOut ? 'AI 响应超时' : 'Agent 运行失败', timedOut ? '对话记录已保留，请稍后重新运行' : '现有客户信息保留，SOP 没有生成');
  } finally {
    clearTimeout(timeoutId);
    clearInterval(elapsedTimer);
    if (!backendRun) {
      agentRunInProgress = false;
      button.disabled = false;
      actionButton.disabled = false;
      configButton.disabled = false;
      $('#student-switcher').disabled = false;
      progress.classList.add('hidden');
    }
  }
  $('#run-label').textContent = backendRun?.release_allowed ? '审核通过，正在写入客户档案' : '审核完成，正在保存复核结果';
  $('#run-percent').textContent = '100%';
  $('#run-bar').style.width = '100%';
  $$('.agent-step').forEach(s => { s.classList.add('complete'); $('.step-status', s).textContent = '✓'; });
  $$('.connector').forEach(c => c.classList.add('complete'));
  if (backendRun?.ai_runtime) showAiRuntime(backendRun.ai_runtime);
  const reviewPayload = backendRun?.artifacts?.find(item=>item.agent===4)?.payload;
  const releaseAllowed = (backendRun ? backendRun.release_allowed : true) && customer.review.startsWith('PASS');
  customer.lastRunApproved = releaseAllowed;
  customer.lastReviewDecision = reviewPayload?.decision || (releaseAllowed ? 'PASS' : 'HUMAN_REVIEW');
  reviewResults.set(customer.id, reviewPayload || {decision:customer.lastReviewDecision, findings:[]});
  generatedCustomers.add(customer.id);
  freshRuns.add(customer.id);
  if (backendRun) runContexts.set(customer.id,{runId:backendRun.run_id,customerId:backendRun.customer_id});
  const profilePayload = backendRun?.artifacts?.find(item=>item.agent===1)?.payload;
  const salesPayload = backendRun?.artifacts?.find(item=>item.agent===3)?.payload;
  const issues = profilePayload?.issue_registry || [];
  const evidenceById = new Map((profilePayload?.evidence_index || []).map(evidence=>[evidence.evidence_id,evidence]));
  const issueById = new Map(issues.map(issue=>[issue.issue_id,issue]));
  const citedSourceIds = new Set(issues.flatMap(issue => (issue.evidence_refs || [])
    .map(ref => sourceIdFromMessageRef(evidenceById.get(ref)?.message_id || ref))
    .filter(Boolean)));
  currentMessages().forEach(message => { message.evidence = citedSourceIds.has(message.id); });
  const generatedMessages = salesPayload?.scheduled_messages || [];
  if (generatedMessages.length) {
    generatedBlueprints.set(customer.id,generatedMessages.map((item,index)=>{
      const issue = issueById.get(item.source_issue_refs?.[0]);
      return {
        title:item.contact_reason || `主动询问 ${index+1}`, offset:[7,15,30][index], hour:19,
        trigger:item.trigger || `问题识别后第 ${[7,15,30][index]} 天`,
        issues:issue?.title || customer.issues[index]?.[0] || '已识别问题',
        source:sourceForIssue(issue, evidenceById), content:item.content, sendAt:item.send_at?.slice(0,16)
      };
    }));
  }
  renderWorkspacePanels();
  updateWorkspaceHeader();
  agentRunInProgress = false;
  button.disabled = false;
  actionButton.disabled = false;
  configButton.disabled = false;
  $('#student-switcher').disabled = false;
  setTimeout(() => progress.classList.add('hidden'), 1000);
  localStorage.setItem('qingshan-last-run', new Date().toISOString());
  const runtimeLabel = ['ai', 'openai'].includes(backendRun?.ai_runtime?.mode) ? 'AI 模式' : '规则模式';
  toast('Agent 链路运行完成', backendRun ? `${runtimeLabel} · ${releaseAllowed ? '合规审核通过' : '需要人工复核'} · 运行 ${backendRun.run_id.slice(0, 8)} 已保存` : '合规审核通过，v5 已写入 CRM');
}

function initTabs() {
  renderWorkspacePanels();
  $$('.tab').forEach(tab => tab.onclick = () => {
    $$('.tab').forEach(t => t.classList.remove('active'));
    $$('.tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    $(`#tab-${tab.dataset.tab}`).classList.add('active');
    if (tab.dataset.tab === 'conversation') renderMessages();
    if (tab.dataset.tab === 'sop' && generatedCustomers.has(activeCustomerId)) loadChannelStatus();
  });
}

let demoRunToken = 0;

function currentSopMessages() {
  return $$('.schedule-item').filter(row => $('input[type="checkbox"]', row).checked).map(row => ({
    sequence: Number(row.dataset.sequence),
    title: $('.schedule-title h3', row).textContent,
    content: $('textarea', row).value,
    sendAt: $('.send-at', row).value
  }));
}

function markScheduleEdited(row) {
  $('.char-count', row).textContent = `${$('textarea', row).value.length} / 2000 字`;
  row.classList.add('edited');
  const state = $('.schedule-state', row);
  if (!['sent', 'sending'].includes(row.dataset.status)) {
    state.textContent = '已修改 · 未保存';
    state.className = 'schedule-state edited';
  }
}

function setScheduleLocked(row, locked) {
  $('textarea', row).disabled = locked;
  $('.send-at', row).disabled = locked;
  $('input[type="checkbox"]', row).disabled = locked;
  $('.reset-message', row).disabled = locked;
}

async function toggleSopEdit() {
  if (sopEditMode) {
    sopEditMode = false;
    restoreScheduleStates(persistedSchedules);
    return;
  }
  sopEditMode = true;
  $$('.schedule-item').forEach(row => {
    if (row.dataset.status !== 'sent') setScheduleLocked(row, false);
  });
  $('#schedule-channel').disabled = false;
  $('#recipient-id').disabled = false;
  $('#edit-sop').textContent = '取消修改';
  $('#activate-sop').textContent = '保存修改';
  $('#activate-sop').disabled = false;
  toast('已进入修改模式', '可调整未来发送时间、消息内容或取消勾选某条任务');
}

function renderDemo(messages) {
  demoRunToken += 1;
  $('#demo-result').textContent = '待运行';
  $('#demo-result').className = 'status-chip';
  $('#demo-clock').textContent = '等待开始';
  $('#start-demo').disabled = false;
  $('#start-demo').textContent = '开始演示';
  $('#demo-chat-messages').innerHTML = '<div class="chat-day">今天</div><div class="chat-bubble inbound"><p>好的，后面孩子有情况您再问我。</p><time>09:12</time></div>';
  $('#demo-queue-list').innerHTML = messages.map(item => `
    <div class="demo-queue-item" data-demo-sequence="${item.sequence}">
      <span>${String(item.sequence).padStart(2,'0')}</span><div><strong>${item.title}</strong><small>${item.sendAt.replace('T',' ')}</small></div><b>等待</b>
    </div>`).join('');
}

function openSendDemo() {
  const messages = currentSopMessages();
  if (!messages.length) return toast('没有可演示的消息', '请至少勾选一条 SOP 消息');
  const customer = currentCustomer();
  $('.chat-person .avatar').textContent = customer.family[0];
  $('.chat-person strong').textContent = customer.contact;
  renderDemo(messages);
  $('#chat-demo-dialog').showModal();
}

function appendDemoBubble(message) {
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble outbound';
  const content = document.createElement('p');
  content.textContent = message.content;
  const time = document.createElement('time');
  time.textContent = `${message.sendAt.slice(11)} · 已送达`;
  bubble.append(content, time);
  $('#demo-chat-messages').appendChild(bubble);
  bubble.scrollIntoView({behavior:'smooth', block:'end'});
}

async function startSendDemo() {
  const messages = currentSopMessages();
  const token = ++demoRunToken;
  const speed = Number($('#demo-speed').value);
  const simulateFailure = $('#simulate-failure').checked;
  const button = $('#start-demo');
  button.disabled = true;
  button.textContent = '发送中...';
  $('#demo-result').textContent = '运行中';
  $('#demo-result').className = 'status-chip amber';
  for (const message of messages) {
    if (token !== demoRunToken) return;
    const row = $(`[data-demo-sequence="${message.sequence}"]`);
    const status = $('b', row);
    $('#demo-clock').textContent = message.sendAt.replace('T',' ');
    status.textContent = '发送中';
    status.className = 'sending';
    await new Promise(resolve => setTimeout(resolve, speed));
    if (token !== demoRunToken) return;
    if (simulateFailure && message.sequence === 3) {
      status.textContent = '失败 · 重试 1/3';
      status.className = 'failed';
      await new Promise(resolve => setTimeout(resolve, speed));
      if (token !== demoRunToken) return;
      status.textContent = '重试中';
      status.className = 'sending';
      await new Promise(resolve => setTimeout(resolve, Math.max(400, speed/2)));
    }
    appendDemoBubble(message);
    status.textContent = '已送达';
    status.className = 'delivered';
  }
  $('#demo-clock').textContent = '全部发送完成';
  $('#demo-result').textContent = '全部送达';
  $('#demo-result').className = 'status-chip green';
  button.textContent = '再次演示';
  button.disabled = false;
}

async function loadChannelStatus() {
  const label = $('#channel-status');
  if (!label) return;
  if (!location.protocol.startsWith('http')) {
    label.textContent = '需通过本地服务启动';
    $('#channel-help').textContent = '直接打开文件仅支持预览';
    return;
  }
  try {
    const context = currentRunContext();
    const [channelResponse, scheduleData] = await Promise.all([
      fetch('/api/channels'),
      !context || freshRuns.has(activeCustomerId) ? Promise.resolve({items:[]}) : fetch(`/api/schedules?customer_id=${encodeURIComponent(context.customerId)}&run_id=${encodeURIComponent(context.runId)}`).then(response=>response.json())
    ]);
    const data = await channelResponse.json();
    $('#channel-dot').className = `status-dot ${data.connected ? 'ready' : 'waiting'}`;
    label.textContent = data.connected ? '发送通道已连接' : '发送通道未连接';
    $('#channel-help').textContent = data.connected ? '到期后自动投递' : '排期可保存，到期前需连接渠道';
    restoreScheduleStates(scheduleData.items || []);
  } catch (_) {
    label.textContent = '发送服务不可用';
    $('#channel-help').textContent = '请检查本地服务状态';
  }
}

async function approveCurrentRun() {
  const customer = currentCustomer();
  const context = currentRunContext();
  if (!context) return toast('无法人工放行', '请先运行 Agent，人工审核必须绑定具体运行版本');
  if (!window.confirm(`确认已经核对 ${customer.student} 的原始对话、Agent 4 审核原因和全部 SOP 内容，并允许进入发送排期？`)) return;
  const button = $('#manual-approve');
  button.disabled = true;
  button.textContent = '正在记录审核...';
  try {
    const response = await fetch(`/api/runs/${encodeURIComponent(context.runId)}/manual-approval`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        customer_id:context.customerId,
        reviewer:customer.owner,
        acknowledged_findings:true,
        note:'已核对原始对话、Agent 4 审核原因及全部 SOP 内容，同意人工放行。'
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'manual_review_failed');
    customer.manualApproved = true;
    customer.manualReviewer = data.reviewer || customer.owner;
    customer.lastRunApproved = true;
    renderWorkspacePanels();
    updateWorkspaceHeader();
    loadChannelStatus();
    toast('人工审核已通过', `${customer.manualReviewer} 已放行当前版本，现在可以设置并启用发送排期`);
  } catch (error) {
    const messages = {
      manual_review_fields_required:'缺少审核人或客户信息',
      findings_acknowledgement_required:'请确认已经查看全部审核原因',
      run_not_found:'找不到当前 Agent 运行版本，请重新运行',
      run_not_complete:'Agent 尚未运行完成，暂时不能人工放行'
    };
    button.disabled = false;
    button.textContent = '人工审核通过，允许发送';
    toast('人工审核记录失败', messages[error.message] || '请检查本地服务状态后重试');
  }
}

function restoreScheduleStates(items) {
  if (!items.length) return;
  persistedSchedules = items;
  sopEditMode = false;
  const latest = new Map();
  items.forEach(item => latest.set(item.sequence, item));
  const labels = {
    scheduled: ['已排期', 'scheduled'],
    awaiting_connector: ['等待发送通道', 'waiting'],
    sent: ['已发送', 'scheduled'],
    failed: ['发送失败', 'waiting']
  };
  $$('.schedule-item').forEach(row => {
    const item = latest.get(Number(row.dataset.sequence));
    if (!item) {
      row.dataset.status = 'cancelled';
      row.classList.remove('edited');
      $('input[type="checkbox"]', row).checked = false;
      const state = $('.schedule-state', row);
      state.textContent = '已取消';
      state.className = 'schedule-state draft';
      setScheduleLocked(row, true);
      return;
    }
    const state = $('.schedule-state', row);
    const display = labels[item.status] || [item.status, 'draft'];
    state.textContent = display[0];
    state.className = `schedule-state ${display[1]}`;
    row.dataset.status = item.status;
    row.classList.remove('edited');
    $('textarea', row).value = item.content;
    $('.send-at', row).value = item.send_at.slice(0, 16);
    $('.char-count', row).textContent = `${item.content.length} / 2000 字`;
    setScheduleLocked(row, true);
  });
  $('#schedule-channel').value = items[0].channel;
  $('#recipient-id').value = items[0].recipient_external_id;
  $('#schedule-channel').disabled = true;
  $('#recipient-id').disabled = true;
  $('#edit-sop').classList.remove('hidden');
  $('#edit-sop').textContent = '修改排期';
  if (items.some(item => item.status !== 'failed')) {
    $('#activate-sop').textContent = '自动跟进已启用';
    $('#activate-sop').disabled = true;
  }
}

async function activateSop() {
  const context = currentRunContext();
  if (!context) return toast('请先运行 Agent', 'SOP 必须绑定本次审核通过的运行版本');
  const recipient = $('#recipient-id').value.trim();
  if (!recipient) return toast('缺少收件人', '请填写客户外部联系人 ID');
  const selected = $$('.schedule-item').filter(item => $('input[type="checkbox"]', item).checked && item.dataset.status !== 'sent');
  if (!selected.length) return toast('没有启用的消息', '请至少勾选一条跟进消息');
  const schedules = selected.map(item => ({
    sequence: Number(item.dataset.sequence),
    channel: $('#schedule-channel').value,
    send_at: `${$('.send-at', item).value}:00+08:00`,
    content: $('textarea', item).value.trim()
  }));
  if (schedules.some(item => !item.content)) return toast('消息正文不能为空', '请补全后再启用');
  const button = $('#activate-sop');
  const wasEditing = sopEditMode;
  let scheduled = false;
  button.disabled = true;
  button.textContent = '正在写入队列...';
  try {
    const response = await fetch('/api/schedules/bulk', {
      method: sopEditMode ? 'PUT' : 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({run_id:context.runId, customer_id:context.customerId, recipient_external_id:recipient, schedules})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'schedule_failed');
    restoreScheduleStates(data.items);
    freshRuns.delete(activeCustomerId);
    scheduled = true;
    button.textContent = '自动跟进已启用';
    toast(wasEditing ? 'SOP 修改已保存' : '自动跟进已启用', data.sender_connected ? `${data.items.length} 条消息将按设定时间自动发送` : `${data.items.length} 条消息已保存，连接发送通道后自动投递`);
  } catch (error) {
    const messages = {
      send_at_in_past:'发送时间不能早于当前时间',
      approved_run_required:'当前触达策略尚未通过审核',
      invalid_content:'消息正文不符合要求',
      invalid_schedules:'30 天内最多设置 3 条主动询问',
      contact_gap_too_short:'两次主动联系至少间隔 7 天',
      contact_window_exceeded:'这组 SOP 必须落在 30 天触达周期内',
      sent_schedule_immutable:'已经发送的消息不能修改，只能调整后续任务',
      'compliance_blocked:C016':'消息承诺了额外记录、报告或总结，请改成询问',
      'compliance_blocked:C020':'消息必须是纯询问，不能夹带方案、建议或阶段结论'
    };
    toast('排期失败', messages[error.message] || '请检查时间和服务状态');
  } finally {
    if (!scheduled) {
      button.disabled = false;
      button.textContent = '启用自动跟进';
    }
  }
}

function buildRealisticDemoConversation(customer, messageCount = 300) {
  const issueA = customer.issues[0][0];
  const issueB = customer.issues[1]?.[0] || customer.issues[0][0];
  const issueC = customer.issues[2]?.[0] || '学习时间安排';
  const spokenIssues = {
    '函数图像与表达式转换困难':'函数图像和式子来回转换的时候容易弄混',
    '错题复盘不稳定':'错题订正完以后很少再回头看',
    '既往服务反馈不透明':'之前报班以后，不太清楚孩子每周到底学得怎么样',
    '多物体受力分析混乱':'题里物体一多，受力图就容易画乱',
    '审题后建模步骤遗漏':'读完题经常不知道先画图还是先列式子',
    '校内作业时间冲突':'学校作业一多，额外学习时间就排不开',
    '阅读理解速度偏慢':'英语阅读做得比较慢',
    '长难句结构识别不稳':'英语长句子读两遍还是容易绕',
    '工作时间不便接听':'白天上班时不方便接电话',
    '分数计算易出现符号错误':'分数计算时经常把正负号写错',
    '完成后缺少检查':'做完题很少自己检查',
    '家长担心学习负荷':'怕额外练习太多让孩子有压力',
    '化学平衡移动判断不稳':'化学平衡往哪边移动经常判断错',
    '实验现象到结论推断跳步':'实验题从现象往结论推时容易漏步骤',
    '临时活动导致时间变化':'学校活动多，周末时间经常临时变化',
    '词汇一周后遗忘明显':'单词当天会背，过一周就忘得多',
    '复习间隔不稳定':'单词复习有一阵没一阵',
    '家长期待需要澄清':'很担心做了以后成绩还是提不上来',
    '作文中心与素材衔接松散':'写作文时素材很多，但和中心扣得不紧',
    '写作时间分配不稳':'作文前面想太久，后面经常来不及',
    '联系授权待确认':'孩子妈妈还没决定要不要继续聊',
    '电磁综合题过程拆解困难':'电磁综合题不知道怎么一步一步拆',
    '考试时间分配失衡':'考试前面花太久，后面大题来不及',
    '每周可用时间有限':'高三时间很紧，一周只能抽出一点时间'
  };
  const talkA = spokenIssues[issueA] || issueA;
  const talkB = spokenIssues[issueB] || issueB;
  const talkC = spokenIssues[issueC] || issueC;
  const closingMessage = customer.review.startsWith('PASS')
    ? '行，那先这样。后面您隔一阵问一句就可以，我看到会回的。'
    : customer.latest;
  const turns = [
    ['顾问', `${customer.contact}您好，我是${customer.owner}。朋友把您的联系方式推给我了，现在方便文字聊几句吗？`],
    ['家长', '可以的陈老师，我刚忙完，您说。'],
    ['顾问', '好嘞。孩子现在几年级？最近主要是哪一科让您比较操心？'],
    ['家长', `${customer.student}，现在${customer.grade}，在${customer.school}。`],
    ['家长', `最近比较明显的是${customer.current}。`],
    ['顾问', '嗯嗯，最近一次考试卷子还在吗？大概是哪些地方丢分多？'],
    ['家长', '卷子在孩子书包里，我晚上回去找一下。'],
    ['家长', `我印象里主要还是${talkA}，老师讲的时候好像听懂了，换个题又不会。`],
    ['顾问', '明白。您晚上方便的话拍两道他卡住的题给我看看就行。'],
    ['家长', '好的，我回去问问他。'],
    ['学生', '老师好，我妈让我跟您说一下。'],
    ['顾问', `你好呀。你自己觉得${talkA}，是完全没听懂，还是做题的时候不知道第一步怎么下手？`],
    ['学生', '上课基本能跟上，自己做的时候有点乱，特别是题目一长就不知道先看哪。'],
    ['顾问', '那我大概明白了。最近作业里也会这样，还是考试更明显？'],
    ['学生', '考试更明显，平时看答案能懂。'],
    ['家长', '对，他平时回来总说会了，一考试分数又不太理想。'],
    ['顾问', '这种情况家长确实会着急。先别急着给孩子定性，我再多问几个具体情况。'],
    ['家长', '嗯，您问吧。'],
    ['顾问', '平时作业能按时做完吗？错题后面会不会再翻出来看？'],
    ['家长', `${customer.habit}。`],
    ['学生', `我觉得自己${talkB}，有时订正完就放着了。`],
    ['顾问', '你说得挺实在的。那你第二次看到同类题，能马上想起之前错在哪吗？'],
    ['学生', '不一定，有时候觉得眼熟，但还是会再错。'],
    ['家长', '老师，我就是担心他一直这样，越到后面越跟不上。'],
    ['顾问', '能理解。咱们先把最近反复出现的问题弄清楚，一次别铺太多。'],
    ['家长', '对，我也不想一下子给他加很多东西。'],
    ['顾问', '您对这学期大概有什么期待？按您真实想法说就行。'],
    ['家长', `${customer.goal}。`],
    ['顾问', `时间上是希望在${customer.deadline}看到变化，对吧？`],
    ['家长', '对，但也不是说一次两次就必须怎么样，主要想看看方向对不对。'],
    ['顾问', '明白，先看孩子具体卡在哪里，再决定后面怎么安排。'],
    ['家长', '嗯。'],
    ['顾问', '孩子平时哪几个时间段相对空一点？我也怕跟学校作业撞上。'],
    ['家长', `${customer.availability}。`],
    ['顾问', '好，那工作日我就不随便占孩子时间了。临时有变化您提前跟我说一声就行。'],
    ['家长', '可以，学校有时候会临时通知活动。'],
    ['顾问', '没问题，学校的安排优先。'],
    ['家长', '费用我也先问清楚，免得聊到后面超出太多。'],
    ['顾问', '应该的，您能接受的大概范围是多少？'],
    ['家长', `${customer.budget}。`],
    ['顾问', '收到。后面真涉及费用，我会先跟您讲清楚，您确认了再往下走。'],
    ['家长', '好，这样可以。'],
    ['顾问', '除了学习本身，您现在最担心的还有什么？'],
    ['家长', `${customer.concern}。`],
    ['顾问', '明白，这个顾虑很实际。那我后面尽量问得具体一点，不给您发一大段空话。'],
    ['家长', '对，我平时工作也忙，太长的东西确实看不过来。'],
    ['顾问', '那咱们就一次说一个问题，您有空的时候回就行。'],
    ['家长', '好的。'],
    ['顾问', `我确认一下啊：目前最明显的是${talkA}，另外${talkB}也会反复，是这样吗？`],
    ['家长', `对，还有${talkC}，不过这个可以先放后面。`],
    ['顾问', '行，先抓前两个。第三个我先知道有这么回事，不急着动。'],
    ['学生', '这样可以，别一下给我弄太多就行。'],
    ['顾问', '放心，今天只是聊聊情况。你有不会的也可以直接说，不用怕说错。'],
    ['学生', '好。'],
    ['家长', '陈老师，后面不用天天来问，隔段时间问一下就好。'],
    ['顾问', '没问题。我过一阵子问问最近还有没有碰到这些情况，您看到再回。'],
    ['家长', '最好微信，白天电话我经常接不到。'],
    ['顾问', '好，我记住了，优先微信。'],
    ['家长', closingMessage],
    ['顾问', '收到，那今天先聊到这儿，您忙您的。']
  ];

  const periods = ['这两天', '上周', '昨天晚上', '刚过去这个周末'];
  const examples = ['一道综合题', '当天的订正题', '老师发的练习', '周末作业'];
  const blockFactories = [
    (round) => [['家长', `陈老师，${periods[round % periods.length]}孩子做${examples[round % examples.length]}时，又碰到${talkA}这个情况了。`], ['顾问', '大概是做到哪一步停住的？'], ['家长', '开头看了半天，不知道先写什么，后面提醒一下才能继续。'], ['顾问', '他当时自己怎么说？'], ['学生', '题目能看懂一点，就是信息一多会乱。'], ['顾问', '好，我知道了。最近只有这一道，还是碰到两三次了？'], ['家长', round ? '这周大概两次，没有每道都这样。' : '我看到的是两次，可能还有我没注意到的。'], ['顾问', '嗯，先按您看到的情况来。']],
    (round) => [['家长', `老师，这周${round ? '周日' : '周六'}的时间可能要改一下，学校临时有事。`], ['顾问', '可以，学校那边大概几点结束？'], ['家长', '现在还没通知准确时间。'], ['顾问', '那先不定死，等学校通知出来您再告诉我。'], ['家长', '好，估计要到周五才知道。'], ['顾问', '没事，不急。'], ['家长', '不好意思，老是变来变去。'], ['顾问', '没关系，这种临时安排很正常。']],
    (round) => [['家长', `我这两天还是有点焦虑，感觉${talkA}这个情况拖了挺久。`], ['顾问', '能理解，尤其是看着孩子同样的地方反复错，家长肯定着急。'], ['家长', '我一着急说话就重，他就更不愿意讲。'], ['顾问', '那这几天先少追着问，让他把最近一次具体卡住的地方说清楚就够了。'], ['家长', '嗯，我也在调整。'], ['学生', '我妈一问分数我就不想说。'], ['顾问', '懂，你可以直接告诉她是哪道题不会，不一定每次都从分数聊起。'], ['学生', round ? '这样我能接受。' : '嗯，那可以。']],
    (round) => [['学生', `老师，我感觉自己${talkB}，${round ? '最近还是偶尔有' : '但没有我妈说得那么严重'}。`], ['顾问', '没事，你按自己的感觉说。最近一次是什么时候？'], ['学生', `就是${periods[(round + 1) % periods.length]}，订正过的题又写错了。`], ['顾问', '第二次错的地方和第一次一样吗？'], ['学生', '不完全一样，但思路还是没想起来。'], ['家长', '他今天愿意自己说已经不错了。'], ['顾问', '对，先把具体情况讲出来就很好。'], ['学生', '我回去再找找那张卷子。']],
    (round) => [['家长', '陈老师，卷子找到了，我拍给您。'], ['家长', '[图片]'], ['顾问', '收到了，我晚一点看。'], ['家长', '第六题和最后一题他做得比较乱。'], ['顾问', '好，我主要看他从哪一步开始断掉。'], ['家长', '分数我前面记错了一点，还是以卷面上的为准。'], ['顾问', '好的，以卷子为准。'], ['家长', round ? '麻烦您了。' : '好，谢谢。']],
    (round) => [['顾问', `${customer.contact}，刚才电话没接到，您在忙吧？`], ['家长', '对，在开会，没注意手机。'], ['顾问', '没事，不是什么急事。'], ['家长', '您微信说就行，我晚上看。'], ['顾问', `就是想问问孩子最近还会不会出现这种情况：${talkA}？`], ['家长', round ? '还有，但比前阵子少一点，我只是凭感觉说的。' : '还有，昨天作业里刚碰到一次。'], ['顾问', '好，知道了，您先忙。'], ['家长', '嗯，晚点有空我再补充。']],
    (round) => [['家长', '这周学校作业特别多，孩子每天都写到挺晚。'], ['顾问', '那这周别再加东西了，先把校内作业完成。'], ['家长', '我也是这么想的，怕他睡得太晚。'], ['学生', '这几天确实有点累。'], ['顾问', '那你先早点休息，有问题先记着，不用今晚解决。'], ['学生', '好。'], ['家长', '下周如果轻松一点我再跟您说。'], ['顾问', round ? '可以，等您消息。' : '行，先以孩子状态为准。']],
    (round) => [['家长', `前面还说到${talkC}，这件事最近还是会影响安排。`], ['顾问', '您觉得现在最麻烦的是哪一点？'], ['家长', '主要是每次都要临时协调，我也不确定下周会不会还是这样。'], ['顾问', '明白，那这周先按实际情况来，不用现在就把后面都定下来。'], ['家长', '好，我就是怕到时候又要改。'], ['顾问', '没关系，有变化再调就行。'], ['家长', '嗯嗯。'], ['顾问', round ? '有新情况随时发我。' : '您确定下来以后跟我说一声就行。']],
    (round) => [['家长', '老师，您以后问近况能不能尽量晚上发？'], ['顾问', '可以，您一般几点以后方便？'], ['家长', round ? '七点半以后都行。' : '七点以后吧，白天基本顾不上。'], ['顾问', '好，那我尽量放在晚上。'], ['家长', '电话还是少打，我经常静音。'], ['顾问', '明白，微信没回也不用着急，我不会连续催。'], ['家长', '这样最好。'], ['顾问', '好的。']],
    (round) => [['家长', '家里人又问到费用，我再跟您确认一下。'], ['顾问', '可以，您问。'], ['家长', `我们目前能接受的还是${customer.budget}。`], ['顾问', '嗯，和您之前说的一样。'], ['家长', '后面如果有别的费用要提前说。'], ['顾问', '一定会先跟您沟通，您没确认不会直接安排。'], ['家长', round ? '好，那我知道了。' : '行，这点比较重要。'], ['顾问', '明白。']],
    (round) => [['学生', `老师，今天做题时又碰到${talkA}的情况，不过后来我自己做出来了。`], ['顾问', '不错。中间是怎么想通的？'], ['学生', '先把题目里的条件圈出来，然后就顺一点。'], ['顾问', '那这次大概花了多久？'], ['学生', round ? '十分钟左右，还是有点慢。' : '没看时间，应该挺久的。'], ['家长', '他今天回来主动说了这件事。'], ['顾问', '愿意主动讲挺好的。先把这次怎么做出来的记住。'], ['学生', '嗯。']],
    (round) => [['家长', `陈老师，之前说的“${talkB}”，这周我没怎么问，不知道还有没有。`], ['顾问', '没关系，不用为了回复我专门去问。孩子自己有提过吗？'], ['家长', '他说有一次，具体哪道题我不清楚。'], ['顾问', '那就先按一次记着，等下次自然碰到再看。'], ['家长', '好，我不想让他觉得一直被盯着。'], ['顾问', '对，正常学习就行。'], ['家长', round ? '那我先不追问了。' : '嗯，他最近情绪也一般。'], ['顾问', '可以，有需要再找我。']],
    (round) => [['家长', '孩子爸爸觉得先等等，我俩意见还没完全一致。'], ['顾问', '没问题，您们先商量，不着急现在决定。'], ['家长', '他主要担心占用学校学习时间。'], ['顾问', `这个担心合理，毕竟孩子目前只有${customer.availability}。`], ['家长', '对，时间确实比较紧。'], ['顾问', '您们先看孩子这段时间的状态，有结果再告诉我。'], ['家长', round ? '好，周末我们聊一下。' : '行，我晚上也问问孩子。'], ['顾问', '好的。']],
    (round) => [['顾问', `最近快到您之前说的目标时间了，孩子${talkA}的情况还有吗？`], ['家长', '还有，不能说没有，但次数好像少了一点。'], ['顾问', '“少一点”是孩子自己感觉，还是您看作业发现的？'], ['家长', round ? '主要是孩子自己说的，我没仔细数。' : '我只看了两次作业，也不敢说很准。'], ['顾问', '明白，那就先当作近况聊聊。'], ['家长', '对，我也不想说得太绝对。'], ['顾问', '嗯，后面再看几次。'], ['家长', '好的。']],
    (round) => [['家长', '老师，最近先不用联系太频繁，我这边事情有点多。'], ['顾问', '好的，那我先不打扰。'], ['家长', '过一两周再问一次就行。'], ['顾问', '可以，到时候我微信问一句。'], ['家长', '如果我没回，可能就是还在忙。'], ['顾问', '明白，我不会一直催。'], ['家长', round ? '谢谢理解。' : '好，那就这样。'], ['顾问', '不客气，您先忙。']]
  ];

  let blockIndex = 0;
  while (turns.length < messageCount) {
    const factory = blockFactories[blockIndex % blockFactories.length];
    turns.push(...factory(Math.floor(blockIndex / blockFactories.length)));
    blockIndex += 1;
  }
  const pad = value => String(value).padStart(2, '0');
  return Array.from({length:messageCount}, (_, index) => {
    const totalDays = Math.max(14, Math.ceil(messageCount / 5));
    const startOffset = 60 - totalDays;
    const day = new Date(Date.UTC(2026, 6, 12 + startOffset + Math.floor(index / 5)));
    const times = ['09:12', '12:36', '18:42', '19:18', '20:26'];
    const [speaker, content] = turns[index];
    return `${day.getUTCFullYear()}-${pad(day.getUTCMonth()+1)}-${pad(day.getUTCDate())} ${times[index % 5]} ${speaker}：${content}`;
  }).join('\n');
}

function initImport() {
  const dialog = $('#import-dialog');
  $('#import-open').onclick = openImportDialog;
  $$('[data-import-mode]').forEach(btn => btn.onclick = () => {
    $$('[data-import-mode]').forEach(b => b.classList.toggle('active', b === btn));
    $('#paste-area').classList.toggle('hidden', btn.dataset.importMode !== 'paste');
    $('#file-area').classList.toggle('hidden', btn.dataset.importMode !== 'file');
  });
  $('#use-sample').onclick = () => {
    const customer = currentCustomer();
    $('#import-text').value = buildRealisticDemoConversation(customer, 300);
    $('#import-customer').value = customer.family;
    $('#import-text').dispatchEvent(new Event('input'));
    $('#use-sample').textContent = '已载入 300 条';
    toast('模拟对话已载入', `完全虚构的 ${customer.student} 测试对话，可直接运行 Agent`);
  };
  $('#import-text').oninput = e => {
    const count = e.target.value.split('\n').filter(line => line.trim()).length;
    $('#line-count').textContent = `${count} 条可识别消息`;
  };
  $('#file-input').onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return toast('文件过大', '请选择 10 MB 以内的文件');
    const text = await file.text();
    $('#import-text').value = text;
    $('#import-text').dispatchEvent(new Event('input'));
    const count = text.split('\n').filter(line => line.trim()).length;
    $('.file-area strong').textContent = file.name;
    $('.file-area small').textContent = `已读取 ${count} 行 · ${(file.size / 1024).toFixed(1)} KB`;
  };
  $('#start-import').onclick = () => {
    const text = $('#import-text').value.trim();
    const file = $('#file-input').files[0];
    if (!text && !file) return toast('还没有对话内容', '请粘贴文本或选择文件');
    const customer = currentCustomer();
    const messages = parseImportedConversation(text);
    if (!messages.length) return toast('没有识别到对话', '请检查每行是否包含说话人和正文');
    const source = $('#import-source').value;
    importedConversations.set(customer.id, {messages, source, importedAt:new Date().toISOString()});
    customer.messages = messages.length;
    customer.source = source;
    customer.lastContact = messages[messages.length - 1].time;
    invalidateCustomerRun(customer);
    dialog.close();
    switchView('workspace');
    renderWorkspacePanels();
    updateWorkspaceHeader();
    $$('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === 'conversation'));
    $$('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === 'tab-conversation'));
    renderMessages();
    toast('对话记录已同步', `${messages.length} 条消息已写入 ${customer.student} 的客户档案`);
    runAgents(messages.length, text);
  };
}

function init() {
  $('#student-switcher').innerHTML = customerProfiles.map(customer=>`<option value="${customer.id}">${customer.student} · ${customer.grade}</option>`).join('');
  $('#student-switcher').onchange = event => selectCustomer(event.target.value);
  initTabs();
  updateWorkspaceHeader();
  initImport();
  loadAiStatus();
  renderMessages();
  bindSourceLinks();
  bindDynamicActions();
  $$('.nav-item').forEach(btn => btn.onclick = () => switchView(btn.dataset.view));
  $$('.agent-step, [data-open-agent]').forEach(btn => btn.onclick = () => openAgent(Number(btn.dataset.agent || btn.dataset.openAgent)));
  $('#run-all').onclick = () => runAgents();
  $('#configure-ai').onclick = openAiConfig;
  $('#ai-config-form').addEventListener('submit', saveAiConfig);
  $('#clear-ai-config').onclick = clearAiConfig;
  $('#open-script').onclick = () => {
    if ($('#open-script').dataset.mode === 'run') return runAgents();
    $$('.tab')[3].click();
    window.scrollTo({top: 130, behavior:'smooth'});
  };
  $('#message-search').oninput = e => renderMessages(e.target.value);
  $('#detail-close').onclick = () => $('#detail-dialog').close();
  $('#source-close').onclick = () => $('#source-dialog').close();
  $('#chat-demo-close').onclick = () => { demoRunToken += 1; $('#chat-demo-dialog').close(); };
  $('#customer-detail-close').onclick = () => $('#customer-detail-dialog').close();
  $('#customer-detail-cancel').onclick = () => $('#customer-detail-dialog').close();
  $('#switch-customer-workspace').onclick = event => {
    const customerId = event.currentTarget.dataset.customerId;
    $('#customer-detail-dialog').close();
    selectCustomer(customerId);
  };
  $('#reset-demo').onclick = () => renderDemo(currentSopMessages());
  $('#start-demo').onclick = startSendDemo;
  $('#chat-demo-dialog').addEventListener('cancel', () => { demoRunToken += 1; });
  $('#mobile-menu').onclick = () => $('.sidebar').classList.toggle('open');
  $('#view-history').onclick = () => toast('当前为最新版本 v5', '上一个通过版本为 v4 · 今天 09:26');
  $('#global-search').onkeydown = e => { if (e.key === 'Enter') { switchView('customers'); filterCustomers(e.target.value); toast('已搜索客户', `关键词：${e.target.value || '全部'}`); } };
  document.addEventListener('click', e => { if (e.target.closest('.main-area') && !e.target.closest('#mobile-menu')) $('.sidebar').classList.remove('open'); });
}

init();
