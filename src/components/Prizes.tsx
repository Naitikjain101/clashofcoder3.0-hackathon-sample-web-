import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Reveal, Section } from "./space/Section";
import { TiltCard } from "./TiltCard";
import { useReducedMotion } from "@/hooks/use-prefs";
import { useAudio } from "@/lib/audio";
import { PRIZES } from "@/lib/config";
import { ShieldAlert, ShieldCheck, Lock, Unlock } from "lucide-react";

function ScrambleText({ text }: { text: string }) {
  const [display, setDisplay] = useState(text);
  
  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((char, index) => {
            if (index < iterations) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );
      if (iterations >= text.length) clearInterval(interval);
      iterations += 1 / 3;
    }, 30);
    return () => clearInterval(interval);
  }, [text]);
  
  return <>{display}</>;
}

export function Prizes() {
  const reduced = useReducedMotion();
  const { play } = useAudio();
  const [unlocked, setUnlocked] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const handleUnlock = () => {
    if (isDecrypting) return;
    setIsDecrypting(true);
    play("shutter");
    if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
    
    setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate([40, 40]);
      setUnlocked(true);
      setIsDecrypting(false);
    }, 1500);
  };

  return (
    <Section id="prizes" eyebrow="Cargo Payload" title="Prize vault" backdrop="gold">
      <div className="relative min-h-[400px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!unlocked && !reduced ? (
            <motion.div
              key="vault-locked"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, y: -20 }}
              transition={{ type: "spring", stiffness: 100, damping: 18 }}
              className="glass max-w-md w-full border border-white/5 rounded-3xl p-8 text-center flex flex-col items-center justify-center relative z-20"
              style={{ boxShadow: "0 0 45px rgba(230, 184, 0, 0.1)" }}
            >
              <div className="h-16 w-16 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent animate-pulse">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="font-display mt-6 text-xl font-bold tracking-wider text-white">
                CARGO VAULT SECURED
              </h3>
              <p className="mt-2 text-xs text-muted-foreground max-w-xs">
                Authentication required. Decrypt payload connection to inspect hackathon cash pool and prize breakdown.
              </p>

              <button
                type="button"
                onClick={handleUnlock}
                disabled={isDecrypting}
                className={`group mt-8 relative cursor-none min-h-[48px] inline-flex items-center justify-center rounded-full bg-accent px-8 text-xs font-mono font-bold uppercase tracking-widest text-[#05060f] transition-all ${isDecrypting ? 'opacity-80 scale-95' : 'hover:scale-105 active:scale-95'}`}
                style={{ boxShadow: "0 0 25px var(--energy-glow)" }}
              >
                {isDecrypting ? (
                  <>
                    <Lock className="h-4 w-4 mr-2 animate-pulse" />
                    <ScrambleText text="DECRYPTING..." />
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Decrypt Payload
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center gap-1.5 font-mono text-[0.55rem] text-muted-foreground uppercase">
                <ShieldAlert className="h-3.5 w-3.5 text-accent" />
                Protected link
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="vault-unlocked"
              initial={reduced ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="w-full relative z-10"
            >
              <div className="text-center relative">
                {/* Visual glow backdrop */}
                <span
                  aria-hidden
                  className="absolute left-1/2 top-1/2 -z-10 h-40 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#baa28f]/20 blur-3xl"
                />
                
                <div className="flex items-center justify-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-accent">
                  <Unlock className="h-3 w-3" />
                  Vault Decrypted
                </div>
                
                <div className="font-display mt-4 text-5xl font-bold text-accent text-glow-energy sm:text-7xl md:text-8xl">
                  {PRIZES.total}
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Cash distribution & rewards
                </p>
              </div>

              <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {PRIZES.highlights.map((h, i) => (
                  <Reveal key={h.title} delay={i * 0.08}>
                    <TiltCard className="bg-black/40 backdrop-blur-md h-full rounded-2xl p-6 border border-white/10 hover:border-accent/50 hover:shadow-energy hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-all rounded-tr-2xl pointer-events-none" />
                      
                      <span className="font-mono text-[0.6rem] uppercase tracking-wider text-accent/80 flex items-center gap-2">
                        <span className="h-[1px] w-4 bg-accent/50" />
                        Award Tier 0{i + 1}
                      </span>
                      <h3 className="font-display mt-4 text-xl font-bold text-white group-hover:text-glow-energy transition-all">
                        {h.title}
                      </h3>
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground group-hover:text-white/80 transition-colors">
                        {h.detail}
                      </p>
                    </TiltCard>
                  </Reveal>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}