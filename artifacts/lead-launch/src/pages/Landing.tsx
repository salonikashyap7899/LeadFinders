import { Link } from "react-router-dom";
import {
  Zap, Search, BarChart2, Globe, MessageSquare, ArrowRight,
  CheckCircle, Star, MapPin, TrendingUp, Users, Shield, Clock,
  Smartphone, ChevronRight, Sparkles, Target, DollarSign, Code2
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

const STATS = [
  { value: "190+", label: "Countries Supported", icon: Globe, color: "text-indigo-400" },
  { value: "600M+", label: "OSM Business Nodes", icon: MapPin, color: "text-emerald-400" },
  { value: "5 Steps", label: "From Search to Pitch", icon: Zap, color: "text-amber-400" },
  { value: "100%", label: "Free to Use", icon: Shield, color: "text-rose-400" },
];

const PIPELINE = [
  {
    step: "01",
    icon: Search,
    title: "Scrape",
    color: "bg-indigo-500",
    border: "border-indigo-200",
    bg: "bg-indigo-50",
    desc: "Search any niche in any city worldwide using real OpenStreetMap data. Find restaurants, dentists, gyms, salons — anything.",
    example: "\"Dentist\" in \"Bandra, Mumbai\" → 14 real businesses found",
  },
  {
    step: "02",
    icon: BarChart2,
    title: "Audit",
    color: "bg-violet-500",
    border: "border-violet-200",
    bg: "bg-violet-50",
    desc: "Automatically audit each business's web presence — PageSpeed score, mobile-friendliness, HTTPS, schema markup, load time.",
    example: "\"Raj Dental\" → No website · 2.3s load · 0 schema · 34/100 score",
  },
  {
    step: "03",
    icon: TrendingUp,
    title: "Rank",
    color: "bg-blue-500",
    border: "border-blue-200",
    bg: "bg-blue-50",
    desc: "Every lead gets a conversion score (0–100) based on site quality, review volume, rating, and reachability. Highest ROI first.",
    example: "Score 87 · No site + 4.8★ + 230 reviews = hot prospect",
  },
  {
    step: "04",
    icon: Code2,
    title: "Build",
    color: "bg-emerald-500",
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    desc: "Generate a full battle-tested website prompt for Lovable, Bolt.new, Claude Code, or Codex — with SEO, branding, and sections baked in.",
    example: "Copy prompt → Open Lovable → Paste → live site in 3 minutes",
  },
  {
    step: "05",
    icon: MessageSquare,
    title: "Outreach",
    color: "bg-rose-500",
    border: "border-rose-200",
    bg: "bg-rose-50",
    desc: "Draft hyper-personalised WhatsApp, email, and Instagram messages in English or Hinglish — ready to send in one click.",
    example: "\"Hi Raj, saw your 4.8★ rating. You deserve a website as good as your reviews.\"",
  },
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
    title: "Freelance Web Developers",
    desc: "Stop cold-emailing random lists. Find businesses actively losing money without a website and walk in with a proposal ready.",
    perks: ["Ready-made pitch deck", "Personalised outreach", "Real audit data to show"],
  },
  {
    icon: Users,
    title: "Web Design Agencies",
    desc: "Scale your prospecting pipeline. Run searches across multiple cities and niches — build a qualified lead list in 10 minutes.",
    perks: ["Multi-city search", "Score-ranked prospects", "Bulk outreach templates"],
  },
  {
    icon: Target,
    title: "Digital Marketing Consultants",
    desc: "Add website audits to your service pitch. Show clients their PageSpeed score, gaps, and estimated lost revenue upfront.",
    perks: ["PageSpeed insights", "Revenue loss estimate", "Competitor gap analysis"],
  },
];

