import type { Lead, AuditResult, ScrapeInput } from "./types";

function getBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return "http://localhost:8080";
}

export async function scrapeLeads(
  input: ScrapeInput
): Promise<{ leads: Lead[]; source: string; error?: string }> {
  const res = await fetch(`${getBase()}/api/scrape`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function auditLead(
  lead: Lead
): Promise<{ audit: AuditResult }> {
  const res = await fetch(`${getBase()}/api/audit`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ lead }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}
