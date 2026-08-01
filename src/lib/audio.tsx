import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * All sound is synthesised with the Web Audio API — short, compressed-by-nature
 * cues with no network cost and nothing that can autoplay before a user gesture.
 * TODO: swap synthesised cues for final mastered audio files when they arrive.
 */
export type Cue = "whoosh" | "impact" | "blip" | "shutter" | "page";

type AudioCtx = {
  muted: boolean;
  toggleMute: () => void;
  play: (cue: Cue) => void;
  unlocked: boolean;
};

const Ctx = createContext<AudioCtx>({
  muted: true,
  toggleMute: () => {},
  play: () => {},
  unlocked: false,
});

export const useAudio = () => useContext(Ctx);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const ambientRef = useRef<{ gain: GainNode; stop: () => void } | null>(null);

  const getCtx = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  // First real interaction unlocks audio; sound still only plays when unmuted.
  useEffect(() => {
    const unlock = () => {
      setUnlocked(true);
      getCtx();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [getCtx]);

  // Ambient cosmic drone — only while unlocked and unmuted.
  useEffect(() => {
    if (muted || !unlocked) {
      ambientRef.current?.stop();
      ambientRef.current = null;
      return;
    }
    const ctx = getCtx();
    if (!ctx) return;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 320;
    filter.connect(gain);

    const oscs = [55, 82.5, 110.3].map((f) => {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.25;
      o.connect(g).connect(filter);
      o.start();
      return o;
    });

    ambientRef.current = {
      gain,
      stop: () => {
        try {
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
          oscs.forEach((o) => o.stop(ctx.currentTime + 0.5));
        } catch {
          /* context already closed */
        }
      },
    };
    return () => ambientRef.current?.stop();
  }, [muted, unlocked, getCtx]);

  const play = useCallback(
    (cue: Cue) => {
      if (muted) return;
      const ctx = getCtx();
      if (!ctx) return;
      const t = ctx.currentTime;
      const out = ctx.createGain();
      out.connect(ctx.destination);

      if (cue === "impact") {
        const buf = ctx.createBuffer(1, ctx.sampleRate * 1.2, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2.5;
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 400;
        out.gain.setValueAtTime(0.5, t);
        src.connect(lp).connect(out);
        src.start(t);

        const thud = ctx.createOscillator();
        thud.frequency.setValueAtTime(140, t);
        thud.frequency.exponentialRampToValueAtTime(30, t + 0.5);
        const tg = ctx.createGain();
        tg.gain.setValueAtTime(0.5, t);
        tg.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
        thud.connect(tg).connect(ctx.destination);
        thud.start(t);
        thud.stop(t + 0.8);
        return;
      }

      if (cue === "whoosh" || cue === "page") {
        const dur = cue === "whoosh" ? 0.7 : 0.35;
        const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.4;
        bp.frequency.setValueAtTime(300, t);
        bp.frequency.exponentialRampToValueAtTime(2600, t + dur * 0.7);
        bp.frequency.exponentialRampToValueAtTime(400, t + dur);
        out.gain.setValueAtTime(0.0001, t);
        out.gain.exponentialRampToValueAtTime(cue === "whoosh" ? 0.3 : 0.16, t + dur * 0.4);
        out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(out);
        src.start(t);
        return;
      }

      // blip / shutter
      const o = ctx.createOscillator();
      o.type = cue === "shutter" ? "square" : "sine";
      const base = cue === "shutter" ? 1400 : 880;
      o.frequency.setValueAtTime(base, t);
      o.frequency.exponentialRampToValueAtTime(base * (cue === "shutter" ? 0.4 : 1.6), t + 0.09);
      out.gain.setValueAtTime(0.0001, t);
      out.gain.exponentialRampToValueAtTime(0.14, t + 0.01);
      out.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      o.connect(out);
      o.start(t);
      o.stop(t + 0.16);
    },
    [muted, getCtx],
  );

  const value = useMemo(
    () => ({ muted, toggleMute: () => setMuted((m) => !m), play, unlocked }),
    [muted, play, unlocked],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}