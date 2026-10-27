import { type ReactNode } from "react";
import Breadcrumbs from "../../../components/ui/Breadcrumbs";
import Reveal from "../../../components/ui/Reveal";
import { useSeo } from "../../../shared/seo/useSeo";

export interface ContentSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
}

interface StaticContentPageProps {
  title: string;
  intro: string;
  updatedAt: string;
  /** Chemin canonique, utilisé tel quel par `useSeo`. */
  path: string;
  sections: ContentSection[];
  /** Contenu additionnel rendu après les sections. */
  children?: ReactNode;
}

/**
 * Gabarit des pages de contenu (livraison, CGV, confidentialité) : même
 * typographie, même fil d'Ariane, même balisage SEO que le reste du site.
 */
export default function StaticContentPage({
  title,
  intro,
  updatedAt,
  path,
  sections,
  children,
}: StaticContentPageProps) {
  useSeo({
    title,
    description: intro,
    path,
  });

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: title }]} />

      <article className="mx-auto mt-6 max-w-3xl">
        <h1 className="font-display text-display-md text-primary">{title}</h1>
        <p className="mt-3 text-body-lg text-on-surface-variant">{intro}</p>
        <p className="mt-2 text-label-sm text-on-surface-variant">
          Dernière mise à jour : {updatedAt}
        </p>

        <div className="mt-9 space-y-8">
          {sections.map((section, index) => (
            <Reveal key={section.heading} delay={index * 0.04}>
              <section>
                <h2 className="font-display text-display-xs text-primary">{section.heading}</h2>
                {section.paragraphs?.map((paragraph, i) => (
                  <p key={i} className="mt-3 text-body-md leading-relaxed text-on-surface-variant">
                    {paragraph}
                  </p>
                ))}
                {section.list && (
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-body-md text-on-surface-variant">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            </Reveal>
          ))}
        </div>

        {children}
      </article>
    </div>
  );
}
