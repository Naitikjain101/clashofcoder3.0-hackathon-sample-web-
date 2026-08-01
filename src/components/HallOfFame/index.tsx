import { useEffect, useRef, useState } from "react";
import { CanvasComposer } from "./CanvasComposer";
import { FrameSelector } from "./FrameSelector";
import { PhotoUploader } from "./PhotoUploader";
import { FRAMES, type Frame } from "./frames";
import { motion } from "motion/react";
import { Section } from "../space/Section";
import { TiltCard } from "../TiltCard";
import { MagneticButton } from "../space/MagneticButton";
import { useReducedMotion } from "@/hooks/use-prefs";
import { EVENT } from "@/lib/config";

function Confetti({ fire }: { fire: number }) {
  const reduced = useReducedMotion();
  if (reduced || fire === 0) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.span
          key={`${fire}-${i}`}
          className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
          style={{ background: i % 2 ? "oklch(0.79 0.14 205)" : "oklch(0.63 0.22 303)" }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: (Math.random() - 0.5) * 460,
            y: (Math.random() - 0.5) * 460,
            scale: 0.3,
          }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function HallOfFame() {
  const [frame, setFrame] = useState<Frame>(FRAMES[0]!);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [burst, setBurst] = useState(0);
  const reduced = useReducedMotion();
  const urlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const handleFile = (file: File) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = url;
  };

  const shareText = `I'm at ${EVENT.name}! ${EVENT.hashtag}`;
  const shares = [
    {
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    },
    {
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    },
  ];

  return (
    <Section
      id="hall-of-fame"
      eyebrow="Hall of Fame"
      title="Make your mission badge"
      backdrop="cyan"
    >
      <p className="-mt-6 mb-8 max-w-xl text-sm text-muted-foreground">
        Pick a frame, drop in a photo, drag or pinch to frame it, and download. Everything
        happens on your device — nothing is uploaded.
      </p>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr] max-w-4xl mx-auto">
        <TiltCard className="p-4 bg-space-800/40 border border-cyan/20 shadow-[0_0_15px_rgba(0,243,255,0.1)] h-full">
          <h3 className="text-xs font-display text-cyan mb-4 tracking-widest uppercase text-glow-energy">Select Frame</h3>
          <FrameSelector active={frame} onSelect={setFrame} />
        </TiltCard>

        <TiltCard className="p-6 relative bg-space-800/40 border border-nebula/30 shadow-[0_0_20px_rgba(157,78,221,0.15)] h-full flex flex-col">
          <Confetti fire={burst} />
          <div className="mb-6 flex flex-col gap-2">
            <h3 className="text-xs font-display text-nebula tracking-widest uppercase text-glow">Upload Subject Data</h3>
            <PhotoUploader onFile={handleFile} />
          </div>
          
          <div className="rounded-xl overflow-hidden border border-white/5 shadow-2xl bg-black/40">
            <CanvasComposer
              frame={frame}
              image={image}
              onExport={() => setBurst((b) => b + 1)}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-4 items-center">
            {shares.map((s) => (
              <MagneticButton
                key={s.label}
                href={s.href}
                variant="ghost"
                className="text-xs"
              >
                {s.label}
              </MagneticButton>
            ))}
            <span className="inline-flex min-h-[44px] items-center text-xs text-muted-foreground ml-auto">
              For IG Stories, save PNG & upload.
            </span>
          </div>
        </TiltCard>
      </div>
      {/* TODO: replace procedural placeholder frames with final PNG frame art. */}
    </Section>
  );
}