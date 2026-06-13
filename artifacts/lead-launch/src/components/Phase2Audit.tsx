import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { PhaseShell } from "./PhaseShell";
import { IncompleteState } from "./IncompleteState";
import { Loader2, AlertTriangle, IndianRupee, Gauge, Star, Phone, MessageCircle, Globe } from "lucide-react";
import type { Lead, AuditResult } from "@/lib/types";
import { toast } from "sonner";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function Phase2Audit({
  leads,
  audits,
  setAudits,
  onNext,
  onPrev,
}: {
  leads: Lead[];
  audits: Record<string, AuditResult>;
  setAudits: (a: Record<string, AuditResult>) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedIds(new Set(leads.map((l) => l.id)));
  }, [leads]);

  const allSelected = leads.length > 0 && selectedIds.size === leads.length;

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(leads.map((l) => l.id)));
  }

  async function runAudit() {
    const targets = leads.filter((l) => selectedIds.has(l.id));
    if (targets.length === 0) {
      toast.error("Select at least one lead to audit");
      return;
    }
    setRunning(true);
    setProgress(0);
    const results: Record<string, AuditResult> = { ...audits };
    for (let i = 0; i < targets.length; i++) {
      try {
        const res = await fetch(`${BASE}/api/audit`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ lead: targets[i] }),
        });
        const data = await res.json();
        if (data.audit) {
          results[targets[i].id] = data.audit;
          setAudits({ ...results });
        }
      } catch {
        // continue
      }
      setProgress(Math.round(((i + 1) / targets.length) * 100));
    }
    setRunning(false);
    toast.success(`Audited ${targets.length} leads`);
  }

  if (leads.length === 0) {
    return (
      <PhaseShell
        title="Phase 2 — Audit websites"
        subtitle="We check each lead's site speed, mobile friendliness, HTTPS, and SEO gaps — then estimate monthly revenue lost."
        onPrev={onPrev}
        onNext={onNext}
        nextDisabled
        nextLabel="Rank prospects"
      >
        <IncompleteState
          title="No leads scraped yet"
          description="Go back to Phase 1 and scrape some leads first. Then come back here to audit each one's web presence."
          prevPhaseLabel="Scrape"
          onPrev={onPrev}
        />
      </PhaseShell>
    );
  }

  return (
    <PhaseShell
      title="Phase 2 — Audit websites"
      subtitle="We check each lead's site speed, mobile friendliness, HTTPS, and SEO gaps — then estimate monthly revenue lost."
      onPrev={onPrev}
      onNext={onNext}
      nextDisabled={Object.keys(audits).length === 0}
      nextLabel="Rank prospects"
    >
      <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Checkbox
            id="select-all"
            checked={allSelected}
            onCheckedChange={toggleAll}
            aria-label="Select all leads"
          />
          <label htmlFor="select-all" className="text-sm cursor-pointer">
            {selectedIds.size} of {leads.length} selected
          </label>
        </div>
        <Button onClick={runAudit} disabled={running || selectedIds.size === 0} className="h-10">
          {running ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Auditing...</> : "Run audit"}
        </Button>
      </div>

      {running && (
        <div className="mb-4">
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
        </div>
      )}

      <div className="grid gap-3">
        {leads.map((lead) => {
          const audit = audits[lead.id];
          return (
            <Card key={lead.id} className={selectedIds.has(lead.id) ? "" : "opacity-60"}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`check-${lead.id}`}
                    checked={selectedIds.has(lead.id)}
                    onCheckedChange={() => toggleOne(lead.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="font-medium">{lead.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{lead.address}</div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          {lead.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</span>}
                          {lead.whatsapp && <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />WhatsApp</span>}
                          {lead.website && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{lead.website}</span>}
                          {lead.rating && <span className="flex items-center gap-1"><Star className="h-3 w-3" />{lead.rating} ({lead.reviewsCount} reviews)</span>}
                        </div>
                      </div>
                      {audit ? (
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-center">
                            <div className="flex items-center gap-1.5">
                              <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className={`font-mono text-sm font-medium ${audit.pageSpeedScore < 50 ? "text-destructive" : audit.pageSpeedScore < 70 ? "text-chart-4" : "text-accent-foreground"}`}>
                                {audit.hasWebsite ? audit.pageSpeedScore : "—"}
                              </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">PageSpeed</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1.5">
                              <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-mono text-sm font-medium">{audit.estLostRevenuePerMonth.toLocaleString()}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">Lost/mo</div>
                          </div>
                          <Badge variant={audit.hasWebsite ? "secondary" : "destructive"} className="text-xs font-normal">
                            {audit.hasWebsite ? "Has site" : "No site"}
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs font-normal text-muted-foreground shrink-0">
                          {running && selectedIds.has(lead.id) ? "Auditing…" : "Pending"}
                        </Badge>
                      )}
                    </div>
                    {audit && (
                      <div className="mt-2 text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2 flex items-start gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                        <span>{audit.biggestGap}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PhaseShell>
  );
}
