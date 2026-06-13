import { useState, useRef, useEffect } from "react";
import {
  Bot, Send, Loader2, Sparkles, MessageCircle, Mail,
  Users, TrendingUp, Zap, ChevronRight, Copy, ExternalLink,
  Target, Phone, Star, Globe, AlertCircle,
} from "lucide-react";
import type { RankedLead, Lead } from "@/lib/types";
import { toast } from "sonner";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const BG = "#0A0B14";
const BG2 = "#12142A";
const BG3 = "#1A1D35";
const ACCENT = "#6C63FF";
const ACCENT2 = "#A78BFA";
const GREEN = "#34D399";
const TEXT = "#F4F4FF";
const MUTED = "#8B8BAD";
const BORDER = "rgba(255,255,255,0.07)";
const ACCENT_BORDER = "rgba(108,99,255,0.2)";

type Msg = {
  role: "user" | "assistant";
  content: string;
  actions?: { whatsapp?: { phone: string; text: string }; email?: { address: string; subject: string; body: string } };
};

const QUICK_ACTIONS = [
  { icon: Target, label: "Analyze my best leads", prompt: "Analyze all my leads and tell me which ones I should contact first and why." },
  { icon: MessageCircle, label: "Draft WhatsApp for top lead", prompt: "Draft a WhatsApp message for my highest-scoring lead. Make it personal and conversational." },
  { icon: Mail, label: "Draft email for top lead", prompt: "Write a professional cold email for my highest-scoring lead. Include a clear subject line." },
  { icon: TrendingUp, label: "What's my pipeline worth?", prompt: "Estimate the total revenue opportunity from all my current leads based on their scores and gaps." },
  { icon: Zap, label: "Best niche suggestions", prompt: "Based on my current leads, what niches and cities should I target next for maximum revenue?" },
  { icon: Users, label: "Outreach strategy", prompt: "Give me a step-by-step outreach strategy for this week to close at least one deal from my leads." },
];

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? "#4ade80" : score >= 55 ? "#FCD34D" : ACCENT2;
  return (
    <span style={{ fontSize: 12, fontWeight: 700, color, background: `${color}18`, border: `0.5px solid ${color}40`, borderRadius: 6, padding: "2px 7px" }}>
      {score}
    </span>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 500, color, background: `${color}18`, border: `0.5px solid ${color}30`, borderRadius: 100, padding: "2px 8px" }}>
      {label}
    </span>
  );
}

function getStatus(score: number) {
  if (score >= 75) return { label: "Hot", color: "#f87171" };
  if (score >= 55) return { label: "Warm", color: "#FCD34D" };
  return { label: "Qualified", color: ACCENT2 };
}

function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <span>
      {lines.map((line, li) => {
        const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
        return (
          <span key={li}>
            {parts.map((p, i) => {
              if (p.startsWith("**") && p.endsWith("**"))
                return <strong key={i} style={{ fontWeight: 600, color: TEXT }}>{p.slice(2, -2)}</strong>;
              if (p.startsWith("`") && p.endsWith("`"))
                return <code key={i} style={{ background: "rgba(108,99,255,0.15)", color: ACCENT2, padding: "1px 5px", borderRadius: 4, fontSize: "0.88em", fontFamily: "monospace" }}>{p.slice(1, -1)}</code>;
              return <span key={i}>{p}</span>;
            })}
            {li < lines.length - 1 && <br />}
          </span>
        );
      })}
    </span>
  );
}

