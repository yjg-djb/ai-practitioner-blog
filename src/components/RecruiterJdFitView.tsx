import {
  ArrowUpRight,
  Check,
  Clipboard,
  FilePenLine,
  FileSearch,
  Loader2,
  MessageSquareText,
  RotateCcw,
} from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { trackEvent } from '../lib/analytics';
import { buildJdFitMarkdown, requestJdFitReport, type JdFitReport } from '../lib/recruiter';

type RecruiterJdFitViewProps = {
  selectedModel: string;
  onOpenChat: () => void;
};

type SectionCardProps = {
  title: string;
  children: ReactNode;
  warning?: boolean;
  className?: string;
};

function getScoreTone(score: number) {
  if (score >= 80) {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
  }

  if (score >= 60) {
    return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300';
  }

  return 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300';
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

function getSourceMetaText(report: JdFitReport) {
  const parts = [];

  parts.push(report.source_meta.used_job_text ? '已使用粘贴 JD 文本' : '未提供 JD 文本');

  switch (report.source_meta.job_url_status) {
    case 'fetched':
      parts.push(
        `已抓取岗位链接${report.source_meta.fetched_title ? `（${report.source_meta.fetched_title}）` : ''}`,
      );
      break;
    case 'supplemented':
      parts.push('岗位链接已作为补充信息抓取');
      break;
    case 'failed':
      parts.push('岗位链接抓取失败，本次仅基于粘贴文本分析');
      break;
    default:
      if (report.source_meta.job_url) {
        parts.push('已提供岗位链接');
      }
      break;
  }

  return parts.join(' · ');
}

function SectionCard({
  title,
  children,
  warning = false,
  className = '',
}: SectionCardProps) {
  return (
    <section className={`${warning ? 'report-card report-warning' : 'report-card'} ${className}`.trim()}>
      <div className="report-section-title">{title}</div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function RecruiterJdFitView({
  selectedModel,
  onOpenChat,
}: RecruiterJdFitViewProps) {
  const [jobUrl, setJobUrl] = useState('');
  const [jobText, setJobText] = useState('');
  const [report, setReport] = useState<JdFitReport | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [isEditing, setIsEditing] = useState(true);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      urlInputRef.current?.focus();
    }
  }, [isEditing]);

  const submitReport = async () => {
    const normalizedUrl = jobUrl.trim();
    const normalizedText = jobText.trim();

    if (!normalizedUrl && !normalizedText) {
      setError('请至少提供岗位链接或 JD 文本。');
      return;
    }

    setError('');
    setCopyState('idle');
    setIsLoading(true);

    const inputMode = normalizedUrl && normalizedText ? 'url+text' : normalizedText ? 'text' : 'url';

    trackEvent('jd_fit_submit', {
      inputMode,
      model: selectedModel,
    });

    try {
      const nextReport = await requestJdFitReport({
        jobText: normalizedText || undefined,
        jobUrl: normalizedUrl || undefined,
        model: selectedModel,
      });

      setReport(nextReport);
      setIsEditing(false);
      trackEvent('jd_fit_success', {
        fitScore: nextReport.fit_score,
        inputMode,
        model: selectedModel,
      });
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'JD 匹配报告生成失败，请稍后重试。';

      setError(message);
      setReport(null);
      trackEvent('jd_fit_failure', {
        inputMode,
        model: selectedModel,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!report) {
      return;
    }

    try {
      await navigator.clipboard.writeText(buildJdFitMarkdown(report));
      setCopyState('copied');
      trackEvent('jd_fit_copy', {
        fitScore: report.fit_score,
      });
    } catch {
      setCopyState('error');
    }
  };

  const compactSourceText = [
    jobUrl ? truncateText(jobUrl, 56) : '未提供岗位链接',
    jobText ? `已粘贴 JD ${jobText.length} 字` : '未粘贴 JD 文本',
  ].join(' · ');

  const hasEvidence = report ? report.evidence.length > 0 : false;
  const hasRisks = report ? report.risks.length > 0 : false;
  const hasFollowUpQuestions = report ? report.follow_up_questions.length > 0 : false;
  const hasRecommendedProjects = report ? report.recommended_projects.length > 0 : false;
  const shouldExpandScoreBreakdown =
    !!report &&
    !hasEvidence &&
    !hasRisks &&
    !hasFollowUpQuestions &&
    !hasRecommendedProjects;

  const reportHeaderClassName = report && !isEditing ? 'px-3 py-3 md:px-4' : 'px-4 py-4';
  const resultBodyClassName = report && !isEditing ? 'px-3 py-3 md:px-4' : 'px-3 py-4 md:px-4';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={`border-b border-black/10 dark:border-white/10 ${reportHeaderClassName}`}>
        {report && !isEditing ? (
          <div className="rounded-[22px] border border-black/10 bg-black/[0.03] px-3.5 py-3 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-[#7a5b2b] dark:text-[#d9ba78]">
                    JD Fit Report
                  </div>
                  <div className="rounded-full border border-black/10 px-2.5 py-1 text-[11px] text-black/55 dark:border-white/10 dark:text-white/55">
                    {selectedModel}
                  </div>
                </div>
                <div className="mt-1 text-sm font-medium text-black dark:text-white">当前分析输入</div>
                <div className="report-meta mt-1 truncate">{compactSourceText}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  trackEvent('jd_fit_edit', { source: 'compact_toolbar' });
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-2 text-xs font-medium text-black transition-colors hover:border-black/20 hover:bg-black/[0.04] dark:border-white/10 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/[0.06]"
              >
                <FilePenLine className="h-3.5 w-3.5" />
                展开编辑
              </button>
            </div>

            <div className="no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => void submitReport()}
                disabled={isLoading}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-black px-3 py-2 text-xs font-medium text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
              >
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                {isLoading ? '重新生成中' : '重新生成'}
              </button>
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 px-3 py-2 text-xs font-medium text-black transition-colors hover:border-black/20 hover:bg-black/[0.04] dark:border-white/10 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/[0.06]"
              >
                {copyState === 'copied' ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
                {copyState === 'copied' ? '已复制 Markdown' : '复制 Markdown'}
              </button>
              <button
                type="button"
                onClick={onOpenChat}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 px-3 py-2 text-xs font-medium text-black transition-colors hover:border-black/20 hover:bg-black/[0.04] dark:border-white/10 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/[0.06]"
              >
                <MessageSquareText className="h-3.5 w-3.5" />
                返回聊天
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-[0.2em] text-[#7a5b2b] dark:text-[#d9ba78]">
                  JD Fit Report
                </div>
                <h3 className="mt-2 text-lg font-medium text-black dark:text-white">
                  粘贴 JD 或输入岗位链接，生成结构化匹配报告
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-black/62 dark:text-white/62">
                  输出包含匹配度、证据、风险项与建议追问，默认面向 HR 预筛。
                </p>
              </div>
              <div className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/55 dark:border-white/10 dark:text-white/55">
                {selectedModel}
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <input
                ref={urlInputRef}
                type="url"
                value={jobUrl}
                onChange={(event) => setJobUrl(event.target.value)}
                placeholder="岗位链接，例如：https://..."
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-white/20"
                disabled={isLoading}
              />
              <textarea
                value={jobText}
                onChange={(event) => setJobText(event.target.value)}
                placeholder="或直接粘贴 JD 文本。若岗位页面抓取失败，建议优先粘贴完整 JD。"
                className="min-h-[7.5rem] w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-relaxed text-black outline-none transition-colors focus:border-black/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-white/20"
                disabled={isLoading}
              />
            </div>

            <div className="report-chip-row mt-4 flex-wrap">
              <span className="report-pill">固定评分维度</span>
              <span className="report-pill">证据驱动输出</span>
              <span className="report-pill">风险项显式保留</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void submitReport()}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
                {isLoading ? '正在生成报告...' : '生成匹配报告'}
              </button>
              <button
                type="button"
                onClick={onOpenChat}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2.5 text-sm font-medium text-black transition-colors hover:border-black/20 hover:bg-black/[0.04] dark:border-white/10 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/[0.06]"
              >
                <MessageSquareText className="h-4 w-4" />
                切回聊天问答
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm leading-relaxed text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`min-h-0 flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+1rem)] ${resultBodyClassName}`}>
        {!report ? (
          <div className="space-y-3">
            <div className="report-card">
              <div className="report-section-title">输出结构</div>
              <div className="report-chip-row mt-3 flex-wrap">
                <span className="report-pill">summary</span>
                <span className="report-pill">fit score</span>
                <span className="report-pill">evidence</span>
                <span className="report-pill">risks</span>
              </div>
            </div>
            <div className="report-card">
              <div className="report-section-title">使用建议</div>
              <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-black/72 dark:text-white/72">
                <div className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                  公开岗位链接可直接尝试抓取，但强前端渲染站点仍建议粘贴完整 JD。
                </div>
                <div className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                  报告默认适合 HR 预筛，也可以复制 Markdown 给技术面试官继续追问。
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="jd-fit-report-stack">
            <div className="report-summary">
              <div className="report-section-title">Summary</div>
              <div className="mt-3 text-[1.02rem] leading-8 text-black/84 [overflow-wrap:anywhere] dark:text-white/84">
                {report.summary}
              </div>
              <div
                className={`mt-4 flex items-center justify-between gap-4 rounded-[24px] border px-4 py-3.5 ${getScoreTone(report.fit_score)}`}
              >
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.18em]">匹配度</div>
                  <div className="mt-1 text-sm leading-relaxed opacity-80">
                    综合岗位方向、项目证据与工程化能力判断
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-4xl font-semibold leading-none">{report.fit_score}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] opacity-75">/ 100</div>
                </div>
              </div>
              <div className="report-meta mt-3">{getSourceMetaText(report)}</div>
            </div>

            {report.recommended_roles.length > 0 && (
              <SectionCard title="推荐岗位">
                <div className="report-chip-row flex-wrap">
                  {report.recommended_roles.map((role) => (
                    <span key={role} className="report-pill">
                      {role}
                    </span>
                  ))}
                </div>
              </SectionCard>
            )}

            {report.score_breakdown.length > 0 && (
              <SectionCard title="评分拆解" className={shouldExpandScoreBreakdown ? 'jd-fit-expand-card' : ''}>
                <div className="space-y-2.5">
                  {report.score_breakdown.map((item) => (
                    <div
                      key={item.dimension}
                      className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium text-black dark:text-white">{item.dimension}</div>
                        <div className="text-sm font-semibold text-black dark:text-white">{item.score}/100</div>
                      </div>
                      <div className="mt-2 text-sm leading-relaxed text-black/62 dark:text-white/62">
                        {item.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {hasEvidence && (
              <SectionCard title="项目与经历证据">
                <div className="space-y-2.5">
                  {report.evidence.map((item) => (
                    <a
                      key={`${item.source_anchor}-${item.claim}`}
                      href={item.source_anchor}
                      onClick={() => trackEvent('jd_fit_evidence_open', { sourceAnchor: item.source_anchor })}
                      className="block rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-4 transition-colors hover:border-black/15 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium leading-relaxed text-black dark:text-white">
                          {item.claim}
                        </div>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-black/35 dark:text-white/35" />
                      </div>
                      <div className="mt-2 text-xs uppercase tracking-[0.18em] text-[#7a5b2b] dark:text-[#d9ba78]">
                        {item.source_label}
                      </div>
                      <div className="mt-2 text-sm leading-relaxed text-black/62 dark:text-white/62">
                        {item.why_it_matters}
                      </div>
                    </a>
                  ))}
                </div>
              </SectionCard>
            )}

            {hasRisks && (
              <SectionCard title="风险与待确认" warning>
                <div className="space-y-2.5">
                  {report.risks.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-amber-500/15 bg-white/70 px-4 py-3 text-sm leading-relaxed text-black/72 dark:bg-white/[0.04] dark:text-white/72"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {hasFollowUpQuestions && (
              <SectionCard title="建议追问">
                <div className="space-y-2.5">
                  {report.follow_up_questions.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-3 text-sm leading-relaxed text-black/72 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/72"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {hasRecommendedProjects && (
              <SectionCard title="推荐查看项目">
                <div className="space-y-2.5">
                  {report.recommended_projects.map((item) => (
                    <a
                      key={item.slug}
                      href={item.href}
                      onClick={() => trackEvent('jd_fit_project_open', { slug: item.slug })}
                      className="block rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-4 transition-colors hover:border-black/15 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium text-black dark:text-white">{item.title}</div>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-black/35 dark:text-white/35" />
                      </div>
                      <div className="mt-2 text-sm leading-relaxed text-black/62 dark:text-white/62">
                        {item.reason}
                      </div>
                    </a>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
