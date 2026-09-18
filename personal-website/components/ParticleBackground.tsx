/* eslint-disable react-hooks/purity */
"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Track global mouse to bypass DOM pointer-event blocking
// We define it outside so it's shared efficiently across all particle meshes
const globalMouse = { x: 0, y: 0 };
if (typeof window !== "undefined") {
  window.addEventListener("pointermove", (e) => {
    globalMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    globalMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });
}

function FluidParticles({ count, size }: { count: number; size: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const [positions, initialPositions, phases] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const initialPositions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      let x, y, z;
      while (true) {
        // Generate the cloud shape in 2D (XY plane)
        // Reduced size from 25 to 15 based on user feedback
        const radius = Math.pow(Math.random(), 1.5) * 15; 
        const angle = Math.random() * Math.PI * 2;
        
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
        z = (Math.random() - 0.5) * 2; // Slight random depth for parallax
        
        // Reject particles that are inside the 3 unit radius hole
        if (x * x + y * y >= 9) {
          break;
        }
      }
      
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
    const mouseX = (globalMouse.x * viewport.width) / 2;
    const mouseY = (globalMouse.y * viewport.height) / 2;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      const origX = initialPositions[i3];
      const origY = initialPositions[i3 + 1];
      const origZ = initialPositions[i3 + 2];

      const distToCenter = Math.sqrt(origX * origX + origY * origY + origZ * origZ);

      // Extremely slow, organic wave motion
      const waveX = Math.sin(time * 0.15 + origY + phases[i]) * 0.3;
      const waveY = Math.cos(time * 0.2 + origX + phases[i]) * 0.3;
      const waveZ = Math.sin(time * 0.1 + origZ + phases[i]) * 0.3;

      // Swirling motion around the black hole (XY plane)
      const currentAngle = Math.atan2(origY, origX);
      const startDist = Math.sqrt(origX * origX + origY * origY);
      // Spin faster closer to the hole
      const speed = 0.5 / Math.max(1, startDist - 2);
      const newAngle = currentAngle + time * speed;

      let targetX = Math.cos(newAngle) * startDist + waveX;
      let targetY = Math.sin(newAngle) * startDist + waveY;
      let targetZ = origZ + waveZ;

      // Visual exclusion zone to keep the hole perfectly circular and empty from the camera's perspective
      const currentDistToCenter = Math.sqrt(targetX * targetX + targetY * targetY);
      if (currentDistToCenter < 3) {
        const pushForce = (3 - currentDistToCenter) * 0.5;
        const pushAngle = Math.atan2(targetY, targetX);
        targetX += Math.cos(pushAngle) * pushForce;
        targetY += Math.sin(pushAngle) * pushForce;
      }

      const dx = targetX - mouseX;
      const dy = targetY - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Gentle repulsion effect (push apart slightly)
      if (dist < 6) {
        const force = Math.pow((6 - dist) / 6, 2);
        targetX += (dx / dist) * force * 1.6;
        targetY += (dy / dist) * force * 1.6;
      }

      // Very low lerp factor (0.015) for sluggish, fluid movement
      positionsArray[i3] += (targetX - positionsArray[i3]) * 0.015;
      positionsArray[i3 + 1] += (targetY - positionsArray[i3 + 1]) * 0.015;
      positionsArray[i3 + 2] += (targetZ - positionsArray[i3 + 2]) * 0.015;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
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
        size={size}
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
      <Canvas camera={{ position: [0, 0, 12.5], fov: 60 }}>
        {/* 60% default size (0.06) */}
        <FluidParticles count={30000} size={0.06} />
        {/* 20% large size (1.5x default = 0.09) */}
        <FluidParticles count={10000} size={0.09} />
        {/* 20% small size (0.5x default = 0.03) */}
        <FluidParticles count={10000} size={0.03} />
      </Canvas>
    </div>
  );
}
