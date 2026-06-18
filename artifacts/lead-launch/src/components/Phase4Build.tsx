import { useEffect, useState } from "react";
import { PhaseShell } from "./PhaseShell";
import { IncompleteState } from "./IncompleteState";
import { Copy, ExternalLink, Sparkles, Loader2, Code2, CheckCircle2 } from "lucide-react";
import type { RankedLead } from "@/lib/types";
import { toast } from "sonner";

const PLATFORMS = [
  { id: "lovable", label: "Lovable", color: "#ec4899", url: "https://lovable.dev" },
  { id: "bolt", label: "Bolt.new", color: "#f59e0b", url: "https://bolt.new" },
  { id: "claude-code", label: "Claude Code", color: "#a78bfa", url: "https://claude.ai" },
  { id: "codex", label: "Codex / GPT", color: "#10b981", url: "https://chat.openai.com" },
];

export function Phase4Build({ selected, onNext, onPrev }: {
  selected: RankedLead | null; onNext: () => void; onPrev: () => void;
}) {
  const [platform, setPlatform] = useState("lovable");
  const [prompt, setPrompt] = useState("");
  const [typed, setTyped] = useState("");
  const [copied, setCopied] = useState(false);
  const [building, setBuilding] = useState(false);

  useEffect(() => { if (selected) setPrompt(buildPrompt(selected, platform)); }, [selected, platform]);

  useEffect(() => {
    setTyped(""); if (!prompt) return;
    let i = 0;
    const id = setInterval(() => { i += 10; setTyped(prompt.slice(0, i)); if (i >= prompt.length) clearInterval(id); }, 10);
    return () => clearInterval(id);
  }, [prompt]);

  function copyPrompt() {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success("Prompt copied! Paste into " + PLATFORMS.find(p => p.id === platform)?.label);
    setTimeout(() => setCopied(false), 2500);
  }

  function simulateBuild() {
    setBuilding(true);
    setTimeout(() => { setBuilding(false); toast.success("Preview loaded!"); }, 1600);
  }

  if (!selected) {
    return (
      <PhaseShell title="Build Website" subtitle="Generate a battle-tested AI prompt pre-filled with your lead's details — ready to paste into any AI builder." onPrev={onPrev} onNext={onNext} nextDisabled nextLabel="Draft outreach">
        <IncompleteState title="No lead selected" description="Go back to Step 3 and select the lead you want to build for." prevPhaseLabel="Rank" onPrev={onPrev} />
      </PhaseShell>
    );
  }

  const activePlatform = PLATFORMS.find(p => p.id === platform)!;

  return (
    <PhaseShell title="Build Website" subtitle="One-click prompt for any AI builder. Copy → Paste → Get a live site in minutes." onPrev={onPrev} onNext={onNext} nextLabel="Draft outreach">

      {/* Lead context bar */}
      <div style={{ padding: "12px 18px", borderRadius: 12, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 2 }}>Building for</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ll-text)" }}>{selected.name}</div>
          <div style={{ fontSize: 11, color: "#4b5563" }}>{selected.address}</div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#a78bfa" }}>{selected.score}</div>
            <div style={{ fontSize: 9, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Score</div>
          </div>
          {selected.rating && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fbbf24" }}>{selected.rating}★</div>
              <div style={{ fontSize: 9, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Rating</div>
            </div>
          )}
        </div>
      </div>

      {/* Platform selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {PLATFORMS.map(p => (
          <button key={p.id} onClick={() => setPlatform(p.id)} style={{
            flex: 1, padding: "10px 8px", borderRadius: 10, cursor: "pointer",
            background: platform === p.id ? `${p.color}22` : "rgba(255,255,255,0.03)",
            border: `1px solid ${platform === p.id ? `${p.color}55` : "rgba(255,255,255,0.07)"}`,
            color: platform === p.id ? p.color : "#4b5563",
            fontSize: 12, fontWeight: platform === p.id ? 700 : 500,
            transition: "all 0.15s",
            boxShadow: platform === p.id ? `0 2px 12px ${p.color}20` : "none",
          }}>
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Prompt */}
        <div className="glow-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Code2 style={{ width: 14, height: 14, color: activePlatform.color }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ll-text)" }}>Generated Prompt</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a href={activePlatform.url} target="_blank" rel="noopener noreferrer" style={{
                height: 30, padding: "0 12px", borderRadius: 7, fontSize: 11, fontWeight: 600, textDecoration: "none",
                display: "flex", alignItems: "center", gap: 5, color: "#6b7280",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
              }}>
                <ExternalLink style={{ width: 11, height: 11 }} /> Open {activePlatform.label}
              </a>
              <button onClick={copyPrompt} style={{
                height: 30, padding: "0 14px", borderRadius: 7, border: "none", fontSize: 11, fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                background: copied ? "rgba(16,185,129,0.2)" : `linear-gradient(135deg, ${activePlatform.color}, ${activePlatform.color}99)`,
                color: copied ? "#10b981" : "white",
                boxShadow: copied ? "none" : `0 2px 10px ${activePlatform.color}40`,
                transition: "all 0.15s",
              }}>
                {copied ? <><CheckCircle2 style={{ width: 11, height: 11 }} /> Copied!</> : <><Copy style={{ width: 11, height: 11 }} /> Copy Prompt</>}
              </button>
            </div>
          </div>
          <div style={{ padding: 0 }}>
            <pre style={{
              fontSize: 11.5, lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "JetBrains Mono, monospace",
              maxHeight: 520, overflowY: "auto", margin: 0, padding: "16px 18px",
              color: "#d1d5db", background: "transparent",
            }}>
              {typed}<span style={{ animation: "pulse 1s ease-in-out infinite", opacity: 0.7 }}>▌</span>
            </pre>
          </div>
        </div>

        {/* Preview */}
        <div className="glow-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles style={{ width: 14, height: 14, color: "#fbbf24" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ll-text)" }}>Live Preview</span>
            </div>
            <button onClick={simulateBuild} disabled={building} style={{
              height: 30, padding: "0 14px", borderRadius: 7, border: "none", fontSize: 11, fontWeight: 600,
              cursor: building ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 5,
              background: building ? "rgba(251,191,36,0.15)" : "rgba(251,191,36,0.18)",
              color: "#fbbf24", transition: "all 0.15s",
            }}>
              {building ? <><Loader2 style={{ width: 11, height: 11, animation: "spin 1s linear infinite" }} /> Building…</> : <><Sparkles style={{ width: 11, height: 11 }} /> Refresh</>}
            </button>
          </div>
          <div style={{ height: 520, overflow: "hidden" }}>
            <iframe title="Preview" srcDoc={demoSiteHtml(selected)} style={{ width: "100%", height: "100%", border: "none", background: "#f5efe6" }} />
          </div>
        </div>
      </div>
    </PhaseShell>
  );
}

