import { useEffect, useState } from "react";

/** True after hydration — use to gate anything that reads browser state. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

function useMedia(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const on = () => setMatches(mql.matches);
    on();
    mql.addEventListener("change", on);
    return () => mql.removeEventListener("change", on);
  }, [query]);
  return matches;
}

/** Every animated feature must have a static fallback keyed off this. */
export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");

/** Mobile = simplified effects, never removed atmosphere. */
export const useIsPhone = () => useMedia("(max-width: 767px)");

/** Touch devices get press states instead of hover-only affordances. */
export const useIsTouch = () => useMedia("(hover: none)");