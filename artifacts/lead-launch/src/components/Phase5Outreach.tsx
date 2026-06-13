import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhaseShell } from "./PhaseShell";
import { IncompleteState } from "./IncompleteState";
import { MessageCircle, Mail, Camera, Copy, ExternalLink, Sparkles } from "lucide-react";
import type { RankedLead, OutreachChannel, OutreachLanguage } from "@/lib/types";
import { toast } from "sonner";

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

  useEffect(() => {
    if (!selected) return;
    const m = buildOutreach(selected, channel, lang);
    setMessage(m.first);
    setFollowUp(m.followUp);
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
      const subject = "Built a website demo for your business";
      window.open(`mailto:${selected.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`, "_blank");
    } else if (channel === "instagram") {
      window.open(`https://instagram.com/`, "_blank");
    } else {
      toast.error("No contact for this channel");
    }
  }

  if (!selected) {
    return (
      <PhaseShell
        title="Phase 5 — Outreach"
        subtitle="Personalised outreach messages for WhatsApp, email, and Instagram with a built-in follow-up."
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

  const channels: { id: OutreachChannel; label: string; icon: typeof MessageCircle; enabled: boolean }[] = [
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, enabled: !!selected.whatsapp },
    { id: "email", label: "Email", icon: Mail, enabled: !!selected.email },
    { id: "instagram", label: "Instagram", icon: Camera, enabled: true },
  ];

  return (
    <PhaseShell title="Phase 5 — Outreach" subtitle="Personalised messages with a built-in 3-day follow-up." onPrev={onPrev}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Sending to</div>
          <div className="font-display text-2xl mt-1">{selected.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{selected.phone}{selected.email ? ` · ${selected.email}` : ""}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="lang" className="text-sm">English</Label>
            <Switch id="lang" checked={lang === "hinglish"} onCheckedChange={(c) => setLang(c ? "hinglish" : "english")} />
            <Label htmlFor="lang" className="text-sm">Hinglish</Label>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {channels.map(({ id, label, icon: Icon, enabled }) => (
          <Button
            key={id}
            variant={channel === id ? "default" : "outline"}
            size="sm"
            disabled={!enabled}
            onClick={() => setChannel(id)}
          >
            <Icon className="h-4 w-4 mr-2" /> {label}
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>First message</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => copy(message)}><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy</Button>
              <Button size="sm" onClick={openChannel}><ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Send</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="font-mono text-sm min-h-[300px]"
            />
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              Hook: personal · Pain: their biggest gap · CTA: low-friction yes/no
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Day-3 follow-up (auto-draft)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              className="font-mono text-sm min-h-[300px]"
            />
            <div className="mt-3 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => copy(followUp)}><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy follow-up</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 bg-accent/40 border-accent">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-base">✓</div>
            <div>
              <div className="font-medium tracking-tight">Pipeline complete</div>
              <div className="text-sm text-muted-foreground">Lead → audit → ranked → site → outreach. Repeat for next prospect in Phase 3.</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PhaseShell>
  );
}

function buildOutreach(l: RankedLead, channel: OutreachChannel, lang: OutreachLanguage) {
  const name = l.name;
  const gap = l.audit.biggestGap;
  const reviews = l.reviewsCount ?? 0;
  const hasWa = !!l.whatsapp;

  if (lang === "hinglish") {
    const first = channel === "whatsapp"
      ? `Namaste! Main aapke ${name} ke baare mein baat karna chahta tha.\n\nAapke ${reviews} reviews hain — kaafi achha! Lekin online search mein dikhai nahi dete, kyunki: ${gap}\n\nMainne ek quick website demo banaya hai — bilkul free. Dekhna chahenge?\n\nHaan ya nahi? 🙏`
      : channel === "email"
      ? `Subject: Aapke ${name} ke liye ek demo\n\nNamaste,\n\nMaine aapke business ko dekha — ${reviews} reviews, kaafi achha! Lekin: ${gap}\n\nEk modern website se ye sab fix ho sakta hai. Maine ek demo banaya hai — dekh sakte hain?\n\nBest,\n[Aapka naam]`
      : `Hi! Maine aapke ${name} ke liye ek website demo banaya hai. DM karein?`;

    const followUp = `Hi! Teen din pehle message kiya tha ${name} ke baare mein.\n\nAapke ${reviews} reviews bahut achhe hain — sirf ek modern website chahiye inhe convert karne ke liye.\n\nDemo abhi bhi available hai. 2 minute mein dikha sakta hoon. Interested?`;

    return { first, followUp };
  }

  const first = channel === "whatsapp"
    ? `Hi! I was looking at ${name} — ${reviews} reviews, great reputation!\n\nOne thing I noticed: ${gap}\n\nI've built a quick website demo for you — completely free to look at. Would you like to see it?\n\nYes or no works! 🙂`
    : channel === "email"
    ? `Hi,\n\nI came across ${name} and noticed: ${gap}\n\nI've put together a quick website demo that addresses this. Happy to share it — no strings attached.\n\nWould a 10-min call work this week?\n\nBest,\n[Your name]`
    : `Hi! I built a free website demo for ${name}. DM me if you'd like to see it!`;

  const followUp = `Hi again — following up on my message from a few days ago about ${name}.\n\n${reviews} reviews, solid reputation. Just one thing holding back new customers: ${gap}\n\nThe demo is still there if you'd like a look. Takes 2 minutes. Interested?`;

  return { first, followUp };
}