function SendActions({ lead }: { lead: RankedLead | null }) {
  if (!lead) return null;

  function sendWhatsApp() {
    if (!lead?.whatsapp && !lead?.phone) {
      toast.error("No phone number for this lead");
      return;
    }
    const num = (lead.whatsapp || lead.phone || "").replace(/\D/g, "");
    const text = `Hi! I was looking at ${lead.name} and noticed you could be getting more customers online. I've built a website demo for you — completely free to view. Want to see it? 🙂`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(text)}`, "_blank");
  }

  function sendEmail() {
    if (!lead?.email) {
      toast.error("No email for this lead");
      return;
    }
    const subject = `Website demo for ${lead.name}`;
    const body = `Hi,\n\nI came across ${lead.name} and noticed: ${lead.audit.biggestGap}\n\nI've put together a free website demo that addresses this. Happy to share — no strings attached.\n\nBest,\n[Your name]`;
    window.open(`mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
  }

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
      <button
        onClick={sendWhatsApp}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
          background: lead?.whatsapp || lead?.phone ? "rgba(37,211,102,0.12)" : "rgba(255,255,255,0.04)",
          border: `0.5px solid ${lead?.whatsapp || lead?.phone ? "rgba(37,211,102,0.3)" : BORDER}`,
          color: lead?.whatsapp || lead?.phone ? "#4ade80" : MUTED,
          cursor: "pointer",
        }}
      >
        <MessageCircle style={{ width: 12, height: 12 }} />
        Send WhatsApp
        {lead?.whatsapp || lead?.phone ? <ExternalLink style={{ width: 10, height: 10, opacity: 0.6 }} /> : null}
      </button>
      <button
        onClick={sendEmail}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
          background: lead?.email ? "rgba(108,99,255,0.12)" : "rgba(255,255,255,0.04)",
          border: `0.5px solid ${lead?.email ? ACCENT_BORDER : BORDER}`,
          color: lead?.email ? ACCENT2 : MUTED,
          cursor: "pointer",
        }}
      >
        <Mail style={{ width: 12, height: 12 }} />
        Send Email
        {lead?.email ? <ExternalLink style={{ width: 10, height: 10, opacity: 0.6 }} /> : null}
      </button>
    </div>
  );
}

export function AIAgent({
  leads,
  rankedLeads,
  selectedLead,
  phase,
}: {
  leads: Lead[];
  rankedLeads: RankedLead[];
  selectedLead: RankedLead | null;
  phase: number;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [activeLead, setActiveLead] = useState<RankedLead | null>(null);
  const [msgDraft, setMsgDraft] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const contextLead = activeLead || selectedLead || rankedLeads[0] || null;

  function buildContext() {
    const lines: string[] = [];
    if (phase > 0) lines.push(`User is on Phase ${phase} of the pipeline.`);
    if (rankedLeads.length > 0) {
      lines.push(`\nLead pipeline — ${rankedLeads.length} scored leads:`);
      rankedLeads.slice(0, 5).forEach((l, i) => {
        lines.push(`  ${i + 1}. ${l.name} (${l.city}) — Score: ${l.score}/100, ${l.audit.hasWebsite ? "has website" : "NO website"}, Gap: ${l.audit.biggestGap}`);
        if (l.phone || l.whatsapp) lines.push(`     Phone: ${l.whatsapp || l.phone}`);
        if (l.email) lines.push(`     Email: ${l.email}`);
        if (l.rating) lines.push(`     Rating: ${l.rating}★ (${l.reviewsCount} reviews)`);
        lines.push(`     Est. lost revenue: ₹${l.audit.estLostRevenuePerMonth.toLocaleString()}/month`);
      });
    }
    if (contextLead) {
      lines.push(`\nCurrently focused lead: ${contextLead.name}, ${contextLead.city} — Score ${contextLead.score}/100`);
    }
    return lines.join("\n");
  }

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || streaming) return;
    setInput("");
    const newMsgs: Msg[] = [...messages, { role: "user", content: msg }];
    setMessages(newMsgs);
    setStreaming(true);

    let assistantContent = "";
    setMessages([...newMsgs, { role: "assistant", content: "" }]);

    try {
      const res = await fetch(`${BASE}/api/agent`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
          context: { currentPhase: phase, leadsCount: leads.length, contextSummary: buildContext() },
        }),
      });

      if (!res.ok) throw new Error(`Agent error: ${res.status}`);
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
              setMessages([...newMsgs, { role: "assistant", content: assistantContent }]);
            }
          } catch {}
        }
      }
    } catch (e) {
      setMessages([...newMsgs, {
        role: "assistant",
        content: `⚠️ ${(e as Error).message}. Make sure the API server is running and OPENAI_API_KEY is set.`,
      }]);
    } finally {
      setStreaming(false);
    }
  }

  async function sendDraftFor(lead: RankedLead, channel: "whatsapp" | "email") {
    setActiveLead(lead);
    const prompt = channel === "whatsapp"
      ? `Draft a personalised WhatsApp message for ${lead.name} in ${lead.city}. Score: ${lead.score}/100. Gap: ${lead.audit.biggestGap}. ${lead.reviewsCount ? `They have ${lead.reviewsCount} reviews (${lead.rating}★).` : ""} Make it casual, friendly, short, with emoji. End with a clear yes/no CTA.`
      : `Draft a professional cold email for ${lead.name} in ${lead.city}. Gap: ${lead.audit.biggestGap}. Include a subject line. Keep it under 120 words. End with a soft CTA.`;
    send(prompt);
  }

  function copyMsg(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>

      {/* ── LEFT: Lead List ── */}
      <div style={{
        width: 280, flexShrink: 0,
        background: BG2, borderRight: `0.5px solid ${BORDER}`,
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ padding: "18px 16px 12px", borderBottom: `0.5px solid ${BORDER}` }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Lead Pipeline</div>
          <div style={{ fontSize: 11, color: MUTED }}>
            {rankedLeads.length > 0 ? `${rankedLeads.length} scored leads` : "No leads yet — scrape first"}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
          {rankedLeads.length === 0 && (
            <div style={{ padding: "24px 16px", textAlign: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(108,99,255,0.1)", border: `0.5px solid ${ACCENT_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <Users style={{ width: 18, height: 18, color: ACCENT2 }} />
              </div>
              <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
                Scrape leads in Phase 1, audit them in Phase 2, then come back here to manage them.
              </div>
            </div>
          )}
          {rankedLeads.map((lead, i) => {
            const active = activeLead?.id === lead.id;
            const st = getStatus(lead.score);
            return (
              <div
                key={lead.id}
                onClick={() => setActiveLead(lead)}
                style={{
                  padding: "10px 10px",
                  borderRadius: 10, marginBottom: 4,
                  background: active ? "rgba(108,99,255,0.12)" : "rgba(255,255,255,0.02)",
                  border: `0.5px solid ${active ? ACCENT_BORDER : BORDER}`,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 10, color: MUTED, fontWeight: 600 }}>#{i + 1}</div>
                  <div style={{ flex: 1, fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.name}</div>
                  <ScoreBadge score={lead.score} />
                </div>
                <div style={{ fontSize: 10.5, color: MUTED, marginBottom: 6 }}>{lead.city} · {lead.category}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <StatusPill label={st.label} color={st.color} />
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); sendDraftFor(lead, "whatsapp"); }}
                      title="Draft WhatsApp"
                      style={{ background: "rgba(37,211,102,0.1)", border: "0.5px solid rgba(37,211,102,0.2)", borderRadius: 6, padding: "3px 7px", cursor: "pointer" }}
                    >
                      <MessageCircle style={{ width: 11, height: 11, color: "#4ade80" }} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); sendDraftFor(lead, "email"); }}
                      title="Draft Email"
                      style={{ background: "rgba(108,99,255,0.1)", border: `0.5px solid ${ACCENT_BORDER}`, borderRadius: 6, padding: "3px 7px", cursor: "pointer" }}
                    >
                      <Mail style={{ width: 11, height: 11, color: ACCENT2 }} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active lead card */}
        {contextLead && (
          <div style={{ padding: "10px 12px", borderTop: `0.5px solid ${BORDER}`, background: BG3 }}>
            <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>Focused Lead</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{contextLead.name}</div>
            <div style={{ fontSize: 11, color: MUTED, marginBottom: 8 }}>{contextLead.audit.biggestGap}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => {
                  const num = (contextLead.whatsapp || contextLead.phone || "").replace(/\D/g, "");
                  if (!num) { toast.error("No phone number"); return; }
                  const text = msgDraft[contextLead.id] || `Hi! I was looking at ${contextLead.name} — your ${contextLead.reviewsCount || ""} reviews are great! I noticed ${contextLead.audit.biggestGap}. I've built a quick website demo for you. Want to see it? 🙂`;
                  window.open(`https://wa.me/${num}?text=${encodeURIComponent(text)}`, "_blank");
                }}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "6px", borderRadius: 7, fontSize: 11, fontWeight: 500, background: "rgba(37,211,102,0.1)", border: "0.5px solid rgba(37,211,102,0.25)", color: "#4ade80", cursor: "pointer" }}
              >
                <MessageCircle style={{ width: 11, height: 11 }} /> WhatsApp
              </button>
              <button
                onClick={() => {
                  if (!contextLead.email) { toast.error("No email"); return; }
                  const subject = `Website demo for ${contextLead.name}`;
                  const body = `Hi,\n\nI noticed ${contextLead.audit.biggestGap}. I've built a website demo for ${contextLead.name}. Can I share it?\n\nBest`;
                  window.open(`mailto:${contextLead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
                }}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "6px", borderRadius: 7, fontSize: 11, fontWeight: 500, background: "rgba(108,99,255,0.1)", border: `0.5px solid ${ACCENT_BORDER}`, color: ACCENT2, cursor: "pointer" }}
              >
                <Mail style={{ width: 11, height: 11 }} /> Email
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT: Agent Chat ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Header */}
        <div style={{ padding: "16px 24px", borderBottom: `0.5px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(108,99,255,0.15)", border: `0.5px solid ${ACCENT_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot style={{ width: 18, height: 18, color: ACCENT2 }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Lead AI Agent</div>
            <div style={{ fontSize: 11, color: MUTED, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, display: "inline-block" }} />
              Active · manages {rankedLeads.length} leads · WhatsApp & email ready
            </div>
          </div>
          {contextLead && (
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, background: "rgba(108,99,255,0.08)", border: `0.5px solid ${ACCENT_BORDER}`, borderRadius: 8, padding: "6px 12px" }}>
              <Sparkles style={{ width: 12, height: 12, color: ACCENT2 }} />
              <span style={{ fontSize: 11, color: ACCENT2 }}>
                <strong>{contextLead.name}</strong> · {contextLead.score}/100
              </span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Welcome state */}
          {messages.length === 0 && (
            <div style={{ maxWidth: 560, margin: "0 auto", width: "100%" }}>
              <div style={{ textAlign: "center", padding: "20px 0 28px" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(108,99,255,0.12)", border: `0.5px solid ${ACCENT_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Bot style={{ width: 26, height: 26, color: ACCENT2 }} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Your Lead AI Agent</div>
                <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.65, maxWidth: 400, margin: "0 auto" }}>
                  I know all your leads, their scores, gaps, and contact details. Ask me to analyze them, draft personalized messages, or build your outreach strategy — then send with one click.
                </div>
              </div>

              {/* Quick actions */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {QUICK_ACTIONS.map(({ icon: Icon, label, prompt }) => (
                  <button
                    key={label}
                    onClick={() => send(prompt)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "12px 14px", borderRadius: 10,
                      background: "rgba(255,255,255,0.03)", border: `0.5px solid ${BORDER}`,
                      color: MUTED, cursor: "pointer", textAlign: "left",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = ACCENT_BORDER; (e.currentTarget as HTMLElement).style.color = TEXT; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.color = MUTED; }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(108,99,255,0.1)", border: `0.5px solid ${ACCENT_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon style={{ width: 13, height: 13, color: ACCENT2 }} />
                    </div>
                    <span style={{ fontSize: 12.5, lineHeight: 1.4, paddingTop: 4 }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 10 }}>
              {m.role === "assistant" && (
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(108,99,255,0.15)", border: `0.5px solid ${ACCENT_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <Bot style={{ width: 13, height: 13, color: ACCENT2 }} />
                </div>
              )}
              <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{
                  padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: m.role === "user" ? ACCENT : "rgba(255,255,255,0.05)",
                  border: m.role === "user" ? "none" : `0.5px solid ${BORDER}`,
                  fontSize: 13.5, lineHeight: 1.65,
                  color: m.role === "user" ? "white" : TEXT,
                }}>
                  {m.role === "assistant" && m.content === "" && streaming ? (
                    <div style={{ display: "flex", gap: 4, padding: "4px 0" }}>
                      {[0, 1, 2].map(d => (
                        <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT2, animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${d * 0.2}s` }} />
                      ))}
                    </div>
                  ) : m.role === "assistant" ? (
                    <MarkdownText text={m.content} />
                  ) : m.content}
                </div>

                {/* Copy + Send buttons for assistant messages */}
                {m.role === "assistant" && m.content && !streaming && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button
                      onClick={() => copyMsg(m.content)}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, fontSize: 11, background: "rgba(255,255,255,0.04)", border: `0.5px solid ${BORDER}`, color: MUTED, cursor: "pointer" }}
                    >
                      <Copy style={{ width: 10, height: 10 }} /> Copy
                    </button>
                    {contextLead?.whatsapp || contextLead?.phone ? (
                      <button
                        onClick={() => {
                          const num = (contextLead.whatsapp || contextLead.phone || "").replace(/\D/g, "");
                          window.open(`https://wa.me/${num}?text=${encodeURIComponent(m.content)}`, "_blank");
                        }}
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, fontSize: 11, background: "rgba(37,211,102,0.1)", border: "0.5px solid rgba(37,211,102,0.25)", color: "#4ade80", cursor: "pointer" }}
                      >
                        <MessageCircle style={{ width: 10, height: 10 }} /> Send WhatsApp
                        <ExternalLink style={{ width: 9, height: 9, opacity: 0.6 }} />
                      </button>
                    ) : null}
                    {contextLead?.email ? (
                      <button
                        onClick={() => {
                          const subject = `Website opportunity for ${contextLead.name}`;
                          window.open(`mailto:${contextLead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(m.content)}`, "_blank");
                        }}
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, fontSize: 11, background: "rgba(108,99,255,0.1)", border: `0.5px solid ${ACCENT_BORDER}`, color: ACCENT2, cursor: "pointer" }}
                      >
                        <Mail style={{ width: 10, height: 10 }} /> Send Email
                        <ExternalLink style={{ width: 9, height: 9, opacity: 0.6 }} />
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "14px 24px 18px", borderTop: `0.5px solid ${BORDER}`, flexShrink: 0 }}>
          {contextLead && messages.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              <button onClick={() => sendDraftFor(contextLead, "whatsapp")} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, fontSize: 11, background: "rgba(37,211,102,0.08)", border: "0.5px solid rgba(37,211,102,0.2)", color: "#4ade80", cursor: "pointer" }}>
                <MessageCircle style={{ width: 10, height: 10 }} /> WhatsApp for {contextLead.name.split(" ")[0]}
              </button>
              <button onClick={() => sendDraftFor(contextLead, "email")} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, fontSize: 11, background: "rgba(108,99,255,0.08)", border: `0.5px solid ${ACCENT_BORDER}`, color: ACCENT2, cursor: "pointer" }}>
                <Mail style={{ width: 10, height: 10 }} /> Email for {contextLead.name.split(" ")[0]}
              </button>
              <button onClick={() => send(`Give me 3 follow-up messages for ${contextLead.name} — Day 3, Day 7, and Day 14.`)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, fontSize: 11, background: "rgba(255,255,255,0.04)", border: `0.5px solid ${BORDER}`, color: MUTED, cursor: "pointer" }}>
                <Zap style={{ width: 10, height: 10 }} /> Follow-up sequence
              </button>
            </div>
          )}
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", border: `0.5px solid ${BORDER}`, borderRadius: 12, padding: "10px 14px" }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={contextLead ? `Ask about ${contextLead.name}, or request a draft message…` : "Ask the AI agent anything about your leads…"}
              disabled={streaming}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13.5, color: TEXT, minWidth: 0 }}
            />
            <button
              type="submit"
              disabled={!input.trim() || streaming}
              style={{
                width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                background: input.trim() && !streaming ? ACCENT : "rgba(255,255,255,0.06)",
                border: "none", cursor: input.trim() && !streaming ? "pointer" : "not-allowed",
                transition: "all 0.15s",
              }}
            >
              {streaming ? <Loader2 style={{ width: 14, height: 14, color: MUTED, animation: "spin 1s linear infinite" }} /> : <Send style={{ width: 14, height: 14, color: input.trim() ? "white" : MUTED }} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
