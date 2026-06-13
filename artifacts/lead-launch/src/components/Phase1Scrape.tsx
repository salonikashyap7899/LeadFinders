import { useState, Suspense, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { PhaseShell } from "./PhaseShell";
import { Loader2, MapPin, Phone, Star, Globe, MessageCircle, Mail } from "lucide-react";
import type { Lead, ScrapeInput } from "@/lib/types";
import { toast } from "sonner";

const LeadMap = lazy(() => import("./LeadMap"));

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="font-display text-2xl tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

export function Phase1Scrape({
  leads,
  setLeads,
  onNext,
  onPrev,
}: {
  leads: Lead[];
  setLeads: (l: Lead[]) => void;
  onNext: () => void;
  onPrev?: () => void;
}) {
  const [input, setInput] = useState<ScrapeInput>({ niche: "Dentist", city: "Bandra, Mumbai", count: 12 });
  const [loading, setLoading] = useState(false);

  async function runScrape() {
    setLoading(true);
    setLeads([]);
    try {
      const res = await fetch(`${BASE}/api/scrape`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Scrape failed");
      for (let i = 0; i < data.leads.length; i++) {
        await new Promise((r) => setTimeout(r, 80));
        setLeads(data.leads.slice(0, i + 1));
      }
      const sourceLabel = data.source === "apify" ? "Google Maps crawler" : "OpenStreetMap";
      toast.success(`${data.leads.length} leads found in ${input.city} via ${sourceLabel}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PhaseShell
      title="Phase 1 — Scrape leads"
      subtitle="Pull local businesses from any city worldwide. We capture contact details, reviews, and location to score conversion potential."
      onPrev={onPrev}
      onNext={onNext}
      nextDisabled={leads.length === 0}
      nextLabel="Audit these leads"
    >
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Target</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="niche" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Niche / Business type</Label>
              <Input id="niche" autoComplete="off" value={input.niche} onChange={(e) => setInput({ ...input, niche: e.target.value })} placeholder="e.g. Dentist, Salon, Gym" className="h-10 text-base" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">City / Location (worldwide)</Label>
              <Input id="city" autoComplete="off" value={input.city} onChange={(e) => setInput({ ...input, city: e.target.value })} placeholder="e.g. London, Paris, Tokyo" className="h-10 text-base" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="count" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Count</Label>
              <Input id="count" type="number" inputMode="numeric" min={1} max={50} value={input.count} onChange={(e) => setInput({ ...input, count: Number(e.target.value) })} className="h-10 text-base font-mono tabular-nums" />
              <p className="text-[11px] text-muted-foreground">Up to 50. Uses OpenStreetMap data worldwide.</p>
            </div>
            <Button onClick={runScrape} disabled={loading} className="w-full h-11 transition-transform duration-150 active:scale-[0.98]">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Searching...</> : "Find leads"}
            </Button>
            <div className="grid grid-cols-3 gap-2 pt-2">
              <Stat label="Found" value={leads.length} />
              <Stat label="With phone" value={leads.filter((l) => l.phone).length} />
              <Stat label="No site" value={leads.filter((l) => !l.website).length} />
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-4">
          <Suspense fallback={
            <div className="h-[320px] rounded-lg border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground">
              Loading map...
            </div>
          }>
            <LeadMap leads={leads} />
          </Suspense>

          {leads.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{leads.length} leads found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Website</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <div className="font-medium">{lead.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" /> {lead.address}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs font-normal">{lead.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {lead.phone && <Phone className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />}
                              {lead.whatsapp && <MessageCircle className="h-3.5 w-3.5 text-accent-foreground" strokeWidth={1.5} />}
                              {lead.email && <Mail className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />}
                            </div>
                          </TableCell>
                          <TableCell>
                            {lead.rating ? (
                              <span className="flex items-center gap-1 text-sm">
                                <Star className="h-3.5 w-3.5 fill-chart-4 text-chart-4" /> {lead.rating}
                                {lead.reviewsCount ? <span className="text-muted-foreground text-xs">({lead.reviewsCount})</span> : null}
                              </span>
                            ) : <span className="text-muted-foreground text-xs">—</span>}
                          </TableCell>
                          <TableCell>
                            {lead.website ? (
                              <a href={lead.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                                <Globe className="h-3 w-3" /> Site
                              </a>
                            ) : (
                              <Badge variant="outline" className="text-xs font-normal text-destructive border-destructive/40">None</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {leads.length === 0 && !loading && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Enter a niche and location above, then click <strong>Find leads</strong> to search real businesses worldwide via OpenStreetMap.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PhaseShell>
  );
}