function buildPrompt(l: RankedLead, platform: string): string {
  const name = l.name; const niche = l.category; const phone = l.phone ?? "+XX XXXXX XXXXX";
  const whatsapp = l.whatsapp ?? phone; const addr = l.address; const rating = l.rating ?? 4.5; const reviews = l.reviewsCount ?? 0; const gap = l.audit.biggestGap;
  return `You are building a high-converting local-business website for a ${niche}.

# BUSINESS
Name: ${name}
Category: ${niche}
Address: ${addr}
Phone: ${phone}
WhatsApp: ${whatsapp}
Google rating: ${rating}★ (${reviews} reviews)
Biggest current gap: ${gap}

# DESIGN
- Mobile-first (most local traffic is mobile). Hero CTA visible above fold.
- Premium local-business aesthetic suited to a ${niche}.
- Inter or DM Sans font. Large H1. Generous whitespace. Trust signals everywhere.
- Floating WhatsApp button (bottom-right) on every page.
- Click-to-call phone in header.

# SECTIONS (in order)
1. Hero: Business name + 1-line promise + "Book on WhatsApp" CTA + rating badge
2. Trust strip: "${rating}★ · ${reviews}+ reviews · ${l.yearsInBusiness ?? 8}+ years"
3. Services grid: 6 cards with icons
4. About + owner bio: 2-col layout with credentials
5. Gallery/portfolio placeholder (3x2 grid)
6. Reviews carousel: 6 snippets (placeholder)
7. FAQ accordion: 5 questions a first-time ${niche} customer actually asks
8. Location: Map embed of ${addr} + business hours
9. Footer: WhatsApp + Phone + Address + Hours + social links

# SEO & TECHNICAL
- Meta: "${name} | ${niche} in ${l.city}"
- LocalBusiness schema markup in JSON-LD
- All images with loading="lazy" and descriptive alt text
- Lighthouse mobile 90+

${platform === "lovable" || platform === "bolt" ? "OUTPUT: Single React + Tailwind page. No backend." : platform === "claude-code" ? "OUTPUT: Next.js 15 app with app router, Tailwind, shadcn. Single landing page route." : "OUTPUT: Static HTML + Tailwind CDN. Single index.html, self-contained."}

Generate now. Then list 3 sentences to show the owner why this beats their current ${l.audit.hasWebsite ? "outdated site" : "Google listing only"}.`;
}

