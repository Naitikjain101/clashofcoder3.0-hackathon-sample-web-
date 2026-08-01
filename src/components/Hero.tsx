import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { CountdownTimer } from "./CountdownTimer";
import { CrashIntro } from "./CrashIntro";
import { MagneticButton } from "./space/MagneticButton";
import { Nebula } from "./space/Nebula";
import { useReducedMotion } from "@/hooks/use-prefs";
import { DATES, EVENT, LINKS } from "@/lib/config";
import { cn } from "@/lib/utils";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [introDone, setIntroDone] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const planetY = useTransform(scrollYProgress, [0, 1], ["0%", "38%"]);
  const ringRotate = useTransform(scrollYProgress, [0, 1], [12, 42]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  const show = reduced || introDone;

  // Stagger configurations for entering items
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 28, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 110,
        damping: 15,
        mass: 0.8,
      },
    },
  };

  return (
    <>
      <CrashIntro onDone={() => setIntroDone(true)} />
      <section
        ref={ref}
        className="relative flex min-h-[100svh] items-center overflow-hidden px-5 pb-16 pt-28 sm:px-8"
      >
        {/* Render nebula overlay only under reduced motion, since SpaceScene covers normal mode */}
        {reduced && <Nebula variant="violet" />}

        {/* Flat Saturn fallback for reduced-motion / static configurations */}
        {reduced && (
          <motion.div
            aria-hidden
            style={{ y: planetY }}
            className="pointer-events-none absolute -right-24 top-24 h-64 w-64 md:right-[6%] md:top-1/4 md:h-96 md:w-96"
          >
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,oklch(0.63_0.22_303/0.95),oklch(0.2_0.05_275)_70%)] shadow-glow-lg" />
            <motion.div
              style={{ rotate: ringRotate }}
              className="absolute inset-[-28%] rounded-[50%] border border-accent/40"
            />
          </motion.div>
        )}

        <motion.div
          style={reduced ? {} : { y: contentY }}
          className="relative mx-auto w-full max-w-6xl z-10"
        >
          <motion.div
            variants={containerVariants}
            initial={reduced ? "visible" : "hidden"}
            animate={show ? "visible" : "hidden"}
          >
            <motion.p
              variants={itemVariants}
              className="font-display text-[0.65rem] uppercase tracking-[0.4em] text-accent sm:text-xs text-glow-energy"
            >
              {EVENT.tagline}
            </motion.p>
            
            <motion.h1
              variants={itemVariants}
              className="font-display mt-4 text-[2.75rem] font-bold leading-[0.95] tracking-tight text-glow sm:text-7xl md:text-8xl"
            >
              Clash of
              <br />
              Coders <span className="text-accent text-glow-energy">3.0</span>
            </motion.h1>
            
            <motion.p
              variants={itemVariants}
              className="mt-5 max-w-md text-base text-muted-foreground sm:text-lg"
            >
              A 24-hour hackathon · {DATES.displayRange}
              <br />
              {EVENT.venueName}
            </motion.p>

            <motion.div variants={itemVariants} className="mt-8 flex flex-wrap gap-3">
              <MagneticButton href={LINKS.register} className="magnetic-target">Register now</MagneticButton>
              <MagneticButton href="#about" variant="ghost" className="magnetic-target">
                Explore mission
              </MagneticButton>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-10 max-w-md">
              <CountdownTimer />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}