import { ArrowUpRight, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MessageStatus = 'done' | 'streaming' | 'error';

type RecruiterReportMessageProps = {
  content: string;
  status: MessageStatus;
};

type SectionKind =
  | 'fit'
  | 'evidence'
  | 'metrics'
  | 'risks'
  | 'followups'
  | 'roles'
  | 'projects'
  | 'general';

type ReportSection = {
  title: string;
  kind: SectionKind;
  body: string;
};

const markdownComponents = {
  a: ({ children, ...props }: any) => (
    <a {...props} target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
  code: ({ inline, className, children, ...props }: any) => {
    const codeClassName = `${inline ? 'markdown-inline-code' : 'markdown-code'}${className ? ` ${className}` : ''}`;

    return (
      <code className={codeClassName} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: any) => (
    <pre className="markdown-pre" {...props}>
      {children}
    </pre>
  ),
};

function normalizeHeading(value: string) {
  return value.replace(/[：:]/g, '').replace(/\s+/g, '').toLowerCase();
}

function getSectionKind(title: string): SectionKind {
  const normalized = normalizeHeading(title);

  if (normalized.includes('岗位匹配') || normalized.includes('匹配结论')) {
    return 'fit';
  }

  if (normalized.includes('项目证据') || normalized.includes('项目与经历证据') || normalized === '证据') {
    return 'evidence';
  }

  if (normalized.includes('指标口径') || normalized.includes('评分拆解') || normalized.includes('匹配度总分')) {
    return 'metrics';
  }

  if (normalized.includes('风险与补充') || normalized.includes('风险与待确认') || normalized === '风险') {
    return 'risks';
  }

  if (normalized.includes('建议追问') || normalized.includes('追问')) {
    return 'followups';
  }

  if (normalized.includes('推荐岗位')) {
    return 'roles';
  }

  if (normalized.includes('推荐查看项目')) {
    return 'projects';
  }

  return 'general';
}

function parseMarkdownReport(content: string): { summary: string; sections: ReportSection[]; isStructured: boolean } {
  const lines = content.split(/\r?\n/);
  const summaryLines: string[] = [];
  const sections: Array<{ title: string; lines: string[] }> = [];
  let currentSection: { title: string; lines: string[] } | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^#{2,3}\s+(.+)$/);

    if (headingMatch) {
      currentSection = {
        title: headingMatch[1].trim(),
        lines: [],
      };
      sections.push(currentSection);
      continue;
    }

    if (currentSection) {
      currentSection.lines.push(line);
      continue;
    }

    summaryLines.push(line);
  }

  const normalizedSections = sections
    .map((section) => ({
      title: section.title,
      kind: getSectionKind(section.title),
      body: section.lines.join('\n').trim(),
    }))
    .filter((section) => section.body);

  const structuredSections = normalizedSections.filter((section) => section.kind !== 'general');

  return {
    summary: summaryLines.join('\n').trim(),
    sections: normalizedSections,
    isStructured: structuredSections.length > 0,
  };
}

function splitMarkdownItems(body: string) {
  const lines = body.split(/\r?\n/);
  const items: string[] = [];
  let currentItem: string[] = [];

  for (const line of lines) {
    if (/^\s*[-*]\s+/.test(line)) {
      if (currentItem.length > 0) {
        items.push(currentItem.join('\n').trim());
      }

      currentItem = [line.replace(/^\s*[-*]\s+/, '')];
      continue;
    }

    if (currentItem.length > 0) {
      currentItem.push(line);
    }
  }

  if (currentItem.length > 0) {
    items.push(currentItem.join('\n').trim());
  }

  return items.filter(Boolean);
}

function renderMarkdown(content: string) {
  return (
    <ReactMarkdown className="markdown" remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {content}
    </ReactMarkdown>
  );
}

function renderSection(section: ReportSection) {
  const items = splitMarkdownItems(section.body);
  const isListSection = ['evidence', 'risks', 'followups', 'roles', 'projects'].includes(section.kind) && items.length > 0;
  const sectionClassName =
    section.kind === 'risks' ? 'report-card report-warning' : 'report-card';

  return (
    <section key={`${section.kind}-${section.title}`} className={sectionClassName}>
      <div className="report-section-title">{section.title}</div>
      {isListSection ? (
        <div className="mt-3 space-y-2.5">
          {items.map((item) => (
            <div
              key={`${section.title}-${item}`}
              className={`rounded-2xl border px-3 py-3 ${
                section.kind === 'risks'
                  ? 'border-amber-500/15 bg-white/70 dark:bg-white/[0.04]'
                  : 'border-black/8 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.04]'
              }`}
            >
              <div className="markdown">{renderMarkdown(item)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3">{renderMarkdown(section.body)}</div>
      )}
      {section.kind === 'projects' && (
        <div className="mt-3 inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-black/42 dark:text-white/42">
          查看详情
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      )}
    </section>
  );
}

export default function RecruiterReportMessage({
  content,
  status,
}: RecruiterReportMessageProps) {
  if (status === 'streaming') {
    return (
      <div className="recruiter-report">
        <div className="report-summary">
          <div className="inline-flex items-center gap-2 text-sm text-black/55 dark:text-white/55">
            <Loader2 className="h-4 w-4 animate-spin" />
            正在整理回答...
          </div>
          {content && (
            <div className="mt-3 text-sm leading-relaxed text-black/74 dark:text-white/74">
              {content}
            </div>
          )}
        </div>
      </div>
    );
  }

  const parsed = parseMarkdownReport(content);

  if (!parsed.isStructured) {
    return (
      <div className="recruiter-report">
        <div className="report-card">
          {renderMarkdown(content)}
        </div>
      </div>
    );
  }

  return (
    <div className="recruiter-report">
      {parsed.summary && <div className="report-summary">{renderMarkdown(parsed.summary)}</div>}
      {parsed.sections.map((section) => renderSection(section))}
    </div>
  );
}
