import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useAudio } from "@/lib/audio";
import { useIsTouch, useReducedMotion } from "@/hooks/use-prefs";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  className?: string;
  ariaLabel?: string;
};

/**
 * Magnetic pull on pointer devices; a satisfying press-scale on touch.
 * Always ≥44px tall.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  className,
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const touch = useIsTouch();
  const reduced = useReducedMotion();
  const { play } = useAudio();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18 });
  const y = useSpring(my, { stiffness: 220, damping: 18 });

  const magnetic = !touch && !reduced;

  const onMove = (e: React.PointerEvent) => {
    if (!magnetic || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.28);
    my.set((e.clientY - (r.top + r.height / 2)) * 0.28);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const classes = cn(
    "relative inline-flex min-h-[48px] items-center justify-center rounded-full px-7 text-sm font-semibold tracking-wide transition-colors select-none",
    variant === "primary"
      ? "bg-primary text-primary-foreground shadow-glow hover:bg-violet-soft"
      : "glass text-foreground hover:border-accent/40",
    className,
  );

  const content = (
    <>
      {variant === "primary" && (
        <span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full bg-primary opacity-60 blur-xl"
        />
      )}
      {children}
    </>
  );

  const shared = {
    className: classes,
    style: { x, y },
    onPointerMove: onMove,
    onPointerLeave: reset,
    whileTap: { scale: 0.94 },
    onClick: () => {
      play("blip");
      onClick?.();
    },
    ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
  };

  if (href) {
    return (
      <motion.a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
        {...shared}
      >
        {content}
      </motion.a>
    );
  }
  return (
    <motion.button ref={ref as React.Ref<HTMLButtonElement>} type="button" {...shared}>
      {content}
    </motion.button>
  );
}