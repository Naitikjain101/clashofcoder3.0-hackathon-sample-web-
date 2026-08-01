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

  return (
    <div 
      className="pointer-events-none fixed inset-0 z-[200] mix-blend-difference"
      style={{
        background: `repeating-linear-gradient(
          0deg,
          rgba(0,0,0,0) 0px,
          rgba(255,255,255,0.05) 1px,
          rgba(0,0,0,0) 2px
        )`,
        backdropFilter: "contrast(1.5) hue-rotate(90deg) saturate(2)",
        transform: `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`,
        opacity: Math.random() * 0.5 + 0.5
      }}
    >
      <div className="absolute inset-0 bg-accent/20 animate-pulse mix-blend-overlay" />
    </div>
  );
}
