import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { PhaseShell } from "./PhaseShell";
import { IncompleteState } from "./IncompleteState";
import { Loader2, AlertTriangle, Gauge, Phone, MessageCircle, Globe, Star, Zap, CheckCircle2 } from "lucide-react";
import type { Lead, AuditResult } from "@/lib/types";
import { toast } from "sonner";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function ScoreBadge({ score, hasWebsite }: { score: number; hasWebsite: boolean }) {
  if (!hasWebsite) return (
    <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)", fontWeight: 600 }}>No Website</span>
  );
  const color = score >= 70 ? "#10b981" : score >= 50 ? "#fbbf24" : "#f87171";
  const bg = score >= 70 ? "rgba(16,185,129,0.1)" : score >= 50 ? "rgba(251,191,36,0.1)" : "rgba(239,68,68,0.1)";
  const border = score >= 70 ? "rgba(16,185,129,0.3)" : score >= 50 ? "rgba(251,191,36,0.3)" : "rgba(239,68,68,0.3)";
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 19, fontWeight: 700, color, letterSpacing: "-0.5px", lineHeight: 1 }}>{score}</div>
      <div style={{ fontSize: 9, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.6px", marginTop: 2 }}>PageSpeed</div>
    </div>
  );
}

export function Phase2Audit({ leads, audits, setAudits, onNext, onPrev }: {
  leads: Lead[]; audits: Record<string, AuditResult>; setAudits: (a: Record<string, AuditResult>) => void; onNext: () => void; onPrev: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentName, setCurrentName] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => { setSelectedIds(new Set(leads.map(l => l.id))); }, [leads]);

  const allSelected = leads.length > 0 && selectedIds.size === leads.length;
  const auditedCount = Object.keys(audits).length;

  function toggleOne(id: string) {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  async function runAudit() {
    const targets = leads.filter(l => selectedIds.has(l.id));
    if (targets.length === 0) { toast.error("Select at least one lead to audit"); return; }
    setRunning(true); setProgress(0);
    const results: Record<string, AuditResult> = { ...audits };
    for (let i = 0; i < targets.length; i++) {
      setCurrentName(targets[i].name);
      try {
        const res = await fetch(`${BASE}/api/audit`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lead: targets[i] }) });
        const data = await res.json();
        if (data.audit) { results[targets[i].id] = data.audit; setAudits({ ...results }); }
      } catch { /* continue */ }
      setProgress(Math.round(((i + 1) / targets.length) * 100));
    }
    setRunning(false); setCurrentName("");
    toast.success(`Audited ${targets.length} leads successfully!`);
  }

  if (leads.length === 0) {
    return (
      <PhaseShell title="Audit Websites" subtitle="We check each lead's PageSpeed score, mobile-friendliness, HTTPS, and SEO — then estimate monthly revenue lost." onPrev={onPrev} onNext={onNext} nextDisabled nextLabel="Rank prospects">
        <IncompleteState title="No leads yet" description="Go back to Step 1 and search for leads first." prevPhaseLabel="Find Leads" onPrev={onPrev} />
      </PhaseShell>
    );
  }

  return (
    <PhaseShell title="Audit Websites" subtitle="Select leads to audit, then click Run Audit. We analyse each site for speed, mobile, HTTPS, and SEO gaps." onPrev={onPrev} onNext={onNext} nextDisabled={auditedCount === 0} nextLabel="Rank prospects">

      {/* Control bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16, padding: "14px 18px", borderRadius: 12, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Checkbox
            id="select-all"
            checked={allSelected}
            onCheckedChange={() => setSelectedIds(allSelected ? new Set() : new Set(leads.map(l => l.id)))}
          />
          <label htmlFor="select-all" style={{ fontSize: 13, color: "var(--ll-text)", cursor: "pointer" }}>
            <strong>{selectedIds.size}</strong> <span style={{ color: "#4b5563" }}>of {leads.length} selected</span>
          </label>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ fontSize: 12, color: "#4b5563" }}><strong style={{ color: "#10b981" }}>{auditedCount}</strong> audited</div>
            <div style={{ fontSize: 12, color: "#4b5563" }}><strong style={{ color: "#fbbf24" }}>{leads.filter(l => !l.website).length}</strong> no website</div>
          </div>
        </div>
        <button
          onClick={runAudit}
          disabled={running || selectedIds.size === 0}
          style={{
            height: 38, padding: "0 20px", borderRadius: 9, border: "none", fontWeight: 600, fontSize: 13,
            display: "flex", alignItems: "center", gap: 7, cursor: running || selectedIds.size === 0 ? "not-allowed" : "pointer",
            background: running || selectedIds.size === 0 ? "rgba(124,58,237,0.2)" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: running || selectedIds.size === 0 ? "#4b5563" : "white",
            boxShadow: running || selectedIds.size === 0 ? "none" : "0 4px 14px rgba(124,58,237,0.3)",
          }}
        >
          {running ? <><Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> Auditing…</> : <><Zap style={{ width: 14, height: 14 }} /> Run Audit</>}
        </button>
      </div>

      {/* Progress */}
      {running && (
        <div style={{ marginBottom: 16, padding: "14px 18px", borderRadius: 12, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#a78bfa" }}>Auditing: <strong>{currentName}</strong></span>
            <span style={{ fontSize: 12, color: "#6b7280" }}>{progress}%</span>
          </div>
          <Progress value={progress} style={{ height: 6, background: "rgba(255,255,255,0.06)" }} />
        </div>
      )}

      {/* Lead cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {leads.map(lead => {
          const audit = audits[lead.id];
          const sel = selectedIds.has(lead.id);
          return (
            <div key={lead.id} style={{
              borderRadius: 12, background: sel ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.01)",
              border: `1px solid ${audit ? "rgba(16,185,129,0.2)" : sel ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.05)"}`,
              padding: "14px 18px", transition: "all 0.15s",
              opacity: sel ? 1 : 0.5,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <Checkbox
                  checked={sel}
                  onCheckedChange={() => toggleOne(lead.id)}
                  style={{ marginTop: 2 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ll-text)" }}>{lead.name}</div>
                      <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>{lead.address}</div>
                      <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                        {lead.phone && <span style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}><Phone style={{ width: 11, height: 11, color: "#10b981" }} />{lead.phone}</span>}
                        {lead.website && <span style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}><Globe style={{ width: 11, height: 11, color: "#06b6d4" }} />Has site</span>}
                        {lead.rating && <span style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}><Star style={{ width: 11, height: 11, color: "#fbbf24", fill: "#fbbf24" }} />{lead.rating} ({lead.reviewsCount ?? 0})</span>}
                      </div>
                    </div>

                    {/* Audit result */}
                    {audit ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                        <ScoreBadge score={audit.pageSpeedScore} hasWebsite={audit.hasWebsite} />
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: "#ef4444", letterSpacing: "-0.5px", lineHeight: 1 }}>₹{audit.estLostRevenuePerMonth.toLocaleString()}</div>
                          <div style={{ fontSize: 9, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.6px", marginTop: 2 }}>Lost/mo</div>
                        </div>
                        <CheckCircle2 style={{ width: 18, height: 18, color: "#10b981" }} />
                      </div>
                    ) : (
                      <div style={{ padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 500, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#4b5563" }}>
                        {running && sel ? "Auditing…" : "Pending"}
                      </div>
                    )}
                  </div>

                  {audit && (
                    <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", display: "flex", alignItems: "flex-start", gap: 7 }}>
                      <AlertTriangle style={{ width: 12, height: 12, color: "#f87171", flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 11.5, color: "#d1d5db" }}>{audit.biggestGap}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PhaseShell>
  );
}
