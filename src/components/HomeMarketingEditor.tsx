import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { siteContentApi } from "../services/siteContent.api";
import Button from "./ui/Button";
import { Field, Input, Textarea } from "./ui/Form";
import { useToast } from "../context/ToastContext";
import { errorMessage } from "../utils/errors";
import type { MarketingContent, MarketingCounter, MarketingCurrencyRow } from "./MarketingSections";

interface Props {
  initialValue: Record<string, unknown> | null;
  onSaved: () => void;
}

const inputCls =
  "h-11 w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-body-md outline-none focus:border-secondary focus:ring-2 focus:ring-ring/30";

/** Éditeur guidé de la clé `home_marketing` — aucune valeur n'est fabriquée : tout est saisi par l'admin. */
export default function HomeMarketingEditor({ initialValue, onSaved }: Props) {
  const { toast } = useToast();
  const source = (initialValue ?? {}) as MarketingContent;

  const [countersEnabled, setCountersEnabled] = useState<boolean>(
    Boolean(source.counters?.enabled),
  );
  const [counterItems, setCounterItems] = useState<MarketingCounter[]>(
    source.counters?.items ?? [],
  );

  const [currencyEnabled, setCurrencyEnabled] = useState<boolean>(
    Boolean(source.currencyComparison?.enabled),
  );
  const [eyebrow, setEyebrow] = useState<string>(source.currencyComparison?.eyebrow ?? "");
  const [title, setTitle] = useState<string>(source.currencyComparison?.title ?? "");
  const [subtitle, setSubtitle] = useState<string>(source.currencyComparison?.subtitle ?? "");
  const [note, setNote] = useState<string>(source.currencyComparison?.note ?? "");
  const [updatedAt, setUpdatedAt] = useState<string>(source.currencyComparison?.updatedAt ?? "");
  const [rows, setRows] = useState<MarketingCurrencyRow[]>(() => {
    const base: MarketingCurrencyRow[] = source.currencyComparison?.rows ?? [];
    const euro = base.find((r) => r.currency.toUpperCase() === "EURO") ?? {
      currency: "EURO",
      featured: true,
    };
    const usd = base.find((r) => r.currency.toUpperCase() === "USD") ?? { currency: "USD" };
    return [euro, usd];
  });
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    // Si la valeur initiale arrive après le premier rendu, on (re)synchronise.
    if (initialValue) {
      const s = initialValue as MarketingContent;
      setCountersEnabled(Boolean(s.counters?.enabled));
      setCounterItems(s.counters?.items ?? []);
      setCurrencyEnabled(Boolean(s.currencyComparison?.enabled));
      setEyebrow(s.currencyComparison?.eyebrow ?? "");
      setTitle(s.currencyComparison?.title ?? "");
      setSubtitle(s.currencyComparison?.subtitle ?? "");
      setNote(s.currencyComparison?.note ?? "");
      setUpdatedAt(s.currencyComparison?.updatedAt ?? "");
      const base: MarketingCurrencyRow[] = s.currencyComparison?.rows ?? [];
      const euro = base.find((r) => r.currency.toUpperCase() === "EURO") ?? {
        currency: "EURO",
        featured: true,
      };
      const usd = base.find((r) => r.currency.toUpperCase() === "USD") ?? { currency: "USD" };
      setRows([euro, usd]);
    }
  }, [initialValue]);

  const updateCounter = (index: number, patch: Partial<MarketingCounter>): void => {
    setCounterItems((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };
  const updateRow = (index: number, patch: Partial<MarketingCurrencyRow>): void => {
    setRows((current) => {
      const next = current.map((row, i) => (i === index ? { ...row, ...patch } : row));
      // Une seule devise « phare » à la fois — EURO par défaut (D2).
      if (patch.featured) {
        return next.map((row, i) => (i === index ? row : { ...row, featured: false }));
      }
      return next;
    });
  };

  const save = async (): Promise<void> => {
    for (const item of counterItems) {
      if (!item.label.trim()) return toast("Chaque compteur doit avoir un libellé.", "error");
      if (!Number.isFinite(item.value) || item.value < 0)
        return toast("Chaque compteur doit avoir une valeur numérique positive.", "error");
    }
    const cleanRows = rows
      .map((row) => ({ ...row, currency: row.currency.trim().toUpperCase() }))
      .filter((row) => row.currency);
    const value: MarketingContent = {
      counters: {
        enabled: countersEnabled,
        items: counterItems.map((item) => ({ ...item, label: item.label.trim() })),
      },
      currencyComparison: {
        enabled: currencyEnabled,
        eyebrow: eyebrow.trim() || undefined,
        title: title.trim() || undefined,
        subtitle: subtitle.trim() || undefined,
        note: note.trim() || undefined,
        updatedAt: updatedAt.trim() || undefined,
        rows: cleanRows,
      },
    };
    setSaving(true);
    try {
      await siteContentApi.upsert("home_marketing", {
        value: value as unknown as Record<string, unknown>,
        description: "Compteurs animés + sections devises (EURO/USD) de la page d'accueil",
      });
      toast("home_marketing enregistré. La page d'accueil reflète vos valeurs.");
      onSaved();
    } catch (e) {
      toast(errorMessage(e, "Enregistrement impossible."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card mt-6 border-secondary/30 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-headline-sm text-primary">
            home_marketing — sections de la page d'accueil
          </h3>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Compteurs animés et comparatif EURO / USD. Renseignez uniquement des données réelles —
            laisser les sections désactivées tant qu'elles ne sont pas renseignées les masque du
            site.
          </p>
        </div>
      </div>

      {/* ---- Compteurs ---- */}
      <div className="mt-6">
        <label className="flex items-center gap-2 text-label-lg font-semibold text-on-surface">
          <input
            type="checkbox"
            className="h-4 w-4 accent-secondary"
            checked={countersEnabled}
            onChange={(e) => setCountersEnabled(e.target.checked)}
          />
          Activer les compteurs animés
        </label>
        <div className="mt-3 space-y-2">
          {counterItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-outline-variant/40 p-2"
            >
              <input
                type="number"
                min={0}
                aria-label="Valeur"
                placeholder="Valeur"
                value={Number.isFinite(item.value) ? item.value : ""}
                onChange={(e) => updateCounter(index, { value: Number(e.target.value) })}
                className={`${inputCls} w-32`}
              />
              <input
                type="text"
                aria-label="Suffixe"
                placeholder="Suffix (ex : +, ans…)"
                value={item.suffix ?? ""}
                onChange={(e) => updateCounter(index, { suffix: e.target.value })}
                className={`${inputCls} w-36`}
              />
              <input
                type="text"
                aria-label="Libellé"
                placeholder="Libellé (ex : canapés livrés)"
                value={item.label}
                onChange={(e) => updateCounter(index, { label: e.target.value })}
                className={`${inputCls} min-w-48 flex-1`}
              />
              <button
                type="button"
                onClick={() => setCounterItems((items) => items.filter((_, i) => i !== index))}
                aria-label="Retirer ce compteur"
                className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => setCounterItems((items) => [...items, { value: 0, label: "" }])}
        >
          <Plus size={15} /> Ajouter un compteur
        </Button>
      </div>

      {/* ---- Devises EURO / USD ---- */}
      <div className="mt-8 border-t border-outline-variant/30 pt-6">
        <label className="flex items-center gap-2 text-label-lg font-semibold text-on-surface">
          <input
            type="checkbox"
            className="h-4 w-4 accent-secondary"
            checked={currencyEnabled}
            onChange={(e) => setCurrencyEnabled(e.target.checked)}
          />
          Activer la section « EURO / USD » (EURO mise en avant)
        </label>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Surtitre (eyebrow)">
            <Input value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} placeholder="Paiement international" />
          </Field>
          <Field label="Titre">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Paiement en devises internationales" />
          </Field>
        </div>
        <Field label="Sous-titre" className="mt-4">
          <Textarea rows={2} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </Field>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {rows.map((row, index) => (
            <fieldset
              key={row.currency}
              className={`rounded-xl border p-4 ${row.featured ? "border-secondary bg-secondary-container/20" : "border-outline-variant/50"}`}
            >
              <legend className="px-1 text-label-md font-bold uppercase tracking-wider text-primary">
                {row.currency}
                {row.featured ? " — mise en avant" : ""}
              </legend>
              <label className="mt-2 flex items-center gap-2 text-label-md font-medium text-on-surface-variant">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-secondary"
                  checked={Boolean(row.featured)}
                  onChange={(e) => updateRow(index, { featured: e.target.checked })}
                />
                Devise phare
              </label>
              <Field label="Taux affiché (libre)" className="mt-2">
                <Input
                  value={row.rate ?? ""}
                  onChange={(e) => updateRow(index, { rate: e.target.value })}
                  placeholder="1 € ≈ 4 850 Ar (exemple indicatif)"
                />
              </Field>
              <Field label="Tagline" className="mt-2">
                <Input
                  value={row.tagline ?? ""}
                  onChange={(e) => updateRow(index, { tagline: e.target.value })}
                  placeholder="Ex : Paiement en euros"
                />
              </Field>
              <Field label="Texte" className="mt-2">
                <Textarea
                  rows={3}
                  value={row.text ?? ""}
                  onChange={(e) => updateRow(index, { text: e.target.value })}
                />
              </Field>
            </fieldset>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Note (petit texte)">
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Taux indicatifs, confirmés à la commande"
            />
          </Field>
          <Field label="Date d'actualisation">
            <Input
              type="date"
              value={updatedAt}
              onChange={(e) => setUpdatedAt(e.target.value)}
            />
          </Field>
        </div>
      </div>

      <Button className="mt-6" onClick={() => void save()} disabled={saving}>
        {saving ? "Enregistrement…" : "Enregistrer home_marketing"}
      </Button>
    </div>
  );
}
