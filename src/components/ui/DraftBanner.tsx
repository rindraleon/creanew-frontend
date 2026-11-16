import { History, Trash2 } from "lucide-react";
import { formatDate } from "../../utils/format";

interface DraftBannerProps {
  savedAt: string | null;
  onRestore: () => void;
  onDiscard: () => void;
}

/** Bandeau « Reprendre la saisie » affiché quand un brouillon local existe. */
export default function DraftBanner({ savedAt, onRestore, onDiscard }: DraftBannerProps) {
  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-lg border border-secondary/40 bg-secondary-container/40 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex items-start gap-2 text-body-sm text-on-secondary-container">
        <History size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          <span className="font-semibold">Brouillon trouvé</span>
          {savedAt ? ` (enregistré le ${formatDate(savedAt)})` : ""}. Reprendre votre saisie là où elle
          s'était arrêtée ?
        </span>
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onRestore}
          className="rounded-md bg-secondary px-4 py-2 text-label-md font-semibold text-on-secondary transition-colors hover:bg-primary"
        >
          Reprendre la saisie
        </button>
        <button
          type="button"
          onClick={onDiscard}
          aria-label="Supprimer le brouillon"
          className="rounded-md border border-outline-variant p-2 text-on-surface-variant transition-colors hover:border-red-300 hover:text-red-600"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
