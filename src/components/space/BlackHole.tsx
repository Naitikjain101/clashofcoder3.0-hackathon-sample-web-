import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useIsPhone } from "@/hooks/use-prefs";

// 1. Procedural 1D High-Res Texture for the Accretion Disk
const createBlackHoleAccretionTexture = () => {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 4096;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const imgData = ctx.createImageData(4096, 1);
  const data = imgData.data;

  for (let i = 0; i < 4096; i++) {
    const t = i / 4096;
    let op = 0;
    let r = 255, g = 255, b = 255;
    
    if (t < 0.05) {
      // Intense photon ring boundary
      op = 1.0;
      r = 255; g = 240; b = 200;
    } else if (t < 0.1) {
      // Dark gap
      op = Math.random() * 0.1;
      r = 255; g = 100; b = 20;
    } else {
      // Main Accretion Disk
      // Exponential falloff
      const normalizedT = (t - 0.1) / 0.9;
      const density = Math.exp(-Math.pow(normalizedT * 4.0, 2));
      
      op = density * 0.9 + Math.random() * 0.1;
      r = 255;
      g = Math.max(50, 220 * density);
      b = Math.max(10, 100 * density);
      
      // Plasma turbulence micro-bands
      if (Math.sin(t * Math.PI * 180) > 0.5) {
        op *= 0.8;
      }
      if (Math.sin(t * Math.PI * 300) > 0.8) {
        r = 255; g = 255; b = 200;
        op = Math.min(1.0, op * 1.5);
      }
    }

    const idx = i * 4;
    data[idx] = r;
    data[idx + 1] = g;
    data[idx + 2] = b;
    data[idx + 3] = op * 255;
  }
  
  ctx.putImageData(imgData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
};

// 2. Continuous Disk Mesh
function AccretionDiskBase({ inner, outer, texture, segments = 256 }: { inner: number, outer: number, texture: THREE.Texture | null, segments?: number }) {
  const geo = useMemo(() => {
    const geometry = new THREE.RingGeometry(inner, outer, segments);
    const pos = geometry.attributes['position'] as THREE.BufferAttribute;
    const uv = geometry.attributes['uv'] as THREE.BufferAttribute;
    
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const r = Math.sqrt(x * x + y * y);
      const u = (r - inner) / (outer - inner);
      uv.setXY(i, u, 0.5);
    }
    return geometry;
  }, [inner, outer, segments]);

  return (
    <mesh geometry={geo}>
      {texture ? (
        <meshBasicMaterial 
          map={texture} 
          transparent 
          side={THREE.DoubleSide} 
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      ) : (
        <meshBasicMaterial color="#ff7700" transparent opacity={0.1} side={THREE.DoubleSide} />
      )}
    </mesh>
  );
}

// 3. Volumetric Plasma Particles
function PlasmaVolumetrics({ inner, outer, count, speed = 1.0 }: { inner: number, outer: number, count: number, speed?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const color = new THREE.Color();
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      
      // Logarithmic distribution to clump heavily near the inner boundary
      const rDist = Math.pow(Math.random(), 2);
      const radius = inner + rDist * (outer - inner);
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      // Accretion disks flare out at the edges
      const normalizedR = (radius - 5.2) / (22 - 5.2);
      const thickness = 0.05 + Math.pow(normalizedR, 2) * 2.5;
      
      const z = ((Math.random() + Math.random() + Math.random()) / 3 - 0.5) * thickness;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      // Color based on global temperature (hotter/whiter near center, cooler/redder at edge)
      if (normalizedR < 0.05) {
        color.set("#ffffff"); // Intense photon ring
      } else if (normalizedR < 0.2) {
        color.set("#ffb347"); // Hot orange/yellow
      } else if (normalizedR < 0.5) {
        color.set("#ff4500"); // Red/orange
      } else {
        color.set("#8b0000"); // Deep red/purple fading out
      }
      
      // Add heavy variation for turbulent look
      color.r += (Math.random() - 0.5) * 0.3;
      color.g += (Math.random() - 0.5) * 0.3;
      color.b += (Math.random() - 0.5) * 0.3;
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Size variation
      sizes[i] = Math.random() * 2.0;
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return geo;
  }, [inner, outer, count]);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.z += speed * delta;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  );
}

export function BlackHoleAccretion() {
  const phone = useIsPhone();
  
  const texture = useMemo(() => createBlackHoleAccretionTexture(), []);
  
  // Phone: 0.08x multiplier vs Desktop: 1x — scaled down ~40% from original
  const mult = phone ? 0.06 : 0.6;

  return (
    <group>
      <AccretionDiskBase inner={3.12} outer={13.2} texture={texture} segments={phone ? 64 : 256} />
      {/* Differential Rotation: Inner parts spin much faster than outer parts */}
      <PlasmaVolumetrics inner={3.12} outer={4.5} count={Math.round(50000 * mult)} speed={0.5} />
      <PlasmaVolumetrics inner={4.5} outer={7.2} count={Math.round(35000 * mult)} speed={0.24} />
      <PlasmaVolumetrics inner={7.2} outer={13.2} count={Math.round(25000 * mult)} speed={0.08} />
    </group>
  );
}
