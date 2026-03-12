declare global {
  interface Window {
    __portfolioAnalytics?: Array<{
      name: string;
      payload: Record<string, unknown>;
      timestamp: string;
    }>;
    __portfolioFirstAiQuestionTracked?: boolean;
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    plausible?: (eventName: string, options?: { props?: Record<string, unknown> }) => void;
  }
}

export function trackEvent(name: string, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  const entry = {
    name,
    payload,
    timestamp: new Date().toISOString(),
  };

  window.__portfolioAnalytics = window.__portfolioAnalytics || [];
  window.__portfolioAnalytics.push(entry);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...payload });

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, payload);
  }

  if (typeof window.plausible === 'function') {
    window.plausible(name, { props: payload });
  }
}

export function trackFirstAiQuestion(payload: Record<string, unknown>) {
  if (typeof window === 'undefined' || window.__portfolioFirstAiQuestionTracked) {
    return;
  }

  window.__portfolioFirstAiQuestionTracked = true;
  trackEvent('ai_first_question', payload);
}
