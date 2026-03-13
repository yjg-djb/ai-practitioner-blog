import { Bot, Sparkles } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { profile } from '../content/siteContent.js';
import { OPEN_ASSISTANT_EVENT, type OpenRecruiterAssistantDetail } from '../lib/assistant';
import { trackEvent } from '../lib/analytics';
import { getInitialRecruiterPanelSize } from '../lib/recruiterPanelSize';
import type { RecruiterAssistantMode } from '../lib/recruiter';

const RecruiterAssistantPanel = lazy(() => import('./RecruiterAssistantPanel'));

export default function RecruiterAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRenderPanel, setShouldRenderPanel] = useState(false);
  const [panelMode, setPanelMode] = useState<RecruiterAssistantMode>('chat');
  const [fallbackSize, setFallbackSize] = useState(() => getInitialRecruiterPanelSize());
  const triggerRef = useRef<HTMLButtonElement>(null);

  const preloadPanel = () => {
    void import('./RecruiterAssistantPanel');
  };

  const openAssistant = (source: string, mode: RecruiterAssistantMode = 'chat') => {
    setShouldRenderPanel(true);
    setPanelMode(mode);
    setIsOpen(true);
    trackEvent('ai_open', { source, mode });
  };

  const closeAssistant = () => {
    setIsOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    const handleExternalOpen = (event: Event) => {
      const detail =
        event instanceof CustomEvent ? (event.detail as OpenRecruiterAssistantDetail | undefined) : undefined;

      openAssistant(detail?.source || 'page_cta', detail?.mode || 'chat');
    };

    window.addEventListener(OPEN_ASSISTANT_EVENT, handleExternalOpen);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, handleExternalOpen);
  }, []);

  useEffect(() => {
    const syncFallbackSize = () => {
      setFallbackSize(getInitialRecruiterPanelSize());
    };

    syncFallbackSize();
    window.addEventListener('resize', syncFallbackSize);
    window.visualViewport?.addEventListener('resize', syncFallbackSize);

    return () => {
      window.removeEventListener('resize', syncFallbackSize);
      window.visualViewport?.removeEventListener('resize', syncFallbackSize);
    };
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
              可直接问岗位匹配，或粘贴 JD 生成结构化报告。
            </div>
          </button>
        )}

        {!isOpen && (
          <button
            ref={triggerRef}
            type="button"
            onMouseEnter={preloadPanel}
            onFocus={preloadPanel}
            onClick={() => openAssistant('floating_button')}
            className="pointer-events-auto inline-flex h-16 w-16 items-center justify-center rounded-full border border-black/10 bg-black text-white shadow-[0_24px_80px_rgba(24,24,24,0.18)] transition-transform hover:scale-[1.03] dark:border-white/10 dark:bg-white dark:text-black"
            aria-expanded={isOpen}
            aria-controls="recruiter-assistant-panel"
            aria-label="打开招聘场景 AI 助手"
          >
            <Bot className="h-7 w-7" />
          </button>
        )}
      </div>

      {shouldRenderPanel && (
        <Suspense
          fallback={
            <div
              className="fixed bottom-3 right-3 z-50 rounded-[28px] border border-black/10 bg-white/95 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(15,15,17,0.96)] md:bottom-6 md:right-6"
              style={{ width: `${fallbackSize.width}px` }}
            >
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
              initialMode={panelMode}
              onClose={closeAssistant}
              triggerRef={triggerRef}
            />
          )}
        </Suspense>
      )}
    </>
  );
}
