import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Sparkles, PerformanceMonitor } from "@react-three/drei";
import { useEffect, useMemo, useRef, Suspense, useState } from "react";
import * as THREE from "three";
import { useLenis } from "@/hooks/use-lenis";
import { useReducedMotion } from "@/hooks/use-prefs";
import { usePerformanceTier, PerformanceTier } from "@/hooks/use-performance";
import { CinematicRings } from "./CinematicRings";
import { BlackHoleAccretion } from "./BlackHole";

// Dynamic texture creators to avoid loading external image assets.
const createSaturnTexture = (tier: PerformanceTier) => {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  const size = tier === "high" ? 2048 : tier === "medium" ? 1024 : 512;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Authentic Cassini color palette
  const colors = [
    "#d8ca9d", // Pale gold/beige
    "#e8d9b1",
    "#c6b48f",
    "#a5957b",
    "#b8a688",
    "#8e8570",
    "#a19882",
    "#b5ab95",
    "#6b706d", // Blueish grey at poles
    "#4a5356"
  ];

  for (let y = 0; y < size; y++) {
    const v = y / size;
    
    // Complex noise function combining multiple sine waves for bands
    let noise = 
      Math.sin(v * Math.PI * 12) * 0.5 +
      Math.sin(v * Math.PI * 30) * 0.25 +
      Math.sin(v * Math.PI * 80) * 0.125 +
      Math.sin(v * Math.PI * 250) * 0.0625;
      
    // Normalize noise roughly between 0 and 1
    noise = (noise + 1) / 2;
    // Add micro-banding
    noise += (Math.random() - 0.5) * 0.08;
    
    // Map V to latitude (0 at equator, 1 at poles)
    const lat = Math.abs(v - 0.5) * 2; 

    // Interpolate colors based on latitude and noise
    let baseColorIdx;
    if (lat > 0.85) {
       // Polar hexagon area
       baseColorIdx = 8 + (noise > 0.5 ? 1 : 0);
    } else {
       // Equator and mid-latitudes
       baseColorIdx = Math.floor(noise * 7.99); 
    }
    
    baseColorIdx = Math.max(0, Math.min(colors.length - 1, baseColorIdx));
    
    ctx.fillStyle = colors[baseColorIdx] || "#ffffff";
    ctx.globalAlpha = 0.9;
    ctx.fillRect(0, y, size, 1);
  }
  
  // Apply a smooth gradient over it for polar lighting/color shift
  ctx.globalAlpha = 1.0;
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, "rgba(70, 90, 110, 0.5)"); // North pole blue tint
  grad.addColorStop(0.15, "rgba(255, 255, 255, 0.0)");
  grad.addColorStop(0.85, "rgba(255, 255, 255, 0.0)");
  grad.addColorStop(1, "rgba(70, 90, 110, 0.5)"); // South pole blue tint
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  return tex;
};

// We create 2048x1 textures for perfectly sharp procedural rings.




// Smooth Camera Track interpolations across the page scroll progress.
// 10 keyframes matching the HTML sections.
const pointsPos = [
  new THREE.Vector3(0, 1.8, 9),       // 0: Hero (Direct view)
  new THREE.Vector3(3.6, 0.6, 7.8),   // 1: Hall of Fame / About (Pan right)
  new THREE.Vector3(0, -3.5, 6.5),    // 2: Stats (Dive below rings)
  new THREE.Vector3(-4.5, -1.0, 6.0), // 3: Tracks (Look up from left)
  new THREE.Vector3(-1.5, 0.5, 4.0),  // 4: Timeline (Approaching)
  new THREE.Vector3(0, 0.1, 2.8),     // 5: Prizes (Inside ring dust)
  new THREE.Vector3(6, -4, 1),        // 6: Guests (Banking hard right & down)
  new THREE.Vector3(40, -20, -2),     // 7: Sponsors (Entering warp entrance)
  new THREE.Vector3(40, -20, -15),    // 8: FAQ/Map (Deep inside warp tunnel)
  new THREE.Vector3(40, -20, -27),    // 9: Footer (Approaching the Hyper-Gate)
];