function demoSiteHtml(l: RankedLead): string {
  const wa = (l.whatsapp ?? l.phone ?? "919999999999").replace(/\D/g, "");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${l.name}</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>body{font-family:ui-serif,Georgia,serif;background:#f5efe6;color:#2c2620}h1,h2,.sans{font-family:ui-sans-serif,system-ui,sans-serif}</style>
</head><body>
<header class="border-b border-stone-200 bg-[#faf6ee]"><div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between"><div class="font-medium tracking-tight text-stone-800 text-lg">${l.name}</div><a href="tel:${(l.phone ?? "").replace(/\s/g, "")}" class="text-sm text-stone-600 sans">${l.phone ?? ""}</a></div></header>
<section><div class="max-w-5xl mx-auto px-6 py-20 sm:py-28"><div class="text-[11px] uppercase tracking-[0.2em] text-stone-500 sans">${l.category} · ${l.city}</div><h1 class="text-4xl sm:text-6xl font-medium mt-4 leading-[1.05] tracking-tight text-stone-900">Trusted local ${l.category}.<br/><span class="italic text-stone-500">Now online.</span></h1><p class="mt-6 text-lg text-stone-600 max-w-xl leading-relaxed">${l.rating ? `${l.rating} stars · ${l.reviewsCount} reviews.` : "Serving the community."} Book in under a minute on WhatsApp.</p><div class="mt-8 flex gap-3 sans"><a href="https://wa.me/${wa}" class="bg-stone-900 text-stone-50 font-medium px-7 py-3.5 rounded-full text-sm tracking-wide hover:bg-stone-700 transition">Book on WhatsApp →</a><a href="tel:${(l.phone ?? "").replace(/\s/g, "")}" class="border border-stone-300 text-stone-700 px-7 py-3.5 rounded-full text-sm tracking-wide">Call us</a></div></div></section>
<section class="bg-[#ede4d3] border-y border-stone-200"><div class="max-w-5xl mx-auto px-6 py-14 grid sm:grid-cols-3 gap-8 text-center"><div><div class="text-4xl font-medium text-stone-900">${l.reviewsCount ?? "—"}+</div><div class="text-[11px] uppercase tracking-[0.2em] text-stone-500 mt-2 sans">Happy customers</div></div><div><div class="text-4xl font-medium text-stone-900">${l.rating ?? "—"}</div><div class="text-[11px] uppercase tracking-[0.2em] text-stone-500 mt-2 sans">Rating</div></div><div><div class="text-4xl font-medium text-stone-900">${l.yearsInBusiness ?? 8}+</div><div class="text-[11px] uppercase tracking-[0.2em] text-stone-500 mt-2 sans">Years serving</div></div></div></section>
<section class="max-w-5xl mx-auto px-6 py-16"><h2 class="text-3xl font-medium tracking-tight text-stone-900">Our services</h2><div class="grid sm:grid-cols-3 gap-px bg-stone-200 mt-8 border border-stone-200">${["Service 1","Service 2","Service 3","Service 4","Service 5","Service 6"].map(s=>`<div class="bg-[#faf6ee] p-6"><div class="font-medium text-stone-900">${s}</div><div class="text-xs text-stone-500 mt-1.5 sans">Reliable · modern · affordable</div></div>`).join("")}</div></section>
<a href="https://wa.me/${wa}" class="fixed bottom-6 right-6 bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-xl shadow-lg">💬</a>
<footer class="bg-[#ede4d3] border-t border-stone-200 sans"><div class="max-w-5xl mx-auto px-6 py-8 text-xs text-stone-500 flex justify-between"><span>© ${l.name}</span><span>${l.address}</span></div></footer>
</body></html>`;
}
