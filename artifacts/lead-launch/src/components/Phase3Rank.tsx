import { useMemo } from "react";
import { PhaseShell } from "./PhaseShell";
import { IncompleteState } from "./IncompleteState";
import { Crown, IndianRupee, MessageCircle, Phone, Mail, Star, Globe, TrendingUp } from "lucide-react";
import type { Lead, AuditResult, RankedLead } from "@/lib/types";
import { scoreLead } from "@/lib/scoring";

function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? "#10b981" : score >= 55 ? "#a78bfa" : "#fbbf24";
  const bg = score >= 75 ? "rgba(16,185,129,0.15)" : score >= 55 ? "rgba(124,58,237,0.15)" : "rgba(251,191,36,0.12)";
  const label = score >= 75 ? "HOT" : score >= 55 ? "WARM" : "COLD";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 3, transition: "width 0.7s ease-out", boxShadow: `0 0 6px ${color}60` }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.5px", color, minWidth: 28 }}>{score}</span>
      <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 20, background: bg, color, border: `1px solid ${color}40`, fontWeight: 600, letterSpacing: "0.5px" }}>{label}</span>
    </div>
  );
}

export function Phase3Rank({ leads, audits, selectedId, setSelectedId, onNext, onPrev }: {
  leads: Lead[]; audits: Record<string, AuditResult>; selectedId: string | null; setSelectedId: (id: string | null) => void; onNext: () => void; onPrev: () => void;
}) {
  const ranked: RankedLead[] = useMemo(() =>
    leads.filter(l => audits[l.id]).map(l => scoreLead(l, audits[l.id])).sort((a, b) => b.score - a.score),
    [leads, audits]
  );

  if (ranked.length === 0) {
    return (
      <PhaseShell title="Rank Prospects" subtitle="Leads are ranked 0–100 by website quality, reviews, rating, reachability, and niche fit." onPrev={onPrev} onNext={onNext} nextDisabled nextLabel="Build website">
        <IncompleteState title={leads.length === 0 ? "No leads yet" : "No audits yet"} description={leads.length === 0 ? "Search for leads in Step 1, then audit them." : "Run the audit in Step 2 first."} prevPhaseLabel={leads.length === 0 ? "Find Leads" : "Audit"} onPrev={onPrev} />
      </PhaseShell>
    );
  }

  const top3 = ranked.slice(0, 3);
  const rankColors = ["#fbbf24", "#9ca3af", "#cd7c3f"];
  const rankLabels = ["🥇 Best Lead", "🥈 Runner-up", "🥉 Third"];

  return (
    <PhaseShell title="Rank Prospects" subtitle={`${ranked.length} leads scored — sorted by conversion potential. Click a row to select a lead for site building.`} onPrev={onPrev} onNext={onNext} nextDisabled={!selectedId} nextLabel="Build website">

      {/* Top 3 cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        {top3.map((lead, i) => {
          const sel = selectedId === lead.id;
          const scoreColor = lead.score >= 75 ? "#10b981" : lead.score >= 55 ? "#a78bfa" : "#fbbf24";
          return (
            <button
              key={lead.id}
              onClick={() => setSelectedId(lead.id)}
              style={{
                borderRadius: 14, textAlign: "left", padding: "18px 18px 16px", cursor: "pointer",
                background: sel ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.025)",
                border: `1px solid ${sel ? "rgba(124,58,237,0.45)" : "rgba(255,255,255,0.07)"}`,
                boxShadow: sel ? "0 0 24px rgba(124,58,237,0.15), inset 0 0 0 1px rgba(124,58,237,0.2)" : "none",
                transition: "all 0.18s",
                outline: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: rankColors[i], letterSpacing: "0.3px" }}>{rankLabels[i]}</span>
                <div style={{ fontSize: 26, fontWeight: 800, color: scoreColor, letterSpacing: "-1px", lineHeight: 1 }}>{lead.score}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ll-text)", lineHeight: 1.3, marginBottom: 4 }}>{lead.name}</div>
              <div style={{ fontSize: 11, color: "#4b5563", marginBottom: 10 }}>{lead.address}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                {lead.rating && <span style={{ fontSize: 11, color: "#fbbf24", display: "flex", alignItems: "center", gap: 3 }}><Star style={{ width: 11, height: 11, fill: "#fbbf24" }} />{lead.rating}</span>}
                {lead.reviewsCount ? <span style={{ fontSize: 11, color: "#4b5563" }}>{lead.reviewsCount} reviews</span> : null}
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#f87171" }}>₹{lead.audit.estLostRevenuePerMonth.toLocaleString()}</div>
                  <div style={{ fontSize: 9, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 1 }}>Lost/mo</div>
                </div>
                {lead.audit.hasWebsite && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: lead.audit.pageSpeedScore >= 70 ? "#10b981" : lead.audit.pageSpeedScore >= 50 ? "#fbbf24" : "#f87171" }}>{lead.audit.pageSpeedScore}</div>
                    <div style={{ fontSize: 9, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 1 }}>Speed</div>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {lead.phone && <Phone style={{ width: 12, height: 12, color: "#10b981" }} />}
                {lead.whatsapp && <MessageCircle style={{ width: 12, height: 12, color: "#a78bfa" }} />}
                {lead.email && <Mail style={{ width: 12, height: 12, color: "#06b6d4" }} />}
                {!lead.audit.hasWebsite && <Globe style={{ width: 12, height: 12, color: "#f87171" }} />}
              </div>
              {sel && (
                <div style={{ marginTop: 10, padding: "4px 10px", borderRadius: 20, background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", fontSize: 10, fontWeight: 600, color: "#c4b5fd", textAlign: "center" }}>
                  ✓ Selected for building
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Full ranked table */}
      <div className="glow-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 8 }}>
          <TrendingUp style={{ width: 15, height: 15, color: "#a78bfa" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ll-text)" }}>All {ranked.length} prospects ranked</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["#", "Business", "Score", "Lost/mo", "Site", ""].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, color: "#374151", textTransform: "uppercase", letterSpacing: "0.7px", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranked.map((lead, i) => {
              const sel = selectedId === lead.id;
              return (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedId(lead.id)}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer",
                    background: sel ? "rgba(124,58,237,0.08)" : "transparent",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.04)"; }}
                  onMouseLeave={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <td style={{ padding: "12px 14px", fontSize: 12, fontWeight: 700, color: "#4b5563" }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ll-text)" }}>{lead.name}</div>
                    <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>
                      {lead.reviewsCount ? `${lead.reviewsCount} reviews` : "No reviews"}
                      {lead.rating ? ` · ${lead.rating}★` : ""}
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", minWidth: 180 }}>
                    <ScoreBar score={lead.score} />
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "#f87171" }}>
                    ₹{lead.audit.estLostRevenuePerMonth.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {lead.audit.hasWebsite
                      ? <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>{lead.audit.pageSpeedScore} score</span>
                      : <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>No site</span>
                    }
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "right" }}>
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedId(lead.id); }}
                      style={{
                        height: 30, padding: "0 14px", borderRadius: 7, border: "none", fontWeight: 600, fontSize: 11, cursor: "pointer",
                        background: sel ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "rgba(255,255,255,0.05)",
                        color: sel ? "white" : "#6b7280",
                        boxShadow: sel ? "0 2px 8px rgba(124,58,237,0.3)" : "none",
                      }}
                    >
                      {sel ? "✓ Selected" : "Select"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PhaseShell>
  );
}
