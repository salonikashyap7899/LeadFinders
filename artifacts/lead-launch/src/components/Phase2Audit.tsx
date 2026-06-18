import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { PhaseShell } from "./PhaseShell";
import { IncompleteState } from "./IncompleteState";
import {
  Loader2, AlertTriangle, Phone, Globe, Star, Zap,
  CheckCircle2, ExternalLink, TrendingDown,
} from "lucide-react";
import type { Lead, AuditResult } from "@/lib/types";
import { LeadIntelPanel } from "./LeadIntelPanel";
import { toast } from "sonner";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const STATUS_OPTIONS = ["New", "Contacted", "Replied", "Interested", "Won", "Lost"] as const;
type LeadStatus = typeof STATUS_OPTIONS[number];

const STATUS_COLORS: Record<LeadStatus, { bg: string; color: string; border: string }> = {
  New:        { bg: "rgba(107,114,128,0.1)",   color: "#6b7280",  border: "rgba(107,114,128,0.25)" },
  Contacted:  { bg: "rgba(124,58,237,0.12)",   color: "#a78bfa",  border: "rgba(124,58,237,0.3)" },
  Replied:    { bg: "rgba(6,182,212,0.1)",     color: "#67e8f9",  border: "rgba(6,182,212,0.25)" },
  Interested: { bg: "rgba(251,191,36,0.1)",    color: "#fbbf24",  border: "rgba(251,191,36,0.25)" },
  Won:        { bg: "rgba(16,185,129,0.1)",    color: "#10b981",  border: "rgba(16,185,129,0.25)" },
  Lost:       { bg: "rgba(239,68,68,0.08)",    color: "#f87171",  border: "rgba(239,68,68,0.2)" },
};

function useLeadStatuses() {
  const [statuses, setStatuses] = useState<Record<string, LeadStatus>>(() => {
    try { return JSON.parse(localStorage.getItem("ll_statuses") ?? "{}"); } catch { return {}; }
  });
  function set(id: string, status: LeadStatus) {
    setStatuses(prev => {
      const next = { ...prev, [id]: status };
      localStorage.setItem("ll_statuses", JSON.stringify(next));
      return next;
    });
  }
  return { statuses, set };
}

