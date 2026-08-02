/**
 * SoundOrb — Premium floating glassmorphism sound control.
 *
 * Shows as a glowing ring button in the top-right corner.
 * Muted  → pulsing ring animation, VolumeX icon
 * Playing → steady glow + orbit animation, Volume2 icon
 *
 * First interaction hint: shows a "Click to enable music" tooltip
 * that fades after 6 seconds or once the user clicks.
 */

import { useEffect, useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useAudio } from "@/lib/audio";

export function SoundOrb() {
  const { muted, toggleMute, unlocked } = useAudio();
  const [showHint, setShowHint] = useState(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show the hint bubble 2 s after first user interaction unlocks audio
  useEffect(() => {
    if (!unlocked) return;
    const t = setTimeout(() => setShowHint(true), 2000);
    return () => clearTimeout(t);
  }, [unlocked]);

  // Auto-hide hint after 7 s
  useEffect(() => {
    if (!showHint) return;
    hintTimer.current = setTimeout(() => setShowHint(false), 7000);
    return () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, [showHint]);

  const handleClick = () => {
    setShowHint(false);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    toggleMute();
  };

  const isPlaying = unlocked && !muted;

  return (
    <div className="relative flex items-center justify-center" aria-label="Music controls">
      {/* Tooltip hint */}
      {showHint && (
        <div
          className="absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[11px] font-mono tracking-wide text-white/70 backdrop-blur-md"
          style={{ animation: "sound-hint-in 0.4s ease-out both" }}
          aria-live="polite"
        >
          {muted ? "🎵 Enable space music" : "🔇 Mute music"}
          {/* Arrow */}
          <span className="absolute right-[-6px] top-1/2 -translate-y-1/2 border-4 border-transparent border-l-black/60" />
        </div>
      )}

      {/* The orb button */}
      <button
        id="sound-toggle-btn"
        type="button"
        onClick={handleClick}
        aria-label={muted ? "Enable background music" : "Mute background music"}
        aria-pressed={!muted}
        className="relative flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        style={{ isolation: "isolate" }}
      >
        {/* Glass background */}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: "rgba(5, 6, 15, 0.55)",
            backdropFilter: "blur(16px) saturate(180%)",
            WebkitBackdropFilter: "blur(16px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: isPlaying
              ? "0 0 0 1px rgba(230,184,0,0.25), 0 0 20px rgba(230,184,0,0.12), inset 0 1px 0 rgba(255,255,255,0.08)"
              : "0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
            transition: "box-shadow 0.6s ease",
          }}
        />

        {/* Pulsing ring (visible when muted & unlocked — acts as a "hey, click me" hint) */}
        {unlocked && muted && (
          <>
            <span
              className="absolute inset-0 rounded-full border border-accent/30"
              style={{ animation: "orb-ring-pulse 2.4s ease-out infinite" }}
            />
            <span
              className="absolute inset-0 rounded-full border border-accent/15"
              style={{ animation: "orb-ring-pulse 2.4s ease-out infinite 0.8s" }}
            />
          </>
        )}

        {/* Orbit particle (visible when playing) */}
        {isPlaying && (
          <span
            className="absolute inset-0 rounded-full"
            style={{ animation: "orb-orbit 3s linear infinite" }}
          >
            <span
              className="absolute top-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-0.5 rounded-full bg-accent"
              style={{
                boxShadow: "0 0 6px 2px rgba(230,184,0,0.7)",
              }}
            />
          </span>
        )}

        {/* Icon */}
        <span className="relative z-10">
          {muted ? (
            <VolumeX
              className="h-4 w-4 text-white/60 transition-colors duration-300"
              aria-hidden
            />
          ) : (
            <Volume2
              className="h-4 w-4 text-accent transition-colors duration-300"
              aria-hidden
              style={{ filter: "drop-shadow(0 0 4px rgba(230,184,0,0.6))" }}
            />
          )}
        </span>
      </button>

      {/* Inline keyframes — avoids needing a separate CSS file */}
      <style>{`
        @keyframes orb-ring-pulse {
          0%   { transform: scale(1);    opacity: 0.7; }
          70%  { transform: scale(1.65); opacity: 0;   }
          100% { transform: scale(1.65); opacity: 0;   }
        }
        @keyframes orb-orbit {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes sound-hint-in {
          from { opacity: 0; transform: translateY(-50%) translateX(6px); }
          to   { opacity: 1; transform: translateY(-50%) translateX(0);   }
        }
      `}</style>
    </div>
  );
}