const pointsTarget = [
  new THREE.Vector3(0, 0, 0),         // 0: Hero
  new THREE.Vector3(-1.5, 0, 0),      // 1: Hall of Fame / About
  new THREE.Vector3(0, 1, 0),         // 2: Stats
  new THREE.Vector3(1.5, 0.5, 0),     // 3: Tracks
  new THREE.Vector3(0, 0, -2),        // 4: Timeline
  new THREE.Vector3(0, 0, -5),        // 5: Prizes
  new THREE.Vector3(20, -10, -10),    // 6: Guests (Looking towards warp)
  new THREE.Vector3(40, -20, -20),    // 7: Sponsors (Looking down tunnel)
  new THREE.Vector3(40, -20, -35),    // 8: FAQ/Map (Focus on portal)
  new THREE.Vector3(40, -20, -45),    // 9: Footer (Target deep through portal)
];

const posCurve = new THREE.CatmullRomCurve3(pointsPos);
const targetCurve = new THREE.CatmullRomCurve3(pointsTarget);

// Camera Controller inside Canvas
function CameraController() {
  const scrollProgress = useRef(0);
  const currentProgress = useRef(0);
  const pointerOffset = useRef({ x: 0, y: 0 });

  useLenis(({ progress }) => {
    scrollProgress.current = progress;
  });

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      pointerOffset.current.x = (e.clientX / window.innerWidth - 0.5) * 0.45;
      pointerOffset.current.y = (e.clientY / window.innerHeight - 0.5) * 0.45;
    };
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  useFrame((state, delta) => {
    // Smooth scrolling progress using framerate-independent damp
    currentProgress.current = THREE.MathUtils.damp(
      currentProgress.current,
      scrollProgress.current,
      2.5, // lambda — lower = more inertia, smoother/more cinematic
      delta
    );

    const p = currentProgress.current;
    const pos = posCurve.getPointAt(p);
    const target = targetCurve.getPointAt(p);

    // Apply smooth mouse parallax drift
    const cameraPos = new THREE.Vector3().copy(pos);
    // Amplify parallax slightly when fully zoomed in, reduce when moving fast
    const parallaxStrength = 1.0; 
    cameraPos.x += pointerOffset.current.x * parallaxStrength;
    cameraPos.y += pointerOffset.current.y * parallaxStrength;

    state.camera.position.copy(cameraPos);
    state.camera.lookAt(target);
  });

  return null;
}

// 3D Scene Components



function Satellite() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      const x = -40 + (t * 0.8) % 80; 
      ref.current.position.set(x, 12, -20);
      ref.current.rotation.x = t * 0.1;
      ref.current.rotation.y = t * 0.15;
    }
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#888" metalness={0.8} />
      </mesh>
      <mesh position={[1.2, 0, 0]}>
        <boxGeometry args={[1.8, 0.05, 0.6]} />
        <meshStandardMaterial color="#111" metalness={0.9} />
      </mesh>
      <mesh position={[-1.2, 0, 0]}>
        <boxGeometry args={[1.8, 0.05, 0.6]} />
        <meshStandardMaterial color="#111" metalness={0.9} />
      </mesh>
      <pointLight color="#00f3ff" intensity={0.5} distance={2} />
    </group>
  );
}

