import { motion } from "motion/react";
import { Reveal, Section } from "./space/Section";
import { TiltCard } from "./TiltCard";
import { EVENT } from "@/lib/config";
import { Target, Users, Gift } from "lucide-react";

export function About() {
  const cards = [
    {
      title: "The Mission",
      desc: "A high-octane 24-hour hacking marathon. Break boundaries, solve pressing global challenges, and build production-ready projects in Jaipur.",
      icon: Target,
      tint: "oklch(0.79 0.14 205)", // Cyan
    },
    {
      title: "The Crew",
      desc: "Collaborate with over 600+ high-calibre hackers, developers, and designers. Gain critical support from 15+ industry experts and battle-tested mentors.",
      icon: Users,
      tint: "oklch(0.63 0.22 303)", // Purple
    },
    {
      title: "The Payload",
      desc: "Unlock ₹2,00,000 in cash prizes, customized tech swags, certification, and fast-tracked internship placements with our corporate tech partners.",
      icon: Gift,
      tint: "oklch(0.78 0.14 85)", // Gold
    },
  ];

  return (
    <Section id="about" eyebrow="Mission brief" title="24 hours. One shot." backdrop="cyan">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.08}>
            <TiltCard className="group relative overflow-hidden p-8 min-h-[300px] flex flex-col justify-between bg-black/40 backdrop-blur-md border border-white/10 transition-all duration-300 hover:border-accent/50 hover:shadow-energy rounded-2xl">
              {/* Animated Laser Scanline */}
              <span 
                className="absolute top-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 group-hover:top-[98%] transition-all duration-1000 ease-in-out pointer-events-none" 
                style={{
                  background: `linear-gradient(90deg, transparent, ${c.tint}, transparent)`,
                  boxShadow: `0 0 20px ${c.tint}`
                }}
              />
              
              {/* Interactive background sheen */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none mix-blend-screen" 
                style={{
                  background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${c.tint} 0%, transparent 60%)`
                }}
              />
              
              <div className="relative z-10">
                <div 
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                  style={{
                    color: c.tint,
                    boxShadow: `inset 0 0 20px ${c.tint}33`
                  }}
                >
                  <c.icon className="h-6 w-6" />
                </div>
                
                <h3 className="font-display mt-6 text-xl font-bold text-glow">
                  {c.title}
                </h3>
                
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {c.desc}
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <span className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-accent/80">
                  Sector {i + 1}
                </span>
                <span 
                  className="h-2 w-2 rounded-full shadow-energy"
                  style={{
                    backgroundColor: c.tint,
                    boxShadow: `0 0 10px ${c.tint}`
                  }}
                />
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      <div className="mt-12 max-w-3xl rounded-2xl glass p-6 border border-white/5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          &gt; {EVENT.about}
        </p>
      </div>
    </Section>
  );
}