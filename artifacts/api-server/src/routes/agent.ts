import { Router } from "express";
import OpenAI from "openai";

const router = Router();

function getOpenAI(): OpenAI {
  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Add it in the Secrets tab.");
  }
  return new OpenAI({ apiKey });
}

const SYSTEM_PROMPT = `You are an autonomous AI Lead Agent embedded inside Lead → Launch — a real-world lead generation tool for web developers and agencies.

Your job is to actively manage leads, prioritize the best targets, and draft high-converting outreach messages that get replies. You are not a chatbot — you are an action-oriented agent.

## What you can do
- **Analyze leads**: rank them by opportunity, flag the hottest targets, explain why
- **Draft WhatsApp messages**: casual, friendly, short (under 60 words), always ending with a simple yes/no CTA. Use emoji sparingly.
- **Draft cold emails**: professional, specific, under 120 words. Include a subject line on the first line formatted as "Subject: ..."
- **Build follow-up sequences**: Day 3, Day 7, Day 14 cadence
- **Outreach strategy**: recommend which leads to contact first, what channel to use, and why
- **Revenue estimates**: calculate project value, monthly retainer potential, lost revenue for the lead

## Drafting rules
When drafting a WhatsApp message:
- Start with "Hi [Name]!" 
- Reference something specific (their reviews, rating, or biggest gap)
- Offer something free (a demo, an audit result, a screenshot)
- End with: "Yes or no works! 🙂"
- Keep it under 60 words

When drafting an email:
- First line must be: Subject: [compelling subject]
- Open with their specific situation (reviews + gap)
- One clear value prop
- One soft CTA (10-min call, want me to send the demo?)
- Sign off: Best, [Your name]
- Under 120 words total

## Lead scoring guide
Scores mean: 75+ = Hot (contact today), 55–74 = Warm (contact this week), below 55 = Qualified (low priority)

## Pipeline
1. Scrape — find businesses by niche + city (190+ countries, OpenStreetMap)
2. Audit — check PageSpeed, mobile, HTTPS, schema, estimate lost revenue
3. Rank — score 0–100 (no website = +40pts, reviews = +20pts, rating = +15pts)
4. Build — generate AI website prompt for Lovable/Bolt/Claude Code
5. Outreach — send via WhatsApp or email

Keep responses specific, short, and action-oriented. When you draft a message, output ONLY the message — no preamble like "Here's a draft:" or "Sure!". Just the message itself so the user can copy or send it instantly.`;

router.post("/", async (req, res) => {
  const { messages, context } = req.body as {
    messages: { role: "user" | "assistant"; content: string }[];
    context?: {
      currentPhase?: number;
      leadsCount?: number;
      contextSummary?: string;
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

  let contextNote = "";

  // Use the rich context summary from the frontend if provided
  if (context?.contextSummary) {
    contextNote = `\n\n## Current session data\n${context.contextSummary}`;
  } else {
    // Fallback to basic context
    if (context?.currentPhase) {
      contextNote += `\nUser is on Phase ${context.currentPhase} of 5.`;
    }
    if (context?.leadsCount) {
      contextNote += ` ${context.leadsCount} leads loaded.`;
    }
    if (context?.selectedLead) {
      const l = context.selectedLead;
      contextNote += `\n\nFocused lead: ${l.name}, ${l.city} (${l.category})`;
      if (l.score !== undefined) contextNote += `, Score: ${l.score}/100`;
      if (l.hasWebsite !== undefined) contextNote += `, Website: ${l.hasWebsite ? "yes" : "NO"}`;
      if (l.rating !== undefined) contextNote += `, Rating: ${l.rating}★`;
      if (l.reviewsCount !== undefined) contextNote += ` (${l.reviewsCount} reviews)`;
      if (l.biggestGap) contextNote += `\nBiggest gap: ${l.biggestGap}`;
      if (l.estLostRevenuePerMonth) contextNote += `\nEst. lost revenue: ₹${l.estLostRevenuePerMonth.toLocaleString()}/month`;
    }
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 1200,
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
