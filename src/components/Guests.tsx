import { Reveal, Section } from "./space/Section";
import { TiltCard } from "./TiltCard";
import { GUESTS } from "@/lib/config";

const initials = (n: string) =>
  n
    .replace(/^Dr\.\s*/, "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

export function Guests() {
  return (
    <Section id="guests" eyebrow="Mission control" title="Guests & judges" backdrop="constellation">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {GUESTS.map((g, i) => (
          <Reveal key={g.name} delay={i * 0.06}>
            <TiltCard className="h-full p-5 text-center">
              {/* TODO: replace placeholder avatar with the real headshot. */}
              <div
                aria-hidden
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,oklch(0.63_0.22_303),oklch(0.22_0.04_275))] font-display text-lg font-bold shadow-glow"
              >
                {initials(g.name)}
              </div>
              <h3 className="font-display mt-4 text-sm font-bold sm:text-base">{g.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{g.role}</p>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}