import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Section } from "./space/Section";
import { useIsPhone, useReducedMotion } from "@/hooks/use-prefs";
import { useAudio } from "@/lib/audio";
import { TRACKS } from "@/lib/config";

const PLANET_PALETTES = [
  "from-[#4fc9cd] to-[#124b5c] shadow-[0_0_15px_rgba(79,201,205,0.4)]", // AI (Cyan)
  "from-[#8a2be2] to-[#3a0a66] shadow-[0_0_15px_rgba(138,43,226,0.4)]", // Web (Purple)
  "from-[#ff4d4d] to-[#660000] shadow-[0_0_15px_rgba(255,77,77,0.4)]",  // Sec (Red)
  "from-[#ffaa00] to-[#553300] shadow-[0_0_15px_rgba(255,170,0,0.4)]",  // Web3 (Amber)
  "from-[#00ffcc] to-[#005544] shadow-[0_0_15px_rgba(0,255,204,0.4)]",  // Health (Teal)
  "from-[#33cc33] to-[#085a08] shadow-[0_0_15px_rgba(51,204,51,0.4)]",  // Green (Green)
  "from-[#ff3399] to-[#660033] shadow-[0_0_15px_rgba(255,51,153,0.4)]", // Edu (Pink)
  "from-[#3399ff] to-[#003d80] shadow-[0_0_15px_rgba(51,153,255,0.4)]", // IoT (Blue)
  "from-[#e6b800] to-[#4d3d00] shadow-[0_0_15px_rgba(230,184,0,0.4)]",  // Fin (Gold)
  "from-[#e600e6] to-[#4d004d] shadow-[0_0_15px_rgba(230,0,230,0.4)]",  // Open (Magenta)
];

