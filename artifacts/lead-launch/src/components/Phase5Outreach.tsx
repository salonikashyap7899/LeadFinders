import { useEffect, useState, useCallback } from "react";
import { PhaseShell } from "./PhaseShell";
import { IncompleteState } from "./IncompleteState";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  MessageCircle, Mail, Camera, Copy, ExternalLink, Sparkles,
  Send, CheckCircle2, Loader2, AlertCircle, Settings, X,
  RefreshCw, Phone, Globe,
} from "lucide-react";
import type { Lead, RankedLead, OutreachChannel, OutreachLanguage } from "@/lib/types";
import { toast } from "sonner";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type EmailStatus = "idle" | "sending" | "sent" | "error";

type SmtpConfig = { host: string; port: string; user: string; pass: string; from: string };

export function Phase5Outreach({ selected, leads, onPrev }: {
  selected: RankedLead | null; leads: Lead[]; onPrev: () => void;
}) {
  const [channel, setChannel] = useState<OutreachChannel>("email");
  const [lang, setLang] = useState<OutreachLanguage>("english");
  const [message, setMessage] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null);
  const [showSmtpSetup, setShowSmtpSetup] = useState(false);
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>({ host: "", port: "587", user: "", pass: "", from: "" });
  const [savingSmtp, setSavingSmtp] = useState(false);
  // Bulk email state
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkStatuses, setBulkStatuses] = useState<Record<string, EmailStatus>>({});
  const [bulkRunning, setBulkRunning] = useState(false);

  const emailLeads = leads.filter(l => l.email);

  useEffect(() => {
    fetch(`${BASE}/api/email/status`).then(r => r.json()).then(d => setEmailConfigured(d.configured)).catch(() => setEmailConfigured(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    const m = buildOutreach(selected, channel, lang);
    setMessage(m.first); setFollowUp(m.followUp); setEmailStatus("idle");
  }, [selected, channel, lang]);

  function copy(text: string) { navigator.clipboard.writeText(text); toast.success("Copied!"); }

  function openChannel() {
    if (!selected) return;
    if (channel === "whatsapp" && selected.whatsapp) {
      window.open(`https://wa.me/${selected.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
    } else if (channel === "email" && selected.email) {
      window.open(`mailto:${selected.email}?subject=${encodeURIComponent(`Built a website demo for ${selected.name}`)}&body=${encodeURIComponent(message)}`, "_blank");
    } else if (channel === "instagram") {
      window.open("https://instagram.com/", "_blank");
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
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify(smtpConfig),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Failed to save");
      setEmailConfigured(true); setShowSmtpSetup(false); toast.success("Email configured!");
    } catch (e) { toast.error((e as Error).message); }
    finally { setSavingSmtp(false); }
  }

  async function sendBulkEmails() {
    if (!emailConfigured) { toast.error("Configure email first"); return; }
    setBulkRunning(true);
    for (const lead of emailLeads) {
      setBulkStatuses(prev => ({ ...prev, [lead.id]: "sending" }));
      try {
        const outreach = buildOutreach({ ...lead, audit: selected?.audit ?? { leadId: lead.id, pageSpeedScore: 0, hasWebsite: !!lead.website, mobileFriendly: false, https: false, hasSchema: false, loadTimeMs: 0, gaps: [], biggestGap: "Missing online presence", estLostRevenuePerMonth: 0 }, score: 0, scoreBreakdown: { noOrBadSite: 0, reviewVolume: 0, rating: 0, recency: 0, reachable: 0, industryFit: 0 } } as unknown as RankedLead, "email", lang);
        const res = await fetch(`${BASE}/api/email/send`, {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ to: lead.email, subject: `Built a website demo for ${lead.name}`, body: outreach.first, leadName: lead.name }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error);
        setBulkStatuses(prev => ({ ...prev, [lead.id]: "sent" }));
      } catch { setBulkStatuses(prev => ({ ...prev, [lead.id]: "error" })); }
      await new Promise(r => setTimeout(r, 800));
    }
    setBulkRunning(false);
    toast.success(`Campaign complete — ${emailLeads.length} emails sent`);
  }

  if (!selected) {
    return (
      <PhaseShell title="Outreach" subtitle="Auto-send personalised emails, WhatsApp messages, and Instagram DMs to your leads." onPrev={onPrev}>
        <IncompleteState title="No lead selected" description="Go back to Step 3 and select a lead first." prevPhaseLabel="Rank" onPrev={onPrev} />
      </PhaseShell>
    );
  }

  const channels = [
    { id: "email" as OutreachChannel, label: "Email", icon: Mail, enabled: !!selected.email, color: "#7c3aed" },
    { id: "whatsapp" as OutreachChannel, label: "WhatsApp", icon: MessageCircle, enabled: !!selected.whatsapp, color: "#25d366" },
    { id: "instagram" as OutreachChannel, label: "Instagram", icon: Camera, enabled: true, color: "#e1306c" },
  ];

  const sentCount = Object.values(bulkStatuses).filter(s => s === "sent").length;
  const errorCount = Object.values(bulkStatuses).filter(s => s === "error").length;

  return (
    <PhaseShell title="Outreach" subtitle="Personalised messages with auto-send email, WhatsApp deep-link, and a 3-day follow-up draft." onPrev={onPrev}>

      {/* SMTP Setup Modal */}
      {showSmtpSetup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 480, borderRadius: 18, background: "#0d0f1c", border: "1px solid rgba(124,58,237,0.3)", boxShadow: "0 24px 80px rgba(0,0,0,0.5)", padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ll-text)" }}>Configure Email (SMTP)</div>
                <div style={{ fontSize: 12, color: "#4b5563", marginTop: 2 }}>Gmail: smtp.gmail.com · port 587 · use App Password</div>
              </div>
              <button onClick={() => setShowSmtpSetup(false)} style={{ background: "transparent", border: "none", color: "#4b5563", cursor: "pointer" }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { key: "host", label: "SMTP Host", placeholder: "smtp.gmail.com" },
                { key: "port", label: "Port", placeholder: "587" },
                { key: "user", label: "Email / Username", placeholder: "you@gmail.com" },
                { key: "pass", label: "Password / App Password", placeholder: "••••••••••••••••" },
                { key: "from", label: "From Name (optional)", placeholder: "Your Name" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <div style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 5, fontWeight: 600 }}>{label}</div>
                  <Input
                    type={key === "pass" ? "password" : "text"}
                    value={smtpConfig[key as keyof SmtpConfig]}
                    onChange={e => setSmtpConfig(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--ll-text)", height: 38, fontSize: 13 }}
                  />
                </div>
              ))}
              <button onClick={saveSmtpConfig} disabled={savingSmtp || !smtpConfig.host || !smtpConfig.user || !smtpConfig.pass} style={{
                marginTop: 8, height: 42, borderRadius: 10, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white",
                boxShadow: "0 4px 16px rgba(124,58,237,0.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {savingSmtp ? <><Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> Saving…</> : <><CheckCircle2 style={{ width: 14, height: 14 }} /> Save Configuration</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Campaign Banner */}
      {emailLeads.length > 0 && (
        <div style={{ marginBottom: 20, padding: "14px 18px", borderRadius: 12, background: bulkMode ? "rgba(124,58,237,0.1)" : "rgba(6,182,212,0.07)", border: `1px solid ${bulkMode ? "rgba(124,58,237,0.3)" : "rgba(6,182,212,0.2)"}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: bulkMode ? "rgba(124,58,237,0.2)" : "rgba(6,182,212,0.15)", border: `1px solid ${bulkMode ? "rgba(124,58,237,0.4)" : "rgba(6,182,212,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Mail style={{ width: 16, height: 16, color: bulkMode ? "#a78bfa" : "#67e8f9" }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ll-text)" }}>
                  Email Campaign — {emailLeads.length} leads with email addresses
                </div>
                <div style={{ fontSize: 11, color: "#4b5563", marginTop: 1 }}>
                  {sentCount > 0 ? `${sentCount} sent` : ""}{errorCount > 0 ? `, ${errorCount} failed` : ""}
                  {sentCount === 0 && errorCount === 0 ? "Auto-send personalised emails to all leads at once" : ""}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {!emailConfigured && (
                <button onClick={() => setShowSmtpSetup(true)} style={{
                  height: 32, padding: "0 14px", borderRadius: 8, border: "1px solid rgba(251,191,36,0.3)",
                  background: "rgba(251,191,36,0.1)", color: "#fbbf24", fontSize: 11, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <Settings style={{ width: 11, height: 11 }} /> Setup Email
                </button>
              )}
              <button
                onClick={() => setBulkMode(!bulkMode)}
                style={{
                  height: 32, padding: "0 14px", borderRadius: 8, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer",
                  background: bulkMode ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.06)", color: bulkMode ? "#c4b5fd" : "#6b7280",
                }}
              >
                {bulkMode ? "Hide Campaign" : "View Campaign"}
              </button>
              {bulkMode && emailConfigured && (
                <button onClick={sendBulkEmails} disabled={bulkRunning} style={{
                  height: 32, padding: "0 16px", borderRadius: 8, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer",
                  background: bulkRunning ? "rgba(124,58,237,0.2)" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  color: bulkRunning ? "#4b5563" : "white", display: "flex", alignItems: "center", gap: 5,
                  boxShadow: bulkRunning ? "none" : "0 2px 10px rgba(124,58,237,0.35)",
                }}>
                  {bulkRunning ? <><Loader2 style={{ width: 11, height: 11, animation: "spin 1s linear infinite" }} /> Sending…</> : <><Send style={{ width: 11, height: 11 }} /> Send to All</>}
                </button>
              )}
            </div>
          </div>

          {/* Bulk lead list */}
          {bulkMode && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
              {emailLeads.map(lead => {
                const status = bulkStatuses[lead.id] ?? "idle";
                return (
                  <div key={lead.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.025)", border: `1px solid ${status === "sent" ? "rgba(16,185,129,0.2)" : status === "error" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.05)"}` }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ll-text)" }}>{lead.name}</span>
                      <span style={{ fontSize: 11, color: "#4b5563", marginLeft: 8 }}>{lead.email}</span>
                    </div>
                    <div>
                      {status === "idle" && <span style={{ fontSize: 10, color: "#374151" }}>Pending</span>}
                      {status === "sending" && <span style={{ fontSize: 10, color: "#a78bfa", display: "flex", alignItems: "center", gap: 4 }}><Loader2 style={{ width: 10, height: 10, animation: "spin 1s linear infinite" }} /> Sending</span>}
                      {status === "sent" && <span style={{ fontSize: 10, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 style={{ width: 10, height: 10 }} /> Sent</span>}
                      {status === "error" && <span style={{ fontSize: 10, color: "#f87171", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle style={{ width: 10, height: 10 }} /> Failed</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected lead header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16, padding: "14px 18px", borderRadius: 12, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <div style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 3 }}>Composing for</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ll-text)" }}>{selected.name}</div>
          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            {selected.phone && <span style={{ fontSize: 11, color: "#4b5563", display: "flex", alignItems: "center", gap: 4 }}><Phone style={{ width: 10, height: 10, color: "#10b981" }} />{selected.phone}</span>}
            {selected.email && <span style={{ fontSize: 11, color: "#4b5563", display: "flex", alignItems: "center", gap: 4 }}><Mail style={{ width: 10, height: 10, color: "#7c3aed" }} />{selected.email}</span>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Language toggle */}
          <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
            {(["english", "hinglish"] as OutreachLanguage[]).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: "6px 12px", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
                background: lang === l ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.02)",
                color: lang === l ? "#c4b5fd" : "#4b5563",
                textTransform: "capitalize",
              }}>{l}</button>
            ))}
          </div>
          {!emailConfigured && (
            <button onClick={() => setShowSmtpSetup(true)} title="Setup email" style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid rgba(251,191,36,0.25)", background: "rgba(251,191,36,0.08)", color: "#fbbf24", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
              <Settings style={{ width: 12, height: 12 }} /> Setup Email
            </button>
          )}
          {emailConfigured && (
            <span style={{ fontSize: 10, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCircle2 style={{ width: 11, height: 11 }} /> Email ready
            </span>
          )}
        </div>
      </div>

      {/* Channel tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* First message */}
        <div className="glow-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "13px 16px 11px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Sparkles style={{ width: 13, height: 13, color: "#fbbf24" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ll-text)" }}>First Message</span>
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <button onClick={() => copy(message)} style={{ height: 30, padding: "0 12px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.04)", color: "#6b7280", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <Copy style={{ width: 11, height: 11 }} /> Copy
              </button>
              {channel === "email" && selected.email ? (
                <button onClick={sendEmailAuto} disabled={emailStatus === "sending" || emailStatus === "sent"} style={{
                  height: 30, padding: "0 14px", borderRadius: 7, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s",
                  background: emailStatus === "sent" ? "rgba(16,185,129,0.2)" : emailStatus === "error" ? "rgba(239,68,68,0.2)" : emailConfigured ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "rgba(124,58,237,0.15)",
                  color: emailStatus === "sent" ? "#10b981" : emailStatus === "error" ? "#f87171" : emailConfigured ? "white" : "#4b5563",
                  boxShadow: emailConfigured && emailStatus === "idle" ? "0 2px 10px rgba(124,58,237,0.3)" : "none",
                  opacity: !emailConfigured ? 0.6 : 1,
                }} title={!emailConfigured ? "Setup SMTP first" : undefined}>
                  {emailStatus === "sending" ? <><Loader2 style={{ width: 11, height: 11, animation: "spin 1s linear infinite" }} /> Sending…</>
                    : emailStatus === "sent" ? <><CheckCircle2 style={{ width: 11, height: 11 }} /> Sent!</>
                    : emailStatus === "error" ? <><RefreshCw style={{ width: 11, height: 11 }} /> Retry</>
                    : <><Send style={{ width: 11, height: 11 }} /> Auto-Send</>}
                </button>
              ) : (
                <button onClick={openChannel} style={{ height: 30, padding: "0 14px", borderRadius: 7, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white" }}>
                  <ExternalLink style={{ width: 11, height: 11 }} /> Open
                </button>
              )}
            </div>
          </div>
          <Textarea value={message} onChange={e => setMessage(e.target.value)}
            style={{ minHeight: 280, fontFamily: "JetBrains Mono, monospace", fontSize: 12, resize: "none", background: "transparent", border: "none", borderRadius: 0, color: "#d1d5db", padding: "14px 16px" }}
          />
          <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles style={{ width: 11, height: 11, color: "#4b5563" }} />
            <span style={{ fontSize: 10, color: "#374151" }}>Hook · Pain point · Low-friction CTA</span>
          </div>
        </div>

        {/* Follow-up */}
        <div className="glow-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "13px 16px 11px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <RefreshCw style={{ width: 13, height: 13, color: "#06b6d4" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ll-text)" }}>Day-3 Follow-up</span>
              <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 20, background: "rgba(6,182,212,0.12)", color: "#67e8f9", border: "1px solid rgba(6,182,212,0.2)", fontWeight: 600 }}>Auto-draft</span>
            </div>
            <button onClick={() => copy(followUp)} style={{ height: 30, padding: "0 12px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.04)", color: "#6b7280", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <Copy style={{ width: 11, height: 11 }} /> Copy
            </button>
          </div>
          <Textarea value={followUp} onChange={e => setFollowUp(e.target.value)}
            style={{ minHeight: 280, fontFamily: "JetBrains Mono, monospace", fontSize: 12, resize: "none", background: "transparent", border: "none", borderRadius: 0, color: "#d1d5db", padding: "14px 16px" }}
          />
          <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ fontSize: 10, color: "#374151" }}>Send if no reply within 3 days</span>
          </div>
        </div>
      </div>

      {/* Done banner */}
      <div style={{ marginTop: 18, padding: "14px 18px", borderRadius: 12, background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <CheckCircle2 style={{ width: 18, height: 18, color: "#10b981" }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ll-text)" }}>Pipeline complete 🎉</div>
          <div style={{ fontSize: 11.5, color: "#4b5563", marginTop: 2 }}>Lead → Audit → Score → Site prompt → Outreach done. Go back to Step 3 to pick the next prospect.</div>
        </div>
      </div>
    </PhaseShell>
  );
}

function buildOutreach(l: RankedLead, channel: OutreachChannel, lang: OutreachLanguage) {
  const name = l.name; const gap = l.audit.biggestGap; const reviews = l.reviewsCount ?? 0;
  if (lang === "hinglish") {
    const first = channel === "whatsapp"
      ? `Namaste! Main aapke ${name} ke baare mein baat karna chahta tha.\n\n${reviews > 0 ? `Aapke ${reviews} reviews hain — bahut achha!` : "Aapka business dekha."} Lekin online search mein dikhai nahi dete kyunki: ${gap}\n\nMainne ek quick website demo banaya hai — bilkul free. Dekhna chahenge?\n\nHaan ya nahi? 🙏`
      : channel === "email"
      ? `Namaste,\n\nMaine aapke ${name} ke baare mein research kiya.${reviews > 0 ? ` ${reviews} reviews — kaafi achha!` : ""} Lekin: ${gap}\n\nEk modern website se ye sab fix ho sakta hai. Maine ek demo banaya hai — dekh sakte hain?\n\nBest,\n[Aapka naam]`
      : `Hi! Maine aapke ${name} ke liye ek website demo banaya hai. DM karein? 🙏`;
    const followUp = `Hi! Teen din pehle message kiya tha ${name} ke baare mein.\n\n${reviews > 0 ? `Aapke ${reviews} reviews bahut achhe hain.` : "Aapka business kaafi achha lagta hai."} Sirf ek modern website chahiye inhe online convert karne ke liye.\n\nDemo abhi bhi available hai — 2 minute mein dikha sakta hoon. Interested?`;
    return { first, followUp };
  }
  const first = channel === "whatsapp"
    ? `Hi! I came across ${name}${reviews > 0 ? ` — ${reviews} reviews, great reputation!` : "."}\n\nOne thing I noticed: ${gap}\n\nI've built a quick website demo for you — completely free to look at.\n\nYes or no? 🙂`
    : channel === "email"
    ? `Hi,\n\nI came across ${name} and noticed: ${gap}\n\nI've put together a quick website demo that addresses this. Happy to share — no strings attached.\n\nWould a 10-min call work this week?\n\nBest,\n[Your name]`
    : `Hi! I built a free website demo for ${name}. DM if you'd like to see it!`;
  const followUp = channel === "email"
    ? `Hi again,\n\nFollowing up on my note about ${name} from a few days ago.\n\n${reviews > 0 ? `${reviews} reviews — solid reputation.` : "Great business."} Just one thing holding back new customers online: ${gap}\n\nThe demo is still there. Takes 2 minutes to review.\n\nBest,\n[Your name]`
    : `Hi again — following up on my message about ${name}.\n\n${reviews > 0 ? `${reviews} reviews, solid reputation.` : "Solid business."} Just one thing holding back new customers: ${gap}\n\nDemo is still live. Takes 2 minutes. Interested?`;
  return { first, followUp };
}
