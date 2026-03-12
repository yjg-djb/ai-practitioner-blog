export const OPEN_ASSISTANT_EVENT = 'portfolio:open-assistant';

export function openRecruiterAssistant() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(OPEN_ASSISTANT_EVENT));
}