export function Tracks() {
  const phone = useIsPhone();
  const reduced = useReducedMotion();
  const { play } = useAudio();
  const [active, setActive] = useState<number | null>(null);

  const interactiveGalaxy = !phone && !reduced;

  return (
    <Section id="tracks" eyebrow="Choose your orbit" title="10 tracks" backdrop="asteroid">
      {interactiveGalaxy ? (
        <div className="relative mx-auto aspect-square w-full max-w-[620px] flex items-center justify-center">
          {/* Central Cosmic Sun / Core */}
          <div className="absolute h-32 w-32 rounded-full bg-[radial-gradient(circle,oklch(0.79_0.14_205),transparent_70%)] opacity-70 animate-pulse z-10 pointer-events-none" />
          <div 
            className="absolute h-24 w-24 rounded-full bg-gradient-to-tr from-[#8a2be2] to-[#4fc9cd] shadow-[0_0_50px_-5px_rgba(79,201,205,0.9)] border border-white/20 flex items-center justify-center text-center p-4 z-20 pointer-events-none"
          >
            <span className="font-display text-[0.6rem] uppercase tracking-[0.2em] font-bold text-white text-glow">
              CORE HUB
            </span>
          </div>

          {/* Animated Orbital Rings Container */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 160, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            {/* Active Data Link Line (SVG) */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none z-10" aria-hidden>
              <AnimatePresence>
                {active !== null && (
                  <motion.line
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    exit={{ opacity: 0 }}
                    x1="50%"
                    y1="50%"
                    x2={`${50 + Math.cos((active / TRACKS.length) * Math.PI * 2 + ((active % 3) * 0.4)) * ((140 + (active % 3) * 60) / 6.2)}%`}
                    y2={`${50 + Math.sin((active / TRACKS.length) * Math.PI * 2 + ((active % 3) * 0.4)) * ((140 + (active % 3) * 60) / 6.2)}%`}
                    stroke="oklch(0.79 0.14 205)"
                    strokeWidth="2"
                    strokeDasharray="4 6"
                  />
                )}
              </AnimatePresence>
            </svg>

            {/* Sci-Fi SVG Orbits */}
            {[140, 200, 260].map((r, idx) => (
              <motion.div
                key={idx}
                animate={{ rotate: idx % 2 === 0 ? -360 : 360 }}
                transition={{ duration: 140 + idx * 40, repeat: Infinity, ease: "linear" }}
                className="absolute rounded-full border border-accent/20 pointer-events-none border-dashed"
                style={{ width: `${r * 2}px`, height: `${r * 2}px`, borderDasharray: "4 12" }}
              />
            ))}

            {/* Planetary Tracks */}
            {TRACKS.map((t, i) => {
              const orbitIndex = i % 3; // 3 orbit channels
              const radius = 140 + orbitIndex * 60;
              const angle = (i / TRACKS.length) * Math.PI * 2 + (orbitIndex * 0.4);
              const left = 50 + Math.cos(angle) * (radius / 6.2);
              const top = 50 + Math.sin(angle) * (radius / 6.2);
              const palette = PLANET_PALETTES[i]!;

              return (
                <div
                  key={t.name}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group pointer-events-auto"
                  style={{ left: `${left}%`, top: `${top}%` }}
                >
                  <motion.div 
                    animate={{ rotate: -360 }} 
                    transition={{ duration: 160, repeat: Infinity, ease: "linear" }} 
                    className="relative"
                  >
                    {/* Targeting HUD Crosshairs on Hover */}
                    <div className="absolute inset-[-18px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="absolute top-0 left-0 h-2.5 w-2.5 border-t-2 border-l-2 border-accent" />
                      <div className="absolute top-0 right-0 h-2.5 w-2.5 border-t-2 border-r-2 border-accent" />
                      <div className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b-2 border-l-2 border-accent" />
                      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b-2 border-r-2 border-accent" />
                      <div className="absolute inset-0 rounded-full border border-accent/40 border-dashed animate-[spin_4s_linear_infinite]" />
                    </div>

                    <motion.button
                      type="button"
                      onClick={() => {
                        play("blip");
                        setActive(active === i ? null : i);
                      }}
                      whileHover={{ scale: 1.25 }}
                      whileTap={{ scale: 0.9 }}
                      className={`relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b ${palette} text-white font-mono text-[0.65rem] font-bold border border-white/20 transition-all shadow-energy`}
                    >
                      {/* Sub-moon rings */}
                      {i % 2 === 0 && (
                        <span className="absolute inset-[-6px] rounded-full border border-white/20 rotate-45 pointer-events-none" />
                      )}
                      {t.short}
                    </motion.button>

                    {/* Hover tooltips */}
                    <div className="pointer-events-none absolute left-1/2 top-[calc(100%+12px)] -translate-x-1/2 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 z-50 bg-black/90 backdrop-blur-md border border-accent/40 shadow-glow rounded-md px-3 py-1.5 whitespace-nowrap text-[0.65rem] text-accent uppercase font-mono tracking-widest">
                      [{t.name}]
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>

          {/* Console Details overlay */}
          <AnimatePresence>
            {active !== null && (
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-black/60 backdrop-blur-xl absolute w-[360px] rounded-2xl p-6 text-center border border-accent/30 z-50 shadow-glow"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-[0.6rem] uppercase tracking-widest text-accent flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
                    LINK_ESTABLISHED
                  </span>
                  <button 
                    onClick={() => setActive(null)}
                    className="text-muted-foreground hover:text-white text-xs font-mono transition-colors"
                  >
                    [CLOSE]
                  </button>
                </div>
                <h3 className="font-display text-2xl font-bold text-white text-glow-energy mt-2">
                  {TRACKS[active]?.name}
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-white/80">
                  {TRACKS[active]?.desc}
                </p>
                <div className="mt-5 border-t border-accent/20 pt-4 flex justify-between items-center">
                  <span className="font-mono text-[0.6rem] text-accent/80">
                    SECTOR: {TRACKS[active]?.short}
                  </span>
                  <span className="font-mono text-[0.6rem] text-accent/80">
                    STATUS: SECURE
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((t, i) => {
            const palette = PLANET_PALETTES[i]!;
            return (
              <motion.article
                key={t.name}
                initial={reduced ? false : { opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                className="glass relative overflow-hidden rounded-2xl p-6 border border-white/5 hover:border-white/15 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-8 w-8 rounded-full bg-gradient-to-b ${palette} flex items-center justify-center text-[0.55rem] font-bold text-white border border-white/10`}>
                    {t.short}
                  </div>
                  <div>
                    <span className="font-mono text-[0.6rem] uppercase tracking-wider text-accent">
                      Sector {i + 1}
                    </span>
                    <h3 className="font-display text-base font-bold text-glow text-white">{t.name}</h3>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t.desc}</p>
              </motion.article>
            );
          })}
        </div>
      )}
    </Section>
  );
}