function Meteors() {
  const count = 6;
  const meteors = useMemo(() => Array.from({ length: count }, () => ({
    start: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    active: false,
    timer: Math.random() * 5
  })), []);
  
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const geo = useMemo(() => new THREE.CylinderGeometry(0.005, 0.04, 4, 4).rotateX(Math.PI / 2), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      const m = meteors[i];
      if (!m) continue;
      m.timer -= delta;
      if (!m.active && m.timer <= 0) {
        m.active = true;
        m.start.set(20 + Math.random() * 30, 15 + Math.random() * 15, -15 - Math.random() * 20);
        m.velocity.set(-40 - Math.random() * 20, -15 - Math.random() * 10, 0);
        tempObject.position.copy(m.start);
        tempObject.lookAt(tempObject.position.clone().add(m.velocity));
      }
      if (m.active) {
        tempObject.position.addScaledVector(m.velocity, delta);
        if (tempObject.position.y < -25 || tempObject.position.x < -40) {
          m.active = false;
          m.timer = 2 + Math.random() * 12;
          tempObject.position.set(1000, 1000, 1000);
        }
      }
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geo, undefined, count]}>
      <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
    </instancedMesh>
  );
}

function LivingBackground({ tier }: { tier: PerformanceTier }) {
  const isLow = tier === "low";
  const isHigh = tier === "high";

  return (
    <group>
      {/* Deep Galaxy Stars */}
      <Stars radius={100} depth={50} count={isLow ? 200 : isHigh ? 3000 : 1000} factor={4} saturation={0} fade speed={0.5} />
      {/* Colored Star Clusters */}
      <Stars radius={120} depth={60} count={isLow ? 100 : isHigh ? 2000 : 800} factor={7} saturation={1} fade speed={0.3} />
      
      {/* Vibrant Galaxy Core */}
      <Sparkles count={isLow ? 5 : isHigh ? 50 : 20} scale={[100, 60, 60]} size={45} color="#7722ff" speed={0.05} opacity={0.08} />
      <Sparkles count={isLow ? 5 : isHigh ? 60 : 25} scale={[80, 80, 40]} size={70} color="#5500cc" speed={0.06} opacity={0.08} />
      {isHigh && <Sparkles count={40} scale={[120, 40, 80]} size={90} color="#00ddff" speed={0.04} opacity={0.07} />}
      
      {/* Nebula Fog / Cosmic Dust */}
      <Sparkles count={isLow ? 10 : isHigh ? 180 : 60} scale={[70, 50, 50]} size={25} color="#7733cc" speed={0.1} opacity={0.1} />
      {isHigh && <Sparkles count={120} scale={[60, 60, 40]} size={35} color="#00ddff" speed={0.15} opacity={0.08} />}
      
      {/* Ambient background dust */}
      <Sparkles count={isLow ? 30 : isHigh ? 600 : 200} scale={[100, 100, 100]} size={2} color="#ffffff" speed={0.05} opacity={0.3} />

      {!isLow && <Satellite />}
      {!isLow && <Meteors />}
    </group>
  );
}

