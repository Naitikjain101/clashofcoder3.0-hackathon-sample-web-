import { animate, useInView, useMotionValue, useTransform, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Reveal, Section } from "./space/Section";
import { TiltCard } from "./TiltCard";
import { useReducedMotion } from "@/hooks/use-prefs";
import { STATS } from "@/lib/config";

function formatValue(v: number) {
  return Math.round(v).toLocaleString("en-IN");
}

function StatCard({ stat, index }: { stat: (typeof STATS)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduced = useReducedMotion();
  const count = useMotionValue(0);
  const [isCounting, setIsCounting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (reduced) {
      count.set(stat.value);
      setIsDone(true);
      return;
    }
    if (!inView) return;

    let controls: any;
    const timeout = setTimeout(() => {
      setIsCounting(true);
      controls = animate(count, stat.value, {
        duration: 2.2,
        ease: [0.16, 1, 0.3, 1],
        onComplete: () => {
          setIsCounting(false);
          setIsDone(true);
        },
      });
    }, index * 120);

    return () => {
      clearTimeout(timeout);
      if (controls) controls.stop();
    };
  }, [inView, reduced, stat.value, index, count]);

  const display = useTransform(count, (v) => formatValue(v));

  return (
    <div ref={ref} className="h-full">
      <Reveal delay={index * 0.08}>
        <TiltCard className="h-full flex flex-col group relative bg-black/40 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/5 hover:border-accent/60 hover:-translate-y-2 hover:shadow-[0_15px_30px_-5px_rgba(79,201,205,0.3)] transition-all duration-500 overflow-hidden">
          {/* HUD Brackets */}
          <div className="absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2 border-accent/0 group-hover:border-accent/60 transition-all duration-500 rounded-tl-xl" />
          <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-accent/0 group-hover:border-accent/60 transition-all duration-500 rounded-br-xl" />
          <div className="absolute top-0 right-0 h-4 w-4 border-t border-r border-white/0 group-hover:border-white/20 transition-all duration-500 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-white/0 group-hover:border-white/20 transition-all duration-500 rounded-bl-lg" />
          
          {/* Sensor Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent/80 shadow-energy animate-pulse" />
              <span className="font-mono text-[0.55rem] uppercase tracking-widest text-muted-foreground">
                SENSOR_{index + 1}
              </span>
            </div>
            <span className="font-mono text-[0.55rem] text-accent/50 group-hover:text-accent transition-colors">
              ONLINE
            </span>
          </div>
          
          {/* Telemetry Data */}
          <motion.div
            initial={{ scale: 1, textShadow: "0 0 0px rgba(79,201,205,0)" }}
            animate={
              isCounting
                ? { scale: 1.05, textShadow: "0 0 25px rgba(79,201,205,0.6)", color: "#ffffff" }
                : isDone
                  ? { scale: 1, textShadow: ["0 0 25px rgba(79,201,205,0.6)", "0 0 40px rgba(255,255,255,1)", "0 0 0px rgba(79,201,205,0)"], color: ["#ffffff", "#e0ffff", "#ffffff"] }
                  : { scale: 1, textShadow: "0 0 0px rgba(79,201,205,0)", color: "#ffffff" }
            }
            transition={{ duration: isDone ? 1 : 0.4, ease: "easeOut" }}
            className="font-display text-4xl font-bold tabular-nums group-hover:text-glow transition-all duration-300 sm:text-5xl"
          >
            {stat.prefix && <span>{stat.prefix}</span>}
            <motion.span>{display}</motion.span>
            {stat.suffix && (
              <span className={`transition-all duration-500 ease-out inline-block ${isDone ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                {stat.suffix}
              </span>
            )}
          </motion.div>
          
          <div className="mt-2 text-xs uppercase tracking-[0.25em] text-accent font-mono flex-1">
            {stat.label}
          </div>
          
          {/* Data visualization scanline */}
          <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-accent group-hover:w-full transition-all duration-1000 ease-out shadow-energy" />
        </TiltCard>
      </Reveal>
    </div>
  );
}

export function Stats() {
  return (
    <Section id="stats" eyebrow="Telemetry" title="The numbers" backdrop="violet">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <StatCard key={s.label} stat={s} index={i} />
        ))}
      </div>
    </Section>
  );
}