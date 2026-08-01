import { createFileRoute } from "@tanstack/react-router";
import { About } from "@/components/About";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { Guests } from "@/components/Guests";
import { HallOfFame } from "@/components/HallOfFame";
import { Hero } from "@/components/Hero";
import { MapEmbed } from "@/components/MapEmbed";
import { Prizes } from "@/components/Prizes";
import { Sponsors } from "@/components/Sponsors";
import { Stats } from "@/components/Stats";
import { Timeline } from "@/components/Timeline";
import { TopBar } from "@/components/TopBar";
import { Tracks } from "@/components/Tracks";
import { lazy, Suspense } from "react";
const Starfield = lazy(() => import("@/components/space/Starfield").then((m) => ({ default: m.Starfield })));
const SpaceScene = lazy(() => import("@/components/space/SpaceScene").then((m) => ({ default: m.SpaceScene })));
import { CustomCursor } from "@/components/space/CustomCursor";
import { GlitchOverlay } from "@/components/space/GlitchOverlay";
import { AudioProvider } from "@/lib/audio";
import { ReactLenis } from "lenis/react";

const TITLE = "Clash of Coders 3.0 — 24-Hour Hackathon, Jaipur";
const DESCRIPTION =
  "Clash of Coders 3.0: a 24-hour hackathon by Hacker's Unity × JECRC Foundation, 22–23 August 2026 in Jaipur. ₹2,00,000 prize pool, 10 tracks, 600+ hackers.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AudioProvider>
      <ReactLenis root>
        <div id="top" className="relative">
          <CustomCursor />
          <GlitchOverlay />
          <Suspense fallback={null}>
            <SpaceScene />
            <Starfield />
          </Suspense>
          <div className="grain-overlay" aria-hidden />
          <TopBar />
          <main>
            <Hero />
            <HallOfFame />
            <About />
            <Stats />
            <Tracks />
            <Timeline />
            <Prizes />
            <Guests />
            <Sponsors />
            <FAQ />
            <MapEmbed />
          </main>
          <Footer />
        </div>
      </ReactLenis>
    </AudioProvider>
  );
}
