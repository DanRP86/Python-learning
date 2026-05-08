"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

type IntroFlowFieldProps = {
  progress?: number;
  anchors?: {
    title: { x: number; y: number };
    p2: { x: number; y: number };
    p3: { x: number; y: number };
  };
};

type OrderedSheetProps = {
  progress: number;
  anchors: NonNullable<IntroFlowFieldProps["anchors"]>;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  cols?: number;
  rows?: number;
  width?: number;
  height?: number;
  layer?: number;
  opacity?: number;
  pointScale?: number;
  flowStrength?: number;
  structureStrength?: number;
  waveIntensity?: number;
};

const vertexShader = `
uniform float uTime;
uniform float uProgress;
uniform float uLayer;
uniform float uOpacity;
uniform float uPointScale;
uniform float uFlowStrength;
uniform float uStructureStrength;
uniform float uWaveIntensity;

uniform vec2 uMouse;

uniform vec2 uTitle;
uniform float uTitleStrength;
uniform vec2 uP2;
uniform float uP2Strength;
uniform vec2 uP3;
uniform float uP3Strength;

attribute float aRandom;
attribute float aBand;
attribute float aGridU;
attribute float aGridV;

varying float vCrest;
varying float vRandom;
varying float vBand;
varying float vMask;
varying float vDepth;
varying float vGridU;
varying float vGridV;
varying float vOpacity;

// -----------------------------
// Simplex noise
// -----------------------------
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);

  vec4 p = permute(
    permute(
      permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0)
    )
    + i.x + vec4(0.0, i1.x, i2.x, 1.0)
  );

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(
    dot(p0, p0),
    dot(p1, p1),
    dot(p2, p2),
    dot(p3, p3)
  ));

  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(
    0.6 - vec4(
      dot(x0, x0),
      dot(x1, x1),
      dot(x2, x2),
      dot(x3, x3)
    ),
    0.0
  );

  m = m * m;

  return 42.0 * dot(
    m * m,
    vec4(
      dot(p0, x0),
      dot(p1, x1),
      dot(p2, x2),
      dot(p3, x3)
    )
  );
}

// -----------------------------
// Text field mask
// -----------------------------
float getPushField(vec2 pos, vec2 anchor, float width, float height) {
  vec2 delta = pos - anchor;
  vec2 norm = vec2(delta.x / width, delta.y / height);
  float field = 1.0 - smoothstep(0.0, 1.0, length(norm));
  return pow(field, 1.55);
}

void main() {
  vec3 original = position;
  vec3 pos = position;

  float u = aGridU;
  float v = aGridV;

  // ------------------------------------------------------
  // Ordered membrane: mostly Z deformation, little XY drift
  // ------------------------------------------------------
  float slowTime = uTime * 0.18;

  float waveA = sin(pos.x * 0.34 + slowTime * 1.4 + uLayer * 2.0) * 1.55;
  float waveB = sin(pos.y * 0.42 - slowTime * 1.1 + aRandom * 1.2) * 1.05;
  float waveC = sin((pos.x + pos.y) * 0.18 + slowTime * 1.7) * 1.35;

  float lowNoise = snoise(vec3(pos.x * 0.055, pos.y * 0.055, slowTime * 0.7)) * 2.2;
  float detail = snoise(vec3(pos.x * 0.16, pos.y * 0.13, slowTime * 1.1)) * 0.38;

  // Ridge creates those textile-like folds
  float ridgeLine = sin(pos.x * 0.22 + pos.y * 0.16 + slowTime * 1.4);
  float ridge = smoothstep(0.30, 1.0, ridgeLine);

  float surface = (waveA + waveB + waveC + lowNoise + detail) * uWaveIntensity;
  surface += ridge * 1.65 * uWaveIntensity;

  pos.z += surface;

  // Very controlled lateral motion to keep grid readable
  float driftX = snoise(vec3(pos.x * 0.045, pos.y * 0.060, uTime * 0.05));
  float driftY = snoise(vec3(pos.y * 0.045, pos.x * 0.060, uTime * 0.05 + 20.0));

  pos.x += driftX * uFlowStrength;
  pos.y += driftY * uFlowStrength * 0.65;

  // Keep ordered structure visible
  vec3 structured = original + vec3(0.0, 0.0, surface);
  pos = mix(pos, structured, uStructureStrength);

  // ------------------------------------------------------
  // Mouse interaction — subtle surface disturbance
  // ------------------------------------------------------
  vec2 mouseDelta = pos.xy - uMouse;
  float mouseDist = length(mouseDelta);
  float mouseForce = 1.0 - smoothstep(0.0, 1.2, mouseDist);
  vec2 mouseDir = normalize(mouseDelta + vec2(0.0001));

  pos.xy += mouseDir * mouseForce * 0.12;
  pos.z -= mouseForce * 0.28;

  // ------------------------------------------------------
  // Text repulsion — depress/open the surface, do not explode it
  // ------------------------------------------------------
  float pushTitle = getPushField(pos.xy, uTitle, 11.5, 3.2);
  float pushP2 = getPushField(pos.xy, uP2, 9.0, 2.2);
  float pushP3 = getPushField(pos.xy, uP3, 7.0, 1.8);

  float maskTitle = clamp(pushTitle * uTitleStrength, 0.0, 1.0);
  float maskP2 = clamp(pushP2 * uP2Strength, 0.0, 1.0);
  float maskP3 = clamp(pushP3 * uP3Strength, 0.0, 1.0);

  float totalMask = max(maskTitle, max(maskP2, maskP3));

  vec2 titleDir = normalize((pos.xy - uTitle) + vec2(0.0001));
  vec2 p2Dir = normalize((pos.xy - uP2) + vec2(0.0001));
  vec2 p3Dir = normalize((pos.xy - uP3) + vec2(0.0001));

  // Minimal lateral opening
  pos.xy += titleDir * maskTitle * 0.42;
  pos.xy += p2Dir * maskP2 * 0.34;
  pos.xy += p3Dir * maskP3 * 0.30;

  // Main effect: surface depression around text
  pos.z -= totalMask * (2.4 + uLayer * 0.8);

  // ------------------------------------------------------
  // Varyings
  // ------------------------------------------------------
  float crest = clamp((surface + 4.0) / 8.0, 0.0, 1.0);
  crest = max(crest, ridge * 0.85);

  vCrest = crest;
  vRandom = aRandom;
  vBand = aBand;
  vMask = totalMask;
  vGridU = u;
  vGridV = v;
  vOpacity = uOpacity;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  vDepth = clamp((-mvPosition.z - 6.0) / 18.0, 0.0, 1.0);

  // Larger points in foreground, smaller in depth
  float baseSize = mix(1.6, 3.4, aRandom);
  float crestBoost = 1.0 + smoothstep(0.66, 1.0, crest) * 0.85;
  float depthScale = 18.0 / -mvPosition.z;
  float maskSize = max(0.15, 1.0 - totalMask * 0.70);

  gl_PointSize = baseSize * uPointScale * crestBoost * depthScale * maskSize;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
varying float vCrest;
varying float vRandom;
varying float vBand;
varying float vMask;
varying float vDepth;
varying float vGridU;
varying float vGridV;
varying float vOpacity;

void main() {
  vec2 uv = gl_PointCoord.xy - vec2(0.5);
  float r = length(uv);

  if (r > 0.5) discard;

  float core = 1.0 - smoothstep(0.0, 0.18, r);
  float soft = 1.0 - smoothstep(0.16, 0.5, r);
  float rim = smoothstep(0.44, 0.12, r);

  vec3 deep = vec3(0.010, 0.018, 0.040);
  vec3 blueSilver = vec3(0.46, 0.58, 0.72);
  vec3 silver = vec3(0.78, 0.86, 0.94);
  vec3 white = vec3(0.96, 0.985, 1.0);

  float crestLight = smoothstep(0.58, 1.0, vCrest);
  float rarity = smoothstep(0.55, 0.98, vRandom);

  // Subtle diagonal shimmer, helps the ordered grid feel premium
  float diagonal = smoothstep(0.12, 1.0, vGridU * 0.55 + vGridV * 0.45);
  float sheen = crestLight * (0.55 + diagonal * 0.45);

  vec3 color = mix(deep, blueSilver, 0.42 + sheen * 0.36);
  color = mix(color, silver, crestLight * 0.48);
  color = mix(color, white, core * crestLight * rarity * 0.58);

  color += white * rim * crestLight * 0.10;

  float alpha = soft * (0.22 + vBand * 0.30 + crestLight * 0.52);
  alpha += core * crestLight * rarity * 0.20;

  // Fade in depth slightly
  alpha *= mix(1.0, 0.58, vDepth);

  // Text holes
  alpha *= (1.0 - vMask * 0.88);

  gl_FragColor = vec4(color, alpha * vOpacity);
}
`;

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function range(value: number, start: number, end: number) {
  if (end <= start) return value >= end ? 1 : 0;
  return clamp01((value - start) / (end - start));
}

