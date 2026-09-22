"use client";

import { useEffect, useRef } from "react";

// Keep the original ring silhouette without loading a 3D engine for a 2D effect.
const INNER_RADIUS = 3;
// Cursor pressure can enter this band, but never reach the center.
const PUSHED_INNER_RADIUS = 1.9;
const MIN_OUTER_RADIUS = 15;
const MAX_PARTICLES = 24000;
const MAX_DPR = 1.5;

type Particle = {
  radius: number;
  angle: number;
  speed: number;
  phase: number;
  size: number;
  offsetX: number;
  offsetY: number;
};

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let scale = 1;
    let frame = 0;
    let previousTime = 0;
    let elapsed = 0;
    let visible = true;
    let disposed = false;
    let particles: Particle[] = [];
    let outerRadius = MIN_OUTER_RADIUS;
    const pointer = { x: 0, y: 0, active: false };

    function createParticles(count: number, radiusLimit: number) {
      // Stable positions on resize/remount; direct sampling avoids rejection loops.
      let seed = 47281;
      const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      const minimum = Math.pow(INNER_RADIUS / radiusLimit, 2 / 3);
      return Array.from({ length: count }, () => {
        const radius = Math.pow(minimum + Math.pow(random(), 0.8) * (1 - minimum), 1.5) * radiusLimit;
        const size = random();
        return { radius, angle: random() * Math.PI * 2, speed: 0.5 / Math.max(1, radius - 2), phase: random() * Math.PI * 2,
          size: size < 0.6 ? 0.06 : size < 0.8 ? 0.09 : 0.03, offsetX: 0, offsetY: 0 };
      });
    }

    function draw(delta: number) {
      if (!context || !canvas || !width || !height) return;
      context.clearRect(0, 0, width, height);
      const reduced = motion.matches;
      // A ~110ms response, independent of monitor refresh rate.
      const response = 1 - Math.exp(-delta * 9);
      // A broader, stronger push that grows faster than the hero diagonal.
      // Bound extreme displays while preserving the per-particle center protection.
      const interactionScale = Math.hypot(width, height) / Math.hypot(1000, 500);
      const influence = Math.min(720, Math.max(140, 200 * Math.pow(interactionScale, 1.25)));
      const strength = influence * 0.45;
      context.fillStyle = "#aeb4bd";
      context.globalAlpha = 0.4;
      for (const particle of particles) {
        const angle = particle.angle + elapsed * particle.speed + Math.sin(elapsed * 0.15 + particle.phase) * 0.015;
        // Taper radial drift at the resting edge so ambient motion never enters
        // the inner band. Density also thins toward this edge at initialization.
        const drift = Math.sin(elapsed * 0.2 + particle.phase) * 0.18;
        const restingRadius = particle.radius + drift * Math.min(1, (particle.radius - INNER_RADIUS) / 0.5);
        const x = Math.cos(angle) * restingRadius;
        const y = Math.sin(angle) * restingRadius;
        const px = width / 2 + x * scale;
        const py = height / 2 - y * scale;
        let pushX = 0;
        let pushY = 0;
        if (pointer.active && !reduced) {
          const dx = px - pointer.x;
          const dy = py - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < influence) {
            const requestedForce = Math.pow(1 - distance / influence, 2) * strength;
            // Bound travel from this particle's own orbit, not from a shared
            // circular wall. Reserve enough space for the maximum ambient drift.
            const driftAllowance = 0.18 * Math.min(1, (particle.radius - INNER_RADIUS) / 0.5);
            const travel = (particle.radius - driftAllowance - PUSHED_INNER_RADIUS) * scale;
            const force = travel * Math.tanh(requestedForce / travel);
            pushX = (distance > 0.001 ? dx / distance : Math.cos(particle.phase)) * force;
            pushY = (distance > 0.001 ? dy / distance : Math.sin(particle.phase)) * force;
          }
        }
        particle.offsetX = reduced ? 0 : particle.offsetX + (pushX - particle.offsetX) * response;
        particle.offsetY = reduced ? 0 : particle.offsetY + (pushY - particle.offsetY) * response;
        // Apply the actual displacement with no radial projection. Inward pushes
        // retain their direction and spacing, then ease back when released.
        const size = Math.max(0.65, particle.size * scale);
        const screenX = px + particle.offsetX;
        const screenY = py + particle.offsetY;
        if (screenX < -size || screenX > width + size || screenY < -size || screenY > height + size) continue;
        context.fillRect(screenX - size / 2, screenY - size / 2, size, size);
      }
      context.globalAlpha = 1;
    }

    function tick(now: number) {
      frame = 0;
      if (disposed || document.hidden || !visible || motion.matches) return;
      const delta = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 1 / 60;
      previousTime = now;
      elapsed += delta;
      draw(delta);
      frame = requestAnimationFrame(tick);
    }

    function syncAnimation() {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      if (disposed || document.hidden || !visible) return;
      draw(0);
      if (!motion.matches) frame = requestAnimationFrame(tick);
    }

    function resize() {
      if (!canvas || !context) return;
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Match the old 60° camera at z=12.5, using actual hero dimensions.
      const previousScale = scale;
      scale = height / (2 * 12.5 * Math.tan(Math.PI / 6));
      const ratio = previousScale > 0 ? scale / previousScale : 0;
      for (const particle of particles) {
        particle.offsetX *= ratio;
        particle.offsetY *= ratio;
      }
      // Cover the hero's corners on wide displays with a little overscan.
      // CSS dimensions control coverage; DPR only affects drawing sharpness.
      const nextOuterRadius = scale > 0
        ? Math.max(MIN_OUTER_RADIUS, Math.hypot(width, height) * 0.58 / scale)
        : MIN_OUTER_RADIUS;
      // Preserve visual density as the viewport grows, with a bounded workload.
      const minimumCount = width < 640 ? 5000 : 10000;
      const count = Math.min(MAX_PARTICLES, Math.max(minimumCount, Math.round(width * height / 70)));
      if (particles.length !== count || Math.abs(nextOuterRadius - outerRadius) > 0.01) {
        outerRadius = nextOuterRadius;
        particles = createParticles(count, outerRadius);
      }
      pointer.active = false;
      syncAnimation();
    }

    function onPointerMove(event: PointerEvent) {
      if (!canvas || motion.matches || event.pointerType === "touch") return;
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.active = pointer.x >= 0 && pointer.x <= bounds.width && pointer.y >= 0 && pointer.y <= bounds.height;
    }
    function clearPointer() { pointer.active = false; }
    function onVisibilityChange() { clearPointer(); syncAnimation(); }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) clearPointer();
      syncAnimation();
    });
    intersectionObserver.observe(canvas);
    // Global tracking preserves interaction over the hero's text and links.
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", clearPointer);
    window.addEventListener("scroll", clearPointer, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    document.documentElement.addEventListener("pointerleave", clearPointer);
    document.addEventListener("visibilitychange", onVisibilityChange);
    motion.addEventListener("change", onVisibilityChange);
    resize(); // Paint immediately; no lazy import, WebGL setup, or intro delay.

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", clearPointer);
      window.removeEventListener("scroll", clearPointer);
      window.removeEventListener("resize", resize);
      document.documentElement.removeEventListener("pointerleave", clearPointer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motion.removeEventListener("change", onVisibilityChange);
    };
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-0 z-0 bg-ink-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse at 75% 50%, #1d2528 0%, transparent 60%)" }}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
