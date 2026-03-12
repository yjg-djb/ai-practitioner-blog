import {
  buildRecruiterInitialMessage,
  buildRecruiterSystemPrompt,
} from '../content/siteContent.js';

export const CHAT_SYSTEM_PROMPT = buildRecruiterSystemPrompt();

export const CHAT_INITIAL_MESSAGE = buildRecruiterInitialMessage();
