import { Volume2, VolumeX } from "lucide-react";
import { useAudio } from "@/lib/audio";
import { LINKS } from "@/lib/config";

export function TopBar() {
  const { muted, toggleMute } = useAudio();
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-3 sm:px-6">
      <a
        href="#top"
        className="font-display text-sm font-bold tracking-[0.18em] text-foreground/90"
      >
        CoC<span className="text-accent">3.0</span>
      </a>
      <div className="flex items-center gap-2">
        <a
          href={LINKS.register}
          className="hidden min-h-[44px] items-center rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-glow sm:inline-flex"
        >
          Register
        </a>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Unmute ambient audio" : "Mute ambient audio"}
          aria-pressed={!muted}
          className="glass flex h-11 w-11 items-center justify-center rounded-full"
        >
          {muted ? (
            <VolumeX className="h-4 w-4" aria-hidden />
          ) : (
            <Volume2 className="h-4 w-4 text-accent" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}