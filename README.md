# Cosmic Coders Hub

Build Prompt: Clash of Coders 3.0 Website

Copy everything below into a coding agent (Claude Code, Cursor, v0, etc.) to scaffold and build the full site in one pass. Placeholders are marked [PLACEHOLDER] — swap in real assets/content later without needing to touch logic.

Project Brief

Build a space-themed, mobile-first, highly interactive marketing website for Clash of Coders 3.0, a 24-hour hackathon organized by Hacker's Unity × JECRC Foundation.

Dates: 22–23 August 2026

Venue: JECRC Foundation, Plot No. IS-2036 to IS-2039, Ramchandrapura Industrial Area, Vidhani, Sitapura Extension, Jaipur, Rajasthan 303905

Vibe: deep-space cinematic — think SpaceX launch-stream aesthetics crossed with a Tesla-style scroll-driven product page. Dark, glowing, kinetic, but performant on mobile.

Tech Stack

Framework: Next.js (App Router, React, TypeScript)

Styling: Tailwind CSS

Animation: Framer Motion — scroll-triggered parallax, the crash/explosion intro, micro-interactions, SVG stroke-draw for the timeline

Photo Booth: HTML5 Canvas API, 100% client-side compositing (no server upload)

Maps: Google Maps Embed API (no API key required for basic embed iframe)

Forms: stub an API route for FAQ/contact; registration links out to an external form (config-driven URL)

Audio: native <audio> elements / Web Audio API, all gated behind a global mute state and first user interaction

Hosting target: Vercel

Respect prefers-reduced-motion throughout — every animated feature needs a static fallback.

Design Direction — "Premium, Not Cluttered"

The bar is a site that feels like a big-budget space-mission product page (SpaceX / Apple-event energy), not a template with stars sprinkled on it. Two rules govern every decision:

Depth over decoration. Get richness from layered gradients, soft glow, subtle grain/noise, and real depth-of-field (blurred background layers vs. crisp foreground content) — not from piling on more moving elements. One well-executed glowing nebula backdrop beats five flat star PNGs.

Clean always wins on mobile. Never a single animation should cost visual clarity or a dropped frame on a mid-range phone. If an effect and legibility/performance conflict, legibility/performance wins — simplify the effect, don't cut corners on the phone experience.

Palette:

