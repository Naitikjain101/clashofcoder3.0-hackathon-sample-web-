import { useCallback, useEffect, useRef, useState } from "react";
import { CANVAS_SIZE, drawFrame, type Frame } from "./frames";
import { useAudio } from "@/lib/audio";

type Transform = { x: number; y: number; scale: number };

/** Client-side only compositing — the photo never leaves the device. */
export function CanvasComposer({
  frame,
  image,
  onExport,
}: {
  frame: Frame;
  image: HTMLImageElement | null;
  onExport: (blob: Blob) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [t, setT] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const pinch = useRef<{ dist: number; scale: number } | null>(null);
  const points = useRef(new Map<number, { x: number; y: number }>());
  const { play } = useAudio();

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const S = CANVAS_SIZE;
    ctx.clearRect(0, 0, S, S);
    ctx.fillStyle = "#05060F";
    ctx.fillRect(0, 0, S, S);

    const c = frame.cutout;
    const cx = c.x * S;
    const cy = c.y * S;
    const cw = c.w * S;
    const ch = c.h * S;

    if (image) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx, cy, cw, ch);
      ctx.clip();
      const cover = Math.max(cw / image.width, ch / image.height) * t.scale;
      const w = image.width * cover;
      const h = image.height * cover;
      ctx.drawImage(image, cx + (cw - w) / 2 + t.x, cy + (ch - h) / 2 + t.y, w, h);
      ctx.restore();
    } else {
      ctx.fillStyle = "#141a30";
      ctx.fillRect(cx, cy, cw, ch);
      ctx.fillStyle = "#6b7291";
      ctx.textAlign = "center";
      ctx.font = `500 ${S * 0.03}px "Inter", sans-serif`;
      ctx.fillText("Add a photo to begin", cx + cw / 2, cy + ch / 2);
    }

    drawFrame(ctx, frame);
  }, [frame, image, t]);

  useEffect(() => {
    render();
  }, [render]);

  useEffect(() => {
    setT({ x: 0, y: 0, scale: 1 });
  }, [image, frame]);

  const toCanvas = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * CANVAS_SIZE,
      y: ((e.clientY - r.top) / r.height) * CANVAS_SIZE,
    };
  };

  const onDown = (e: React.PointerEvent) => {
    if (!image) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = toCanvas(e);
    points.current.set(e.pointerId, p);
    if (points.current.size === 2) {
      const [a, b] = [...points.current.values()];
      if (a && b) pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale: t.scale };
    } else {
      drag.current = { id: e.pointerId, x: p.x, y: p.y };
    }
  };

  const onMove = (e: React.PointerEvent) => {
    if (!image || !points.current.has(e.pointerId)) return;
    const p = toCanvas(e);
    points.current.set(e.pointerId, p);

    if (points.current.size === 2 && pinch.current) {
      const [a, b] = [...points.current.values()];
      if (!a || !b) return;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const next = Math.min(4, Math.max(1, (pinch.current.scale * dist) / pinch.current.dist));
      setT((prev) => ({ ...prev, scale: next }));
      return;
    }
    if (drag.current && drag.current.id === e.pointerId) {
      const dx = p.x - drag.current.x;
      const dy = p.y - drag.current.y;
      drag.current = { id: e.pointerId, x: p.x, y: p.y };
      setT((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    }
  };

  const onUp = (e: React.PointerEvent) => {
    points.current.delete(e.pointerId);
    if (points.current.size < 2) pinch.current = null;
    if (drag.current?.id === e.pointerId) drag.current = null;
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      play("shutter");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "clash-of-coders-3.png";
      a.click();
      URL.revokeObjectURL(url);
      onExport(blob);
    }, "image/png");
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="aspect-square w-full touch-none rounded-3xl border border-border bg-space-800"
        aria-label="Hall of Fame preview — drag or pinch to reposition your photo"
      />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex flex-1 items-center gap-3 text-xs text-muted-foreground">
          Zoom
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={t.scale}
            disabled={!image}
            onChange={(e) => setT((prev) => ({ ...prev, scale: Number(e.target.value) }))}
            className="h-11 flex-1 accent-[oklch(0.79_0.14_205)]"
          />
        </label>
        <button
          type="button"
          onClick={download}
          disabled={!image}
          className="min-h-[48px] rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-40"
        >
          Download PNG
        </button>
      </div>
    </div>
  );
}