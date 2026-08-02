/**
 * Navbar — Premium floating glass navigation with mobile Mission Control overlay.
 */
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SoundOrb } from "@/components/SoundOrb";
import { useAudio } from "@/lib/audio";
import { LINKS } from "@/lib/config";
import { useIsPhone } from "@/hooks/use-prefs";

// ─────────────────────────────────────────────────────────────────────────────
// Nav section definitions
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "hall-of-fame", label: "Hall of Fame" },
  { id: "about", label: "Mission" },
  { id: "tracks", label: "Tracks" },
  { id: "timeline", label: "Run of Show" },
  { id: "prizes", label: "Prizes" },
  { id: "sponsors", label: "Sponsors" },
  { id: "faq", label: "FAQs" },
  { id: "venue", label: "Venue" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Hook: track which section is in viewport
// ─────────────────────────────────────────────────────────────────────────────
function useActiveSection() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const ids = NAV_ITEMS.map((n) => n.id);
    const observers: IntersectionObserver[] = [];

    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) continue;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setActive(id);
          }
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return active;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook: detect if user has scrolled down
// ─────────────────────────────────────────────────────────────────────────────
function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}

// ─────────────────────────────────────────────────────────────────────────────
// Smooth scroll helper
// ─────────────────────────────────────────────────────────────────────────────
function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Desktop Nav Link with underline hover animation
// ─────────────────────────────────────────────────────────────────────────────
function NavLink({
  item,
  isActive,
  onHover,
}: {
  item: (typeof NAV_ITEMS)[0];
  isActive: boolean;
  onHover: () => void;
}) {
  return (
    <button
      onClick={() => scrollTo(item.id)}
      onMouseEnter={onHover}
      className="group relative px-1 py-1 text-[0.8rem] font-medium tracking-wide transition-colors duration-200"
      style={{ color: isActive ? "rgba(79,201,205,1)" : "rgba(255,255,255,0.7)" }}
    >
      {item.label}

      {/* Underline animation */}
      <span
        className="absolute -bottom-0.5 left-0 h-px transition-all duration-300 ease-out"
        style={{
          width: isActive ? "100%" : "0%",
          background: "linear-gradient(90deg, rgba(79,201,205,0.8), rgba(138,43,226,0.5))",
          boxShadow: isActive ? "0 0 6px rgba(79,201,205,0.5)" : "none",
        }}
      />

      {/* Hover underline */}
      <span
        className="absolute -bottom-0.5 left-0 h-px w-0 group-hover:w-full transition-all duration-300 ease-out"
        style={{
          background: "linear-gradient(90deg, rgba(79,201,205,0.4), rgba(138,43,226,0.3))",
          boxShadow: "0 0 4px rgba(79,201,205,0.3)",
        }}
      />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Mission Control Fullscreen Menu
// ─────────────────────────────────────────────────────────────────────────────
function MobileMenu({
  isOpen,
  onClose,
  activeSection,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
}) {
  const { play } = useAudio();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex flex-col"
          style={{
            background: "rgba(5, 6, 15, 0.92)",
            backdropFilter: "blur(30px) saturate(120%)",
          }}
        >
          {/* Animated star dots */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-pulse"
                style={{
                  width: `${1 + Math.random() * 2}px`,
                  height: `${1 + Math.random() * 2}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  background: "rgba(255,255,255,0.5)",
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
            {/* Tiny floating particles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`p-${i}`}
                className="absolute rounded-full"
                style={{
                  width: "3px",
                  height: "3px",
                  top: `${15 + Math.random() * 70}%`,
                  left: `${10 + Math.random() * 80}%`,
                  background: i % 2 === 0 ? "rgba(79,201,205,0.3)" : "rgba(138,43,226,0.3)",
                  animation: `float-particle ${4 + Math.random() * 4}s ease-in-out infinite alternate`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4">
            <span className="font-display text-sm font-bold tracking-[0.18em] text-white/90">
              CoC<span style={{ color: "rgba(79,201,205,1)" }}>3.0</span>
            </span>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              aria-label="Close menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/70">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Label */}
          <div className="px-6 mt-4 mb-6">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-white/30">
              Mission Control
            </p>
            <div className="mt-2 h-px w-12" style={{ background: "linear-gradient(90deg, rgba(79,201,205,0.5), transparent)" }} />
          </div>

          {/* Section links with staggered animation */}
          <nav className="flex-1 flex flex-col gap-1 px-4">
            {NAV_ITEMS.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06, type: "spring", damping: 20, stiffness: 200 }}
                onClick={() => {
                  play("click");
                  scrollTo(item.id);
                  onClose();
                }}
                className="flex items-center gap-4 px-4 py-4 rounded-xl transition-all text-left"
                style={{
                  background: activeSection === item.id ? "rgba(79,201,205,0.08)" : "transparent",
                  borderLeft: activeSection === item.id ? "2px solid rgba(79,201,205,0.6)" : "2px solid transparent",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                  style={{
                    background: activeSection === item.id ? "rgba(79,201,205,0.9)" : "rgba(255,255,255,0.2)",
                    boxShadow: activeSection === item.id ? "0 0 6px rgba(79,201,205,0.5)" : "none",
                  }}
                />
                <span
                  className="font-display text-lg font-medium tracking-wide"
                  style={{ color: activeSection === item.id ? "rgba(79,201,205,1)" : "rgba(255,255,255,0.7)" }}
                >
                  {item.label}
                </span>
              </motion.button>
            ))}
          </nav>

          {/* Register CTA at bottom */}
          <div className="px-6 pb-8 pt-4">
            <motion.a
              href={LINKS.register}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => play("launch")}
              className="flex items-center justify-center w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #4fc9cd, #00b4d8)",
                color: "#000",
                boxShadow: "0 0 24px rgba(79,201,205,0.35), 0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              Register Now
            </motion.a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Navbar Export
// ─────────────────────────────────────────────────────────────────────────────
export function Navbar() {
  const phone = useIsPhone();
  const scrolled = useScrolled();
  const activeSection = useActiveSection();
  const { play } = useAudio();
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <motion.nav
        initial={false}
        animate={{
          paddingTop: scrolled ? "0.5rem" : "0.75rem",
          paddingBottom: scrolled ? "0.5rem" : "0.75rem",
        }}
        transition={{ duration: 0.3 }}
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 sm:px-6"
        style={{
          background: scrolled
            ? "rgba(5, 6, 15, 0.7)"
            : "rgba(5, 6, 15, 0.3)",
          backdropFilter: scrolled ? "blur(20px) saturate(140%)" : "blur(8px)",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
          transition: "background 0.3s, backdrop-filter 0.3s, border-bottom 0.3s",
        }}
      >
        {/* Logo */}
        <a
          href="#top"
          className="font-display text-sm font-bold tracking-[0.18em] text-foreground/90"
          onMouseEnter={() => play("hover")}
        >
          CoC<span className="text-accent">3.0</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              item={item}
              isActive={activeSection === item.id}
              onHover={() => play("hover")}
            />
          ))}
        </div>

        {/* Right side: Register + Sound + Hamburger */}
        <div className="flex items-center gap-2">
          {/* Register button (desktop) */}
          <a
            href={LINKS.register}
            className="hidden min-h-[40px] items-center rounded-full px-5 text-xs font-bold tracking-wider uppercase sm:inline-flex transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #4fc9cd, #00b4d8)",
              color: "#000",
              boxShadow: "0 0 20px rgba(79,201,205,0.3), 0 2px 10px rgba(0,0,0,0.2)",
            }}
            onMouseEnter={() => play("hover")}
            onClick={() => play("launch")}
          >
            Register
          </a>

          <SoundOrb />

          {/* Hamburger (mobile only) */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg transition-colors"
            style={{ background: "rgba(255,255,255,0.06)" }}
            onClick={() => {
              play("click");
              setMenuOpen(true);
            }}
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </motion.nav>

      {/* Mobile fullscreen menu */}
      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeSection={activeSection}
      />

      {/* CSS for floating particle animation used in mobile menu */}
      <style>{`
        @keyframes float-particle {
          0% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { transform: translateY(-15px) translateX(8px); opacity: 0.2; }
        }
      `}</style>
    </>
  );
}
