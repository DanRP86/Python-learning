"use client";

import { useRef, useMemo, useEffect } from "react";
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

const vertexShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform float uLayer;

uniform vec2 uTitle;
uniform float uTitleStrength;
uniform vec2 uP2;
uniform float uP2Strength;
uniform vec2 uP3;
uniform float uP3Strength;

attribute float aRandom;
attribute float aBand;

varying float vElevation;
varying float vCrest;
varying float vRandom;
varying float vBand;
varying float vTitleMask;

// --- FUNCIONES DE RUIDO BASE ---
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

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;

  return 42.0 * dot(
    m * m,
    vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3))
  );
}

// --- MAGIA: CURL NOISE ---
vec3 snoiseVec3( vec3 x ){
  float s  = snoise(vec3( x ));
  float s1 = snoise(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));
  float s2 = snoise(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));
  vec3 c = vec3( s , s1 , s2 );
  return c;
}

vec3 curlNoise( vec3 p ){
  const float e = .1;
  vec3 dx = vec3( e   , 0.0 , 0.0 );
  vec3 dy = vec3( 0.0 , e   , 0.0 );
  vec3 dz = vec3( 0.0 , 0.0 , e   );

  vec3 p_x0 = snoiseVec3( p - dx );
  vec3 p_x1 = snoiseVec3( p + dx );
  vec3 p_y0 = snoiseVec3( p - dy );
  vec3 p_y1 = snoiseVec3( p + dy );
  vec3 p_z0 = snoiseVec3( p - dz );
  vec3 p_z1 = snoiseVec3( p + dz );

  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

  const float divisor = 1.0 / ( 2.0 * e );
  return normalize( vec3( x , y , z ) * divisor );
}

float getPushField(vec2 pos, vec2 anchor, float width, float height) {
  vec2 delta = pos - anchor;
  vec2 norm = vec2(delta.x / width, delta.y / height);
  float field = 1.0 - smoothstep(0.0, 1.0, length(norm));
  return pow(field, 1.55);
}

