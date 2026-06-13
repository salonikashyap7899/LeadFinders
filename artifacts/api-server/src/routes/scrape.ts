import { Router } from "express";

const router = Router();

const USER_AGENT = "LeadToLaunch/1.0 (+https://lead-launch.replit.app)";

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

type ScrapeInput = {
  niche: string;
  city: string;
  count: number;
};

function normalizeWebsite(url?: string): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function overpassFilters(niche: string): string[] {
  const n = niche.toLowerCase();
  if (n.includes("dentist") || n.includes("dental")) return ['["amenity"~"dentist"]'];
  if (n.includes("doctor") || n.includes("clinic") || n.includes("health")) return ['["amenity"~"clinic|doctors|hospital"]'];
  if (n.includes("pharmacy") || n.includes("chemist")) return ['["amenity"~"pharmacy"]'];
  if (n.includes("salon") || n.includes("beauty") || n.includes("spa")) return ['["shop"~"beauty|hairdresser"]', '["amenity"~"beauty_salon"]'];
  if (n.includes("gym") || n.includes("fitness")) return ['["leisure"~"fitness_centre|sports_centre"]'];
  if (n.includes("restaurant") || n.includes("food") || n.includes("dining")) return ['["amenity"~"restaurant|fast_food|food_court"]'];
  if (n.includes("cafe") || n.includes("coffee")) return ['["amenity"~"cafe"]'];
  if (n.includes("bar") || n.includes("pub")) return ['["amenity"~"bar|pub|nightclub"]'];
  if (n.includes("lawyer") || n.includes("legal") || n.includes("advocate")) return ['["office"~"lawyer|notary"]'];
  if (n.includes("hotel") || n.includes("resort") || n.includes("stay")) return ['["tourism"~"hotel|guest_house|hostel"]'];
  if (n.includes("school") || n.includes("coaching") || n.includes("tutor")) return ['["amenity"~"school|college|language_school"]'];
  if (n.includes("shop") || n.includes("store") || n.includes("retail")) return ['["shop"]'];
  if (n.includes("bank") || n.includes("finance")) return ['["amenity"~"bank|atm"]'];
  if (n.includes("photo") || n.includes("studio")) return ['["shop"~"photo"]'];
  if (n.includes("plumber") || n.includes("electrician") || n.includes("handyman")) return ['["shop"~"plumber|electrician"]'];
  return [];
}

function toLeads(elements: Array<Record<string, unknown>>, input: ScrapeInput): Lead[] {
  const results: Lead[] = [];
  for (let index = 0; index < elements.length; index++) {
    const element = elements[index];
    const tags = (element.tags ?? {}) as Record<string, string>;
    const center = (element.center ?? element) as { lat?: number; lon?: number; lng?: number };
    const lat = typeof center.lat === "number" ? center.lat : undefined;
    const lng = typeof center.lon === "number" ? center.lon : typeof center.lng === "number" ? center.lng : undefined;
    if (typeof lat !== "number" || typeof lng !== "number") continue;
    const name = tags.name ?? tags.brand ?? tags.operator ?? input.niche;
    const category = tags.amenity ?? tags.shop ?? tags.office ?? tags.tourism ?? tags.leisure ?? input.niche;
    const addressParts = [
      tags["addr:housenumber"],
      tags["addr:street"],
      tags["addr:suburb"],
      tags["addr:city"],
      tags["addr:state"],
      tags["addr:country"],
    ].filter(Boolean);
    const phone = tags.phone ?? tags["contact:phone"];
    const website = normalizeWebsite(tags.website ?? tags["contact:website"]);
    results.push({
      id: `osm-${String(index + 1).padStart(2, "0")}-${Math.round(lat * 10000)}-${Math.round(lng * 10000)}`,
      name: String(name),
      category: String(category),
      address: addressParts.length > 0 ? addressParts.join(", ") : input.city,
      city: input.city,
      phone,
      whatsapp: phone,
      email: tags.email ?? tags["contact:email"],
      website,
      rating: undefined,
      reviewsCount: undefined,
      lat,
      lng,
      photosCount: undefined,
      yearsInBusiness: undefined,
    });
  }
  return results;
}

