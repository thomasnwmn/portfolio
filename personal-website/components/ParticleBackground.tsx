"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function FluidParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Track global mouse to bypass DOM pointer-event blocking
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates to -1 to +1
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", handleMouseMove);
    return () => window.removeEventListener("pointermove", handleMouseMove);
  }, []);

  const count = 30000;
  
  const [positions, initialPositions, phases] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const initialPositions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const radius = Math.pow(Math.random(), 1.5) * 25; 
      const angle = Math.random() * Math.PI * 2;
      
      const x = Math.cos(angle) * radius;
      const y = (Math.random() - 0.5) * Math.max(0.1, 4 - radius * 0.1); 
      const z = Math.sin(angle) * radius;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      initialPositions[i * 3] = x;
      initialPositions[i * 3 + 1] = y;
      initialPositions[i * 3 + 2] = z;
      
      phases[i] = Math.random() * Math.PI * 2;
    }
    
    return [positions, initialPositions, phases];
  }, [count]);

  const { viewport } = useThree();

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const positionsArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    // Map normalized global mouse to world coordinates
    const mouseX = (mouse.current.x * viewport.width) / 2;
    const mouseY = (mouse.current.y * viewport.height) / 2;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      const origX = initialPositions[i3];
      const origY = initialPositions[i3 + 1];
      const origZ = initialPositions[i3 + 2];

      // Extremely slow, organic wave motion
      const waveX = Math.sin(time * 0.15 + origY + phases[i]) * 0.3;
      const waveY = Math.cos(time * 0.2 + origX + phases[i]) * 0.3;
      const waveZ = Math.sin(time * 0.1 + origZ + phases[i]) * 0.3;

      let targetX = origX + waveX;
      let targetY = origY + waveY;
      const targetZ = origZ + waveZ;

      const dx = targetX - mouseX;
      const dy = targetY - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Wider repulsion radius (8), but much softer force
      if (dist < 8) {
        const force = Math.pow((8 - dist) / 8, 2); 
        targetX += (dx / dist) * force * 1.5;
        targetY += (dy / dist) * force * 1.5;
      }

      // Very low lerp factor (0.015) for sluggish, fluid movement
      positionsArray[i3] += (targetX - positionsArray[i3]) * 0.015;
      positionsArray[i3 + 1] += (targetY - positionsArray[i3 + 1]) * 0.015;
      positionsArray[i3 + 2] += (targetZ - positionsArray[i3 + 2]) * 0.015;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Extremely slow rotation
    pointsRef.current.rotation.y = time * 0.02;
    pointsRef.current.rotation.z = Math.sin(time * 0.02) * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#aeb4bd"
        transparent
        opacity={0.4}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function ParticleBackground() {
  return (
    <div className="absolute inset-0 z-0 bg-ink-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <FluidParticles />
      </Canvas>
    </div>
  );
}
