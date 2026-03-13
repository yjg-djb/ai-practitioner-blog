import { lazy, Suspense, useEffect, useMemo } from 'react';
import { MotionConfig } from 'motion/react';
import Footer from './components/Footer';
import RecruiterAssistant from './components/RecruiterAssistant';
import SiteHeader from './components/SiteHeader';
import { getRouteInfo } from './content/siteContent.js';
import { applyRouteSeo } from './lib/seo';

const HomePage = lazy(() => import('./pages/HomePage'));
const SkillsPage = lazy(() => import('./pages/SkillsPage'));
const ProjectPage = lazy(() => import('./pages/ProjectPage'));
const NotePage = lazy(() => import('./pages/NotePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function PageFallback() {
  return (
    <div className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl rounded-[32px] border border-black/10 bg-white/72 p-8 text-sm text-black/62 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/62">
        正在加载页面内容...
      </div>
    </div>
  );
}

export default function App() {
  const pathname = typeof window === 'undefined' ? '/' : window.location.pathname;
  const route = useMemo(() => getRouteInfo(pathname), [pathname]);

  useEffect(() => {
    applyRouteSeo(pathname);
  }, [pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(232,223,210,0.55),transparent_36%),linear-gradient(180deg,#f8f5f0_0%,#f4f1ec_50%,#eee9e1_100%)] text-[#1b1a18] transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top,rgba(120,94,38,0.15),transparent_30%),linear-gradient(180deg,#0b0c0d_0%,#111214_52%,#0a0b0c_100%)] dark:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-black focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          跳到主要内容
        </a>

        <div
          className="pointer-events-none fixed inset-0 opacity-[0.02] mix-blend-multiply dark:opacity-[0.04]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=%220 0 160 160%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.7%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22160%22 height=%22160%22 filter=%22url(%23noise)%22 opacity=%220.8%22/%3E%3C/svg%3E")',
          }}
        />

        <div className="relative z-10">
          <SiteHeader route={route} />

          <main id="main-content">
            <Suspense fallback={<PageFallback />}>
              {route.kind === 'home' && <HomePage />}
              {route.kind === 'skills' && <SkillsPage />}
              {route.kind === 'project' && <ProjectPage slug={route.project.slug} />}
              {route.kind === 'note' && <NotePage slug={route.note.slug} />}
              {route.kind === 'notFound' && <NotFoundPage />}
            </Suspense>
          </main>

          <Footer />
          <RecruiterAssistant />
        </div>
      </div>
    </MotionConfig>
  );
}
