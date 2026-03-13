// @ts-check

/** @typedef {import('./types').ContentLink} ContentLink */
/** @typedef {import('./types').NoteEntry} NoteEntry */
/** @typedef {import('./types').Profile} Profile */
/** @typedef {import('./types').ProjectEntry} ProjectEntry */
/** @typedef {import('./types').SkillEntry} SkillEntry */
/** @typedef {import('./types').RouteInfo} RouteInfo */
/** @typedef {import('./types').SeoMeta} SeoMeta */
/** @typedef {import('./types').SitemapEntry} SitemapEntry */

export const siteConfig = {
  siteName: '杨金果 | AI Engineer Portfolio',
  shortName: '杨金果作品集',
  locale: 'zh_CN',
  defaultImage: '/og-cover.svg',
  defaultDescription:
    '面向招聘的 AI 工程作品集，聚焦 AI Agent、RAG、模型微调与业务落地。',
};

const homeUpdatedAt = '2026-03-12';

/**
 * @param {string} title
 * @param {string} description
 * @param {string} path
 * @param {'website' | 'article'} type
 * @param {string} [publishedTime]
 * @param {string} [modifiedTime]
 * @returns {SeoMeta}
 */
function createSeoMeta(title, description, path, type, publishedTime, modifiedTime) {
  return {
    title,
    description,
    path,
    type,
    image: siteConfig.defaultImage,
    publishedTime,
    modifiedTime,
  };
}

/** @type {Profile} */
export const profile = {
  name: '杨金果',
  englishName: 'Yang Jinguo',
  role: '大模型应用工程师 / AI Agent Engineer',
  heroBadge: 'HR 30 秒判断匹配度的 AI 工程作品集',
  heroTitle: '把模型能力做成可交付的业务系统',
  heroSummary:
    '银行与医疗场景落地经验，覆盖 Agent 编排、RAG、模型微调与推理部署；强调可量化指标与可持续迭代。',
  availability: '开放 AI Agent / LLM 应用工程岗位机会',
  location: '重庆 / 可远程协作',
  email: 'hsjdu9522@gmail.com',
  phone: '15523408645',
  github: 'https://github.com/yjg-djb',
  resumeUrl: '/resume.pdf',
  targetRoles: [
    'AI Agent Engineer',
    'LLM Application Engineer',
    'Applied AI Engineer',
  ],
  proofPoints: [
    {
      value: '1.2万',
      label: '服务规模',
      detail: '银行内部提效系统覆盖员工',
    },
    {
      value: '60%',
      label: '人力成本下降',
      detail: '流程自动化对话系统',
    },
    {
      value: '+15%',
      label: '制度检索准确率',
      detail: 'GraphRAG + 结构化重建（相对提升）',
    },
  ],
  recruiterNotes: [
    '适配 AI Agent / LLM 应用工程岗位，偏落地与工程交付。',
    '能把数据、模型、流程与系统工程形成闭环，关注稳定性与评估。',
    '指标口径清晰，可提供案例、数据链路与复盘。',
  ],
  summary: [
    '擅长从业务目标拆解数据结构与工程约束，再落地为可交付系统。',
    '具备银行生产场景与医疗训练经验，可同时兼顾模型效果与系统稳定。',
  ],
  featuredEmployers: ['中科聚信科技（北京）有限公司', '科大讯飞股份有限公司'],
  awardHighlights: [
    '国家奖学金 3 次',
    '全国大学生数学建模竞赛国家二等奖（2024）',
    '蓝桥杯程序设计大赛省级二等奖（2024）',
    '“互联网+”大学生创新创业大赛市级银奖（2024）',
  ],
  skillGroups: [
    {
      title: 'Agent 编排',
      items: ['LangGraph / Flowise', 'MCP 工具接入', '多轮对话与任务编排'],
    },
    {
      title: 'RAG 与数据',
      items: ['非结构化文档解析', 'GraphRAG / 向量检索', 'Elasticsearch / Milvus'],
    },
    {
      title: '训练与对齐',
      items: ['数据清洗与构建', 'SFT / RLHF / DPO', '评估与对齐流程'],
    },
    {
      title: '推理与部署',
      items: ['vLLM / SGLang', '量化与性能优化', 'Docker / K8s'],
    },
    {
      title: '前端与桌面',
      items: ['React 18 / Tailwind', 'Electron', 'FastAPI'],
    },
  ],
  quickPrompts: [
    {
      id: 'fit-role',
      label: '岗位匹配',
      prompt: '请用 3-5 条说明候选人最匹配的岗位，并给出证据与量化指标。',
    },
    {
      id: 'project-evidence',
      label: '项目证据',
      prompt: '列出 2-3 个最能证明交付能力的项目，包含角色、结果与指标口径。',
    },
    {
      id: 'delivery-ability',
      label: '可交付能力',
      prompt: '从系统设计、数据链路与评估闭环说明候选人的交付能力。',
    },
    {
      id: 'risk-gap',
      label: '风险与补充',
      prompt: '指出可能的风险点或需要补充的信息，并给出建议追问。',
    },
  ],
  contactLinks: [
    { label: '下载简历 PDF', href: '/resume.pdf' },
    { label: 'GitHub', href: 'https://github.com/yjg-djb', external: true },
    { label: '发送邮件', href: 'mailto:hsjdu9522@gmail.com' },
    { label: '电话联系', href: 'tel:15523408645' },
  ],
  timeline: [
    {
      kind: 'work',
      period: '2025.03 - 2026.02',
      title: '大模型应用工程师',
      organization: '中科聚信科技（北京）有限公司',
      summary:
        '银行内部提效系统落地，覆盖制度问答、流程审批、报表生成与培训陪练。',
      highlights: [
        'GraphRAG + 结构化重建使制度类检索准确率相对提升 15%',
        '表格重构使财报类咨询准确率相对提升 25%',
        '对话自动化系统使人力成本下降 60%',
      ],
    },
    {
      kind: 'work',
      period: '2024.10 - 2025.02',
      title: '大模型研发工程师（实习）',
      organization: '科大讯飞股份有限公司',
      summary:
        '医疗领域增量预训练、SFT 与对齐优化，支撑诊断建议与患者问答。',
      highlights: [
        'DeepSeek-r1-7B 增量预训练，训练效率相对提升 40%',
        'SFT 后诊疗建议准确率提升至 88%',
        'PPO 对齐后人工评估胜率提升 62%',
      ],
    },
    {
      kind: 'education',
      period: '2023.09 - 2025.06',
      title: '物联网工程（专升本）',
      organization: '重庆对外经贸学院',
      summary: '综合排名 9/120（专业前 10%），班长、数模组组长。',
      highlights: [
        '2025 年优秀大学毕业生',
        '全国大学生数学建模竞赛国家二等奖（2024）',
        '蓝桥杯程序设计大赛省级二等奖（2024）',
      ],
    },
    {
      kind: 'education',
      period: '2020.09 - 2023.06',
      title: '大数据技术与应用（专科）',
      organization: '重庆城市职业学院',
      summary: '综合排名 3/259（专业前 1%），学习委员。',
      highlights: [
        '国家奖学金 2 次',
        '全国大学生数学建模竞赛省级一等奖（2022、2023）',
        '高教社杯数学建模竞赛省级一等奖（2022）',
      ],
    },
  ],
  seo: createSeoMeta(
    '杨金果 | AI Engineer Portfolio',
    siteConfig.defaultDescription,
    '/',
    'website',
    undefined,
    homeUpdatedAt,
  ),
};

