import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Loader2, User } from 'lucide-react';
import { CHAT_INITIAL_MESSAGE, CHAT_SYSTEM_PROMPT } from '../prompts/chatPromptTemplate';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
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

function extractAssistantText(payload: ChatCompletionResponse): string {
  const content = payload.choices?.[0]?.message?.content;

  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part?.text === 'string' ? part.text : ''))
      .join('\n')
      .trim();
  }

  return '';
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: CHAT_INITIAL_MESSAGE },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(fallbackModel);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) {
      return;
    }

    const userMessage = input.trim();
    const conversation = [...messages, { role: 'user' as const, content: userMessage }];

    setInput('');
    setMessages(conversation);
    setIsLoading(true);

    try {
      const response = await fetch(`${apiBasePath}/chat/completions`, {
        method: 'POST',
        headers: {
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
          stream: false,
        }),
      });

      const payload = (await response.json()) as ChatCompletionResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message || `请求失败：${response.status}`);
      }

      const assistantText = extractAssistantText(payload) || '模型没有返回可显示的内容。';
      setMessages((prev) => [...prev, { role: 'assistant', content: assistantText }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `调用模型服务失败：${message}`,
        },
      ]);
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
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
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
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[85%] gap-3">
                    <div className="mt-1 shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
                        <Bot className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-black/5 p-4 text-black/90 dark:bg-white/10 dark:text-white/90">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-xs">模型思考中...</span>
                    </div>
                  </div>
                </div>
              )}

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

