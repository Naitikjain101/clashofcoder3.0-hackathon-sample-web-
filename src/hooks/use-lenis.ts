import { useLenis as useLenisReact } from "lenis/react";

/**
 * Custom hook wrapping Lenis scrolling context.
 * Can be used in components to respond to scroll velocity, progress, and offset.
 */
export function useLenis(callback?: (lenis: any) => void, deps: any[] = []) {
  return useLenisReact(callback, deps);
}