/** @type {SkillEntry[]} */
export const skills = [
  {
    slug: 'jd-fit-report',
    title: 'JD Fit Skill',
    kicker: 'Live Skill',
    status: 'live',
    version: 'v1.0',
    summary:
      '输入 JD 文本或岗位链接，输出结构化匹配报告，回答“是否匹配、证据在哪、风险是什么、下一轮该追问什么”。',
    goal:
      '把招聘方原本需要 10 分钟人工扫简历和项目的动作压缩成 30-60 秒的预筛判断。',
    proof:
      '这张 Skill 直接接入当前站点内容与岗位链接抓取，并输出固定 schema，能展示能力封装、工具调用与 guardrail 设计。',
    trigger: [
      'HR 粘贴 JD 文本，希望快速判断岗位匹配度',
      '面试官输入岗位链接，希望得到证据驱动的筛选报告',
      '需要把“项目经历”翻译成“岗位胜任力”',
    ],
    inputs: ['岗位链接', 'JD 文本', '模型选择'],
    tools: ['Job URL Fetcher', 'Site Content Retriever', 'Project Evidence Lookup', 'Structured JSON Validator'],
    outputs: [
      'summary',
      'fit_score',
      'score_breakdown',
      'evidence[]',
      'risks[]',
      'follow_up_questions[]',
      'recommended_projects[]',
    ],
    guardrails: [
      '只允许引用站内证据，不确定就写“无法确认”',
      '评分维度固定为 5 项，避免口径漂移',
      '模型若返回非 JSON，会执行一次修复重试',
    ],
    runtimeSteps: [
      { title: 'Input Normalize', detail: '归一化岗位链接与 JD 文本，校验最小输入约束。' },
      { title: 'Job Fetch', detail: '尝试抓取公开职位页正文，并与粘贴文本合并。' },
      { title: 'Evidence Build', detail: '把项目、经历、笔记整理成可引用的候选人证据目录。' },
      { title: 'Skill Reasoning', detail: '基于固定维度生成岗位匹配判断与风险项。' },
      { title: 'Guardrail Check', detail: '校验 JSON 结构、证据来源和项目引用是否合法。' },
    ],
    evals: [
      { label: 'Latency Target', value: '< 60s', detail: '面向 HR 预筛的单次分析目标' },
      { label: 'Output Contract', value: 'JSON', detail: '固定结构，便于二次导出与 trace' },
      { label: 'Evidence Policy', value: '站内限定', detail: '不把未知写成优势' },
    ],
    relatedProjectSlugs: ['bank-ai-operations-platform', 'medical-llm-training'],
    relatedNoteSlugs: ['rag-delivery-playbook', 'agent-delivery-checklist'],
  },
  {
    slug: 'evidence-pack-generator',
    title: 'Evidence Pack Skill',
    kicker: 'Prototype Skill',
    status: 'prototype',
    version: 'v0.3',
    summary:
      '把“为什么适合这个岗位”整理成一页可转发的证据包，面向 HR 和技术面试官做跨角色沟通。',
    goal:
      '把简历、项目和笔记中的零散信息压成一份可复制、可发送、可追问的招聘材料。',
    proof:
      '重点展示如何把 skill 输出设计成“可交付 artifact”，而不是只返回一段聊天文本。',
    trigger: [
      'HR 需要把候选人亮点转发给技术面试官',
      '用户想按“AI Agent / RAG / 训练与部署”维度提取证据',
      '需要生成标准化 Markdown 摘要或邮件正文',
    ],
    inputs: ['岗位方向', '问题类型', '证据维度'],
    tools: ['Site Content Retriever', 'Project Evidence Lookup', 'Markdown Formatter'],
    outputs: ['一页证据摘要', '引用来源', '推荐查看项目', '补充追问建议'],
    guardrails: [
      '每个结论都绑定来源，不允许无来源总结',
      '按角色分层输出：HR 可读 + 技术面试官可追问',
      '输出长度受控，避免“文案堆砌”',
    ],
    runtimeSteps: [
      { title: 'Intent Route', detail: '识别是岗位说明、项目证明还是技术能力证明。' },
      { title: 'Evidence Select', detail: '优先提取最强的 2-3 条案例，而不是罗列全部经历。' },
      { title: 'Artifact Compose', detail: '把内容整理成可复制的 Markdown 摘要。' },
      { title: 'Human Review', detail: '预留人工确认后再外发，避免误转述。' },
    ],
    evals: [
      { label: 'Primary Output', value: 'Markdown', detail: '适合复制到 IM / 邮件 / 面试备注' },
      { label: 'Reading Time', value: '≈ 1 min', detail: '控制在招聘方可快速消费的长度' },
      { label: 'Citation Density', value: 'High', detail: '每段核心结论都带来源' },
    ],
    relatedProjectSlugs: ['bank-ai-operations-platform'],
    relatedNoteSlugs: ['finetune-to-product-bridge'],
  },
  {
    slug: 'gap-analysis',
    title: 'Gap Analysis Skill',
    kicker: 'Prototype Skill',
    status: 'prototype',
    version: 'v0.2',
    summary:
      '显式指出候选人和目标岗位之间的缺口、风险和无法确认项，避免“只会放大优势”的筛选偏差。',
    goal:
      '让网站不只是“介绍我很强”，而是证明我会做真实的 agent guardrail 和负面判断。',
    proof:
      '这是最能体现工程判断的一张 Skill，因为它要求系统承认边界、输出不确定性并生成后续追问。',
    trigger: [
      '岗位要求偏底层推理/训练，而候选人更偏应用落地',
      '招聘方需要知道风险点和补充材料',
      '希望生成结构化追问清单来辅助面试',
    ],
    inputs: ['岗位要求', '关注维度', '已有材料范围'],
    tools: ['Site Content Retriever', 'Risk Pattern Library', 'Question Generator'],
    outputs: ['gap_summary', 'risks[]', 'cannot_confirm[]', 'follow_up_questions[]'],
    guardrails: [
      '无法确认项必须单独列出，不能混入优势描述',
      '风险判断优先基于岗位要求和站内证据交集',
      '输出追问要可执行，避免空泛建议',
    ],
    runtimeSteps: [
      { title: 'Requirement Slice', detail: '把 JD 拆成岗位方向、系统复杂度、交付要求。' },
      { title: 'Coverage Check', detail: '对照站内证据判断哪些点有支撑，哪些点缺失。' },
      { title: 'Risk Surface', detail: '把缺失、模糊和潜在误判点提炼成风险清单。' },
      { title: 'Question Draft', detail: '为 HR 和面试官分别生成下一轮追问。' },
    ],
    evals: [
      { label: 'Hallucination Policy', value: 'Strict', detail: '未知必须显式保留' },
      { label: 'Risk Recall', value: 'High', detail: '优先覆盖真实筛选风险而非修饰表达' },
      { label: 'Interviewer Use', value: 'Strong', detail: '更适合技术一面前的预读' },
    ],
    relatedProjectSlugs: ['medical-llm-training', 'mobile-agent-runtime'],
    relatedNoteSlugs: ['agent-delivery-checklist'],
  },
];

