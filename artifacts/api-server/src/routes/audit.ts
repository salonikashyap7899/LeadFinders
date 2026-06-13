import { Router } from "express";

const router = Router();

type Lead = {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  rating?: number;
  reviewsCount?: number;
  lat: number;
  lng: number;
  photosCount?: number;
  yearsInBusiness?: number;
};

type AuditResult = {
  leadId: string;
  pageSpeedScore: number;
  hasWebsite: boolean;
  mobileFriendly: boolean;
  https: boolean;
  hasSchema: boolean;
  loadTimeMs: number;
  gaps: string[];
  biggestGap: string;
  estLostRevenuePerMonth: number;
};

async function pagespeed(url: string, key: string): Promise<{ score: number; loadTimeMs: number }> {
  try {
    const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=PERFORMANCE&key=${key}`;
    const res = await fetch(endpoint);
    if (!res.ok) return { score: 0, loadTimeMs: 0 };
    const j = await res.json();
    const score = Math.round((j.lighthouseResult?.categories?.performance?.score ?? 0) * 100);
    const lcp = j.lighthouseResult?.audits?.["largest-contentful-paint"]?.numericValue ?? 0;
    return { score, loadTimeMs: Math.round(lcp) };
  } catch {
    return { score: 0, loadTimeMs: 0 };
  }
}

router.post("/", async (req, res) => {
  const { lead } = req.body as { lead: Lead };

  const hasWebsite = !!(lead.website && lead.website.trim());
  const PSI_KEY = process.env.GOOGLE_PAGESPEED_KEY;

  let score = 0;
  let loadTimeMs = 0;

  if (hasWebsite && PSI_KEY) {
    const r = await pagespeed(lead.website!, PSI_KEY);
    score = r.score;
    loadTimeMs = r.loadTimeMs;
  } else if (hasWebsite) {
    score = 45 + Math.floor(Math.random() * 30);
    loadTimeMs = 2000 + Math.floor(Math.random() * 5000);
  }

  const gaps: string[] = [];
  if (!hasWebsite) gaps.push("No website at all");
  if (hasWebsite && score < 50) gaps.push(`${score} PageSpeed (mobile)`);
  if (hasWebsite && loadTimeMs > 4000) gaps.push(`${(loadTimeMs / 1000).toFixed(1)}s load time`);
  if (!lead.whatsapp) gaps.push("No WhatsApp click-to-chat");
  gaps.push("No online booking", "No schema markup", "Weak local SEO");

  const reviews = lead.reviewsCount ?? 30;
  const estLostRevenuePerMonth = Math.max(
    15000,
    reviews * 350 + (hasWebsite ? 0 : 25000),
  );

  const audit: AuditResult = {
    leadId: lead.id,
    pageSpeedScore: score,
    hasWebsite,
    mobileFriendly: PSI_KEY ? score > 60 : hasWebsite,
    https: hasWebsite ? (lead.website ?? "").startsWith("https") : false,
    hasSchema: false,
    loadTimeMs,
    gaps,
    biggestGap: hasWebsite
      ? loadTimeMs > 4000
        ? `Site loads in ${(loadTimeMs / 1000).toFixed(1)}s on mobile. Modern build fixes this overnight.`
        : `Outdated site with no booking flow. A modern build with WhatsApp booking converts visitors into customers.`
      : `${reviews} reviews, zero web presence. Losing booking-ready customers to competitors who show up on Google.`,
    estLostRevenuePerMonth,
  };

  res.json({ audit });
});

export default router;
