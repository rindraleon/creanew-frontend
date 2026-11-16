import { useCallback, useState } from "react";

export interface UseWizardResult {
  current: number;
  maxVisited: number;
  goTo: (index: number) => void;
  next: () => void;
  back: () => void;
  reset: () => void;
  isFirst: boolean;
  isLast: (total: number) => boolean;
}

/** Petit état de navigation pour le composant Wizard (0-based). */
export function useWizard(stepCount: number): UseWizardResult {
  const [current, setCurrent] = useState<number>(0);
  const [maxVisited, setMaxVisited] = useState<number>(0);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(stepCount - 1, index));
      setCurrent(clamped);
      setMaxVisited((m) => Math.max(m, clamped));
    },
    [stepCount],
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const back = useCallback(() => goTo(current - 1), [current, goTo]);
  const reset = useCallback(() => {
    setCurrent(0);
    setMaxVisited(0);
  }, []);

  return {
    current,
    maxVisited,
    goTo,
    next,
    back,
    reset,
    isFirst: current === 0,
    isLast: (total: number) => current === total - 1,
  };
}
