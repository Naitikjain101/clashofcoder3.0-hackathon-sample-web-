/**
 * SpaceAudio — Premium adaptive background music engine for Clash of Coders 3.0.
 *
 * Architecture:
 *  - Entirely synthesised via Web Audio API (zero network cost, no files to load)
 *  - Session persistence via sessionStorage
 *  - Visibility API pauses/resumes audio when tab hidden
 *  - Three music layers: bass drone, mid pads, high shimmer — cross-faded independently
 *  - Periodic ambient events: satellite beeps, radio static, deep rumbles
 *  - UI sound cues (hover tick, click pulse, whoosh, launch ignition, impact)
 *  - No autoplay — audio context unlocked only after first user gesture
 *
 * Music design inspiration: Interstellar, NASA ambience, SpaceX launch, deep space
 */

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

export type Cue =
  | "hover"
  | "click"
  | "whoosh"
  | "launch"
  | "impact"
  | "blip"
  | "shutter"
  | "page"
  | "decrypt"
  | "unlock"
  | "holo_start"
  | "holo_sweep"
  | "holo_chime"
  | "holo_exit";

type AudioCtxValue = {
  muted: boolean;
  toggleMute: () => void;
  play: (cue: Cue) => void;
  unlocked: boolean;
};

const AudioContext = createContext<AudioCtxValue>({
  muted: true,
  toggleMute: () => {},
  play: () => {},
  unlocked: false,
});

export const useAudio = () => useContext(AudioContext);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getAC(): typeof window.AudioContext | null {
  if (typeof window === "undefined") return null;
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof window.AudioContext })
      .webkitAudioContext ||
    null
  );
}