function createGridGeometry(cols: number, rows: number, width: number, height: number) {
  const count = cols * rows;

  const positions = new Float32Array(count * 3);
  const randoms = new Float32Array(count);
  const bands = new Float32Array(count);
  const gridU = new Float32Array(count);
  const gridV = new Float32Array(count);

  let i = 0;
  let i3 = 0;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const u = x / (cols - 1);
      const v = y / (rows - 1);

      // Ordered grid with tiny micro-jitter to avoid perfect CG stiffness.
      // Keep this very small: reference depends on visible order.
      const jitter = 0.018;
      const jx = (Math.random() - 0.5) * jitter;
      const jy = (Math.random() - 0.5) * jitter;

      positions[i3 + 0] = (u - 0.5 + jx) * width;
      positions[i3 + 1] = (v - 0.5 + jy) * height;
      positions[i3 + 2] = 0;

      randoms[i] = Math.random();

      // Stronger presence toward lower/foreground bands
      bands[i] = Math.pow(v, 1.25);

      gridU[i] = u;
      gridV[i] = v;

      i++;
      i3 += 3;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
  geometry.setAttribute("aBand", new THREE.BufferAttribute(bands, 1));
  geometry.setAttribute("aGridU", new THREE.BufferAttribute(gridU, 1));
  geometry.setAttribute("aGridV", new THREE.BufferAttribute(gridV, 1));

  return geometry;
}

