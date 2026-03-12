import type { ReactNode } from 'react';
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, CircuitBoard, Gauge, Wrench } from 'lucide-react';
import { motion } from 'motion/react';
import { getNoteBySlug, getProjectBySlug, profile } from '../content/siteContent.js';
import { trackEvent } from '../lib/analytics';

type ProjectPageProps = {
  slug: string;
};

function DetailCard({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[30px] border border-black/10 bg-white/72 p-6 dark:border-white/10 dark:bg-white/[0.05]">
      <div className="mb-4 flex items-center gap-3 text-sm font-medium text-black dark:text-white">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.04]">
          {icon}
        </span>
        {title}
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-3 text-sm leading-relaxed text-black/78 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/78"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProjectPage({ slug }: ProjectPageProps) {
  const project = getProjectBySlug(slug);

  if (!project) {
    return null;
  }

  const relatedNotes = project.relatedNoteSlugs
    .map((noteSlug) => getNoteBySlug(noteSlug))
    .filter(Boolean);

  return (
    <div className="px-6 pb-20 pt-10 md:px-12 md:pb-28">
      <div className="mx-auto max-w-7xl">
        <a
          href="/#cases"
          className="inline-flex items-center gap-2 text-sm text-black/58 transition-colors hover:text-black dark:text-white/58 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页案例区
        </a>

        <section className="mt-8 grid gap-8 md:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-8"
          >
            <div className="mb-4 text-xs uppercase tracking-[0.22em] text-[#8a5d1f] dark:text-[#d9ba78]">
              {project.kicker}
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-black dark:text-white md:text-6xl">
              {project.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-black/65 dark:text-white/65">
              {project.summary}
            </p>

            <div className="mt-8 grid gap-3">
              {project.impact.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-black/8 bg-white/72 px-4 py-3 text-sm leading-relaxed text-black/82 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/82"
                >
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-4"
          >
            <div className="rounded-[34px] border border-black/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[0.05]">
              <div className="text-xs uppercase tracking-[0.2em] text-black/42 dark:text-white/42">
                项目概览
              </div>
              <div className="mt-5 grid gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-black/42 dark:text-white/42">
                    角色
                  </div>
                  <div className="mt-1 text-sm text-black dark:text-white">{project.role}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-black/42 dark:text-white/42">
                    单位
                  </div>
                  <div className="mt-1 text-sm text-black dark:text-white">{project.organization}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-black/42 dark:text-white/42">
                    时间
                  </div>
                  <div className="mt-1 text-sm text-black dark:text-white">{project.timeframe}</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-xs uppercase tracking-[0.18em] text-black/42 dark:text-white/42">
                  技术栈
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/65 dark:border-white/10 dark:text-white/65"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <a
                  href={profile.resumeUrl}
                  download
                  onClick={() => trackEvent('resume_download', { source: 'project_page', slug: project.slug })}
                  className="inline-flex w-full items-center justify-between rounded-2xl border border-black/10 px-4 py-3 text-sm font-medium text-black transition-colors hover:border-black/20 hover:bg-black/4 dark:border-white/10 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/6"
                >
                  下载 PDF 简历
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </motion.aside>
        </section>

        <section className="mt-20">
          <div className="mb-6 text-xs uppercase tracking-[0.22em] text-[#8a5d1f] dark:text-[#d9ba78]">
            Workflow Diagram
          </div>
          <div className="grid gap-4 lg:grid-cols-4">
            {project.workflow.map((step, index) => (
              <div
                key={step.title}
                className="rounded-[28px] border border-black/10 bg-white/72 p-5 dark:border-white/10 dark:bg-white/[0.05]"
              >
                <div className="text-xs uppercase tracking-[0.18em] text-black/42 dark:text-white/42">
                  Step {index + 1}
                </div>
                <div className="mt-3 text-lg font-semibold text-black dark:text-white">
                  {step.title}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-black/62 dark:text-white/62">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 grid gap-5 lg:grid-cols-2">
          <DetailCard title="职责边界" items={project.responsibilities} icon={<BriefcaseBusiness className="h-4 w-4" />} />
          <DetailCard title="架构取舍" items={project.architecture} icon={<CircuitBoard className="h-4 w-4" />} />
          <DetailCard title="工程权衡" items={project.tradeoffs} icon={<Wrench className="h-4 w-4" />} />
          <DetailCard title="结果与产出" items={project.outcomes} icon={<Gauge className="h-4 w-4" />} />
        </section>

        {relatedNotes.length > 0 && (
          <section className="mt-20">
            <div className="mb-6 text-xs uppercase tracking-[0.22em] text-[#8a5d1f] dark:text-[#d9ba78]">
              Related Notes
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {relatedNotes.map((note) => (
                <a
                  key={note.slug}
                  href={`/notes/${note.slug}`}
                  onClick={() => trackEvent('note_open', { slug: note.slug, source: 'project_detail' })}
                  className="rounded-[30px] border border-black/10 bg-white/72 p-6 transition-transform hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.05]"
                >
                  <div className="text-xs uppercase tracking-[0.2em] text-black/42 dark:text-white/42">
                    {note.readTime}
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-black dark:text-white">
                    {note.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-black/62 dark:text-white/62">
                    {note.summary}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
