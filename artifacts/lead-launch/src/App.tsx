import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Toaster } from "sonner";
import { Phase1Scrape } from "@/components/Phase1Scrape";
import { Phase2Audit } from "@/components/Phase2Audit";
import { Phase3Rank } from "@/components/Phase3Rank";
import { Phase4Build } from "@/components/Phase4Build";
import { Phase5Outreach } from "@/components/Phase5Outreach";
import { AIAgent } from "@/components/AIAgent";
import { scoreLead } from "@/lib/scoring";
import type { Lead, AuditResult, RankedLead } from "@/lib/types";
import { Zap, Search, BarChart2, TrendingUp, Code2, MessageSquare, Bot, CheckCircle } from "lucide-react";

const STEPS = [
  { n: 1, label: "Scrape", icon: Search, desc: "Find businesses" },
  { n: 2, label: "Audit", icon: BarChart2, desc: "Check web presence" },
  { n: 3, label: "Rank", icon: TrendingUp, desc: "Score prospects" },
  { n: 4, label: "Build", icon: Code2, desc: "Generate prompt" },
  { n: 5, label: "Outreach", icon: MessageSquare, desc: "Send messages" },
];

export default function App() {
  const [phase, setPhase] = useState<number | "agent">(1);
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

  const rankedLeads = useMemo<RankedLead[]>(() => {
    return leads
      .filter((l) => audits[l.id])
      .map((l) => scoreLead(l, audits[l.id]))
      .sort((a, b) => b.score - a.score);
  }, [leads, audits]);

  const selectedRanked = useMemo(() => {
    if (!selectedId) return null;
    const lead = leads.find((l) => l.id === selectedId);
    const audit = audits[selectedId];
    if (!lead || !audit) return null;
    return scoreLead(lead, audit);
  }, [selectedId, leads, audits]);

  const currentPhaseNum = phase === "agent" ? 0 : phase;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside className="w-[220px] shrink-0 flex flex-col overflow-hidden border-r" style={{ background: "var(--ll-bg2)", borderColor: "rgba(255,255,255,0.06)" }}>

        {/* Logo */}
        <div className="px-4 py-[18px] border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center shrink-0 bg-primary">
              <Zap className="w-[15px] h-[15px] text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-bold text-foreground tracking-[-0.3px]">
              Lead<span className="text-[#A78BFA]">→</span>Launch
            </span>
          </Link>
        </div>

        {/* Pipeline steps */}
        <div className="px-2.5 pt-3.5 pb-2">
          <div className="text-[10px] text-muted-foreground tracking-[0.8px] uppercase px-1.5 pb-2">Pipeline</div>
          {STEPS.map(({ n, label, icon: Icon, desc }) => {
            const done = completed.has(n);
            const active = phase === n;
            const canJump = done || n === 1 || completed.has(n - 1);
            return (
              <button
                key={n}
                onClick={() => canJump && setPhase(n)}
                disabled={!canJump}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg mb-0.5 text-left transition-all duration-150"
                style={{
                  background: active ? "rgba(108,99,255,0.14)" : "transparent",
                  border: `0.5px solid ${active ? "rgba(108,99,255,0.25)" : "transparent"}`,
                  color: active ? "#A78BFA" : done ? "#34D399" : canJump ? "#8B8BAD" : "rgba(139,139,173,0.3)",
                  cursor: canJump ? "pointer" : "not-allowed",
                }}
              >
                <div className="w-7 h-7 rounded-[7px] shrink-0 flex items-center justify-center" style={{
                  background: active ? "rgba(108,99,255,0.2)" : done ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)",
                  border: `0.5px solid ${active ? "rgba(108,99,255,0.3)" : done ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.07)"}`,
                }}>
                  {done && !active
                    ? <CheckCircle className="w-3 h-3 text-[#34D399]" />
                    : <Icon className="w-3 h-3" />
                  }
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-medium leading-none">{label}</div>
                  <div className="text-[10px] mt-0.5 opacity-60 leading-none">{desc}</div>
                </div>
                {done && !active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#34D399] shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mx-2.5 my-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* AI Agent */}
        <div className="px-2.5">
          <div className="text-[10px] text-muted-foreground tracking-[0.8px] uppercase px-1.5 pb-2">Tools</div>
          <button
            onClick={() => setPhase("agent")}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all duration-150"
            style={{
              background: phase === "agent" ? "rgba(108,99,255,0.14)" : "transparent",
              border: `0.5px solid ${phase === "agent" ? "rgba(108,99,255,0.25)" : "transparent"}`,
              color: phase === "agent" ? "#A78BFA" : "#8B8BAD",
              cursor: "pointer",
            }}
          >
            <div className="w-7 h-7 rounded-[7px] shrink-0 flex items-center justify-center relative" style={{
              background: phase === "agent" ? "rgba(108,99,255,0.2)" : "rgba(255,255,255,0.04)",
              border: `0.5px solid ${phase === "agent" ? "rgba(108,99,255,0.3)" : "rgba(255,255,255,0.07)"}`,
            }}>
              <Bot className="w-3 h-3" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#34D399]" style={{ border: "1.5px solid var(--ll-bg2)" }} />
            </div>
            <div className="min-w-0">
              <div className="text-[12.5px] font-medium leading-none">AI Agent</div>
              <div className="text-[10px] mt-0.5 opacity-60 leading-none">Manage & message leads</div>
            </div>
          </button>
        </div>

        {/* Stats footer */}
        <div className="mt-auto px-4 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: leads.length, label: "Leads", color: "var(--ll-text)" },
              { val: Object.keys(audits).length, label: "Audited", color: "#A78BFA" },
              { val: rankedLeads.length > 0 ? rankedLeads[0].score : "—", label: "Top", color: "#34D399" },
            ].map(({ val, label, color }) => (
              <div key={label} className="text-center">
                <div className="text-base font-bold" style={{ color }}>{val}</div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-[0.5px] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-auto min-h-0 grid-bg">
        {phase === "agent" ? (
          <AIAgent
            leads={leads}
            rankedLeads={rankedLeads}
            selectedLead={selectedRanked}
            phase={currentPhaseNum}
          />
        ) : (
          <div className="px-8 pt-7 pb-20">
            {/* Progress bar */}
            <div className="mb-7 flex items-center gap-3">
              <div className="flex gap-1.5">
                {STEPS.map(({ n }) => {
                  const done = completed.has(n);
                  const active = phase === n;
                  return (
                    <div key={n} className="h-1 rounded-full transition-all duration-300" style={{
                      width: active ? 24 : 8,
                      background: active ? "var(--ll-accent)" : done ? "#34D399" : "rgba(255,255,255,0.1)",
                    }} />
                  );
                })}
              </div>
              <span className="text-xs text-muted-foreground">
                Step {phase} of 5 — {STEPS[(phase as number) - 1]?.label}
              </span>
            </div>

            {phase === 1 && <Phase1Scrape key="p1" leads={leads} setLeads={setLeads} onNext={() => setPhase(2)} />}
            {phase === 2 && <Phase2Audit key="p2" leads={leads} audits={audits} setAudits={setAudits} onNext={() => setPhase(3)} onPrev={() => setPhase(1)} />}
            {phase === 3 && <Phase3Rank key="p3" leads={leads} audits={audits} selectedId={selectedId} setSelectedId={setSelectedId} onNext={() => setPhase(4)} onPrev={() => setPhase(2)} />}
            {phase === 4 && <Phase4Build key="p4" selected={selectedRanked} onNext={() => setPhase(5)} onPrev={() => setPhase(3)} />}
            {phase === 5 && <Phase5Outreach key="p5" selected={selectedRanked} onPrev={() => setPhase(4)} />}
          </div>
        )}
      </main>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