function Universe() {
  const tier = usePerformanceTier();
  const saturnRef = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const blackHoleRef = useRef<THREE.Group>(null);
  const asteroidsRef = useRef<THREE.InstancedMesh>(null);
  const warpTunnelRef = useRef<THREE.LineSegments>(null);

  const { gl } = useThree();

  // Textures generated dynamically
  const textures = useMemo(() => {
    return {
      saturn: createSaturnTexture(tier),
    };
  }, [tier]);

  // Floating moons
  const moonsRef = useRef<THREE.Group>(null);


  // Asteroid instances — fewer on phone to save draw calls
  const asteroidCount = tier === "low" ? 5 : tier === "medium" ? 40 : 120;
  const tempObject = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!asteroidsRef.current) return;
    for (let i = 0; i < asteroidCount; i++) {
      const radius = 6 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      const y = (Math.random() - 0.5) * 1.5;

      tempObject.position.set(x, y, z);
      const scale = 0.04 + Math.random() * 0.08;
      tempObject.scale.set(scale, scale, scale);
      tempObject.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        0
      );
      tempObject.updateMatrix();
      asteroidsRef.current.setMatrixAt(i, tempObject.matrix);
    }
    asteroidsRef.current.instanceMatrix.needsUpdate = true;
  }, [asteroidCount, tempObject]);

  // Warp tunnel geometry — reduced line count on phone
  const warpLineCount = tier === "low" ? 20 : tier === "medium" ? 60 : 150;
  const warpLines = useMemo(() => {
    const vertices: number[] = [];
    for (let i = 0; i < warpLineCount; i++) {
      const z = -Math.random() * 30;
      const r = 2.5 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r;

      const len = 1.5 + Math.random() * 4;
      vertices.push(x, y, z, x, y, z - len);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    return geometry;
  }, [warpLineCount]);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    // Rotations
    if (saturnRef.current) saturnRef.current.rotation.y = elapsed * 0.03;
    if (cloudRef.current) cloudRef.current.rotation.y = elapsed * 0.042;
    if (blackHoleRef.current) {
       blackHoleRef.current.rotation.y = elapsed * 0.1;
       blackHoleRef.current.rotation.x = Math.sin(elapsed * 0.05) * 0.2;
    }

    // Moons
    if (moonsRef.current) {
      moonsRef.current.rotation.y = elapsed * 0.05;
      moonsRef.current.rotation.z = elapsed * 0.01;
    }

    // Drifts
    if (asteroidsRef.current) {
      asteroidsRef.current.rotation.y = elapsed * 0.008;
    }

    // Warp lines scrolling
    if (warpTunnelRef.current) {
      const pos = warpTunnelRef.current.geometry.attributes['position'] as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      if (arr) {
        for (let i = 2; i < arr.length; i += 6) {
          // Move lines closer on Z axis
          arr[i] = (arr[i] ?? 0) + 0.42;
          arr[i + 3] = (arr[i + 3] ?? 0) + 0.42;
  
          // Reset once they pass camera
          if (arr[i]! > 10) {
            const z = -30 - Math.random() * 10;
            const r = 2.0 + Math.random() * 1.5;
            const theta = Math.random() * Math.PI * 2;
            const x = Math.cos(theta) * r;
            const y = Math.sin(theta) * r;
            const len = 1.5 + Math.random() * 4;
  
            arr[i - 2] = x;
            arr[i - 1] = y;
            arr[i] = z;
            arr[i + 1] = x;
            arr[i + 2] = y;
            arr[i + 3] = z - len;
          }
        }
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. Living Background (Stars, Nebula, Meteors) */}
      <LivingBackground tier={tier} />

      {/* 2. Saturn & Rings */}
      <group ref={saturnRef} position={[0, 0, 0]}>
        {/* Core sphere */}
        <mesh castShadow={tier === "high"} receiveShadow={tier === "high"}>
          <sphereGeometry args={[2.0, tier === "high" ? 32 : 16, tier === "high" ? 32 : 16]} />
          {textures.saturn ? (
            <meshStandardMaterial
              map={textures.saturn}
              roughness={0.9}
              metalness={0.1}
            />
          ) : (
            <meshStandardMaterial color="#c2b09a" roughness={0.8} />
          )}
        </mesh>

        {/* Atmospheric rim light glow */}
        <mesh>
          <sphereGeometry args={[2.08, tier === "high" ? 32 : 16, tier === "high" ? 32 : 16]} />
          <meshBasicMaterial 
            color="#e5b05c" 
            transparent 
            opacity={0.15} 
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Independent clouds layer */}
        <mesh ref={cloudRef}>
          <sphereGeometry args={[2.015, tier === "high" ? 32 : 16, tier === "high" ? 32 : 16]} />
          {(textures as any).clouds ? (
            <meshStandardMaterial
              map={(textures as any).clouds}
              transparent
              opacity={0.35}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          ) : (
            <meshStandardMaterial transparent opacity={0} />
          )}
        </mesh>

        {/* Cinematic Dynamic Rings */}
        <group rotation={[Math.PI / 2.3, 0, 0]}>
          <CinematicRings />
        </group>
      </group>

      {/* 2.5 Floating Moons */}
      <group ref={moonsRef}>
        <mesh position={[4.5, 0.8, -2]}>
          <sphereGeometry args={[0.15, tier === "high" ? 16 : 8, tier === "high" ? 16 : 8]} />
          <meshStandardMaterial color="#9d4edd" roughness={0.8} />
        </mesh>
        <mesh position={[-5, -1.2, 1]}>
          <sphereGeometry args={[0.08, tier === "high" ? 16 : 8, tier === "high" ? 16 : 8]} />
          <meshStandardMaterial color="#e5b05c" roughness={0.7} />
        </mesh>
      </group>

      {/* 3. Instanced Asteroid Field */}
      <instancedMesh
        ref={asteroidsRef}
        args={[new THREE.DodecahedronGeometry(1, 0), undefined, asteroidCount]}
      >
        <meshStandardMaterial color="#473c35" roughness={0.95} />
      </instancedMesh>

      {/* 4. Warp Tunnel (shifted far right and down) */}
      <lineSegments ref={warpTunnelRef} geometry={warpLines} position={[40, -20, 0]}>
        <lineBasicMaterial
          color="#00d4e8"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* 5. Supermassive Black Hole (Footer destination) */}
      <group ref={blackHoleRef} position={[40, -20, -35]}>
        {/* The Event Horizon (Pitch Black Sphere) */}
        <mesh>
          <sphereGeometry args={[3, tier === "high" ? 64 : 24, tier === "high" ? 64 : 24]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        
        {/* Photon Sphere / Halo (Subtle glow right at the edge) */}
        <mesh>
          <sphereGeometry args={[3.12, tier === "high" ? 64 : 24, tier === "high" ? 64 : 24]} />
          <meshBasicMaterial color="#ff7700" transparent opacity={0.12} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
        </mesh>

        {/* Accretion Disk */}
        <group rotation={[Math.PI / 2.2, 0, 0]}>
          <BlackHoleAccretion />
        </group>
        <pointLight color="#ff5500" intensity={1.5} distance={50} />
      </group>
    </group>
  );
}

