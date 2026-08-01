import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAudio } from "@/lib/audio";
import { useReducedMotion } from "@/hooks/use-prefs";

type Phase = "booting" | "ready" | "warp" | "impact" | "gone";

export function CrashIntro({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const { play } = useAudio();
  const [phase, setPhase] = useState<Phase>("booting");
  const [logs, setLogs] = useState<string[]>([]);

  const bootLogs = [
    "INITIALIZING SYSTEM CORE...",
    "ESTABLISHING CONNECTION TO SATURN STATION...",
    "Telemetry feed: ONLINE (Latency 78ms)",
    "ORBITAL POSITION RESOLVED: 9.582 AU",
    "Gimbal thrusters: STANDBY",
    "HOLOGRAPHIC ENGINES: WARMED",
    "ALL ORBITAL CHANNELS ONLINE.",
  ];

  useEffect(() => {
    if (reduced) {
      setPhase("gone");
      onDone();
      return;
    }

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < bootLogs.length) {
        setLogs((prev) => [...prev, bootLogs[currentIdx]!]);
        play("blip");
        currentIdx++;
      } else {
        clearInterval(interval);
        setPhase("ready");
      }
    }, 280);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const handleLaunch = () => {
    play("whoosh");
    setPhase("warp");

    setTimeout(() => {
      setPhase("impact");
      play("impact");
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }, 1100);

    setTimeout(() => {
      setPhase("gone");
      onDone();
    }, 2200);
  };

  const handleSkip = () => {
    setPhase("gone");
    onDone();
  };

  if (reduced || phase === "gone") return null;

  return (
    <AnimatePresence>
      <motion.div
        key="crash-intro"
        className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-[#05060f] px-4 sm:px-6 text-glow overflow-y-auto overflow-x-hidden"
        exit={{ opacity: 0 }}
      >
        {/* Subtle animated background grid & glow */}
        {phase !== "impact" && phase !== "warp" && (
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden min-h-[100dvh]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,var(--energy-glow)_0%,transparent_50%)] opacity-15" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          </div>
        )}

        {phase === "booting" && (
          <div className="z-10 w-full max-w-lg space-y-2 font-mono text-xs text-accent bg-black/40 p-6 rounded-lg border border-white/5 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
              <div className="h-2 w-2 bg-accent animate-pulse rounded-full" />
              <span className="text-[0.6rem] uppercase tracking-widest">BOOT SEQUENCE</span>
            </div>
            {logs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="leading-relaxed opacity-90"
              >
                &gt; {log}
              </motion.div>
            ))}
          </div>
        )}

        {phase === "ready" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center relative z-10 w-full max-w-2xl mx-auto py-12 my-auto"
          >
            <div className="relative p-10 sm:p-14 border border-white/10 bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden w-full group shadow-2xl shrink-0">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-accent/40 rounded-tl-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-accent/40 rounded-br-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              
              <span className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shadow-energy" />
                SYSTEM LEVEL: 100%
              </span>
              
              <h2 className="font-display mt-8 text-4xl font-bold leading-tight tracking-wider sm:text-5xl md:text-6xl text-glow-energy text-white uppercase drop-shadow-md">
                Saturn Orbit Ready
              </h2>
              
              <p className="mt-5 mx-auto max-w-md text-xs sm:text-sm text-muted-foreground/90 leading-relaxed font-mono uppercase tracking-widest">
                Core engines charged. Initiate launch sequence to enter Clash of Coders 3.0.
              </p>

              <div className="mt-14 flex justify-center relative">
                <motion.button
                  type="button"
                  onClick={handleLaunch}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative flex shrink-0 h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-accent text-[#05060f] font-display font-bold text-sm sm:text-base uppercase tracking-widest cursor-none shadow-energy transition-all duration-300 hover:shadow-[0_0_50px_var(--energy-glow)]"
                >
                  <span className="relative z-10 pointer-events-none">LAUNCH</span>
                  {/* Rotating dashed border inside button */}
                  <div className="absolute inset-1.5 sm:inset-2 border-[1.5px] border-dashed border-[#05060f]/40 rounded-full animate-[spin_4s_linear_infinite] pointer-events-none" />
                  {/* Expanding radar pulse on hover */}
                  <span className="absolute inset-0 rounded-full border-[2px] border-accent scale-100 group-hover:scale-[1.6] opacity-40 group-hover:opacity-0 transition-all duration-700 ease-out pointer-events-none" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {phase === "warp" && (
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center bg-[#05060f]"
            initial={{ opacity: 1 }}
          >
            {/* Warp speed streaks */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 50 }).map((_, i) => {
                const angle = Math.random() * Math.PI * 2;
                const radius = 5 + Math.random() * 95;
                const length = 50 + Math.random() * 200;
                const duration = 0.4 + Math.random() * 0.5;
                return (
                  <motion.div
                    key={i}
                    className="absolute bg-gradient-to-r from-transparent to-accent rounded-full"
                    style={{
                      left: "50%",
                      top: "50%",
                      height: "2px",
                      width: `${length}px`,
                      transformOrigin: "left center",
                      transform: `rotate(${angle}rad) translate(${radius}px, 0)`,
                    }}
                    animate={{
                      transform: [
                        `rotate(${angle}rad) translate(${radius}px, 0) scaleX(0.1)`,
                        `rotate(${angle}rad) translate(${radius + 500}px, 0) scaleX(2.5)`,
                      ],
                    }}
                    transition={{
                      duration: duration,
                      ease: "easeIn",
                      repeat: Infinity,
                    }}
                  />
                );
              })}
            </div>
            <motion.h2
              className="z-20 font-display text-5xl sm:text-7xl font-bold tracking-[0.25em] text-accent uppercase text-glow-energy drop-shadow-2xl"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [1, 3], opacity: [0, 1, 0] }}
              transition={{ duration: 1.1, ease: "easeIn" }}
            >
              WARPING
            </motion.h2>
          </motion.div>
        )}

        {phase === "impact" && (
          <motion.div
            className="absolute inset-0 z-20 bg-white"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
          />
        )}

        {phase !== "warp" && phase !== "impact" && (
          <button
            type="button"
            onClick={handleSkip}
            className="absolute bottom-8 left-1/2 z-20 min-h-[44px] -translate-x-1/2 rounded-full border border-white/10 bg-black/40 backdrop-blur-md px-6 text-xs uppercase tracking-[0.3em] text-foreground/80 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all cursor-none active:scale-95"
          >
            Skip Intro
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}