import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Reveal, Section } from "./space/Section";
import { TiltCard } from "./TiltCard";
import { useReducedMotion } from "@/hooks/use-prefs";
import { useAudio } from "@/lib/audio";
import { PRIZES } from "@/lib/config";
import { ShieldAlert, ShieldCheck, Lock, Unlock, Fingerprint } from "lucide-react";

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
            if (index < iterations) return text[index] ?? char;
            return chars[Math.floor(Math.random() * chars.length)] ?? char;
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
    if (isDecrypting || unlocked) return;
    setIsDecrypting(true);
    play("decrypt");
    if (navigator.vibrate) navigator.vibrate([20, 30, 20]);

    setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate([40, 40]);
      play("unlock");
      setIsDecrypting(false);
      setUnlocked(true);
    }, 1500);
  };

  return (
    <Section id="prizes" eyebrow="Cargo Payload" title="Prize vault" backdrop="gold">
      <div className="relative">
        {/* ── LOCKED / DECRYPTING STATE ── */}
        <AnimatePresence>
          {!unlocked && (
            <motion.div
              key="vault-locked"
              exit={{ opacity: 0, scale: 1.05, y: -20, transition: { duration: 0.4 } }}
              className="flex justify-center py-10"
            >
              <motion.div
                animate={
                  isDecrypting
                    ? {
                        x: [-2, 2, -2, 2, 0],
                        y: [-1, 1, -1, 1, 0],
                        borderColor: "rgba(230, 184, 0, 0.5)",
                        boxShadow: "0 0 60px rgba(230, 184, 0, 0.25)",
                      }
                    : {
                        x: 0,
                        y: 0,
                        borderColor: "rgba(255, 255, 255, 0.06)",
                        boxShadow: "0 0 45px rgba(230, 184, 0, 0.08)",
                      }
                }
                transition={
                  isDecrypting
                    ? {
                        x: { repeat: Infinity, duration: 0.15, ease: "linear" },
                        y: { repeat: Infinity, duration: 0.15, ease: "linear", delay: 0.05 },
                      }
                    : { type: "spring", stiffness: 100, damping: 18 }
                }
                className="glass max-w-md w-full rounded-3xl p-8 text-center flex flex-col items-center justify-center relative overflow-hidden border border-white/5"
              >
                {/* Scanning line */}
                {isDecrypting && (
                  <motion.div
                    className="absolute left-0 right-0 h-[2px] bg-accent/60 z-10 pointer-events-none"
                    style={{ boxShadow: "0 0 20px 4px rgba(230,184,0,0.6)" }}
                    initial={{ top: "-4%" }}
                    animate={{ top: "104%" }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  />
                )}

                {/* Progress bar */}
                {isDecrypting && (
                  <motion.div
                    className="absolute bottom-0 left-0 h-1.5 bg-accent z-20 pointer-events-none shadow-[0_0_15px_rgba(230,184,0,0.8)]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "linear" }}
                  />
                )}

                {/* Icon */}
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent relative z-10">
                    {isDecrypting ? (
                      <Fingerprint className="h-8 w-8 animate-pulse text-accent" />
                    ) : (
                      <Lock className="h-8 w-8" />
                    )}
                  </div>
                  {isDecrypting && (
                    <motion.div
                      className="absolute inset-0 bg-accent/25 rounded-full blur-xl"
                      animate={{ scale: [1, 1.6, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    />
                  )}
                </div>

                <h3 className="font-display mt-8 text-2xl font-bold tracking-wider text-white">
                  {isDecrypting ? (
                    <ScrambleText text="BYPASSING SECURITY..." />
                  ) : (
                    "CARGO VAULT SECURED"
                  )}
                </h3>

                <p className="mt-3 text-sm text-muted-foreground max-w-sm">
                  {isDecrypting ? (
                    <span className="text-accent/80 animate-pulse">
                      Establishing secure handshake. Please wait...
                    </span>
                  ) : (
                    "Authentication required. Decrypt payload to inspect hackathon cash pool and prize breakdown."
                  )}
                </p>

                <button
                  type="button"
                  onClick={handleUnlock}
                  disabled={isDecrypting}
                  className={`group mt-10 relative min-h-[56px] inline-flex items-center justify-center rounded-full bg-accent px-10 text-sm font-mono font-bold uppercase tracking-widest text-[#05060f] transition-all overflow-hidden ${
                    isDecrypting
                      ? "opacity-80 scale-95 cursor-not-allowed"
                      : "cursor-pointer hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(230,184,0,0.5)]"
                  }`}
                >
                  {isDecrypting && (
                    <motion.div
                      className="absolute inset-0 bg-white/20 pointer-events-none"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {isDecrypting ? (
                      <>
                        <Lock className="h-4 w-4 animate-spin" />
                        <ScrambleText text="DECRYPTING..." />
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-5 w-5" />
                        Decrypt Payload
                      </>
                    )}
                  </span>
                </button>

                <div className="mt-6 flex items-center gap-1.5 font-mono text-[0.6rem] text-muted-foreground uppercase">
                  <ShieldAlert
                    className={`h-4 w-4 ${isDecrypting ? "text-red-500 animate-pulse" : "text-accent"}`}
                  />
                  {isDecrypting ? "Security breach detected" : "Protected connection"}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── UNLOCKED STATE ── rendered outside AnimatePresence so it is never conditionally mounted/unmounted with opacity:0 */}
        {unlocked && (
          <div
            className="w-full pt-8"
            style={
              reduced
                ? {}
                : {
                    animation: "prizes-reveal 0.7s ease-out both",
                  }
            }
          >
            {/* Big prize total */}
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-2 font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-accent mb-6">
                <Unlock className="h-4 w-4" />
                Vault Decrypted
              </div>

              <div
                className="font-display text-7xl font-bold text-accent sm:text-8xl md:text-[10rem] leading-none"
                style={{ textShadow: "0 0 60px rgba(230,184,0,0.5), 0 0 120px rgba(230,184,0,0.2)" }}
              >
                {PRIZES.total}
              </div>

              <p className="mt-6 text-xs sm:text-sm uppercase tracking-[0.3em] text-muted-foreground">
                Total Prize Pool · Cash &amp; Rewards
              </p>
            </div>

            {/* Prize breakdown cards */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PRIZES.highlights.map((h, i) => (
                <Reveal key={h.title} delay={i * 0.1}>
                  <TiltCard className="bg-black/60 backdrop-blur-xl h-full rounded-2xl p-8 border border-white/10 hover:border-accent/60 hover:shadow-[0_0_30px_rgba(230,184,0,0.15)] hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-bl from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-tr-2xl pointer-events-none" />
                    <span className="font-mono text-[0.65rem] uppercase tracking-widest text-accent/90 flex items-center gap-3">
                      <span className="h-[1px] w-6 bg-accent/60" />
                      Award Tier 0{i + 1}
                    </span>
                    <h3 className="font-display mt-5 text-2xl font-bold text-white group-hover:text-glow-energy transition-all">
                      {h.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground group-hover:text-white/90 transition-colors">
                      {h.detail}
                    </p>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Keyframe for the reveal */}
      <style>{`
        @keyframes prizes-reveal {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Section>
  );
}