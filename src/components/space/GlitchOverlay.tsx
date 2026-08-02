import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/use-prefs";

export function GlitchOverlay() {
  const [glitching, setGlitching] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    
    // Random glitch trigger loop
    let timeoutId: number;
    
    const trigger = () => {
      // 10 to 40 seconds between glitches
      const nextTime = 10000 + Math.random() * 30000;
      timeoutId = window.setTimeout(() => {
        setGlitching(true);
        
        // Play static audio glitch if desired (optional)
        // const audio = new Audio("/sounds/glitch.mp3");
        // audio.volume = 0.1;
        // audio.play().catch(() => {});
        
        // Glitch duration 100ms - 300ms
        setTimeout(() => setGlitching(false), 100 + Math.random() * 200);
        trigger();
      }, nextTime);
    };
    
    trigger();
    return () => clearTimeout(timeoutId);
  }, [reduced]);

  if (!glitching) return null;

  // Offset is computed once per render so it stays stable for the frame duration.
  const offsetX = (Math.random() * 8 - 4).toFixed(2);
  const offsetY = (Math.random() * 4 - 2).toFixed(2);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[200]"
      style={{
        // Scan-line pattern only — no blend mode that touches hue.
        background: `repeating-linear-gradient(
          0deg,
          rgba(0,0,0,0) 0px,
          rgba(255,255,255,0.04) 1px,
          rgba(0,0,0,0) 2px
        )`,
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        opacity: Math.random() * 0.35 + 0.15,
      }}
    />
  );
}
