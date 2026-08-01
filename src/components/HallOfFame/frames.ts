/**
 * Placeholder frame templates drawn procedurally on canvas so the booth works
 * before final art lands.
 * TODO: replace with real PNG frame art (transparent cutout) in public/frames/.
 */
export type Frame = {
  id: string;
  name: string;
  accent: string;
  secondary: string;
  /** Cutout rect as fractions of the 1080x1080 canvas. */
  cutout: { x: number; y: number; w: number; h: number };
  caption: string;
};

export const FRAMES: Frame[] = [
  {
    id: "launch",
    name: "Launch Pad",
    accent: "#22D3EE",
    secondary: "#7C3AED",
    cutout: { x: 0.08, y: 0.08, w: 0.84, h: 0.66 },
    caption: "I'M HACKING AT CLASH OF CODERS 3.0",
  },
  {
    id: "orbit",
    name: "Orbit",
    accent: "#A855F7",
    secondary: "#22D3EE",
    cutout: { x: 0.1, y: 0.14, w: 0.8, h: 0.62 },
    caption: "22–23 AUGUST 2026 · JAIPUR",
  },
  {
    id: "mission",
    name: "Mission Badge",
    accent: "#F5C244",
    secondary: "#7C3AED",
    cutout: { x: 0.12, y: 0.1, w: 0.76, h: 0.6 },
    caption: "24 HOURS. ONE SHOT.",
  },
];

export const CANVAS_SIZE = 1080;

/** Draws the frame overlay (everything outside the cutout) onto the canvas. */
export function drawFrame(ctx: CanvasRenderingContext2D, frame: Frame) {
  const S = CANVAS_SIZE;
  const c = frame.cutout;
  const cx = c.x * S;
  const cy = c.y * S;
  const cw = c.w * S;
  const ch = c.h * S;

  // Space backdrop outside the cutout
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, S, S);
  ctx.rect(cx, cy, cw, ch);
  ctx.clip("evenodd");
  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, "#05060F");
  g.addColorStop(1, "#0B0F22");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  const glow = ctx.createRadialGradient(S * 0.8, S * 0.9, 0, S * 0.8, S * 0.9, S * 0.7);
  glow.addColorStop(0, `${frame.secondary}66`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, S, S);
  ctx.restore();

  // Glowing cutout border
  ctx.save();
  ctx.strokeStyle = frame.accent;
  ctx.lineWidth = 6;
  ctx.shadowColor = frame.accent;
  ctx.shadowBlur = 30;
  ctx.strokeRect(cx, cy, cw, ch);
  ctx.restore();

  // Lockup
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#E9E9F2";
  ctx.font = `bold ${S * 0.062}px "Space Grotesk", sans-serif`;
  ctx.shadowColor = frame.secondary;
  ctx.shadowBlur = 24;
  ctx.fillText("CLASH OF CODERS 3.0", S / 2, S * 0.855);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = frame.accent;
  ctx.font = `600 ${S * 0.026}px "Inter", sans-serif`;
  ctx.fillText(frame.caption, S / 2, S * 0.905);

  ctx.fillStyle = "#9aa0b5";
  ctx.font = `500 ${S * 0.022}px "Inter", sans-serif`;
  ctx.fillText("HACKER'S UNITY × JECRC FOUNDATION", S / 2, S * 0.95);
}