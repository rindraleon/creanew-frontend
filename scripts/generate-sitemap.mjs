#!/usr/bin/env node
/**
 * Génère `public/sitemap.xml` à partir des produits réellement publiés.
 *
 * Usage :
 *   node scripts/generate-sitemap.mjs [--api https://api.example] [--origin https://mobilier-shop.example]
 *
 * Le script est tolérant : si l'API est injoignable, il conserve le sitemap
 * statique existant plutôt que de le vider (un build ne doit jamais échouer
 * pour une raison de référencement).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const sitemapPath = join(here, "..", "public", "sitemap.xml");

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

const API = arg("api", process.env.VITE_API_URL ?? "http://localhost:3000/api");
const ORIGIN = arg("origin", process.env.SITE_ORIGIN ?? "https://mobilier-shop.example");

const STATIC_PAGES = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/boutique", changefreq: "daily", priority: "0.9" },
  { path: "/collections", changefreq: "weekly", priority: "0.7" },
  { path: "/blog", changefreq: "weekly", priority: "0.6" },
  { path: "/a-propos", changefreq: "monthly", priority: "0.5" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
  { path: "/livraison-retours", changefreq: "monthly", priority: "0.4" },
  { path: "/conditions-generales", changefreq: "yearly", priority: "0.3" },
  { path: "/confidentialite", changefreq: "yearly", priority: "0.3" },
];

const BLOG_SLUGS = [
  "choisir-canape-ideal",
  "entretenir-meubles-bois-massif",
  "tendances-decoration-2026",
  "petit-espace-grandes-idees",
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function fetchSlugs() {
  const slugs = [];
  for (let page = 1; page <= 20; page += 1) {
    const response = await fetch(`${API}/products?limit=100&page=${page}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = await response.json();
    const items = body.items ?? [];
    slugs.push(...items.filter((p) => p.status === "published").map((p) => p.slug));
    if (page >= (body.meta?.totalPages ?? 1)) break;
  }
  return slugs;
}

function render(entries) {
  const urls = entries
    .map(
      ({ path, changefreq, priority }) => `  <url>
    <loc>${escapeXml(ORIGIN + path)}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

const entries = [
  ...STATIC_PAGES,
  ...BLOG_SLUGS.map((slug) => ({ path: `/blog/${slug}`, changefreq: "monthly", priority: "0.4" })),
];

try {
  const productSlugs = await fetchSlugs();
  entries.push(
    ...productSlugs.map((slug) => ({ path: `/boutique/${slug}`, changefreq: "weekly", priority: "0.8" })),
  );
  console.log(`Sitemap : ${productSlugs.length} fiches produit incluses.`);
} catch (error) {
  console.warn(`API injoignable (${error.message}) — sitemap statique conservé.`);
}

writeFileSync(sitemapPath, render(entries), "utf8");
console.log(`Écrit : ${sitemapPath} (${entries.length} URLs).`);
