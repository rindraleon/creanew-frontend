import { Link } from "react-router-dom";
import { Hammer, HeartHandshake, Leaf, ShoppingBag } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Breadcrumbs from "../../../components/ui/Breadcrumbs";
import SectionHeading from "../../../components/ui/SectionHeading";
import Reveal from "../../../components/ui/Reveal";
import Button from "../../../components/ui/Button";

interface Value {
  icon: LucideIcon;
  title: string;
  text: string;
}

const values: Value[] = [
  {
    icon: Hammer,
    title: "Savoir-faire",
    text: "Découvrez notre univers dédié au canapé d’angle.",
  },
  {
    icon: Leaf,
    title: "Durabilité",
    text: "Consultez les caractéristiques de chaque modèle dans la boutique.",
  },
  {
    icon: HeartHandshake,
    title: "Qualité durable",
    text: "Notre équipe est à votre disposition pour répondre à vos questions.",
  },
];

export default function About() {
  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "À propos" }]} />

      <div className="mt-4 grid items-center gap-10 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary-container/40 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            <span className="text-label-sm font-semibold uppercase tracking-widest text-secondary">
              CreaNew — Canapés d'Angle
            </span>
          </div>
          <h1 className="mt-4 font-display text-display-md text-primary">
            L'art du canapé d'angle
          </h1>
          <p className="mt-5 text-body-lg text-on-surface-variant">
            CreaNew est née d'un constat simple : trop de salons malgaches manquent d'un canapé à la
            fois enveloppant, élégant et vraiment confortable. Nous avons choisi de ne faire qu'une
            chose — mais de la faire parfaitement : le canapé d'angle.
          </p>
          <p className="mt-4 text-body-lg text-on-surface-variant">
            Notre univers se résume en trois mots :{" "}
            <span className="font-semibold text-primary">
              confort absolu, design moderne, qualité durable.
            </span>
          </p>
          <div className="mt-6 flex items-center gap-3">
            <img
              src="/logo-creanew.jpg"
              alt="CreaNew"
              className="h-10 w-10 rounded-full object-cover"
            />
            <p className="text-label-md font-semibold text-primary">
              Donnez une nouvelle vie à votre salon
            </p>
          </div>
        </div>
        <Reveal delay={0.15}>
          <div className="overflow-hidden rounded-xl shadow-card-hover ring-1 ring-outline-variant/20">
            <img
              src="/images/atelier.jpg"
              alt="Illustration d’un atelier de mobilier"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </Reveal>
      </div>

      <div className="section">
        <SectionHeading
          center
          eyebrow="Nos engagements"
          title="Ce qui nous anime"
          subtitle="Trois principes hérités du logo CreaNew — et tenus chaque jour."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {values.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.1}>
              <div className="card h-full p-7">
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
                  <Icon size={22} />
                </span>
                <h3 className="font-display text-headline-sm text-primary">{title}</h3>
                <p className="mt-3 text-body-md text-on-surface-variant">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal>
        <div className="rounded-xl bg-secondary-container/40 p-8 text-center md:p-12">
          <h2 className="font-display text-headline-lg text-primary">
            Prêt à donner une nouvelle vie à votre salon ?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-body-lg text-on-surface-variant">
            Découvrez nos collections de canapés d'angle et trouvez la pièce qui manquait à votre
            intérieur.
          </p>
          <Button as={Link} to="/boutique" variant="accent" size="lg" className="mt-7">
            <ShoppingBag size={18} /> Découvrir les canapés
          </Button>
        </div>
      </Reveal>
    </div>
  );
}
