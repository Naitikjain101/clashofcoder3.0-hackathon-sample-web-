import { MagneticButton } from "./space/MagneticButton";
import { Reveal, Section } from "./space/Section";
import { EVENT, MAP } from "@/lib/config";

export function MapEmbed() {
  return (
    <Section id="venue" eyebrow="Landing site" title="Venue" backdrop="asteroid">
      <Reveal>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <h3 className="font-display text-xl font-bold">{EVENT.venueName}</h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              {EVENT.venueAddress}
            </p>
            <div className="mt-6">
              <MagneticButton href={MAP.directions}>Get directions</MagneticButton>
            </div>
          </div>
          <div className="glass overflow-hidden rounded-3xl p-1 relative border border-accent/40 shadow-glow">
            {/* Holographic targeting brackets */}
            <div className="absolute top-4 left-4 h-8 w-8 border-t-2 border-l-2 border-accent/80 rounded-tl-lg pointer-events-none z-10" />
            <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-accent/80 rounded-br-lg pointer-events-none z-10" />
            <div className="absolute top-4 right-4 h-4 w-4 border-t border-r border-accent/50 rounded-tr-sm pointer-events-none z-10" />
            <div className="absolute bottom-4 left-4 h-4 w-4 border-b border-l border-accent/50 rounded-bl-sm pointer-events-none z-10" />
            
            {/* Coordinates Overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-accent/20 px-3 py-1 rounded-md text-[0.55rem] font-mono text-accent tracking-[0.2em] pointer-events-none z-10 animate-pulse">
              TARGET LOCKED: 26.7797° N, 75.8211° E
            </div>
            
            {/* Animated Scanner line */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_0%,rgba(79,201,205,0.25)_50%,transparent_100%)] bg-[length:100%_4px] opacity-40 mix-blend-screen animate-[scan_8s_ease-in-out_infinite] z-20" />
            
            <iframe
              title="Map to JECRC Foundation, Jaipur"
              src={MAP.embedSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[280px] w-full rounded-[20px] border-0 sm:h-[360px] opacity-90"
              style={{ filter: "grayscale(100%) invert(95%) hue-rotate(180deg) contrast(1.5) sepia(10%) brightness(0.8)" }}
            />
          </div>
        </div>
      </Reveal>
    </Section>
  );
}