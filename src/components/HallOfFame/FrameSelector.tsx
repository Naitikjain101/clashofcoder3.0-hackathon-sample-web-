import { motion } from "motion/react";
import { FRAMES, type Frame } from "./frames";
import { useReducedMotion } from "@/hooks/use-prefs";

export function FrameSelector({
  active,
  onSelect,
}: {
  active: Frame;
  onSelect: (f: Frame) => void;
}) {
  const reduced = useReducedMotion();
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
      {FRAMES.map((f, i) => (
        <motion.button
          key={f.id}
          type="button"
          onClick={() => onSelect(f)}
          initial={reduced ? false : { opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: i * 0.08 }}
          whileTap={{ scale: 0.96 }}
          className={`min-h-[64px] shrink-0 rounded-2xl px-4 py-3 text-left text-sm transition-colors ${
            active.id === f.id
              ? "bg-primary text-primary-foreground shadow-glow"
              : "glass text-foreground"
          }`}
          aria-pressed={active.id === f.id}
        >
          <span
            aria-hidden
            className="mb-2 block h-2 w-10 rounded-full"
            style={{ background: f.accent }}
          />
          <span className="font-display font-bold">{f.name}</span>
        </motion.button>
      ))}
    </div>
  );
}