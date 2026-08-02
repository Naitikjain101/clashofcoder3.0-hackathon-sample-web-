import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePerformanceTier } from "@/hooks/use-performance";

// 1. Procedural 1D High-Res Texture for the Dense Ring
const createHighResRingTexture = () => {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 4096;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const imgData = ctx.createImageData(4096, 1);
  const data = imgData.data;

  // Simulate complex Cassini/Encke gaps and dozens of micro-bands
  for (let i = 0; i < 4096; i++) {
    const t = i / 4096;
    let op = 0;
    let r = 200, g = 190, b = 180;
    
    // Very faint inner D ring
    if (t < 0.1) {
      op = Math.random() * 0.05;
      r = 150; g = 140; b = 130;
    } 
    // C Ring
    else if (t < 0.35) {
      const density = Math.sin((t - 0.1) * Math.PI / 0.25);
      op = density * 0.4 + Math.random() * 0.1;
      r = 180; g = 170; b = 160;
      // Micro gaps
      if (Math.random() > 0.98) op *= 0.1;
    }
    // B Ring (Dense, bright)
    else if (t < 0.65) {
      const density = 0.8 + Math.random() * 0.2;
      op = density;
      r = 230; g = 220; b = 210;
      // Many micro-bands
      if (Math.sin(t * Math.PI * 150) > 0.8) op *= 0.6;
    }
    // Cassini Division
    else if (t < 0.70) {
      op = Math.random() * 0.08;
      r = 100; g = 95; b = 90;
      // A few faint ringlets inside
      if (t > 0.67 && t < 0.675) op = 0.4;
    }
    // A Ring
    else if (t < 0.90) {
      op = 0.7 + Math.random() * 0.15;
      r = 210; g = 205; b = 200;
      // Encke gap
      if (t > 0.85 && t < 0.865) op = 0.05;
      // Keeler gap
      if (t > 0.885 && t < 0.89) op = 0.05;
    }
    // F Ring & G Ring dust halo
    else {
      op = Math.max(0, 0.2 - (t - 0.9) * 2) + Math.random() * 0.05;
      r = 170; g = 160; b = 150;
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
function DenseRingDisk({ inner, outer, texture, segments = 256 }: { inner: number, outer: number, texture: THREE.Texture | null, segments?: number }) {
  const geo = useMemo(() => {
    const geometry = new THREE.RingGeometry(inner, outer, segments);
    const pos = geometry.attributes['position'] as THREE.BufferAttribute;
    const uv = geometry.attributes['uv'] as THREE.BufferAttribute;
    
    // Remap UVs so radius maps to U directly
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
    <mesh geometry={geo} castShadow receiveShadow>
      {texture ? (
        <meshStandardMaterial 
          map={texture} 
          transparent 
          side={THREE.DoubleSide} 
          roughness={0.6} 
          metalness={0.1}
          depthWrite={false}
          opacity={0.4}
        />
      ) : (
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} side={THREE.DoubleSide} />
      )}
    </mesh>
  );
}

// 3. Volumetric Dust Particles
function DustVolumetrics({ inner, outer, count }: { inner: number, outer: number, count: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const color = new THREE.Color();
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      // Weighted towards the denser rings
      const rDist = Math.random();
      const radius = inner + rDist * (outer - inner);
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      // Vertical thickness depends on radius (e.g., F ring is thicker, B ring is incredibly thin)
      let thickness = 0.02;
      if (radius > 4.8) thickness = 0.15; // Outer dust halo is thicker
      else if (radius > 3.2 && radius < 4.2) thickness = 0.01; // Dense B ring is ultra flat
      else thickness = 0.04;
      
      const z = ((Math.random() + Math.random() + Math.random()) / 3 - 0.5) * thickness;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      // Color
      if (radius < 3.2) color.set("#d4beaa"); // Inner dust
      else if (radius < 4.2) color.set("#ffffff"); // Bright Ice
      else if (radius < 4.6) color.set("#e8f5f8"); // Crystal
      else if (radius < 5.0) color.set("#9e9287"); // Rocky
      else color.set("#ffffff"); // Halo
      
      // Add slight variation
      color.r += (Math.random() - 0.5) * 0.1;
      color.g += (Math.random() - 0.5) * 0.1;
      color.b += (Math.random() - 0.5) * 0.1;
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Size variation
      sizes[i] = Math.random();
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return geo;
  }, [inner, outer, count]);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.012,
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.z += 0.015 * delta;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  );
}

export function CinematicRings() {
  const tier = usePerformanceTier();
  
  const texture = useMemo(() => createHighResRingTexture(), []);
  
  // High: 250k. Medium: 10k. Low: 300.
  const particleCount = tier === "high" ? 250000 : tier === "medium" ? 10000 : 300;

  return (
    <group>
      {/* The solid, mathematically perfect base layer */}
      <DenseRingDisk inner={2.2} outer={5.5} texture={texture} segments={tier === "high" ? 256 : tier === "medium" ? 64 : 32} />
      
      {/* The massive point cloud layer for incredible 3D parallax */}
      <DustVolumetrics inner={2.2} outer={5.5} count={particleCount} />
    </group>
  );
}
