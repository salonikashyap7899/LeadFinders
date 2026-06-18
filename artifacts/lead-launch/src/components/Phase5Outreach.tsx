import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PhaseShell } from "./PhaseShell";
import { IncompleteState } from "./IncompleteState";
import {
  MessageCircle, Mail, Camera, Copy, ExternalLink, Sparkles,
  Send, CheckCircle, Loader2, AlertCircle, Settings,
} from "lucide-react";
import type { RankedLead, OutreachChannel, OutreachLanguage } from "@/lib/types";
import { toast } from "sonner";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type EmailStatus = "idle" | "sending" | "sent" | "error";

export function Phase5Outreach({
  selected,
  onPrev,
}: {
  selected: RankedLead | null;
  onPrev: () => void;
}) {
  const [channel, setChannel] = useState<OutreachChannel>("whatsapp");
  const [lang, setLang] = useState<OutreachLanguage>("english");
  const [message, setMessage] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`${BASE}/api/email/status`)
      .then((r) => r.json())
      .then((d) => setEmailConfigured(d.configured))
      .catch(() => setEmailConfigured(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    const m = buildOutreach(selected, channel, lang);
    setMessage(m.first);
    setFollowUp(m.followUp);
    setEmailStatus("idle");
  }, [selected, channel, lang]);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  function openChannel() {
    if (!selected) return;
    if (channel === "whatsapp" && selected.whatsapp) {
      const num = selected.whatsapp.replace(/\D/g, "");
      window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, "_blank");
    } else if (channel === "email" && selected.email) {
      const subject = `Built a website demo for ${selected.name}`;
      window.open(`mailto:${selected.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`, "_blank");
    } else if (channel === "instagram") {
      window.open(`https://instagram.com/`, "_blank");
    } else {
      toast.error("No contact info for this channel");
    }
  }

  const sendEmailAuto = useCallback(async () => {
    if (!selected?.email) {
      toast.error("No email address found for this lead");
      return;
    }
    setEmailStatus("sending");
    try {
      const res = await fetch(`${BASE}/api/email/send`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          to: selected.email,
          subject: `Built a website demo for ${selected.name}`,
          body: message,
          leadName: selected.name,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error);
      setEmailStatus("sent");
      toast.success(`Email sent to ${selected.name}`);
    } catch (e) {
      setEmailStatus("error");
      toast.error((e as Error).message);
    }
  }, [selected, message]);

  if (!selected) {
    return (
      <PhaseShell
        title="Phase 5 — Outreach"
        subtitle="Personalised outreach messages for WhatsApp, email, and Instagram with auto-send and a built-in follow-up."
        onPrev={onPrev}
      >
        <IncompleteState
          title="No lead selected yet"
          description="Outreach drafts are tailored to a specific lead — picking up name, biggest gap, review count, and reachable channels. Run earlier phases and select a prospect to see drafts here."
          prevPhaseLabel="Rank"
          onPrev={onPrev}
        />
      </PhaseShell>
    );
  }

  const channels: { id: OutreachChannel; label: string; icon: typeof MessageCircle; enabled: boolean; color: string }[] = [
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, enabled: !!selected.whatsapp, color: "#25D366" },
    { id: "email", label: "Email", icon: Mail, enabled: !!selected.email, color: "#6C63FF" },
    { id: "instagram", label: "Instagram", icon: Camera, enabled: true, color: "#E1306C" },
  ];

  return (
    <PhaseShell
      title="Phase 5 — Outreach"
      subtitle="Personalised messages with auto-send email, WhatsApp deep-link, and a built-in 3-day follow-up."
      onPrev={onPrev}
    >
      {/* Lead header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 p-4 rounded-xl" style={{ background: "rgba(108,99,255,0.07)", border: "0.5px solid rgba(108,99,255,0.2)" }}>
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">Sending to</div>
          <div className="text-2xl font-bold tracking-tight">{selected.name}</div>
          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
            {selected.phone && <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3 text-green-400" /> {selected.phone}</span>}
            {selected.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-blue-400" /> {selected.email}</span>}
            {!selected.phone && !selected.email && <span className="text-muted-foreground/60 italic">No contact info found</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="lang" className="text-xs text-muted-foreground">English</Label>
            <Switch
              id="lang"
              checked={lang === "hinglish"}
              onCheckedChange={(c) => setLang(c ? "hinglish" : "english")}
            />
            <Label htmlFor="lang" className="text-xs text-muted-foreground">Hinglish</Label>
          </div>
          {emailConfigured !== null && (
            <div className="flex items-center gap-1.5 text-[10px]">
              {emailConfigured
                ? <><CheckCircle className="h-3 w-3 text-green-400" /><span className="text-green-400">Auto-email ready</span></>
                : <><Settings className="h-3 w-3 text-muted-foreground/50" /><span className="text-muted-foreground/50">SMTP not configured</span></>
              }
            </div>
          )}
        </div>
      </div>

      {/* Channel tabs */}
      <div className="flex gap-2 mb-5">
        {channels.map(({ id, label, icon: Icon, enabled, color }) => (
          <button
            key={id}
            disabled={!enabled}
            onClick={() => setChannel(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: channel === id ? `${color}22` : "rgba(255,255,255,0.03)",
              border: `0.5px solid ${channel === id ? `${color}55` : "rgba(255,255,255,0.08)"}`,
              color: channel === id ? color : enabled ? "#8B8BAD" : "rgba(139,139,173,0.35)",
              cursor: enabled ? "pointer" : "not-allowed",
            }}
          >
            <Icon className="h-4 w-4" />
            {label}
            {!enabled && <span className="text-[9px] opacity-50">(no contact)</span>}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* First message */}
        <Card className="border-[rgba(108,99,255,0.15)]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">First Message</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => copy(message)} className="h-8 text-xs">
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
              </Button>
              {channel === "email" && selected.email ? (
                <Button
                  size="sm"
                  onClick={sendEmailAuto}
                  disabled={emailStatus === "sending" || emailStatus === "sent" || !emailConfigured}
                  className="h-8 text-xs"
                  style={emailStatus === "sent" ? { background: "rgba(52,211,153,0.2)", color: "#34D399", border: "0.5px solid rgba(52,211,153,0.4)" } : {}}
                  title={!emailConfigured ? "Set SMTP_HOST, SMTP_USER, SMTP_PASS env vars to enable auto-send" : undefined}
                >
                  {emailStatus === "sending" ? (
                    <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Sending…</>
                  ) : emailStatus === "sent" ? (
                    <><CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Sent!</>
                  ) : emailStatus === "error" ? (
                    <><AlertCircle className="h-3.5 w-3.5 mr-1.5" /> Retry</>
                  ) : (
                    <><Send className="h-3.5 w-3.5 mr-1.5" /> Auto-Send</>
                  )}
                </Button>
              ) : (
                <Button size="sm" onClick={openChannel} className="h-8 text-xs">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Open
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="font-mono text-sm min-h-[280px] resize-none"
              style={{ background: "rgba(255,255,255,0.02)" }}
            />
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary/60" />
              Hook: personal · Pain: their biggest gap · CTA: low-friction yes/no
            </div>
            {channel === "email" && !emailConfigured && (
              <div className="mt-2 text-xs text-muted-foreground/60 flex items-center gap-1.5 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
                <Settings className="h-3 w-3 shrink-0" />
                Set <code className="text-primary/60">SMTP_HOST</code>, <code className="text-primary/60">SMTP_USER</code>, <code className="text-primary/60">SMTP_PASS</code> env vars to enable one-click auto-send.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Follow-up */}
        <Card className="border-[rgba(108,99,255,0.15)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Day-3 Follow-up</CardTitle>
              <Badge variant="secondary" className="text-[10px]">Auto-draft</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              className="font-mono text-sm min-h-[280px] resize-none"
              style={{ background: "rgba(255,255,255,0.02)" }}
            />
            <div className="mt-3 flex justify-between items-center">
              <p className="text-xs text-muted-foreground/60">Send if no reply in 3 days</p>
              <Button size="sm" variant="outline" onClick={() => copy(followUp)} className="h-8 text-xs">
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline complete */}
      <div className="mt-5 p-4 rounded-xl flex items-center gap-4" style={{ background: "rgba(52,211,153,0.08)", border: "0.5px solid rgba(52,211,153,0.25)" }}>
        <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(52,211,153,0.15)" }}>
          <CheckCircle className="h-5 w-5 text-green-400" />
        </div>
        <div>
          <div className="font-semibold text-sm tracking-tight">Pipeline complete 🎉</div>
          <div className="text-xs text-muted-foreground mt-0.5">Lead → Audit → Ranked → Site prompt → Outreach done. Repeat for the next prospect in Phase 3.</div>
        </div>
      </div>
    </PhaseShell>
  );
}

function buildOutreach(l: RankedLead, channel: OutreachChannel, lang: OutreachLanguage) {
  const name = l.name;
  const gap = l.audit.biggestGap;
  const reviews = l.reviewsCount ?? 0;

  if (lang === "hinglish") {
    const first = channel === "whatsapp"
      ? `Namaste! Main aapke ${name} ke baare mein baat karna chahta tha.\n\nAapke ${reviews > 0 ? `${reviews} reviews hain — kaafi achha!` : "business ka presence dekha."} Lekin online search mein dikhai nahi dete, kyunki: ${gap}\n\nMainne ek quick website demo banaya hai — bilkul free. Dekhna chahenge?\n\nHaan ya nahi? 🙏`
      : channel === "email"
      ? `Subject: Aapke ${name} ke liye ek demo\n\nNamaste,\n\nMaine aapke business ko dekha${reviews > 0 ? ` — ${reviews} reviews, kaafi achha!` : "."} Lekin: ${gap}\n\nEk modern website se ye sab fix ho sakta hai. Maine ek demo banaya hai — dekh sakte hain?\n\nBest,\n[Aapka naam]`
      : `Hi! Maine aapke ${name} ke liye ek website demo banaya hai. DM karein?`;

    const followUp = `Hi! Teen din pehle message kiya tha ${name} ke baare mein.\n\n${reviews > 0 ? `Aapke ${reviews} reviews bahut achhe hain — sirf ek modern website chahiye inhe convert karne ke liye.` : "Aapka business bahut achha hai — sirf ek website chahiye online presence ke liye."}\n\nDemo abhi bhi available hai. 2 minute mein dikha sakta hoon. Interested?`;

    return { first, followUp };
  }

  const first = channel === "whatsapp"
    ? `Hi! I came across ${name}${reviews > 0 ? ` — ${reviews} reviews, great reputation!` : "."}\n\nOne thing I noticed: ${gap}\n\nI've built a quick website demo for you — completely free to look at. Would you like to see it?\n\nYes or no works! 🙂`
    : channel === "email"
    ? `Hi,\n\nI came across ${name} and noticed: ${gap}\n\nI've put together a quick website demo that addresses exactly this. Happy to share it — no strings attached.\n\nWould a 10-min call work this week?\n\nBest,\n[Your name]`
    : `Hi! I built a free website demo for ${name}. DM me if you'd like to see it!`;

  const followUp = channel === "email"
    ? `Hi again,\n\nJust following up on my note from a few days ago about ${name}.\n\n${reviews > 0 ? `${reviews} reviews — solid reputation.` : "You clearly run a solid business."} Just one thing holding back new customers online: ${gap}\n\nThe demo is still there if you'd like a look. Takes 2 minutes.\n\nBest,\n[Your name]`
    : `Hi again — following up on my message about ${name}.\n\n${reviews > 0 ? `${reviews} reviews, solid reputation.` : "Solid business."} Just one thing holding back new customers: ${gap}\n\nThe demo is still there if you'd like a look. Takes 2 minutes. Interested?`;

  return { first, followUp };
}