function CameraRig() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 3.0, 15.5);
    camera.lookAt(0, -1.6, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

function OrderedParticleSheet({
  progress,
  anchors,
  position = [0, -3.1, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  cols = 260,
  rows = 150,
  width = 22,
  height = 12,
  layer = 0,
  opacity = 1,
  pointScale = 1,
  flowStrength = 0.18,
  structureStrength = 0.78,
  waveIntensity = 1,
}: OrderedSheetProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  const { camera, size } = useThree();

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);

  const worldMouse = useMemo(() => new THREE.Vector3(1000, 1000, 0), []);
  const localMouse = useMemo(() => new THREE.Vector3(1000, 1000, 0), []);

  const worldTitle = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const worldP2 = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const worldP3 = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  const localTitle = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const localP2 = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const localP3 = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  const mouseTarget = useMemo(() => new THREE.Vector2(1000, 1000), []);
  const smoothMouse = useMemo(() => new THREE.Vector2(1000, 1000), []);

  const geometry = useMemo(
    () => createGridGeometry(cols, rows, width, height),
    [cols, rows, width, height]
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: progress },
      uLayer: { value: layer },
      uOpacity: { value: opacity },
      uPointScale: { value: pointScale },
      uFlowStrength: { value: flowStrength },
      uStructureStrength: { value: structureStrength },
      uWaveIntensity: { value: waveIntensity },

      uMouse: { value: new THREE.Vector2(1000, 1000) },

      uTitle: { value: new THREE.Vector2(0, 0) },
      uTitleStrength: { value: 0 },

      uP2: { value: new THREE.Vector2(0, 0) },
      uP2Strength: { value: 0 },

      uP3: { value: new THREE.Vector2(0, 0) },
      uP3Strength: { value: 0 },
    }),
    [layer, opacity, pointScale, flowStrength, structureStrength, waveIntensity, progress]
  );

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      mouseTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [mouseTarget]);

  const screenToWorldOnPlane = (
    normalized: { x: number; y: number },
    target: THREE.Vector3
  ) => {
    const ndc = new THREE.Vector2(
      normalized.x * 2 - 1,
      -(normalized.y * 2 - 1)
    );

    raycaster.setFromCamera(ndc, camera);
    raycaster.ray.intersectPlane(plane, target);

    return target;
  };

  useFrame((state) => {
    const material = materialRef.current;
    const group = groupRef.current;
    if (!material || !group) return;

    const time = state.clock.elapsedTime;

    smoothMouse.lerp(mouseTarget, 0.06);

    raycaster.setFromCamera(smoothMouse, camera);
    raycaster.ray.intersectPlane(plane, worldMouse);

    localMouse.copy(worldMouse);
    group.worldToLocal(localMouse);

    screenToWorldOnPlane(anchors.title, worldTitle);
    screenToWorldOnPlane(anchors.p2, worldP2);
    screenToWorldOnPlane(anchors.p3, worldP3);

    localTitle.copy(worldTitle);
    localP2.copy(worldP2);
    localP3.copy(worldP3);

    group.worldToLocal(localTitle);
    group.worldToLocal(localP2);
    group.worldToLocal(localP3);

    const titleStrength = 1.0 * (1.0 - range(progress, 0.22, 0.44));
    const p2Strength = range(progress, 0.16, 0.36) * (1.0 - range(progress, 0.52, 0.74));
    const p3Strength = range(progress, 0.38, 0.60) * (1.0 - range(progress, 0.72, 0.94));

    material.uniforms.uTime.value = time;
    material.uniforms.uProgress.value = progress;

    material.uniforms.uMouse.value.set(localMouse.x, localMouse.y);

    material.uniforms.uTitle.value.set(localTitle.x, localTitle.y);
    material.uniforms.uP2.value.set(localP2.x, localP2.y);
    material.uniforms.uP3.value.set(localP3.x, localP3.y);

    material.uniforms.uTitleStrength.value = titleStrength;
    material.uniforms.uP2Strength.value = p2Strength;
    material.uniforms.uP3Strength.value = p3Strength;

    material.uniforms.uOpacity.value = opacity;
    material.uniforms.uPointScale.value = pointScale;
    material.uniforms.uFlowStrength.value = flowStrength;
    material.uniforms.uStructureStrength.value = structureStrength;
    material.uniforms.uWaveIntensity.value = waveIntensity;
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
      materialRef.current?.dispose();
    };
  }, [geometry]);

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          depthTest
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

