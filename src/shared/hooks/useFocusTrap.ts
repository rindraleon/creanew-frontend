import { useEffect, useRef } from "react";
import type { RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/**
 * Piège à focus + fermeture par Échap pour les dialogues (modales, tiroirs,
 * overlays). Sans lui, un utilisateur au clavier peut « sortir » de la modale
 * et se retrouver sur la page derrière — critère WCAG 2.1 (2.1.2 / 2.4.3).
 *
 * @param active  le dialogue est-il ouvert ?
 * @param onClose appelé lorsque l'utilisateur presse Échap
 */
export function useFocusTrap(
  active: boolean,
  onClose?: () => void,
): RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return undefined;

    const container = containerRef.current;
    // Focus initial : le premier élément interactif, sinon le conteneur.
    const focusFirst = (): void => {
      const target =
        container?.querySelector<HTMLElement>("[autofocus]") ??
        container?.querySelector<HTMLElement>(FOCUSABLE) ??
        container;
      target?.focus();
    };
    const raf = requestAnimationFrame(focusFirst);

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose?.();
        return;
      }
      if (event.key !== "Tab" || !container) return;

      const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const current = document.activeElement;

      if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && (current === first || !container.contains(current))) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [active, onClose]);

  return containerRef;
}
