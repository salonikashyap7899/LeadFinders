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
  if (n.includes("pharmacy") || n.includes("chemist") || n.includes("drug")) return ['["amenity"~"pharmacy"]'];
  if (n.includes("salon") || n.includes("beauty") || n.includes("spa") || n.includes("parlour") || n.includes("parlor")) return ['["shop"~"beauty|hairdresser"]', '["amenity"~"beauty_salon"]'];
  if (n.includes("gym") || n.includes("fitness") || n.includes("yoga") || n.includes("pilates")) return ['["leisure"~"fitness_centre|sports_centre|gym"]'];
  if (n.includes("restaurant") || n.includes("food") || n.includes("dining") || n.includes("eatery") || n.includes("dhaba") || n.includes("biryani") || n.includes("pizza")) return ['["amenity"~"restaurant|fast_food|food_court|biryani"]'];
  if (n.includes("cafe") || n.includes("coffee") || n.includes("tea")) return ['["amenity"~"cafe|tea_house"]'];
  if (n.includes("bar") || n.includes("pub") || n.includes("nightclub") || n.includes("lounge")) return ['["amenity"~"bar|pub|nightclub"]'];
  if (n.includes("lawyer") || n.includes("legal") || n.includes("advocate") || n.includes("solicitor") || n.includes("attorney")) return ['["office"~"lawyer|notary|legal"]'];
  if (n.includes("hotel") || n.includes("resort") || n.includes("lodge") || n.includes("stay") || n.includes("hostel") || n.includes("guesthouse") || n.includes("bnb")) return ['["tourism"~"hotel|guest_house|hostel|motel"]'];
  if (n.includes("school") || n.includes("coaching") || n.includes("tutor") || n.includes("academy") || n.includes("institute") || n.includes("college")) return ['["amenity"~"school|college|university|language_school|driving_school"]'];
  if (n.includes("shop") || n.includes("store") || n.includes("retail") || n.includes("boutique")) return ['["shop"]'];
  if (n.includes("bank") || n.includes("finance") || n.includes("loan") || n.includes("insurance")) return ['["amenity"~"bank"]', '["office"~"insurance|financial"]'];
  if (n.includes("photo") || n.includes("studio") || n.includes("photographer")) return ['["shop"~"photo"]', '["office"~"photographer"]'];
  if (n.includes("plumber") || n.includes("electrician") || n.includes("handyman") || n.includes("carpenter") || n.includes("repair")) return ['["shop"~"plumber|electrician|hardware"]', '["craft"~"plumber|electrician|carpenter"]'];
  if (n.includes("realestate") || n.includes("real estate") || n.includes("property") || n.includes("realtor") || n.includes("broker")) return ['["office"~"estate_agent|real_estate"]'];
  if (n.includes("supermarket") || n.includes("grocery") || n.includes("kirana") || n.includes("market")) return ['["shop"~"supermarket|convenience|grocery"]'];
  if (n.includes("clothe") || n.includes("fashion") || n.includes("garment") || n.includes("tailor") || n.includes("apparel")) return ['["shop"~"clothes|tailor|fashion"]'];
  if (n.includes("jewel") || n.includes("jewellery") || n.includes("jewelry")) return ['["shop"~"jewelry|jewellery"]'];
  if (n.includes("electronics") || n.includes("mobile") || n.includes("phone") || n.includes("computer")) return ['["shop"~"electronics|mobile_phone|computer"]'];
  if (n.includes("car") || n.includes("auto") || n.includes("garage") || n.includes("mechanic") || n.includes("vehicle")) return ['["shop"~"car|car_repair|car_parts"]', '["amenity"~"car_wash|fuel"]'];
  if (n.includes("hospital") || n.includes("nursing") || n.includes("medical")) return ['["amenity"~"hospital|clinic|doctors"]'];
  if (n.includes("vet") || n.includes("veterinary") || n.includes("animal")) return ['["amenity"~"veterinary"]'];
  if (n.includes("bakery") || n.includes("pastry") || n.includes("cake") || n.includes("sweet")) return ['["shop"~"bakery|confectionery|pastry"]'];
  if (n.includes("florist") || n.includes("flower")) return ['["shop"~"florist|flowers"]'];
  if (n.includes("book") || n.includes("library") || n.includes("stationery")) return ['["shop"~"books|stationery"]', '["amenity"~"library"]'];
  if (n.includes("gym") || n.includes("sport") || n.includes("cricket") || n.includes("football") || n.includes("tennis")) return ['["leisure"~"sports_centre|fitness_centre|stadium"]'];
  if (n.includes("travel") || n.includes("tour") || n.includes("tourism") || n.includes("agent")) return ['["shop"~"travel_agency"]', '["office"~"travel_agent|tour_operator"]'];
  if (n.includes("event") || n.includes("wedding") || n.includes("catering") || n.includes("decorator")) return ['["shop"~"party|event"]', '["amenity"~"events_venue"]'];
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
    const category = tags.amenity ?? tags.shop ?? tags.office ?? tags.tourism ?? tags.leisure ?? tags.craft ?? input.niche;
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

