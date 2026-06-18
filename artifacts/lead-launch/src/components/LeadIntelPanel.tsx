import { useState } from "react";
import {
  Globe, Linkedin, Instagram, ExternalLink, Loader2,
  CheckCircle2, XCircle, HelpCircle, Search,
} from "lucide-react";
import type { Lead } from "@/lib/types";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type DomainResult = { domain: string; available: boolean | null; registrarUrl: string };

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "").replace(/^(the|a|an)/, "").slice(0, 20);
}

export function LeadIntelPanel({ lead }: { lead: Lead }) {
  const [domains, setDomains] = useState<DomainResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function checkDomains() {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/intel/domain`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: lead.name, city: lead.city }),
      });
      const data = await res.json();
      setDomains(data.domains ?? []);
    } catch {
      setDomains([]);
    } finally { setLoading(false); }
  }

  const slug = slugify(lead.name);
  const igHandle = slug;
  const linkedinQuery = encodeURIComponent(`${lead.name} ${lead.city}`);

  return (
    <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 10, background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>
        🔍 Lead Intelligence
      </div>

      {/* Social links */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <a
          href={`https://www.instagram.com/${igHandle}/`}
          target="_blank" rel="noopener"
          style={{ fontSize: 10, padding: "4px 10px", borderRadius: 20, textDecoration: "none", display: "flex", alignItems: "center", gap: 5, background: "rgba(225,48,108,0.1)", border: "1px solid rgba(225,48,108,0.25)", color: "#fb7185" }}
        >
          <Instagram style={{ width: 10, height: 10 }} /> @{igHandle}
        </a>
        <a
          href={`https://www.linkedin.com/search/results/companies/?keywords=${linkedinQuery}`}
          target="_blank" rel="noopener"
          style={{ fontSize: 10, padding: "4px 10px", borderRadius: 20, textDecoration: "none", display: "flex", alignItems: "center", gap: 5, background: "rgba(10,102,194,0.1)", border: "1px solid rgba(10,102,194,0.25)", color: "#60a5fa" }}
        >
          <Linkedin style={{ width: 10, height: 10 }} /> LinkedIn Search
        </a>
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(lead.name + " " + lead.city)}`}
          target="_blank" rel="noopener"
          style={{ fontSize: 10, padding: "4px 10px", borderRadius: 20, textDecoration: "none", display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}
        >
          <Search style={{ width: 10, height: 10 }} /> Google
        </a>
      </div>

      {/* Domain checker */}
      {!domains ? (
        <button onClick={checkDomains} disabled={loading} style={{
          width: "100%", height: 30, borderRadius: 8, border: "1px solid rgba(6,182,212,0.3)",
          background: "rgba(6,182,212,0.08)", color: "#67e8f9", fontSize: 11, fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          {loading ? <><Loader2 style={{ width: 11, height: 11, animation: "spin 1s linear infinite" }} /> Checking domains…</> : <><Globe style={{ width: 11, height: 11 }} /> Check domain availability</>}
        </button>
      ) : (
        <div>
          <div style={{ fontSize: 9, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6, fontWeight: 600 }}>Domain Availability</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {domains.map(d => (
              <a key={d.domain} href={d.registrarUrl} target="_blank" rel="noopener" style={{
                fontSize: 10, padding: "3px 9px", borderRadius: 20, textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
                background: d.available === true ? "rgba(16,185,129,0.1)" : d.available === false ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${d.available === true ? "rgba(16,185,129,0.3)" : d.available === false ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.07)"}`,
                color: d.available === true ? "#10b981" : d.available === false ? "#6b7280" : "#9ca3af",
              }}>
                {d.available === true ? <CheckCircle2 style={{ width: 9, height: 9 }} /> : d.available === false ? <XCircle style={{ width: 9, height: 9 }} /> : <HelpCircle style={{ width: 9, height: 9 }} />}
                {d.domain}
                {d.available === true && " ✓ FREE"}
              </a>
            ))}
          </div>
          <button onClick={() => setDomains(null)} style={{ marginTop: 6, fontSize: 9, color: "#4b5563", background: "transparent", border: "none", cursor: "pointer" }}>
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