export const featuredSkillSlugs = skills.map((skill) => skill.slug);
export const skillsSeo = createSeoMeta(
  'Skill Lab | 杨金果 AI Agent Skills',
  '公开展示 JD Fit、证据包与缺口分析三类招聘场景 Skill，重点说明输入输出、工具、Guardrails、Trace 与 Eval。',
  '/skills',
  'website',
  undefined,
  homeUpdatedAt,
);

/** @type {ProjectEntry[]} */
export const projects = [
  {
    slug: 'bank-ai-operations-platform',
    title: '银行 AI 提效平台',
    kicker: '生产级业务落地',
    organization: '中科聚信科技（北京）有限公司',
    timeframe: '2025.03 - 2026.02',
    role: '大模型应用工程师',
    teaser: '面向 1.2 万银行员工的内部提效系统，覆盖制度问答、流程审批、报表生成与培训陪练。',
    summary:
      '该项目面向高准确率与稳定性要求的银行内部场景。我负责非结构化知识处理、Agent 编排、MCP 工具接入与模型对齐。',
    impact: [
      '制度类检索准确率相对提升 15%（GraphRAG + 结构化重建）',
      '财报类咨询准确率相对提升 25%（表格结构重构）',
      '自动化对话系统使人力成本下降 60%',
    ],
    metrics: [
      { value: '1.2万', label: '服务规模', detail: '银行内部员工' },
      { value: '15%', label: '制度检索准确率提升', detail: '相对提升' },
      { value: '60%', label: '人力成本下降', detail: '流程自动化' },
    ],
    stack: ['Python', 'LangGraph', 'MCP', 'GraphRAG', 'Qwen3-8B', 'TTS'],
    workflow: [
      { title: '文档结构化', detail: '处理双栏 PDF 与复杂表格，重建段落与表格结构。' },
      { title: '检索增强', detail: '结合向量检索与 GraphRAG，提升条理类知识命中率。' },
      { title: 'Agent 编排', detail: 'LangGraph/Flow 组织对话与工具调用，接入 MCP 数据库工具。' },
      { title: '对齐与评估', detail: '基于真实业务 case 持续迭代 Prompt 与微调数据。' },
    ],
    responsibilities: [
      '负责非结构化知识处理与结构化重建，保障检索与问答的上下文一致性。',
      '设计对话编排逻辑，构建可复用的自动化任务与工具链。',
      '推动从错误 case 归因到 Prompt 优化和模型微调的闭环。',
    ],
    architecture: [
      '先做文档结构化，再进入向量检索与图增强阶段，避免“垃圾进检索”。',
      '高稳定流程采用规则 Pipeline，开放问题采用 LLM + 工具调用组合。',
      '通过 MCP 暴露数据库与业务系统接口，保证可控与可审计。',
    ],
    tradeoffs: [
      '优先保证生产稳定性而非追求全量 Agent 自由规划。',
      '复杂表格先结构化重建，再选择向量化策略。',
    ],
    outcomes: [
      '沉淀银行内部可持续运行的问答与自动化对话系统。',
      '形成从文档处理、检索增强、对话编排到模型对齐的交付链路。',
    ],
    relatedNoteSlugs: ['rag-delivery-playbook', 'agent-delivery-checklist'],
    links: [{ label: '返回首页查看更多案例', href: '/#cases' }],
    seo: createSeoMeta(
      '银行 AI 提效平台 | 杨金果案例',
      '面向 1.2 万银行员工的 AI 提效平台案例，覆盖 GraphRAG、LangGraph、MCP 与模型微调的生产级落地。',
      '/projects/bank-ai-operations-platform',
      'article',
      '2026-03-12',
      '2026-03-12',
    ),
  },
  {
    slug: 'medical-llm-training',
    title: '医疗大模型训练与对齐',
    kicker: '模型训练与效果优化',
    organization: '科大讯飞股份有限公司',
    timeframe: '2024.10 - 2025.02',
    role: '大模型研发工程师（实习）',
    teaser: '围绕 DeepSeek-r1-7B 进行医学领域增量预训练、SFT 与对齐优化。',
    summary:
      '负责数据清洗、训练流程与评估，支撑诊断建议、病历生成与患者问答。',
    impact: [
      '诊疗建议准确率提升至 88%',
      '训练效率相对提升 40%（ZeRO-3 + FlashAttention）',
      'PPO 对齐后人工评估胜率提升 62%',
    ],
    metrics: [
      { value: '20G', label: '中文医学语料', detail: '增量预训练数据规模' },
      { value: '20万', label: '医患对话', detail: 'SFT 数据集规模' },
      { value: '88%', label: '诊疗建议准确率', detail: 'SFT 后核心指标' },
    ],
    stack: ['DeepSeek-r1-7B', 'Deepspeed ZeRO-3', 'FlashAttention', 'SFT', 'RLHF', 'PPO', 'RAG'],
    workflow: [
      { title: '增量预训练', detail: '使用 20G 医学文献持续训练，补充领域知识密度。' },
      { title: 'SFT 训练', detail: '构建多任务 Prompt 模板，提高问答稳定性与一致性。' },
      { title: '对齐优化', detail: '奖励模型 + PPO 提升有用性与安全性。' },
      { title: 'RAG 补强', detail: '补充知识时效性，降低幻觉风险。' },
    ],
    responsibilities: [
      '清洗与构建训练数据，覆盖预训练、SFT 与对齐阶段。',
      '设计多任务训练模板并参与评估体系搭建。',
      '协助对齐与效果评估，关注可用性与安全性。',
    ],
    architecture: [
      '训练分阶段推进：预训练补知识，SFT 定义格式，对齐控制偏好。',
      'RAG 作为知识时效补强而非替代训练流程。',
    ],
    tradeoffs: [
      '对齐阶段同时兼顾有用性与安全性，不追求单一指标。',
    ],
    outcomes: [
      '形成医疗领域训练与对齐的可复用流程。',
      '沉淀数据工程到评估闭环的工程方法。',
    ],
    relatedNoteSlugs: ['finetune-to-product-bridge'],
    links: [{ label: '返回首页查看更多案例', href: '/#cases' }],
    seo: createSeoMeta(
      '医疗大模型训练与对齐 | 杨金果案例',
      'DeepSeek-r1-7B 医疗领域增量预训练、SFT 与 PPO 对齐的实践案例。',
      '/projects/medical-llm-training',
      'article',
      '2026-03-12',
      '2026-03-12',
    ),
  },
  {
    slug: 'mobile-agent-runtime',
    title: '移动端自主智能体运行时',
    kicker: '多模态 Agent 系统',
    organization: '个人项目',
    timeframe: '2024',
    role: '系统设计与核心开发',
    teaser: '基于 Open-AutoGLM 架构的移动端智能体系统，关注推理性能、记忆机制与稳定性治理。',
    summary:
      '重构推理引擎与记忆系统，提升端到端性能与长程任务稳定性。',
    impact: [
      '端到端延迟 8s → 2.5s/step',
      '单卡并发吞吐提升 3x',
      'Token 消耗下降 60%',
    ],
    metrics: [
      { value: '2.5s', label: '单步延迟', detail: '推理引擎重构后' },
      { value: '3x', label: '吞吐提升', detail: '动态 batching' },
      { value: '60%', label: 'Token 节省', detail: '记忆命中复用' },
    ],
    stack: ['Python', 'PyTorch', 'GLM-4V-9B', 'vLLM', 'ADB', 'LangChain', 'ChromaDB', 'Docker'],
    workflow: [
      { title: '推理重构', detail: '迁移至 vLLM 异步架构，引入 PagedAttention。' },
      { title: '批处理调度', detail: '动态 batching 与请求队列提升吞吐。' },
      { title: '记忆系统', detail: 'Trajectory schema + 向量索引支持相似任务复用。' },
      { title: '稳定性治理', detail: '死循环检测与界面停滞识别，提升长程任务完成率。' },
    ],
    responsibilities: [
      '负责推理引擎重构与性能优化。',
      '设计记忆与检索机制，减少重复推理。',
      '构建运行时异常检测与自愈机制。',
    ],
    architecture: [
      '异步推理 + PagedAttention 解决显存碎片与并发性能问题。',
      '记忆层记录轨迹与状态，支持相似任务检索复用。',
    ],
    tradeoffs: [
      '优先系统稳定性与可恢复性，而非单纯堆叠更大模型。',
    ],
    outcomes: [
      '沉淀移动端 Agent 运行时的性能优化与稳定性治理方案。',
    ],
    relatedNoteSlugs: ['agent-delivery-checklist'],
    links: [{ label: '返回首页查看更多案例', href: '/#cases' }],
    seo: createSeoMeta(
      '移动端自主智能体运行时 | 杨金果案例',
      '围绕推理性能、记忆机制与长程任务稳定性的移动端智能体实践。',
      '/projects/mobile-agent-runtime',
      'article',
      '2026-03-12',
      '2026-03-12',
    ),
  },
];

