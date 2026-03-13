import { type PointerEvent as ReactPointerEvent, type RefObject, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, MoveDiagonal2, RotateCcw, Send, Sparkles, X } from 'lucide-react';
import RecruiterJdFitView from './RecruiterJdFitView';
import RecruiterReportMessage from './RecruiterReportMessage';
import { profile } from '../content/siteContent.js';
import { trackEvent, trackFirstAiQuestion } from '../lib/analytics';
import {
  clearStoredRecruiterPanelSize,
  clampRecruiterPanelSize,
  getDefaultRecruiterPanelSize,
  getInitialRecruiterPanelSize,
  type RecruiterPanelSize,
  writeStoredRecruiterPanelSize,
} from '../lib/recruiterPanelSize';
import type { RecruiterAssistantMode } from '../lib/recruiter';
import { CHAT_INITIAL_MESSAGE, CHAT_SYSTEM_PROMPT } from '../prompts/chatPromptTemplate';

type RecruiterAssistantPanelProps = {
  id: string;
  initialMode: RecruiterAssistantMode;
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

type ResizeSession = {
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
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
  initialMode,
  onClose,
  triggerRef,
}: RecruiterAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    createMessage('assistant-initial', 'assistant', CHAT_INITIAL_MESSAGE, 'done'),
  ]);
  const [activeView, setActiveView] = useState<RecruiterAssistantMode>(initialMode);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(fallbackModel);
  const [panelSize, setPanelSize] = useState<RecruiterPanelSize>(() => getInitialRecruiterPanelSize());
  const [defaultPanelSize, setDefaultPanelSize] = useState<RecruiterPanelSize>(() => getDefaultRecruiterPanelSize());
  const [isResizing, setIsResizing] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageCounterRef = useRef(0);
  const activeViewRef = useRef<RecruiterAssistantMode>(initialMode);
  const panelSizeRef = useRef(panelSize);
  const resizeSessionRef = useRef<ResizeSession | null>(null);
  const hasUserMessages = messages.some((message) => message.role === 'user');
  const isDefaultSize =
    panelSize.width === defaultPanelSize.width && panelSize.height === defaultPanelSize.height;

  useEffect(() => {
    setActiveView(initialMode);
  }, [initialMode]);

  useEffect(() => {
    activeViewRef.current = activeView;

    if (activeView === 'chat') {
      inputRef.current?.focus();
    }
  }, [activeView]);

  useEffect(() => {
    if (activeView === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [activeView, isLoading, messages]);

  useEffect(() => {
    panelSizeRef.current = panelSize;
  }, [panelSize]);

  useEffect(() => {
    const syncPanelSize = () => {
      const nextDefaultSize = getDefaultRecruiterPanelSize();
      setDefaultPanelSize(nextDefaultSize);
      setPanelSize((currentSize) => clampRecruiterPanelSize(currentSize));
    };

    syncPanelSize();
    window.addEventListener('resize', syncPanelSize);
    window.visualViewport?.addEventListener('resize', syncPanelSize);

    return () => {
      window.removeEventListener('resize', syncPanelSize);
      window.visualViewport?.removeEventListener('resize', syncPanelSize);
    };
  }, []);

  useEffect(() => {
    if (!isResizing) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const resizeSession = resizeSessionRef.current;

      if (!resizeSession) {
        return;
      }

      const nextPanelSize = clampRecruiterPanelSize({
        width: resizeSession.startWidth + (resizeSession.startX - event.clientX),
        height: resizeSession.startHeight + (resizeSession.startY - event.clientY),
      });

      setPanelSize((currentSize) => {
        if (
          currentSize.width === nextPanelSize.width &&
          currentSize.height === nextPanelSize.height
        ) {
          return currentSize;
        }

        return nextPanelSize;
      });
    };

    const finishResizing = () => {
      const finalPanelSize = panelSizeRef.current;

      writeStoredRecruiterPanelSize(finalPanelSize);
      trackEvent('ai_panel_resize', {
        height: finalPanelSize.height,
        view: activeViewRef.current,
        width: finalPanelSize.width,
      });
      resizeSessionRef.current = null;
      setIsResizing(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', finishResizing);
    window.addEventListener('pointercancel', finishResizing);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', finishResizing);
      window.removeEventListener('pointercancel', finishResizing);
    };
  }, [isResizing]);

  useEffect(() => {
    document.body.classList.toggle('recruiter-resizing', isResizing);

    return () => {
      document.body.classList.remove('recruiter-resizing');
    };
  }, [isResizing]);

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

  const switchView = (nextView: RecruiterAssistantMode, source: string) => {
    setActiveView(nextView);
    trackEvent('ai_view_switch', {
      source,
      view: nextView,
    });
  };

  const resetPanelSize = () => {
    const nextDefaultSize = getDefaultRecruiterPanelSize();

    clearStoredRecruiterPanelSize();
    writeStoredRecruiterPanelSize(nextDefaultSize);
    setDefaultPanelSize(nextDefaultSize);
    setPanelSize(nextDefaultSize);
    trackEvent('ai_panel_resize_reset', {
      height: nextDefaultSize.height,
      view: activeViewRef.current,
      width: nextDefaultSize.width,
    });
  };

  const startResizing = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    resizeSessionRef.current = {
      startHeight: panelSizeRef.current.height,
      startWidth: panelSizeRef.current.width,
      startX: event.clientX,
      startY: event.clientY,
    };
    setIsResizing(true);
    event.currentTarget.setPointerCapture(event.pointerId);
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
    trackEvent('ai_submit', { model: selectedModel, source });
    trackFirstAiQuestion({ model: selectedModel, source });

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
              content: message.content,
              role: message.role,
            })),
          ],
          stream: true,
          temperature: 0.5,
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

      if (activeViewRef.current === 'chat') {
        inputRef.current?.focus();
      }
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
        className={`fixed bottom-3 right-3 z-50 md:bottom-6 md:right-6 ${
          isResizing ? '' : 'transition-[width,height] duration-200 ease-out'
        }`}
        style={{ height: `${panelSize.height}px`, width: `${panelSize.width}px` }}
      >
        <div className="flex h-full w-full flex-col overflow-hidden rounded-[30px] border border-black/10 bg-white/95 shadow-[0_24px_80px_rgba(24,24,24,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-[rgba(14,15,17,0.96)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
          <div className="border-b border-black/10 bg-black/[0.03] px-4 py-3 dark:border-white/10 dark:bg-white/[0.03] md:px-5 md:py-4">
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
                  聚焦岗位匹配、项目证据、风险项与 JD 匹配报告。
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!isDefaultSize && (
                  <button
                    type="button"
                    onClick={resetPanelSize}
                    className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-2 text-[11px] font-medium text-black/70 transition-colors hover:bg-black/5 hover:text-black dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label="恢复默认尺寸"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    恢复尺寸
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-black/65 transition-colors hover:bg-black/5 hover:text-black dark:border-white/10 dark:text-white/65 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label="关闭招聘场景 AI 助手"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 md:mt-4">
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

          <div className="border-b border-black/10 px-4 py-3 dark:border-white/10">
            <div className="flex rounded-full border border-black/10 bg-black/[0.03] p-1 dark:border-white/10 dark:bg-white/[0.04]">
              <button
                type="button"
                onClick={() => switchView('chat', 'panel_tab')}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  activeView === 'chat'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-black/62 hover:bg-black/[0.05] dark:text-white/62 dark:hover:bg-white/[0.08]'
                }`}
              >
                聊天问答
              </button>
              <button
                type="button"
                onClick={() => switchView('jd-fit', 'panel_tab')}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  activeView === 'jd-fit'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-black/62 hover:bg-black/[0.05] dark:text-white/62 dark:hover:bg-white/[0.08]'
                }`}
              >
                JD 匹配
              </button>
            </div>
          </div>

          {activeView === 'chat' ? (
            <>
              <div className={`border-b border-black/10 px-4 dark:border-white/10 ${hasUserMessages ? 'py-3' : 'py-4'}`}>
                <div className="mb-2 text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45">
                  {hasUserMessages ? '快捷追问' : 'HR 快捷入口'}
                </div>
                <div className={`report-chip-row ${hasUserMessages ? 'no-scrollbar flex-nowrap overflow-x-auto pb-1' : 'flex-wrap'}`}>
                  <button
                    type="button"
                    onClick={() => switchView('jd-fit', 'quick_entry')}
                    className="rounded-full border border-[#d9ba78]/35 bg-[#f1e7d2]/70 px-3 py-2 text-left text-sm leading-snug text-[#7a5b2b] transition-colors hover:border-[#d9ba78]/55 hover:bg-[#efe0bf] dark:border-[#d9ba78]/20 dark:bg-[#d9ba78]/10 dark:text-[#f0d9a0] dark:hover:bg-[#d9ba78]/16"
                  >
                    JD 匹配报告
                  </button>
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

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-4 pb-6 md:px-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'user' ? (
                      <div className="max-w-[88%] rounded-[1.4rem] bg-black px-4 py-3 text-sm leading-relaxed text-white shadow-sm dark:bg-white dark:text-black md:max-w-[80%]">
                        <span className="whitespace-pre-wrap break-words">{message.content}</span>
                      </div>
                    ) : (
                      <div className="flex w-full max-w-full gap-2 sm:gap-2.5">
                        <div className="mt-1 hidden shrink-0 sm:block">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
                            <Bot className="h-3.5 w-3.5" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <RecruiterReportMessage content={message.content} status={message.status} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-black/10 bg-black/[0.03] px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] dark:border-white/10 dark:bg-white/[0.03] md:py-4">
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
            </>
          ) : (
            <RecruiterJdFitView
              selectedModel={selectedModel}
              onOpenChat={() => switchView('chat', 'jd_fit_back_to_chat')}
            />
          )}
        </div>

        <button
          type="button"
          onPointerDown={startResizing}
          className="recruiter-panel-resize-handle"
          aria-label="调整助手窗口大小"
        >
          <MoveDiagonal2 className="h-4 w-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
