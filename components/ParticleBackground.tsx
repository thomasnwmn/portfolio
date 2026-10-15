"use client";

import { useEffect, useRef } from "react";

// The ring of particles is drawn with raw WebGL (no 3D engine): every particle's
// orbit, cursor push and click ripples are evaluated on the GPU from a handful of
// uniforms, so the CPU cost per frame is constant regardless of particle count.
// Without WebGL the radial-gradient background is shown on its own.

const INNER_RADIUS = 3;
// Cursor and ripple pressure can enter this band, but never reach the center.
const PUSHED_INNER_RADIUS = 1.9;
const MIN_OUTER_RADIUS = 15;
const MAX_PARTICLES = 30000;
const MAX_DPR = 2;
const MAX_RIPPLES = 16;
// Ripple tuning, in CSS pixels / seconds.
const WAVE_WIDTH = 56; // half-width of the leading push
const WAVE_AMPLITUDE = 26; // peak outward displacement
const WAVE_DECAY = 0.8; // amplitude falls by e every ~1.25s
const RIPPLE_LIFETIME = 3.2;

const VERTEX_SHADER = `
precision highp float;
attribute vec4 aParticle; // radius, angle, speed, phase
attribute float aSize;
uniform float uTime;
uniform float uScale;      // device px per world unit
uniform vec2 uCenter;      // device px
uniform vec2 uResolution;  // device px
uniform vec2 uPointer;
uniform float uPointerAmount;
uniform float uInfluence;
uniform float uStrength;
uniform vec4 uRipples[${MAX_RIPPLES}]; // x, y, age (s), hue
uniform int uRippleCount;
uniform float uWaveSpeed;
uniform float uWaveWidth;
uniform float uWaveAmplitude;
uniform float uDpr;
varying vec3 vColor;
varying float vAlpha;

const float INNER = ${INNER_RADIUS.toFixed(1)};
const float PUSHED_INNER = ${PUSHED_INNER_RADIUS.toFixed(1)};
const vec3 BASE = vec3(0.682, 0.706, 0.741);

float tanhApprox(float x) {
  float e = exp(2.0 * clamp(x, -10.0, 10.0));
  return (e - 1.0) / (e + 1.0);
}

vec3 hue2rgb(float h) {
  vec3 k = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return mix(vec3(1.0), k, 0.55); // pastel, so tints sit with the grey palette
}

void main() {
  float radius = aParticle.x;
  float phase = aParticle.w;
  // Taper radial drift at the resting edge so ambient motion never enters the inner band.
  float edge = min(1.0, (radius - INNER) / 0.5);
  float angle = aParticle.y + uTime * aParticle.z + sin(uTime * 0.15 + phase) * 0.015;
  float resting = radius + sin(uTime * 0.2 + phase) * 0.18 * edge;
  vec2 rest = uCenter + vec2(cos(angle), -sin(angle)) * resting * uScale;
  vec2 offset = vec2(0.0);

  // Cursor push, bounded by each particle's own room to travel inward.
  if (uPointerAmount > 0.001) {
    vec2 d = rest - uPointer;
    float dist = length(d);
    if (dist < uInfluence) {
      float requested = pow(1.0 - dist / uInfluence, 2.0) * uStrength;
      float travel = max((radius - 0.18 * edge - PUSHED_INNER) * uScale, 1.0);
      vec2 dir = dist > 0.001 ? d / dist : vec2(cos(phase), sin(phase));
      offset += dir * travel * tanhApprox(requested / travel) * uPointerAmount;
    }
  }

  // Click ripples: a ring that pushes particles outward as its front passes, then
  // a damped wobble behind it pulls them back past rest before settling.
  float glow = 0.0;
  vec3 tint = vec3(0.0);
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    if (i >= uRippleCount) break;
    vec4 ripple = uRipples[i];
    vec2 d = rest - ripple.xy;
    float dist = length(d);
    float behind = ripple.z * uWaveSpeed - dist; // > 0 once the front has passed
    if (behind < -uWaveWidth || behind > uWaveWidth * 7.0) continue;
    float x = behind / uWaveWidth;
    float profile = x < 0.0
      ? (1.0 - x * x) * (1.0 - x * x)
      : cos(x * 2.4) * exp(-x * 0.55);
    float envelope = exp(-ripple.z * ${WAVE_DECAY.toFixed(2)}) / sqrt(1.0 + dist / (420.0 * uDpr));
    vec2 dir = dist > 0.001 ? d / dist : vec2(cos(phase), sin(phase));
    offset += dir * uWaveAmplitude * envelope * profile;
    // Colour rides the crest and shifts hue through the trailing wobble.
    float g = envelope * max(profile, 0.0);
    glow += g;
    tint += hue2rgb(ripple.w + x * 0.06) * g;
  }

  // Never let anything reach the empty center.
  vec2 position = rest + offset;
  vec2 fromCenter = position - uCenter;
  float minRadius = PUSHED_INNER * uScale;
  float centerDistance = length(fromCenter);
  if (centerDistance < minRadius) position = uCenter + fromCenter / max(centerDistance, 0.001) * minRadius;

  float intensity = clamp(glow * 1.6, 0.0, 1.0);
  vColor = mix(BASE, glow > 0.0001 ? tint / glow : BASE, intensity);
  vAlpha = 0.4 + 0.5 * intensity;
  gl_PointSize = max(1.0, floor(aSize * uScale + 0.5)) * (1.0 + intensity * 0.6);
  gl_Position = vec4(position.x / uResolution.x * 2.0 - 1.0, 1.0 - position.y / uResolution.y * 2.0, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `
