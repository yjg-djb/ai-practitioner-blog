import { notes, profile, projects } from '../content/siteContent.js';

const SCORE_DIMENSIONS = [
  '岗位方向匹配',
  'Agent 编排与工具调用',
  'RAG / 数据与知识处理',
  '工程化与部署',
  '业务交付与沟通',
];

const MAX_JOB_TEXT_CHARS = 12000;
const MAX_PAGE_TEXT_CHARS = 9000;

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function clampScore(score) {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function truncate(value, maxChars) {
  if (value.length <= maxChars) {
    return value;
  }

  return `${value.slice(0, maxChars)}...`;
}

function extractTextContent(content) {
  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part?.text === 'string' ? part.text : ''))
      .join('')
      .trim();
  }

  return '';
}

function stripCodeFence(value) {
  return value
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function parseStructuredJson(text) {
  const cleaned = stripCodeFence(text);
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('模型未返回有效 JSON。');
  }

  return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
}

function toStringArray(value, limit = 6) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === 'string' ? normalizeWhitespace(item) : ''))
    .filter(Boolean)
    .slice(0, limit);
}

function createSourceCatalog() {
  const workEntries = profile.timeline.filter((entry) => entry.kind === 'work');
  const educationEntries = profile.timeline.filter((entry) => entry.kind === 'education');
  const catalog = [
    {
      source_label: '候选人定位与目标岗位',
      source_anchor: '/#hero',
      source_type: 'profile',
      summary: `${profile.role}；目标岗位：${profile.targetRoles.join(' / ')}；${profile.heroSummary}`,
    },
    {
      source_label: '技能分组',
      source_anchor: '/#skills',
      source_type: 'skills',
      summary: profile.skillGroups.map((group) => `${group.title}: ${group.items.join(' / ')}`).join('；'),
    },
    ...workEntries.map((entry, index) => ({
      source_label: `${entry.organization}｜${entry.title}`,
      source_anchor: `/#timeline-work-${index}`,
      source_type: 'work',
      summary: `${entry.period}；${entry.summary}；亮点：${entry.highlights.join('；')}`,
    })),
    ...educationEntries.map((entry, index) => ({
      source_label: `${entry.organization}｜${entry.title}`,
      source_anchor: `/#timeline-education-${index}`,
      source_type: 'education',
      summary: `${entry.period}；${entry.summary}；亮点：${entry.highlights.join('；')}`,
    })),
    ...projects.map((project) => ({
      source_label: `${project.title}｜${project.organization}`,
      source_anchor: `/projects/${project.slug}`,
      source_type: 'project',
      slug: project.slug,
      summary: `${project.summary}；关键结果：${project.impact.join('；')}；技术栈：${project.stack.join(' / ')}`,
    })),
    ...notes.map((note) => ({
      source_label: `${note.title}｜实践笔记`,
      source_anchor: `/notes/${note.slug}`,
      source_type: 'note',
      slug: note.slug,
      summary: `${note.summary}；要点：${note.takeaways.join('；')}`,
    })),
  ];

  const sourceByAnchor = new Map(catalog.map((item) => [item.source_anchor, item]));
  const sourceByLabel = new Map(catalog.map((item) => [item.source_label, item]));
  const projectsBySlug = new Map(projects.map((project) => [project.slug, project]));
  const projectsByTitle = new Map(projects.map((project) => [project.title, project]));

  return {
    catalog,
    sourceByAnchor,
    sourceByLabel,
    projectsBySlug,
    projectsByTitle,
  };
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)));
}

