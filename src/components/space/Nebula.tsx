import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useReducedMotion } from "@/hooks/use-prefs";
import { cn } from "@/lib/utils";

type Props = {
  /** Distinct celestial backdrop per section. */
  variant?: "violet" | "asteroid" | "gold" | "constellation" | "cyan";
  className?: string;
};

const TINTS: Record<NonNullable<Props["variant"]>, [string, string]> = {
  violet: ["oklch(0.54 0.26 292.6 / 0.35)", "oklch(0.63 0.22 303 / 0.22)"],
  asteroid: ["oklch(0.45 0.09 265 / 0.35)", "oklch(0.55 0.12 250 / 0.18)"],
  gold: ["oklch(0.78 0.14 85 / 0.22)", "oklch(0.54 0.26 292.6 / 0.28)"],
  constellation: ["oklch(0.6 0.18 265 / 0.28)", "oklch(0.79 0.14 205 / 0.16)"],
  cyan: ["oklch(0.79 0.14 205 / 0.22)", "oklch(0.54 0.26 292.6 / 0.3)"],
};

/** Layered soft-gradient depth. Parallaxes on scroll; static when reduced. */
export function Nebula({ variant = "violet", className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["10%", "-14%"]);
  const [a, b] = TINTS[variant];

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      <motion.div
        style={{
          ...(reduced ? {} : { y: y1 }),
          background: `radial-gradient(closest-side, ${a}, transparent 70%)`,
        }}
        className="absolute -left-[20%] top-[-10%] h-[70vh] w-[80vw] rounded-full blur-[60px] md:blur-[90px]"
      />
      <motion.div
        style={{
          ...(reduced ? {} : { y: y2 }),
          background: `radial-gradient(closest-side, ${b}, transparent 70%)`,
        }}
        className="absolute -right-[25%] bottom-[-15%] h-[60vh] w-[75vw] rounded-full blur-[60px] md:blur-[90px]"
      />
    </div>
  );
}