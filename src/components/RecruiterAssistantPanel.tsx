import { type RefObject, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, Loader2, Send, Sparkles, User, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { profile } from '../content/siteContent.js';
import { trackEvent, trackFirstAiQuestion } from '../lib/analytics';
import { CHAT_INITIAL_MESSAGE, CHAT_SYSTEM_PROMPT } from '../prompts/chatPromptTemplate';

type RecruiterAssistantPanelProps = {
  id: string;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

type MessageRole = 'user' | 'assistant';
type MessageStatus = 'done' | 'streaming' | 'error';

type Message = {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
};

type ChatCompletionContent = string | Array<{ type?: string; text?: string }>;

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: ChatCompletionContent;
    };
  }>;
  error?: {
    message?: string;
  };
};

type ChatCompletionChunk = {
  choices?: Array<{
    delta?: {
      content?: ChatCompletionContent;
    };
  }>;
  error?: {
    message?: string;
  };
};

const DEFAULT_MODELS = [
  'qwen3.5-plus',
  'qwen3-max-2026-01-23',
  'qwen3-coder-next',
  'qwen3-coder-plus',
  'glm-5',
  'glm-4.7',
  'kimi-k2.5',
  'MiniMax-M2.5',
];

const STREAM_INTERRUPTED_SUFFIX = '\n\n[输出中断]';

const configuredModels = (import.meta.env.VITE_OPENAI_AVAILABLE_MODELS || '')
  .split(',')
  .map((model) => model.trim())
  .filter(Boolean);

const availableModels = configuredModels.length > 0 ? configuredModels : DEFAULT_MODELS;
const configuredDefaultModel = (import.meta.env.VITE_OPENAI_MODEL || '').trim();
const fallbackModel = availableModels.includes(configuredDefaultModel)
  ? configuredDefaultModel
  : availableModels[0];
