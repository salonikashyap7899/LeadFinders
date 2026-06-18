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
import {
  Zap, Search, BarChart2, TrendingUp, Code2,
  MessageSquare, Bot, CheckCircle2, ArrowRight, Home,
} from "lucide-react";

const STEPS = [
  { n: 1, label: "Find Leads", icon: Search, desc: "Search businesses" },
  { n: 2, label: "Audit", icon: BarChart2, desc: "Analyse web presence" },
  { n: 3, label: "Rank", icon: TrendingUp, desc: "Score prospects" },
  { n: 4, label: "Build", icon: Code2, desc: "Generate site prompt" },
  { n: 5, label: "Outreach", icon: MessageSquare, desc: "Email & WhatsApp" },
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

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--ll-bg)", color: "var(--ll-text)", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 232,
        flexShrink: 0,
        background: "var(--ll-bg2)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(124,58,237,0.4)",
              }}>
                <Zap style={{ width: 15, height: 15, color: "white" }} strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ll-text)", letterSpacing: "-0.4px" }}>
                Lead<span style={{ color: "var(--ll-accent2)" }}>→</span>Launch
              </span>
            </Link>
            <Link to="/" title="Home" style={{ color: "#4b5563", display: "flex", alignItems: "center" }}>
              <Home style={{ width: 14, height: 14 }} />
            </Link>
          </div>
        </div>

        {/* Live stats bar */}
        <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {[
            { val: leads.length, label: "Leads", color: "#a78bfa" },
            { val: Object.keys(audits).length, label: "Audited", color: "#06b6d4" },
            { val: rankedLeads.length > 0 ? rankedLeads[0].score : "—", label: "Top Score", color: "#10b981" },
          ].map(({ val, label, color }) => (
            <div key={label} style={{
              textAlign: "center", padding: "6px 4px", borderRadius: 8,
              background: "rgba(255,255,255,0.025)",
              border: "0.5px solid rgba(255,255,255,0.05)",
            }}>
              <div style={{ fontSize: 17, fontWeight: 700, color, lineHeight: 1, letterSpacing: "-0.5px" }}>{val}</div>
              <div style={{ fontSize: 9, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.6px", marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Pipeline */}
        <div style={{ padding: "12px 10px 6px", flex: 1, overflowY: "auto" }}>
          <div style={{ fontSize: 9.5, color: "#374151", letterSpacing: "1px", textTransform: "uppercase", padding: "0 8px 8px", fontWeight: 600 }}>Pipeline</div>
          {STEPS.map(({ n, label, icon: Icon, desc }) => {
            const done = completed.has(n);
            const active = phase === n;
            const canJump = done || n === 1 || completed.has(n - 1);
            return (
              <button
                key={n}
                onClick={() => canJump && setPhase(n)}
                disabled={!canJump}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 10px", borderRadius: 10, marginBottom: 2,
                  background: active
                    ? "linear-gradient(135deg, rgba(124,58,237,0.18), rgba(109,40,217,0.1))"
                    : "transparent",
                  border: `1px solid ${active ? "rgba(124,58,237,0.3)" : "transparent"}`,
                  boxShadow: active ? "0 2px 12px rgba(124,58,237,0.12)" : "none",
                  color: active ? "#c4b5fd" : done ? "#10b981" : canJump ? "#6b7280" : "rgba(107,114,128,0.3)",
                  cursor: canJump ? "pointer" : "not-allowed",
                  textAlign: "left", transition: "all 0.15s",
                }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: active
                    ? "rgba(124,58,237,0.25)"
                    : done ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active ? "rgba(124,58,237,0.4)" : done ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.07)"}`,
                }}>
                  {done && !active
                    ? <CheckCircle2 style={{ width: 13, height: 13, color: "#10b981" }} />
                    : <Icon style={{ width: 13, height: 13 }} />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: active ? 600 : 500, lineHeight: 1.1 }}>{label}</div>
                  <div style={{ fontSize: 10, color: active ? "#a78bfa" : "#374151", marginTop: 1.5, opacity: active ? 0.9 : 0.7 }}>{desc}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {done && !active && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981" }} />}
                  {active && <ArrowRight style={{ width: 10, height: 10, opacity: 0.5 }} />}
                </div>
              </button>
            );
          })}

          <div style={{ margin: "8px 8px", height: "1px", background: "rgba(255,255,255,0.05)" }} />

          {/* AI Agent */}
          <div style={{ fontSize: 9.5, color: "#374151", letterSpacing: "1px", textTransform: "uppercase", padding: "0 8px 8px", fontWeight: 600 }}>Tools</div>
          <button
            onClick={() => setPhase("agent")}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "9px 10px", borderRadius: 10,
              background: phase === "agent" ? "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(124,58,237,0.08))" : "transparent",
              border: `1px solid ${phase === "agent" ? "rgba(6,182,212,0.25)" : "transparent"}`,
              color: phase === "agent" ? "#67e8f9" : "#6b7280",
              cursor: "pointer", textAlign: "left", transition: "all 0.15s",
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: 9, flexShrink: 0, position: "relative",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: phase === "agent" ? "rgba(6,182,212,0.18)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${phase === "agent" ? "rgba(6,182,212,0.3)" : "rgba(255,255,255,0.07)"}`,
            }}>
              <Bot style={{ width: 13, height: 13 }} />
              <span className="pulse-dot" style={{
                position: "absolute", top: -2, right: -2, width: 8, height: 8,
                borderRadius: "50%", background: "#10b981",
                border: "1.5px solid var(--ll-bg2)",
              }} />
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: phase === "agent" ? 600 : 500, lineHeight: 1.1 }}>AI Agent</div>
              <div style={{ fontSize: 10, color: phase === "agent" ? "#67e8f9" : "#374151", marginTop: 1.5, opacity: 0.8 }}>Analyse & message</div>
            </div>
          </button>
        </div>

        {/* Bottom hint */}
        <div style={{ padding: "10px 16px 14px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ fontSize: 10, color: "#374151", lineHeight: 1.5 }}>
            {leads.length === 0
              ? "👆 Start by searching leads in Step 1"
              : completed.size >= 5
              ? "✅ Pipeline complete! Check outreach."
              : `Step ${[...completed].pop() ?? 1} of 5 complete`
            }
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main
        style={{
          flex: 1,
          overflow: phase === 1 ? "hidden" : "auto",
          background: "var(--ll-bg)",
          display: "flex",
          flexDirection: "column",
        }}
        className="grid-bg"
      >
        {phase === "agent" ? (
          <AIAgent leads={leads} rankedLeads={rankedLeads} selectedLead={selectedRanked} phase={0} />
        ) : (
          <div style={{
            padding: phase === 1 ? "16px 24px 12px" : "28px 32px 100px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}>
            {/* Top step progress */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: phase === 1 ? 12 : 28, flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {STEPS.map(({ n }) => {
                  const done = completed.has(n);
                  const active = phase === n;
                  return (
                    <div key={n} style={{
                      height: 4, borderRadius: 4,
                      width: active ? 28 : 8,
                      background: active
                        ? "linear-gradient(90deg, #7c3aed, #a78bfa)"
                        : done ? "#10b981" : "rgba(255,255,255,0.08)",
                      transition: "all 0.3s",
                      boxShadow: active ? "0 0 8px rgba(124,58,237,0.6)" : "none",
                    }} />
                  );
                })}
              </div>
              <span style={{ fontSize: 11.5, color: "#4b5563" }}>
                Step {phase} of 5 — {STEPS[(phase as number) - 1]?.label}
              </span>
            </div>

            {phase === 1 && (
              <div style={{ flex: 1, minHeight: 0 }}>
                <Phase1Scrape key="p1" leads={leads} setLeads={setLeads} onNext={() => setPhase(2)} />
              </div>
            )}
            {phase === 2 && <Phase2Audit key="p2" leads={leads} audits={audits} setAudits={setAudits} onNext={() => setPhase(3)} onPrev={() => setPhase(1)} />}
            {phase === 3 && <Phase3Rank key="p3" leads={leads} audits={audits} selectedId={selectedId} setSelectedId={setSelectedId} onNext={() => setPhase(4)} onPrev={() => setPhase(2)} />}
            {phase === 4 && <Phase4Build key="p4" selected={selectedRanked} onNext={() => setPhase(5)} onPrev={() => setPhase(3)} />}
            {phase === 5 && <Phase5Outreach key="p5" selected={selectedRanked} leads={leads} onPrev={() => setPhase(4)} />}
          </div>
        )}
      </main>

      <Toaster position="bottom-right" richColors theme="dark" />
    </div>
  );
}