Base: near-black deep space navy (#05060F → #0B0F22 gradient range), not flat black — always a very subtle gradient or vignette so sections have depth.

Primary accent: violet/purple glow family (#7C3AED / #A855F7).

Secondary accent: one bright "energy" color used sparingly for emphasis only — CTAs, active states, countdown digits, prize amounts (e.g. an electric cyan or warm gold — [PLACEHOLDER — confirm cyan #22D3EEvs gold#F5C244]).

Neutral text: off-white / soft gray, never pure #FFFFFF on pure black (too harsh) — use #E9E9F2-ish tones for body copy.

[PLACEHOLDER — final hex values to be confirmed, structure above is locked]

Typography:

Display/heading face: geometric, technical, slightly futuristic (Space Grotesk, Orbitron, or similar) — used for headings and big numbers only, at generous size and letter-spacing for impact.

Body face: a clean, highly legible sans (Inter or similar) — this is what most users actually read, so prioritize readability over theme on body copy.

Strong type scale with real hierarchy: hero title huge, section headers clearly distinct from body, stat numbers oversized as hero moments in their own right.

Visual texture (the "superb" layer):

Soft glow/blur behind key elements (CTA buttons, section headers, stat numbers) using layered box-shadow/filter: blur()— cheap and high-impact.

Gradient "nebula" blobs (large, soft, low-opacity radial gradients) as section backdrops instead of literal star-field images everywhere — cheaper to render and reads as more premium than scattered dot-stars.

A subtle grain/noise overlay across the whole page ties every section together and stops flat gradients from looking cheap or banded.

Thin glowing line accents (orbit rings, trajectory paths, card borders) instead of heavy borders/boxes — space feels vast and clean, not boxed-in.

Glassmorphism (soft blurred translucent panels) for cards (guest/sponsor/track cards, FAQ items) instead of solid fills — keeps the starfield/nebula visible through the UI.

Generous negative space between sections; let the theme breathe rather than filling every inch.

Build this as a proper design token set in tailwind.config.ts (colors, font families, spacing, glow/blur shadow presets) rather than one-off inline styles, so the whole site stays visually consistent with minimal per-component tweaking.

Mobile-First Performance & Clean-UI Rules

This is a mobile-first build — most hackathon traffic will be on phones sharing a link, so mobile is the primary experience, not a scaled-down afterthought.

Design every section at 375–430px width first, then scale up to tablet/desktop — not the reverse.

Tiered effects, not disabled effects: on mobile, simplify (fewer particles, shorter blur radius, static gradient instead of animated one) rather than stripping the atmosphere entirely — the site should still feel "space," just lighter-weight.

Cap any particle/star count on mobile (e.g. ≤40–60 active elements) and lazy-load/pause off-screen animations (IntersectionObserver) so nothing runs unless it's in view.

Prefer CSS transforms/opacity (GPU-friendly) over animating layout properties; avoid large full-screen blur filters recalculating every frame on scroll.

Real content — event name, dates, CTA, key info — must be legible and tappable within the first viewport on mobile without waiting on any animation to finish.

Touch targets ≥44px, no hover-only affordances (every hover effect needs a tap/press equivalent on touch devices).

Test the "does this still look clean with the intro/animations skipped" case explicitly — the reduced-motion version should look like a deliberate, polished static design, not a broken animated one.

Global Interaction Rules

Global mute toggle, always visible (top corner), persists across the session (in-memory state, no localStorage in the artifact context — use real localStorage once this leaves the artifact environment).

No audio autoplays with sound; ambient loop only starts after first tap/scroll.

Magnetic-pull hover/press effect for primary CTAs (Register, Get Directions, Download Badge) — desktop only; on touch devices, use a satisfying press/scale-down state instead.

Cursor/touch-reactive starfield drift on desktop; on mobile, replace with a slow ambient drift (no touch-tracking, to avoid interfering with scroll) — same "alive" feeling, no jank risk.

Site Sections (build in this order)

1. Hero — Crash Intro + Countdown

One-time intro sequence (plays on first load, skippable, does not replay on scroll-back):

Page opens on a plain black starfield, nothing else visible.

A bright glowing trail — styled like a SpaceX launch arc, not a straight dash — streaks in and curves across the screen with an object at its head.

On impact: screen-shake + flash, expanding shockwave ring(s).

Trail and explosion fade out completely.

Hero content fades/scales in over the starfield: title "Clash of Coders 3.0", dates (22–23 August 2026), venue (JECRC Foundation, Jaipur), and the countdown timer.

A "Skip Intro" tap target is visible for the entire sequence.

Sound (see Section 5b below): whoosh on the streak, impact thud + rumble synced to the shake/flash, optional mission-control voice line with subtitles: "Transmission incoming... Clash of Coders 3.0, initiating."

Mobile note: keep the intro under ~2.5 seconds total on mobile — a fast, punchy trail-and-flash reads as premium; a long sequence reads as a loading screen. Skip Intro must be reachable/tappable within the first 300ms, not fade in late.

Countdown timer:

Driven by a single config value in lib/config.ts, e.g. COUNTDOWN_TARGET_MODE: "registration" | "hackathonStart".

registrationDeadline: [PLACEHOLDER — TBD, default to 15 August 2026, 23:59 IST]

hackathonStart: 22 August 2026, 09:00 IST

Switching modes should require changing only the config value, no component code changes.

On-scroll parallax (post-hero, applies site-wide): stars, planet, Saturn-ring graphic, and nebula haze move at different scroll speeds. Each major section gets its own celestial backdrop for variety (Tracks → asteroid field, Prizes → golden star cluster, Guests → constellation map, etc.) rather than reusing one background.

2. Hall of Fame — Photo Booth

Flow:

User picks one of 3–5 event frame templates.

User uploads a photo or captures one via device camera.

Live canvas preview composites the photo inside the frame's transparent cutout; user can drag/pinch/zoom to reposition.

User downloads the final PNG.

Share button pre-fills Twitter/X, Instagram Stories (via download), and WhatsApp with the image + event hashtag.

Build notes:

All compositing happens client-side on <canvas> — never upload the photo to a server.

Frame templates are PNGs with a transparent cutout region.

Support basic pinch/drag on mobile for repositioning.

Frame templates: [PLACEHOLDER — use 3 simple drafted placeholder frames until final art arrives].

Fire a small confetti/particle burst on successful download.

Scroll behavior: frame options slide in from the left; the canvas stage scales from 90% → 100% opacity as it enters view.

3. About

Get ready for Clash of Coders 3.0, a 24-hour hackathon organized by Hacker's Unity × JECRC Foundation. Bring your ideas to life, solve real-world problems, and collaborate with passionate innovators. Enjoy mentorship, networking, workshops, exciting prizes, swags, internship opportunities, and certificates while competing with the best minds.

Scroll behavior: text fades up line-by-line, staggered, as it enters the viewport.

4. Stats

StatValuePrize Pool₹2,00,000Top 3 TeamsUp to ₹50,000Participants600+Mentors15+Judges6+Tracks10+Duration24 hours

Scroll behavior: numbers count up from 0 to their final value as the section enters view.

5. Tracks

Artificial Intelligence (AI)

Web Development

Cybersecurity

Blockchain & Web3

Healthcare

FinTech

EdTech

Sustainability

Open Innovation

IoT & Robotics

One-line descriptions: [PLACEHOLDER — draft a plausible one-liner per track for now, e.g. "AI — Build intelligent systems that learn, predict, and adapt."]

Presentation: on desktop/tablet, the 10 tracks sit as small "planets" orbiting a central sun; tapping one expands it into a detail card. On mobile, default straight to a clean 2-column card grid with the same glow/glass card styling — the orbit metaphor gets cramped and hard to tap accurately at phone width, and a tidy grid reads as more premium there than a squeezed-in orbit.

Scroll behavior: orbit/grid items pop in with a slight stagger, like planets appearing one by one.

6. Timeline

Day 1 — 22 August Registration & Check-in → Opening Ceremony → Problem Statement Reveal → Team Networking → Hacking Begins → Mentor Sessions → Dinner → Overnight Coding

Day 2 — 23 August Breakfast → Project Submission → Judging → Lunch → Final Presentations → Closing Ceremony & Prize Distribution

Specific times: [PLACEHOLDER — draft reasonable times spanning 09:00 Day 1 to ~18:00 Day 2 for now]

Presentation: rendered as a "flight path" — a dotted trajectory line with each event as a waypoint the user scrolls past, with day tabs to switch between Day 1 / Day 2 (soft whoosh sound on tab switch).

Scroll behavior: the flight-path line draws itself via SVG stroke animation as the user scrolls through.

7. Prize Pool

Total Prize Pool: ₹2,00,000

Top 3 Teams: Up to ₹50,000

Track Prizes & Special Awards: TBA

Swags & Goodies

Internship Opportunities

Certificates for All Participants

Scroll behavior: prize amount scales/pulses in with a subtle glow flash.

8. Guests & Judges

Dr. Arjun Mehta — AI Research Lead

Priya Sharma — Senior Software Engineer

Rahul Verma — Startup Founder & CTO

Neha Kapoor — Cybersecurity Expert

Amit Singh — Keynote Speaker

Ananya Rao — Innovation Mentor

Headshots: [PLACEHOLDER — use neutral avatar/silhouette placeholders until real photos arrive]

Presentation: profile cards with subtle 3D tilt-on-hover (or gyroscope-based tilt on mobile).

Scroll behavior: cards tilt/fade in on a staggered delay.

9. Sponsors

TierSponsorTitle SponsorTechNovaGold SponsorCloudSphereSilver SponsorCodeCraftCommunity PartnerDevConnectCloud PartnerSkyComputeSwag PartnerSwagBox

Logos: [PLACEHOLDER — simple wordmark placeholders per tier until real logos arrive]. Same tilt-card treatment as Guests.

10. FAQs

Who can participate?

Is there a registration fee?

Can I participate individually?

What is the maximum team size?

Answers: [PLACEHOLDER — draft reasonable, generic hackathon-standard answers for now, e.g. open to all students, free registration, solo entries allowed, team size up to 4]

Presentation: simple accordion.

Scroll behavior: fade-up only, no extra motion — keep dense text sections calm.

11. Google Map

Embed JECRC Foundation's location (address above) via Google Maps Embed API iframe.

"Get Directions" button (magnetic hover) linking to Google Maps directions for the address.

Scroll behavior: map fades in.

12. Footer

Quick links to all sections.

Social links: [PLACEHOLDER — Instagram, LinkedIn, Discord/WhatsApp community — wire up config-driven URLs, empty/hash links until real handles arrive].

Contact info and credits (Hacker's Unity × JECRC Foundation).

Small persistent "mission clock" readout styled like a spacecraft dashboard — pure atmosphere, not functional data.

Scroll behavior: static, no animation — signals "end of page."

5b. Sound & Voice Design

Ambient loop: low cosmic hum/drone, starts only after first tap/scroll (browser autoplay policies block sound-on-load). Global mute toggle always visible, top corner.

Crash-intro sound: whoosh on streak-in, impact thud + rumble on collision, synced to screen-shake/flash.

Voice-over (optional/skippable): mission-control style line at the very start, with subtitles shown for accessibility.

Micro cues: soft blip on button taps, satisfying shutter sound on Hall of Fame capture/download, page-turn whoosh on Timeline day-tab switch.

All audio: gated by global mute state, never autoplays with sound, short compressed files (no streaming).

5c. Expanded Interactive Elements — Global Checklist

[ ] Scroll-scrubbed animation (e.g. a planet rotates or Saturn's ring tilts as the user scrolls, not just a fade trigger)

[ ] Cursor/touch-reactive starfield drift

[ ] Magnetic buttons on primary CTAs

[ ] Track selector as orbiting planets (with grid fallback)

[ ] Persistent mission-clock readout in footer/nav

[ ] Timeline as a flight path with waypoints

[ ] Tilt-on-hover guest/sponsor cards

[ ] Confetti/particle burst on Hall of Fame download

[ ] Full reduced-motion / low-end-device fallback for every item above

Folder Structure

clash-of-coders/
├── app/
│   ├── page.tsx                  # Home — assembles all sections
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Hero.tsx
│   ├── CountdownTimer.tsx
│   ├── HallOfFame/
│   │   ├── FrameSelector.tsx
│   │   ├── PhotoUploader.tsx
│   │   └── CanvasComposer.tsx
│   ├── About.tsx
│   ├── Stats.tsx
│   ├── Tracks.tsx
│   ├── Timeline.tsx
│   ├── Prizes.tsx
│   ├── Guests.tsx
│   ├── Sponsors.tsx
│   ├── FAQ.tsx
│   ├── MapEmbed.tsx
│   └── Footer.tsx
├── public/
│   ├── frames/                   # Hall of Fame templates
│   ├── images/                   # backgrounds, guest photos, sponsor logos
│   └── audio/                    # ambient loop, sfx, voice-over
└── lib/
    └── config.ts                 # dates, countdown target, links, palette tokens


Build Instructions

Scaffold the Next.js + TypeScript + Tailwind + Framer Motion project matching the folder structure above.

Implement lib/config.ts first — centralize all dates, the countdown mode flag, registration/social URLs, and color tokens so later content swaps never touch component logic.

Build section-by-section in the order listed above, using the placeholder content marked [PLACEHOLDER] — do not block on missing real assets.

Implement the crash-intro sequence and global audio/mute system early, since Hero depends on both.

Wire up scroll-triggered animations per the section-by-section behavior table, respecting prefers-reduced-motioneverywhere.

Ensure the whole page works and looks intentional on a small mobile viewport first, then scale up.

Leave clear // TODO: replace placeholder comments anywhere real content/assets are still needed (frame art, headshots, logos, exact times, FAQ answers, registration link, social handles, final palette).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a9dd54ac-32e7-4055-83ea-8e3a4a3be6e1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
