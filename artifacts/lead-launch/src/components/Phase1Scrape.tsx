import { useState, Suspense, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhaseShell } from "./PhaseShell";
import { Loader2, MapPin, Phone, Star, Globe, MessageCircle, Mail, Search } from "lucide-react";
import type { Lead, ScrapeInput } from "@/lib/types";
import { toast } from "sonner";

const LeadMap = lazy(() => import("./LeadMap"));

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const POPULAR_NICHES = [
  "Dentist", "Salon & Beauty", "Restaurant", "Gym & Fitness", "Cafe",
  "Lawyer", "Hotel", "Clinic / Doctor", "Pharmacy", "School / Coaching",
  "Real Estate", "Bakery", "Jewellery", "Electronics Shop", "Auto Repair",
  "Florist", "Photographer", "Travel Agency", "Tailor", "Supermarket",
];

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="text-center px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
      <div className="font-bold text-xl tabular-nums" style={{ color: color ?? "var(--ll-text)" }}>{value}</div>
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
  const [input, setInput] = useState<ScrapeInput>({ niche: "Dentist", city: "Mumbai, India", count: 15 });
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string | null>(null);

  async function runScrape() {
    if (!input.niche.trim() || !input.city.trim()) {
      toast.error("Please enter both a business type and a location.");
      return;
    }
    setLoading(true);
    setLeads([]);
    setSource(null);
    try {
      const res = await fetch(`${BASE}/api/scrape`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Scrape failed");
      for (let i = 0; i < data.leads.length; i++) {
        await new Promise((r) => setTimeout(r, 60));
        setLeads(data.leads.slice(0, i + 1));
      }
      setSource(data.source);
      const sourceLabel = data.source === "apify" ? "Google Maps" : "OpenStreetMap";
      toast.success(`${data.leads.length} leads found via ${sourceLabel}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PhaseShell
      title="Phase 1 — Find Leads"
      subtitle="Search businesses worldwide by niche and location — enter any city, district, state, or country. We pull real data from OpenStreetMap's 600M+ business nodes."
      onPrev={onPrev}
      onNext={onNext}
      nextDisabled={leads.length === 0}
      nextLabel="Audit these leads →"
    >
      <div className="grid md:grid-cols-3 gap-5">
        {/* Search Form */}
        <Card className="md:col-span-1 border-[rgba(108,99,255,0.15)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(108,99,255,0.15)", border: "0.5px solid rgba(108,99,255,0.3)" }}>
                <Search className="h-3.5 w-3.5 text-primary" />
              </div>
              Search Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="niche" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Business Type / Niche</Label>
              <Input
                id="niche"
                autoComplete="off"
                value={input.niche}
                onChange={(e) => setInput({ ...input, niche: e.target.value })}
                placeholder="e.g. Dentist, Salon, Gym"
                className="h-10 text-sm"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {POPULAR_NICHES.slice(0, 8).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setInput({ ...input, niche: n })}
                    className="text-[10px] px-2 py-0.5 rounded-full transition-colors"
                    style={{
                      background: input.niche === n ? "rgba(108,99,255,0.2)" : "rgba(255,255,255,0.04)",
                      border: `0.5px solid ${input.niche === n ? "rgba(108,99,255,0.4)" : "rgba(255,255,255,0.08)"}`,
                      color: input.niche === n ? "#A78BFA" : "#8B8BAD",
                      cursor: "pointer",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Location <span className="normal-case text-[10px] text-muted-foreground/60">(city / district / state / country)</span>
              </Label>
              <Input
                id="city"
                autoComplete="off"
                value={input.city}
                onChange={(e) => setInput({ ...input, city: e.target.value })}
                placeholder="e.g. Bandra Mumbai, Gujarat, London, Japan"
                className="h-10 text-sm"
              />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Works for any location worldwide — neighbourhood, city, district, state, or entire country.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="count" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Number of Results</Label>
              <Select
                value={String(input.count)}
                onValueChange={(v) => setInput({ ...input, count: Number(v) })}
              >
                <SelectTrigger id="count" className="h-10 text-sm font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 20, 30, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} leads</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={runScrape}
              disabled={loading}
              className="w-full h-11 font-semibold transition-all duration-150 active:scale-[0.98]"
            >
              {loading
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Searching...</>
                : <><Search className="h-4 w-4 mr-2" /> Find Leads</>
              }
            </Button>

            {source && (
              <p className="text-center text-[10px] text-muted-foreground">
                Source: {source === "apify" ? "🗺 Google Maps (Apify)" : "🗺 OpenStreetMap"}
              </p>
            )}

            <div className="grid grid-cols-3 gap-2 pt-1">
              <Stat label="Found" value={leads.length} color="#A78BFA" />
              <Stat label="Phone" value={leads.filter((l) => l.phone).length} color="#34D399" />
              <Stat label="No Site" value={leads.filter((l) => !l.website).length} color="#FCA5A5" />
            </div>
          </CardContent>
        </Card>

        {/* Map + Results */}
        <div className="md:col-span-2 space-y-4">
          <Suspense fallback={
            <div className="h-[300px] rounded-xl border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground">
              Loading map...
            </div>
          }>
            <LeadMap leads={leads} />
          </Suspense>

          {leads.length > 0 && (
            <Card className="border-[rgba(108,99,255,0.15)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{leads.length} leads found</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {leads.filter((l) => !l.website).length} without website
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {leads.filter((l) => l.phone || l.email).length} contactable
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-4">Business</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Website</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id} className="hover:bg-white/[0.02]">
                          <TableCell className="pl-4">
                            <div className="font-medium text-sm">{lead.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[180px]">{lead.address}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs font-normal capitalize">
                              {lead.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {lead.phone && (
                                <span title={lead.phone}>
                                  <Phone className="h-3.5 w-3.5 text-green-400" strokeWidth={1.5} />
                                </span>
                              )}
                              {lead.whatsapp && (
                                <span title="WhatsApp">
                                  <MessageCircle className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
                                </span>
                              )}
                              {lead.email && (
                                <span title={lead.email}>
                                  <Mail className="h-3.5 w-3.5 text-blue-400" strokeWidth={1.5} />
                                </span>
                              )}
                              {!lead.phone && !lead.email && (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {lead.rating ? (
                              <span className="flex items-center gap-1 text-sm">
                                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{lead.rating}</span>
                                {lead.reviewsCount ? (
                                  <span className="text-muted-foreground text-xs">({lead.reviewsCount})</span>
                                ) : null}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {lead.website ? (
                              <a
                                href={lead.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <Globe className="h-3 w-3" /> Visit
                              </a>
                            ) : (
                              <Badge variant="outline" className="text-xs font-normal text-red-400 border-red-400/30">
                                No site
                              </Badge>
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
            <Card className="border-dashed border-[rgba(108,99,255,0.2)]">
              <CardContent className="py-14 text-center">
                <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(108,99,255,0.1)", border: "0.5px solid rgba(108,99,255,0.2)" }}>
                  <Search className="h-5 w-5 text-primary/60" />
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Ready to search</p>
                <p className="text-xs text-muted-foreground/60 max-w-xs mx-auto">
                  Enter a business type and any location — city, district, state, or country — then click <strong>Find Leads</strong>.
                </p>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card className="border-dashed border-[rgba(108,99,255,0.2)]">
              <CardContent className="py-14 text-center">
                <Loader2 className="h-7 w-7 mx-auto mb-3 animate-spin text-primary/60" />
                <p className="text-sm text-muted-foreground">Searching {input.city} for {input.niche} businesses…</p>
                <p className="text-xs text-muted-foreground/50 mt-1">Larger areas (states, countries) may take a few seconds</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PhaseShell>
  );
}
