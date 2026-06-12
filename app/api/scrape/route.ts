import { NextResponse } from "next/server";
import type { Lead, ScrapeInput } from "@/lib/types";

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_ACTOR = process.env.APIFY_ACTOR ?? "compass~crawler-google-places";
const USER_AGENT = "LeadToLaunch/1.0 (+https://localhost)";

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  class?: string;
  type?: string;
  address?: Record<string, string>;
  extratags?: Record<string, string>;
};

type DuckDuckGoResult = {
  title: string;
  url: string;
  snippet?: string;
};

function uniqueByPlaceId(items: NominatimResult[]) {
  const seen = new Set<number>();
  return items.filter((item) => {
    if (seen.has(item.place_id)) return false;
    seen.add(item.place_id);
    return true;
  });
}

function compactAddress(address: Record<string, string> | undefined, fallback: string) {
  if (!address) return fallback;
  const parts = [
    address.road,
    address.neighbourhood,
    address.suburb,
    address.city,
    address.town,
    address.village,
    address.county,
    address.state,
    address.country,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : fallback;
}

function normalizeWebsite(url?: string) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function decodeDuckDuckGoUrl(url: string) {
  try {
    const parsed = new URL(url.startsWith("//") ? `https:${url}` : url);
    const uddg = parsed.searchParams.get("uddg");
    if (uddg) return decodeURIComponent(uddg);
    return parsed.toString();
  } catch {
    return url;
  }
}

function isGenericDirectoryTitle(title: string) {
  const normalized = title.toLowerCase();
  return (
    normalized.startsWith("best ") ||
    normalized.startsWith("list of ") ||
    normalized.startsWith("top ") ||
    normalized.includes(" near me") ||
    normalized.includes("directory") ||
    normalized.includes("available in")
  );
}

function titleToName(title: string) {
  return title.split(" - ")[0].split("|")[0].trim();
}

async function geocodeQuery(query: string): Promise<{ lat: number; lon: number } | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", query);

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": USER_AGENT,
    },
  });
  if (!res.ok) return null;
  const items = (await res.json()) as Array<{ lat?: string; lon?: string }>;
  const first = items[0];
  if (!first?.lat || !first.lon) return null;
  return { lat: Number(first.lat), lon: Number(first.lon) };
}

function jitterCoordinate(value: number, seed: string, spread = 0.01) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  const delta = ((hash % 2000) / 1000 - 1) * spread;
  return value + delta;
}

async function fetchDuckDuckGoResults(query: string): Promise<DuckDuckGoResult[]> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "user-agent": USER_AGENT,
    },
  });
  if (!res.ok) return [];
  const html = await res.text();
  const matches = [...html.matchAll(/result__a\"[^>]*href=\"([^\"]+)\"[^>]*>([\s\S]*?)<\/a>/g)];
  return matches.map((match) => ({
    url: decodeDuckDuckGoUrl(match[1].replace(/&amp;/g, "&")),
    title: match[2].replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim(),
  }));
}

async function searchDuckDuckGoProfiles(input: ScrapeInput): Promise<Lead[]> {
  const center = (await geocodeCity(input.city)) ?? { lat: 0, lon: 0 };
  const siteQueries = [
    `site:practo.com ${input.niche} ${input.city}`,
    `site:lybrate.com ${input.niche} ${input.city}`,
    `site:dentistinsider.com ${input.niche} ${input.city}`,
  ];

  const rawResults: DuckDuckGoResult[] = [];
  for (const query of siteQueries) {
    const results = await fetchDuckDuckGoResults(query);
    rawResults.push(...results);
  }

  const filtered = rawResults
    .filter((result) => !isGenericDirectoryTitle(result.title))
    .filter((result) => /practo|lybrate|dentistinsider/i.test(result.url) || /^dr\.?\s/i.test(result.title))
    .filter((result, index, all) => all.findIndex((item) => item.title === result.title || item.url === result.url) === index)
    .slice(0, input.count * 2);

  if (filtered.length === 0) return [];

  const geocoded = await Promise.all(
    filtered.map(async (result, index) => {
      const placeName = titleToName(result.title);
      const candidate = await geocodeQuery(`${placeName} ${input.city}`);
      const lat = candidate?.lat ?? jitterCoordinate(center.lat, placeName, 0.02 + index * 0.001);
      const lon = candidate?.lon ?? jitterCoordinate(center.lon, placeName, 0.02 + index * 0.001);
      return {
        id: `ddg-${String(index + 1).padStart(2, "0")}`,
        name: placeName,
        category: input.niche,
        address: input.city,
        city: input.city,
        website: result.url,
        lat,
        lng: lon,
      } satisfies Lead;
    }),
  );

  return geocoded.slice(0, input.count);
}

function toLead(item: NominatimResult, input: ScrapeInput, index: number): Lead {
  const extra = item.extratags ?? {};
  const phone = extra.phone ?? extra["contact:phone"];
  const website = normalizeWebsite(extra.website ?? extra["contact:website"]);
  return {
    id: `osm-${String(index + 1).padStart(2, "0")}-${item.place_id}`,
    name: item.name ?? item.display_name.split(",")[0] ?? input.niche,
    category: item.type ? `${item.class ?? "place"} · ${item.type}` : input.niche,
    address: compactAddress(item.address, item.display_name),
    city: input.city,
    phone,
    whatsapp: phone,
    email: extra.email ?? undefined,
    website,
    rating: undefined,
    reviewsCount: undefined,
    lat: Number(item.lat),
    lng: Number(item.lon),
    photosCount: undefined,
    yearsInBusiness: undefined,
  };
}

async function searchNominatim(input: ScrapeInput): Promise<Lead[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("extratags", "1");
  url.searchParams.set("namedetails", "1");
  url.searchParams.set("limit", String(Math.max(input.count * 3, 12)));
  url.searchParams.set("q", `${input.niche} ${input.city}`);

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": USER_AGENT,
    },
  });
  if (!res.ok) return [];
  const items = (await res.json()) as NominatimResult[];
  return uniqueByPlaceId(items)
    .filter((item) => Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lon)))
    .slice(0, input.count)
    .map((item, i) => toLead(item, input, i));
}

