import { Router } from "express";
import dns from "dns/promises";

const router = Router();

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "").replace(/^(the|a|an)/, "").slice(0, 20);
}

router.post("/domain", async (req, res) => {
  const { name, city } = req.body as { name: string; city?: string };
  if (!name) { res.status(400).json({ error: "name required" }); return; }

  const slug = slugify(name);
  const tlds = [".com", ".in", ".co", ".net", ".io", ".co.in"];
  const results: { domain: string; available: boolean | null; registrarUrl: string }[] = [];

  for (const tld of tlds) {
    const domain = `${slug}${tld}`;
    let available: boolean | null = null;
    try {
      await dns.resolve(domain);
      available = false; // resolves = taken
    } catch (e: any) {
      if (e.code === "ENOTFOUND" || e.code === "ENODATA") {
        available = true; // not found = likely available
      }
    }
    results.push({
      domain,
      available,
      registrarUrl: `https://www.namecheap.com/domains/registration/results/?domain=${domain}`,
    });
  }

  res.json({ slug, domains: results });
});

export default router;
