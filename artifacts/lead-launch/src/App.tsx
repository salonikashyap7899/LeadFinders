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
import { Zap, Search, BarChart2, TrendingUp, Code2, MessageSquare, Bot, ChevronLeft, CheckCircle } from "lucide-react";

const STEPS = [
  { n: 1, label: "Scrape", icon: Search, desc: "Find businesses" },
  { n: 2, label: "Audit", icon: BarChart2, desc: "Check web presence" },
  { n: 3, label: "Rank", icon: TrendingUp, desc: "Score prospects" },
  { n: 4, label: "Build", icon: Code2, desc: "Generate prompt" },
  { n: 5, label: "Outreach", icon: MessageSquare, desc: "Send messages" },
];

const BG = "#0A0B14";
const BG2 = "#12142A";
const BG3 = "#1A1D35";
const ACCENT = "#6C63FF";
const ACCENT2 = "#A78BFA";
const GREEN = "#34D399";
const TEXT = "#F4F4FF";
const MUTED = "#8B8BAD";
const BORDER = "rgba(255,255,255,0.07)";
const ACCENT_BORDER = "rgba(108,99,255,0.2)";

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
    <div style={{ display: "flex", height: "100vh", background: BG, color: TEXT, fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 220,
        flexShrink: 0,
        background: BG2,
        borderRight: `0.5px solid ${BORDER}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ padding: "18px 16px 14px", borderBottom: `0.5px solid ${BORDER}` }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Zap style={{ width: 15, height: 15, color: "white" }} strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: TEXT, letterSpacing: "-0.3px" }}>
              Lead<span style={{ color: ACCENT2 }}>→</span>Launch
            </span>
          </Link>
        </div>

        {/* Pipeline steps */}
        <div style={{ padding: "14px 10px 8px" }}>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: "0.8px", textTransform: "uppercase", padding: "0 6px 8px" }}>Pipeline</div>
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
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "8px 8px",
                  borderRadius: 8,
                  marginBottom: 2,
                  background: active ? `rgba(108,99,255,0.14)` : "transparent",
                  border: active ? `0.5px solid ${ACCENT_BORDER}` : "0.5px solid transparent",
                  color: active ? ACCENT2 : done ? GREEN : canJump ? MUTED : "rgba(139,139,173,0.35)",
                  cursor: canJump ? "pointer" : "not-allowed",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                  background: active ? "rgba(108,99,255,0.2)" : done ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.04)",
                  border: `0.5px solid ${active ? ACCENT_BORDER : done ? "rgba(52,211,153,0.25)" : BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {done && !active
                    ? <CheckCircle style={{ width: 12, height: 12, color: GREEN }} />
                    : <Icon style={{ width: 12, height: 12 }} />
                  }
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: active ? 600 : 500, lineHeight: 1 }}>{label}</div>
                  <div style={{ fontSize: 10, color: active ? ACCENT2 : MUTED, marginTop: 2, opacity: 0.7 }}>{desc}</div>
                </div>
                {done && !active && (
                  <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: GREEN, flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>

        <div style={{ margin: "4px 10px 8px", height: "0.5px", background: BORDER }} />

        {/* AI Agent tab */}
        <div style={{ padding: "0 10px" }}>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: "0.8px", textTransform: "uppercase", padding: "0 6px 8px" }}>Tools</div>
          <button
            onClick={() => setPhase("agent")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "8px 8px",
              borderRadius: 8,
              background: phase === "agent" ? "rgba(108,99,255,0.14)" : "transparent",
              border: phase === "agent" ? `0.5px solid ${ACCENT_BORDER}` : "0.5px solid transparent",
              color: phase === "agent" ? ACCENT2 : MUTED,
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s",
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 7, flexShrink: 0,
              background: phase === "agent" ? "rgba(108,99,255,0.2)" : "rgba(255,255,255,0.04)",
              border: `0.5px solid ${phase === "agent" ? ACCENT_BORDER : BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              <Bot style={{ width: 12, height: 12 }} />
              <span style={{
                position: "absolute", top: -3, right: -3, width: 8, height: 8,
                borderRadius: "50%", background: GREEN,
                border: `1.5px solid ${BG2}`,
              }} />
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: phase === "agent" ? 600 : 500, lineHeight: 1 }}>AI Agent</div>
              <div style={{ fontSize: 10, color: phase === "agent" ? ACCENT2 : MUTED, marginTop: 2, opacity: 0.7 }}>Manage & message leads</div>
            </div>
          </button>
        </div>

        {/* Stats footer */}
        <div style={{ marginTop: "auto", padding: "12px 16px", borderTop: `0.5px solid ${BORDER}` }}>
          <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{leads.length}</div>
              <div style={{ fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 1 }}>Leads</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: ACCENT2 }}>{Object.keys(audits).length}</div>
              <div style={{ fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 1 }}>Audited</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: GREEN }}>{rankedLeads.length > 0 ? rankedLeads[0].score : "—"}</div>
              <div style={{ fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 1 }}>Top Score</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, overflow: "auto", background: BG, minHeight: 0 }}>
        {phase === "agent" ? (
          <AIAgent
            leads={leads}
            rankedLeads={rankedLeads}
            selectedLead={selectedRanked}
            phase={currentPhaseNum}
          />
        ) : (
          <div style={{ padding: "28px 32px 80px" }}>
            {/* Phase header bar */}
            <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {STEPS.map(({ n }) => {
                  const done = completed.has(n);
                  const active = phase === n;
                  return (
                    <div key={n} style={{
                      width: active ? 24 : 8, height: 4, borderRadius: 4,
                      background: active ? ACCENT : done ? GREEN : "rgba(255,255,255,0.1)",
                      transition: "all 0.3s",
                    }} />
                  );
                })}
              </div>
              <span style={{ fontSize: 12, color: MUTED }}>
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
