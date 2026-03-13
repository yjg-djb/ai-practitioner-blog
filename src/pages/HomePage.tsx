import { motion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  FileDown,
  FileSearch,
  MessageSquareText,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  getFeaturedNotes,
  getFeaturedProjects,
  getFeaturedSkills,
  profile,
} from '../content/siteContent.js';
import { openRecruiterAssistant } from '../lib/assistant';
import { trackEvent } from '../lib/analytics';

function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-2xl">
      <div className="mb-3 text-xs uppercase tracking-[0.22em] text-[#7a5b2b] dark:text-[#d9ba78]">
        {eyebrow}
      </div>
      <h2 className="text-3xl font-semibold tracking-tight text-black dark:text-white md:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-black/62 dark:text-white/62 md:text-lg">
        {body}
      </p>
    </div>
  );
}

export default function HomePage() {
  const featuredProjects = getFeaturedProjects();
  const featuredNotes = getFeaturedNotes();
  const featuredSkills = getFeaturedSkills();
  const workEntries = profile.timeline.filter((entry) => entry.kind === 'work');
  const educationEntries = profile.timeline.filter((entry) => entry.kind === 'education');

  return (
    <div className="px-6 pb-20 pt-8 md:px-12 md:pb-28">
      <section id="hero" className="mx-auto grid max-w-7xl gap-8 pt-6 md:grid-cols-12 md:gap-10 md:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-7"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d9ba78]/35 bg-[#f1e7d2]/70 px-4 py-2 text-xs uppercase tracking-[0.22em] text-[#7a5b2b] dark:border-[#d9ba78]/20 dark:bg-[#d9ba78]/10 dark:text-[#d9ba78]">
            <Sparkles className="h-3.5 w-3.5" />
            {profile.heroBadge}
          </div>

          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.04] tracking-tight text-black dark:text-white md:text-7xl">
            {profile.heroTitle}
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-black/68 dark:text-white/68 md:text-xl">
            {profile.heroSummary}
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {profile.summary.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-black/75 shadow-sm dark:border-white/10 dark:bg-white/[0.05] dark:text-white/72"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#cases"
              className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 dark:bg-white dark:text-black"
            >
              查看案例
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={profile.resumeUrl}
              download
              onClick={() => trackEvent('resume_download', { source: 'hero' })}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-black transition-colors hover:border-black/20 hover:bg-black/4 dark:border-white/10 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/6"
            >
              <FileDown className="h-4 w-4" />
              下载简历
            </a>
            <button
              type="button"
              onClick={() => {
                trackEvent('jd_fit_cta_click', { source: 'hero' });
                openRecruiterAssistant('jd-fit', 'hero_jd_fit');
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[#d9ba78]/35 bg-[#f1e7d2]/70 px-5 py-3 text-sm font-medium text-[#7a5b2b] transition-colors hover:border-[#d9ba78]/55 hover:bg-[#efe0bf] dark:border-[#d9ba78]/20 dark:bg-[#d9ba78]/10 dark:text-[#f0d9a0] dark:hover:bg-[#d9ba78]/16"
            >
              <MessageSquareText className="h-4 w-4" />
              生成 JD 匹配报告
            </button>
            <button
              type="button"
              onClick={() => {
                trackEvent('ai_cta_click', { source: 'hero' });
                openRecruiterAssistant('chat', 'hero_chat');
              }}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-5 py-3 text-sm font-medium text-black transition-colors hover:border-black/20 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:border-white/20"
            >
              <MessageSquareText className="h-4 w-4" />
              HR 快速提问
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {profile.targetRoles.map((role) => (
              <span
                key={role}
                className="rounded-full border border-black/10 px-3 py-1.5 text-sm text-black/70 dark:border-white/10 dark:text-white/70"
              >
                {role}
              </span>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {profile.proofPoints.map((point) => (
              <div
                key={point.label}
                className="rounded-[26px] border border-black/10 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]"
              >
                <div className="text-3xl font-semibold tracking-tight text-black dark:text-white">
                  {point.value}
                </div>
                <div className="mt-2 text-sm font-medium text-black dark:text-white">
                  {point.label}
                </div>
                <div className="mt-1 text-sm leading-relaxed text-black/58 dark:text-white/58">
                  {point.detail}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-5"
        >
          <div className="rounded-[34px] border border-black/10 bg-white/80 p-6 shadow-[0_22px_70px_rgba(24,20,12,0.08)] dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_22px_70px_rgba(0,0,0,0.36)] md:p-7">
            <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#7a5b2b] dark:text-[#d9ba78]">
              <Target className="h-3.5 w-3.5" />
              Recruiter Quick Scan
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45">
                  岗位匹配
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.targetRoles.map((role) => (
                    <span
                      key={role}
                      className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/70 dark:border-white/10 dark:text-white/70"
                    >
                      {role}
                    </span>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  {profile.recruiterNotes.map((note) => (
                    <div
                      key={note}
                      className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-3 text-sm leading-relaxed text-black/78 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/78"
                    >
                      {note}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45">
                  核心项目证据
                </div>
                <div className="mt-3 space-y-3">
                  {featuredProjects.slice(0, 3).map((project) => (
                    <a
                      key={project.slug}
                      href={`/projects/${project.slug}`}
                      onClick={() => trackEvent('case_open', { slug: project.slug, source: 'quick_scan' })}
                      className="block rounded-2xl border border-black/8 bg-white/70 px-4 py-3 text-sm text-black/78 transition-colors hover:border-black/15 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/78"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-black/90 dark:text-white/90">
                          {project.title}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-black/35 dark:text-white/35" />
                      </div>
                      <div className="mt-2 text-xs leading-relaxed text-black/60 dark:text-white/60">
                        {project.impact[0]}
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45">
                  快速联系
                </div>
                <div className="mt-3 grid gap-2">
                  {profile.contactLinks.slice(0, 3).map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noreferrer' : undefined}
                      download={link.href === profile.resumeUrl}
                      onClick={() =>
                        trackEvent(link.href === profile.resumeUrl ? 'resume_download' : 'contact_click', {
                          channel: link.label,
                          source: 'quick_scan',
                        })
                      }
                      className="inline-flex items-center justify-between rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm font-medium text-black transition-colors hover:border-black/20 dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      </section>

      <section id="skills" className="mx-auto mt-24 max-w-7xl scroll-mt-28">
        <SectionHeader
          eyebrow="核心技能"
          title="按交付链路组织的能力结构"
          body="将能力按 Agent 编排、RAG 与数据、训练对齐、推理部署和前端交付分组，方便 HR 快速对照岗位需求。"
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {profile.skillGroups.map((group) => (
            <div
              key={group.title}
              className="rounded-[28px] border border-black/10 bg-white/75 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05]"
            >
              <div className="text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45">
                {group.title}
              </div>
              <div className="mt-4 space-y-2 text-sm text-black/70 dark:text-white/70">
                {group.items.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-2 dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="skill-lab" className="mx-auto mt-24 max-w-7xl scroll-mt-28">
        <SectionHeader
          eyebrow="Skill Lab"
          title="把 Agent 能力封装成可复用的招聘 Skill"
          body="不只展示“会聊天”，而是展示如何定义触发条件、输入输出、工具、Guardrails 与评估面，让面试官看到能力封装与工程判断。"
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {featuredSkills.map((skill) => (
            <a
              key={skill.slug}
              href={`/skills#${skill.slug}`}
              className="group rounded-[30px] border border-black/10 bg-white/72 p-6 shadow-[0_18px_70px_rgba(23,18,10,0.06)] transition-transform hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_18px_70px_rgba(0,0,0,0.28)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${
                    skill.status === 'live'
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'border-[#d9ba78]/35 bg-[#f1e7d2]/70 text-[#7a5b2b] dark:border-[#d9ba78]/20 dark:bg-[#d9ba78]/10 dark:text-[#f0d9a0]'
                  }`}
                >
                  {skill.kicker}
                </span>
                <ArrowUpRight className="h-4 w-4 text-black/35 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-white/35" />
              </div>

              <h3 className="mt-5 text-2xl font-semibold tracking-tight text-black dark:text-white">
                {skill.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-black/62 dark:text-white/62">
                {skill.summary}
              </p>

              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-black/45 dark:text-white/45">
                    <FileSearch className="h-3.5 w-3.5" />
                    Inputs / Outputs
                  </div>
                  <div className="mt-3 text-sm leading-relaxed text-black/70 dark:text-white/70">
                    {skill.inputs.slice(0, 2).join(' / ')} → {skill.outputs.slice(0, 2).join(' / ')}
                  </div>
                </div>
                <div className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-black/45 dark:text-white/45">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Guardrail
                  </div>
                  <div className="mt-3 text-sm leading-relaxed text-black/70 dark:text-white/70">
                    {skill.guardrails[0]}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3 text-sm text-black/55 dark:text-white/55">
                <span>{skill.version}</span>
                <span>{skill.evals[0]?.label}: {skill.evals[0]?.value}</span>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href="/skills"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-black transition-colors hover:border-black/20 hover:bg-black/4 dark:border-white/10 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/6"
          >
            查看 Skill Lab
            <ArrowRight className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={() => {
              trackEvent('jd_fit_cta_click', { source: 'skill_lab' });
              openRecruiterAssistant('jd-fit', 'skill_lab_jd_fit');
            }}
            className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 dark:bg-white dark:text-black"
          >
            <MessageSquareText className="h-4 w-4" />
            直接体验 Live Skill
          </button>
        </div>
      </section>

      <section id="cases" className="mx-auto mt-24 max-w-7xl scroll-mt-28">
        <SectionHeader
          eyebrow="精选案例"
          title="用可量化结果证明交付能力"
          body="每个案例都包含角色边界、关键指标与交付链路，便于 HR 迅速判断匹配度。"
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <a
              key={project.slug}
              href={`/projects/${project.slug}`}
              onClick={() => trackEvent('case_open', { slug: project.slug, source: 'home' })}
              className="group rounded-[30px] border border-black/10 bg-white/72 p-6 shadow-[0_18px_70px_rgba(23,18,10,0.06)] transition-transform hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_18px_70px_rgba(0,0,0,0.28)]"
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <span className="rounded-full border border-black/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-black/55 dark:border-white/10 dark:text-white/55">
                  {project.kicker}
                </span>
                <ArrowUpRight className="h-4 w-4 text-black/35 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-white/35" />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-black dark:text-white">
                {project.title}
              </h3>
              <div className="mt-2 text-sm text-black/48 dark:text-white/48">
                {project.organization} · {project.timeframe}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-black/62 dark:text-white/62">
                {project.teaser}
              </p>
              <div className="mt-6 grid gap-3">
                {project.metrics.slice(0, 3).map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <div className="text-lg font-semibold text-black dark:text-white">
                      {metric.value}
                    </div>
                    <div className="mt-1 text-sm text-black/62 dark:text-white/62">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      <section id="timeline" className="mx-auto mt-24 max-w-7xl scroll-mt-28">
        <SectionHeader
          eyebrow="经历与教育"
          title="角色、成果与荣誉快速对照"
          body="工作与教育分块展示，突出角色边界、业务结果与含金量奖项。"
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-4 text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45">
              工作经历
            </div>
            <div className="space-y-4">
              {workEntries.map((entry, index) => (
                <div
                  key={`${entry.period}-${entry.organization}`}
                  id={`timeline-work-${index}`}
                  className="rounded-[28px] border border-black/10 bg-white/75 p-6 dark:border-white/10 dark:bg-white/[0.05]"
                >
                  <div className="text-xs uppercase tracking-[0.2em] text-black/42 dark:text-white/42">
                    {entry.period}
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-black dark:text-white">
                    {entry.title}
                  </h3>
                  <div className="mt-1 text-sm font-medium text-[#7a5b2b] dark:text-[#d9ba78]">
                    {entry.organization}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-black/62 dark:text-white/62">
                    {entry.summary}
                  </p>
                  <div className="mt-5 space-y-2">
                    {entry.highlights.map((highlight) => (
                      <div
                        key={highlight}
                        className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-3 text-sm leading-relaxed text-black/78 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/78"
                      >
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45">
              教育与荣誉
            </div>
            <div className="space-y-4">
              {educationEntries.map((entry, index) => (
                <div
                  key={`${entry.period}-${entry.organization}`}
                  id={`timeline-education-${index}`}
                  className="rounded-[28px] border border-black/10 bg-white/75 p-6 dark:border-white/10 dark:bg-white/[0.05]"
                >
                  <div className="text-xs uppercase tracking-[0.2em] text-black/42 dark:text-white/42">
                    {entry.period}
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-black dark:text-white">
                    {entry.title}
                  </h3>
                  <div className="mt-1 text-sm font-medium text-[#7a5b2b] dark:text-[#d9ba78]">
                    {entry.organization}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-black/62 dark:text-white/62">
                    {entry.summary}
                  </p>
                  <div className="mt-5 space-y-2">
                    {entry.highlights.map((highlight) => (
                      <div
                        key={highlight}
                        className="rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-3 text-sm leading-relaxed text-black/78 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/78"
                      >
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="notes" className="mx-auto mt-24 max-w-7xl scroll-mt-28">
        <SectionHeader
          eyebrow="实践笔记"
          title="加分项：工程判断与方法论"
          body="保留关键笔记作为补充材料，聚焦 RAG 交付、Agent 运行时与模型评估。"
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {featuredNotes.slice(0, 2).map((note) => (
            <a
              key={note.slug}
              href={`/notes/${note.slug}`}
              onClick={() => trackEvent('note_open', { slug: note.slug, source: 'home' })}
              className="group rounded-[30px] border border-black/10 bg-white/72 p-6 transition-transform hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.05]"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#7a5b2b] dark:text-[#d9ba78]">
                  <NotebookPen className="h-3.5 w-3.5" />
                  Practice Note
                </div>
                <ArrowUpRight className="h-4 w-4 text-black/35 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-white/35" />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-black dark:text-white">
                {note.title}
              </h3>
              <div className="mt-2 text-sm text-black/48 dark:text-white/48">
                {note.publishedAt} · {note.readTime}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-black/62 dark:text-white/62">
                {note.summary}
              </p>
            </a>
          ))}
        </div>
      </section>

      <section id="contact" className="mx-auto mt-24 max-w-7xl scroll-mt-28">
        <div className="rounded-[36px] border border-black/10 bg-[linear-gradient(135deg,rgba(18,18,18,0.98),rgba(41,35,24,0.96))] px-6 py-8 text-white shadow-[0_28px_90px_rgba(16,12,6,0.24)] dark:border-white/10 md:px-10 md:py-10">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <div className="mb-3 text-xs uppercase tracking-[0.22em] text-[#d9ba78]">
                Contact & Conversion
              </div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                如果你在评估岗位匹配，这里可以直接进入下一步
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/68 md:text-lg">
                欢迎下载简历、直接沟通，或先通过 AI 助手完成一次快速筛选。
              </p>
            </div>
            <div className="md:col-span-5">
              <div className="grid gap-3">
                {profile.contactLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noreferrer' : undefined}
                    download={link.href === profile.resumeUrl}
                    onClick={() =>
                      trackEvent(link.href === profile.resumeUrl ? 'resume_download' : 'contact_click', {
                        channel: link.label,
                        source: 'contact_section',
                      })
                    }
                    className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/12"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