export function SpaceScene() {
  const reduced = useReducedMotion();
  const tier = usePerformanceTier();
  const isMobile = tier !== "high";
  
  // High tier gets full DPR up to 2. Medium/Low start at 1 to guarantee 60fps.
  const [dpr, setDpr] = useState(isMobile ? 1 : 1.5);

  // If prefers-reduced-motion is active, disable WebGL elements for accessibility.
  if (reduced) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 h-full w-full bg-[#05060f] transition-opacity duration-1000">
      <Canvas
        shadows={tier === "high"}
        dpr={dpr}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          alpha: true,
          // Prevent alpha-bleed color artifacts on mobile WebGL implementations.
          // premultipliedAlpha:false ensures the compositor doesn't multiply RGB by A
          // before writing to the framebuffer, which stops additive overdraws from
          // creating a colour tint on lower-end GPUs.
          premultipliedAlpha: false,
          // Disable logarithmic depth to avoid precision issues on Android Mali/Adreno.
          logarithmicDepthBuffer: false,
        }}
        camera={{ fov: isMobile ? 55 : 45, near: 0.1, far: 200, position: [0, 2, 9] }}
      >
        <PerformanceMonitor
          onIncline={() => setDpr(isMobile ? 1.25 : 2)}
          onDecline={() => setDpr(isMobile ? 0.75 : 1)}
        />
        <ambientLight intensity={0.12} />
        <directionalLight
          position={[10, 5, 5]}
          intensity={4.2}
          color="#fff5ea"
          castShadow={tier === "high"}
          shadow-mapSize-width={tier === "high" ? 1024 : 256}
          shadow-mapSize-height={tier === "high" ? 1024 : 256}
          shadow-bias={-0.0005}
        />
        <CameraController />
        <Suspense fallback={null}>
          <Universe />
        </Suspense>
      </Canvas>
    </div>
  );
}
