import { Link } from "react-router-dom";
import {
  Search, BarChart2, TrendingUp, Code2, MessageSquare,
  Globe, Zap, ArrowRight, CheckCircle, AlertTriangle,
  Star, Database, Cpu, Lock, Clock, DollarSign, ChevronRight
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

const PHASES = [
  {
    num: "01",
    icon: Search,
    color: "bg-indigo-600",
    accent: "indigo",
    title: "Scrape — Find businesses worldwide",
    tagline: "Real OpenStreetMap data, no API key required",
    what: "You enter a business niche (e.g. 'Dentist', 'Restaurant', 'Gym') and a city anywhere in the world. The tool queries the Overpass API — OpenStreetMap's query engine — to find real, community-verified businesses matching your criteria.",
    how: [
      "Overpass QL query targets `amenity`, `shop`, and `office` OSM tags",
      "Results include name, address, coordinates, phone, website, opening hours",
      "Optional: Apify Google Maps crawler for richer data (rating, reviews, photos) when you set APIFY_TOKEN",
      "Up to 20 results per search — higher counts trigger Overpass rate limits",
      "Each result shown progressively as it arrives, with a live map",
    ],
    dataExample: {
      title: "Raw OSM result",
      fields: [
        { k: "name", v: "Raj Dental Clinic" },
        { k: "amenity", v: "dentist" },
        { k: "addr:full", v: "12 Hill Road, Bandra West, Mumbai" },
        { k: "phone", v: "+91 98765 43210" },
        { k: "website", v: "(none)" },
        { k: "opening_hours", v: "Mo-Sa 10:00-19:00" },
      ]
    },
    note: "OSM data is community-contributed and updated continuously. Coverage is best in urban areas of Europe, North America, and South/Southeast Asia.",
  },
  {
    num: "02",
    icon: BarChart2,
    color: "bg-violet-600",
    accent: "violet",
    title: "Audit — Check web presence quality",
    tagline: "PageSpeed API + heuristic scoring in seconds",
    what: "Each scraped lead is audited for web presence quality. If a business has a website, it's tested against Google's PageSpeed Insights API. If not, the audit flags the gap and estimates monthly revenue loss from missing online leads.",
    how: [
      "Google PageSpeed Insights API called if GOOGLE_PAGESPEED_KEY is set — otherwise uses heuristics",
      "Checks: website exists?, HTTPS?, mobile-friendly?, schema markup?, page load time",
      "Estimates monthly lost revenue based on niche average lead value × local search volume proxy",
      "Biggestgap field identifies the #1 selling point for your pitch",
      "Audits run in parallel with a 300ms stagger to avoid rate limits",
    ],
    dataExample: {
      title: "Audit result",
      fields: [
        { k: "hasWebsite", v: "false" },
        { k: "pageSpeedScore", v: "—" },
        { k: "mobileFriendly", v: "false" },
        { k: "https", v: "false" },
        { k: "loadTimeMs", v: "—" },
        { k: "estLostRevenue", v: "₹18,000 / month" },
        { k: "biggestGap", v: "No website — massive local SEO gap" },
      ]
    },
    note: "Without GOOGLE_PAGESPEED_KEY, the tool uses heuristic estimates based on website presence and common patterns. Results are directionally accurate — sufficient for a sales pitch.",
  },
  {
    num: "03",
    icon: TrendingUp,
    color: "bg-blue-600",
    accent: "blue",
    title: "Rank — Score every prospect 0–100",
    tagline: "Client-side algorithm — instant re-ranking, no server round-trip",
    what: "Every lead gets a composite conversion score based on six weighted signals. The score predicts how likely the business owner is to say 'yes' to a professional website — because their current situation is costing them visible, quantifiable money.",
    how: [
      "No website or poor site: +30–40 points (biggest signal — no site = guaranteed interest)",
      "Review volume: up to +20 points (high reviews = active business, values reputation)",
      "Rating: up to +15 points (4.5★+ owners care deeply about perception)",
      "Reachability: +10 points for phone and WhatsApp present",
      "Industry fit: +10 points for high-ROI niches (dental, legal, medical)",
      "Recency: +5 points for recent data freshness",
    ],
    dataExample: {
      title: "Score breakdown",
      fields: [
        { k: "noOrBadSite", v: "35 / 40" },
        { k: "reviewVolume", v: "16 / 20 (230 reviews)" },
        { k: "rating", v: "13 / 15 (4.8★)" },
        { k: "recency", v: "4 / 5" },
        { k: "reachable", v: "9 / 10 (phone + WhatsApp)" },
        { k: "industryFit", v: "10 / 10 (dental)" },
        { k: "TOTAL", v: "87 / 100 ← HOT LEAD" },
      ]
    },
    note: "Scoring is entirely client-side — no API calls, instant results. You can re-rank as you toggle different leads or after adding new audits.",
  },
  {
    num: "04",
    icon: Code2,
    color: "bg-emerald-600",
    accent: "emerald",
    title: "Build — Generate a website prompt",
    tagline: "Battle-tested prompts for Lovable, Bolt, Claude Code, Codex",
    what: "With one selected lead, the tool generates a comprehensive, structured prompt you can paste directly into an AI website builder. The prompt is pre-filled with the business's real name, category, phone, address, review count, and audit findings — so the AI produces a site specific to this exact client.",
    how: [
      "Platform selector: Lovable, Bolt.new, Claude Code, or OpenAI Codex",
      "Prompt includes: business details, brand tone, section order, SEO meta, schema.org markup instructions, WhatsApp CTA, LocalBusiness JSON-LD",
      "Output instructions vary per platform (React + Tailwind vs Next.js vs static HTML)",
      "Live iframe preview of a demo site is rendered inline — show the client immediately",
      "Copy prompt to clipboard → paste into your builder → live site in minutes",
    ],
    dataExample: {
      title: "Prompt excerpt (Lovable)",
      fields: [
        { k: "Target", v: "Raj Dental Clinic, Bandra Mumbai" },
        { k: "Sections", v: "Hero → Trust strip → Services → Reviews → FAQ → Map → Footer" },
        { k: "CTA", v: "WhatsApp float + Click-to-call header" },
        { k: "SEO", v: "LocalBusiness schema + meta title" },
        { k: "Mobile", v: "Mobile-first, Lighthouse 90+" },
        { k: "Output", v: "Single React + Tailwind page" },
      ]
    },
    note: "The demo iframe is a static preview — it uses the lead's real name, rating, and city but with placeholder services and photos. Replace with real content after the client signs.",
  },
  {
    num: "05",
    icon: MessageSquare,
    color: "bg-rose-600",
    accent: "rose",
    title: "Outreach — Send hyper-personalised messages",
    tagline: "WhatsApp, Email, Instagram · English & Hinglish",
    what: "Three outreach channels, two languages, all personalised with the lead's real name, rating, review count, and biggest gap. Every message references something specific about the business — not a generic cold template — which dramatically improves reply rates.",
    how: [
      "WhatsApp: casual, emoji-friendly, short — designed for business owners who live on their phones",
      "Email: professional subject line + structured body with audit findings as selling points",
      "Instagram DM: brief, curiosity-driven — reference their review count to stand out",
      "Hinglish mode: natural mix of Hindi and English used by Indian business owners",
      "One-click copy for each message — paste directly into your messaging app",
    ],
    dataExample: {
      title: "WhatsApp (English)",
      fields: [
        { k: "Opening", v: "Hi Dr. Raj 👋 I saw your clinic on Google — 4.8★ and 230 reviews is brilliant!" },
        { k: "Hook", v: "I noticed you don't have a website yet." },
        { k: "Pitch", v: "I build sites for dental practices in Mumbai — yours could be live in 3 days." },
        { k: "CTA", v: "Want to see a free demo? 🦷" },
      ]
    },
    note: "Hinglish messages are specifically designed for Indian SMB owners where a mix of Hindi and English is the natural way to communicate trust and familiarity.",
  },
];

const DATA_SOURCES = [
  { icon: Globe, name: "OpenStreetMap", desc: "600M+ nodes, 190+ countries, free, community-verified", label: "Primary" },
  { icon: Database, name: "Overpass API", desc: "OSM's query engine — powers real-time business search", label: "Primary" },
  { icon: Cpu, name: "Google PageSpeed", desc: "Real Lighthouse scores when GOOGLE_PAGESPEED_KEY is set", label: "Optional" },
  { icon: Search, name: "Apify Maps Crawler", desc: "Richer data (reviews, photos, ratings) via APIFY_TOKEN", label: "Optional" },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-slate-50 border-b border-slate-200 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            <Zap className="h-3 w-3" />
            Technical Deep Dive
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 mb-5">How Lead → Launch works</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Every phase of the pipeline explained — data sources, algorithms, APIs, and the logic behind each decision. No fluff, just the actual mechanics.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8">
            <Link to="/app" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
              <Zap className="h-4 w-4" /> Open the Tool
            </Link>
            <Link to="/" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
              Back to home <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Data sources</h2>
        <p className="text-slate-500 mb-8">Lead → Launch uses entirely free, open data sources by default. Optional API keys unlock premium data.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
          {DATA_SOURCES.map((s) => (
            <div key={s.name} className={`border rounded-xl p-4 ${s.label === "Optional" ? "border-slate-200 bg-slate-50" : "border-indigo-100 bg-indigo-50"}`}>
              <div className="flex items-center justify-between mb-3">
                <s.icon className={`h-5 w-5 ${s.label === "Optional" ? "text-slate-400" : "text-indigo-600"}`} />
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.label === "Optional" ? "bg-slate-200 text-slate-600" : "bg-indigo-100 text-indigo-700"}`}>{s.label}</span>
              </div>
              <div className="font-semibold text-slate-800 text-sm mb-1">{s.name}</div>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400">Setting env vars <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">APIFY_TOKEN</code> and <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">GOOGLE_PAGESPEED_KEY</code> enables optional sources. The tool works fully without them.</p>
      </section>

      {/* Phase-by-phase */}
      <div className="max-w-5xl mx-auto px-6 pb-20 space-y-16">
        {PHASES.map((phase, idx) => (
          <div key={phase.num} className="scroll-mt-20" id={`phase-${idx + 1}`}>
            <div className="flex items-start gap-4 mb-6">
              <div className={`h-12 w-12 rounded-2xl ${phase.color} flex items-center justify-center shrink-0 shadow-lg`}>
                <phase.icon className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Phase {phase.num}</div>
                <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">{phase.title}</h2>
                <p className="text-slate-500 text-sm mt-1">{phase.tagline}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">What it does</h3>
                  <p className="text-slate-600 leading-relaxed">{phase.what}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">How it works</h3>
                  <ul className="space-y-2.5">
                    {phase.how.map((h) => (
                      <li key={h} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
                {phase.note && (
                  <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-800">{phase.note}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">{phase.dataExample.title}</h3>
                <div className="bg-slate-900 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-800">
                    {["#ef4444","#f59e0b","#10b981"].map(c => (
                      <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="px-4 py-4 space-y-2 font-mono text-xs">
                    {phase.dataExample.fields.map((f) => (
                      <div key={f.k} className="flex gap-2">
                        <span className="text-slate-400 shrink-0">{f.k}:</span>
                        <span className={f.k === "TOTAL" ? "text-emerald-400 font-bold" : f.v === "false" || f.v === "—" ? "text-rose-400" : "text-slate-200"}>{f.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {idx < PHASES.length - 1 && (
              <div className="mt-10 flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <ArrowRight className="h-4 w-4 text-slate-300" />
                <div className="flex-1 h-px bg-slate-200" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FAQ */}
      <section className="bg-slate-50 border-t border-slate-200 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-10 text-center">Common questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Is this really free?",
                a: "Yes. The core pipeline — search via OpenStreetMap, heuristic audit, scoring, prompt generation, and outreach drafting — requires no API keys and costs nothing. Optional keys (GOOGLE_PAGESPEED_KEY, APIFY_TOKEN) unlock premium data but are not required.",
              },
              {
                q: "What countries and cities does it cover?",
                a: "OpenStreetMap covers 190+ countries. Coverage density varies — cities in India, Germany, UK, France, and the US have excellent coverage. Rural areas and some countries in Africa/South America have sparser data but still return usable results.",
              },
              {
                q: "How accurate is the audit without an API key?",
                a: "Without GOOGLE_PAGESPEED_KEY, the audit uses heuristics — primarily checking whether a website exists and making educated estimates. This is accurate enough for a sales pitch. With the key, you get real Lighthouse scores.",
              },
              {
                q: "How is the lead score calculated?",
                a: "Six signals: no/bad website (up to 40pts), review volume (up to 20pts), rating (up to 15pts), reachability via phone/WhatsApp (up to 10pts), industry fit (up to 10pts), and data recency (up to 5pts). The algorithm is open and runs entirely in the browser.",
              },
              {
                q: "What is Hinglish outreach?",
                a: "Hinglish is a natural mix of Hindi and English spoken by most urban Indian business owners. Messages in Hinglish often get higher reply rates because they feel more personal and culturally familiar than formal English.",
              },
              {
                q: "Is there a mobile app?",
                a: "Yes — a companion Expo mobile app mirrors the full 5-phase pipeline on iOS and Android. Scan your results on the go, copy WhatsApp messages directly from your phone, and manage leads from anywhere.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="font-semibold text-slate-900 mb-2">{q}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Ready to find your first lead?</h2>
          <p className="text-lg text-slate-500 mb-8">The whole pipeline takes about 5 minutes from search to outreach-ready.</p>
          <Link
            to="/app"
            className="inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl text-base transition-colors shadow-lg shadow-indigo-600/25"
          >
            <Zap className="h-5 w-5" />
            Open the Tool — Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="bg-slate-950 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold">Lead→Launch</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link to="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <Link to="/how-it-works" className="hover:text-slate-300 transition-colors">How It Works</Link>
            <Link to="/app" className="hover:text-slate-300 transition-colors">Launch Tool</Link>
          </div>
          <p className="text-xs text-slate-600">Data © OpenStreetMap contributors</p>
        </div>
      </footer>
    </div>
  );
}
