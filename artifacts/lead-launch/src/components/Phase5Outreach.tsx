import { useEffect, useState, useCallback } from "react";
import { PhaseShell } from "./PhaseShell";
import { IncompleteState } from "./IncompleteState";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  MessageCircle, Mail, Camera, Copy, ExternalLink, Sparkles,
  Send, CheckCircle2, Loader2, AlertCircle, Settings, X,
  RefreshCw, Phone, Globe, Shuffle, Instagram, Linkedin,
} from "lucide-react";
import type { Lead, RankedLead, OutreachChannel, OutreachLanguage } from "@/lib/types";
import { toast } from "sonner";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type EmailStatus = "idle" | "sending" | "sent" | "error";
type SmtpConfig = { host: string; port: string; user: string; pass: string; from: string };

// Message variant styles
const VARIANTS = [
  { id: "story", label: "Story-led", desc: "Opens with a relatable customer problem" },
  { id: "direct", label: "Direct ROI", desc: "Leads with money/revenue angle" },
  { id: "social", label: "Social proof", desc: "Opens with their own reviews as hook" },
  { id: "curiosity", label: "Curiosity gap", desc: "Teases a discovery without revealing it" },
];

export function Phase5Outreach({ selected, leads, onPrev }: {
  selected: RankedLead | null; leads: Lead[]; onPrev: () => void;
}) {
  const [channel, setChannel] = useState<OutreachChannel>("email");
  const [lang, setLang] = useState<OutreachLanguage>("english");
  const [variant, setVariant] = useState("direct");
  const [message, setMessage] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null);
  const [showSmtpSetup, setShowSmtpSetup] = useState(false);
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>({ host: "", port: "587", user: "", pass: "", from: "" });
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkStatuses, setBulkStatuses] = useState<Record<string, EmailStatus>>({});
  const [bulkRunning, setBulkRunning] = useState(false);

  const emailLeads = leads.filter(l => l.email);

  useEffect(() => {
    fetch(`${BASE}/api/email/status`).then(r => r.json()).then(d => setEmailConfigured(d.configured)).catch(() => setEmailConfigured(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    const m = buildOutreach(selected, channel, lang, variant);
    setMessage(m.first); setFollowUp(m.followUp); setEmailStatus("idle");
  }, [selected, channel, lang, variant]);

  function copy(text: string) { navigator.clipboard.writeText(text); toast.success("Copied to clipboard!"); }

  function openChannel() {
    if (!selected) return;
    if (channel === "whatsapp" && (selected.whatsapp || selected.phone)) {
      window.open(`https://wa.me/${(selected.whatsapp ?? selected.phone ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
    } else if (channel === "email" && selected.email) {
      window.open(`mailto:${selected.email}?subject=${encodeURIComponent(`Built a website demo for ${selected.name}`)}&body=${encodeURIComponent(message)}`, "_blank");
    } else if (channel === "instagram") {
      const slug = selected.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
      window.open(`https://www.instagram.com/${slug}/`, "_blank");
    } else { toast.error("No contact info for this channel"); }
  }

  const sendEmailAuto = useCallback(async () => {
    if (!selected?.email) { toast.error("No email address for this lead"); return; }
    setEmailStatus("sending");
    try {
      const res = await fetch(`${BASE}/api/email/send`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ to: selected.email, subject: `Built a website demo for ${selected.name}`, body: message, leadName: selected.name }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error);
      setEmailStatus("sent"); toast.success(`✉ Email sent to ${selected.name}!`);
    } catch (e) { setEmailStatus("error"); toast.error((e as Error).message); }
  }, [selected, message]);

  async function saveSmtpConfig() {
    setSavingSmtp(true);
    try {
      const res = await fetch(`${BASE}/api/email/configure`, {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(smtpConfig),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Failed");
      setEmailConfigured(true); setShowSmtpSetup(false); toast.success("Email ready to send!");
    } catch (e) { toast.error((e as Error).message); }
    finally { setSavingSmtp(false); }
  }

  async function sendBulkEmails() {
    if (!emailConfigured) { toast.error("Configure email first"); return; }
    setBulkRunning(true);
    for (const lead of emailLeads) {
      setBulkStatuses(prev => ({ ...prev, [lead.id]: "sending" }));
      try {
        const fakeRanked = { ...lead, audit: { leadId: lead.id, pageSpeedScore: 0, hasWebsite: !!lead.website, mobileFriendly: false, https: false, hasSchema: false, loadTimeMs: 0, gaps: [], biggestGap: "Weak online presence", estLostRevenuePerMonth: 0 }, score: 0, scoreBreakdown: { noOrBadSite: 0, reviewVolume: 0, rating: 0, recency: 0, reachable: 0, industryFit: 0 } } as unknown as RankedLead;
        const outreach = buildOutreach(fakeRanked, "email", lang, variant);
        const res = await fetch(`${BASE}/api/email/send`, {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ to: lead.email, subject: `A quick website idea for ${lead.name}`, body: outreach.first, leadName: lead.name }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error);
        setBulkStatuses(prev => ({ ...prev, [lead.id]: "sent" }));
      } catch { setBulkStatuses(prev => ({ ...prev, [lead.id]: "error" })); }
      await new Promise(r => setTimeout(r, 700));
    }
    setBulkRunning(false);
    const sent = Object.values(bulkStatuses).filter(s => s === "sent").length;
    toast.success(`Campaign sent to ${sent} leads!`);
  }

  if (!selected) {
    return (
      <PhaseShell title="Outreach" subtitle="Send personalised emails, WhatsApp messages, and Instagram DMs to your top leads." onPrev={onPrev}>
        <IncompleteState title="No lead selected" description="Go back to Step 3 and select a lead." prevPhaseLabel="Rank" onPrev={onPrev} />
      </PhaseShell>
    );
  }

  const sentCount = Object.values(bulkStatuses).filter(s => s === "sent").length;
  const channels = [
    { id: "email" as OutreachChannel, label: "Email", icon: Mail, enabled: !!selected.email, color: "#7c3aed" },
    { id: "whatsapp" as OutreachChannel, label: "WhatsApp", icon: MessageCircle, enabled: !!(selected.whatsapp || selected.phone), color: "#25d366" },
    { id: "instagram" as OutreachChannel, label: "Instagram DM", icon: Camera, enabled: true, color: "#e1306c" },
  ];

  return (
    <PhaseShell title="Outreach" subtitle="Personalised messages — 4 proven copywriting variants — with auto-send email and WhatsApp deep-links." onPrev={onPrev}>

      {/* SMTP Modal */}
      {showSmtpSetup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 480, borderRadius: 18, background: "#0d0f1c", border: "1px solid rgba(124,58,237,0.3)", boxShadow: "0 24px 80px rgba(0,0,0,0.5)", padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ll-text)" }}>Configure Email (SMTP)</div>
                <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>Gmail: smtp.gmail.com · port 587 · use App Password (not your real password)</div>
              </div>
              <button onClick={() => setShowSmtpSetup(false)} style={{ background: "transparent", border: "none", color: "#4b5563", cursor: "pointer" }}><X style={{ width: 18, height: 18 }} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { key: "host", label: "SMTP Host", placeholder: "smtp.gmail.com" },
                { key: "port", label: "Port", placeholder: "587" },
                { key: "user", label: "Email / Username", placeholder: "you@gmail.com" },
                { key: "pass", label: "App Password", placeholder: "xxxx xxxx xxxx xxxx" },
                { key: "from", label: "From Name (optional)", placeholder: "Your Agency Name" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <div style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4, fontWeight: 600 }}>{label}</div>
                  <Input type={key === "pass" ? "password" : "text"} value={smtpConfig[key as keyof SmtpConfig]} onChange={e => setSmtpConfig(prev => ({ ...prev, [key]: e.target.value }))} placeholder={placeholder}
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--ll-text)", height: 38, fontSize: 13 }} />
                </div>
              ))}
              <button onClick={saveSmtpConfig} disabled={savingSmtp || !smtpConfig.host || !smtpConfig.user || !smtpConfig.pass} style={{
                marginTop: 6, height: 42, borderRadius: 10, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white",
                boxShadow: "0 4px 16px rgba(124,58,237,0.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {savingSmtp ? <><Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> Verifying…</> : <><CheckCircle2 style={{ width: 14, height: 14 }} /> Save & Verify</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 14, padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <div style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 2 }}>Composing for</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ll-text)" }}>{selected.name}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
            {selected.phone && <span style={{ fontSize: 11, color: "#4b5563", display: "flex", alignItems: "center", gap: 4 }}><Phone style={{ width: 10, height: 10, color: "#10b981" }} />{selected.phone}</span>}
            {selected.email && <span style={{ fontSize: 11, color: "#4b5563", display: "flex", alignItems: "center", gap: 4 }}><Mail style={{ width: 10, height: 10, color: "#7c3aed" }} />{selected.email}</span>}
            {selected.website && <a href={selected.website} target="_blank" rel="noopener" style={{ fontSize: 11, color: "#06b6d4", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}><Globe style={{ width: 10, height: 10 }} />Site</a>}
            {/* Social quick links */}
            <a href={`https://www.instagram.com/${selected.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`} target="_blank" rel="noopener" style={{ fontSize: 11, color: "#fb7185", display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}><Instagram style={{ width: 10, height: 10 }} />Instagram</a>
            <a href={`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(selected.name)}`} target="_blank" rel="noopener" style={{ fontSize: 11, color: "#60a5fa", display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}><Linkedin style={{ width: 10, height: 10 }} />LinkedIn</a>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
            {(["english", "hinglish"] as OutreachLanguage[]).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: "5px 12px", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, background: lang === l ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.02)", color: lang === l ? "#c4b5fd" : "#4b5563", textTransform: "capitalize" }}>{l}</button>
            ))}
          </div>
          {!emailConfigured && (
            <button onClick={() => setShowSmtpSetup(true)} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(251,191,36,0.25)", background: "rgba(251,191,36,0.08)", color: "#fbbf24", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600 }}>
              <Settings style={{ width: 12, height: 12 }} /> Setup Email
            </button>
          )}
          {emailConfigured && <span style={{ fontSize: 10, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 style={{ width: 11, height: 11 }} /> Email ready</span>}
        </div>
      </div>

      {/* Email campaign banner */}
      {emailLeads.length > 0 && (
        <div style={{ marginBottom: 14, padding: "12px 16px", borderRadius: 12, background: bulkMode ? "rgba(124,58,237,0.08)" : "rgba(6,182,212,0.06)", border: `1px solid ${bulkMode ? "rgba(124,58,237,0.25)" : "rgba(6,182,212,0.18)"}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: bulkMode ? "rgba(124,58,237,0.2)" : "rgba(6,182,212,0.15)", border: `1px solid ${bulkMode ? "rgba(124,58,237,0.4)" : "rgba(6,182,212,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Mail style={{ width: 14, height: 14, color: bulkMode ? "#a78bfa" : "#67e8f9" }} />
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ll-text)" }}>Email Campaign — {emailLeads.length} leads with email</div>
                <div style={{ fontSize: 11, color: "#4b5563" }}>{sentCount > 0 ? `${sentCount} sent` : "Auto-send personalised emails to all leads"}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <button onClick={() => setBulkMode(!bulkMode)} style={{ height: 30, padding: "0 12px", borderRadius: 8, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer", background: bulkMode ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)", color: bulkMode ? "#c4b5fd" : "#6b7280" }}>
                {bulkMode ? "Hide" : "View Campaign"}
              </button>
              {bulkMode && emailConfigured && (
                <button onClick={sendBulkEmails} disabled={bulkRunning} style={{ height: 30, padding: "0 14px", borderRadius: 8, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", background: bulkRunning ? "rgba(124,58,237,0.2)" : "linear-gradient(135deg, #7c3aed, #6d28d9)", color: bulkRunning ? "#4b5563" : "white", display: "flex", alignItems: "center", gap: 5 }}>
                  {bulkRunning ? <><Loader2 style={{ width: 10, height: 10, animation: "spin 1s linear infinite" }} /> Sending…</> : <><Send style={{ width: 10, height: 10 }} /> Send All</>}
                </button>
              )}
              {bulkMode && !emailConfigured && (
                <button onClick={() => setShowSmtpSetup(true)} style={{ height: 30, padding: "0 12px", borderRadius: 8, border: "1px solid rgba(251,191,36,0.3)", background: "rgba(251,191,36,0.1)", color: "#fbbf24", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                  Setup Email First
                </button>
              )}
            </div>
          </div>
          {bulkMode && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
              {emailLeads.map(lead => {
                const s = bulkStatuses[lead.id] ?? "idle";
                return (
                  <div key={lead.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", borderRadius: 8, background: "rgba(255,255,255,0.025)", border: `1px solid ${s === "sent" ? "rgba(16,185,129,0.2)" : s === "error" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.05)"}` }}>
                    <div><span style={{ fontSize: 12, fontWeight: 600, color: "var(--ll-text)" }}>{lead.name}</span><span style={{ fontSize: 11, color: "#4b5563", marginLeft: 8 }}>{lead.email}</span></div>
                    <div style={{ fontSize: 10 }}>
                      {s === "idle" && <span style={{ color: "#374151" }}>Pending</span>}
                      {s === "sending" && <span style={{ color: "#a78bfa", display: "flex", alignItems: "center", gap: 4 }}><Loader2 style={{ width: 10, height: 10, animation: "spin 1s linear infinite" }} />Sending</span>}
                      {s === "sent" && <span style={{ color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 style={{ width: 10, height: 10 }} />Sent</span>}
                      {s === "error" && <span style={{ color: "#f87171", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle style={{ width: 10, height: 10 }} />Failed</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* A/B Variant selector */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <Shuffle style={{ width: 12, height: 12, color: "#a78bfa" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.7px" }}>Message Variant</span>
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          {VARIANTS.map(v => (
            <button key={v.id} onClick={() => setVariant(v.id)} title={v.desc} style={{
              flex: 1, padding: "7px 6px", borderRadius: 9, cursor: "pointer", fontSize: 11, fontWeight: 600, transition: "all 0.14s",
              background: variant === v.id ? "rgba(124,58,237,0.18)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${variant === v.id ? "rgba(124,58,237,0.45)" : "rgba(255,255,255,0.07)"}`,
              color: variant === v.id ? "#c4b5fd" : "#4b5563",
            }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Channel tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {channels.map(({ id, label, icon: Icon, enabled, color }) => (
          <button key={id} disabled={!enabled} onClick={() => setChannel(id)} style={{
            display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 9, fontSize: 12.5, fontWeight: 600,
            cursor: enabled ? "pointer" : "not-allowed", transition: "all 0.15s",
            background: channel === id ? `${color}1a` : "rgba(255,255,255,0.03)",
            border: `1px solid ${channel === id ? `${color}55` : "rgba(255,255,255,0.06)"}`,
            color: channel === id ? color : enabled ? "#6b7280" : "#374151",
            boxShadow: channel === id ? `0 2px 10px ${color}18` : "none",
          }}>
            <Icon style={{ width: 14, height: 14 }} />
            {label}
            {!enabled && <span style={{ fontSize: 9, color: "#374151" }}>(no contact)</span>}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* First message */}
        <div className="glow-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Sparkles style={{ width: 13, height: 13, color: "#fbbf24" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ll-text)" }}>First Message</span>
              <span style={{ fontSize: 9.5, padding: "2px 8px", borderRadius: 20, background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.25)", fontWeight: 600 }}>{VARIANTS.find(v => v.id === variant)?.label}</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => copy(message)} style={{ height: 28, padding: "0 10px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.04)", color: "#6b7280", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <Copy style={{ width: 10, height: 10 }} /> Copy
              </button>
              {channel === "email" && selected.email ? (
                <button onClick={emailStatus === "error" ? () => setEmailStatus("idle") : sendEmailAuto} disabled={emailStatus === "sending" || emailStatus === "sent"} style={{
                  height: 28, padding: "0 12px", borderRadius: 7, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s",
                  background: emailStatus === "sent" ? "rgba(16,185,129,0.2)" : emailStatus === "error" ? "rgba(239,68,68,0.2)" : emailConfigured ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "rgba(124,58,237,0.15)",
                  color: emailStatus === "sent" ? "#10b981" : emailStatus === "error" ? "#f87171" : emailConfigured ? "white" : "#4b5563",
                  boxShadow: emailConfigured && emailStatus === "idle" ? "0 2px 10px rgba(124,58,237,0.3)" : "none",
                  opacity: !emailConfigured ? 0.6 : 1,
                }} title={!emailConfigured ? "Setup SMTP first" : ""}>
                  {emailStatus === "sending" ? <><Loader2 style={{ width: 10, height: 10, animation: "spin 1s linear infinite" }} />Sending…</>
                    : emailStatus === "sent" ? <><CheckCircle2 style={{ width: 10, height: 10 }} />Sent!</>
                    : emailStatus === "error" ? <><RefreshCw style={{ width: 10, height: 10 }} />Retry</>
                    : <><Send style={{ width: 10, height: 10 }} />Auto-Send</>}
                </button>
              ) : (
                <button onClick={openChannel} style={{ height: 28, padding: "0 12px", borderRadius: 7, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white" }}>
                  <ExternalLink style={{ width: 10, height: 10 }} /> Open
                </button>
              )}
            </div>
          </div>
          <Textarea value={message} onChange={e => setMessage(e.target.value)}
            style={{ minHeight: 260, fontFamily: "JetBrains Mono, monospace", fontSize: 12, resize: "none", background: "transparent", border: "none", borderRadius: 0, color: "#d1d5db", padding: "12px 16px" }} />
          <div style={{ padding: "8px 16px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 9.5, color: "#374151" }}>✍ AI-generated · editable · {channel === "whatsapp" ? "WhatsApp" : channel === "email" ? "Email" : "Instagram DM"}</span>
          </div>
        </div>

        {/* Follow-up */}
        <div className="glow-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <RefreshCw style={{ width: 13, height: 13, color: "#06b6d4" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ll-text)" }}>Day-3 Follow-up</span>
              <span style={{ fontSize: 9.5, padding: "2px 8px", borderRadius: 20, background: "rgba(6,182,212,0.1)", color: "#67e8f9", border: "1px solid rgba(6,182,212,0.2)", fontWeight: 600 }}>Auto-draft</span>
            </div>
            <button onClick={() => copy(followUp)} style={{ height: 28, padding: "0 10px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.04)", color: "#6b7280", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <Copy style={{ width: 10, height: 10 }} /> Copy
            </button>
          </div>
          <Textarea value={followUp} onChange={e => setFollowUp(e.target.value)}
            style={{ minHeight: 260, fontFamily: "JetBrains Mono, monospace", fontSize: 12, resize: "none", background: "transparent", border: "none", borderRadius: 0, color: "#d1d5db", padding: "12px 16px" }} />
          <div style={{ padding: "8px 16px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ fontSize: 9.5, color: "#374151" }}>Send if no reply within 3 days</span>
          </div>
        </div>
      </div>

      {/* Pipeline complete */}
      <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 12, background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.18)", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <CheckCircle2 style={{ width: 16, height: 16, color: "#10b981" }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ll-text)" }}>Pipeline complete 🎉</div>
          <div style={{ fontSize: 11.5, color: "#4b5563", marginTop: 1 }}>Go back to Step 3 to pick the next prospect, or run a new search in Step 1.</div>
        </div>
      </div>
    </PhaseShell>
  );
}

function buildOutreach(l: RankedLead, channel: OutreachChannel, lang: OutreachLanguage, variant: string) {
  const name = l.name; const gap = l.audit.biggestGap; const reviews = l.reviewsCount ?? 0; const rating = l.rating ?? 4.5;

  const messages: Record<string, { en: string; hi: string }> = {
    story: {
      en: channel === "email"
        ? `Hi,\n\nA potential customer searched "${name}" last week and ended up booking a competitor — because your business didn't appear online.\n\n${gap}\n\nI've built a quick website concept for ${name} — takes 2 minutes to look at. Interested?\n\nBest,\n[Your name]`
        : `Hi! A customer searched for a local ${l.category} and booked someone else — just because ${name} wasn't easy to find online.\n\n${gap}\n\nI've got a quick demo to show you. 2 mins? 🙂`,
      hi: channel === "email"
        ? `Hi,\n\nEk customer ne "${name}" search kiya aur competitor ke paas chale gaye — kyunki aapka online presence nahi tha.\n\n${gap}\n\nMainne ek quick website demo banaya hai — 2 minute mein dekhna chahenge?\n\nBest,\n[Aapka naam]`
        : `Hi! Ek customer ne local ${l.category} search kiya aur competitor ke paas chala gaya — sirf isliye ki ${name} online easily nahi mila.\n\nEk quick demo hai — 2 min? 🙏`,
    },
    direct: {
      en: channel === "email"
        ? `Hi,\n\nBusinesses like ${name} with ${reviews > 0 ? `${reviews} reviews` : "a good reputation"} but a weak web presence lose an estimated ₹${l.audit.estLostRevenuePerMonth.toLocaleString()} per month in missed enquiries.\n\n${gap}\n\nI've already built a site concept for you — free to view. Worth a 10-min chat?\n\nBest,\n[Your name]`
        : `Hi! Businesses with ${reviews > 0 ? `${reviews} reviews` : "your kind of reputation"} but no strong website lose hundreds in enquiries monthly. I built a free demo for ${name} — want to see it?`,
      hi: channel === "email"
        ? `Hi,\n\n${name} jaise businesses ₹${l.audit.estLostRevenuePerMonth.toLocaleString()}/mahina online enquiries se miss kar rahe hain.\n\n${gap}\n\nMainne ek free website concept banaya hai — 10 min ki baat worth hai?\n\nBest,\n[Aapka naam]`
        : `Hi! ${reviews > 0 ? `${reviews} reviews hain aapke` : "Acha business hai aapka"} — lekin online enquiries chhoot rahi hain. Maine free demo banaya ${name} ke liye — dekhenge?`,
    },
    social: {
      en: channel === "email"
        ? `Hi,\n\n${rating}★ across ${reviews} reviews — that's a strong reputation.\n\nBut here's the problem: customers searching online can't easily find or book ${name}. ${gap}\n\nI've designed a site that shows off those reviews front and centre. Want a look?\n\nBest,\n[Your name]`
        : `Hi! ${rating}★ with ${reviews > 0 ? `${reviews} reviews` : "solid reviews"} — amazing! But online? Customers are struggling to find ${name}.\n\nI built something to fix that — free demo. Interested? 🙂`,
      hi: channel === "email"
        ? `Hi,\n\n${rating}★ aur ${reviews} reviews — bahut achha reputation hai!\n\nLekin online? Customers ${name} dhundh nahi pa rahe. ${gap}\n\nMainne ek site design ki hai jo aapki reviews showcase kare — dekhenge?\n\nBest,\n[Aapka naam]`
        : `Hi! ${rating}★ aur ${reviews > 0 ? `${reviews} reviews` : "solid reviews"} — waah! Lekin online customers ${name} ko easily nahi dhundh paate. Free demo hai — interested? 🙏`,
    },
    curiosity: {
      en: channel === "email"
        ? `Hi,\n\nI was researching ${l.category} businesses in ${l.city} and noticed something about ${name} that most business owners don't realise until it's too late.\n\nWould it be okay if I sent you a 2-minute demo showing exactly what I mean?\n\nBest,\n[Your name]`
        : `Hi! I found something interesting about ${name}'s online presence that most owners don't know about. Mind if I show you? (Takes 2 mins) 🤔`,
      hi: channel === "email"
        ? `Hi,\n\n${l.city} ke ${l.category} businesses research karte hue ${name} ke baare mein kuch aisa notice kiya jo zyaadatar business owners ko tab pata chalta hai jab der ho jaati hai.\n\nEk 2-minute demo bhej sakta hoon?\n\nBest,\n[Aapka naam]`
        : `Hi! ${name} ke online presence ke baare mein kuch interesting mila jo zyaadatar owners nahi jaante. Dikha sakta hoon? (2 min 🤔)`,
    },
  };

  const selected = messages[variant] ?? messages.direct;
  const first = lang === "hinglish" ? selected.hi : selected.en;

  const followUp = lang === "hinglish"
    ? (channel === "email"
      ? `Hi again,\n\nKuch din pehle ${name} ke baare mein message kiya tha.\n\nJust wanted to follow up — demo abhi bhi available hai. 2 minute mein dikha sakta hoon.\n\nBest,\n[Aapka naam]`
      : `Hi! Pehle ${name} ke liye ek website idea share kiya tha. Kya aapne dekha? Demo abhi bhi ready hai 🙂`)
    : (channel === "email"
      ? `Hi again,\n\nFollowing up on my note about ${name} from a few days ago.\n\nThe demo is still ready — takes 2 minutes to review. Happy to answer any questions.\n\nBest,\n[Your name]`
      : `Hi! Just following up — I built a free site demo for ${name} and wanted to make sure you saw it. Still happy to share! 😊`);

  return { first, followUp };
}
