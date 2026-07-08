"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";

/**
 * Instanced 3D spice field.
 * Every spice type is ONE instanced mesh (a handful of draw calls total),
 * matrices updated per frame from cheap per-instance seed data.
 * `progressRef` (0..1, driven by scroll) choreographs three phases:
 *   0.00–0.35  suspended explosion, slow tumble
 *   0.35–0.70  convergence into a plated ring (the "dish")
 *   0.70–1.00  scatter + fade out
 */

interface SeedInstance {
  pos: THREE.Vector3; // explosion-cloud home
  ring: THREE.Vector3; // convergence target
  axis: THREE.Vector3; // tumble axis
  speed: number;
  scale: number;
  phase: number;
}

function makeSeeds(count: number, spread: number, ringRadius: number, scaleBase: number, scaleVar: number): SeedInstance[] {
  const seeds: SeedInstance[] = [];
  for (let i = 0; i < count; i++) {
    // Explosion cloud: biased toward a loose disc facing camera
    const r = spread * (0.35 + Math.random() * 0.65);
    const theta = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * spread * 1.1;
    // Depth-biased: most of the field sits behind the focal plane
    const pos = new THREE.Vector3(Math.cos(theta) * r, y, -2.4 + Math.random() * 3.2);
    // Ring target: a plated circle low in frame
    const ringTheta = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const rr = ringRadius * (0.82 + Math.random() * 0.36);
    const ring = new THREE.Vector3(Math.cos(ringTheta) * rr, -0.9 + Math.random() * 0.35, Math.sin(ringTheta) * rr * 0.55);
    seeds.push({
      pos,
      ring,
      axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
      speed: 0.25 + Math.random() * 0.8,
      scale: scaleBase + Math.random() * scaleVar,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return seeds;
}

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

const dummy = new THREE.Object3D();
const tmpQuat = new THREE.Quaternion();

function InstancedSpice({
  geometry,
  color,
  roughness = 0.75,
  count,
  spread,
  ringRadius,
  scaleBase,
  scaleVar,
  progressRef,
  flat = false,
}: {
  geometry: THREE.BufferGeometry;
  color: string;
  roughness?: number;
  count: number;
  spread: number;
  ringRadius: number;
  scaleBase: number;
  scaleVar: number;
  progressRef: React.MutableRefObject<number>;
  flat?: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(
    () => makeSeeds(count, spread, ringRadius, scaleBase, scaleVar),
    [count, spread, ringRadius, scaleBase, scaleVar]
  );
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness: 0.05,
        transparent: true,
      }),
    [color, roughness]
  );

  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m) return;
    const t = clock.elapsedTime;
    const p = progressRef.current;
    const converge = smoothstep(0.35, 0.7, p);
    const scatter = smoothstep(0.72, 0.98, p);
    material.opacity = 1 - scatter * 0.9;

    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      // Ambient drift around home position
      const driftX = Math.sin(t * s.speed + s.phase) * 0.16;
      const driftY = Math.cos(t * s.speed * 0.8 + s.phase) * 0.2;
      const hx = s.pos.x + driftX;
      const hy = s.pos.y + driftY;
      const hz = s.pos.z;
      // Blend home → ring, then push outward on scatter
      const px = hx + (s.ring.x - hx) * converge + s.pos.x * scatter * 1.6;
      const py = hy + (s.ring.y - hy) * converge + s.pos.y * scatter * 1.2;
      const pz = hz + (s.ring.z - hz) * converge + s.pos.z * scatter * 1.4;
      dummy.position.set(px, py, pz);
      const angle = t * s.speed * (1 - converge * 0.85) + s.phase;
      tmpQuat.setFromAxisAngle(s.axis, angle);
      dummy.quaternion.copy(tmpQuat);
      if (flat) dummy.rotateX(Math.PI / 2.2);
      dummy.scale.setScalar(s.scale * (1 - scatter * 0.4));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />;
}

