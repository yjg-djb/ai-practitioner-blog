export type RecruiterAssistantMode = 'chat' | 'jd-fit';

export type JdFitScoreBreakdownItem = {
  dimension: string;
  score: number;
  reason: string;
};

export type JdFitEvidenceItem = {
  claim: string;
  source_label: string;
  source_anchor: string;
  why_it_matters: string;
};

export type JdFitRecommendedProject = {
  slug: string;
  title: string;
  reason: string;
  href: string;
};

export type JdFitSourceMeta = {
  job_url?: string;
  job_url_status: 'not_provided' | 'fetched' | 'failed' | 'supplemented';
  fetched_title?: string;
  used_job_text: boolean;
};

export type JdFitReport = {
  summary: string;
  fit_score: number;
  recommended_roles: string[];
  score_breakdown: JdFitScoreBreakdownItem[];
  evidence: JdFitEvidenceItem[];
  risks: string[];
  follow_up_questions: string[];
  recommended_projects: JdFitRecommendedProject[];
  source_meta: JdFitSourceMeta;
};

type RequestJdFitReportInput = {
  jobText?: string;
  jobUrl?: string;
  model?: string;
};

async function readErrorMessage(response: Response): Promise<string> {
  const contentType = (response.headers.get('content-type') || '').toLowerCase();

  if (contentType.includes('application/json')) {
    const payload = (await response.json()) as { error?: string };
    return payload.error || `请求失败：${response.status}`;
  }

  const text = await response.text();
  return text.trim() || `请求失败：${response.status}`;
}

export async function requestJdFitReport(input: RequestJdFitReportInput): Promise<JdFitReport> {
  const response = await fetch('/api/recruiter/jd-fit', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as JdFitReport;
}

export function buildJdFitMarkdown(report: JdFitReport): string {
  const sections = [
    '### JD 匹配结论',
    report.summary,
    '',
    '### 匹配度总分',
    `- 总分：${report.fit_score}/100`,
  ];

  if (report.recommended_roles.length > 0) {
    sections.push('', '### 推荐岗位', ...report.recommended_roles.map((item) => `- ${item}`));
  }

  if (report.score_breakdown.length > 0) {
    sections.push(
      '',
      '### 评分拆解',
      ...report.score_breakdown.map((item) => `- ${item.dimension}：${item.score}/100；${item.reason}`),
    );
  }

  if (report.evidence.length > 0) {
    sections.push(
      '',
      '### 项目与经历证据',
      ...report.evidence.map(
        (item) => `- **${item.claim}**\n  - 来源：${item.source_label}\n  - 价值：${item.why_it_matters}`,
      ),
    );
  }

  if (report.risks.length > 0) {
    sections.push('', '### 风险与待确认', ...report.risks.map((item) => `- ${item}`));
  }

  if (report.follow_up_questions.length > 0) {
    sections.push('', '### 建议追问', ...report.follow_up_questions.map((item) => `- ${item}`));
  }

  if (report.recommended_projects.length > 0) {
    sections.push(
      '',
      '### 推荐查看项目',
      ...report.recommended_projects.map((item) => `- ${item.title}：${item.reason}`),
    );
  }

  return sections.join('\n');
}