const markdownComponents = {
  a: ({ children, ...props }: any) => (
    <a {...props} target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
  code: ({ inline, className, children, ...props }: any) => {
    const codeClassName = `${inline ? 'markdown-inline-code' : 'markdown-code'}${className ? ` ${className}` : ''}`;

    return (
      <code className={codeClassName} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: any) => (
    <pre className="markdown-pre" {...props}>
      {children}
    </pre>
  ),
};

const apiBasePath = (import.meta.env.VITE_OPENAI_API_BASE || '/api/openai').trim().replace(/\/+$/, '');

function extractTextContent(content: ChatCompletionContent | undefined, trim = true): string {
  if (typeof content === 'string') {
    return trim ? content.trim() : content;
  }

  if (Array.isArray(content)) {
    const combined = content
      .map((part) => (typeof part?.text === 'string' ? part.text : ''))
      .join('');

    return trim ? combined.trim() : combined;
  }

  return '';
}

function extractAssistantText(payload: ChatCompletionResponse): string {
  return extractTextContent(payload.choices?.[0]?.message?.content);
}

function extractDeltaText(payload: ChatCompletionChunk): string {
  return extractTextContent(payload.choices?.[0]?.delta?.content, false);
}

function splitSseEvents(buffer: string, flush = false): { events: string[]; remaining: string } {
  const normalized = buffer.replace(/\r\n/g, '\n');
  const parts = normalized.split('\n\n');

  if (flush) {
    return {
      events: parts.map((part) => part.trim()).filter(Boolean),
      remaining: '',
    };
  }

  return {
    events: parts
      .slice(0, -1)
      .map((part) => part.trim())
      .filter(Boolean),
    remaining: parts.at(-1) ?? '',
  };
}

function extractSseData(event: string): string | null {
  const dataLines = event
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart());

  if (dataLines.length === 0) {
    return null;
  }

  return dataLines.join('\n').trim();
}

async function readErrorMessage(response: Response): Promise<string> {
  const contentType = (response.headers.get('content-type') || '').toLowerCase();

  if (contentType.includes('application/json')) {
    const payload = (await response.json()) as ChatCompletionResponse | ChatCompletionChunk;
    return payload.error?.message || `请求失败：${response.status}`;
  }

  const text = await response.text();
  return text.trim() || `请求失败：${response.status}`;
}

function createMessage(id: string, role: MessageRole, content: string, status: MessageStatus): Message {
  return { id, role, content, status };
}

function isStreamResponse(response: Response): boolean {
  return (response.headers.get('content-type') || '').toLowerCase().includes('text/event-stream');
}

export default function RecruiterAssistantPanel({
  id,
  onClose,
  triggerRef,
}: RecruiterAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    createMessage('assistant-initial', 'assistant', CHAT_INITIAL_MESSAGE, 'done'),
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(fallbackModel);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageCounterRef = useRef(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) {
        return;
      }

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, triggerRef]);

  const createMessageId = () => {
    messageCounterRef.current += 1;
    return `message-${messageCounterRef.current}`;
  };

  const updateMessage = (messageId: string, updater: (message: Message) => Message) => {
    setMessages((prev) => prev.map((message) => (message.id === messageId ? updater(message) : message)));
  };

  const sendPrompt = async (prompt: string, source: 'input' | 'quick_prompt') => {
    if (!prompt.trim() || isLoading) {
      return;
    }

    const userContent = prompt.trim();
    const userMessage = createMessage(createMessageId(), 'user', userContent, 'done');
    const assistantMessage = createMessage(createMessageId(), 'assistant', '', 'streaming');
    const conversation = [...messages, userMessage];

    setInput('');
    setMessages([...conversation, assistantMessage]);
    setIsLoading(true);
    trackEvent('ai_submit', { source, model: selectedModel });
    trackFirstAiQuestion({ source, model: selectedModel });

    let assistantText = '';
    let receivedAnyToken = false;

    try {
      const response = await fetch(`${apiBasePath}/chat/completions`, {
        method: 'POST',
        headers: {
          Accept: 'text/event-stream, application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: CHAT_SYSTEM_PROMPT },
            ...conversation.map((message) => ({
              role: message.role,
              content: message.content,
            })),
          ],
          temperature: 0.5,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      if (isStreamResponse(response) && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let streamFinished = false;

        const applyAssistantText = (nextText: string, status: MessageStatus) => {
          updateMessage(assistantMessage.id, (message) => ({
            ...message,
            content: nextText,
            status,
          }));
        };

        const processEvents = (events: string[]) => {
          for (const event of events) {
            const data = extractSseData(event);

            if (!data) {
              continue;
            }

            if (data === '[DONE]') {
              streamFinished = true;
              break;
            }

            const payload = JSON.parse(data) as ChatCompletionChunk;

            if (payload.error?.message) {
              throw new Error(payload.error.message);
            }

            const deltaText = extractDeltaText(payload);

            if (!deltaText) {
              continue;
            }

            assistantText += deltaText;
            receivedAnyToken = true;
            applyAssistantText(assistantText, 'streaming');
          }
        };

        while (!streamFinished) {
          const { done, value } = await reader.read();

          buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

          const parsed = splitSseEvents(buffer, done);
          buffer = parsed.remaining;
          processEvents(parsed.events);

          if (done) {
            break;
          }
        }
      } else {
        const payload = (await response.json()) as ChatCompletionResponse;
        assistantText = extractAssistantText(payload);
        receivedAnyToken = assistantText.length > 0;
      }

      const finalText = assistantText || '模型没有返回可显示的内容。';
      updateMessage(assistantMessage.id, (message) => ({
        ...message,
        content: finalText,
        status: 'done',
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';

      updateMessage(assistantMessage.id, (currentMessage) => {
        if (!receivedAnyToken) {
          return {
            ...currentMessage,
            content: `调用模型服务失败：${message}`,
            status: 'error',
          };
        }

        return {
          ...currentMessage,
          content: `${assistantText}${STREAM_INTERRUPTED_SUFFIX}`,
          status: 'error',
        };
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        id={id}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recruiter-assistant-title"
        className="fixed bottom-28 right-6 z-50 flex h-[min(44rem,calc(100vh-8rem))] w-[min(27rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[30px] border border-black/10 bg-white/95 shadow-[0_24px_80px_rgba(24,24,24,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-[rgba(14,15,17,0.96)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.42)]"
      >
        <div className="border-b border-black/10 bg-black/[0.03] px-5 py-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#7a5b2b] dark:text-[#d9ba78]">
                <Sparkles className="h-3.5 w-3.5" />
                Recruiter Mode
              </div>
              <h2 id="recruiter-assistant-title" className="text-base font-medium text-black dark:text-white">
                招聘场景 AI 助手
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-black/60 dark:text-white/60">
                聚焦岗位匹配、项目证据与指标口径。
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-black/65 transition-colors hover:bg-black/5 hover:text-black dark:border-white/10 dark:text-white/65 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="关闭招聘场景 AI 助手"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="shrink-0 text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45">
              Model
            </span>
            <select
              value={selectedModel}
              onChange={(event) => setSelectedModel(event.target.value)}
              className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none transition-colors focus:border-black/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-white/20"
            >
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-b border-black/10 px-4 py-4 dark:border-white/10">
          <div className="mb-2 text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45">HR 快捷问题</div>
          <div className="flex flex-wrap gap-2">
            {profile.quickPrompts.map((quickPrompt) => (
              <button
                key={quickPrompt.id}
                type="button"
                disabled={isLoading}
                onClick={() => {
                  trackEvent('ai_quick_prompt', { promptId: quickPrompt.id });
                  void sendPrompt(quickPrompt.prompt, 'quick_prompt');
                }}
                className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-2 text-left text-sm leading-snug text-black transition-colors hover:border-black/20 hover:bg-black/[0.05] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:border-white/20 dark:hover:bg-white/[0.08]"
              >
                {quickPrompt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[88%] gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className="mt-1 shrink-0">
                  {message.role === 'user' ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ece7db] text-black dark:bg-white/10 dark:text-white">
                      <User className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div
                  className={`rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'rounded-tr-md bg-black text-white dark:bg-white dark:text-black'
                      : 'rounded-tl-md border border-black/8 bg-black/[0.04] text-black/90 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/90'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <ReactMarkdown
                      className="markdown"
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <span className="whitespace-pre-wrap break-words">{message.content}</span>
                  )}
                  {message.role === 'assistant' && message.status === 'streaming' && (
                    <span className="ml-1 inline-flex items-center gap-1 align-middle text-black/45 dark:text-white/45">
                      {message.content ? (
                        <span className="inline-block h-4 w-px animate-pulse bg-black/45 dark:bg-white/45" />
                      ) : (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span className="text-xs">正在整理回答...</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-black/10 bg-black/[0.03] px-4 py-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-2 text-xs text-black/45 dark:text-white/45">
            当前模型：{selectedModel}
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void sendPrompt(input, 'input');
                }
              }}
              placeholder="例如：这位候选人最适合什么岗位？"
              className="flex-1 rounded-full border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-white/20"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => void sendPrompt(input, 'input')}
              disabled={!input.trim() || isLoading}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-55 dark:bg-white dark:text-black"
              aria-label="发送问题"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