/** Create white-noise buffer of given duration (seconds) */
function noiseBuffer(ctx: BaseAudioContext, secs: number): AudioBuffer {
  const buf = ctx.createBuffer(1, ctx.sampleRate * secs, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

/** Connect a source → filter → gain → destination chain */
function chain(
  src: AudioNode,
  ...nodes: AudioNode[]
): AudioNode {
  let prev: AudioNode = src;
  for (const n of nodes) {
    prev.connect(n);
    prev = n;
  }
  return prev;
}

// ─────────────────────────────────────────────────────────────────────────────
// Music Engine — layered pads, drones, shimmer
// ─────────────────────────────────────────────────────────────────────────────

interface MusicEngine {
  masterGain: GainNode;
  stop: (fadeSecs?: number) => void;
  setMasterVolume: (vol: number, rampSecs?: number) => void;
}

function createMusicEngine(ctx: BaseAudioContext): MusicEngine {
  const t = ctx.currentTime;

  // ── Master bus ──────────────────────────────────────────────────────────
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, t);
  masterGain.connect(ctx.destination);

  // ── Delay / Reverb bus ──────────────────────────────────────────────────
  const delay = ctx.createDelay(3);
  delay.delayTime.value = 2.2;
  const delayFb = ctx.createGain();
  delayFb.gain.value = 0.38;
  const delayOut = ctx.createGain();
  delayOut.gain.value = 0.22;
  delay.connect(delayFb);
  delayFb.connect(delay);
  delay.connect(delayOut);
  delayOut.connect(masterGain);

  // Main output path (dry)
  const dryGain = ctx.createGain();
  dryGain.gain.value = 0.78;
  dryGain.connect(masterGain);

  // ── Global low-pass — keeps everything warm and dark ───────────────────
  const globalLP = ctx.createBiquadFilter();
  globalLP.type = "lowpass";
  globalLP.frequency.value = 1200;
  globalLP.Q.value = 0.4;
  globalLP.connect(dryGain);
  globalLP.connect(delay);

  // Breathing LFO on the LP cutoff (very slow — 12-second cycle)
  const breathLFO = ctx.createOscillator();
  breathLFO.type = "sine";
  breathLFO.frequency.value = 1 / 12;
  const breathLFOGain = ctx.createGain();
  breathLFOGain.gain.value = 200;
  breathLFO.connect(breathLFOGain);
  breathLFOGain.connect(globalLP.frequency);
  breathLFO.start();

  // ── LAYER 1: Deep space bass drone ─────────────────────────────────────
  // Very low sine fundamentals — felt more than heard, like a spacecraft hull
  const bassGain = ctx.createGain();
  bassGain.gain.value = 0.55;
  bassGain.connect(globalLP);

  const bassFreqs = [27.5, 41.2, 55.0]; // A0, E1, A1
  const bassOscs = bassFreqs.map((freq, i) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = freq;
    o.detune.value = i * 2 - 2; // very slight chorus
    const g = ctx.createGain();
    g.gain.value = i === 0 ? 0.5 : i === 1 ? 0.3 : 0.2;
    o.connect(g);
    g.connect(bassGain);
    o.start();
    return o;
  });

  // Slow bass pitch drift (like a spacecraft Doppler shift)
  const bassDriftLFO = ctx.createOscillator();
  bassDriftLFO.type = "sine";
  bassDriftLFO.frequency.value = 1 / 30; // 30-second cycle
  const bassDriftGain = ctx.createGain();
  bassDriftGain.gain.value = 3; // ±3 cents drift
  bassDriftLFO.connect(bassDriftGain);
  bassOscs.forEach((o) => bassDriftGain.connect(o.detune));
  bassDriftLFO.start();

  // ── LAYER 2: Cinematic mid pads ────────────────────────────────────────
  // Am chord voicing — Am7/9 open spacing (Interstellar feel)
  const padGain = ctx.createGain();
  padGain.gain.value = 0.35;
  padGain.connect(globalLP);

  const padNotes = [
    { freq: 110.0, detune: 0,  gain: 0.50 }, // A2
    { freq: 130.8, detune: +4, gain: 0.35 }, // C3
    { freq: 164.8, detune: -3, gain: 0.35 }, // E3
    { freq: 196.0, detune: +2, gain: 0.25 }, // G3
    { freq: 220.0, detune: -5, gain: 0.20 }, // A3
    { freq: 246.9, detune: +3, gain: 0.12 }, // B3 (9th — adds wonder)
  ];

  const padOscs = padNotes.map(({ freq, detune, gain: gv }) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = freq;
    o.detune.value = detune;
    const g = ctx.createGain();
    g.gain.value = gv;
    o.connect(g);
    g.connect(padGain);
    o.start();
    return o;
  });

  // Tremolo on pads — very slow (0.06 Hz = once every 16 sec) for a floating feel
  const padTremLFO = ctx.createOscillator();
  padTremLFO.type = "sine";
  padTremLFO.frequency.value = 0.06;
  const padTremGain = ctx.createGain();
  padTremGain.gain.value = 0.06;
  padTremLFO.connect(padTremGain);
  padTremGain.connect(padGain.gain);
  padTremLFO.start();

  // ── LAYER 3: High shimmer texture ──────────────────────────────────────
  // Very high, quiet overtones filtered through a resonant BP — like distant stars
  const shimmerGain = ctx.createGain();
  shimmerGain.gain.value = 0.08;
  shimmerGain.connect(globalLP);

  const shimmerBP = ctx.createBiquadFilter();
  shimmerBP.type = "bandpass";
  shimmerBP.frequency.value = 2800;
  shimmerBP.Q.value = 3.5;
  shimmerBP.connect(shimmerGain);

  const shimmerNoise = ctx.createBufferSource();
  shimmerNoise.buffer = noiseBuffer(ctx, 4);
  shimmerNoise.loop = true;
  shimmerNoise.connect(shimmerBP);
  shimmerNoise.start();

  // Very slow shimmer sweep
  const shimmerLFO = ctx.createOscillator();
  shimmerLFO.type = "sine";
  shimmerLFO.frequency.value = 0.04;
  const shimmerLFOGain = ctx.createGain();
  shimmerLFOGain.gain.value = 600;
  shimmerLFO.connect(shimmerLFOGain);
  shimmerLFOGain.connect(shimmerBP.frequency);
  shimmerLFO.start();

  // ── LAYER 4: Orchestral "pad-string" texture ───────────────────────────
  // Detuned pairs to emulate string ensemble warmth
  const stringGain = ctx.createGain();
  stringGain.gain.value = 0.18;
  stringGain.connect(globalLP);

  const stringLP = ctx.createBiquadFilter();
  stringLP.type = "lowpass";
  stringLP.frequency.value = 600;
  stringLP.Q.value = 0.8;
  stringLP.connect(stringGain);

  const stringNotes = [220.0, 261.6, 329.6]; // A3, C4, E4
  const stringOscs: OscillatorNode[] = [];
  for (const freq of stringNotes) {
    for (const detuneOffset of [-8, +8]) {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = freq;
      o.detune.value = detuneOffset;
      const g = ctx.createGain();
      g.gain.value = 0.06;
      o.connect(g);
      g.connect(stringLP);
      o.start();
      stringOscs.push(o);
    }
  }

  // All running nodes for teardown
  const allOscs = [
    ...bassOscs,
    ...padOscs,
    ...padTremLFO ? [padTremLFO] : [],
    ...breathLFO ? [breathLFO] : [],
    bassDriftLFO,
    shimmerLFO,
    ...stringOscs,
  ];

  const setMasterVolume = (vol: number, rampSecs = 3) => {
    const now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(vol, now + rampSecs);
  };

  const stop = (fadeSecs = 2.5) => {
    try {
      const now = ctx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(masterGain.gain.value, now);
      masterGain.gain.linearRampToValueAtTime(0, now + fadeSecs);
      allOscs.forEach((o) => {
        try { o.stop(now + fadeSecs + 0.1); } catch { /* already stopped */ }
      });
      shimmerNoise.stop(now + fadeSecs + 0.1);
    } catch { /* context closed */ }
  };

  // Fade in
  masterGain.gain.linearRampToValueAtTime(0.7, t + 4); // target ~28% master

  return { masterGain, stop, setMasterVolume };
}