function extractMetaContent(html, metaName) {
  const matcher = new RegExp(
    `<meta[^>]+(?:name|property)=["']${metaName}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    'i',
  );
  const match = html.match(matcher);
  return match ? normalizeWhitespace(decodeHtmlEntities(match[1])) : '';
}

function stripHtml(html) {
  return normalizeWhitespace(
    decodeHtmlEntities(
      html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
        .replace(/<(br|\/p|\/div|\/li|\/section|\/article|\/main|\/tr|\/h[1-6])>/gi, '\n')
        .replace(/<[^>]+>/g, ' '),
    ),
  );
}

function pickMainHtml(html) {
  const candidates = [
    ...html.matchAll(/<main\b[^>]*>([\s\S]*?)<\/main>/gi),
    ...html.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/gi),
    ...html.matchAll(/<body\b[^>]*>([\s\S]*?)<\/body>/gi),
  ];

  if (candidates.length === 0) {
    return html;
  }

  return candidates
    .map((match) => match[1] || '')
    .sort((left, right) => right.length - left.length)[0];
}

function assertSafeJobUrl(rawUrl) {
  let parsedUrl;

  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new Error('岗位链接格式无效，请提供完整 http(s) 地址。');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('岗位链接只支持 http 或 https。');
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  if (
    hostname === 'localhost' ||
    hostname === '0.0.0.0' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.endsWith('.local') ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  ) {
    throw new Error('岗位链接不可指向本地或内网地址。');
  }

  return parsedUrl.toString();
}

async function fetchJobPageContext(jobUrl) {
  const safeUrl = assertSafeJobUrl(jobUrl);
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 10000);

  try {
    const response = await fetch(safeUrl, {
      headers: {
        Accept: 'text/html, text/plain;q=0.9',
        'User-Agent': 'RecruiterJDFitBot/1.0',
      },
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`岗位链接抓取失败：${response.status}`);
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      throw new Error('岗位链接不是可读取的 HTML 页面，请直接粘贴 JD 文本。');
    }

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? normalizeWhitespace(decodeHtmlEntities(titleMatch[1])) : '';
    const description = extractMetaContent(html, 'description') || extractMetaContent(html, 'og:description');
    const mainHtml = pickMainHtml(html);
    const text = truncate(stripHtml(mainHtml), MAX_PAGE_TEXT_CHARS);

    if (!text) {
      throw new Error('岗位页面正文提取失败，请直接粘贴 JD 文本。');
    }

    return {
      url: safeUrl,
      title,
      description,
      text,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function buildSystemPrompt(catalog) {
  return `
你是一名只基于站内材料工作的招聘分析助手。目标是根据 JD 评估候选人是否匹配，并输出结构化 JSON。

规则：
1. 只能使用站内资料，不得编造站外经历或技能。
2. 无法确认的内容必须进入 risks，不能写成优势。
3. evidence 里的 source_anchor 必须从候选来源列表中选择。
4. score_breakdown 固定输出以下 5 个维度：${SCORE_DIMENSIONS.join('、')}。
5. fit_score 使用 0-100 的整数。
6. recommended_projects 仅从现有项目中选择。
7. 只返回 JSON，不要 Markdown，不要解释，不要代码块。

返回 JSON 结构：
{
  "summary": "string",
  "fit_score": 0,
  "recommended_roles": ["string"],
  "score_breakdown": [
    { "dimension": "岗位方向匹配", "score": 0, "reason": "string" }
  ],
  "evidence": [
    {
      "claim": "string",
      "source_label": "string",
      "source_anchor": "string",
      "why_it_matters": "string"
    }
  ],
  "risks": ["string"],
  "follow_up_questions": ["string"],
  "recommended_projects": [
    { "slug": "string", "title": "string", "reason": "string", "href": "string" }
  ]
}

候选来源列表：
${catalog.map((item) => `- ${item.source_label} | ${item.source_anchor} | ${item.summary}`).join('\n')}
  `.trim();
}

function buildUserPrompt({ jobText, jobUrl, jobPageContext, fetchError }) {
  const sections = [
    '请基于以下岗位信息生成候选人 JD 匹配报告。',
    '',
    `候选人：${profile.name} / ${profile.role}`,
    `目标岗位：${profile.targetRoles.join(' / ')}`,
  ];

  if (jobUrl) {
    sections.push('', `岗位链接：${jobUrl}`);
  }

  if (jobText) {
    sections.push('', 'JD 文本：', truncate(jobText, MAX_JOB_TEXT_CHARS));
  }

  if (jobPageContext) {
    sections.push(
      '',
      '岗位页面抓取补充：',
      `标题：${jobPageContext.title || '无标题'}`,
      jobPageContext.description ? `描述：${jobPageContext.description}` : '',
      `正文摘录：${jobPageContext.text}`,
    );
  }

  if (fetchError) {
    sections.push('', `岗位链接抓取情况：${fetchError}`);
  }

  sections.push(
    '',
    '输出要求：',
    '- summary 用 2-3 句中文给出是否建议进入下一轮。',
    '- evidence 只保留最关键的 3-5 条。',
    '- risks 与 follow_up_questions 要具体。',
    '- 如果 JD 方向明显不匹配，也要给出低分和原因。',
  );

  return sections.filter(Boolean).join('\n');
}

async function callChatCompletion({ upstreamBaseUrl, upstreamApiKey, model, messages, temperature = 0.2 }) {
  const response = await fetch(new URL('/v1/chat/completions', `${upstreamBaseUrl}/`), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${upstreamApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      stream: false,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.error?.message || `模型请求失败：${response.status}`;
    throw new Error(message);
  }

  return extractTextContent(payload?.choices?.[0]?.message?.content);
}

async function requestStructuredReport({ upstreamBaseUrl, upstreamApiKey, model, systemPrompt, userPrompt }) {
  const rawText = await callChatCompletion({
    upstreamBaseUrl,
    upstreamApiKey,
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  try {
    return parseStructuredJson(rawText);
  } catch {
    const repairedText = await callChatCompletion({
      upstreamBaseUrl,
      upstreamApiKey,
      model,
      temperature: 0,
      messages: [
        {
          role: 'system',
          content:
            '你是一个 JSON 修复器。请把用户提供的内容修复为有效 JSON，保持原意，不新增事实，只返回 JSON。',
        },
        {
          role: 'user',
          content: rawText,
        },
      ],
    });

    return parseStructuredJson(repairedText);
  }
}

function normalizeEvidence(evidence, sourceCatalog) {
  if (!Array.isArray(evidence)) {
    return [];
  }

  return evidence
    .map((item) => {
      const source =
        sourceCatalog.sourceByAnchor.get(item?.source_anchor) ||
        sourceCatalog.sourceByLabel.get(item?.source_label);

      const claim = typeof item?.claim === 'string' ? normalizeWhitespace(item.claim) : '';
      const whyItMatters =
        typeof item?.why_it_matters === 'string' ? normalizeWhitespace(item.why_it_matters) : '';

      if (!source || !claim || !whyItMatters) {
        return null;
      }

      return {
        claim,
        source_label: source.source_label,
        source_anchor: source.source_anchor,
        why_it_matters: whyItMatters,
      };
    })
    .filter(Boolean)
    .slice(0, 5);
}

function normalizeRecommendedProjects(recommendedProjects, sourceCatalog, evidence) {
  const normalized = [];

  if (Array.isArray(recommendedProjects)) {
    for (const item of recommendedProjects) {
      const bySlug =
        typeof item?.slug === 'string' ? sourceCatalog.projectsBySlug.get(item.slug.trim()) : undefined;
      const byTitle =
        typeof item?.title === 'string' ? sourceCatalog.projectsByTitle.get(item.title.trim()) : undefined;
      const project = bySlug || byTitle;

      if (!project) {
        continue;
      }

      normalized.push({
        slug: project.slug,
        title: project.title,
        reason:
          typeof item?.reason === 'string' && item.reason.trim()
            ? normalizeWhitespace(item.reason)
            : '与当前 JD 的关键要求最相关。',
        href: `/projects/${project.slug}`,
      });
    }
  }

  if (normalized.length > 0) {
    return normalized.slice(0, 3);
  }

  const fallbackProjects = evidence
    .map((item) => {
      const match = item.source_anchor.match(/^\/projects\/([^/]+)$/);
      return match ? sourceCatalog.projectsBySlug.get(match[1]) : undefined;
    })
    .filter(Boolean);

  return fallbackProjects.slice(0, 3).map((project) => ({
    slug: project.slug,
    title: project.title,
    reason: '报告中的关键证据主要来自该项目。',
    href: `/projects/${project.slug}`,
  }));
}

function normalizeReport(rawReport, sourceCatalog, sourceMeta) {
  const evidence = normalizeEvidence(rawReport?.evidence, sourceCatalog);

  const scoreBreakdown = SCORE_DIMENSIONS.map((dimension) => {
    const found = Array.isArray(rawReport?.score_breakdown)
      ? rawReport.score_breakdown.find((item) => normalizeWhitespace(item?.dimension || '') === dimension)
      : undefined;

    return {
      dimension,
      score: clampScore(Number(found?.score)),
      reason:
        typeof found?.reason === 'string' && found.reason.trim()
          ? normalizeWhitespace(found.reason)
          : '模型未返回该维度的明确理由，需人工复核。',
    };
  });

  const fitScore =
    typeof rawReport?.fit_score === 'number'
      ? clampScore(rawReport.fit_score)
      : clampScore(
          scoreBreakdown.reduce((sum, item) => sum + item.score, 0) /
            (scoreBreakdown.length || 1),
        );

  const risks = toStringArray(rawReport?.risks, 5);
  const followUpQuestions = toStringArray(rawReport?.follow_up_questions, 5);

  return {
    summary:
      typeof rawReport?.summary === 'string' && rawReport.summary.trim()
        ? normalizeWhitespace(rawReport.summary)
        : '根据当前站点信息已生成初步判断，但仍建议结合真实 JD 细节做进一步确认。',
    fit_score: fitScore,
    recommended_roles: toStringArray(rawReport?.recommended_roles, 4),
    score_breakdown: scoreBreakdown,
    evidence,
    risks:
      risks.length > 0
        ? risks
        : ['根据当前站点信息，仍需结合真实业务目标确认技术深度与职责边界。'],
    follow_up_questions:
      followUpQuestions.length > 0
        ? followUpQuestions
        : ['请追问候选人在目标岗位里的直接负责人角色、上线规模和评估口径。'],
    recommended_projects: normalizeRecommendedProjects(rawReport?.recommended_projects, sourceCatalog, evidence),
    source_meta: sourceMeta,
  };
}

export async function generateJdFitReport({
  upstreamBaseUrl,
  upstreamApiKey,
  model,
  jobText,
  jobUrl,
}) {
  const normalizedJobText = typeof jobText === 'string' ? normalizeWhitespace(jobText) : '';
  const normalizedJobUrl = typeof jobUrl === 'string' ? jobUrl.trim() : '';

  if (!normalizedJobText && !normalizedJobUrl) {
    throw new Error('请至少提供岗位链接或 JD 文本。');
  }

  if (!upstreamBaseUrl || !upstreamApiKey) {
    throw new Error('OPENAI_COMPAT_BASE_URL 或 OPENAI_COMPAT_API_KEY 未配置。');
  }

  const sourceCatalog = createSourceCatalog();

  let jobPageContext = null;
  let fetchError = '';
  let jobUrlStatus = 'not_provided';

  if (normalizedJobUrl) {
    try {
      jobPageContext = await fetchJobPageContext(normalizedJobUrl);
      jobUrlStatus = normalizedJobText ? 'supplemented' : 'fetched';
    } catch (error) {
      fetchError = error instanceof Error ? error.message : '岗位链接抓取失败。';
      if (!normalizedJobText) {
        throw new Error(`${fetchError} 请直接粘贴 JD 文本后重试。`);
      }
      jobUrlStatus = 'failed';
    }
  }

  const rawReport = await requestStructuredReport({
    upstreamBaseUrl,
    upstreamApiKey,
    model,
    systemPrompt: buildSystemPrompt(sourceCatalog.catalog),
    userPrompt: buildUserPrompt({
      jobText: truncate(normalizedJobText, MAX_JOB_TEXT_CHARS),
      jobUrl: normalizedJobUrl,
      jobPageContext,
      fetchError,
    }),
  });

  return normalizeReport(rawReport, sourceCatalog, {
    job_url: normalizedJobUrl || undefined,
    job_url_status: jobUrlStatus,
    fetched_title: jobPageContext?.title || undefined,
    used_job_text: Boolean(normalizedJobText),
  });
}
