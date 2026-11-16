import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BadgeEuro, TrendingUp, Banknote } from "lucide-react";
import { siteContentApi } from "../services/siteContent.api";
import Reveal from "./ui/Reveal";
import SectionHeading from "./ui/SectionHeading";

/** Contenu administré (clé `home_marketing` du site_content) — aucune valeur par défaut inventée. */
export interface MarketingCounter {
  value: number;
  suffix?: string;
  label: string;
}

export interface MarketingCurrencyRow {
  currency: string;
  featured?: boolean;
  tagline?: string;
  text?: string;
  rate?: string;
}

export interface MarketingContent {
  counters?: { enabled?: boolean; items?: MarketingCounter[] };
  currencyComparison?: {
    enabled?: boolean;
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    note?: string;
    updatedAt?: string;
    rows?: MarketingCurrencyRow[];
  };
}

export function useMarketingContent() {
  return useQuery({
    queryKey: ["site-content", "home_marketing"],
    queryFn: () => siteContentApi.byKey("home_marketing"),
    staleTime: 60_000,
    retry: 1,
  });
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function AnimatedNumber({ value, suffix }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState<number>(reduced ? value : 0);
  const started = useRef<boolean>(false);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return undefined;
    }
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || started.current) return;
        started.current = true;
        const duration = 1600;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          setDisplay(Math.round(value * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced, value]);

  return (
    <span ref={ref}>
      {display.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}

export function MarketingCounters() {
  const { data } = useMarketingContent();
  const counters = data?.value?.counters as MarketingContent["counters"] | undefined;
  const items = (counters?.items ?? []).filter(
    (item) => Number.isFinite(item.value) && item.label,
  );
  if (!counters?.enabled || items.length === 0) return null;

  return (
    <section aria-label="CreaNew en chiffres" className="bg-primary text-on-primary">
      <div className="container-app grid grid-cols-2 gap-y-10 py-12 text-center md:grid-cols-4">
        {items.map((item) => (
          <div key={item.label}>
            <p className="font-display text-display-sm text-secondary-fixed-dim md:text-display-md">
              <AnimatedNumber value={item.value} suffix={item.suffix} />
            </p>
            <p className="mt-1.5 text-label-md text-primary-fixed-dim">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CurrencyComparison() {
  const { data } = useMarketingContent();
  const section = data?.value?.currencyComparison as
    | MarketingContent["currencyComparison"]
    | undefined;
  const rows = (section?.rows ?? []).filter((row) => row.currency);
  const ordered = [...rows].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  if (!section?.enabled || ordered.length === 0) return null;

  return (
    <section aria-label="Paiement en devises" className="section bg-surface-container-low/60">
      <div className="container-app">
        <SectionHeading
          center
          eyebrow={section.eyebrow || "Paiement international"}
          title={section.title || "Nous acceptons les devises internationales"}
          subtitle={section.subtitle}
        />
        <div className="mx-auto mt-8 grid grid-cols-1 max-w-4xl gap-5 sm:grid-cols-2">
          {ordered.map((row) => {
            const featured = Boolean(row.featured);
            return (
              <Reveal key={row.currency}>
                <div
                  className={
                    featured
                      ? "relative flex h-full flex-col rounded-xl border-2 border-secondary bg-surface-container-lowest p-6 shadow-card-hover"
                      : "flex h-full flex-col rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-card"
                  }
                >
                  {featured && (
                    <span className="absolute -top-3 right-4 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-label-sm font-bold uppercase tracking-wider text-on-secondary">
                      <BadgeEuro size={13} aria-hidden="true" /> Devise phare
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                      {featured ? (
                        <BadgeEuro size={20} aria-hidden="true" />
                      ) : (
                        <Banknote size={20} aria-hidden="true" />
                      )}
                    </span>
                    <h3 className="font-display text-headline-md text-primary">{row.currency}</h3>
                  </div>
                  {row.rate && (
                    <p className="mt-4 inline-flex items-center gap-2 font-display text-headline-sm text-secondary">
                      <TrendingUp size={18} aria-hidden="true" /> {row.rate}
                    </p>
                  )}
                  {row.tagline && (
                    <p className="mt-2 text-label-md uppercase tracking-widest text-on-surface-variant">
                      {row.tagline}
                    </p>
                  )}
                  {row.text && (
                    <p className="mt-2 text-body-md text-on-surface-variant">{row.text}</p>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
        {(section.note || section.updatedAt) && (
          <p className="mx-auto mt-5 max-w-3xl text-center text-label-sm text-on-surface-variant">
            {section.note}
            {section.note && section.updatedAt ? " — " : ""}
            {section.updatedAt ? `Taux au ${section.updatedAt}` : ""}
          </p>
        )}
      </div>
    </section>
  );
}