/** Golden turmeric dust — one Points cloud, rotated slowly as a whole. */
function TurmericDust({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const points = useRef<THREE.Points>(null);
  const mat = useRef<THREE.PointsMaterial>(null);
  const { positions, count } = useMemo(() => {
    const count = 400;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.2 + Math.random() * 4.6;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return { positions, count };
  }, []);

  useFrame(({ clock }) => {
    if (points.current) {
      points.current.rotation.y = clock.elapsedTime * 0.03;
      points.current.rotation.x = Math.sin(clock.elapsedTime * 0.05) * 0.06;
    }
    if (mat.current) {
      const p = progressRef.current;
      mat.current.opacity = 0.75 * (1 - smoothstep(0.72, 0.98, p) * 0.85);
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        ref={mat}
        color="#e8ab3c"
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function starAniseGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const pts = 8;
  for (let i = 0; i <= pts * 2; i++) {
    const angle = (i / (pts * 2)) * Math.PI * 2;
    const radius = i % 2 === 0 ? 0.34 : 0.13;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.07, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 1, curveSegments: 4 });
  geo.center();
  return geo;
}

function Scene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const geos = useMemo(
    () => ({
      cinnamon: new THREE.CylinderGeometry(0.075, 0.1, 1.25, 7, 1, true),
      anise: starAniseGeometry(),
      cardamom: new THREE.CapsuleGeometry(0.1, 0.24, 2, 7),
      clove: new THREE.ConeGeometry(0.06, 0.3, 5),
      chilli: new THREE.TetrahedronGeometry(0.09),
      coriander: new THREE.IcosahedronGeometry(0.07, 0),
      pepper: new THREE.IcosahedronGeometry(0.06, 0),
    }),
    []
  );

  useFrame(({ camera, pointer, clock }) => {
    const p = progressRef.current;
    // Cinematic dolly: push in through convergence, drift up on exit
    camera.position.z = 8 - smoothstep(0.15, 0.7, p) * 2.6;
    camera.position.y = smoothstep(0.7, 1, p) * 1.4;
    // Gentle parallax toward pointer
    camera.position.x += (pointer.x * 0.5 - camera.position.x) * 0.04;
    camera.lookAt(0, 0, 0);
    if (group.current) {
      group.current.rotation.y = clock.elapsedTime * 0.02 + p * 0.6;
    }
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.35} color="#f7e8cf" />
      <directionalLight position={[4, 3, 6]} intensity={1.9} color="#ffd9a0" />
      <directionalLight position={[-6, -2, -4]} intensity={0.9} color="#c33a1a" />
      <pointLight position={[0, 0, 3]} intensity={0.55} color="#e8ab3c" distance={12} />

      <InstancedSpice geometry={geos.cinnamon} color="#7a4222" roughness={0.85} count={10} spread={5.2} ringRadius={2.1} scaleBase={0.4} scaleVar={0.25} progressRef={progressRef} />
      <InstancedSpice geometry={geos.anise} color="#4a2c17" roughness={0.8} count={9} spread={5.0} ringRadius={1.8} scaleBase={0.42} scaleVar={0.25} progressRef={progressRef} flat />
      <InstancedSpice geometry={geos.cardamom} color="#a8b36a" roughness={0.65} count={12} spread={5.2} ringRadius={1.6} scaleBase={0.34} scaleVar={0.2} progressRef={progressRef} />
      <InstancedSpice geometry={geos.clove} color="#3d2414" roughness={0.9} count={14} spread={4.8} ringRadius={1.5} scaleBase={0.4} scaleVar={0.2} progressRef={progressRef} />
      <InstancedSpice geometry={geos.chilli} color="#a3260f" roughness={0.6} count={22} spread={5.4} ringRadius={2.0} scaleBase={0.32} scaleVar={0.3} progressRef={progressRef} />
      <InstancedSpice geometry={geos.coriander} color="#c9a35c" roughness={0.7} count={24} spread={5.2} ringRadius={1.7} scaleBase={0.35} scaleVar={0.25} progressRef={progressRef} />
      <InstancedSpice geometry={geos.pepper} color="#1d150f" roughness={0.5} count={24} spread={5.2} ringRadius={1.9} scaleBase={0.35} scaleVar={0.25} progressRef={progressRef} />

      <TurmericDust progressRef={progressRef} />
      <fog attach="fog" args={["#120d0a", 6, 13]} />
    </group>
  );
}

export function SpiceField({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <Scene progressRef={progressRef} />
    </Canvas>
  );
}