type GeoResult = {
  lat: number;
  lon: number;
  radius: number;
  displayName: string;
};

async function geocodeLocation(location: string): Promise<GeoResult | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("q", location);
  try {
    const res = await fetch(url.toString(), {
      headers: { accept: "application/json", "user-agent": USER_AGENT },
    });
    if (!res.ok) return null;
    const items = (await res.json()) as Array<{
      lat?: string;
      lon?: string;
      display_name?: string;
      place_rank?: number;
      type?: string;
      class?: string;
      boundingbox?: [string, string, string, string];
    }>;
    const first = items[0];
    if (!first?.lat || !first.lon) return null;

    let radius = 25000;
    const placeRank = first.place_rank ?? 18;
    const bb = first.boundingbox;

    if (bb && bb.length === 4) {
      const latSpan = Math.abs(Number(bb[1]) - Number(bb[0]));
      const lonSpan = Math.abs(Number(bb[3]) - Number(bb[2]));
      const maxSpan = Math.max(latSpan, lonSpan);
      if (maxSpan > 10) {
        radius = 500000;
      } else if (maxSpan > 3) {
        radius = 200000;
      } else if (maxSpan > 1) {
        radius = 80000;
      } else if (maxSpan > 0.3) {
        radius = 35000;
      } else {
        radius = 20000;
      }
    } else if (placeRank <= 8) {
      radius = 500000;
    } else if (placeRank <= 12) {
      radius = 150000;
    } else if (placeRank <= 16) {
      radius = 50000;
    }

    return {
      lat: Number(first.lat),
      lon: Number(first.lon),
      radius,
      displayName: first.display_name ?? location,
    };
  } catch {
    return null;
  }
}

async function searchOverpass(input: ScrapeInput): Promise<Lead[]> {
  const geo = await geocodeLocation(input.city);
  if (!geo) return [];
  const filters = overpassFilters(input.niche);
  const { lat, lon: lon_, radius } = geo;

  const timeout = radius > 200000 ? 45 : 30;
  let filterStr: string;
  if (filters.length > 0) {
    filterStr = filters
      .map((f) => `nwr${f}(around:${radius},${lat},${lon_});`)
      .join("\n  ");
  } else {
    filterStr = `nwr["name"]["amenity"](around:${radius},${lat},${lon_});
  nwr["name"]["shop"](around:${radius},${lat},${lon_});
  nwr["name"]["office"](around:${radius},${lat},${lon_});
  nwr["name"]["craft"](around:${radius},${lat},${lon_});`;
  }

  const query = `[out:json][timeout:${timeout}];
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
    const results = toLeads(payload.elements ?? [], input).slice(0, input.count);
    return results;
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
    error: `No results found for "${input.niche}" in "${input.city}". Try a different niche (e.g. "cafe", "restaurant", "shop") or check the spelling of your location.`,
    leads: [],
  });
});

export default router;