/** @type {NoteEntry[]} */
export const notes = [
  {
    slug: 'rag-delivery-playbook',
    title: 'RAG 真正落地前，我会先解决这 5 个问题',
    summary: '真正决定 RAG 效果上限的，往往不是模型大小，而是知识结构、检索粒度、工具边界和评估方法。',
    publishedAt: '2026-03-11',
    readTime: '5 min',
    tags: ['RAG', 'Knowledge Pipeline', 'Delivery'],
    takeaways: [
      '先修数据结构，再谈检索精度。',
      '不要把数据库查询、规则流程和自由问答混在同一条链路。',
      '评估要用真实错误 case，而不是只看离线召回指标。',
    ],
    sections: [
      {
        title: '1. 先判断知识是不是适合进入向量库',
        paragraphs: [
          '很多 RAG 项目一开始就直接切块、向量化，结果把原本就不适合检索的文档结构原样带进系统。',
          '我更倾向先判断知识本身是制度条文、表格、流程定义，还是数据库事实。不同知识形态需要不同的表示方式。',
        ],
      },
      {
        title: '2. 复杂表格和双栏 PDF 必须先做结构修复',
        paragraphs: [
          '只要文档里有跨列、跨页和表格，错误分块几乎一定会把上下文关系打散。',
        ],
        bullets: [
          '先重建表格行列关系，再决定是否做文本化。',
          '制度条文优先提炼层级结构，而不是按固定字符数切块。',
          '对高价值文档保留原始定位信息，方便回溯。',
        ],
      },
      {
        title: '3. 把“检索不到”与“本来就不该检索”区分开',
        paragraphs: [
          '很多系统把所有用户问题都扔给 RAG，最后既做不好数据库查询，也做不好开放问答。',
          '我的做法是明确区分规则流程、数据库工具查询和知识检索三种能力，再由对话层路由。',
        ],
      },
      {
        title: '4. 评估不能只盯召回率',
        paragraphs: [
          '真正影响业务体验的常常是“答案是否能落地”和“是否能定位到错误来源”。',
        ],
        bullets: [
          '保留真实业务错答 case 做回归评估。',
          '同时看召回质量、答案可用性和解释性。',
          '关注是否能形成 Prompt、流程、微调的闭环。',
        ],
      },
    ],
    relatedProjectSlugs: ['bank-ai-operations-platform'],
    seo: createSeoMeta(
      'RAG 真正落地前，我会先解决这 5 个问题 | 杨金果',
      '从知识结构、复杂文档处理、能力路由与评估方法四个层面总结 RAG 的落地要点。',
      '/notes/rag-delivery-playbook',
      'article',
      '2026-03-11',
      '2026-03-11',
    ),
  },
  {
    slug: 'agent-delivery-checklist',
    title: 'AI Agent 交付里，最容易被忽视的是运行时治理',
    summary: 'Agent 能不能落地，常常取决于运行时是否可观测、可恢复、可限制，而不是链路图画得多漂亮。',
    publishedAt: '2026-03-11',
    readTime: '4 min',
    tags: ['Agent', 'Runtime', 'Systems'],
    takeaways: [
      '流程编排只是开始，真正麻烦的是运行时异常。',
      '长任务里必须有超时、循环检测和失败恢复。',
      '工具边界越清晰，Agent 的行为越可控。',
    ],
    sections: [
      {
        title: '1. 运行时治理比 Prompt 更难',
        paragraphs: [
          '在真实场景里，Agent 最大的问题往往不是一句话没答好，而是进入循环、重复调用工具、状态漂移或等待超时。',
          '如果没有运行时治理，再漂亮的流程图也很容易在生产环境失效。',
        ],
      },
      {
        title: '2. 我最关注三类防线',
        bullets: [
          '任务级防线：步数上限、超时控制、失败重试与降级路径',
          '工具级防线：明确输入输出 schema、权限范围和错误返回',
          '状态级防线：记录上下文、关键变量和上一动作，避免无意义重复',
        ],
      },
      {
        title: '3. 记忆机制不是“存得越多越好”',
        paragraphs: [
          '记忆命中带来效率，但错误记忆也会放大偏差，所以我更偏向“可检索 + 可校验”的记忆方案。',
        ],
      },
      {
        title: '4. 评估要看任务完成率，而不是单轮回答',
        paragraphs: [
          '对 Agent 来说，单轮回答质量只是过程指标，最终要看完整任务是否能在约束内完成。',
        ],
      },
    ],
    relatedProjectSlugs: ['bank-ai-operations-platform', 'mobile-agent-runtime'],
    seo: createSeoMeta(
      'AI Agent 交付里，最容易被忽视的是运行时治理 | 杨金果',
      '从可观测性、恢复机制、工具边界与记忆校验角度总结 AI Agent 的运行时治理思路。',
      '/notes/agent-delivery-checklist',
      'article',
      '2026-03-11',
      '2026-03-11',
    ),
  },
  {
    slug: 'finetune-to-product-bridge',
    title: '模型微调之后，如何判断它真的能进入产品',
    summary: '微调提升一个指标并不等于能上线，真正的判断标准应该包括错误分布、可解释性和场景收益。',
    publishedAt: '2026-03-11',
    readTime: '4 min',
    tags: ['Fine-tuning', 'Evaluation', 'Product'],
    takeaways: [
      '先看错误类型有没有被改掉，再看平均指标。',
      '需要把模型分数翻译成业务收益。',
      'RAG、Prompt 和微调应当协同，而不是互相替代。',
    ],
    sections: [
      {
        title: '1. 指标提升不是终点',
        paragraphs: [
          '很多团队拿到更高的准确率就宣布成功，但产品真正关心的是错误有没有变少、可接受度有没有提升。',
        ],
      },
      {
        title: '2. 我会先拆三类问题',
        bullets: [
          '模型原本就不懂的领域知识问题',
          '格式、风格和任务指令理解问题',
          '需要外部知识或实时数据支持的问题',
        ],
      },
      {
        title: '3. 微调、Prompt 与 RAG 各解决不同问题',
        paragraphs: [
          '微调用来改变模型习惯和领域能力，Prompt 用来约束交互结构，RAG 用来补外部知识和时效性。',
          '如果把三者混为一谈，就很难判断下一步投入应该放在哪里。',
        ],
      },
      {
        title: '4. 进入产品前必须回答的两个问题',
        bullets: [
          '这次提升是否对应真实业务高频错误',
          '上线后是否有持续评估与回滚方案',
        ],
      },
    ],
    relatedProjectSlugs: ['medical-llm-training'],
    seo: createSeoMeta(
      '模型微调之后，如何判断它真的能进入产品 | 杨金果',
      '从错误分布、业务收益与上线评估三个角度总结模型微调如何真正进入产品。',
      '/notes/finetune-to-product-bridge',
      'article',
      '2026-03-11',
      '2026-03-11',
    ),
  },
];

