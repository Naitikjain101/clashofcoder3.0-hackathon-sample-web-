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
      className={cn("relative overflow-hidden px-5 py-20 sm:px-8 md:py-32", className)}
    >
      <Nebula variant={backdrop} />
      <div className="mx-auto w-full max-w-6xl">
        {(eyebrow || title) && (
          <Reveal>
            <header className="mb-10 md:mb-16">
              {eyebrow && (
                <p className="font-display text-xs uppercase tracking-[0.35em] text-accent">
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2 className="font-display mt-3 text-3xl font-bold leading-tight text-glow sm:text-4xl md:text-5xl">
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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}