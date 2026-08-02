# Clash of Coders 3.0 — Developer Guide

> A space-themed, scroll-driven hackathon website built with TanStack Start, React Three Fiber, and Tailwind CSS v4.

## Quick Start

```sh
# Install dependencies (uses Bun)
bun install

# Start local dev server
bun run dev

# Type-check only (no emit)
npx tsc --noEmit

# Production build
bun run build
```

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (SSR, file-based routing) |
| 3D / WebGL | [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://github.com/pmndrs/drei) |
| Animations | [Motion (Framer)](https://motion.dev) + [Lenis](https://lenis.darkroom.engineering) smooth scroll |
| Styling | Tailwind CSS v4 with OKLCH design tokens |
| Build | Vite 8 via `@lovable.dev/vite-tanstack-config` |
| Deploy | Netlify (see `netlify.toml`) |

## Project Structure

```
src/
├── components/
│   ├── space/            # WebGL + ambient visual layer
│   │   ├── SpaceScene.tsx      # Three.js canvas (Saturn, rings, black hole, warp tunnel)
│   │   ├── BlackHole.tsx       # Accretion disk particle system
│   │   ├── CinematicRings.tsx  # Saturn ring procedural texture + dust particles
│   │   ├── Nebula.tsx          # CSS radial gradient section backdrops
│   │   ├── Starfield.tsx       # Canvas 2D ambient star layer
│   │   ├── GlitchOverlay.tsx   # Randomised scan-line glitch effect
│   │   ├── Section.tsx         # Section wrapper + Reveal animation
│   │   ├── CustomCursor.tsx    # Magnetic custom cursor
│   │   └── MagneticButton.tsx  # CTA with magnetic pull effect
│   ├── Hero.tsx / CrashIntro.tsx / CountdownTimer.tsx
│   ├── About.tsx / Stats.tsx / Tracks.tsx / Timeline.tsx
│   ├── Prizes.tsx / Guests.tsx / Sponsors.tsx / FAQ.tsx
│   ├── MapEmbed.tsx / Footer.tsx / TopBar.tsx
│   └── HallOfFame/       # Photo-booth feature
├── hooks/
│   ├── use-lenis.ts      # Lenis smooth-scroll progress hook
│   └── use-prefs.ts      # useReducedMotion + useIsPhone
├── lib/
│   ├── config.ts         # All dates, links, stats, tracks — edit content here
│   ├── audio.ts          # Web Audio API context + sound effects
│   └── utils.ts          # cn() clsx helper
├── routes/
│   ├── __root.tsx        # HTML shell, meta tags, font preloads
│   └── index.tsx         # Page assembly
├── styles.css            # Design tokens (OKLCH palette, Tailwind theme)
└── server.ts             # SSR error handling wrapper
```

## Editing Content

All copy, dates, links, stats and tracks live in **[`src/lib/config.ts`](src/lib/config.ts)**. Changing content there never requires touching any component.

```ts
// Change countdown target
export const DATES = {
  hackathonStart: new Date("2026-08-22T09:00:00+05:30"),
  // ...
};

// Add/edit a track
export const TRACKS = [
  { name: "Artificial Intelligence", short: "AI", desc: "..." },
  // ...
];
```

## Key Design Decisions

### Readability over animation
The 3D WebGL scene is `fixed inset-0 -z-10` — it always shows through. All section text must remain readable:
- Every `<section>` sets `isolation: isolate` on its content wrapper so z-index stacking is local.
- Body text gets a universal `text-shadow` for dark-background lift.
- Nebula blobs use low opacity (≤ 0.20) so they don't fight copy.

### Performance budget
| Device | DPR | Particle budget |
|---|---|---|
| Desktop | up to 2.0 | Full (250k ring dust, 180k plasma) |
| Mobile | 0.75 – 1.25 | ~8% of desktop (PerformanceMonitor adaptive) |

- `premultipliedAlpha: false` on the WebGL context prevents alpha-bleed colour tinting on Mali/Adreno GPUs.
- `GlitchOverlay` uses only scan-lines + translate — no `hue-rotate` or blend modes that touch global hue.

### Cache strategy (Netlify)
- **HTML** → `no-cache, no-store` (always fresh on deploy)
- **`/assets/*`** → `max-age=31536000, immutable` (Vite content-hashes filenames)
- **Fonts/images** → short TTL with `stale-while-revalidate`

See [`netlify.toml`](netlify.toml) and [`public/_headers`](public/_headers).

## Git workflow

This repo is linked to **Lovable**. Keep the main branch in a working state at all times — never force-push or rebase already-pushed commits, as that rewrites history on Lovable's side.

```sh
# Safe commit flow
git add .
git commit -m "feat: describe your change"
git push origin main
```
