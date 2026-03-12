import { ArrowLeft, ArrowUpRight, BookOpenText, Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';
import { getNoteBySlug, getProjectBySlug, profile } from '../content/siteContent.js';
import { trackEvent } from '../lib/analytics';

type NotePageProps = {
  slug: string;
};

export default function NotePage({ slug }: NotePageProps) {
  const note = getNoteBySlug(slug);

  if (!note) {
    return null;
  }

  const relatedProjects = note.relatedProjectSlugs
    .map((projectSlug) => getProjectBySlug(projectSlug))
    .filter(Boolean);

  return (
    <div className="px-6 pb-20 pt-10 md:px-12 md:pb-28">
      <article className="mx-auto max-w-7xl">
        <a
          href="/#notes"
          className="inline-flex items-center gap-2 text-sm text-black/58 transition-colors hover:text-black dark:text-white/58 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页实践笔记
        </a>

        <section className="mt-8 grid gap-8 md:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-8"
          >
            <div className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#8a5d1f] dark:text-[#d9ba78]">
              <BookOpenText className="h-3.5 w-3.5" />
              Practice Note
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-black dark:text-white md:text-6xl">
              {note.title}
            </h1>
            <div className="mt-4 text-sm text-black/48 dark:text-white/48">
              {note.publishedAt} · {note.readTime}
            </div>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-black/65 dark:text-white/65">
              {note.summary}
            </p>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-4"
          >
            <div className="rounded-[34px] border border-black/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[0.05]">
              <div className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8a5d1f] dark:text-[#d9ba78]">
                <Lightbulb className="h-3.5 w-3.5" />
                Key Takeaways
              </div>
              <div className="space-y-3">
                {note.takeaways.map((takeaway) => (
                  <div
                    key={takeaway}
                    className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-3 text-sm leading-relaxed text-black/78 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/78"
                  >
                    {takeaway}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/65 dark:border-white/10 dark:text-white/65"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <a
                href={profile.resumeUrl}
                download
                onClick={() => trackEvent('resume_download', { source: 'note_page', slug: note.slug })}
                className="mt-6 inline-flex w-full items-center justify-between rounded-2xl border border-black/10 px-4 py-3 text-sm font-medium text-black transition-colors hover:border-black/20 hover:bg-black/4 dark:border-white/10 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/6"
              >
                下载 PDF 简历
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </motion.aside>
        </section>

        <section className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-10">
            {note.sections.map((section) => (
              <section
                key={section.title}
                className="rounded-[30px] border border-black/10 bg-white/72 p-6 dark:border-white/10 dark:bg-white/[0.05]"
              >
                <h2 className="text-2xl font-semibold tracking-tight text-black dark:text-white">
                  {section.title}
                </h2>

                {section.paragraphs && (
                  <div className="mt-4 space-y-4 text-base leading-relaxed text-black/72 dark:text-white/72">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                )}

                {section.bullets && (
                  <div className="mt-5 space-y-3">
                    {section.bullets.map((bullet) => (
                      <div
                        key={bullet}
                        className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-3 text-sm leading-relaxed text-black/78 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/78"
                      >
                        {bullet}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-[28px] border border-black/10 bg-white/72 p-5 dark:border-white/10 dark:bg-white/[0.05]">
              <div className="text-xs uppercase tracking-[0.2em] text-black/42 dark:text-white/42">
                阅读提示
              </div>
              <div className="mt-3 text-sm leading-relaxed text-black/62 dark:text-white/62">
                这些笔记的目标不是全面科普，而是展示我在真实工程取舍上的判断方式。
              </div>
            </div>
          </aside>
        </section>

        {relatedProjects.length > 0 && (
          <section className="mt-20">
            <div className="mb-6 text-xs uppercase tracking-[0.22em] text-[#8a5d1f] dark:text-[#d9ba78]">
              Related Projects
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {relatedProjects.map((project) => (
                <a
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  onClick={() => trackEvent('case_open', { slug: project.slug, source: 'note_detail' })}
                  className="rounded-[30px] border border-black/10 bg-white/72 p-6 transition-transform hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.05]"
                >
                  <div className="text-xs uppercase tracking-[0.2em] text-black/42 dark:text-white/42">
                    {project.kicker}
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-black dark:text-white">
                    {project.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-black/62 dark:text-white/62">
                    {project.teaser}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