export const featuredProjectSlugs = projects.map((project) => project.slug);
export const featuredNoteSlugs = notes.map((note) => note.slug);

/**
 * @param {string} slug
 * @returns {ProjectEntry | undefined}
 */
export function getProjectBySlug(slug) {
  return projects.find((project) => project.slug === slug);
}

/**
 * @param {string} slug
 * @returns {SkillEntry | undefined}
 */
export function getSkillBySlug(slug) {
  return skills.find((skill) => skill.slug === slug);
}

/**
 * @param {string} slug
 * @returns {NoteEntry | undefined}
 */
export function getNoteBySlug(slug) {
  return notes.find((note) => note.slug === slug);
}

/**
 * @param {string} pathname
 * @returns {RouteInfo}
 */
export function getRouteInfo(pathname) {
  if (pathname === '/') {
    return {
      kind: 'home',
      pathname: '/',
      seo: profile.seo,
      profile,
    };
  }

  if (pathname === '/skills') {
    return {
      kind: 'skills',
      pathname: '/skills',
      seo: skillsSeo,
      skills,
    };
  }

  const projectMatch = pathname.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) {
    const project = getProjectBySlug(projectMatch[1]);

    if (project) {
      return {
        kind: 'project',
        pathname,
        seo: project.seo,
        project,
      };
    }
  }

  const noteMatch = pathname.match(/^\/notes\/([^/]+)$/);
  if (noteMatch) {
    const note = getNoteBySlug(noteMatch[1]);

    if (note) {
      return {
        kind: 'note',
        pathname,
        seo: note.seo,
        note,
      };
    }
  }

  return {
    kind: 'notFound',
    pathname,
    seo: createSeoMeta(
      '页面未找到 | 杨金果作品集',
      '你访问的页面不存在，可以返回首页查看精选案例、实践笔记与联系信息。',
      pathname,
      'website',
      undefined,
      homeUpdatedAt,
    ),
  };
}

