import { useEffect, useRef } from "react";
import { useReducedMotion, useIsTouch } from "@/hooks/use-prefs";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  life: number;
  color: string;
  size: number;
};

export function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const touch = useIsTouch();

  useEffect(() => {
    if (reduced || touch) return;

    const canvas = canvasRef.current;
    const ring = cursorRef.current;
    if (!canvas || !ring) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", onResize);

    const m = { x: w / 2, y: h / 2, tx: w / 2, ty: h / 2, active: false };
    const ringPos = { x: w / 2, y: h / 2 };

    const particles: Particle[] = [];
    const maxParticles = 60;
    const colors = [
      "rgba(201, 79, 205, 1)", // purple
      "rgba(79, 201, 205, 1)", // cyan
      "rgba(138, 43, 226, 1)", // violet
    ];

    const addParticle = (x: number, y: number) => {
      if (particles.length >= maxParticles) return;
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 - 0.5,
        alpha: 1.0,
        life: 0.02 + Math.random() * 0.03,
        color: colors[Math.floor(Math.random() * colors.length)]!,
        size: 2.0 + Math.random() * 3.5,
      });
    };

    let targetSnapping: HTMLElement | null = null;

    const onPointerMove = (e: PointerEvent) => {
      m.active = true;
      m.tx = e.clientX;
      m.ty = e.clientY;

      const target = e.target as HTMLElement;
      if (!target || typeof target.closest !== 'function') {
        targetSnapping = null;
        return;
      }
      const interactive = target.closest("button, a, [role='button'], .magnetic-target");
      if (interactive) {
        targetSnapping = interactive as HTMLElement;
      } else {
        targetSnapping = null;
      }
    };

    let clicked = false;
    const onClick = (e: MouseEvent) => {
      clicked = true;
      setTimeout(() => {
        clicked = false;
      }, 150);

      // Spawn click burst particles
      for (let i = 0; i < 15; i++) {
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          alpha: 1.0,
          life: 0.04 + Math.random() * 0.06,
          color: "rgba(255, 255, 255, 1)", // Bright white burst
          size: 2 + Math.random() * 4,
        });
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("mousedown", onClick);

    let raf = 0;
    const update = () => {
      const easing = 0.18;
      m.x += (m.tx - m.x) * easing;
      m.y += (m.ty - m.y) * easing;

      if (targetSnapping) {
        const rect = targetSnapping.getBoundingClientRect();
        const tx = rect.left + rect.width / 2;
        const ty = rect.top + rect.height / 2;
        ringPos.x += (tx - ringPos.x) * 0.22;
        ringPos.y += (ty - ringPos.y) * 0.22;
        ring.classList.add("cursor-hover");
      } else {
        ringPos.x += (m.tx - ringPos.x) * 0.12;
        ringPos.y += (m.ty - ringPos.y) * 0.12;
        ring.classList.remove("cursor-hover");
      }

      const scale = clicked ? "scale(0.7)" : "scale(1)";
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) ${scale}`;

      if (m.active && Math.random() < 0.85) {
        addParticle(m.x, m.y);
      }

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "screen";

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.life;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        // Replace alpha
        const colorWithAlpha = p.color.replace(", 1)", `, ${p.alpha.toFixed(3)})`);
        ctx.fillStyle = colorWithAlpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(update);
    };

    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("mousedown", onClick);
    };
  }, [reduced, touch]);

  if (reduced || touch) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[100] h-full w-full"
        aria-hidden
      />
      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[999] flex h-5 w-5 items-center justify-center rounded-full border-2 border-accent/70 bg-accent/10 transition-all duration-150 ease-out"
        style={{
          boxShadow: "0 0 15px rgba(79, 201, 205, 0.6)",
          willChange: "transform",
        }}
        aria-hidden
      >
        <div className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,1)]" />
      </div>
      <style>{`
        @media (min-width: 768px) and (hover: hover) {
          body, a, button, select, input, [role="button"] {
            cursor: none !important;
          }
        }
        .cursor-hover {
          width: 2.8rem !important;
          height: 2.8rem !important;
          border-color: rgba(138, 43, 226, 0.9) !important;
          border-width: 2px !important;
          background-color: rgba(138, 43, 226, 0.15) !important;
          box-shadow: 0 0 25px rgba(138, 43, 226, 0.6) !important;
        }
        .cursor-hover > div {
          transform: scale(0);
          opacity: 0;
          transition: all 0.2s;
        }
      `}</style>
    </>
  );
}
