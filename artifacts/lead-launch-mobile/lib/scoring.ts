import type { Lead, AuditResult, RankedLead } from "./types";

const HIGH_FIT_NICHES = ["dentist", "salon", "clinic", "spa", "gym", "restaurant", "cafe", "lawyer", "doctor", "coaching"];

export function scoreLead(lead: Lead, audit: AuditResult): RankedLead {
  const noOrBadSite = !audit.hasWebsite ? 25 : audit.pageSpeedScore < 50 ? 20 : audit.pageSpeedScore < 70 ? 10 : 0;
  const reviews = lead.reviewsCount ?? 0;
  const reviewVolume = Math.min(20, Math.round(reviews / 5));
  const rating = (lead.rating ?? 0) >= 4 ? 15 : (lead.rating ?? 0) >= 3.5 ? 8 : 0;
  const recency = reviews > 20 ? 10 : reviews > 5 ? 5 : 0;
  const reachable = (lead.phone ? 5 : 0) + (lead.whatsapp ? 5 : 0) + (lead.email ? 5 : 0);
  const fit = HIGH_FIT_NICHES.some((n) => lead.category.toLowerCase().includes(n)) ? 15 : 8;
  const score = noOrBadSite + reviewVolume + rating + recency + reachable + fit;
  return {
    ...lead,
    audit,
    score: Math.min(100, score),
    scoreBreakdown: {
      noOrBadSite,
      reviewVolume,
      rating,
      recency,
      reachable,
      industryFit: fit,
    },
  };
}

export function scoreColor(score: number): string {
  if (score >= 70) return "#4a7c59";
  if (score >= 45) return "#b45309";
  return "#c0392b";
}

export function buildOutreach(
  lead: RankedLead,
  channel: OutreachChannel,
  lang: OutreachLanguage
): { first: string; followUp: string } {
  const name = lead.name;
  const gap = lead.audit.biggestGap;
  const reviews = lead.reviewsCount ?? 0;

  if (lang === "hinglish") {
    const first =
      channel === "whatsapp"
        ? `Namaste! Main aapke ${name} ke baare mein baat karna chahta tha.\n\nAapke ${reviews} reviews hain — kaafi achha! Lekin online search mein dikhai nahi dete, kyunki: ${gap}\n\nMainne ek quick website demo banaya hai — bilkul free. Dekhna chahenge?\n\nHaan ya nahi? 🙏`
        : channel === "email"
          ? `Subject: Aapke ${name} ke liye ek demo\n\nNamaste,\n\nMaine aapke business ko dekha — ${reviews} reviews, kaafi achha! Lekin: ${gap}\n\nEk modern website se ye sab fix ho sakta hai. Maine ek demo banaya hai — dekh sakte hain?\n\nBest,\n[Aapka naam]`
          : `Hi! Maine aapke ${name} ke liye ek website demo banaya hai. DM karein?`;
    const followUp = `Hi! Teen din pehle message kiya tha ${name} ke baare mein.\n\nAapke ${reviews} reviews bahut achhe hain — sirf ek modern website chahiye inhe convert karne ke liye.\n\nDemo abhi bhi available hai. 2 minute mein dikha sakta hoon. Interested?`;
    return { first, followUp };
  }

  const first =
    channel === "whatsapp"
      ? `Hi! I was looking at ${name} — ${reviews} reviews, great reputation!\n\nOne thing I noticed: ${gap}\n\nI've built a quick website demo for you — completely free to look at. Would you like to see it?\n\nYes or no works! 🙂`
      : channel === "email"
        ? `Hi,\n\nI came across ${name} and noticed: ${gap}\n\nI've put together a quick website demo that addresses this. Happy to share it — no strings attached.\n\nWould a 10-min call work this week?\n\nBest,\n[Your name]`
        : `Hi! I built a free website demo for ${name}. DM me if you'd like to see it!`;
  const followUp = `Hi again — following up on my message from a few days ago about ${name}.\n\n${reviews} reviews, solid reputation. Just one thing holding back new customers: ${gap}\n\nThe demo is still there if you'd like a look. Takes 2 minutes. Interested?`;
  return { first, followUp };
}

type OutreachChannel = "whatsapp" | "email" | "instagram";
type OutreachLanguage = "english" | "hinglish";