/**
 * @returns {ProjectEntry[]}
 */
export function getFeaturedProjects() {
  return featuredProjectSlugs
    .map((slug) => getProjectBySlug(slug))
    .filter(Boolean);
}

/**
 * @returns {SkillEntry[]}
 */
export function getFeaturedSkills() {
  return featuredSkillSlugs
    .map((slug) => getSkillBySlug(slug))
    .filter(Boolean);
}

/**
 * @returns {NoteEntry[]}
 */
export function getFeaturedNotes() {
  return featuredNoteSlugs
    .map((slug) => getNoteBySlug(slug))
    .filter(Boolean);
}

/**
 * @returns {SitemapEntry[]}
 */
export function getSitemapEntries() {
  return [
    { path: '/', lastModified: homeUpdatedAt },
    { path: '/skills', lastModified: homeUpdatedAt },
    ...projects.map((project) => ({
      path: project.seo.path,
      lastModified: project.seo.modifiedTime || homeUpdatedAt,
    })),
    ...notes.map((note) => ({
      path: note.seo.path,
      lastModified: note.seo.modifiedTime || note.publishedAt,
    })),
  ];
}

/**
 * @param {string} siteUrl
 * @returns {string}
 */
export function normalizeSiteUrl(siteUrl) {
  return siteUrl.replace(/\/+$/, '');
}

