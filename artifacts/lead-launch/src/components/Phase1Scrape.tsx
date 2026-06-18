import { useState, Suspense, lazy } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhaseShell } from "./PhaseShell";
import { Loader2, MapPin, Phone, Star, Globe, MessageCircle, Mail, Search, Zap } from "lucide-react";
import type { Lead, ScrapeInput } from "@/lib/types";
import { toast } from "sonner";

const LeadMap = lazy(() => import("./LeadMap"));
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const QUICK_NICHES = ["Dentist", "Salon", "Restaurant", "Gym", "Cafe", "Lawyer", "Hotel", "Clinic", "Pharmacy", "Coaching", "Real Estate", "Bakery"];
const QUICK_LOCATIONS = ["Mumbai, India", "Delhi, India", "Bangalore, India", "London, UK", "Dubai, UAE", "New York, USA", "Singapore", "Toronto, Canada"];

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      flex: 1, textAlign: "center", padding: "10px 8px", borderRadius: 10,
      background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{ fontSize: 20, fontWeight: 700, color, letterSpacing: "-0.5px" }}>{value}</div>
      <div style={{ fontSize: 9, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.7px", marginTop: 2 }}>{label}</div>
    </div>
  );
}

export function Phase1Scrape({ leads, setLeads, onNext, onPrev }: {
  leads: Lead[]; setLeads: (l: Lead[]) => void; onNext: () => void; onPrev?: () => void;
}) {
  const [input, setInput] = useState<ScrapeInput>({ niche: "Dentist", city: "Mumbai, India", count: 15 });
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string | null>(null);

  async function runScrape() {
    if (!input.niche.trim() || !input.city.trim()) { toast.error("Enter a business type and location."); return; }
    setLoading(true); setLeads([]); setSource(null);
    try {
      const res = await fetch(`${BASE}/api/scrape`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input) });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Scrape failed");
      for (let i = 0; i < data.leads.length; i++) {
        await new Promise(r => setTimeout(r, 55));
        setLeads(data.leads.slice(0, i + 1));
      }
      setSource(data.source);
      toast.success(`${data.leads.length} businesses found!`);
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  }

  const withPhone = leads.filter(l => l.phone).length;
  const noSite = leads.filter(l => !l.website).length;
  const withEmail = leads.filter(l => l.email).length;

  return (
    <PhaseShell
      title="Find Leads"
      subtitle="Search any niche worldwide — enter a city, district, state, or whole country. Powered by OpenStreetMap's 600M+ business nodes."
      onPrev={onPrev} onNext={onNext} nextDisabled={leads.length === 0} nextLabel="Audit these leads"
    >
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>

        {/* ── SEARCH PANEL ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Search card */}
          <div className="glow-card" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(124,58,237,0.18)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Search style={{ width: 13, height: 13, color: "#a78bfa" }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ll-text)" }}>Search Parameters</span>
            </div>

            <div style={{ marginBottom: 14 }}>
              <Label style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.9px", fontWeight: 600 }}>Business Type</Label>
              <Input
                value={input.niche}
                onChange={e => setInput({ ...input, niche: e.target.value })}
                placeholder="e.g. Dentist, Salon, Cafe"
                style={{ marginTop: 6, height: 40, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--ll-text)", fontSize: 13 }}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                {QUICK_NICHES.map(n => (
                  <button key={n} onClick={() => setInput({ ...input, niche: n })} style={{
                    fontSize: 10, padding: "3px 9px", borderRadius: 20, cursor: "pointer",
                    background: input.niche === n ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${input.niche === n ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.07)"}`,
                    color: input.niche === n ? "#c4b5fd" : "#4b5563",
                    transition: "all 0.12s",
                  }}>{n}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <Label style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.9px", fontWeight: 600 }}>
                Location <span style={{ fontSize: 9, color: "#374151", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(city / district / state / country)</span>
              </Label>
              <Input
                value={input.city}
                onChange={e => setInput({ ...input, city: e.target.value })}
                placeholder="e.g. Mumbai, Gujarat, London, Japan"
                style={{ marginTop: 6, height: 40, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--ll-text)", fontSize: 13 }}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                {QUICK_LOCATIONS.map(loc => (
                  <button key={loc} onClick={() => setInput({ ...input, city: loc })} style={{
                    fontSize: 10, padding: "3px 8px", borderRadius: 20, cursor: "pointer",
                    background: input.city === loc ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${input.city === loc ? "rgba(6,182,212,0.4)" : "rgba(255,255,255,0.06)"}`,
                    color: input.city === loc ? "#67e8f9" : "#4b5563",
                    transition: "all 0.12s",
                  }}>{loc}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Label style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.9px", fontWeight: 600 }}>Max Results</Label>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {[5, 10, 15, 20, 30, 50].map(n => (
                  <button key={n} onClick={() => setInput({ ...input, count: n })} style={{
                    flex: 1, padding: "6px 0", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 600,
                    background: input.count === n ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${input.count === n ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.06)"}`,
                    color: input.count === n ? "#c4b5fd" : "#4b5563",
                    transition: "all 0.12s",
                  }}>{n}</button>
                ))}
              </div>
            </div>

            <button
              onClick={runScrape}
              disabled={loading}
              style={{
                width: "100%", height: 44, borderRadius: 10, border: "none", fontWeight: 700,
                fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: loading ? "rgba(124,58,237,0.2)" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
                color: loading ? "#4b5563" : "white",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 16px rgba(124,58,237,0.35)",
                transition: "all 0.15s",
              }}
            >
              {loading
                ? <><Loader2 style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} /> Searching…</>
                : <><Zap style={{ width: 15, height: 15 }} /> Find Leads</>
              }
            </button>

            {source && (
              <p style={{ textAlign: "center", fontSize: 10, color: "#374151", marginTop: 8 }}>
                {source === "apify" ? "📍 Via Google Maps (Apify)" : "🗺 Via OpenStreetMap"}
              </p>
            )}
          </div>

          {/* Live stats */}
          <div style={{ display: "flex", gap: 8 }}>
            <StatPill label="Found" value={leads.length} color="#a78bfa" />
            <StatPill label="Phone" value={withPhone} color="#10b981" />
            <StatPill label="No site" value={noSite} color="#fbbf24" />
          </div>

          {withEmail > 0 && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", fontSize: 12, color: "#67e8f9", display: "flex", alignItems: "center", gap: 8 }}>
              <Mail style={{ width: 13, height: 13, flexShrink: 0 }} />
              <span>{withEmail} lead{withEmail > 1 ? "s" : ""} with email address found</span>
            </div>
          )}
        </div>

        {/* ── RESULTS PANEL ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Map */}
          <Suspense fallback={
            <div style={{ height: 280, borderRadius: 14, border: "1px dashed rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151", fontSize: 13 }}>
              Loading map…
            </div>
          }>
            <LeadMap leads={leads} />
          </Suspense>

          {/* Empty state */}
          {leads.length === 0 && !loading && (
            <div style={{ borderRadius: 14, border: "1px dashed rgba(124,58,237,0.18)", padding: "48px 24px", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <Search style={{ width: 20, height: 20, color: "#a78bfa" }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", margin: "0 0 6px" }}>Ready to search</p>
              <p style={{ fontSize: 12, color: "#374151", maxWidth: 300, margin: "0 auto" }}>Pick a niche and location, then click <strong style={{ color: "#a78bfa" }}>Find Leads</strong></p>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div style={{ borderRadius: 14, border: "1px dashed rgba(124,58,237,0.18)", padding: "48px 24px", textAlign: "center" }}>
              <Loader2 style={{ width: 28, height: 28, margin: "0 auto 12px", color: "#7c3aed", animation: "spin 1s linear infinite" }} />
              <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 4px" }}>Searching {input.city}…</p>
              <p style={{ fontSize: 11, color: "#374151" }}>Large areas (states/countries) may take a few seconds</p>
            </div>
          )}

          {/* Results table */}
          {leads.length > 0 && (
            <div className="glow-card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ll-text)" }}>
                  {leads.length} businesses found
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
                    {noSite} no website
                  </span>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                    {withPhone} contactable
                  </span>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      {["Business", "Category", "Contact", "Rating", "Website"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.7px", fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead, i) => (
                      <tr key={lead.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.12s" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.05)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                      >
                        <td style={{ padding: "11px 14px" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ll-text)" }}>{lead.name}</div>
                          <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                            <MapPin style={{ width: 10, height: 10 }} />
                            <span style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.address}</span>
                          </div>
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)", textTransform: "capitalize" }}>
                            {lead.category}
                          </span>
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {lead.phone && <Phone style={{ width: 13, height: 13, color: "#10b981" }} title={lead.phone} />}
                            {lead.whatsapp && <MessageCircle style={{ width: 13, height: 13, color: "#7c3aed" }} title="WhatsApp" />}
                            {lead.email && <Mail style={{ width: 13, height: 13, color: "#06b6d4" }} title={lead.email} />}
                            {!lead.phone && !lead.email && <span style={{ fontSize: 11, color: "#374151" }}>—</span>}
                          </div>
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          {lead.rating ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <Star style={{ width: 12, height: 12, color: "#fbbf24", fill: "#fbbf24" }} />
                              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ll-text)" }}>{lead.rating}</span>
                              {lead.reviewsCount && <span style={{ fontSize: 10, color: "#4b5563" }}>({lead.reviewsCount})</span>}
                            </div>
                          ) : <span style={{ fontSize: 11, color: "#374151" }}>—</span>}
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          {lead.website ? (
                            <a href={lead.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#06b6d4", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
                              <Globe style={{ width: 11, height: 11 }} /> Visit
                            </a>
                          ) : (
                            <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>No site</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </PhaseShell>
  );
}
