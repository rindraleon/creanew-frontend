import { Check } from "lucide-react";
import type { ReactNode } from "react";

export interface WizardStep {
  id: string;
  title: string;
  hint?: string;
}

interface WizardProps {
  steps: WizardStep[];
  /** Étape courante, index 0-based. */
  current: number;
  /** Plus haut index visitable (les étapes antérieures sont cliquables). */
  maxVisited: number;
  onGoTo: (index: number) => void;
  /** Contenu de l'étape courante. */
  children: ReactNode;
  ariaLabel?: string;
}

/**
 * En-tête de progression pour les formulaires multi-étapes.
 * Accessible : navigation clavier sur les étapes déjà visitées, aria-current="step".
 */
export default function Wizard({ steps, current, maxVisited, onGoTo, children, ariaLabel }: WizardProps) {
  return (
    <div>
      <ol
        className="flex flex-wrap items-center gap-2 sm:gap-3"
        aria-label={ariaLabel ?? "Étapes du formulaire"}
      >
        {steps.map((step, i) => {
          const state = i < current ? "done" : i === current ? "active" : i <= maxVisited ? "todo" : "locked";
          const clickable = i <= maxVisited && i !== current;
          return (
            <li key={step.id} className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onGoTo(i)}
                aria-current={i === current ? "step" : undefined}
                aria-label={`Étape ${i + 1} sur ${steps.length} : ${step.title}`}
                className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-label-md transition-colors ${
                  state === "active"
                    ? "bg-secondary text-on-secondary"
                    : state === "done"
                      ? "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80"
                      : clickable
                        ? "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                        : "bg-surface-container text-on-surface-variant/60"
                } ${clickable ? "cursor-pointer" : "cursor-default"}`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                    state === "active" ? "bg-white/25" : state === "done" ? "bg-secondary/20" : "bg-surface-container-lowest"
                  }`}
                >
                  {state === "done" ? <Check size={13} /> : i + 1}
                </span>
                <span className="hidden sm:inline">{step.title}</span>
              </button>
              {i < steps.length - 1 && <span className="h-px w-4 bg-outline-variant sm:w-8" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-6">{children}</div>
    </div>
  );
}