/**
 * @param {string} path
 * @param {string} siteUrl
 * @returns {string}
 */
export function buildAbsoluteUrl(path, siteUrl) {
  return `${normalizeSiteUrl(siteUrl)}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * @param {RouteInfo} route
 * @param {string} siteUrl
 * @returns {Record<string, unknown> | Array<Record<string, unknown>>}
 */
export function buildStructuredData(route, siteUrl) {
  if (route.kind === 'home') {
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: profile.name,
        alternateName: profile.englishName,
        jobTitle: profile.role,
        email: profile.email,
        telephone: profile.phone,
        url: buildAbsoluteUrl('/', siteUrl),
        sameAs: [profile.github],
        knowsAbout: ['AI Agent', 'RAG', 'LLM Fine-tuning', 'LangGraph', 'MCP'],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteConfig.siteName,
        url: buildAbsoluteUrl('/', siteUrl),
      },
    ];
  }

  if (route.kind === 'project') {
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      headline: route.project.title,
      description: route.project.summary,
      author: {
        '@type': 'Person',
        name: profile.name,
      },
      datePublished: route.project.seo.publishedTime,
      dateModified: route.project.seo.modifiedTime,
      url: buildAbsoluteUrl(route.project.seo.path, siteUrl),
      keywords: route.project.stack.join(', '),
    };
  }

  if (route.kind === 'skills') {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Skill Lab',
      description: route.seo.description,
      url: buildAbsoluteUrl(route.pathname, siteUrl),
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: skills.map((skill, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: skill.title,
          description: skill.summary,
        })),
      },
    };
  }

  if (route.kind === 'note') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: route.note.title,
      description: route.note.summary,
      datePublished: route.note.publishedAt,
      dateModified: route.note.seo.modifiedTime,
      author: {
        '@type': 'Person',
        name: profile.name,
      },
      url: buildAbsoluteUrl(route.note.seo.path, siteUrl),
      keywords: route.note.tags.join(', '),
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: route.seo.title,
    description: route.seo.description,
    url: buildAbsoluteUrl(route.pathname, siteUrl),
  };
}

/** @returns {string} */
export function buildRecruiterSystemPrompt() {
  const projectDigest = projects
    .map(
      (project) =>
        `- ${project.title}（${project.organization}，${project.timeframe}）：${project.summary} 关键结果：${project.impact.join('；')}`,
    )
    .join('\n');

  const noteDigest = notes
    .map((note) => `- ${note.title}：${note.summary}`)
    .join('\n');

  return `
You are Yang Jinguo's recruiting assistant. Reply in professional, concise, verifiable Chinese.
Target users are recruiters/interviewers; help them judge role fit, delivery evidence, and metrics within 30 seconds.
Do not fabricate info not present on the site. If unsure, explicitly say: "根据当前站点信息无法确认".

Markdown output requirements:
- Always respond in Markdown by default (no need to ask).
- Prefer "###" headings + bullet lists; avoid long paragraphs.
- Do not output raw HTML; use code blocks only if needed.

Suggested headings: 岗位匹配 / 项目证据 / 指标口径
Prefer this order when the question is substantive:
- ### 岗位匹配
- ### 项目证据
- ### 指标口径
- ### 风险与补充
- ### 建议追问

Candidate info:
- Name: ${profile.name}
- English name: ${profile.englishName}
- Current role: ${profile.role}
- Target roles: ${profile.targetRoles.join(' / ')}
- Location: ${profile.location}
- Contact: ${profile.email} / ${profile.phone}
- GitHub: ${profile.github}

Top 3 recruiter concerns:
${profile.recruiterNotes.map((item) => `- ${item}`).join('\n')}

Key projects:
${projectDigest}

Notes:
${noteDigest}

Response requirements:
- Prioritize a structured answer: "Role fit + Evidence + Metric definition + Risks + Follow-up questions".
- For metrics, state "relative lift" vs "absolute value"; if unsure, mark "internal evaluation".
- If the question is outside site info, say cannot confirm and suggest follow-up questions.
  `.trim();
}

/** @returns {string} */
export function buildRecruiterInitialMessage() {
  return '你好，我是招聘场景 AI 助手。可以直接问岗位匹配、项目证据，或切到 JD 匹配生成一份结构化报告。';
}
