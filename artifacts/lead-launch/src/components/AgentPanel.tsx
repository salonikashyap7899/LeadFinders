import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2, Sparkles, ChevronDown } from "lucide-react";
import type { RankedLead } from "@/lib/types";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What niche should I target in Mumbai?",
  "Why is this lead scored so high?",
  "How do I improve my reply rate?",
  "What's a fair price for a dental website?",
  "Suggest 5 profitable cities to search",
];

function MarkdownText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\n- |\n\n)/g);
  return (
    <span>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**"))
          return <strong key={i} className="font-semibold text-slate-900">{p.slice(2, -2)}</strong>;
        if (p.startsWith("`") && p.endsWith("`"))
          return <code key={i} className="bg-slate-100 text-indigo-700 px-1 py-0.5 rounded text-[11px] font-mono">{p.slice(1, -1)}</code>;
        if (p === "\n\n") return <br key={i} />;
        if (p === "\n- ") return <span key={i}><br />• </span>;
        return <span key={i}>{p}</span>;
      })}
    </span>
  );
}

export function AgentPanel({
  phase,
  leadsCount,
  selectedLead,
}: {
  phase: number;
  leadsCount: number;
  selectedLead: RankedLead | null;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(text: string) {
    const userMsg = text.trim();
    if (!userMsg || streaming) return;

    setInput("");
    setShowSuggestions(false);
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setStreaming(true);

    const context = {
      currentPhase: phase,
      leadsCount,
      selectedLead: selectedLead
        ? {
            name: selectedLead.name,
            city: selectedLead.city,
            category: selectedLead.category,
            score: selectedLead.score,
            hasWebsite: selectedLead.audit.hasWebsite,
            pageSpeedScore: selectedLead.audit.pageSpeedScore,
            rating: selectedLead.rating,
            reviewsCount: selectedLead.reviewsCount,
            biggestGap: selectedLead.audit.biggestGap,
            estLostRevenuePerMonth: selectedLead.audit.estLostRevenuePerMonth,
          }
        : undefined,
    };

    let assistantContent = "";
    setMessages([...newMessages, { role: "assistant", content: "" }]);

    try {
      const res = await fetch(`${BASE}/api/agent`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: newMessages, context }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if (json.error) throw new Error(json.error);
            if (json.done) break;
            if (json.content) {
              assistantContent += json.content;
              setMessages([
                ...newMessages,
                { role: "assistant", content: assistantContent },
              ]);
            }
          } catch {}
        }
      }
    } catch (e) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: `Sorry, something went wrong: ${(e as Error).message}. Check that OPENAI_API_KEY is set correctly.`,
        },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl shadow-indigo-600/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          aria-label="Open AI agent"
        >
          <Bot className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-0 right-0 z-50 w-full sm:w-[400px] sm:bottom-6 sm:right-6 bg-white sm:rounded-2xl shadow-2xl shadow-slate-900/20 border border-slate-200 flex flex-col overflow-hidden" style={{ maxHeight: "80vh", height: "600px" }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-indigo-600 text-white shrink-0">
            <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm leading-none">LeadBot</div>
              <div className="text-indigo-200 text-[11px] mt-0.5 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                AI lead generation assistant
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="h-7 w-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Welcome */}
            {messages.length === 0 && (
              <div className="text-center py-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-6 w-6 text-indigo-600" />
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-1">Hi! I'm LeadBot 👋</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  I know your pipeline, your leads, and your selected prospect. Ask me anything about finding clients, scoring leads, or crafting outreach.
                </p>
              </div>
            )}

            {/* Suggestion chips */}
            {showSuggestions && messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Try asking</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-xs bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-slate-100 text-slate-700 rounded-bl-sm"
                  }`}
                >
                  {m.role === "assistant" && m.content === "" && streaming ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  ) : m.role === "assistant" ? (
                    <MarkdownText text={m.content} />
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          {/* Context pill */}
          {selectedLead && (
            <div className="mx-4 mb-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span className="text-xs text-indigo-700 truncate">
                Context: <strong>{selectedLead.name}</strong> · Score {selectedLead.score}/100
              </span>
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-4 shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400/30 transition-all"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedLead ? `Ask about ${selectedLead.name}…` : "Ask LeadBot anything…"}
                disabled={streaming}
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none min-w-0"
              />
              <button
                type="submit"
                disabled={!input.trim() || streaming}
                className="h-8 w-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white flex items-center justify-center transition-colors shrink-0"
              >
                {streaming ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
