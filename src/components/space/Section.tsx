import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Nebula } from "./Nebula";
import { useReducedMotion } from "@/hooks/use-prefs";
import { cn } from "@/lib/utils";

export function Section({
  id,
  eyebrow,
  title,
  children,
  backdrop = "violet",
  className,
}: {
  id: string;
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  backdrop?: "violet" | "asteroid" | "gold" | "constellation" | "cyan";
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("relative isolate overflow-hidden px-5 py-20 sm:px-8 md:py-32", className)}
    >
      <Nebula variant={backdrop} />
      {/* Content scrim: gives all text a reliable dark backdrop over the 3D animation */}
      <div className="relative isolate mx-auto w-full max-w-6xl z-10 flex flex-col">
        {/* Macro Safe Reading Zone Mask — Dims Saturn and particles in the core reading column */}
        <div 
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: "radial-gradient(ellipse at center, rgba(3,4,15,0.7) 0%, rgba(3,4,15,0.4) 60%, transparent 100%)",
            margin: "-100px", // extend past the content bounds slightly
          }}
          aria-hidden
        />
        {(eyebrow || title) && (
          <Reveal>
            <header className="mb-10 md:mb-16">
              {eyebrow && (
                <p className="font-display text-xs uppercase tracking-[0.35em] text-accent">
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2 className="font-display mt-3 text-3xl font-bold leading-tight text-glow sm:text-4xl md:text-5xl [text-shadow:0_2px_20px_rgba(0,0,0,0.9),0_0_28px_var(--violet-glow)]">
                  {title}
                </h2>
              )}
              <div className="mt-6 h-px w-full bg-gradient-to-r from-primary/70 via-accent/30 to-transparent" />
            </header>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}

/** Fade-up on enter; renders in final state under reduced motion. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}