"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import { composeShirtTexture } from "@/lib/compose-texture";
import { createShirtGeometry } from "@/lib/shirt-geometry";
import type { GraduateProfile, ShirtSide, ShirtSignature } from "@/lib/types";

type HitPayload = {
  side: ShirtSide;
  u: number;
  v: number;
};

type ShirtMeshProps = {
  profile: GraduateProfile;
  signatures: ShirtSignature[];
  signMode: boolean;
  pendingHit: HitPayload | null;
  onHit: (hit: HitPayload) => void;
  autoRotate?: boolean;
};

function ShirtMesh({
  profile,
  signatures,
  signMode,
  pendingHit,
  onHit,
  autoRotate = false,
}: ShirtMeshProps) {
  const group = useRef<THREE.Group>(null);
  const frontMat = useRef<THREE.MeshStandardMaterial>(null);
  const backMat = useRef<THREE.MeshStandardMaterial>(null);
  const [frontMap, setFrontMap] = useState<THREE.CanvasTexture | null>(null);
  const [backMap, setBackMap] = useState<THREE.CanvasTexture | null>(null);

  const geometry = useMemo(() => createShirtGeometry(0.14), []);

  useEffect(() => {
    let cancelled = false;

    async function rebuild() {
      const frontCanvas = await composeShirtTexture(
        "front",
        profile,
        signatures,
        pendingHit?.side === "front"
          ? { u: pendingHit.u, v: pendingHit.v }
          : null,
      );
      const backCanvas = await composeShirtTexture(
        "back",
        profile,
        signatures,
        pendingHit?.side === "back"
          ? { u: pendingHit.u, v: pendingHit.v }
          : null,
      );

      if (cancelled) return;

      const frontTex = new THREE.CanvasTexture(frontCanvas);
      frontTex.colorSpace = THREE.SRGBColorSpace;
      frontTex.anisotropy = 8;
      frontTex.needsUpdate = true;

      const backTex = new THREE.CanvasTexture(backCanvas);
      backTex.colorSpace = THREE.SRGBColorSpace;
      backTex.anisotropy = 8;
      backTex.needsUpdate = true;

      setFrontMap((prev) => {
        prev?.dispose();
        return frontTex;
      });
      setBackMap((prev) => {
        prev?.dispose();
        return backTex;
      });
    }

    void rebuild();
    return () => {
      cancelled = true;
    };
  }, [profile, signatures, pendingHit]);

  useFrame((_, delta) => {
    if (autoRotate && group.current && !signMode) {
      group.current.rotation.y += delta * 0.35;
    }
  });

  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!signMode) return;
      event.stopPropagation();

      const normal = event.face?.normal.clone();
      if (!normal) return;
      normal.transformDirection(event.object.matrixWorld);
      const side: ShirtSide = normal.z >= 0 ? "front" : "back";

      // Prefer real mesh UVs so the stamp lands exactly where the user taps
      let u: number;
      let v: number;
      if (event.uv) {
        u = THREE.MathUtils.clamp(event.uv.x, 0.08, 0.92);
        v = THREE.MathUtils.clamp(1 - event.uv.y, 0.35, 0.9);
        // Back face UVs are often mirrored on extruded shapes
        if (side === "back") {
          u = 1 - u;
        }
      } else {
        const box = new THREE.Box3().setFromObject(event.object);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        u = THREE.MathUtils.clamp(
          (event.point.x - (center.x - size.x / 2)) / size.x,
          0.08,
          0.92,
        );
        v = THREE.MathUtils.clamp(
          1 - (event.point.y - (center.y - size.y / 2)) / size.y,
          0.35,
          0.9,
        );
      }

      onHit({ side, u, v });
    },
    [onHit, signMode],
  );

  return (
    <group ref={group} scale={1.35} position={[0, 0.05, 0]}>
      {/* Cap accent */}
      <group position={[0, 1.05, 0]} rotation={[0.1, 0.2, -0.05]}>
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.24, 0.08, 32]} />
          <meshStandardMaterial color="#0a1628" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.07, 0]} castShadow>
          <boxGeometry args={[0.55, 0.02, 0.55]} />
          <meshStandardMaterial color="#0a1628" roughness={0.5} />
        </mesh>
        <mesh position={[0.28, 0.05, 0]} rotation={[0, 0, -0.4]}>
          <cylinderGeometry args={[0.012, 0.012, 0.35, 8]} />
          <meshStandardMaterial color="#b8952a" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      <mesh
        geometry={geometry}
        castShadow
        receiveShadow
        onPointerDown={handlePointerDown}
        onPointerOver={(e) => {
          if (signMode) {
            e.stopPropagation();
            document.body.style.cursor = "crosshair";
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        {/* ExtrudeGeometry groups: 0 = sides, 1 = +Z lid (front), 2 = −Z bottom (back) */}
        <meshStandardMaterial
          attach="material-0"
          color="#ebe6dc"
          roughness={0.9}
          metalness={0}
        />
        <meshStandardMaterial
          ref={frontMat}
          attach="material-1"
          map={frontMap ?? undefined}
          color={frontMap ? "#ffffff" : "#f7f5f1"}
          roughness={0.85}
          metalness={0.02}
        />
        <meshStandardMaterial
          ref={backMat}
          attach="material-2"
          map={backMap ?? undefined}
          color={backMap ? "#ffffff" : "#f0ebe3"}
          roughness={0.85}
          metalness={0.02}
        />
      </mesh>

      {/* Soft mannequin stand */}
      <RoundedBox
        args={[0.35, 0.12, 0.35]}
        radius={0.04}
        position={[0, -1.15, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#d9d2c5" roughness={0.7} />
      </RoundedBox>
    </group>
  );
}

function CameraRig() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0.2, 3.2);
  }, [camera]);
  return null;
}

export type ShirtViewerProps = {
  profile: GraduateProfile;
  signatures: ShirtSignature[];
  signMode?: boolean;
  pendingHit?: HitPayload | null;
  onHit?: (hit: HitPayload) => void;
  autoRotate?: boolean;
  className?: string;
  hint?: string;
};

export default function ShirtViewer({
  profile,
  signatures,
  signMode = false,
  pendingHit = null,
  onHit = () => undefined,
  autoRotate = false,
  className = "",
  hint,
}: ShirtViewerProps) {
  return (
    <div className={`relative h-full w-full ${className}`}>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 40, near: 0.1, far: 50 }}
      >
        <color attach="background" args={["transparent"]} />
        <ambientLight intensity={0.65} />
        <directionalLight
          castShadow
          position={[3, 5, 4]}
          intensity={1.35}
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-3, 2, -2]} intensity={0.35} />
        <Suspense fallback={null}>
          <CameraRig />
          <ShirtMesh
            profile={profile}
            signatures={signatures}
            signMode={signMode}
            pendingHit={pendingHit}
            onHit={onHit}
            autoRotate={autoRotate}
          />
          <ContactShadows
            position={[0, -1.2, 0]}
            opacity={0.35}
            scale={8}
            blur={2.5}
            far={4}
          />
          <Environment preset="city" environmentIntensity={0.35} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={2.2}
          maxDistance={5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.7}
          enabled={!signMode}
          autoRotate={false}
        />
      </Canvas>

      {hint ? (
        <p className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-ink/80 px-4 py-2 text-center text-xs font-medium text-cloth backdrop-blur">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
