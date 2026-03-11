import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Loader2, User } from 'lucide-react';
import { CHAT_INITIAL_MESSAGE, CHAT_SYSTEM_PROMPT } from '../prompts/chatPromptTemplate';

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
    finish_reason?: string | null;
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

function createMessage(id: string, role: MessageRole, content: string, status: MessageStatus): Message {
  return { id, role, content, status };
}

function isStreamResponse(response: Response): boolean {
  return (response.headers.get('content-type') || '').toLowerCase().includes('text/event-stream');
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

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    createMessage('assistant-initial', 'assistant', CHAT_INITIAL_MESSAGE, 'done'),
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(fallbackModel);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageCounterRef = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const createMessageId = () => {
    messageCounterRef.current += 1;
    return `message-${messageCounterRef.current}`;
  };

  const updateMessage = (messageId: string, updater: (message: Message) => Message) => {
    setMessages((prev) => prev.map((message) => (message.id === messageId ? updater(message) : message)));
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) {
      return;
    }

    const userMessage = createMessage(createMessageId(), 'user', input.trim(), 'done');
    const assistantMessage = createMessage(createMessageId(), 'assistant', '', 'streaming');
    const conversation = [...messages, userMessage];

    setInput('');
    setMessages([...conversation, assistantMessage]);
    setIsLoading(true);

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
          temperature: 0.7,
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
    }
  };

  return (
    <>
      <motion.div
        className="fixed bottom-8 right-8 z-50 flex items-center gap-4"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              className="hidden cursor-pointer whitespace-nowrap rounded-2xl bg-black px-4 py-2.5 text-sm font-medium text-white shadow-2xl dark:bg-white dark:text-black sm:block"
              onClick={() => setIsOpen(true)}
            >
              想了解杨金果？，点击这里问我！
            </motion.div>
          )}
        </AnimatePresence>

        <button
          className="relative flex items-center justify-center rounded-full bg-black p-4 text-white shadow-2xl transition-transform hover:scale-110 dark:bg-white dark:text-black"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="打开 AI 助手"
        >
          <Bot className="h-6 w-6" />
          <div className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-green-500" />
        </button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-8 bottom-28 z-50 flex h-[520px] max-h-[80vh] w-80 flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111] sm:w-[420px]"
          >
            <div className="border-b border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-black/5 p-2 dark:bg-white/10">
                      <Bot className="h-5 w-5 text-black dark:text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-black dark:text-white">AI 助手</h3>
                      <p className="text-xs text-black/50 dark:text-white/50">OpenAI 兼容接口（本地代理）</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-black/60 transition-colors hover:bg-black/5 hover:text-black dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label="关闭 AI 助手"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="shrink-0 text-xs text-black/50 dark:text-white/50">模型</span>
                <select
                  value={selectedModel}
                  onChange={(event) => setSelectedModel(event.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none transition-colors focus:border-black/30 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-white/30"
                >
                  {availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[85%] gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="mt-1 shrink-0">
                      {message.role === 'user' ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
                          <User className="h-4 w-4 text-black/70 dark:text-white/70" />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div
                      className={`rounded-2xl p-3 text-sm leading-relaxed ${
                        message.role === 'user'
                          ? 'rounded-tr-sm bg-black text-white dark:bg-white dark:text-black'
                          : 'rounded-tl-sm bg-black/5 text-black/90 dark:bg-white/10 dark:text-white/90'
                      }`}
                    >
                      <span className="whitespace-pre-wrap break-words">{message.content}</span>
                      {message.role === 'assistant' && message.status === 'streaming' && (
                        <span className="ml-1 inline-flex items-center gap-1 align-middle text-black/45 dark:text-white/45">
                          {message.content ? (
                            <span className="inline-block h-4 w-px animate-pulse bg-black/45 dark:bg-white/45" />
                          ) : (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span className="text-xs">模型思考中...</span>
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

            <div className="border-t border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="mb-2 text-xs text-black/45 dark:text-white/45">
                当前模型：{selectedModel}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && handleSend()}
                  placeholder="问我关于杨金果的问题..."
                  className="flex-1 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm text-black transition-colors focus:border-black/30 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-white/30"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="rounded-full bg-black p-2.5 text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
                  aria-label="发送消息"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
