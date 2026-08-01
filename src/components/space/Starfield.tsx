import { useEffect, useRef } from "react";
import { useIsPhone, useReducedMotion } from "@/hooks/use-prefs";

/**
 * Fixed ambient starfield.
 * Desktop: pointer-reactive drift. Mobile: slow ambient drift only (never
 * touch-tracked, so it can't fight scrolling). Paused when the tab is hidden.
 */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);
  const phone = useIsPhone();
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const count = phone ? 50 : 130;
    let stars: { x: number; y: number; z: number; r: number }[] = [];

    const seed = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: 0.3 + Math.random() * 0.7,
        r: 0.4 + Math.random() * 1.3,
      }));
    };
    seed();
    window.addEventListener("resize", seed);

    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 26;
      ty = (e.clientY / window.innerHeight - 0.5) * 26;
    };
    if (!phone && !reduced) window.addEventListener("pointermove", onMove);

    let raf = 0;
    let t = 0;
    let running = true;
    const onVis = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVis);

    type Meteor = { x: number; y: number; vx: number; vy: number; length: number; alpha: number; life: number; color: string };
    let meteors: Meteor[] = [];
    let lastScroll = window.scrollY;

    const onScroll = () => {
      if (reduced) return;
      const scroll = window.scrollY;
      const delta = Math.abs(scroll - lastScroll);
      lastScroll = scroll;
      
      // If scrolling fast, trigger meteor shower
      if (delta > 15 && Math.random() < 0.25) {
        const colors = ["rgba(79, 201, 205, 0)", "rgba(138, 43, 226, 0)"]; // Cyan or Purple tail
        meteors.push({
          x: Math.random() * w,
          y: -50,
          vx: 15 + Math.random() * 15,
          vy: 15 + Math.random() * 15,
          length: 60 + Math.random() * 120,
          alpha: 1.0,
          life: 0.02 + Math.random() * 0.04,
          color: colors[Math.floor(Math.random() * colors.length)]!
        });
      }
    };
    window.addEventListener("scroll", onScroll);

    const draw = () => {
      if (!running) return;
      t += 0.0025;
      px += (tx - px) * 0.05;
      py += (ty - py) * 0.05;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const drift = reduced ? 0 : Math.sin(t + s.x * 0.01) * 1.6 * s.z;
        const x = s.x + px * s.z + drift;
        const y = s.y + py * s.z + (reduced ? 0 : Math.cos(t + s.y * 0.01) * s.z);
        const alpha = reduced ? 0.55 * s.z : (0.35 + 0.45 * Math.abs(Math.sin(t * 6 + s.x))) * s.z;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(233,233,242,${alpha.toFixed(3)})`;
        ctx.fill();
      }

      // Draw meteors
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i]!;
        m.x += m.vx;
        m.y += m.vy;
        m.alpha -= m.life;
        
        if (m.alpha <= 0) {
          meteors.splice(i, 1);
          continue;
        }
        
        const tailX = m.x - (m.vx / Math.abs(m.vx)) * m.length;
        const tailY = m.y - (m.vy / Math.abs(m.vy)) * m.length;
        
        const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
        grad.addColorStop(1, m.color);
        
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    if (reduced) {
      // Static fallback: paint one frame, no loop.
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(233,233,242,${(0.5 * s.z).toFixed(3)})`;
        ctx.fill();
      }
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", seed);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [phone, reduced]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}