function overpassFilters(niche: string) {
  const normalized = niche.toLowerCase();
  if (normalized.includes("dent") || normalized.includes("dental")) return ['["amenity"="dentist"]'];
  if (normalized.includes("doctor") || normalized.includes("clinic") || normalized.includes("medical")) {
    return ['["amenity"~"clinic|doctors|hospital|dentist"]'];
  }
  if (normalized.includes("salon") || normalized.includes("hair") || normalized.includes("beauty") || normalized.includes("spa")) {
    return ['["shop"~"hairdresser|beauty"]', '["amenity"="spa"]'];
  }
  if (normalized.includes("gym") || normalized.includes("fitness")) return ['["leisure"="fitness_centre"]'];
  if (normalized.includes("restaurant") || normalized.includes("cafe") || normalized.includes("food")) {
    return ['["amenity"~"restaurant|cafe|fast_food"]'];
  }
  if (normalized.includes("lawyer") || normalized.includes("attorney") || normalized.includes("advocate")) {
    return ['["office"="lawyer"]'];
  }
  if (normalized.includes("school") || normalized.includes("coaching") || normalized.includes("tutor") || normalized.includes("academy")) {
    return ['["amenity"~"school|college|language_school"]'];
  }
  if (normalized.includes("hotel") || normalized.includes("resort") || normalized.includes("stay")) {
    return ['["tourism"~"hotel|guest_house|hostel"]'];
  }
  return [];
}

function toOverpassLeads(elements: Array<Record<string, unknown>>, input: ScrapeInput): Lead[] {
  return elements
    .map((element, index) => {
      const tags = (element.tags ?? {}) as Record<string, string>;
      const center = (element.center ?? element) as { lat?: number; lon?: number; lng?: number };
      const lat = typeof center.lat === "number" ? center.lat : undefined;
      const lng = typeof center.lon === "number" ? center.lon : typeof center.lng === "number" ? center.lng : undefined;
      if (typeof lat !== "number" || typeof lng !== "number") return null;
      const name = tags.name ?? tags.brand ?? tags.operator ?? input.niche;
      const category = tags.amenity ?? tags.shop ?? tags.office ?? tags.tourism ?? input.niche;
      const addressParts = [tags["addr:housenumber"], tags["addr:street"], tags["addr:suburb"], tags["addr:city"], tags["addr:state"], tags["addr:country"]].filter(Boolean);
      const phone = tags.phone ?? tags["contact:phone"];
      const website = normalizeWebsite(tags.website ?? tags["contact:website"]);
      return {
        id: `osm-${String(index + 1).padStart(2, "0")}-${Math.round(lat * 10000)}-${Math.round(lng * 10000)}`,
        name: String(name),
        category: String(category),
        address: addressParts.length > 0 ? addressParts.join(", ") : input.city,
        city: input.city,
        phone,
        whatsapp: phone,
        email: tags.email,
        website,
        rating: undefined,
        reviewsCount: undefined,
        lat,
        lng,
        photosCount: undefined,
        yearsInBusiness: undefined,
      } satisfies Lead;
    })
    .filter((lead): lead is Lead => !!lead);
}

