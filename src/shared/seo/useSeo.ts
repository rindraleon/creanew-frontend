import { useEffect } from "react";

const SITE_NAME = "MobilierShop";
const DEFAULT_TITLE = "MobilierShop — Mobilier design livré à Antananarivo";
const DEFAULT_DESCRIPTION =
  "Canapés, tables, lits et rangement sélectionnés par nos ateliers partenaires. " +
  "Paiement Mobile Money, livraison en 3 à 5 jours, retours sous 30 jours.";

export interface SeoOptions {
  /** Titre de la page (le nom du site est ajouté automatiquement). */
  title?: string;
  description?: string;
  /** Chemin de l'URL canonique, ex. « /boutique/canape-oslo ». */
  path?: string;
  /** Image de partage (1200×630 recommandé). */
  image?: string;
  /** Page à ne pas indexer (espaces privés, résultats de recherche). */
  noIndex?: boolean;
  /** Données structurées schema.org injectées dans la page. */
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

function upsertMeta(selector: string, attr: "name" | "property", key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Métadonnées de page pour une SPA : titre, description, canonique, Open Graph
 * et données structurées. Sans cela, toutes les URLs partagent le `<title>` de
 * `index.html` et les moteurs ne distinguent pas les pages.
 */
export function useSeo({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image = "/images/hero.jpg",
  noIndex = false,
  jsonLd,
}: SeoOptions = {}): void {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    const canonical = path ? `${window.location.origin}${path}` : window.location.href;

    document.title = fullTitle;
    upsertMeta('meta[name="description"]', "name", "description", description);
    upsertMeta('meta[name="robots"]', "name", "robots", noIndex ? "noindex, nofollow" : "index, follow");
    upsertLink("canonical", canonical);

    // Open Graph / Twitter
    upsertMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    upsertMeta('meta[property="og:url"]', "property", "og:url", canonical);
    upsertMeta('meta[property="og:image"]', "property", "og:image", image);
    upsertMeta('meta[property="og:type"]', "property", "og:type", "website");
    upsertMeta('meta[property="og:site_name"]', "property", "og:site_name", SITE_NAME);
    upsertMeta('meta[property="og:locale"]', "property", "og:locale", "fr_FR");
    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", image);

    // Données structurées
    document.head.querySelectorAll('script[data-seo="jsonld"]').forEach((n) => n.remove());
    if (jsonLd) {
      const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      blocks.forEach((block) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.dataset.seo = "jsonld";
        script.textContent = JSON.stringify(block);
        document.head.appendChild(script);
      });
    }
  }, [title, description, path, image, noIndex, jsonLd]);
}

export const SEO_DEFAULTS = { SITE_NAME, DEFAULT_TITLE, DEFAULT_DESCRIPTION };
