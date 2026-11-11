import { Link } from "react-router-dom";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { siteContentApi } from "../../shared/api/siteContent.api";

interface NavLink {
  label: string;
  to: string;
}

const navLinks: NavLink[] = [
  { label: "Accueil", to: "/" },
  { label: "Boutique", to: "/boutique" },
  { label: "Collections", to: "/collections" },
  { label: "À propos", to: "/a-propos" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

const LINK_CLASS =
  "text-primary-fixed-dim transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:text-white";

export default function Footer() {
  const year = new Date().getFullYear();
  const { data } = useQuery({
    queryKey: ["site-content", "contact_info"],
    queryFn: () => siteContentApi.byKey("contact_info"),
  });
  const values = data?.value ?? {};
  const first = (value: unknown): string => {
    if (typeof value === "string") return value.trim();
    return Array.isArray(value) && typeof value[0] === "string" ? value[0].trim() : "";
  };
  const contact = {
    email: first(values.email),
    phone: first(values.phone),
    address: first(values.showroom),
  };

  return (
    <footer className="relative isolate overflow-hidden bg-primary text-on-primary">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span className="select-none whitespace-nowrap text-[6rem] font-black leading-none tracking-[-0.08em] text-white/[0.04] sm:text-[9rem] lg:text-[12rem]">
          CreaNew
        </span>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/2 size-72 -translate-y-1/2 rounded-full bg-secondary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/2 size-72 -translate-y-1/2 rounded-full bg-secondary/10 blur-3xl"
      />

      <div className="container-app relative py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white p-1 transition-transform duration-200 hover:scale-[1.04]"
              aria-label="Accueil CreaNew"
            >
              <img
                src="/logo-creanew.jpg"
                alt="CreaNew — Canapés d'angle"
                loading="lazy"
                decoding="async"
                className="h-full w-full rounded-full object-cover"
                width={36}
                height={36}
              />
            </Link>
            <div className="min-w-0">
              <p className="font-display text-body font-bold leading-tight tracking-tight text-white">
                Crea<span className="text-secondary">New</span>
              </p>
              <p className="text-caption leading-5 text-primary-fixed-dim">
                Canapés d&apos;angle — Donnez une nouvelle vie à votre salon
              </p>
            </div>
          </div>

          <nav aria-label="Navigation du pied de page" className="lg:pt-1">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-body-sm">
              {navLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={LINK_CLASS}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2 lg:pt-0.5">
            <Link
              to="/contact"
              className="group ml-1 inline-flex h-9 items-center gap-1.5 rounded-lg border border-secondary/30 bg-secondary/15 px-3 text-label-sm font-semibold text-secondary-fixed-dim transition-colors duration-200 hover:border-secondary/40 hover:bg-secondary/20 hover:text-secondary"
            >
              Nous contacter
              <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <ul className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-body-sm text-primary-fixed-dim">
          {contact.address && (
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-secondary/80" strokeWidth={1.8} />
              <span className="leading-5">{contact.address}</span>
            </li>
          )}
          {contact.phone && (
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-secondary/80" strokeWidth={1.8} />
              <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className={LINK_CLASS}>
                {contact.phone}
              </a>
            </li>
          )}
          {contact.email && (
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-secondary/80" strokeWidth={1.8} />
              <a href={`mailto:${contact.email}`} className={`${LINK_CLASS} break-all`}>
                {contact.email}
              </a>
            </li>
          )}
        </ul>

        <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-4 text-caption text-primary-fixed-dim/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} CreaNew — Canapés d&apos;angle. Tous droits réservés.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link to="/livraison-retours" className={LINK_CLASS}>
              Livraison & retours
            </Link>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/20" />
            <Link to="/conditions-generales" className={LINK_CLASS}>
              Mentions légales
            </Link>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/20" />
            <Link to="/confidentialite" className={LINK_CLASS}>
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-secondary py-2 text-center">
        <p className="text-label-sm font-semibold uppercase tracking-widest text-on-secondary">
          Donnez une nouvelle vie à votre salon
        </p>
      </div>
    </footer>
  );
}