precision mediump float;
varying vec3 vColor;
varying float vAlpha;
void main() { gl_FragColor = vec4(vColor * vAlpha, vAlpha); }`;

type Ripple = { x: number; y: number; start: number; hue: number };

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("ParticleBackground shader error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// Stable positions on resize/remount; direct sampling avoids rejection loops.
// Interleaved as radius, angle, speed, phase, size.
function createParticles(count: number, radiusLimit: number) {
  let seed = 47281;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const minimum = Math.pow(INNER_RADIUS / radiusLimit, 2 / 3);
  const data = new Float32Array(count * 5);
  for (let i = 0; i < count; i++) {
    const radius = Math.pow(minimum + Math.pow(random(), 0.8) * (1 - minimum), 1.5) * radiusLimit;
    const size = random();
    data.set([radius, random() * Math.PI * 2, 0.5 / Math.max(1, radius - 2), random() * Math.PI * 2,
      size < 0.6 ? 0.06 : size < 0.8 ? 0.09 : 0.03], i * 5);
  }
  return data;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "low-power" });
    if (!gl) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    let attributes = { particle: -1, size: -1 };
    let count = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let scale = 1;
    let outerRadius = 0;
    let frame = 0;
    let previousTime = 0;
    let elapsed = 0;
    let visible = true;
    let disposed = false;
    let contextLost = false;
    let hue = 0.47;
    const ripples: Ripple[] = [];
    const rippleData = new Float32Array(MAX_RIPPLES * 4);
    // The rendered pointer eases toward the real one (~110ms), giving the push its lag.
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, amount: 0, active: false };

    function setup() {
      if (!gl) return false;
      const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
      const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
      if (!vertex || !fragment) return false;
      program = gl.createProgram();
      if (!program) return false;
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
      gl.useProgram(program);
      for (const name of ["uTime", "uScale", "uCenter", "uResolution", "uPointer", "uPointerAmount", "uInfluence", "uStrength",
        "uRipples", "uRippleCount", "uWaveSpeed", "uWaveWidth", "uWaveAmplitude", "uDpr"]) {
        uniforms[name] = gl.getUniformLocation(program, name);
      }
      attributes = { particle: gl.getAttribLocation(program, "aParticle"), size: gl.getAttribLocation(program, "aSize") };
      buffer = gl.createBuffer();
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
      count = 0;
      outerRadius = 0;
      return true;
    }

    function uploadParticles(nextCount: number, nextRadius: number) {
      if (!gl || !buffer) return;
      count = nextCount;
      outerRadius = nextRadius;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, createParticles(count, outerRadius), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(attributes.particle);
      gl.vertexAttribPointer(attributes.particle, 4, gl.FLOAT, false, 20, 0);
      gl.enableVertexAttribArray(attributes.size);
      gl.vertexAttribPointer(attributes.size, 1, gl.FLOAT, false, 20, 16);
    }

    function draw(delta: number, now: number) {
      if (!gl || !program || contextLost || !width || !height) return;
      const reduced = motion.matches;
      // A ~110ms response, independent of monitor refresh rate.
      const response = 1 - Math.exp(-delta * 9);
      pointer.x += (pointer.targetX - pointer.x) * response;
      pointer.y += (pointer.targetY - pointer.y) * response;
      pointer.amount += ((pointer.active && !reduced ? 1 : 0) - pointer.amount) * response;

      // A broader, stronger push that grows faster than the hero diagonal.
      const interactionScale = Math.hypot(width, height) / Math.hypot(1000, 500);
      const influence = Math.min(720, Math.max(140, 200 * Math.pow(interactionScale, 1.25)));

      let rippleCount = 0;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const age = (now - ripples[i].start) / 1000;
        if (age > RIPPLE_LIFETIME || reduced) { ripples.splice(i, 1); continue; }
      }
      for (const ripple of ripples) {
        rippleData.set([ripple.x * dpr, ripple.y * dpr, (now - ripple.start) / 1000, ripple.hue], rippleCount * 4);
        rippleCount++;
      }

      gl.viewport(0, 0, canvas!.width, canvas!.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uniforms.uTime, elapsed);
      gl.uniform1f(uniforms.uScale, scale * dpr);
      gl.uniform2f(uniforms.uCenter, canvas!.width / 2, canvas!.height / 2);
      gl.uniform2f(uniforms.uResolution, canvas!.width, canvas!.height);
      gl.uniform2f(uniforms.uPointer, pointer.x * dpr, pointer.y * dpr);
      gl.uniform1f(uniforms.uPointerAmount, pointer.amount);
      gl.uniform1f(uniforms.uInfluence, influence * dpr);
      gl.uniform1f(uniforms.uStrength, influence * 0.45 * dpr);
      gl.uniform4fv(uniforms.uRipples, rippleData);
      gl.uniform1i(uniforms.uRippleCount, rippleCount);
      // The wave crosses the hero diagonal in ~1.6s on any screen size.
      gl.uniform1f(uniforms.uWaveSpeed, Math.max(520, Math.hypot(width, height) * 0.62) * dpr);
      gl.uniform1f(uniforms.uWaveWidth, WAVE_WIDTH * Math.min(1.4, Math.max(0.7, interactionScale)) * dpr);
      gl.uniform1f(uniforms.uWaveAmplitude, WAVE_AMPLITUDE * Math.min(1.4, Math.max(0.75, interactionScale)) * dpr);
      gl.uniform1f(uniforms.uDpr, dpr);
      gl.drawArrays(gl.POINTS, 0, count);
    }

    function tick(now: number) {
      frame = 0;
      if (disposed || document.hidden || !visible || motion.matches || contextLost) return;
      const delta = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 1 / 60;
      previousTime = now;
      elapsed += delta;
      draw(delta, now);
      frame = requestAnimationFrame(tick);
    }

    function syncAnimation() {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      if (disposed || document.hidden || !visible || contextLost) return;
      draw(0, performance.now());
      if (!motion.matches) frame = requestAnimationFrame(tick);
    }

    function resize() {
      if (!canvas) return;
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      // Match the old 60° camera at z=12.5, using actual hero dimensions.
      scale = height / (2 * 12.5 * Math.tan(Math.PI / 6));
      // Cover the hero's corners on wide displays with a little overscan.
      const nextRadius = scale > 0 ? Math.max(MIN_OUTER_RADIUS, Math.hypot(width, height) * 0.58 / scale) : MIN_OUTER_RADIUS;
      // Preserve visual density as the viewport grows. Counts snap to steps of 1000
      // and the radius to 4% changes, so dragging the window doesn't rebuild every frame.
      const minimumCount = width < 640 ? 6000 : 12000;
      const nextCount = Math.min(MAX_PARTICLES, Math.max(minimumCount, Math.round(width * height / 60 / 1000) * 1000));
      if (nextCount !== count || Math.abs(nextRadius - outerRadius) / nextRadius > 0.04) uploadParticles(nextCount, nextRadius);
      pointer.active = false;
      syncAnimation();
    }

    function inHero(event: PointerEvent) {
      const bounds = canvas!.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      return { x, y, inside: x >= 0 && x <= bounds.width && y >= 0 && y <= bounds.height };
    }
    function onPointerMove(event: PointerEvent) {
      if (motion.matches || event.pointerType === "touch") return;
      const { x, y, inside } = inHero(event);
      if (!pointer.active && inside) { pointer.x = x; pointer.y = y; }
      pointer.targetX = x;
      pointer.targetY = y;
      pointer.active = inside;
    }
    function onPointerDown(event: PointerEvent) {
      if (motion.matches || event.button > 0) return;
      // Links and buttons keep their own click behaviour.
      if ((event.target as Element | null)?.closest?.("a, button, input, textarea, select, label, [role='button']")) return;
      const { x, y, inside } = inHero(event);
      if (!inside) return;
      if (ripples.length >= MAX_RIPPLES) ripples.shift();
      ripples.push({ x, y, start: performance.now(), hue });
      hue = (hue + 0.618034) % 1; // golden-ratio steps keep successive colours distinct
    }
    function clearPointer() { pointer.active = false; }
    function onVisibilityChange() { clearPointer(); syncAnimation(); }
    function onContextLost(event: Event) {
      event.preventDefault();
      contextLost = true;
      cancelAnimationFrame(frame);
    }
    function onContextRestored() {
      contextLost = false;
      if (setup()) resize();
    }

    if (!setup()) return;
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
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("blur", clearPointer);
    window.addEventListener("scroll", clearPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", clearPointer);
    document.addEventListener("visibilitychange", onVisibilityChange);
    motion.addEventListener("change", onVisibilityChange);
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    resize(); // Paint immediately; no lazy import or intro delay.

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("blur", clearPointer);
      window.removeEventListener("scroll", clearPointer);
      document.documentElement.removeEventListener("pointerleave", clearPointer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motion.removeEventListener("change", onVisibilityChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
    };
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-0 z-0 bg-ink-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse at 75% 50%, #1d2528 0%, transparent 60%)" }}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
