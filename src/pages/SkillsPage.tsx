import { ArrowLeft, ArrowUpRight, Boxes, Route, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import {
  getFeaturedSkills,
  getNoteBySlug,
  getProjectBySlug,
} from '../content/siteContent.js';
import { openRecruiterAssistant } from '../lib/assistant';
import { trackEvent } from '../lib/analytics';

function SkillBadge({ status, kicker }: { status: 'live' | 'prototype'; kicker: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${
        status === 'live'
          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          : 'border-[#d9ba78]/35 bg-[#f1e7d2]/70 text-[#7a5b2b] dark:border-[#d9ba78]/20 dark:bg-[#d9ba78]/10 dark:text-[#f0d9a0]'
      }`}
    >
      {kicker}
    </span>
  );
}

function SpecBlock({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-[28px] border border-black/10 bg-white/72 p-5 dark:border-white/10 dark:bg-white/[0.05]">
      <div className="text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45">
        {title}
      </div>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-3 text-sm leading-relaxed text-black/76 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/76"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SkillsPage() {
  const skills = getFeaturedSkills();

  return (
    <div className="px-6 pb-20 pt-10 md:px-12 md:pb-28">
      <div className="mx-auto max-w-7xl">
        <a
          href="/#skill-lab"
          className="inline-flex items-center gap-2 text-sm text-black/58 transition-colors hover:text-black dark:text-white/58 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页 Skill Lab
        </a>

        <section className="mt-8 grid gap-8 md:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-8"
          >
            <div className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#8a5d1f] dark:text-[#d9ba78]">
              <Sparkles className="h-3.5 w-3.5" />
              Skill Lab
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-black dark:text-white md:text-6xl">
              用可封装的 Skill 展示 Agent 工程能力
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-black/65 dark:text-white/65">
              这里不是把能力写成一堆技术词，而是把招聘场景拆成可触发、可组合、可校验的 Skill。
              重点展示输入输出定义、工具接入、Guardrails、Runtime Trace 和 Eval 面。
            </p>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-4"
          >
            <div className="rounded-[34px] border border-black/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[0.05]">
              <div className="text-xs uppercase tracking-[0.2em] text-black/42 dark:text-white/42">
                Why This Matters
              </div>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-3 text-sm leading-relaxed text-black/76 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/76">
                  Skill 的价值不在于“会不会聊天”，而在于能否把能力做成稳定可复用模块。
                </div>
                <div className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-3 text-sm leading-relaxed text-black/76 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/76">
                  这里把招聘场景拆成 JD 匹配、证据包、缺口分析三个 Skill，分别展示封装能力与工程判断。
                </div>
              </div>
            </div>
          </motion.aside>
        </section>

        <section id="skill-catalog" className="mt-18 space-y-16">
          {skills.map((skill, index) => {
            const relatedProjects = skill.relatedProjectSlugs
              .map((slug) => getProjectBySlug(slug))
              .filter(Boolean);
            const relatedNotes = skill.relatedNoteSlugs
              .map((slug) => getNoteBySlug(slug))
              .filter(Boolean);

            return (
              <section
                key={skill.slug}
                id={skill.slug}
                className="scroll-mt-28 rounded-[36px] border border-black/10 bg-white/72 p-6 dark:border-white/10 dark:bg-white/[0.05] md:p-8"
              >
                <div className="grid gap-8 md:grid-cols-12">
                  <div className="md:col-span-7">
                    <div className="flex flex-wrap items-center gap-3">
                      <SkillBadge status={skill.status} kicker={skill.kicker} />
                      <span className="rounded-full border border-black/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-black/55 dark:border-white/10 dark:text-white/55">
                        {skill.version}
                      </span>
                    </div>
                    <div className="mt-5 text-xs uppercase tracking-[0.18em] text-[#8a5d1f] dark:text-[#d9ba78]">
                      Skill {index + 1}
                    </div>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black dark:text-white md:text-4xl">
                      {skill.title}
                    </h2>
                    <p className="mt-4 max-w-3xl text-base leading-relaxed text-black/68 dark:text-white/68">
                      {skill.summary}
                    </p>

                    <div className="mt-6 grid gap-3">
                      <div className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-4 dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="text-xs uppercase tracking-[0.18em] text-black/45 dark:text-white/45">
                          Goal
                        </div>
                        <div className="mt-3 text-sm leading-relaxed text-black/76 dark:text-white/76">
                          {skill.goal}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-4 dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="text-xs uppercase tracking-[0.18em] text-black/45 dark:text-white/45">
                          Why It Proves Skill Packaging
                        </div>
                        <div className="mt-3 text-sm leading-relaxed text-black/76 dark:text-white/76">
                          {skill.proof}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-5">
                    <div className="rounded-[30px] border border-black/10 bg-white/78 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                      <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45">
                        <Boxes className="h-3.5 w-3.5" />
                        Public Interface
                      </div>
                      <div className="space-y-3">
                        {skill.outputs.map((item) => (
                          <div
                            key={item}
                            className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-3 text-sm text-black/76 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/76"
                          >
                            {item}
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        {skill.status === 'live' ? (
                          <button
                            type="button"
                            onClick={() => {
                              trackEvent('skill_page_live_skill_open', { slug: skill.slug });
                              openRecruiterAssistant('jd-fit', 'skills_page_live_skill');
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 dark:bg-white dark:text-black"
                          >
                            直接体验
                            <ArrowUpRight className="h-4 w-4" />
                          </button>
                        ) : (
                          <a
                            href={`/#skill-lab`}
                            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2.5 text-sm font-medium text-black transition-colors hover:border-black/20 hover:bg-black/4 dark:border-white/10 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/6"
                          >
                            查看首页入口
                            <ArrowUpRight className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-5 xl:grid-cols-4 lg:grid-cols-2">
                  <SpecBlock title="Trigger" items={skill.trigger} />
                  <SpecBlock title="Inputs" items={skill.inputs} />
                  <SpecBlock title="Tools" items={skill.tools} />
                  <SpecBlock title="Guardrails" items={skill.guardrails} />
                </div>

                <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                  <div className="rounded-[30px] border border-black/10 bg-white/72 p-6 dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45">
                      <Route className="h-3.5 w-3.5" />
                      Runtime Trace
                    </div>
                    <div className="space-y-3">
                      {skill.runtimeSteps.map((step, stepIndex) => (
                        <div
                          key={step.title}
                          className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-4 dark:border-white/10 dark:bg-white/[0.04]"
                        >
                          <div className="text-xs uppercase tracking-[0.18em] text-[#8a5d1f] dark:text-[#d9ba78]">
                            Step {stepIndex + 1}
                          </div>
                          <div className="mt-2 text-base font-medium text-black dark:text-white">
                            {step.title}
                          </div>
                          <div className="mt-2 text-sm leading-relaxed text-black/68 dark:text-white/68">
                            {step.detail}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-[30px] border border-black/10 bg-white/72 p-6 dark:border-white/10 dark:bg-white/[0.04]">
                      <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Eval Surface
                      </div>
                      <div className="space-y-3">
                        {skill.evals.map((metric) => (
                          <div
                            key={metric.label}
                            className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-4 dark:border-white/10 dark:bg-white/[0.04]"
                          >
                            <div className="text-lg font-semibold text-black dark:text-white">{metric.value}</div>
                            <div className="mt-1 text-sm font-medium text-black/82 dark:text-white/82">
                              {metric.label}
                            </div>
                            <div className="mt-1 text-sm leading-relaxed text-black/60 dark:text-white/60">
                              {metric.detail}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[30px] border border-black/10 bg-white/72 p-6 dark:border-white/10 dark:bg-white/[0.04]">
                      <div className="text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45">
                        Related Evidence
                      </div>
                      <div className="mt-4 space-y-3">
                        {relatedProjects.map((project) => (
                          <a
                            key={project.slug}
                            href={`/projects/${project.slug}`}
                            className="block rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-3 text-sm leading-relaxed text-black/76 transition-colors hover:border-black/15 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/76 dark:hover:border-white/20"
                          >
                            <div className="font-medium text-black dark:text-white">{project.title}</div>
                            <div className="mt-1 text-black/58 dark:text-white/58">{project.kicker}</div>
                          </a>
                        ))}
                        {relatedNotes.map((note) => (
                          <a
                            key={note.slug}
                            href={`/notes/${note.slug}`}
                            className="block rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-3 text-sm leading-relaxed text-black/76 transition-colors hover:border-black/15 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/76 dark:hover:border-white/20"
                          >
                            <div className="font-medium text-black dark:text-white">{note.title}</div>
                            <div className="mt-1 text-black/58 dark:text-white/58">{note.readTime}</div>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </section>
      </div>
    </div>
  );
}
