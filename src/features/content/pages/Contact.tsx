import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Clock, Mail, MapPin, Phone, Send, Loader2, MessageCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useToast } from "../../../shared/context/ToastContext";
import { useAuth } from "../../auth/context/AuthProvider";
import { contactApi } from "../../contact/api/contact.api";
import { siteContentApi } from "../../../shared/api/siteContent.api";
import { useQuery } from "@tanstack/react-query";
import Breadcrumbs from "../../../components/ui/Breadcrumbs";
import Button from "../../../components/ui/Button";
import { Field, Input, Select, Textarea } from "../../../components/ui/Form";
import Reveal from "../../../components/ui/Reveal";
import { errorMessage } from "../../../shared/utils/errors";
import { emailSchema } from "../../auth/schemas/auth";
import { ApiError } from "../../../shared/api/client";
import { Link } from "react-router-dom";

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState<ContactForm>({
    name: user?.fullName ?? "",
    email: user?.email ?? "",
    subject: "Question produit",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [sending, setSending] = useState(false);

  // Contact info administrable
  const { data: contactSetting } = useQuery({
    queryKey: ["site-content", "contact_info"],
    queryFn: () => siteContentApi.byKey("contact_info"),
  });
  const contactVal = contactSetting?.value ?? {};
  const stringList = (value: unknown, fallback: string[]): string[] =>
    typeof value === "string"
      ? [value]
      : Array.isArray(value) && value.every((item: unknown) => typeof item === "string")
        ? value
        : fallback;
  const infoShowroom = stringList(contactVal.showroom, []);
  const infoPhone = stringList(contactVal.phone, []);
  const infoEmail = stringList(contactVal.email, []);
  const infoHours = stringList(contactVal.hours, []);

  const contactInfo: { icon: LucideIcon; title: string; lines: string[] }[] = [
    { icon: MapPin, title: "Showroom", lines: infoShowroom },
    { icon: Phone, title: "Téléphone", lines: infoPhone },
    { icon: Mail, title: "Email", lines: infoEmail },
    { icon: Clock, title: "Horaires", lines: infoHours },
  ];

  const set =
    (key: keyof ContactForm) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs: Partial<Record<keyof ContactForm, string>> = {};
    if (!form.name.trim()) errs.name = "Votre nom est requis.";
    const emailResult = emailSchema.safeParse(form.email);
    if (!emailResult.success)
      errs.email = emailResult.error.issues[0]?.message ?? "Adresse e-mail invalide.";
    if (form.message.trim().length < 10)
      errs.message = "Votre message doit contenir au moins 10 caractères.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSending(true);
    try {
      await contactApi.send({ ...form, email: emailSchema.parse(form.email) });
      setForm({ name: "", email: "", subject: "Question produit", message: "" });
      toast("Merci ! Votre message a bien été enregistré. Nous vous répondrons dès que possible.");
    } catch (err) {
      if (err instanceof ApiError && err.fieldError("email"))
        setErrors((current) => ({ ...current, email: err.fieldError("email") }));
      else toast(errorMessage(err), "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Contact" }]} />

      <div className="mt-4 max-w-2xl">
        <h1 className="font-display text-display-md text-primary">Contactez CreaNew</h1>
        <p className="mt-3 text-body-lg text-on-surface-variant">
          Une question sur nos canapés d'angle, une commande ou un projet d'aménagement ? Notre
          équipe est à votre disposition.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/messages"
          className="inline-flex items-center gap-2 rounded-lg border border-secondary bg-secondary-container/30 px-4 py-2.5 text-label-md text-secondary transition-colors hover:bg-secondary hover:text-on-secondary"
        >
          <MessageCircle size={16} /> Ouvrir la messagerie CreaNew
        </Link>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <form
            onSubmit={(event) => void submit(event)}
            className="card space-y-5 p-6 md:p-8"
            noValidate
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nom complet" required error={errors.name}>
                <Input value={form.name} onChange={set("name")} placeholder="Rindra Léon" />
              </Field>
              <Field label="Email" required error={errors.email}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="rindra@exemple.mg"
                />
              </Field>
            </div>
            <Field label="Sujet">
              <Select value={form.subject} onChange={set("subject")}>
                <option>Question produit</option>
                <option>Suivi de commande</option>
                <option>Retour / échange</option>
                <option>Projet d'aménagement</option>
                <option>Partenariat</option>
                <option>Autre</option>
              </Select>
            </Field>
            <Field label="Message" required error={errors.message}>
              <Textarea
                value={form.message}
                onChange={set("message")}
                placeholder="Décrivez votre demande en quelques lignes…"
                rows={6}
              />
            </Field>
            {/* Honeypot invisible anti-spam */}
            <input type="text" name="website" autoComplete="off" tabIndex={-1} className="hidden" />
            <div className="flex justify-end">
              <Button type="submit" variant="accent" size="lg" disabled={sending}>
                {sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                {sending ? "Envoi…" : "Envoyer le message"}
              </Button>
            </div>
            <p className="text-center text-label-sm text-on-surface-variant">
              Vos données ne servent qu'à traiter votre demande. Vous recevrez un e-mail de
              confirmation.
            </p>
          </form>
        </Reveal>

        <div className="space-y-4">
          {contactInfo.every(({ lines }) => lines.length === 0) && (
            <p>Coordonnées non renseignées. Utilisez le formulaire pour nous écrire.</p>
          )}
          {contactInfo
            .filter(({ lines }) => lines.length > 0)
            .map(({ icon: Icon, title, lines }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <div className="card flex items-start gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
                    <Icon size={20} />
                  </span>
                  <div>
                    <h3 className="text-label-lg text-primary">{title}</h3>
                    {lines.map((line) => (
                      <p key={line} className="text-body-sm text-on-surface-variant">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
        </div>
      </div>
    </div>
  );
}
