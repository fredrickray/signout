"use client";

import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { Canvas, ThreeEvent, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import type {
  GraduateProfile,
  ShirtSide,
  ShirtSignature,
  Vec3,
} from "@/lib/types";
import { SHIRT_MODEL_URL } from "@/lib/types";

export type HitPayload = {
  side: ShirtSide;
  position: Vec3;
  normal: Vec3;
};

type ShirtMeshProps = {
  profile: GraduateProfile;
  signatures: ShirtSignature[];
  signMode: boolean;
  pendingHit: HitPayload | null;
  onHit: (hit: HitPayload) => void;
};

const SIGNABLE = new Set([
  "Continuous_cotton_shirt",
  "Bottom_hem",
  "Crew_neck_ribbing",
]);

/** DecalGeometry crashes without a proper index — prepare meshes safely. */
function prepareMeshGeometry(mesh: THREE.Mesh) {
  const geometry = mesh.geometry;
  if (!geometry.getAttribute("normal")) {
    geometry.computeVertexNormals();
  }
  // Three DecalGeometry treats `undefined` index as indexed and crashes.
  if (geometry.index == null) {
    geometry.setIndex(null);
  }
}

function createHeaderCanvas(profile: GraduateProfile) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#0a1628";
  ctx.font = "700 92px Georgia, serif";
  ctx.fillText(profile.name, 512, 150);
  ctx.font = "500 36px system-ui, sans-serif";
  ctx.fillStyle = "#334155";
  ctx.fillText(profile.school, 512, 220);
  ctx.font = "400 30px system-ui, sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText(profile.faculty, 512, 270);
  ctx.font = "700 56px Georgia, serif";
  ctx.fillStyle = "#0a1628";
  ctx.fillText(profile.classOf, 512, 350);
  ctx.strokeStyle = "rgba(184, 149, 42, 0.7)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(300, 390);
  ctx.lineTo(724, 390);
  ctx.stroke();
  return canvas;
}

function createHighlightCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.clearRect(0, 0, 256, 256);
  ctx.strokeStyle = "rgba(26, 107, 92, 0.95)";
  ctx.lineWidth = 12;
  ctx.setLineDash([16, 10]);
  ctx.beginPath();
  ctx.roundRect(28, 28, 200, 200, 24);
  ctx.stroke();
  return canvas;
}

function useCanvasTexture(factory: () => HTMLCanvasElement, deps: unknown[]) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    const canvas = factory();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    setTexture((prev) => {
      prev?.dispose();
      return tex;
    });
    return () => {
      tex.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return texture;
}

function orientationFromNormal(normal: Vec3, twistDeg = 0) {
  const n = new THREE.Vector3(...normal).normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    n,
  );
  if (twistDeg) {
    quat.multiply(
      new THREE.Quaternion().setFromAxisAngle(n, (twistDeg * Math.PI) / 180),
    );
  }
  return quat;
}

/** Surface sticker — works without mesh UVs (unlike THREE.DecalGeometry). */
function SurfaceInk({
  position,
  normal,
  twist = 0,
  width,
  height,
  map,
  renderOrder = 2,
}: {
  position: Vec3;
  normal: Vec3;
  twist?: number;
  width: number;
  height: number;
  map: THREE.Texture;
  renderOrder?: number;
}) {
  const quaternion = useMemo(
    () => orientationFromNormal(normal, twist),
    [normal, twist],
  );

  // Nudge along the normal so ink sits on top of the fabric
  const lifted = useMemo(() => {
    const n = new THREE.Vector3(...normal).normalize();
    return new THREE.Vector3(...position).addScaledVector(n, 0.004);
  }, [position, normal]);

  return (
    <mesh
      position={lifted}
      quaternion={quaternion}
      renderOrder={renderOrder}
      raycast={() => null}
    >
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        map={map}
        transparent
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-4}
        roughness={1}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function SignatureInk({ signature }: { signature: ShirtSignature }) {
  const map = useTexture(signature.imageData);
  useLayoutEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.needsUpdate = true;
  }, [map]);

  const w = 0.3 * signature.scale;
  return (
    <SurfaceInk
      position={signature.position}
      normal={signature.normal}
      twist={signature.rotation}
      width={w}
      height={w * 0.72}
      map={map}
    />
  );
}

