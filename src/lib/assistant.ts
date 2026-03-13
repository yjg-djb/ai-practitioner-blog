import type { RecruiterAssistantMode } from './recruiter';

export const OPEN_ASSISTANT_EVENT = 'portfolio:open-assistant';

export type OpenRecruiterAssistantDetail = {
  mode?: RecruiterAssistantMode;
  source?: string;
};

export function openRecruiterAssistant(mode: RecruiterAssistantMode = 'chat', source = 'page_cta') {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<OpenRecruiterAssistantDetail>(OPEN_ASSISTANT_EVENT, {
      detail: { mode, source },
    }),
  );
}