// ─────────────────────────────────────────────────────────────────────────────
// Ambient Event Scheduler — satellite beeps, radio static, deep rumbles
// ─────────────────────────────────────────────────────────────────────────────

interface AmbientScheduler {
  stop: () => void;
}

function createAmbientScheduler(ctx: BaseAudioContext): AmbientScheduler {
  let running = true;
  const handles: ReturnType<typeof setTimeout>[] = [];

  const schedule = (fn: () => void, minMs: number, maxMs: number) => {
    const delay = minMs + Math.random() * (maxMs - minMs);
    const h = setTimeout(() => {
      if (!running) return;
      fn();
      schedule(fn, minMs, maxMs); // reschedule
    }, delay);
    handles.push(h);
  };

  // ── Satellite beep ───────────────────────────────────────────────────
  const satelliteBeep = () => {
    const t = ctx.currentTime;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(0.1, t + 0.01);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    out.connect(ctx.destination);

    const freq = 1200 + Math.random() * 800;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = freq;
    const count = 1 + Math.floor(Math.random() * 3); // 1–3 beeps
    for (let i = 0; i < count; i++) {
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0, t + i * 0.3);
      g2.gain.linearRampToValueAtTime(0.1, t + i * 0.3 + 0.01);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.3 + 0.18);
      g2.connect(ctx.destination);
      const o2 = ctx.createOscillator();
      o2.type = "sine";
      o2.frequency.value = freq + i * 120;
      o2.connect(g2);
      o2.start(t + i * 0.3);
      o2.stop(t + i * 0.3 + 0.2);
    }
    o.connect(out);
    o.start(t);
    o.stop(t + 0.5);
  };

  // ── Radio static burst ───────────────────────────────────────────────
  const radioStatic = () => {
    const t = ctx.currentTime;
    const dur = 0.3 + Math.random() * 0.6;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer(ctx, dur + 0.1);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1800 + Math.random() * 1200;
    bp.Q.value = 8;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(0.03, t + 0.02);
    out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    chain(noise, bp, out, ctx.destination);
    noise.start(t);
    noise.stop(t + dur + 0.1);
  };

  // ── Deep atmospheric rumble ──────────────────────────────────────────
  const deepRumble = () => {
    const t = ctx.currentTime;
    const dur = 4 + Math.random() * 4;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = 18 + Math.random() * 14; // 18–32 Hz sub-bass
    const out = ctx.createGain();
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(0.2, t + dur * 0.2);
    out.gain.linearRampToValueAtTime(0.2, t + dur * 0.7);
    out.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(out);
    out.connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.1);
  };

  // ── Distant signal pulse ──────────────────────────────────────────────
  const signalPulse = () => {
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = 440 + Math.random() * 220;
    o.detune.value = (Math.random() - 0.5) * 20;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(0.05, t + 0.15);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 800;
    chain(o, lp, out, ctx.destination);
    o.start(t);
    o.stop(t + 2);
  };

  // Schedule everything with randomised intervals
  schedule(satelliteBeep, 12_000, 35_000);  // every 12–35 seconds
  schedule(radioStatic,   20_000, 60_000);  // every 20–60 seconds
  schedule(deepRumble,    30_000, 90_000);  // every 30–90 seconds
  schedule(signalPulse,   15_000, 45_000);  // every 15–45 seconds

  return {
    stop: () => {
      running = false;
      handles.forEach(clearTimeout);
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AudioProvider
// ─────────────────────────────────────────────────────────────────────────────

export function AudioProvider({ children }: { children: ReactNode }) {
  // Session persistence — remember user preference; default is ON (not muted)
  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = sessionStorage.getItem("coc3-audio-muted");
    return saved === null ? false : saved === "true";
  });
  const [unlocked, setUnlocked] = useState(false);

  const acRef = useRef<AudioContext | null>(null);
  const engineRef = useRef<MusicEngine | null>(null);
  const ambientRef = useRef<AmbientScheduler | null>(null);

  // ── Get / create AudioContext ──────────────────────────────────────────
  const getAudioCtx = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!acRef.current) {
      const AC = getAC();
      if (!AC) return null;
      acRef.current = new AC();
    }
    if (acRef.current.state === "suspended") void acRef.current.resume();
    return acRef.current;
  }, []);

  // ── Unlock on first user gesture ──────────────────────────────────────
  useEffect(() => {
    if (unlocked) return;
    const unlock = () => {
      setUnlocked(true);
      getAudioCtx();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [unlocked, getAudioCtx]);

  // ── Persist mute preference ────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("coc3-audio-muted", String(muted));
    }
  }, [muted]);

  // ── Start / stop music engine ──────────────────────────────────────────
  useEffect(() => {
    if (!unlocked || muted) {
      // Stop music
      engineRef.current?.stop(2.5);
      engineRef.current = null;
      ambientRef.current?.stop();
      ambientRef.current = null;
      return;
    }

    const ctx = getAudioCtx();
    if (!ctx) return;

    // Start music engine
    engineRef.current = createMusicEngine(ctx);
    ambientRef.current = createAmbientScheduler(ctx);

    return () => {
      engineRef.current?.stop(1.5);
      engineRef.current = null;
      ambientRef.current?.stop();
      ambientRef.current = null;
    };
  }, [muted, unlocked, getAudioCtx]);

  // ── Pause on tab hidden, resume on tab visible ─────────────────────────
  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibility = () => {
      const ctx = acRef.current;
      if (!ctx) return;
      if (document.hidden) {
        void ctx.suspend();
      } else if (!muted && unlocked) {
        void ctx.resume();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [muted, unlocked]);

  // ── UI sound cues ─────────────────────────────────────────────────────
  const play = useCallback(
    (cue: Cue) => {
      if (muted) return;
      const ctx = getAudioCtx();
      if (!ctx) return;
      const t = ctx.currentTime;

      const out = ctx.createGain();
      out.connect(ctx.destination);

      switch (cue) {
        // Tiny futuristic tick on hover
        case "hover": {
          out.gain.setValueAtTime(0, t);
          out.gain.linearRampToValueAtTime(0.15, t + 0.005);
          out.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
          const o = ctx.createOscillator();
          o.type = "sine";
          o.frequency.setValueAtTime(2200, t);
          o.frequency.exponentialRampToValueAtTime(1800, t + 0.05);
          o.connect(out);
          o.start(t);
          o.stop(t + 0.07);
          break;
        }

        // Soft energy pulse on click
        case "click": {
          out.gain.setValueAtTime(0, t);
          out.gain.linearRampToValueAtTime(0.25, t + 0.008);
          out.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
          const o = ctx.createOscillator();
          o.type = "sine";
          o.frequency.setValueAtTime(880, t);
          o.frequency.exponentialRampToValueAtTime(440, t + 0.15);
          const lp = ctx.createBiquadFilter();
          lp.type = "lowpass";
          lp.frequency.value = 1800;
          chain(o, lp, out);
          o.start(t);
          o.stop(t + 0.2);
          break;
        }

        // Section / page whoosh
        case "whoosh":
        case "page": {
          const dur = cue === "whoosh" ? 0.65 : 0.35;
          const noise = ctx.createBufferSource();
          noise.buffer = noiseBuffer(ctx, dur);
          const bp = ctx.createBiquadFilter();
          bp.type = "bandpass";
          bp.Q.value = 1.2;
          bp.frequency.setValueAtTime(300, t);
          bp.frequency.exponentialRampToValueAtTime(2400, t + dur * 0.6);
          bp.frequency.exponentialRampToValueAtTime(500, t + dur);
          out.gain.setValueAtTime(0.0001, t);
          out.gain.exponentialRampToValueAtTime(cue === "whoosh" ? 0.50 : 0.30, t + dur * 0.35);
          out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          chain(noise, bp, out);
          noise.start(t);
          break;
        }

        // Registration / launch ignition
        case "launch": {
          // Low rumble build + high pitch chirp
          const rumble = ctx.createOscillator();
          rumble.type = "sine";
          rumble.frequency.setValueAtTime(60, t);
          rumble.frequency.exponentialRampToValueAtTime(120, t + 0.5);
          const rg = ctx.createGain();
          rg.gain.setValueAtTime(0, t);
          rg.gain.linearRampToValueAtTime(0.75, t + 0.1);
          rg.gain.linearRampToValueAtTime(0.75, t + 0.4);
          rg.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
          chain(rumble, rg, ctx.destination);
          rumble.start(t);
          rumble.stop(t + 1);

          const chirp = ctx.createOscillator();
          chirp.type = "sine";
          chirp.frequency.setValueAtTime(440, t + 0.3);
          chirp.frequency.exponentialRampToValueAtTime(1760, t + 0.7);
          const cg = ctx.createGain();
          cg.gain.setValueAtTime(0, t + 0.3);
          cg.gain.linearRampToValueAtTime(0.45, t + 0.35);
          cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
          chain(chirp, cg, ctx.destination);
          chirp.start(t + 0.3);
          chirp.stop(t + 0.85);
          break;
        }

        // Cinematic impact (countdown / vault open)
        case "impact":
        case "unlock": {
          // Sub-bass thud
          const thud = ctx.createOscillator();
          thud.type = "sine";
          thud.frequency.setValueAtTime(cue === "unlock" ? 180 : 120, t);
          thud.frequency.exponentialRampToValueAtTime(28, t + 0.6);
          const tg = ctx.createGain();
          tg.gain.setValueAtTime(1, t);
          tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
          chain(thud, tg, ctx.destination);
          thud.start(t);
          thud.stop(t + 0.8);

          // Noise crack
          const crack = ctx.createBufferSource();
          crack.buffer = noiseBuffer(ctx, 0.3);
          const crackLP = ctx.createBiquadFilter();
          crackLP.type = "lowpass";
          crackLP.frequency.value = 600;
          const crackGain = ctx.createGain();
          crackGain.gain.setValueAtTime(1, t);
          crackGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
          chain(crack, crackLP, crackGain, ctx.destination);
          crack.start(t);

          if (cue === "unlock") {
            // Rising chime arpeggio (A4, C#5, E5, A5)
            [880, 1108.7, 1318.5, 1760].forEach((freq, i) => {
              const o = ctx.createOscillator();
              o.type = "sine";
              o.frequency.value = freq;
              const g = ctx.createGain();
              g.gain.setValueAtTime(0, t + i * 0.1);
              g.gain.linearRampToValueAtTime(0.35, t + i * 0.1 + 0.02);
              g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.1 + 1.2);
              chain(o, g, ctx.destination);
              o.start(t + i * 0.1);
              o.stop(t + i * 0.1 + 1.3);
            });
          }
          break;
        }

        // Premium cinematic decrypt — soft AI processing instead of harsh beeps
        case "decrypt": {
          const o1 = ctx.createOscillator();
          o1.type = "sine";
          o1.frequency.setValueAtTime(600, t);
          o1.frequency.linearRampToValueAtTime(1400, t + 1.2);
          
          const o2 = ctx.createOscillator();
          o2.type = "triangle";
          o2.frequency.setValueAtTime(800, t);
          o2.frequency.linearRampToValueAtTime(1800, t + 1.2);
          
          const lfo = ctx.createOscillator();
          lfo.type = "sine";
          lfo.frequency.value = 18; // rapid scanning wobble
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 400;
          lfo.connect(lfoGain).connect(o1.frequency);
          lfo.connect(lfoGain).connect(o2.frequency);
          lfo.start(t);
          
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.125, t + 0.1);
          g.gain.linearRampToValueAtTime(0.125, t + 1.0);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
          
          const lp = ctx.createBiquadFilter();
          lp.type = "lowpass";
          lp.frequency.value = 2400;
          
          o1.connect(lp);
          o2.connect(lp);
          lp.connect(g).connect(ctx.destination);
          
          o1.start(t);
          o2.start(t);
          o1.stop(t + 1.35);
          o2.stop(t + 1.35);
          lfo.stop(t + 1.35);
          break;
        }

        // ── HOLOGRAPHIC REVEAL SEQUENCE ──
        
        // 0ms: Initial soft plasma pulse from planet
        case "holo_start": {
          const o = ctx.createOscillator();
          o.type = "sine";
          o.frequency.setValueAtTime(300, t);
          o.frequency.exponentialRampToValueAtTime(800, t + 0.1);
          
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.2, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
          
          o.connect(g).connect(ctx.destination);
          o.start(t);
          o.stop(t + 0.25);
          break;
        }
        
        // 150ms-600ms: Frame drawing digital sweep / resonance
        case "holo_sweep": {
          const noise = ctx.createBufferSource();
          noise.buffer = noiseBuffer(ctx, 0.4);
          
          const bp = ctx.createBiquadFilter();
          bp.type = "bandpass";
          bp.Q.value = 6;
          bp.frequency.setValueAtTime(400, t);
          bp.frequency.exponentialRampToValueAtTime(2800, t + 0.35);
          
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.075, t + 0.1);
          g.gain.linearRampToValueAtTime(0.075, t + 0.3);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
          
          chain(noise, bp, g, ctx.destination);
          noise.start(t);
          break;
        }
        
        // 1000ms: Beautiful Apple/NASA confirmation chime
        case "holo_chime": {
          // Major 9th chord arpeggiated very fast (C5, G5, D6)
          const freqs = [523.25, 783.99, 1174.66];
          freqs.forEach((freq, i) => {
            const o = ctx.createOscillator();
            o.type = "sine";
            o.frequency.value = freq;
            
            const g = ctx.createGain();
            const delay = i * 0.04;
            g.gain.setValueAtTime(0, t + delay);
            g.gain.linearRampToValueAtTime(0.1, t + delay + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.8);
            
            o.connect(g).connect(ctx.destination);
            o.start(t + delay);
            o.stop(t + delay + 0.9);
          });
          break;
        }
        
        // Hover out: Soft energy fade out
        case "holo_exit": {
          const o = ctx.createOscillator();
          o.type = "sine";
          o.frequency.setValueAtTime(800, t);
          o.frequency.exponentialRampToValueAtTime(200, t + 0.2);
          
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.075, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
          
          o.connect(g).connect(ctx.destination);
          o.start(t);
          o.stop(t + 0.3);
          break;
        }

        // Blip / shutter
        case "blip":
        case "shutter": {
          const o = ctx.createOscillator();
          o.type = cue === "shutter" ? "square" : "sine";
          const base = cue === "shutter" ? 1400 : 880;
          o.frequency.setValueAtTime(base, t);
          o.frequency.exponentialRampToValueAtTime(base * (cue === "shutter" ? 0.45 : 1.55), t + 0.09);
          out.gain.setValueAtTime(0.0001, t);
          out.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
          out.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
          o.connect(out);
          o.start(t);
          o.stop(t + 0.16);
          break;
        }
      }
    },
    [muted, getAudioCtx],
  );

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  const value = useMemo(
    () => ({ muted, toggleMute, play, unlocked }),
    [muted, toggleMute, play, unlocked],
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}