async function geocodeCity(city: string): Promise<{ lat: number; lon: number } | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", city);
  try {
    const res = await fetch(url.toString(), {
      headers: { accept: "application/json", "user-agent": USER_AGENT },
    });
    if (!res.ok) return null;
    const items = (await res.json()) as Array<{ lat?: string; lon?: string }>;
    const first = items[0];
    if (!first?.lat || !first.lon) return null;
    return { lat: Number(first.lat), lon: Number(first.lon) };
  } catch {
    return null;
  }
}

async function searchOverpass(input: ScrapeInput): Promise<Lead[]> {
  const center = await geocodeCity(input.city);
  if (!center) return [];
  const filters = overpassFilters(input.niche);

  const radius = 25000;
  let filterStr: string;
  if (filters.length > 0) {
    filterStr = filters
      .map((f) => `nwr${f}(around:${radius},${center.lat},${center.lon});`)
      .join("\n  ");
  } else {
    filterStr = `nwr["name"]["amenity"](around:${radius},${center.lat},${center.lon});
  nwr["name"]["shop"](around:${radius},${center.lat},${center.lon});
  nwr["name"]["office"](around:${radius},${center.lat},${center.lon});`;
  }

  const query = `[out:json][timeout:25];
(
  ${filterStr}
);
out center tags;`;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "content-type": "text/plain;charset=UTF-8",
        accept: "application/json",
        "user-agent": USER_AGENT,
      },
      body: query,
    });
    if (!res.ok) return [];
    const payload = (await res.json()) as { elements?: Array<Record<string, unknown>> };
    return toLeads(payload.elements ?? [], input).slice(0, input.count);
  } catch {
    return [];
  }
}

async function searchApify(input: ScrapeInput, token: string, actor: string): Promise<Lead[]> {
  try {
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${token}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          searchStringsArray: [`${input.niche} in ${input.city}`],
          maxCrawledPlacesPerSearch: input.count,
          language: "en",
        }),
      },
    );
    if (!runRes.ok) throw new Error(`Apify ${runRes.status}`);
    const items = (await runRes.json()) as Array<Record<string, unknown>>;
    return items.slice(0, input.count).map((it, i) => ({
      id: `live-${String(i + 1).padStart(2, "0")}`,
      name: String(it.title ?? it.name ?? "Unknown"),
      category: String(it.categoryName ?? input.niche),
      address: String(it.address ?? ""),
      city: input.city,
      phone: it.phone ? String(it.phone) : undefined,
      whatsapp: it.phone ? String(it.phone) : undefined,
      email: undefined,
      website: it.website ? String(it.website) : undefined,
      rating: typeof it.totalScore === "number" ? it.totalScore : undefined,
      reviewsCount: typeof it.reviewsCount === "number" ? it.reviewsCount : undefined,
      lat: typeof (it.location as { lat?: number })?.lat === "number" ? (it.location as { lat: number }).lat : 51.5,
      lng: typeof (it.location as { lng?: number })?.lng === "number" ? (it.location as { lng: number }).lng : 0.1,
      photosCount: typeof it.imagesCount === "number" ? it.imagesCount : undefined,
    }));
  } catch {
    return [];
  }
}

router.post("/", async (req, res) => {
  const input = req.body as ScrapeInput;
  if (!input.niche?.trim() || !input.city?.trim()) {
    res.status(400).json({ source: "error", error: "Please provide both a niche and a location.", leads: [] });
    return;
  }

  const count = Math.min(50, Math.max(1, Number(input.count) || 12));
  const safeInput = { ...input, count };

  const APIFY_TOKEN = process.env.APIFY_TOKEN;
  const APIFY_ACTOR = process.env.APIFY_ACTOR ?? "compass~crawler-google-places";

  if (APIFY_TOKEN) {
    const leads = await searchApify(safeInput, APIFY_TOKEN, APIFY_ACTOR);
    if (leads.length > 0) {
      res.json({ source: "apify", leads });
      return;
    }
  }

  const leads = await searchOverpass(safeInput);
  if (leads.length > 0) {
    res.json({ source: "openstreetmap", leads });
    return;
  }

  res.json({
    source: "openstreetmap",
    error: `No results found for "${input.niche}" in "${input.city}". Try a broader niche (e.g. "cafe", "shop") or a larger city.`,
    leads: [],
  });
});

export default router;
