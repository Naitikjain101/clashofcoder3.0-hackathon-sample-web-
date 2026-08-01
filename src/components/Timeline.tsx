import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { Section } from "./space/Section";
import { useReducedMotion } from "@/hooks/use-prefs";
import { useAudio } from "@/lib/audio";
import { TIMELINE } from "@/lib/config";
import { Rocket } from "lucide-react";

export function Timeline() {
  const [day, setDay] = useState(0);
  const { play } = useAudio();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 65%"],
  });
  
  // Smooth scroll progression
  const drawn = useSpring(scrollYProgress, { stiffness: 95, damping: 22 });
  
  // Animate the path length
  const pathLength = useTransform(drawn, (v) => (reduced ? 1 : v));
  
  // Animate the spacecraft icon coordinate along the wavy trajectory
  const rocketY = useTransform(drawn, [0, 1], ["0%", "100%"]);
  const rocketX = useTransform(drawn, (v) => {
    if (reduced) return "0px";
    // Corresponds to the curve coordinates in the SVG path
    return `${Math.sin(v * Math.PI * 3.5) * 12}px`;
  });
  const rocketRotate = useTransform(drawn, (v) => {
    if (reduced) return 0;
    // Turn the rocket slightly to align with the curves
    return Math.cos(v * Math.PI * 3.5) * 22;
  });

  const items = TIMELINE[day]?.items ?? [];

  return (
    <Section id="timeline" eyebrow="Flight path" title="Run of show" backdrop="constellation">
      <div className="mb-10 inline-flex rounded-full glass p-1 border border-white/5">
        {TIMELINE.map((d, i) => (
          <button
            key={d.day}
            type="button"
            onClick={() => {
              setDay(i);
              play("page");
            }}
            className={`min-h-[44px] cursor-none rounded-full px-6 text-sm font-semibold transition-colors ${
              day === i 
                ? "bg-primary text-primary-foreground shadow-glow border border-white/10" 
                : "text-muted-foreground hover:text-white"
            }`}
          >
            {d.day} · {d.date}
          </button>
        ))}
      </div>

      <div ref={ref} className="relative pl-14 sm:pl-20">
        {/* Curvy Trajectory SVG Path */}
        <div className="absolute left-4 top-0 bottom-0 w-8 sm:left-8 flex justify-center">
          <svg
            className="absolute top-0 bottom-0 h-full w-full pointer-events-none"
            viewBox="0 0 40 1000"
            preserveAspectRatio="none"
            aria-hidden
          >
            {/* Background static path line */}
            <path
              d="M 20,0 Q 35,150 20,300 T 20,600 T 20,900 L 20,1000"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1.8"
            />
            {/* Animated drawing path line */}
            <motion.path
              d="M 20,0 Q 35,150 20,300 T 20,600 T 20,900 L 20,1000"
              fill="none"
              stroke="oklch(0.79 0.14 205)"
              strokeWidth="2.2"
              strokeDasharray="4 6"
              style={{
                pathLength,
                filter: "drop-shadow(0 0 4px oklch(0.79 0.14 205))",
              }}
            />
          </svg>

          {/* Flying Spacecraft Indicator */}
          {!reduced && (
            <motion.div
              style={{
                y: rocketY,
                x: rocketX,
                rotate: rocketRotate,
                top: 0,
              }}
              className="absolute -translate-y-1/2 h-8 w-8 rounded-full bg-accent text-accent-foreground border border-white/20 flex items-center justify-center shadow-energy z-20"
            >
              <Rocket className="h-4 w-4 rotate-45 text-[#05060f]" />
            </motion.div>
          )}
        </div>

        <ol className="space-y-6">
          {items.map((item, i) => (
            <motion.li
              key={`${day}-${item.title}`}
              initial={reduced ? false : { opacity: 0, x: -24, scale: 0.98 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                type: "spring",
                stiffness: 90,
                damping: 18,
                delay: i * 0.05,
              }}
              className="relative"
            >
              {/* Pulsing checkpoint node */}
              <span className="absolute -left-[45px] top-6 h-3.5 w-3.5 -translate-x-1/2 rounded-full border border-white/20 bg-accent shadow-energy sm:-left-[61px] animate-pulse" />

              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-accent/50 transition-all duration-300 group">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-[0.65rem] uppercase tracking-widest text-accent flex items-center gap-1.5">
                    <span className="h-1 w-1 bg-accent rounded-full animate-ping" />
                    LOG_ENTRY
                  </span>
                  <span className="font-mono text-[0.65rem] tabular-nums tracking-[0.2em] text-muted-foreground group-hover:text-white transition-colors">
                    [{item.time}]
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-white group-hover:text-glow-energy transition-colors">{item.title}</h3>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </Section>
  );
}