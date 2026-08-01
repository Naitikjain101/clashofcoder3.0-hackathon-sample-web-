import { useEffect, useState } from "react";
import { COUNTDOWN_TARGET_MODE, countdownTarget } from "@/lib/config";

const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

function diff(target: Date) {
  const ms = target.getTime() - Date.now();
  const clamped = Math.max(0, ms);
  return {
    done: ms <= 0,
    days: Math.floor(clamped / 86400000),
    hours: Math.floor((clamped / 3600000) % 24),
    minutes: Math.floor((clamped / 60000) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
  };
}

export function CountdownTimer() {
  // Start from a fixed zero state so SSR and hydration match, then tick.
  const [t, setT] = useState({ done: false, days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setT(diff(countdownTarget()));
    const id = setInterval(() => setT(diff(countdownTarget())), 1000);
    return () => clearInterval(id);
  }, []);

  const label =
    COUNTDOWN_TARGET_MODE === "registration"
      ? "Registrations close in"
      : "Launch sequence begins in";

  const cells = [
    { v: t.days, l: "Days" },
    { v: t.hours, l: "Hours" },
    { v: t.minutes, l: "Mins" },
    { v: t.seconds, l: "Secs" },
  ];

  return (
    <div className="w-full">
      <p className="font-display text-[0.65rem] uppercase tracking-[0.32em] text-muted-foreground">
        {mounted && t.done ? "We are live" : label}
      </p>
      <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
        {cells.map((c) => (
          <div
            key={c.l}
            className="glass rounded-2xl px-2 py-3 text-center sm:px-4 sm:py-4"
          >
            <div
              suppressHydrationWarning
              className="font-display text-2xl font-bold tabular-nums text-accent text-glow-energy sm:text-4xl"
            >
              {mounted ? pad(c.v) : "--"}
            </div>
            <div className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
              {c.l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}