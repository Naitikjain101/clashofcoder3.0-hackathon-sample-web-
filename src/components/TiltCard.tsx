import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useIsTouch, useReducedMotion } from "@/hooks/use-prefs";
import { cn } from "@/lib/utils";

/** 3D tilt on pointer devices; scale-press feedback on touch. */
export function TiltCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const touch = useIsTouch();
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 200, damping: 20 });

  const tilt = !touch && !reduced;

  return (
    <motion.div
      ref={ref}
      onPointerMove={(e) => {
        if (!tilt || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      whileTap={{ scale: 0.97 }}
      style={tilt ? { rotateX: rx, rotateY: ry, transformPerspective: 800 } : {}}
      className={cn("glass rounded-3xl", className)}
    >
      {children}
    </motion.div>
  );
}