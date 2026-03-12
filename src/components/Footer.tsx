import { profile } from '../content/siteContent.js';
import { trackEvent } from '../lib/analytics';

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white/50 px-6 py-8 backdrop-blur-sm dark:border-white/10 dark:bg-black/20 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-black/60 dark:text-white/60 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-medium text-black dark:text-white">
            {profile.name} · {profile.role}
          </div>
          <div>面向招聘的 AI 工程作品集，强调交付闭环与量化结果。</div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent('contact_click', { channel: 'github_footer' })}
            className="transition-colors hover:text-black dark:hover:text-white"
          >
            GitHub
          </a>
          <a
            href={`mailto:${profile.email}`}
            onClick={() => trackEvent('contact_click', { channel: 'email_footer' })}
            className="transition-colors hover:text-black dark:hover:text-white"
          >
            {profile.email}
          </a>
          <a
            href={`tel:${profile.phone}`}
            onClick={() => trackEvent('contact_click', { channel: 'phone_footer' })}
            className="transition-colors hover:text-black dark:hover:text-white"
          >
            {profile.phone}
          </a>
        </div>
      </div>
    </footer>
  );
}
