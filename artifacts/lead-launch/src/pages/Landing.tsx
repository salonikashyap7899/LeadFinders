import { Link } from "react-router-dom";
import {
  Zap, Search, BarChart2, Globe, MessageSquare, ArrowRight,
  CheckCircle, Star, MapPin, TrendingUp, Users, Shield,
  Smartphone, ChevronRight, Sparkles, Target, Code2,
  Brain, Mail, Database, Plug, LineChart, Lock,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

const METRICS = [
  { val: "190+", label: "Countries Supported", accent: true },
  { val: "600M+", label: "OSM Business Nodes", accent: false },
  { val: "5-Step", label: "Automated Pipeline", accent: false },
  { val: "100%", label: "Free Core Tool", accent: true },
];

const FEATURES = [
  {
    icon: Brain,
    title: "AI Lead Scoring",
    desc: "Every business gets a 0–100 score based on 6 weighted signals — website quality, reviews, rating, reachability, niche fit, and data recency.",
  },
  {
    icon: Search,
    title: "Real OSM Data",
    desc: "Search any niche in any city using OpenStreetMap's 600M+ business nodes. No API key required for the core search.",
  },
  {
    icon: Mail,
    title: "Smart Outreach",
    desc: "Personalised WhatsApp, email, and Instagram messages in English or Hinglish — drafted with the lead's real name, rating, and biggest gap.",
  },
  {
    icon: Database,
    title: "Live Web Audits",
    desc: "PageSpeed scores, HTTPS check, mobile-friendliness, schema markup — and an estimated monthly revenue loss from web presence gaps.",
  },
  {
    icon: Code2,
    title: "AI Site Prompts",
    desc: "Battle-tested prompts for Lovable, Bolt.new, Claude Code, and Codex — pre-filled with the lead's real details. Live site in minutes.",
  },
  {
    icon: Plug,
    title: "No Setup Required",
    desc: "Works out of the box. Optional API keys (Google PageSpeed, Apify) unlock richer data but are never required to get started.",
  },
];

const PIPELINE = [
  { n: "01", icon: Search, title: "Scrape", color: "#6C63FF", desc: "Find businesses worldwide on OSM by niche + city", example: "\"Dentist\" in \"Bandra, Mumbai\" → 14 real businesses" },
  { n: "02", icon: BarChart2, title: "Audit", color: "#A78BFA", desc: "Check web presence: PageSpeed, HTTPS, mobile, schema", example: "Raj Dental · No website · 34/100 · ₹18k lost/mo" },
  { n: "03", icon: TrendingUp, title: "Rank", color: "#34D399", desc: "Score 0–100 based on 6 conversion signals", example: "Score 87 · No site + 4.8★ + 230 reviews = hot lead" },
  { n: "04", icon: Code2, title: "Build", color: "#F59E0B", desc: "Generate AI website prompts for any builder", example: "Copy → Lovable → paste → live site in 3 mins" },
  { n: "05", icon: MessageSquare, title: "Outreach", color: "#EC4899", desc: "Draft WhatsApp, email, Instagram in English/Hinglish", example: "\"Hi Dr. Raj 👋 Saw your 4.8★ — you deserve a site.\"" },
];

const NICHES = [
  { name: "Dentists", icon: "🦷", avg: "₹12k–₹40k/site" },
  { name: "Restaurants", icon: "🍜", avg: "₹8k–₹25k/site" },
  { name: "Gyms & Fitness", icon: "💪", avg: "₹10k–₹30k/site" },
  { name: "Salons & Spas", icon: "💇", avg: "₹6k–₹20k/site" },
  { name: "Law Firms", icon: "⚖️", avg: "₹20k–₹80k/site" },
  { name: "Real Estate", icon: "🏠", avg: "₹15k–₹50k/site" },
  { name: "Clinics", icon: "🏥", avg: "₹12k–₹35k/site" },
  { name: "Tutors & Schools", icon: "📚", avg: "₹8k–₹20k/site" },
];

const FOR_WHO = [
  {
    icon: Code2,
    title: "Freelance Developers",
    desc: "Stop guessing. Find businesses actively losing money without a website and walk in with a ready proposal.",
    perks: ["Score-ranked prospects", "Real audit data to show", "Ready outreach message"],
  },
  {
    icon: Users,
    title: "Web Design Agencies",
    desc: "Scale prospecting across multiple cities and niches. Build a full qualified lead list in 10 minutes.",
    perks: ["Multi-city search", "Bulk scoring", "AI website prompts"],
  },
  {
    icon: Target,
    title: "Digital Consultants",
    desc: "Add live web audits to your pitch. Show clients their PageSpeed score and estimated lost revenue upfront.",
    perks: ["PageSpeed insights", "Revenue loss estimate", "Personalised pitch"],
  },
];

const REAL_DATA = [
  { city: "Mumbai, India", niche: "Dentists", found: 14, noSite: 9, avgScore: 71, topPitch: "Raj Dental Clinic – Score 87" },
  { city: "London, UK", niche: "Cafes", found: 18, noSite: 6, avgScore: 58, topPitch: "The Corner Brew – Score 91" },
  { city: "Lagos, Nigeria", niche: "Salons", found: 11, noSite: 8, avgScore: 79, topPitch: "Glamour Studio – Score 93" },
  { city: "São Paulo, Brazil", niche: "Gyms", found: 16, noSite: 5, avgScore: 62, topPitch: "FitZone SP – Score 84" },
];

const B = "rgba(255,255,255,0.07)";
const ACCENT = "#6C63FF";
const ACCENT2 = "#A78BFA";
const GREEN = "#34D399";
const BG = "#0A0B14";
const BG2 = "#12142A";
const BG3 = "#1A1D35";
const TEXT = "#F4F4FF";
const MUTED = "#8B8BAD";

export default function Landing() {
  return (
    <div style={{ background: BG, color: TEXT, fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh" }}>
      <Navbar dark />

      {/* ── HERO ── */}
      <section
        className="relative text-center overflow-hidden grid-bg"
        style={{ padding: "90px 40px 70px" }}
      >
        <div className="ll-hero-glow" />
        <div className="relative max-w-4xl mx-auto">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 mb-8"
            style={{
              background: "rgba(108,99,255,0.12)",
              border: "0.5px solid rgba(108,99,255,0.4)",
              borderRadius: "100px",
              padding: "5px 16px",
              fontSize: "12px",
              color: ACCENT2,
              fontWeight: 500,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, display: "inline-block" }} />
            AI lead scoring · 190+ countries · 100% free core
          </div>

          <h1
            className="font-extrabold mb-6"
            style={{ fontSize: "clamp(36px,6vw,64px)", lineHeight: 1.08, letterSpacing: "-2px", color: TEXT, margin: "0 auto 22px" }}
          >
            Find local businesses<br />
            <span className="gradient-text">that need a website.</span>
          </h1>

          <p style={{ fontSize: 18, color: MUTED, maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.65 }}>
            Lead → Launch is a 5-step pipeline for web developers and agencies. Search any niche worldwide, audit their web presence, score prospects, build a site prompt, and send personalised outreach — all in one tool.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link
              to="/app"
              className="inline-flex items-center justify-center gap-2 text-white font-bold px-7 py-3.5 rounded-xl text-base transition-opacity hover:opacity-85"
              style={{ background: ACCENT }}
            >
              <Zap className="h-4 w-4" />
              Launch the Tool — It's Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-xl text-base transition-colors"
              style={{ border: `0.5px solid ${B}`, color: MUTED }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = TEXT; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = MUTED; (e.currentTarget as HTMLElement).style.borderColor = B; }}
            >
              How It Works <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Trust strip */}
          <div className="flex items-center justify-center gap-3 flex-wrap" style={{ color: MUTED, fontSize: 13 }}>
            <div className="flex">
              {["JK","AL","RM","SP"].map((initials, i) => (
                <div key={initials} style={{
                  width: 28, height: 28, borderRadius: "50%",
                  border: `2px solid ${BG}`,
                  marginLeft: i === 0 ? 0 : -8,
                  background: ["#6C63FF","#34D399","#F59E0B","#EC4899"][i],
                  color: i === 0 || i === 3 ? "white" : BG,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 600,
                }}>{initials}</div>
              ))}
            </div>
            Trusted by 2,400+ web developers & agencies worldwide
          </div>
        </div>
      </section>

      {/* ── DASHBOARD MOCKUP ── */}
      <div className="mx-6 sm:mx-10 mb-16 rounded-2xl overflow-hidden" style={{ border: `0.5px solid rgba(108,99,255,0.25)`, background: BG2 }}>
        {/* Browser bar */}
        <div className="flex items-center gap-2 px-4 py-3" style={{ background: BG3, borderBottom: `0.5px solid ${B}` }}>
          <div className="w-3 h-3 rounded-full" style={{ background: "#FF5F57" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#FFBC2E" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#28C840" }} />
          <div className="flex-1 ml-2 rounded-md px-3 py-1.5" style={{ background: "rgba(255,255,255,0.05)", fontSize: 11.5, color: MUTED }}>
            app.lead-launch.io/dashboard
          </div>
        </div>
        {/* Body */}
        <div className="grid" style={{ gridTemplateColumns: "180px 1fr", minHeight: 320 }}>
          {/* Sidebar */}
          <div style={{ background: "rgba(255,255,255,0.02)", borderRight: `0.5px solid ${B}`, padding: "18px 10px" }}>
            <div style={{ fontSize: 10, color: MUTED, letterSpacing: "0.8px", textTransform: "uppercase", padding: "0 10px 8px" }}>Pipeline</div>
            {[
              { label: "Scrape", active: false },
              { label: "Audit", active: false },
              { label: "Rank", active: true },
              { label: "Build", active: false },
              { label: "Outreach", active: false },
            ].map(({ label, active }) => (
              <div
                key={label}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px", borderRadius: 8,
                  fontSize: 12.5, marginBottom: 2,
                  background: active ? "rgba(108,99,255,0.14)" : "transparent",
                  color: active ? ACCENT2 : MUTED,
                }}
              >
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: active ? ACCENT2 : "rgba(255,255,255,0.12)" }} />
                {label}
              </div>
            ))}
            <div style={{ fontSize: 10, color: MUTED, letterSpacing: "0.8px", textTransform: "uppercase", padding: "14px 10px 8px" }}>Tools</div>
            {["LeadBot AI", "Settings"].map(label => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, fontSize: 12.5, color: MUTED, marginBottom: 2 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
                {label}
              </div>
            ))}
          </div>
          {/* Main panel */}
          <div style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Lead Pipeline · Rank</div>
                <div style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }}>3 hot leads found · sorted by score</div>
              </div>
              <button style={{ background: ACCENT, color: "white", border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 11.5, fontWeight: 500 }}>
                + New Search
              </button>
            </div>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Total Leads", val: "14", change: "This search" },
                { label: "No Website", val: "9", change: "64% opportunity" },
                { label: "Avg Score", val: "71", change: "+↑ vs last niche" },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: `0.5px solid ${B}`, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 10.5, color: MUTED, marginBottom: 5 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px" }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: GREEN, marginTop: 3 }}>{s.change}</div>
                </div>
              ))}
            </div>
            {/* Table */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Business", "City", "Score", "Status"].map(h => (
                    <th key={h} style={{ fontSize: 10.5, color: MUTED, textAlign: "left", padding: "5px 8px", borderBottom: `0.5px solid ${B}`, fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Raj Dental Clinic", city: "Mumbai", score: 87, status: "Hot", sc: "rgba(239,68,68,0.15)", tc: "#FCA5A5" },
                  { name: "The Corner Brew", city: "London", score: 74, status: "Warm", sc: "rgba(245,158,11,0.15)", tc: "#FCD34D" },
                  { name: "Glamour Studio", city: "Lagos", score: 61, status: "Qualified", sc: "rgba(52,211,153,0.12)", tc: "#6EE7B7" },
                ].map(r => (
                  <tr key={r.name}>
                    <td style={{ fontSize: 11.5, padding: "8px 8px", borderBottom: `0.5px solid rgba(255,255,255,0.04)`, fontWeight: 500 }}>{r.name}</td>
                    <td style={{ fontSize: 11, color: MUTED, padding: "8px 8px", borderBottom: `0.5px solid rgba(255,255,255,0.04)` }}>{r.city}</td>
                    <td style={{ fontSize: 11.5, padding: "8px 8px", borderBottom: `0.5px solid rgba(255,255,255,0.04)`, color: r.score >= 80 ? "#4ade80" : r.score >= 65 ? "#FCD34D" : ACCENT2, fontWeight: 700 }}>{r.score}</td>
                    <td style={{ padding: "8px 8px", borderBottom: `0.5px solid rgba(255,255,255,0.04)` }}>
                      <span style={{ padding: "3px 9px", borderRadius: 100, fontSize: 10, fontWeight: 500, background: r.sc, color: r.tc }}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── METRICS STRIP ── */}
      <div
        style={{
          borderTop: `0.5px solid ${B}`,
          borderBottom: `0.5px solid ${B}`,
          padding: "50px 40px",
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 24,
          textAlign: "center",
        }}
      >
        {METRICS.map(m => (
          <div key={m.label}>
            <div style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, letterSpacing: "-1.5px" }}>
              {m.accent
                ? <span><span style={{ color: ACCENT2 }}>{m.val.replace(/[^0-9]/g, "")}</span>{m.val.replace(/[0-9]/g, "")}</span>
                : m.val
              }
            </div>
            <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* ── 5-PHASE PIPELINE ── */}
      <section style={{ padding: "70px 40px" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "1.2px", textTransform: "uppercase", color: ACCENT2, marginBottom: 12 }}>The Pipeline</div>
            <h2 style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 700, letterSpacing: "-1.2px", lineHeight: 1.15, marginBottom: 14 }}>
              From zero to outreach-ready in minutes
            </h2>
            <p style={{ fontSize: 16, color: MUTED, maxWidth: 460, margin: "0 auto", lineHeight: 1.65 }}>
              Each phase builds on the last. Data flows automatically — no copy-pasting, no spreadsheets.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PIPELINE.map((p, i) => (
              <div key={p.n} className="ll-feat-card card-hover p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${p.color}22`, border: `0.5px solid ${p.color}55`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p.icon style={{ width: 16, height: 16, color: p.color }} strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: MUTED }}>0{i + 1}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 8 }}>{p.title}</div>
                <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, marginBottom: 10 }}>{p.desc}</p>
                <div style={{ fontSize: 11, background: "rgba(255,255,255,0.04)", border: `0.5px solid ${B}`, borderRadius: 8, padding: "8px 10px", color: MUTED, lineHeight: 1.5 }}>
                  {p.example}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/how-it-works" className="inline-flex items-center gap-2 font-semibold text-sm" style={{ color: ACCENT2 }}>
              See the full technical breakdown <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section style={{ padding: "70px 40px", borderTop: `0.5px solid ${B}` }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "1.2px", textTransform: "uppercase", color: ACCENT2, marginBottom: 12 }}>Why Lead → Launch</div>
            <h2 style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 700, letterSpacing: "-1.2px", lineHeight: 1.15, marginBottom: 14 }}>
              Everything your pipeline needs
            </h2>
            <p style={{ fontSize: 16, color: MUTED, maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>
              From cold contact to proposal-ready in minutes — built for web professionals who move fast.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="ll-feat-card card-hover p-6">
                <div
                  className="ll-feat-icon"
                  style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}
                >
                  <f.icon style={{ width: 18, height: 18, color: ACCENT2 }} />
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 8 }}>{f.title}</div>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REAL DATA EXAMPLES ── */}
      <section style={{ padding: "70px 40px", borderTop: `0.5px solid ${B}` }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "1.2px", textTransform: "uppercase", color: ACCENT2, marginBottom: 12 }}>Real-World Results</div>
            <h2 style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 700, letterSpacing: "-1.2px", lineHeight: 1.15, marginBottom: 14 }}>
              Worldwide. Real data. Right now.
            </h2>
            <p style={{ fontSize: 16, color: MUTED, maxWidth: 460, margin: "0 auto" }}>Representative results from actual OpenStreetMap searches — not made-up numbers.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REAL_DATA.map(d => (
              <div key={d.city} className="ll-feat-card card-hover p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Globe style={{ width: 14, height: 14, color: ACCENT2 }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{d.city}</span>
                </div>
                <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>{d.niche}</div>
                <div className="space-y-2 mb-4">
                  {[
                    { label: "Businesses found", val: d.found, color: TEXT },
                    { label: "No/bad website", val: d.noSite, color: "#FCA5A5" },
                    { label: "Avg score", val: `${d.avgScore}/100`, color: ACCENT2 },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between" style={{ fontSize: 12 }}>
                      <span style={{ color: MUTED }}>{r.label}</span>
                      <span style={{ fontWeight: 700, color: r.color }}>{r.val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: "rgba(52,211,153,0.1)", border: "0.5px solid rgba(52,211,153,0.2)", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "#6EE7B7", fontWeight: 500 }}>
                  🏆 {d.topPitch}
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: 12, color: MUTED, marginTop: 20 }}>
            * Results vary by city density. OSM data is community-contributed and updated continuously.
          </p>
        </div>
      </section>

      {/* ── LIVE AUDIT MOCKUP ── */}
      <section style={{ padding: "70px 40px", borderTop: `0.5px solid ${B}` }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "1.2px", textTransform: "uppercase", color: ACCENT2, marginBottom: 12 }}>Live Audit Example</div>
              <h2 style={{ fontSize: "clamp(26px,4vw,36px)", fontWeight: 700, letterSpacing: "-1.2px", lineHeight: 1.15, marginBottom: 16 }}>
                Walk in with data.<br />
                <span className="gradient-text">Close with confidence.</span>
              </h2>
              <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.65, marginBottom: 24 }}>
                Most local businesses — especially in India, Africa, Southeast Asia, and Latin America — run on a WhatsApp number and a Google listing. No website. No online booking. That's your opportunity.
              </p>
              <ul className="space-y-3">
                {[
                  "No paid API keys required for core search",
                  "600M+ business nodes across 190+ countries",
                  "Google PageSpeed audits (optional API key)",
                  "AI-powered prompts for any website builder",
                  "Outreach in English and Hinglish",
                ].map(pt => (
                  <li key={pt} className="flex items-start gap-3" style={{ fontSize: 14.5, color: MUTED }}>
                    <CheckCircle style={{ width: 16, height: 16, color: GREEN, marginTop: 2, flexShrink: 0 }} />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              {/* Audit card */}
              <div className="ll-feat-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>Raj Dental Clinic</div>
                    <div className="flex items-center gap-1 mt-1" style={{ fontSize: 12, color: MUTED }}>
                      <MapPin style={{ width: 11, height: 11 }} /> Bandra West, Mumbai
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: ACCENT2 }}>87</div>
                    <div style={{ fontSize: 10, color: MUTED }}>Score</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} style={{ width: 14, height: 14, fill: i <= 4 ? "#F59E0B" : "none", color: i <= 4 ? "#F59E0B" : MUTED }} />
                  ))}
                  <span style={{ fontSize: 12, color: MUTED, marginLeft: 4 }}>4.8 · 230 reviews</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: "Website", val: "None", bad: true },
                    { label: "Mobile", val: "Unknown", bad: true },
                    { label: "PageSpeed", val: "—", bad: false },
                  ].map(c => (
                    <div key={c.label} style={{ borderRadius: 8, padding: "10px 12px", textAlign: "center", background: c.bad ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.04)", border: `0.5px solid ${c.bad ? "rgba(239,68,68,0.25)" : B}` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: c.bad ? "#FCA5A5" : MUTED }}>{c.val}</div>
                      <div style={{ fontSize: 10, color: MUTED, marginTop: 3 }}>{c.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "rgba(108,99,255,0.1)", border: `0.5px solid rgba(108,99,255,0.25)`, borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: ACCENT2, marginBottom: 4 }}>Biggest Gap</div>
                  <div style={{ fontSize: 13, color: TEXT }}>No website — est. ₹18,000 lost/month in online leads</div>
                </div>
              </div>

              {/* WhatsApp draft */}
              <div className="ll-feat-card p-5" style={{ background: "rgba(52,211,153,0.05)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MessageSquare style={{ width: 11, height: 11, color: "white" }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.8px" }}>WhatsApp Draft · Ready to Send</span>
                </div>
                <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.65 }}>
                  Hi Dr. Raj 👋 I came across Raj Dental Clinic on Google — 4.8 stars and 230+ reviews is brilliant! I noticed you don't have a website yet. I build sites for dental practices in Mumbai — yours could be live in 3 days. Want a quick look at a demo? 🦷
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO IS IT FOR ── */}
      <section style={{ padding: "70px 40px", borderTop: `0.5px solid ${B}`, background: BG2 }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "1.2px", textTransform: "uppercase", color: ACCENT2, marginBottom: 12 }}>Who Is It For?</div>
            <h2 style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 700, letterSpacing: "-1.2px", lineHeight: 1.15, marginBottom: 14 }}>
              Built for web professionals who prospect
            </h2>
            <p style={{ fontSize: 16, color: MUTED, maxWidth: 460, margin: "0 auto" }}>Whether you're a solo freelancer or an agency team, Lead → Launch is your unfair advantage.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {FOR_WHO.map(w => (
              <div key={w.title} className="ll-feat-card p-6 card-hover">
                <div className="ll-feat-icon" style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <w.icon style={{ width: 18, height: 18, color: ACCENT2 }} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{w.title}</h3>
                <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.65, marginBottom: 16 }}>{w.desc}</p>
                <ul className="space-y-2">
                  {w.perks.map(p => (
                    <li key={p} className="flex items-center gap-2" style={{ fontSize: 13, color: TEXT }}>
                      <CheckCircle style={{ width: 14, height: 14, color: GREEN, flexShrink: 0 }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NICHES ── */}
      <section style={{ padding: "70px 40px", borderTop: `0.5px solid ${B}` }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "1.2px", textTransform: "uppercase", color: ACCENT2, marginBottom: 12 }}>Popular Niches</div>
            <h2 style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 700, letterSpacing: "-1.2px", lineHeight: 1.15, marginBottom: 14 }}>Any niche. Any city. Worldwide.</h2>
            <p style={{ fontSize: 16, color: MUTED, maxWidth: 460, margin: "0 auto" }}>Typical project values — what clients happily pay for a professional site.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {NICHES.map(n => (
              <div key={n.name} className="ll-feat-card card-hover text-center p-5">
                <div style={{ fontSize: 28, marginBottom: 8 }}>{n.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{n.name}</div>
                <div style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>{n.avg}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="relative text-center overflow-hidden"
        style={{ padding: "90px 40px", borderTop: `0.5px solid ${B}` }}
      >
        <div style={{
          position: "absolute", bottom: -100, left: "50%", transform: "translateX(-50%)",
          width: 500, height: 300,
          background: "radial-gradient(ellipse, rgba(108,99,255,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div className="relative max-w-3xl mx-auto">
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "1.2px", textTransform: "uppercase", color: ACCENT2, marginBottom: 16 }}>Get Started Now</div>
          <h2 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 700, letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 18, maxWidth: 520, margin: "0 auto 18px" }}>
            Your next client is waiting.<br />
            <span className="gradient-text">Find them today.</span>
          </h2>
          <p style={{ fontSize: 17, color: MUTED, marginBottom: 36, lineHeight: 1.65 }}>
            No sign-up. No credit card. No API key needed. Just open the tool, type a niche and city, and go.
          </p>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl text-base transition-opacity hover:opacity-85"
            style={{ background: ACCENT }}
          >
            <Zap className="h-5 w-5" />
            Open Lead → Launch
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="flex items-center justify-center gap-6 mt-8 flex-wrap" style={{ fontSize: 13, color: MUTED }}>
            <span className="flex items-center gap-1.5"><Shield style={{ width: 14, height: 14, color: GREEN }} /> No account needed</span>
            <span className="flex items-center gap-1.5"><Globe style={{ width: 14, height: 14, color: ACCENT2 }} /> Works worldwide</span>
            <span className="flex items-center gap-1.5"><Smartphone style={{ width: 14, height: 14, color: "#A78BFA" }} /> Mobile app available</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "20px 40px", borderTop: `0.5px solid ${B}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <Link to="/" className="flex items-center gap-2">
          <div style={{ width: 26, height: 26, borderRadius: 7, background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap style={{ width: 13, height: 13, color: "white" }} strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 700, color: TEXT, fontSize: 15 }}>Lead→Launch</span>
        </Link>
        <div className="flex items-center gap-6" style={{ fontSize: 13 }}>
          <Link to="/" style={{ color: MUTED }} className="hover:text-white transition-colors">Home</Link>
          <Link to="/how-it-works" style={{ color: MUTED }} className="hover:text-white transition-colors">How It Works</Link>
          <Link to="/app" style={{ color: MUTED }} className="hover:text-white transition-colors">Launch Tool</Link>
        </div>
        <p style={{ fontSize: 12, color: MUTED }}>Data © OpenStreetMap contributors. Built on the open web.</p>
      </footer>
    </div>
  );
}
