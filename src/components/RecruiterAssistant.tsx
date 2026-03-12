import { Bot, Sparkles } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { profile } from '../content/siteContent.js';
import { OPEN_ASSISTANT_EVENT } from '../lib/assistant';
import { trackEvent } from '../lib/analytics';

const RecruiterAssistantPanel = lazy(() => import('./RecruiterAssistantPanel'));

export default function RecruiterAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRenderPanel, setShouldRenderPanel] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const preloadPanel = () => {
    void import('./RecruiterAssistantPanel');
  };

  const openAssistant = (source: string) => {
    setShouldRenderPanel(true);
    setIsOpen(true);
    trackEvent('ai_open', { source });
  };

  const closeAssistant = () => {
    setIsOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    const handleExternalOpen = () => openAssistant('page_cta');

    window.addEventListener(OPEN_ASSISTANT_EVENT, handleExternalOpen);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, handleExternalOpen);
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex max-w-sm flex-col items-end gap-3">
        {!isOpen && (
          <button
            type="button"
            onMouseEnter={preloadPanel}
            onFocus={preloadPanel}
            onClick={() => openAssistant('floating_launcher')}
            className="pointer-events-auto max-w-[18rem] rounded-3xl border border-black/10 bg-white/90 px-4 py-3 text-left shadow-[0_24px_80px_rgba(24,24,24,0.12)] backdrop-blur-xl transition-transform hover:-translate-y-0.5 dark:border-white/10 dark:bg-[rgba(18,19,21,0.92)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.38)]"
          >
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#7a5b2b] dark:text-[#d9ba78]">
              <Sparkles className="h-3.5 w-3.5" />
              Recruiter Mode
            </div>
            <div className="text-sm font-medium text-black dark:text-white">
              HR 30 秒判断匹配度
            </div>
            <div className="mt-1 text-sm leading-relaxed text-black/65 dark:text-white/65">
              可直接问岗位匹配、项目证据或交付能力。
            </div>
          </button>
        )}

        <button
          ref={triggerRef}
          type="button"
          onMouseEnter={preloadPanel}
          onFocus={preloadPanel}
          onClick={() => (isOpen ? closeAssistant() : openAssistant('floating_button'))}
          className="pointer-events-auto inline-flex h-16 w-16 items-center justify-center rounded-full border border-black/10 bg-black text-white shadow-[0_24px_80px_rgba(24,24,24,0.18)] transition-transform hover:scale-[1.03] dark:border-white/10 dark:bg-white dark:text-black"
          aria-expanded={isOpen}
          aria-controls="recruiter-assistant-panel"
          aria-label={isOpen ? '关闭招聘场景 AI 助手' : '打开招聘场景 AI 助手'}
        >
          <Bot className="h-7 w-7" />
        </button>
      </div>

      {shouldRenderPanel && (
        <Suspense
          fallback={
            <div className="fixed bottom-28 right-6 z-50 w-[min(26rem,calc(100vw-1.5rem))] rounded-[28px] border border-black/10 bg-white/95 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(15,15,17,0.96)]">
              <div className="text-sm font-medium text-black dark:text-white">
                正在加载招聘场景 AI 助手
              </div>
              <div className="mt-2 text-sm text-black/60 dark:text-white/60">
                {profile.quickPrompts[0].label} · {profile.quickPrompts[1].label}
              </div>
            </div>
          }
        >
          {isOpen && (
            <RecruiterAssistantPanel
              id="recruiter-assistant-panel"
              onClose={closeAssistant}
              triggerRef={triggerRef}
            />
          )}
        </Suspense>
      )}
    </>
  );
}
