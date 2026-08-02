import { useState, useEffect } from "react";
import { useReducedMotion, useIsPhone } from "./use-prefs";

export type PerformanceTier = "low" | "medium" | "high";

export function usePerformanceTier(): PerformanceTier {
  const isPhone = useIsPhone();
  const reducedMotion = useReducedMotion();
  const [tier, setTier] = useState<PerformanceTier>(isPhone ? "medium" : "high");

  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return;

    if (reducedMotion) {
      setTier("low");
      return;
    }

    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const deviceMemory = (navigator as any).deviceMemory || 4;

    if (isPhone) {
      if (hardwareConcurrency <= 4 || deviceMemory <= 4) {
        setTier("low");
      } else {
        setTier("medium");
      }
    } else {
      if (hardwareConcurrency <= 4 || deviceMemory <= 4) {
        setTier("medium");
      } else {
        setTier("high");
      }
    }
  }, [isPhone, reducedMotion]);

  return tier;
}