const REAL_DATA = [
  { city: "Mumbai, India", niche: "Dentists", found: 14, noSite: 9, avgScore: 71, topPitch: "Raj Dental Clinic – Score 87" },
  { city: "London, UK", niche: "Cafes", found: 18, noSite: 6, avgScore: 58, topPitch: "The Corner Brew – Score 91" },
  { city: "Lagos, Nigeria", niche: "Salons", found: 11, noSite: 8, avgScore: 79, topPitch: "Glamour Studio – Score 93" },
  { city: "São Paulo, Brazil", niche: "Gyms", found: 16, noSite: 5, avgScore: 62, topPitch: "FitZone SP – Score 84" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <div className="hero-gradient grid-bg">
        <Navbar dark />

        {/* Hero */}
        <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-28 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wide uppercase">
            <Sparkles className="h-3 w-3" />
            Free · No API key needed · Real OpenStreetMap data
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
            Find local businesses<br />
            <span className="gradient-text">that need a website.</span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Lead → Launch is a 5-step pipeline for web developers and agencies. Search any niche worldwide, audit their web presence, score prospects, generate a website prompt, and draft personalised outreach — all in one tool.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/app"
              className="inline-flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl text-base transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50"
            >
              <Zap className="h-5 w-5" />
              Launch the Tool — It's Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center justify-center gap-2 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors"
            >
              How It Works
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-800 border border-slate-800 rounded-2xl overflow-hidden">
            {STATS.map((s) => (
              <div key={s.label} className="bg-slate-900/60 px-6 py-5 text-center">
                <s.icon className={`h-5 w-5 mx-auto mb-2 ${s.color}`} />
                <div className="text-2xl font-extrabold text-white">{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* What is Lead → Launch */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">What Is This Tool?</div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6">
              The end-to-end prospecting tool for web professionals
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              Most local businesses — especially in India, Africa, Southeast Asia, and Latin America — run on a WhatsApp number and a Google listing. No website. No online booking. No way to compete with chains that have a digital presence.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              <strong className="text-slate-900">Lead → Launch</strong> turns that gap into your opportunity. You search real OpenStreetMap data, get an instant audit report, and have a personalised pitch ready before your competitor even opens their laptop.
            </p>
            <ul className="space-y-3">
              {[
                "No paid API keys required for basic search",
                "Real business data from OpenStreetMap (600M+ nodes worldwide)",
                "Google PageSpeed audits when you supply your API key",
                "AI-powered website prompts for Lovable, Bolt, Claude Code, Codex",
                "Outreach in English and Hinglish",
              ].map((pt) => (
                <li key={pt} className="flex items-start gap-3 text-slate-700">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            {/* Mock audit card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-bold text-slate-900">Raj Dental Clinic</div>
                  <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> Bandra West, Mumbai
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-indigo-600">87</div>
                  <div className="text-xs text-slate-500">Score</div>
                </div>
              </div>
              <div className="flex gap-1.5 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className={`h-4 w-4 ${i <= 4 ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />)}
                <span className="text-sm text-slate-600 ml-1">4.8 · 230 reviews</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Website", val: "None", bad: true },
                  { label: "Mobile", val: "Unknown", bad: true },
                  { label: "PageSpeed", val: "—", bad: false },
                ].map(c => (
                  <div key={c.label} className={`rounded-lg p-3 text-center ${c.bad ? "bg-rose-50 border border-rose-100" : "bg-slate-50 border border-slate-100"}`}>
                    <div className={`text-xs font-semibold ${c.bad ? "text-rose-600" : "text-slate-600"}`}>{c.val}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{c.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3">
                <div className="text-xs font-semibold text-indigo-700 mb-1">Biggest Gap</div>
                <div className="text-sm text-indigo-900">No website — estimated ₹18,000 lost/month in online leads</div>
              </div>
            </div>

            {/* Mock outreach message */}
            <div className="bg-slate-900 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <MessageSquare className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">WhatsApp Draft</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                Hi Dr. Raj 👋 I came across Raj Dental Clinic on Google — 4.8 stars and 230+ reviews is brilliant! I noticed you don't have a website yet. I build sites for dental practices in Mumbai — yours could be live in 3 days. Want a quick look at a demo? 🦷
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Phase Pipeline */}
      <section className="bg-slate-50 border-y border-slate-200 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">The 5-Phase Pipeline</div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">From zero to outreach-ready in minutes</h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">Each phase builds on the last. Data flows automatically — no copy-pasting, no spreadsheets.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PIPELINE.map((p) => (
              <div key={p.step} className={`bg-white border ${p.border} rounded-2xl p-5 card-hover`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`h-9 w-9 rounded-xl ${p.color} flex items-center justify-center shadow-sm`}>
                    <p.icon className="h-4 w-4 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-xs font-bold text-slate-400">{p.step}</span>
                </div>
                <div className="font-bold text-slate-900 text-base mb-2">{p.title}</div>
                <p className="text-sm text-slate-500 leading-relaxed mb-3">{p.desc}</p>
                <div className={`text-xs ${p.bg} ${p.border} border rounded-lg px-3 py-2 text-slate-600 leading-relaxed`}>
                  {p.example}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
            >
              See the full technical breakdown <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Real world data examples */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">Real-World Examples</div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Worldwide, real data, right now</h2>
          <p className="text-lg text-slate-500">These are representative results from actual OpenStreetMap searches — not made-up numbers.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {REAL_DATA.map((d) => (
            <div key={d.city} className="bg-white border border-slate-200 rounded-2xl p-5 card-hover">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-semibold text-slate-700">{d.city}</span>
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-3">{d.niche}</div>
              <div className="space-y-2.5 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Businesses found</span>
                  <span className="font-bold text-slate-900">{d.found}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">No/bad website</span>
                  <span className="font-bold text-rose-600">{d.noSite}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Avg score</span>
                  <span className="font-bold text-indigo-600">{d.avgScore}/100</span>
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-xs text-emerald-700 font-medium">
                🏆 {d.topPitch}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-slate-400">
          * Results vary by city density and niche. OSM data is community-contributed and updated continuously.
        </p>
      </section>

      {/* Who is it for */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">Who Is It For?</div>
            <h2 className="text-4xl font-extrabold text-white mb-4">Built for web professionals who prospect</h2>
            <p className="text-lg text-slate-400 max-w-xl mx-auto">Whether you're a solo freelancer or an agency team, Lead → Launch is your unfair advantage.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FOR_WHO.map((w) => (
              <div key={w.title} className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                  <w.icon className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{w.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{w.desc}</p>
                <ul className="space-y-2">
                  {w.perks.map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Niches */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">Popular Niches</div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Any niche. Any city. Worldwide.</h2>
          <p className="text-lg text-slate-500">Typical project values for each niche — what your clients will happily pay for a professional site.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {NICHES.map((n) => (
            <div key={n.name} className="bg-white border border-slate-200 rounded-xl px-4 py-4 card-hover text-center">
              <div className="text-3xl mb-2">{n.icon}</div>
              <div className="font-semibold text-slate-800 text-sm mb-1">{n.name}</div>
              <div className="text-xs text-emerald-600 font-semibold">{n.avg}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">Get Started Now</div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            Your next client is waiting.<br />
            <span className="gradient-text">Find them today.</span>
          </h2>
          <p className="text-lg text-slate-300 mb-10">
            No sign-up. No credit card. No API key needed. Just open the tool, type a niche and city, and go.
          </p>
          <Link
            to="/app"
            className="inline-flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-900 font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-2xl"
          >
            <Zap className="h-5 w-5 text-indigo-600" />
            Open Lead → Launch
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-emerald-500" /> No account needed</span>
            <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-indigo-400" /> Works worldwide</span>
            <span className="flex items-center gap-1.5"><Smartphone className="h-4 w-4 text-violet-400" /> Mobile app available</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-10">
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
          <p className="text-xs text-slate-600">Data © OpenStreetMap contributors. Built on the open web.</p>
        </div>
      </footer>
    </div>
  );
}
