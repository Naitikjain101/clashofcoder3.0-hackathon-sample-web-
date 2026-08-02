/**
 * Tracks — 3D Solar System View
 */
import React, { Component, ErrorInfo, Suspense, useState, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { Section } from "./space/Section";
import { useIsPhone, useReducedMotion } from "@/hooks/use-prefs";
import { useAudio } from "@/lib/audio";
import { TRACKS } from "@/lib/config";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Sparkles, Sphere, Ring, Text, Billboard, Float } from "@react-three/drei";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// Error Boundary (Fallback to HTML Grid if WebGL crashes)
// ─────────────────────────────────────────────────────────────────────────────
class ErrorBoundary extends Component<{ fallback: React.ReactNode, children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Tracks 3D Scene Error:", error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-track colour data
// ─────────────────────────────────────────────────────────────────────────────
const PALETTES = [
  { color: "#4fc9cd", grad: "from-[#4fc9cd] to-[#124b5c]", glow: "rgba(79,201,205,0.8)", border: "rgba(79,201,205,0.6)" },
  { color: "#8a2be2", grad: "from-[#8a2be2] to-[#3a0a66]", glow: "rgba(138,43,226,0.8)", border: "rgba(138,43,226,0.6)" },
  { color: "#ff4d4d", grad: "from-[#ff4d4d] to-[#660000]", glow: "rgba(255,77,77,0.8)", border: "rgba(255,77,77,0.6)" },
  { color: "#ffaa00", grad: "from-[#ffaa00] to-[#553300]", glow: "rgba(255,170,0,0.8)", border: "rgba(255,170,0,0.6)" },
  { color: "#00ffcc", grad: "from-[#00ffcc] to-[#005544]", glow: "rgba(0,255,204,0.8)", border: "rgba(0,255,204,0.6)" },
  { color: "#33cc33", grad: "from-[#33cc33] to-[#085a08]", glow: "rgba(51,204,51,0.8)", border: "rgba(51,204,51,0.6)" },
  { color: "#ff3399", grad: "from-[#ff3399] to-[#660033]", glow: "rgba(255,51,153,0.8)", border: "rgba(255,51,153,0.6)" },
  { color: "#3399ff", grad: "from-[#3399ff] to-[#003d80]", glow: "rgba(51,153,255,0.8)", border: "rgba(51,153,255,0.6)" },
  { color: "#e6b800", grad: "from-[#e6b800] to-[#4d3d00]", glow: "rgba(230,184,0,0.8)", border: "rgba(230,184,0,0.6)" },
  { color: "#e600e6", grad: "from-[#e600e6] to-[#4d004d]", glow: "rgba(230,0,230,0.8)", border: "rgba(230,0,230,0.6)" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3D Planet Component
// ─────────────────────────────────────────────────────────────────────────────
function Planet3D({ index, track, radius, color, onPointerOver, onPointerOut, onClick, isHovered, isPinned }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const angle = useRef((index / TRACKS.length) * Math.PI * 2);
  const speed = (0.5 / Math.max(0.1, Math.sqrt(radius || 1))) * (index % 2 === 0 ? 1 : 1.2);

  useFrame((_state, delta) => {
    if (!isHovered && !isPinned) {
      angle.current -= speed * delta * 0.4;
    } else if (isHovered && !isPinned) {
      angle.current -= speed * delta * 0.05; 
    }

    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angle.current) * radius;
      groupRef.current.position.z = Math.sin(angle.current) * radius;
    }

    if (meshRef.current) {
      const targetScale = isHovered || isPinned ? 1.6 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <>
      <Ring args={[radius - 0.02, radius + 0.02, 64]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color={color} transparent opacity={isHovered || isPinned ? 0.6 : 0.05} />
      </Ring>

      <group ref={groupRef}>
        {(isHovered || isPinned) && (
          <Ring args={[0.6, 0.65, 32]} rotation={[-Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color={color} transparent opacity={0.8} side={THREE.DoubleSide} />
          </Ring>
        )}

        <Sphere
          args={[0.8, 16, 16]}
          onPointerOver={(e) => {
            e.stopPropagation();
            onPointerOver(index);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onPointerOut();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick(index);
          }}
          onPointerEnter={() => (document.body.style.cursor = "pointer")}
          onPointerLeave={() => (document.body.style.cursor = "auto")}
        >
          <meshBasicMaterial visible={false} />
        </Sphere>

        <Sphere
          ref={meshRef}
          args={[0.35, 32, 32]}
        >
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isHovered || isPinned ? 1.5 : 0.4}
            roughness={0.6}
            metalness={0.3}
          />
        </Sphere>

        {(isHovered || isPinned) && (
          <Sphere args={[0.45, 32, 32]}>
            <meshBasicMaterial color={color} transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
          </Sphere>
        )}

        <Suspense fallback={null}>
          <Billboard follow={true}>
            <Text
              position={[0, 0.8, 0]}
              fontSize={0.25}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.03}
              outlineColor="#000"
            >
              {track.short}
            </Text>
          </Billboard>
        </Suspense>
      </group>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3D Solar System Scene
// ─────────────────────────────────────────────────────────────────────────────
function SolarSystem({ hoveredIdx, pinnedIdx, setHoveredIdx, setPinnedIdx, phone, play }: any) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={4} color="#ffffff" distance={50} />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Sphere args={[1.5, 64, 64]}>
          <meshStandardMaterial color="#ffffff" emissive="#8a2be2" emissiveIntensity={1.5} roughness={0.2} metalness={0.8} />
        </Sphere>
        <Sphere args={[1.8, 32, 32]}>
          <meshBasicMaterial color="#4fc9cd" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
        </Sphere>
        <Billboard follow={true}>
          <Text fontSize={0.3} position={[0, 0, 0]} color="#ffffff" outlineWidth={0.04} outlineColor="#000000" letterSpacing={0.1}>
            CORE HUB
          </Text>
        </Billboard>
      </Float>

      {TRACKS.map((track, i) => {
        const palette = PALETTES[i] || PALETTES[0]!; // fallback safety
        return (
          <Planet3D
            key={track.name}
            index={i}
            track={track}
            radius={3.5 + i * 1.2 + (i % 2 === 0 ? 0 : 0.5)}
            color={palette.color}
            isHovered={hoveredIdx === i}
            isPinned={pinnedIdx === i}
            onPointerOver={(idx: number) => {
              play("holo_start");
              setHoveredIdx(idx);
            }}
            onPointerOut={() => setHoveredIdx(null)}
            onClick={(idx: number) => {
              play("click");
              setPinnedIdx(pinnedIdx === idx ? null : idx);
            }}
          />
        );
      })}

      <Stars radius={100} depth={50} count={phone ? 1500 : 4000} factor={4} saturation={1} fade speed={1} />
      <Sparkles count={phone ? 150 : 500} scale={40} size={2} speed={0.2} color="#a020f0" opacity={0.3} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        autoRotate={!hoveredIdx && !pinnedIdx}
        autoRotateSpeed={0.3}
        maxPolarAngle={Math.PI / 2 + 0.1}
        minPolarAngle={Math.PI / 3}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Information Panel
// ─────────────────────────────────────────────────────────────────────────────
function InfoPanel({ track, palette, onClose, isPinned }: any) {
  if (!track || !palette) return null;

  return (
    <motion.div
      key={track.name}
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1, transition: { type: "spring", damping: 20, stiffness: 400, mass: 0.8 } }}
      exit={{ opacity: 0, x: 50, scale: 0.95, transition: { duration: 0.05, ease: "easeIn" } }}
      className="absolute right-4 top-1/2 -translate-y-1/2 md:right-12 w-[calc(100%-2rem)] md:w-[380px] z-[60] pointer-events-auto rounded-2xl overflow-hidden border"
      style={{
        background: "rgba(10, 14, 23, 0.75)",
        backdropFilter: "blur(24px) saturate(150%)",
        borderColor: "rgba(0, 255, 255, 0.15)",
        boxShadow: `0 20px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,255,255,0.1) inset, 0 0 30px -10px ${palette.glow}`,
        maxHeight: "calc(100% - 2rem)",
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${palette.color}, transparent)` }} />

      <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex flex-col gap-5" style={{ maxHeight: "inherit" }}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: palette.color, boxShadow: `0 0 8px ${palette.color}` }} />
            <span className="font-mono text-[0.65rem] uppercase tracking-widest text-white/60">
              Sector: {track.short}
            </span>
          </div>
          {isPinned && (
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors" aria-label="Close Panel">
              <X size={16} />
            </button>
          )}
        </div>

        <div>
          <h3 className="font-display text-2xl font-bold text-white mb-2 tracking-tight" style={{ textShadow: `0 0 15px ${palette.glow}` }}>
            {track.name}
          </h3>
          <p className="text-sm font-medium text-white/90 leading-snug mb-3">
            {track.desc}
          </p>
          <div className="text-sm text-white/60 leading-relaxed mb-6">
            {track.about}
          </div>
          
          <div className="mb-3 text-[0.65rem] font-mono uppercase tracking-widest text-white/40">
            Sample Problem Statements
          </div>
          <ul className="flex flex-col gap-2.5">
            {track.bullets?.map((bullet: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-white/80">
                <span className="text-[10px] mt-[3px]" style={{ color: palette.color }}>•</span>
                <span className="leading-snug">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback Grid for Reduced Motion or Error Recovery
// ─────────────────────────────────────────────────────────────────────────────
function FallbackGrid({ pinnedIdx, setPinnedIdx, play, phone }: any) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
      {TRACKS.map((t, i) => {
        const palette = PALETTES[i] || PALETTES[0]!;
        const isOpen = phone ? pinnedIdx === i : false;
        return (
          <article
            key={t.name}
            onClick={phone ? () => { play("click"); setPinnedIdx(isOpen ? null : i); } : undefined}
            className="relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 cursor-pointer"
            style={{
              background: "rgba(4, 6, 20, 0.82)",
              backdropFilter: "blur(16px)",
              borderColor: isOpen ? palette.border : "rgba(255,255,255,0.07)",
              boxShadow: isOpen ? `0 0 24px -6px ${palette.glow}` : "none",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className={`h-9 w-9 rounded-full bg-gradient-to-b ${palette.grad} flex items-center justify-center text-[0.55rem] font-bold text-white border border-white/10 flex-shrink-0`}
              >
                {t.short}
              </div>
              <div>
                <span className="font-mono text-[0.6rem] uppercase tracking-wider font-semibold" style={{ color: palette.color }}>
                  Sector {i + 1}
                </span>
                <h3 className="font-display text-base font-bold text-white shadow-sm">
                  {t.name}
                </h3>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              {t.desc}
            </p>
          </article>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function Tracks() {
  const phone = useIsPhone();
  const reduced = useReducedMotion();
  const { play } = useAudio();

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [pinnedIdx, setPinnedIdx] = useState<number | null>(null);

  const displayIdx = pinnedIdx !== null ? pinnedIdx : hoveredIdx;
  const activeTrack = displayIdx !== null ? TRACKS[displayIdx] : null;
  const activePalette = displayIdx !== null ? PALETTES[displayIdx] : null;

  if (reduced) {
    return (
      <Section id="tracks" eyebrow="Choose your orbit" title={`${TRACKS.length} tracks`} backdrop="asteroid">
        <FallbackGrid pinnedIdx={pinnedIdx} setPinnedIdx={setPinnedIdx} play={play} phone={phone} />
      </Section>
    );
  }

  return (
    <Section id="tracks" eyebrow="Choose your orbit" title={`${TRACKS.length} tracks`} backdrop="asteroid">
      <div 
        className="relative w-full h-[80vh] min-h-[600px] flex rounded-3xl overflow-hidden border border-white/10"
        style={{ 
          background: "radial-gradient(ellipse at center, rgba(5,6,18,0.97) 0%, rgba(3,4,15,0.95) 100%)", 
          touchAction: "pan-y" 
        }}
      >
        <div className="absolute inset-0 z-10" style={{ pointerEvents: "auto", touchAction: "pan-y" }}>
          <ErrorBoundary fallback={
            <div className="w-full h-full flex items-center justify-center p-4 overflow-y-auto">
              <FallbackGrid pinnedIdx={pinnedIdx} setPinnedIdx={setPinnedIdx} play={play} phone={phone} />
            </div>
          }>
            <Suspense fallback={null}>
              <Canvas camera={{ position: [0, 10, 25], fov: 45 }} dpr={[1, phone ? 1.5 : 2]}>
                <Suspense fallback={null}>
                  <SolarSystem
                    hoveredIdx={hoveredIdx}
                    pinnedIdx={pinnedIdx}
                    setHoveredIdx={setHoveredIdx}
                    setPinnedIdx={setPinnedIdx}
                    phone={phone}
                    play={play}
                  />
                </Suspense>
              </Canvas>
            </Suspense>
          </ErrorBoundary>
        </div>

        <div className="absolute inset-0 z-20 pointer-events-none">
          <AnimatePresence>
            {displayIdx === null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-white/50 text-sm font-mono tracking-widest uppercase"
              >
                {phone ? "Drag to explore · Tap a planet" : "Hover a planet to explore · Click to pin"}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {activeTrack && activePalette && (
              <InfoPanel
                track={activeTrack}
                palette={activePalette}
                onClose={() => {
                  play("click");
                  setPinnedIdx(null);
                  setHoveredIdx(null);
                }}
                isPinned={pinnedIdx !== null}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}