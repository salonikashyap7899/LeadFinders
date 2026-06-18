import { useState, Suspense, lazy, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Phone, Star, Globe, MessageCircle, Mail, Search, Zap,
  Download, Send, MapPin, Loader2, List, Map as MapIcon, X,
} from "lucide-react";
import type { Lead, ScrapeInput } from "@/lib/types";
import { toast } from "sonner";

const LeadMap = lazy(() => import("./LeadMap"));
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const QUICK_NICHES = [
  "Dentist", "Salon", "Restaurant", "Gym", "Cafe",
  "Lawyer", "Hotel", "Clinic", "Pharmacy", "Coaching",
  "Real Estate", "Bakery",
];

const QUICK_LOCATIONS = [
  "Mumbai, India", "Delhi, India", "Bangalore, India",
  "London, UK", "Dubai, UAE", "New York, USA",
  "Singapore", "Toronto, Canada",
];

function exportCSV(leads: Lead[]) {
  const header = ["Name", "Category", "Address", "City", "Phone", "WhatsApp", "Email", "Website", "Rating", "Reviews", "Lat", "Lng"];
  const rows = leads.map(l => [
    l.name, l.category, l.address, l.city, l.phone ?? "", l.whatsapp ?? "",
    l.email ?? "", l.website ?? "", l.rating ?? "", l.reviewsCount ?? "", l.lat, l.lng,
  ]);
  const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "leads.csv"; a.click();
  URL.revokeObjectURL(url);
}

function openWhatsAppBlast(leads: Lead[], message = "") {
  const targets = leads.filter(l => l.whatsapp || l.phone);
  if (targets.length === 0) { toast.error("No leads with WhatsApp/phone number"); return; }
  let opened = 0;
  targets.slice(0, 5).forEach((l, i) => {
    const num = (l.whatsapp ?? l.phone ?? "").replace(/\D/g, "");
    const text = message || `Hi, I came across ${l.name} and wanted to connect about your online presence.`;
    setTimeout(() => window.open(`https://wa.me/${num}?text=${encodeURIComponent(text)}`, "_blank"), i * 400);
    opened++;
  });
  toast.success(`Opened ${opened} WhatsApp chats (first 5 — browser may block more)`);
}