void main() {
  vec3 pos = position;
  float band = aBand;

  vec3 curlPos = vec3(pos.x * 0.08, pos.y * 0.08, uTime * 0.05);
  vec3 curl = curlNoise(curlPos);

  float current = sin(pos.y * 0.28 + uTime * 0.22) * 0.9;
  
  // Modificaciones tuyas mantenidas
  pos.x += curl.x * (1.8 + band * 1.5) + current * (0.35 + band * 0.95);
  pos.y += curl.y * (1.5 + band * 1.2);

  float mainWave = sin(pos.x * 0.34 - uTime * 1.35 + aRandom * 6.2831) * (0.35 + band * 1.85);
  float crossWave = sin(pos.y * 0.46 + uTime * 0.92 + aRandom * 4.0) * (0.12 + band * 0.38);
  float detailWave = snoise(vec3(pos.x * 0.22, pos.y * 0.16, uTime * 0.22)) * (0.18 + band * 0.45);

  float crest = mainWave + crossWave + detailWave + (curl.z * 0.5);
  // Tu ajuste de altura de ola
  pos.z += crest * 2.0;

  // Ratón
  vec2 delta = pos.xy - uMouse;
  float distMouse = length(delta);
  float radius = 1.0;
  float force = 1.0 - smoothstep(0.0, radius, distMouse);
  vec2 dir = normalize(delta + vec2(0.0001, 0.0001));
  vec2 tangent = vec2(-dir.y, dir.x);

  pos.xy += dir * force * (0.18 + band * 0.65);
  pos.xy += tangent * force * 0.15;
  pos.z -= force * 0.15;

  // Campos de texto (con tus ajustes perfectos)
  float pushTitle = getPushField(pos.xy, uTitle, 35.0, 3.2);
  float pushP2 = getPushField(pos.xy, uP2, 15.0, 2.0); 
  float pushP3 = getPushField(pos.xy, uP3, 7.0, 1.8);

  float maskTitle = clamp(pushTitle * (uTitleStrength / 3.8), 0.0, 1.0);
  float maskP2 = clamp(pushP2 * (uP2Strength / 2.0), 0.0, 1.0);
  float maskP3 = clamp(pushP3 * (uP3Strength / 1.5), 0.0, 1.0);
  
  float totalMask = max(maskTitle, max(maskP2, maskP3));

  vec2 dirTitle = normalize((pos.xy - uTitle) + vec2(0.0001, 0.0001));
  vec2 dirP2 = normalize((pos.xy - uP2) + vec2(0.0001, 0.0001));
  vec2 dirP3 = normalize((pos.xy - uP3) + vec2(0.0001, 0.0001));

  pos.x += dirTitle.x * pushTitle * uTitleStrength * (1.8 + band * 0.6) +
           dirP2.x * pushP2 * uP2Strength * (1.8 + band * 0.6) +
           dirP3.x * pushP3 * uP3Strength * (1.8 + band * 0.6);

  float totalYPush = pushTitle * uTitleStrength + pushP2 * uP2Strength + pushP3 * uP3Strength;
  pos.y -= totalYPush * 0.34;
  pos.z -= totalYPush * (2.0 + band * 0.8);

  vElevation = pos.z;
  vCrest = clamp((crest + 2.5) / 5.0, 0.0, 1.0);
  vRandom = aRandom;
  vBand = band;
  vTitleMask = clamp(totalMask, 0.0, 1.0);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  float baseSize = mix(3.4, 6.8, aRandom) + band * 3.2;
  float layerScale = mix(1.0, 0.72, uLayer);
  float sizeMask = max(0.12, 1.0 - totalMask * 0.78);

  gl_PointSize = baseSize * layerScale * sizeMask * (15.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const baseFragmentShader = `
varying float vElevation;
varying float vCrest;
varying float vRandom;
varying float vBand;
varying float vTitleMask;

void main() {
  vec2 uv = gl_PointCoord.xy - vec2(0.5);
  float r = length(uv);
  if (r > 0.5) discard;

  float soft = 1.0 - smoothstep(0.18, 0.5, r);
  float core = 1.0 - smoothstep(0.0, 0.22, r);

  vec3 c1 = vec3(0.004, 0.012, 0.028);
  vec3 c2 = vec3(0.020, 0.050, 0.110);
  vec3 c3 = vec3(0.095, 0.170, 0.285);
  vec3 c4 = vec3(0.290, 0.480, 0.620);
  vec3 c5 = vec3(0.820, 0.930, 0.980);

  float seaMix = clamp(vBand * 0.72 + vCrest * 0.38 + vElevation * 0.05, 0.0, 1.0);

  vec3 color = mix(c1, c2, seaMix);
  color = mix(color, c3, smoothstep(0.28, 0.68, seaMix));
  color = mix(color, c4, smoothstep(0.62, 0.92, seaMix) * 0.55);

  float crestLight = smoothstep(0.72, 1.0, vCrest);
  float glassEdge = smoothstep(0.48, 0.08, r);
  float glassSheet = smoothstep(0.58, 1.0, vCrest) * (0.35 + 0.65 * vBand);

  color += c5 * crestLight * 0.18;
  color += c4 * core * 0.12;
  color += vec3(0.72, 0.88, 0.98) * glassEdge * glassSheet * 0.12;
  color += vec3(0.40, 0.62, 0.78) * soft * glassSheet * 0.05;

  float alpha = soft * (0.34 + vBand * 0.66) * (0.98 + vCrest * 0.82);
  alpha *= (1.0 - vTitleMask * 0.9);

  gl_FragColor = vec4(color, alpha * 1.38);
}
`;

const glintFragmentShader = `
varying float vElevation;
varying float vCrest;
varying float vRandom;
varying float vBand;
varying float vTitleMask;

void main() {
  vec2 uv = gl_PointCoord.xy - vec2(0.5);
  float r = length(uv);
  if (r > 0.5) discard;

  float spark = 1.0 - smoothstep(0.0, 0.18, r);
  float halo = 1.0 - smoothstep(0.05, 0.38, r);

  float crestMask = smoothstep(0.78, 1.0, vCrest);
  float bandMask = smoothstep(0.28, 0.95, vBand);
  float rarity = smoothstep(0.52, 0.96, vRandom);

  float alpha = crestMask * bandMask * rarity * (spark * 0.95 + halo * 0.18) * 0.55;
  alpha *= (1.0 - vTitleMask);

  vec3 color = mix(vec3(0.50, 0.72, 0.88), vec3(0.95, 0.99, 1.0), crestMask);
  gl_FragColor = vec4(color, alpha);
}
`;

const mistFragmentShader = `
varying float vElevation;
varying float vCrest;
varying float vRandom;
varying float vBand;
varying float vTitleMask;

void main() {
  vec2 uv = gl_PointCoord.xy - vec2(0.5);
  float r = length(uv);
  if (r > 0.5) discard;

  float soft = 1.0 - smoothstep(0.10, 0.5, r);
  float noiseMask = smoothstep(0.15, 0.95, vRandom) * smoothstep(0.15, 0.85, vBand);
  float crestMask = smoothstep(0.35, 0.95, vCrest);

  vec3 color = vec3(0.26, 0.38, 0.52);
  float alpha = soft * noiseMask * crestMask * 0.05;
  alpha *= (1.0 - vTitleMask * 0.95);

  gl_FragColor = vec4(color, alpha);
}
`;

function SeaParticles({
  progress = 0,
  anchors = {
    title: { x: 0.5, y: 0.28 },
    p2: { x: 0.5, y: 0.50 },
    p3: { x: 0.5, y: 0.70 }
  },
}: IntroFlowFieldProps) {
  const baseMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const glintMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const mistMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

  const invisiblePlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    []
  );
  
  // Nuevo: Un Raycaster dedicado exclusivamente a buscar las coordenadas de los textos
  const textRaycaster = useMemo(() => new THREE.Raycaster(), []);
  const tempVec3 = useMemo(() => new THREE.Vector3(), []);

  const rayTarget = useMemo(() => new THREE.Vector3(), []);
  const targetMouse = useMemo(() => new THREE.Vector2(1000, 1000), []);
  const smoothMouse = useMemo(() => new THREE.Vector2(1000, 1000), []);
  
  const titleWorld = useMemo(() => new THREE.Vector2(0, 0), []);
  const p2World = useMemo(() => new THREE.Vector2(0, 0), []);
  const p3World = useMemo(() => new THREE.Vector2(0, 0), []);

  const hasMovedMouse = useRef(false);

  useEffect(() => {
    const handlePointerMove = () => {
      hasMovedMouse.current = true;
    };

    window.addEventListener("pointermove", handlePointerMove, { once: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 60000;

    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const bands = new Float32Array(count);

    const seaBaseY = -6;
    const seaHeight = 12;

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 34;

      const yBias = Math.pow(Math.random(), 1.9);
      const y = seaBaseY + yBias * seaHeight;
      const band = THREE.MathUtils.clamp(1 - (y - seaBaseY) / seaHeight, 0, 1);

      const z = (Math.random() - 0.5) * (0.8 + band * 1.8);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      randoms[i] = Math.random();
      bands[i] = band;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
    geo.setAttribute("aBand", new THREE.BufferAttribute(bands, 1));

    return geo;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // --- MAGIA DEL PARALLAX (EL DESCENSO) ---
    // progress = 0: Empezamos altos (Y=10), lejos (Z=26) y mirando un poco hacia abajo (X=-0.2)
    // progress = 1: Aterrizamos en el centro (Y=0), más cerca (Z=16) y mirando recto (X=0)
    const targetY = THREE.MathUtils.lerp(15, 0, progress);
    const targetZ = THREE.MathUtils.lerp(26, 8, progress);
    const targetRotX = THREE.MathUtils.lerp(-0.30, 0, progress);

    // Interpolación suave para que la cámara parezca flotar
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.04);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.04);
    state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, targetRotX, 0.04);

    // Ratón
    if (hasMovedMouse.current) {
      state.raycaster.setFromCamera(state.pointer, state.camera);
      const hit = state.raycaster.ray.intersectPlane(invisiblePlane, rayTarget);

      if (hit) {
        targetMouse.set(rayTarget.x, rayTarget.y);
      }
    }
    smoothMouse.lerp(targetMouse, 0.08);

    // --- NUEVO SISTEMA DE RASTREO DE TEXTOS (BULLETPROOF) ---
    const getNDC = (anchor: { x: number; y: number }) => new THREE.Vector2(
      anchor.x * 2 - 1,
      -(anchor.y * 2 - 1)
    );

    const updateTextPosition = (ndc: THREE.Vector2, target: THREE.Vector2) => {
      textRaycaster.setFromCamera(ndc, state.camera);
      textRaycaster.ray.intersectPlane(invisiblePlane, tempVec3);
      target.set(tempVec3.x, tempVec3.y);
    };

    // Al usar raycaster, no importa dónde vuele la cámara, los agujeros siempre encajarán
    updateTextPosition(getNDC(anchors.title), titleWorld);
    updateTextPosition(getNDC(anchors.p2), p2World);
    updateTextPosition(getNDC(anchors.p3), p3World);

    // Fuerzas
    const titleStrength = THREE.MathUtils.smoothstep(progress, 0.01, 0.16) * 3.8;
    const p2Strength = THREE.MathUtils.smoothstep(progress, 0.20, 0.40) * 2.0; 
    const p3Strength = THREE.MathUtils.smoothstep(progress, 0.42, 0.62) * 1.5; 

    const updateUniforms = (material: THREE.ShaderMaterial | null) => {
      if (material) {
        material.uniforms.uTime.value = time;
        material.uniforms.uMouse.value.copy(smoothMouse);
        
        material.uniforms.uTitle.value.copy(titleWorld);
        material.uniforms.uP2.value.copy(p2World);
        material.uniforms.uP3.value.copy(p3World);
        
        material.uniforms.uTitleStrength.value = titleStrength;
        material.uniforms.uP2Strength.value = p2Strength;
        material.uniforms.uP3Strength.value = p3Strength;
      }
    };

    updateUniforms(baseMaterialRef.current);
    updateUniforms(glintMaterialRef.current);
    updateUniforms(mistMaterialRef.current);
  });

  const getUniforms = (layerValue: number) => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(1000, 1000) },
    uLayer: { value: layerValue },
    uTitle: { value: new THREE.Vector2(0, 0) },
    uTitleStrength: { value: 0 },
    uP2: { value: new THREE.Vector2(0, 0) },
    uP2Strength: { value: 0 },
    uP3: { value: new THREE.Vector2(0, 0) },
    uP3Strength: { value: 0 },
  });

  return (
    <>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={baseMaterialRef}
          vertexShader={vertexShader}
          fragmentShader={baseFragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
          uniforms={getUniforms(0)}
        />
      </points>

      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={glintMaterialRef}
          vertexShader={vertexShader}
          fragmentShader={glintFragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={getUniforms(1)}
        />
      </points>

      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={mistMaterialRef}
          vertexShader={vertexShader}
          fragmentShader={mistFragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
          uniforms={getUniforms(1.18)}
        />
      </points>
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
        dpr={[1, 1.5]} // Limitamos el pixel ratio a 1.5 para proteger el rendimiento en pantallas Retina/4K
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 10, 26], fov: 45 }}
      >
        <fog attach="fog" args={["#020611", 12, 28]} />
        <SeaParticles progress={progress} anchors={anchors} />
        
        {/* MAGIA CINEMATOGRÁFICA */}
        {/* disableNormalPass ahorra recursos, alpha mantiene el fondo transparente */}
        <EffectComposer disableNormalPass alpha>
          {/* luminanceThreshold: 0.2 hace que solo brillen las zonas medias/claras, no el fondo oscuro */}
          {/* mipmapBlur: Clave para que el brillo se difumine como una lente de cámara real y no como un filtro barato */}
          <Bloom 
            luminanceThreshold={0.2} 
            luminanceSmoothing={0.9} 
            intensity={1.2} 
            mipmapBlur 
          />
          {/* Oscurece los bordes para dar más inmersión */}
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}