function OrderedParticleField({ progress = 0, anchors }: IntroFlowFieldProps) {
  const safeAnchors = anchors ?? {
    title: { x: 0.5, y: 0.28 },
    p2: { x: 0.5, y: 0.5 },
    p3: { x: 0.5, y: 0.7 },
  };

  return (
    <>
      <CameraRig />

      {/* Main lower membrane */}
      <OrderedParticleSheet
        progress={progress}
        anchors={safeAnchors}
        position={[0, -4.35, -0.6]}
        rotation={[-0.12, 0, 0]}
        scale={[1.15, 1, 1]}
        cols={270}
        rows={145}
        width={23}
        height={12.5}
        layer={0}
        opacity={1.0}
        pointScale={1.18}
        flowStrength={0.13}
        structureStrength={0.84}
        waveIntensity={1.0}
      />

      {/* Right/back large membrane */}
      <OrderedParticleSheet
        progress={progress}
        anchors={safeAnchors}
        position={[4.8, -2.4, -4.2]}
        rotation={[-0.22, -0.38, 0.15]}
        scale={[1.05, 1.18, 1]}
        cols={230}
        rows={135}
        width={19}
        height={12}
        layer={0.55}
        opacity={0.72}
        pointScale={0.92}
        flowStrength={0.10}
        structureStrength={0.88}
        waveIntensity={0.82}
      />

      {/* Left foreground mound */}
      <OrderedParticleSheet
        progress={progress}
        anchors={safeAnchors}
        position={[-5.7, -5.2, 1.8]}
        rotation={[-0.08, 0.28, -0.08]}
        scale={[0.72, 0.82, 1]}
        cols={150}
        rows={105}
        width={13}
        height={8.5}
        layer={0.15}
        opacity={0.86}
        pointScale={1.45}
        flowStrength={0.10}
        structureStrength={0.88}
        waveIntensity={1.18}
      />

      {/* Background veil */}
      <OrderedParticleSheet
        progress={progress}
        anchors={safeAnchors}
        position={[-1.2, -1.4, -7.4]}
        rotation={[-0.28, 0.18, -0.05]}
        scale={[1.25, 1.05, 1]}
        cols={190}
        rows={110}
        width={18}
        height={10}
        layer={0.95}
        opacity={0.34}
        pointScale={0.72}
        flowStrength={0.08}
        structureStrength={0.92}
        waveIntensity={0.68}
      />
    </>
  );
}

export default function IntroFlowField({
  progress = 0,
  anchors,
}: IntroFlowFieldProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        camera={{
          position: [0, 3.0, 15.5],
          fov: 38,
          near: 0.1,
          far: 60,
        }}
      >
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#030712", 8, 25]} />

        <OrderedParticleField progress={progress} anchors={anchors} />

        <EffectComposer>
          <Bloom
            intensity={0.32}
            luminanceThreshold={0.62}
            luminanceSmoothing={0.42}
          />
          <Vignette eskil={false} offset={0.18} darkness={0.72} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