async function geocodeCity(city: string): Promise<{ lat: number; lon: number } | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", city);

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": USER_AGENT,
    },
  });
  if (!res.ok) return null;
  const items = (await res.json()) as Array<{ lat?: string; lon?: string }>;
  const first = items[0];
  if (!first?.lat || !first.lon) return null;
  return { lat: Number(first.lat), lon: Number(first.lon) };
}

async function searchOverpass(input: ScrapeInput): Promise<Lead[]> {
  const center = await geocodeCity(input.city);
  if (!center) return [];
  const filters = overpassFilters(input.niche);
  if (filters.length === 0) return [];

  const radius = 25000;
  const query = `
[out:json][timeout:25];
(
  ${filters
    .map((filter) => `nwr${filter}(around:${radius},${center.lat},${center.lon});`)
    .join("\n  ")}
);
out center tags;
`;

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
  return toOverpassLeads(payload.elements ?? [], input).slice(0, input.count);
}

async function searchOverpassBroad(input: ScrapeInput): Promise<Lead[]> {
  const center = await geocodeCity(input.city);
  if (!center) return [];

  const query = `
[out:json][timeout:25];
(
  nwr["name"]["amenity"~"restaurant|cafe|fast_food|bar|clinic|hospital|dentist|doctors|pharmacy|bank|atm|fuel|gym|beauty_salon|car_wash|lawyer|post_office|marketplace|nightclub|childcare"](around:30000,${center.lat},${center.lon});
  nwr["name"]["shop"](around:30000,${center.lat},${center.lon});
  nwr["name"]["office"](around:30000,${center.lat},${center.lon});
  nwr["name"]["tourism"](around:30000,${center.lat},${center.lon});
  nwr["name"]["leisure"](around:30000,${center.lat},${center.lon});
);
out center tags;
`;

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
  return toOverpassLeads(payload.elements ?? [], input).slice(0, input.count);
}

export async function POST(req: Request) {
  const input = (await req.json()) as ScrapeInput;

  if (!input.niche?.trim() || !input.city?.trim()) {
    return NextResponse.json({ source: "error", error: "Please provide both a niche and a location.", leads: [] }, { status: 400 });
  }

  if (APIFY_TOKEN) {
    try {
      const runRes = await fetch(
        `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
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

      const leads: Lead[] = items.slice(0, input.count).map((it, i) => ({
        id: `live-${String(i + 1).padStart(2, "0")}`,
        name: String(it.title ?? it.name ?? "Unknown"),
        category: String(it.categoryName ?? input.niche),
        address: String(it.address ?? ""),
        city: input.city,
        phone: it.phone ? String(it.phone) : undefined,
        whatsapp: it.phone ? String(it.phone) : undefined,
        email: undefined,
        website: it.website ? String(it.website) : undefined,
        rating: typeof it.totalScore === "number" ? (it.totalScore as number) : undefined,
        reviewsCount: typeof it.reviewsCount === "number" ? (it.reviewsCount as number) : undefined,
        lat: typeof (it.location as { lat?: number })?.lat === "number" ? (it.location as { lat: number }).lat : 19.06,
        lng: typeof (it.location as { lng?: number })?.lng === "number" ? (it.location as { lng: number }).lng : 72.83,
        photosCount: typeof it.imagesCount === "number" ? (it.imagesCount as number) : undefined,
      }));

      return NextResponse.json({ source: "apify", leads });
    } catch {
      // Fall through to public search below.
    }
  }

  const nominatimLeads = await searchNominatim(input);
  if (nominatimLeads.length > 0) {
    return NextResponse.json({ source: "openstreetmap", leads: nominatimLeads });
  }

  const overpassLeads = await searchOverpass(input);
  if (overpassLeads.length > 0) {
    return NextResponse.json({ source: "openstreetmap", leads: overpassLeads });
  }

  const broadLeads = await searchOverpassBroad(input);
  if (broadLeads.length > 0) {
    return NextResponse.json({ source: "openstreetmap", leads: broadLeads });
  }

  const ddgLeads = await searchDuckDuckGoProfiles(input);
  if (ddgLeads.length > 0) {
    return NextResponse.json({ source: "duckduckgo", leads: ddgLeads });
  }

  try {
    return NextResponse.json({
      source: "duckduckgo",
      error: `No public business results found for ${input.niche} in ${input.city}. Try a broader search term or a larger city nearby.`,
      leads: [],
    });
  } catch (e) {
    return NextResponse.json({ source: "error", error: (e as Error).message, leads: [] }, { status: 500 });
  }
}