function GraduationShirtModel({
  profile,
  signatures,
  signMode,
  pendingHit,
  onHit,
}: ShirtMeshProps) {
  const { scene } = useGLTF(SHIRT_MODEL_URL);

  const { root, shirtMesh } = useMemo((): {
    root: THREE.Group | THREE.Object3D;
    shirtMesh: THREE.Mesh | null;
  } => {
    const cloned = scene.clone(true);
    let shirt: THREE.Mesh | null = null;

    const polishMaterial = (mat: THREE.Material, meshName: string) => {
      if (!(mat instanceof THREE.MeshStandardMaterial)) return mat;
      const m = mat.clone();
      const name = (m.name || "").toLowerCase();
      if (name.includes("cotton") || SIGNABLE.has(meshName)) {
        m.color.set("#f7f4ef");
        m.roughness = 0.9;
        m.metalness = 0;
        m.envMapIntensity = 0.5;
      }
      if (name.includes("gold")) {
        m.metalness = 0.75;
        m.roughness = 0.26;
        m.envMapIntensity = 1.15;
      }
      if (name.includes("cap") || name.includes("black")) {
        m.color.set("#17191f");
        m.roughness = 0.52;
      }
      m.needsUpdate = true;
      return m;
    };

    cloned.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      prepareMeshGeometry(obj);
      obj.castShadow = true;
      obj.receiveShadow = true;

      if (obj.name === "Continuous_cotton_shirt") shirt = obj;

      obj.material = Array.isArray(obj.material)
        ? obj.material.map((m) => polishMaterial(m, obj.name))
        : polishMaterial(obj.material, obj.name);
    });

    return { root: cloned, shirtMesh: shirt };
  }, [scene]);

  const centerOffset = useMemo(() => {
    const box = new THREE.Box3().setFromObject(root);
    const center = new THREE.Vector3();
    box.getCenter(center);
    return center;
  }, [root]);

  const headerMap = useCanvasTexture(
    () => createHeaderCanvas(profile),
    [profile.name, profile.school, profile.faculty, profile.classOf],
  );
  const highlightMap = useCanvasTexture(() => createHighlightCanvas(), []);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!signMode) return;
    const target = event.object;
    if (!(target instanceof THREE.Mesh) || !SIGNABLE.has(target.name)) return;
    if (!event.face) return;

    event.stopPropagation();

    const mesh = shirtMesh ?? target;
    const localPoint = mesh.worldToLocal(event.point.clone());

    const normalMatrix = new THREE.Matrix3().getNormalMatrix(target.matrixWorld);
    const worldNormal = event.face.normal
      .clone()
      .applyMatrix3(normalMatrix)
      .normalize();

    const inv = new THREE.Matrix4().copy(mesh.matrixWorld).invert();
    const localNormal = worldNormal.clone().transformDirection(inv).normalize();

    const side: ShirtSide = worldNormal.z >= 0 ? "front" : "back";

    onHit({
      side,
      position: [localPoint.x, localPoint.y, localPoint.z],
      normal: [localNormal.x, localNormal.y, localNormal.z],
    });
  };

  // Ink lives in shirt-mesh local space
  const inkParentPosition = shirtMesh
    ? ([shirtMesh.position.x, shirtMesh.position.y, shirtMesh.position.z] as Vec3)
    : ([0, 0, 0] as Vec3);

  return (
    <group
      position={[
        -centerOffset.x,
        -centerOffset.y - 0.02,
        -centerOffset.z,
      ]}
    >
      <primitive
        object={root}
        onPointerDown={handlePointerDown}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          if (!signMode) return;
          if (e.object instanceof THREE.Mesh && SIGNABLE.has(e.object.name)) {
            e.stopPropagation();
            document.body.style.cursor = "crosshair";
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      />

      <group position={inkParentPosition}>
        {headerMap ? (
          <SurfaceInk
            position={[0, 1.05, 0.2]}
            normal={[0, 0.05, 1]}
            width={0.62}
            height={0.32}
            map={headerMap}
            renderOrder={1}
          />
        ) : null}

        {signatures.map((sig) =>
          sig.imageData ? <SignatureInk key={sig.id} signature={sig} /> : null,
        )}

        {pendingHit && highlightMap ? (
          <SurfaceInk
            position={pendingHit.position}
            normal={pendingHit.normal}
            width={0.16}
            height={0.16}
            map={highlightMap}
            renderOrder={3}
          />
        ) : null}
      </group>
    </group>
  );
}

function CameraRig() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0.4, 0.12, 2.75);
  }, [camera]);
  return null;
}

export type ShirtViewerProps = {
  profile: GraduateProfile;
  signatures: ShirtSignature[];
  signMode?: boolean;
  pendingHit?: HitPayload | null;
  onHit?: (hit: HitPayload) => void;
  className?: string;
  hint?: string;
};

export default function ShirtViewer({
  profile,
  signatures,
  signMode = false,
  pendingHit = null,
  onHit = () => undefined,
  className = "",
  hint,
}: ShirtViewerProps) {
  return (
    <div
      className={`relative h-full w-full ${className}`}
      style={{
        background:
          "radial-gradient(ellipse 70% 55% at 50% 42%, rgba(184,149,42,0.16), transparent 60%), radial-gradient(ellipse 45% 40% at 28% 28%, rgba(139,92,246,0.09), transparent 55%), #f4f0e8",
      }}
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        camera={{ fov: 35, near: 0.1, far: 50 }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight
          castShadow
          position={[3.2, 5.2, 3.8]}
          intensity={1.65}
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-2.8, 1.8, -2.2]} intensity={0.4} />
        <hemisphereLight args={["#fffaf0", "#cfc9c0", 0.45]} />
        <Suspense fallback={null}>
          <CameraRig />
          <GraduationShirtModel
            profile={profile}
            signatures={signatures}
            signMode={signMode}
            pendingHit={pendingHit}
            onHit={onHit}
          />
          <ContactShadows
            position={[0, -1.08, 0]}
            opacity={0.32}
            scale={6}
            blur={2.8}
            far={3}
          />
          <Environment preset="studio" environmentIntensity={0.5} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={1.9}
          maxDistance={4}
          minPolarAngle={Math.PI / 3.5}
          maxPolarAngle={Math.PI / 1.7}
          enabled={!signMode}
          target={[0, 0.02, 0]}
        />
      </Canvas>

      {hint ? (
        <p className="pointer-events-none absolute bottom-4 left-1/2 z-10 max-w-[90%] -translate-x-1/2 rounded-full bg-ink/85 px-4 py-2 text-center text-xs font-medium text-cloth backdrop-blur">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

useGLTF.preload(SHIRT_MODEL_URL);
