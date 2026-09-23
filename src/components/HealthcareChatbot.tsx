import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Bot,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type ChatResponse = {
  success?: boolean;
  message?: string;
  response?: string;
  output?: string;
  text?: string;
  reply?: string;
  [key: string]: unknown;
};

const WF00_URL = import.meta.env.VITE_N8N_CHAT_URL;

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm CareFlow AI. I can help you find doctors, check availability, book appointments, reschedule, cancel, or look up your appointments.",
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getSessionId() {
  const storageKey = "careflow_chat_session_id";

  const existing = localStorage.getItem(storageKey);

  if (existing) {
    return existing;
  }

  const newSessionId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : createId();

  localStorage.setItem(storageKey, newSessionId);

  return newSessionId;
}

function extractAssistantMessage(data: ChatResponse): string {
  const possibleValues = [
    data.response,
    data.output,
    data.reply,
    data.message,
    data.text,
  ];

  for (const value of possibleValues) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "I received your request, but I couldn't read the response correctly.";
}

export default function HealthcareChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    INITIAL_MESSAGE,
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: message,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    try {
      if (!WF00_URL) {
        throw new Error(
          "VITE_N8N_CHAT_URL is not configured in the .env file."
        );
      }

      const response = await fetch(WF00_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message,
          session_id: getSessionId(),
          channel: "web",
        }),
      });

      const rawText = await response.text();

      let data: ChatResponse = {};

      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        data = {
          response: rawText,
        };
      }

      if (!response.ok) {
        throw new Error(
          typeof data.message === "string"
            ? data.message
            : `Request failed (${response.status}).`
        );
      }

      const assistantMessage: Message = {
        id: createId(),
        role: "assistant",
        content: extractAssistantMessage(data),
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to connect to CareFlow AI.";

      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          content: `Sorry, I couldn't process your request. ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="
            fixed bottom-6 right-6 z-50
            flex items-center gap-3
            rounded-full bg-teal-700
            px-5 py-4
            font-bold text-white
            shadow-xl
            transition
            hover:bg-teal-800
            hover:-translate-y-0.5
          "
          aria-label="Open CareFlow AI Assistant"
        >
          <Sparkles size={19} />

          <span className="hidden sm:inline">
            Ask CareFlow AI
          </span>
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className="
            fixed bottom-6 right-6 z-50
            flex h-[620px] w-[390px]
            max-h-[calc(100vh-3rem)]
            max-w-[calc(100vw-3rem)]
            flex-col overflow-hidden
            rounded-3xl border border-slate-200
            bg-white shadow-2xl
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-teal-700 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
                <Bot size={21} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black">
                    CareFlow AI
                  </h2>

                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                </div>

                <p className="text-xs text-teal-100">
                  Healthcare Assistant
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="
                grid h-9 w-9 place-items-center
                rounded-xl transition
                hover:bg-white/10
              "
              aria-label="Close assistant"
            >
              <X size={20} />
            </button>
          </div>

          {/* Status */}
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              Connected to healthcare automation
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50/50 p-5">
            {messages.map((message) => {
              const assistant =
                message.role === "assistant";

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    assistant
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  {assistant && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-700">
                      <Bot size={16} />
                    </div>
                  )}

                  <div
                    className={`
                      max-w-[78%]
                      whitespace-pre-wrap
                      rounded-2xl px-4 py-3
                      text-sm leading-6
                      ${
                        assistant
                          ? "rounded-tl-md border border-slate-200 bg-white text-slate-700"
                          : "rounded-tr-md bg-teal-700 text-white"
                      }
                    `}
                  >
                    {message.content}
                  </div>

                  {!assistant && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-200 text-slate-600">
                      <User size={15} />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-teal-100 text-teal-700">
                  <Bot size={16} />
                </div>

                <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  CareFlow AI is thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && !loading && (
            <div className="border-t border-slate-100 bg-white px-4 py-3">
              <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
                Try asking
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  "Find a doctor",
                  "Check availability",
                  "My appointments",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() =>
                      setInput(suggestion)
                    }
                    className="
                      rounded-full border border-slate-200
                      bg-white px-3 py-2
                      text-xs font-semibold text-slate-600
                      transition hover:border-teal-300
                      hover:bg-teal-50 hover:text-teal-700
                    "
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="border-t border-slate-200 bg-white p-4"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 focus-within:border-teal-500">
              <textarea
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();

                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Ask CareFlow AI..."
                rows={1}
                disabled={loading}
                className="
                  max-h-28 min-h-[42px]
                  flex-1 resize-none
                  border-0 bg-transparent
                  px-3 py-2
                  text-sm text-slate-800
                  outline-none
                  placeholder:text-slate-400
                "
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="
                  grid h-10 w-10 shrink-0
                  place-items-center rounded-xl
                  bg-teal-700 text-white
                  transition hover:bg-teal-800
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={17} />
                )}
              </button>
            </div>

            <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-slate-400">
              <MessageCircle size={11} />

              Powered by CareFlow AI automation
            </div>
          </form>
        </div>
      )}
    </>
  );
}