import { useEffect, useState } from "react";
import { EVENT, LINKS, NAV_SECTIONS } from "@/lib/config";
import { Compass, Globe, Radio } from "lucide-react";
import { Reveal } from "./space/Section";

function MissionClock() {
  const [t, setT] = useState("--:--:--");
  useEffect(() => {
    const tick = () =>
      setT(
        new Date().toLocaleTimeString("en-GB", {
          hour12: false,
          timeZone: "Asia/Kolkata",
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="glass inline-flex items-center gap-3 rounded-full px-4 py-2 border border-white/5">
      <span className="h-2 w-2 rounded-full bg-accent shadow-energy animate-ping" />
      <span className="font-mono text-xs tabular-nums tracking-[0.2em] text-accent">
        MISSION TIME: {t} IST
      </span>
    </div>
  );
}

export function Footer() {
  const socials = [
    { label: "Instagram", href: LINKS.instagram },
    { label: "LinkedIn", href: LINKS.linkedin },
    { label: "Discord", href: LINKS.discord },
    { label: "WhatsApp", href: LINKS.whatsapp },
  ];

  return (
    <footer className="relative border-t border-white/10 px-5 py-16 sm:px-8 bg-gradient-to-t from-[#05060f] to-transparent z-10">
      {/* Return spacecraft status box */}
      <Reveal delay={0.1}>
        <div className="mx-auto max-w-6xl mb-12 glass border border-white/5 rounded-2xl p-6 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Compass className="h-5 w-5 animate-spin" style={{ animationDuration: "12s" }} />
            </div>
            <div>
              <span className="font-mono text-[0.55rem] text-accent uppercase tracking-widest block">
                NAVIGATION OVERRIDE
              </span>
              <span className="text-sm font-bold text-white tracking-wide">
                Course Plotted: Entering Event Horizon
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono text-[0.6rem] text-muted-foreground uppercase">
            <div className="hidden sm:block">
              <span className="block text-accent">VELOCITY</span>
              <span className="text-white font-bold">WARP 9.2</span>
            </div>
            <div className="hidden md:block">
              <span className="block text-accent">TRAJECTORY</span>
              <span className="text-white font-bold">CALIBRATED</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4 text-accent" />
              <span>Orbit complete</span>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-3">
        <Reveal delay={0.2}>
          <div>
            <h2 className="font-display text-xl font-bold text-white tracking-tight">{EVENT.name}</h2>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">{EVENT.tagline}</p>
            <div className="mt-5">
              <MissionClock />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.3}>
          <nav aria-label="Sections">
            <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Navigate</h3>
            <ul className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
              {NAV_SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="inline-block py-1.5 hover:text-white transition-colors cursor-none">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>

        <Reveal delay={0.4}>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Connect</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="inline-block py-1.5 hover:text-white transition-colors cursor-none">
                    {s.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${LINKS.email}`} className="inline-block py-1.5 hover:text-white transition-colors cursor-none">
                  {LINKS.email}
                </a>
              </li>
            </ul>
          </div>
        </Reveal>
      </div>

      <div className="mx-auto mt-10 w-full max-w-6xl border-t border-white/5 pt-6 text-xs text-muted-foreground flex flex-col md:flex-row justify-between gap-4">
        <div>
          <p className="font-mono text-[0.6rem] uppercase text-accent mb-1">Landing Site</p>
          <p>{EVENT.venueAddress}</p>
        </div>
        <p className="mt-2 md:mt-auto font-mono text-[0.6rem] uppercase tracking-wider text-right flex items-center gap-1 justify-end">
          <Radio className="h-3.5 w-3.5 text-accent" />
          © 2026 Hacker&apos;s Unity × JECRC Foundation. All rights reserved.
        </p>
      </div>
    </footer>
  );
}