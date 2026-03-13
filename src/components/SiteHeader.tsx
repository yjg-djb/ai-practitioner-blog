import { Menu, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { RouteInfo } from '../content/types';
import { profile } from '../content/siteContent.js';
import { trackEvent } from '../lib/analytics';
import ThemeToggle from './ThemeToggle';

type SiteHeaderProps = {
  route: RouteInfo;
};

export default function SiteHeader({ route }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isHome = route.kind === 'home';

  const navItems = useMemo(
    () =>
      [
        { label: '案例', href: isHome ? '#cases' : '/#cases' },
        { label: '能力', href: isHome ? '#skills' : '/#skills' },
        { label: 'Skill Lab', href: route.kind === 'skills' ? '#skill-catalog' : '/skills' },
        { label: '经历', href: isHome ? '#timeline' : '/#timeline' },
        { label: '笔记', href: isHome ? '#notes' : '/#notes' },
        { label: '联系', href: isHome ? '#contact' : '/#contact' },
      ],
    [isHome, route.kind],
  );

  useEffect(() => {
    setIsMenuOpen(false);
  }, [route.pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[rgba(248,246,243,0.85)] backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(9,10,11,0.82)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-12">
        <a href="/" className="min-w-0">
          <div className="text-xs uppercase tracking-[0.24em] text-black/45 dark:text-white/45">
            Recruiter-First Portfolio
          </div>
          <div className="truncate text-base font-medium text-black dark:text-white">
            {profile.name}
          </div>
        </a>

        <nav className="hidden items-center gap-6 text-sm text-black/70 dark:text-white/70 lg:flex">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="transition-colors hover:text-black dark:hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={profile.resumeUrl}
            onClick={() => trackEvent('resume_download', { source: 'header' })}
            className="inline-flex items-center rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black transition-colors hover:border-black/20 hover:bg-black hover:text-white dark:border-white/10 dark:text-white dark:hover:border-white/20 dark:hover:bg-white dark:hover:text-black"
          >
            下载简历
          </a>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsMenuOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/70 text-black backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:text-white"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? '关闭导航菜单' : '打开导航菜单'}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-black/10 px-6 py-5 dark:border-white/10 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-base text-black/80 transition-colors hover:text-black dark:text-white/80 dark:hover:text-white"
              >
                {item.label}
              </a>
            ))}
            <a
              href={profile.resumeUrl}
              onClick={() => {
                trackEvent('resume_download', { source: 'mobile_menu' });
                setIsMenuOpen(false);
              }}
              className="mt-2 inline-flex w-fit items-center rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black dark:border-white/10 dark:text-white"
            >
              下载简历
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