export function Phase1Scrape({ leads, setLeads, onNext }: {
  leads: Lead[]; setLeads: (l: Lead[]) => void; onNext: () => void;
}) {
  const [input, setInput] = useState<ScrapeInput>({ niche: "Dentist", city: "Mumbai, India", count: 15 });
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "map">("list");
  const [filter, setFilter] = useState<"all" | "nosite" | "phone" | "email">("all");

  const runScrape = useCallback(async () => {
    if (!input.niche.trim() || !input.city.trim()) { toast.error("Enter a business type and location."); return; }
    setLoading(true); setLeads([]); setSource(null);
    try {
      const res = await fetch(`${BASE}/api/scrape`, {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Scrape failed");
      // stream results in
      for (let i = 0; i < data.leads.length; i++) {
        await new Promise(r => setTimeout(r, 40));
        setLeads(data.leads.slice(0, i + 1));
      }
      setSource(data.source);
      toast.success(`${data.leads.length} businesses found in ${input.city}!`);
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  }, [input]);

  const filtered = leads.filter(l =>
    filter === "nosite" ? !l.website
      : filter === "phone" ? !!l.phone
      : filter === "email" ? !!l.email
      : true
  );

  const withPhone = leads.filter(l => l.phone).length;
  const noSite = leads.filter(l => !l.website).length;
  const withEmail = leads.filter(l => l.email).length;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "272px 1fr",
      gap: 16,
      height: "100%",
      maxWidth: 1280,
      margin: "0 auto",
      minHeight: 0,
    }}>

      {/* ── LEFT PANEL: Search form ── */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 10,
        overflow: "hidden",
      }}>
        <div style={{
          flex: 1, overflow: "auto", borderRadius: 14, padding: "16px",
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(124,58,237,0.15)",
        }}>
          {/* Title */}
          <div style={{ marginBottom: 14 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 4px", color: "var(--ll-text)" }}>Find Leads</h1>
            <p style={{ fontSize: 11.5, color: "#4b5563", margin: 0, lineHeight: 1.6 }}>Search any niche worldwide via OpenStreetMap's 600M+ nodes.</p>
          </div>

          {/* Niche */}
          <div style={{ marginBottom: 10 }}>
            <Label style={{ fontSize: 9.5, color: "#374151", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>Business Type</Label>
            <Input
              value={input.niche}
              onChange={e => setInput({ ...input, niche: e.target.value })}
              placeholder="e.g. Dentist, Salon, Cafe"
              style={{ marginTop: 5, height: 36, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--ll-text)", fontSize: 13 }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
              {QUICK_NICHES.map(n => (
                <button key={n} onClick={() => setInput({ ...input, niche: n })} style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 20, cursor: "pointer",
                  background: input.niche === n ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${input.niche === n ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.06)"}`,
                  color: input.niche === n ? "#c4b5fd" : "#4b5563", transition: "all 0.12s",
                }}>{n}</button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div style={{ marginBottom: 10 }}>
            <Label style={{ fontSize: 9.5, color: "#374151", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>Location</Label>
            <Input
              value={input.city}
              onChange={e => setInput({ ...input, city: e.target.value })}
              placeholder="City, State, Country…"
              style={{ marginTop: 5, height: 36, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--ll-text)", fontSize: 13 }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
              {QUICK_LOCATIONS.map(loc => (
                <button key={loc} onClick={() => setInput({ ...input, city: loc })} style={{
                  fontSize: 10, padding: "2px 7px", borderRadius: 20, cursor: "pointer",
                  background: input.city === loc ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${input.city === loc ? "rgba(6,182,212,0.4)" : "rgba(255,255,255,0.05)"}`,
                  color: input.city === loc ? "#67e8f9" : "#4b5563", transition: "all 0.12s",
                }}>{loc}</button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div style={{ marginBottom: 14 }}>
            <Label style={{ fontSize: 9.5, color: "#374151", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>Max Results</Label>
            <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
              {[5, 10, 15, 20, 30, 50].map(n => (
                <button key={n} onClick={() => setInput({ ...input, count: n })} style={{
                  flex: 1, padding: "5px 0", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 600,
                  background: input.count === n ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${input.count === n ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.06)"}`,
                  color: input.count === n ? "#c4b5fd" : "#4b5563", transition: "all 0.12s",
                }}>{n}</button>
              ))}
            </div>
          </div>

          {/* Search button */}
          <button onClick={runScrape} disabled={loading} style={{
            width: "100%", height: 42, borderRadius: 10, border: "none", fontWeight: 700, fontSize: 13,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: loading ? "rgba(124,58,237,0.2)" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: loading ? "#4b5563" : "white",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 16px rgba(124,58,237,0.35)",
            transition: "all 0.15s",
          }}>
            {loading
              ? <><Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> Searching…</>
              : <><Zap style={{ width: 14, height: 14 }} /> Find Leads</>
            }
          </button>
          {source && <p style={{ textAlign: "center", fontSize: 9.5, color: "#374151", marginTop: 6 }}>{source === "apify" ? "📍 Google Maps (Apify)" : "🗺 OpenStreetMap"}</p>}
        </div>

        {/* Quick action buttons */}
        {leads.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {[
                { v: leads.length, l: "Found", c: "#a78bfa", filter: "all" as const },
                { v: withPhone, l: "Phone", c: "#10b981", filter: "phone" as const },
                { v: noSite, l: "No Site", c: "#fbbf24", filter: "nosite" as const },
              ].map(({ v, l, c, filter: f }) => (
                <button key={f} onClick={() => setFilter(f === filter ? "all" : f)} style={{
                  padding: "8px 6px", borderRadius: 9, border: `1px solid ${filter === f ? `${c}50` : "rgba(255,255,255,0.06)"}`,
                  background: filter === f ? `${c}15` : "rgba(255,255,255,0.025)", cursor: "pointer",
                  transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: c, letterSpacing: "-0.5px" }}>{v}</div>
                  <div style={{ fontSize: 9, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.6px", marginTop: 1 }}>{l}</div>
                </button>
              ))}
            </div>

            {/* Power actions */}
            <button onClick={() => exportCSV(leads)} style={{
              width: "100%", height: 34, borderRadius: 8, border: "1px solid rgba(16,185,129,0.3)",
              background: "rgba(16,185,129,0.08)", color: "#10b981", fontSize: 11, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <Download style={{ width: 12, height: 12 }} /> Export CSV ({leads.length} leads)
            </button>

            <button onClick={() => openWhatsAppBlast(leads)} style={{
              width: "100%", height: 34, borderRadius: 8, border: "1px solid rgba(37,211,102,0.3)",
              background: "rgba(37,211,102,0.08)", color: "#25d366", fontSize: 11, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <MessageCircle style={{ width: 12, height: 12 }} /> WhatsApp Blast ({withPhone} leads)
            </button>

            {leads.length > 0 && (
              <button onClick={onNext} style={{
                width: "100%", height: 36, borderRadius: 8, border: "none",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
              }}>
                Audit {leads.length} leads →
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL: Map + Results ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, overflow: "hidden", height: "100%" }}>

        {/* View toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
            <button onClick={() => setView("list")} style={{
              padding: "6px 12px", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 5,
              background: view === "list" ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.02)",
              color: view === "list" ? "#c4b5fd" : "#4b5563",
            }}>
              <List style={{ width: 11, height: 11 }} /> List
            </button>
            <button onClick={() => setView("map")} style={{
              padding: "6px 12px", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 5,
              background: view === "map" ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.02)",
              color: view === "map" ? "#c4b5fd" : "#4b5563",
            }}>
              <MapIcon style={{ width: 11, height: 11 }} /> Map
            </button>
          </div>
          {leads.length > 0 && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
                {noSite} no website
              </span>
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                {withPhone} contactable
              </span>
              {withEmail > 0 && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(6,182,212,0.1)", color: "#67e8f9", border: "1px solid rgba(6,182,212,0.2)" }}>
                {withEmail} email
              </span>}
              {filter !== "all" && (
                <button onClick={() => setFilter("all")} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 20, background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                  <X style={{ width: 9, height: 9 }} /> Clear filter
                </button>
              )}
            </div>
          )}
        </div>

        {view === "map" ? (
          /* Full map view */
          <div style={{ flex: 1, minHeight: 0 }}>
            <Suspense fallback={<div style={{ height: "100%", borderRadius: 12, border: "1px dashed rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151" }}>Loading map…</div>}>
              <LeadMap leads={filtered} />
            </Suspense>
          </div>
        ) : (
          /* Split: compact map + table */
          <>
            {/* Map (compact) */}
            <div style={{ height: 220, flexShrink: 0, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Suspense fallback={<div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.02)", color: "#374151", fontSize: 12 }}>Loading map…</div>}>
                <LeadMap leads={leads} />
              </Suspense>
            </div>

            {/* Results table */}
            <div style={{ flex: 1, minHeight: 0, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", display: "flex", flexDirection: "column" }}>
              {leads.length === 0 && !loading ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Search style={{ width: 22, height: 22, color: "#a78bfa" }} />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", margin: 0 }}>Ready to search</p>
                  <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>Pick a niche + location → click <strong style={{ color: "#a78bfa" }}>Find Leads</strong></p>
                </div>
              ) : loading ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <Loader2 style={{ width: 26, height: 26, color: "#7c3aed", animation: "spin 1s linear infinite" }} />
                  <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Searching {input.city}…</p>
                  {leads.length > 0 && <p style={{ fontSize: 11, color: "#374151", margin: 0 }}>{leads.length} found so far…</p>}
                </div>
              ) : (
                <>
                  {/* Table header */}
                  <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "grid", gridTemplateColumns: "1fr 90px 100px 70px 80px", gap: 8, flexShrink: 0 }}>
                    {["Business", "Category", "Contact", "Rating", "Website"].map(h => (
                      <div key={h} style={{ fontSize: 9.5, color: "#374151", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 700 }}>{h}</div>
                    ))}
                  </div>
                  {/* Scrollable rows */}
                  <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                    {filtered.map(lead => (
                      <div key={lead.id}
                        style={{ padding: "9px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "grid", gridTemplateColumns: "1fr 90px 100px 70px 80px", gap: 8, alignItems: "center", transition: "background 0.1s", cursor: "default" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.05)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                      >
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ll-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lead.name}</div>
                          <div style={{ fontSize: 10, color: "#4b5563", marginTop: 1, display: "flex", alignItems: "center", gap: 3 }}>
                            <MapPin style={{ width: 9, height: 9 }} />
                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>{lead.address}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: 9.5, padding: "2px 7px", borderRadius: 20, background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)", textTransform: "capitalize", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {lead.category}
                        </span>
                        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                          {lead.phone && <a href={`https://wa.me/${(lead.whatsapp ?? lead.phone).replace(/\D/g, "")}`} target="_blank" rel="noopener" title={lead.phone}><Phone style={{ width: 12, height: 12, color: "#10b981" }} /></a>}
                          {lead.whatsapp && <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener"><MessageCircle style={{ width: 12, height: 12, color: "#25d366" }} /></a>}
                          {lead.email && <a href={`mailto:${lead.email}`} title={lead.email}><Mail style={{ width: 12, height: 12, color: "#06b6d4" }} /></a>}
                          {!lead.phone && !lead.email && <span style={{ fontSize: 10, color: "#374151" }}>—</span>}
                        </div>
                        <div>
                          {lead.rating ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                              <Star style={{ width: 10, height: 10, color: "#fbbf24", fill: "#fbbf24" }} />
                              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ll-text)" }}>{lead.rating}</span>
                            </div>
                          ) : <span style={{ fontSize: 10, color: "#374151" }}>—</span>}
                        </div>
                        <div>
                          {lead.website
                            ? <a href={lead.website} target="_blank" rel="noopener" style={{ fontSize: 10, color: "#06b6d4", display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}><Globe style={{ width: 10, height: 10 }} /> Visit</a>
                            : <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", fontWeight: 600 }}>No site</span>
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
