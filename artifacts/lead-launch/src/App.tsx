import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Toaster } from "sonner";
import { Phase1Scrape } from "@/components/Phase1Scrape";
import { Phase2Audit } from "@/components/Phase2Audit";
import { Phase3Rank } from "@/components/Phase3Rank";
import { Phase4Build } from "@/components/Phase4Build";
import { Phase5Outreach } from "@/components/Phase5Outreach";
import { scoreLead } from "@/lib/scoring";
import type { Lead, AuditResult } from "@/lib/types";
import { Zap, ChevronLeft } from "lucide-react";

const STEPS = [
  { n: 1, label: "Scrape" },
  { n: 2, label: "Audit" },
  { n: 3, label: "Rank" },
  { n: 4, label: "Build" },
  { n: 5, label: "Outreach" },
];

export default function App() {
  const [phase, setPhase] = useState(1);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [audits, setAudits] = useState<Record<string, AuditResult>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const completed = useMemo(() => {
    const s = new Set<number>();
    if (leads.length > 0) s.add(1);
    if (Object.keys(audits).length > 0) s.add(2);
    if (selectedId) { s.add(3); s.add(4); }
    return s;
  }, [leads, audits, selectedId]);

  const selectedRanked = useMemo(() => {
    if (!selectedId) return null;
    const lead = leads.find((l) => l.id === selectedId);
    const audit = audits[selectedId];
    if (!lead || !audit) return null;
    return scoreLead(lead, audit);
  }, [selectedId, leads, audits]);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-indigo-600 focus:text-white focus:px-3 focus:py-2 focus:rounded-md focus:text-sm">
        Skip to content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-600/30">
              <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-slate-900 tracking-tight">
              Lead<span className="text-indigo-500">→</span>Launch
            </span>
          </div>

          {/* Step tabs */}
          <nav className="flex items-center gap-1 mx-auto">
            {STEPS.map(({ n, label }) => {
              const done = completed.has(n);
              const active = phase === n;
              const canJump = done || n === 1 || completed.has(n - 1);
              return (
                <button
                  key={n}
                  onClick={() => canJump && setPhase(n)}
                  disabled={!canJump}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : done
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : canJump
                          ? "text-slate-500 hover:bg-slate-100"
                          : "text-slate-300 cursor-not-allowed"
                  }`}
                >
                  <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    active ? "bg-white/20" : done ? "bg-emerald-200 text-emerald-800" : "bg-slate-100 text-slate-400"
                  }`}>{n}</span>
                  {label}
                </button>
              );
            })}
            {/* Mobile: show current phase only */}
            <span className="sm:hidden text-xs font-semibold text-slate-500">
              Step {phase} of 5 · {STEPS[phase - 1].label}
            </span>
          </nav>

          <div className="ml-auto text-xs text-slate-400 hidden lg:block">
            Worldwide · Real data · Free
          </div>
        </div>
      </header>

      <main id="main" className="pt-6 pb-20 bg-slate-50 min-h-screen" tabIndex={-1}>
        {phase === 1 && <Phase1Scrape key="p1" leads={leads} setLeads={setLeads} onNext={() => setPhase(2)} />}
        {phase === 2 && <Phase2Audit key="p2" leads={leads} audits={audits} setAudits={setAudits} onNext={() => setPhase(3)} onPrev={() => setPhase(1)} />}
        {phase === 3 && <Phase3Rank key="p3" leads={leads} audits={audits} selectedId={selectedId} setSelectedId={setSelectedId} onNext={() => setPhase(4)} onPrev={() => setPhase(2)} />}
        {phase === 4 && <Phase4Build key="p4" selected={selectedRanked} onNext={() => setPhase(5)} onPrev={() => setPhase(3)} />}
        {phase === 5 && <Phase5Outreach key="p5" selected={selectedRanked} onPrev={() => setPhase(4)} />}
      </main>

      <Toaster position="bottom-right" richColors />
    </>
  );
}