export function Phase2Audit({ leads, audits, setAudits, onNext, onPrev }: {
  leads: Lead[]; audits: Record<string, AuditResult>; setAudits: (a: Record<string, AuditResult>) => void; onNext: () => void; onPrev: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentName, setCurrentName] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const { statuses, set: setStatus } = useLeadStatuses();

  useEffect(() => { setSelectedIds(new Set(leads.map(l => l.id))); }, [leads]);

  const allSelected = leads.length > 0 && selectedIds.size === leads.length;
  const auditedCount = Object.keys(audits).length;
  const wonCount = Object.values(statuses).filter(s => s === "Won").length;
  const interestedCount = Object.values(statuses).filter(s => s === "Interested").length;

  function toggleOne(id: string) {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  async function runAudit() {
    const targets = leads.filter(l => selectedIds.has(l.id));
    if (targets.length === 0) { toast.error("Select at least one lead"); return; }
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
    toast.success(`Audited ${targets.length} leads!`);
  }

  if (leads.length === 0) {
    return (
      <PhaseShell title="Audit Websites" subtitle="Check each lead's web presence — PageSpeed, mobile, HTTPS, SEO gaps, estimated lost revenue." onPrev={onPrev} onNext={onNext} nextDisabled nextLabel="Rank prospects">
        <IncompleteState title="No leads yet" description="Go back to Step 1 and search for leads first." prevPhaseLabel="Find Leads" onPrev={onPrev} />
      </PhaseShell>
    );
  }

  return (
    <PhaseShell title="Audit Websites" subtitle="Select leads → Run audit → Track status → Advance to ranking." onPrev={onPrev} onNext={onNext} nextDisabled={auditedCount === 0} nextLabel="Rank prospects">

      {/* Stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 14 }}>
        {[
          { v: leads.length, l: "Total", c: "#a78bfa" },
          { v: auditedCount, l: "Audited", c: "#06b6d4" },
          { v: leads.filter(l => !l.website).length, l: "No Site", c: "#fbbf24" },
          { v: Object.values(statuses).filter(s => s === "Contacted").length, l: "Contacted", c: "#a78bfa" },
          { v: interestedCount, l: "Interested", c: "#fbbf24" },
          { v: wonCount, l: "Won 🎉", c: "#10b981" },
        ].map(({ v, l, c }) => (
          <div key={l} style={{ textAlign: "center", padding: "8px 4px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: c, letterSpacing: "-0.5px" }}>{v}</div>
            <div style={{ fontSize: 9, color: "#374151", textTransform: "uppercase", letterSpacing: "0.6px", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Control bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 12, padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Checkbox id="select-all" checked={allSelected} onCheckedChange={() => setSelectedIds(allSelected ? new Set() : new Set(leads.map(l => l.id)))} />
          <label htmlFor="select-all" style={{ fontSize: 13, color: "var(--ll-text)", cursor: "pointer" }}>
            <strong>{selectedIds.size}</strong> <span style={{ color: "#4b5563" }}>of {leads.length} selected</span>
          </label>
        </div>
        <button onClick={runAudit} disabled={running || selectedIds.size === 0} style={{
          height: 36, padding: "0 18px", borderRadius: 9, border: "none", fontWeight: 600, fontSize: 12.5,
          display: "flex", alignItems: "center", gap: 7, cursor: running || selectedIds.size === 0 ? "not-allowed" : "pointer",
          background: running || selectedIds.size === 0 ? "rgba(124,58,237,0.2)" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
          color: running || selectedIds.size === 0 ? "#4b5563" : "white",
          boxShadow: running || selectedIds.size === 0 ? "none" : "0 4px 14px rgba(124,58,237,0.3)",
        }}>
          {running ? <><Loader2 style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} /> Auditing {currentName}…</> : <><Zap style={{ width: 13, height: 13 }} /> Run Audit</>}
        </button>
      </div>

      {/* Progress */}
      {running && (
        <div style={{ marginBottom: 12, padding: "12px 16px", borderRadius: 10, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ fontSize: 12, color: "#a78bfa" }}>Auditing: <strong>{currentName}</strong></span>
            <span style={{ fontSize: 12, color: "#6b7280" }}>{progress}%</span>
          </div>
          <Progress value={progress} style={{ height: 5, background: "rgba(255,255,255,0.06)" }} />
        </div>
      )}

      {/* Lead cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {leads.map(lead => {
          const audit = audits[lead.id];
          const sel = selectedIds.has(lead.id);
          const status = statuses[lead.id] as LeadStatus | undefined ?? "New";
          const sColor = STATUS_COLORS[status];
          const isExpanded = expanded === lead.id;
          return (
            <div key={lead.id} style={{
              borderRadius: 12,
              background: sel ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.01)",
              border: `1px solid ${audit ? "rgba(16,185,129,0.18)" : sel ? "rgba(124,58,237,0.14)" : "rgba(255,255,255,0.05)"}`,
              padding: "12px 16px", transition: "all 0.15s", opacity: sel ? 1 : 0.5,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <Checkbox checked={sel} onCheckedChange={() => toggleOne(lead.id)} style={{ marginTop: 2 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    {/* Lead info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ll-text)" }}>{lead.name}</span>
                        {/* CRM status dropdown */}
                        <select
                          value={status}
                          onChange={e => setStatus(lead.id, e.target.value as LeadStatus)}
                          style={{
                            fontSize: 10, padding: "2px 8px", borderRadius: 20, cursor: "pointer", fontWeight: 600,
                            background: sColor.bg, border: `1px solid ${sColor.border}`, color: sColor.color,
                            appearance: "none",
                          }}
                        >
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>{lead.address}</div>
                      <div style={{ display: "flex", gap: 10, marginTop: 5, flexWrap: "wrap" }}>
                        {lead.phone && <span style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}><Phone style={{ width: 11, height: 11, color: "#10b981" }} />{lead.phone}</span>}
                        {lead.website && <a href={lead.website} target="_blank" rel="noopener" style={{ fontSize: 11, color: "#06b6d4", display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}><Globe style={{ width: 11, height: 11 }} />Site <ExternalLink style={{ width: 9, height: 9 }} /></a>}
                        {lead.rating && <span style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}><Star style={{ width: 11, height: 11, color: "#fbbf24", fill: "#fbbf24" }} />{lead.rating} ({lead.reviewsCount ?? 0})</span>}
                      </div>
                    </div>

                    {/* Audit result */}
                    {audit ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                        {audit.hasWebsite ? (
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 20, fontWeight: 700, color: audit.pageSpeedScore >= 70 ? "#10b981" : audit.pageSpeedScore >= 50 ? "#fbbf24" : "#f87171", letterSpacing: "-0.5px", lineHeight: 1 }}>{audit.pageSpeedScore}</div>
                            <div style={{ fontSize: 9, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 2 }}>Speed</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", fontWeight: 600 }}>No Site</span>
                        )}
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 17, fontWeight: 700, color: "#f87171", letterSpacing: "-0.5px", lineHeight: 1 }}>₹{audit.estLostRevenuePerMonth.toLocaleString()}</div>
                          <div style={{ fontSize: 9, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 2 }}>Lost/mo</div>
                        </div>
                        <CheckCircle2 style={{ width: 16, height: 16, color: "#10b981" }} />
                      </div>
                    ) : (
                      <span style={{ fontSize: 10, padding: "3px 12px", borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#4b5563" }}>
                        {running && sel ? "Auditing…" : "Pending"}
                      </span>
                    )}
                  </div>

                  {/* Audit gap */}
                  {audit && (
                    <div style={{ marginTop: 8, padding: "7px 10px", borderRadius: 8, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.13)", display: "flex", alignItems: "flex-start", gap: 6 }}>
                      <AlertTriangle style={{ width: 11, height: 11, color: "#f87171", flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 11.5, color: "#d1d5db" }}>{audit.biggestGap}</span>
                    </div>
                  )}

                  {/* Intel expand */}
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => setExpanded(isExpanded ? null : lead.id)} style={{
                      fontSize: 10, padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(124,58,237,0.25)",
                      background: isExpanded ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.07)",
                      color: "#a78bfa", cursor: "pointer", fontWeight: 600,
                    }}>
                      {isExpanded ? "▲ Hide intel" : "▼ Lead intel — domain · social · domain check"}
                    </button>
                  </div>

                  {isExpanded && <LeadIntelPanel lead={lead} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PhaseShell>
  );
}
