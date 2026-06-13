import { Router } from "express";
import OpenAI from "openai";

const router = Router();

function getOpenAI(): OpenAI {
  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Add it in the Secrets tab to enable LeadBot.");
  }
  return new OpenAI({ apiKey });
}

const SYSTEM_PROMPT = `You are LeadBot, an expert AI assistant embedded inside Lead → Launch — a lead generation tool for web developers and freelancers.

Your purpose is to help web professionals find, evaluate, and pitch local businesses that need a website.

You know the full pipeline:
1. Scrape — search OpenStreetMap (190+ countries, free) or Google Maps (via Apify) for real businesses by niche + city
2. Audit — check each business's web presence: PageSpeed score, mobile-friendliness, HTTPS, schema markup, load time, estimated lost revenue
3. Rank — score each lead 0–100 based on: no/bad website (40pts), review volume (20pts), rating (15pts), reachability (10pts), industry fit (10pts), recency (5pts)
4. Build — generate AI website prompts for Lovable, Bolt.new, Claude Code, or OpenAI Codex
5. Outreach — draft personalized WhatsApp, email, and Instagram messages in English or Hinglish

You can help with:
- Suggesting profitable niches and cities to search (dentists, law firms, restaurants, salons, gyms, clinics, etc.)
- Interpreting lead scores and audit results
- Improving outreach messages to increase reply rates
- Estimating project values and pricing
- Explaining why a lead is or isn't a good prospect
- Suggesting follow-up strategies after outreach
- Advising on niches with high website ROI

If the user shares lead data (name, score, audit results), use it to give specific, actionable advice.

Keep responses concise, practical, and direct — this is a business tool, not a conversation. Use bullet points for lists. Avoid fluff.`;

router.post("/", async (req, res) => {
  const { messages, context } = req.body as {
    messages: { role: "user" | "assistant"; content: string }[];
    context?: {
      currentPhase?: number;
      leadsCount?: number;
      selectedLead?: {
        name: string;
        city: string;
        category: string;
        score?: number;
        hasWebsite?: boolean;
        pageSpeedScore?: number;
        rating?: number;
        reviewsCount?: number;
        biggestGap?: string;
        estLostRevenuePerMonth?: number;
      };
    };
  };

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  // Build context injection for system prompt
  let contextNote = "";
  if (context?.currentPhase) {
    contextNote += `\nUser is currently on Phase ${context.currentPhase} of the pipeline.`;
  }
  if (context?.leadsCount) {
    contextNote += ` They have ${context.leadsCount} leads loaded.`;
  }
  if (context?.selectedLead) {
    const l = context.selectedLead;
    contextNote += `\n\nCurrently selected lead:\n- Name: ${l.name}\n- City: ${l.city}\n- Category: ${l.category}`;
    if (l.score !== undefined) contextNote += `\n- Score: ${l.score}/100`;
    if (l.hasWebsite !== undefined) contextNote += `\n- Has website: ${l.hasWebsite}`;
    if (l.pageSpeedScore !== undefined) contextNote += `\n- PageSpeed: ${l.pageSpeedScore}/100`;
    if (l.rating !== undefined) contextNote += `\n- Rating: ${l.rating}★`;
    if (l.reviewsCount !== undefined) contextNote += `\n- Reviews: ${l.reviewsCount}`;
    if (l.biggestGap) contextNote += `\n- Biggest gap: ${l.biggestGap}`;
    if (l.estLostRevenuePerMonth) contextNote += `\n- Est. lost revenue: ₹${l.estLostRevenuePerMonth.toLocaleString()}/month`;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 1024,
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT + contextNote },
        ...messages,
      ],
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI request failed";
    res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
    res.end();
  }
});

export default router;
