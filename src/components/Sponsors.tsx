import { Reveal, Section } from "./space/Section";
import { TiltCard } from "./TiltCard";
import { SPONSORS } from "@/lib/config";
import { Radio, Wifi } from "lucide-react";

export function Sponsors() {
  return (
    <Section id="sponsors" eyebrow="Ground support" title="Sponsors & partners" backdrop="cyan">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SPONSORS.map((s, i) => (
          <Reveal key={s.name} delay={i * 0.06}>
            <TiltCard className="group relative overflow-hidden flex flex-col justify-between p-6 min-h-[170px] border border-white/5 hover:border-white/12 transition-all duration-300">
              
              {/* Laser Scanner Line on Hover */}
              <span className="absolute top-0 inset-x-0 h-[2px] bg-accent/40 opacity-0 group-hover:opacity-100 group-hover:top-[98%] transition-all duration-1000 ease-in-out pointer-events-none shadow-energy" />

              {/* Card Header (Docking details) */}
              <div className="flex justify-between items-center text-[0.6rem] font-mono uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
                  BAY_0{i + 1}
                </span>
                <span className="flex items-center gap-1">
                  <Wifi className="h-3 w-3 text-accent" />
                  LINK_ESTABLISHED
                </span>
              </div>

              {/* Sponsor Logo / Name */}
              <div className="my-5 flex flex-col items-center justify-center">
                <span className="font-display text-xl font-bold tracking-tight text-white group-hover:text-glow transition-all duration-300 sm:text-2xl">
                  {s.name}
                </span>
              </div>

              {/* Card Footer (Sponsor Tier) */}
              <div className="flex justify-between items-center border-t border-white/5 pt-3">
                <span className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-accent">
                  {s.tier}
                </span>
                <span className="text-[0.6rem] font-mono text-muted-foreground flex items-center gap-1">
                  <Radio className="h-3 w-3" />
                  COMMS: 92.4 MHz
                </span>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}