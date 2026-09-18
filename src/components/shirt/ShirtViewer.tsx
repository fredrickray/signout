"use client";

import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { Canvas, ThreeEvent, createPortal, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import {
  SHIRT_MODEL_URL,
  type GraduateProfile,
  type ShirtSide,
  type ShirtSignature,
  type Vec3,
} from "@/lib/types";

export type HitPayload = {
  side: ShirtSide;
  position: Vec3;
  normal: Vec3;
};

type ShirtMeshProps = {
  modelUrl: string;
  profile: GraduateProfile;
  signatures: ShirtSignature[];
  signMode: boolean;
  pendingHit: HitPayload | null;
  onHit: (hit: HitPayload) => void;
};

const DECORATIVE = /cap|tassel|gold|mortar|button|piping|strand|clasp|cord/i;

function isSignableMesh(name: string) {
  return !DECORATIVE.test(name);
}

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

function createHeaderCanvas(name: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#0a1628";
  ctx.font = "700 110px Georgia, serif";
  ctx.fillText(name, 512, 140);
  ctx.strokeStyle = "rgba(184, 149, 42, 0.7)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(280, 230);
  ctx.lineTo(744, 230);
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
    const lift = Math.max(width, height) * 0.025;
    return new THREE.Vector3(...position).addScaledVector(n, lift);
  }, [position, normal, width, height]);

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

function SignatureInk({
  signature,
  width,
}: {
  signature: ShirtSignature;
  width: number;
}) {
  const map = useTexture(signature.imageData);
  useLayoutEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.needsUpdate = true;
  }, [map]);

  const w = width * signature.scale;
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

const TARGET_MODEL_HEIGHT = 2.2;

/** Raycast the chest so the name sits on fabric like a signature sticker. */
function findChestSurfaceHit(mesh: THREE.Mesh, root: THREE.Object3D) {
  root.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const raycaster = new THREE.Raycaster();
  const heights = [0.76, 0.7, 0.82, 0.64];
  const xOffsets = [0, -0.06, 0.06, -0.12, 0.12];

  type Hit = { position: Vec3; normal: Vec3; score: number };
  let best: Hit | null = null;

  for (const hy of heights) {
    for (const xo of xOffsets) {
      const x = center.x + size.x * xo;
      const y = box.min.y + size.y * hy;
      const origin = new THREE.Vector3(x, y, box.max.z + Math.max(size.z, 0.2) * 2);
      const target = new THREE.Vector3(x, y, box.min.z - Math.max(size.z, 0.2));
      const dir = target.clone().sub(origin).normalize();
      raycaster.set(origin, dir);

      const hits = raycaster.intersectObject(mesh, true);
      for (const hit of hits) {
        if (!hit.face) continue;

        const worldNormal = hit.face.normal
          .clone()
          .transformDirection(hit.object.matrixWorld)
          .normalize();
        // Prefer front-facing fabric (toward the ray origin / +Z).
        const facing = worldNormal.dot(dir.clone().multiplyScalar(-1));
        if (facing < 0.2) continue;

        const localPoint = mesh.worldToLocal(hit.point.clone());
        const inv = new THREE.Matrix4().copy(mesh.matrixWorld).invert();
        const localNormal = worldNormal
          .clone()
          .transformDirection(inv)
          .normalize();

        // Prefer hits near center chest.
        const centerBias = 1 - Math.min(Math.abs(xo) * 2 + Math.abs(hy - 0.76), 1);
        const score = facing * 2 + centerBias;
        if (!best || score > best.score) {
          best = {
            position: [localPoint.x, localPoint.y, localPoint.z],
            normal: [localNormal.x, localNormal.y, localNormal.z],
            score,
          };
        }
        break;
      }
    }
  }

  return best;
}

function GraduationShirtModel({
  modelUrl,
  profile,
  signatures,
  signMode,
  pendingHit,
  onHit,
}: ShirtMeshProps) {
  const { scene } = useGLTF(modelUrl);

  const { root, shirtMesh, headerAnchor, signatureWidth, highlightSize } =
    useMemo((): {
      root: THREE.Group | THREE.Object3D;
      shirtMesh: THREE.Mesh | null;
      headerAnchor: {
        position: Vec3;
        normal: Vec3;
        width: number;
        height: number;
      };
      signatureWidth: number;
      highlightSize: number;
    } => {
      const cloned = scene.clone(true);
      let largest: THREE.Mesh | null = null;
      let largestCount = 0;

      const polishMaterial = (mat: THREE.Material) => {
        if (!(mat instanceof THREE.MeshStandardMaterial)) return mat;
        const m = mat.clone();
        // Keep textured models (e.g. rolled sleeves); only tint blank fabric.
        if (!m.map) {
          const name = (m.name || "").toLowerCase();
          if (name.includes("gold")) {
            m.metalness = 0.75;
            m.roughness = 0.26;
            m.envMapIntensity = 1.15;
          } else if (name.includes("cap") || name.includes("black")) {
            m.color.set("#17191f");
            m.roughness = 0.52;
          } else {
            m.color.set("#f7f4ef");
            m.roughness = 0.9;
            m.metalness = 0;
            m.envMapIntensity = 0.5;
          }
        }
        m.needsUpdate = true;
        return m;
      };

      cloned.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) return;
        prepareMeshGeometry(obj);
        obj.castShadow = true;
        obj.receiveShadow = true;

        const count = obj.geometry.attributes.position?.count ?? 0;
        if (isSignableMesh(obj.name) && count > largestCount) {
          largest = obj;
          largestCount = count;
        }

        obj.material = Array.isArray(obj.material)
          ? obj.material.map((m) => polishMaterial(m))
          : polishMaterial(obj.material);
      });

      // Normalize wildly different export units (cm vs meters) to a shared height.
      const rawBox = new THREE.Box3().setFromObject(cloned);
      const rawSize = new THREE.Vector3();
      rawBox.getSize(rawSize);
      const fit = rawSize.y > 0 ? TARGET_MODEL_HEIGHT / rawSize.y : 1;
      cloned.scale.setScalar(fit);

      const mesh = largest;
      let signatureWidth = 0.3 / fit;
      let highlightSize = 0.16 / fit;
      let nameWidth = 0.55 / fit;
      let nameHeight = 0.18 / fit;

      if (mesh?.geometry) {
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const bb = mesh.geometry.boundingBox;
        if (bb) {
          const h = bb.max.y - bb.min.y;
          const w = bb.max.x - bb.min.x;
          nameWidth = w * 0.38;
          nameHeight = h * 0.09;
          signatureWidth = w * 0.18;
          highlightSize = w * 0.1;
        }
      }

      const surface = mesh ? findChestSurfaceHit(mesh, cloned) : null;
      const headerAnchor = surface
        ? {
            position: surface.position,
            normal: surface.normal,
            width: nameWidth,
            height: nameHeight,
          }
        : {
            position: [0, 0.85 / fit, 0.18 / fit] as Vec3,
            normal: [0, 0.05, 1] as Vec3,
            width: nameWidth,
            height: nameHeight,
          };

      return {
        root: cloned,
        shirtMesh: mesh,
        headerAnchor,
        signatureWidth,
        highlightSize,
      };
    }, [scene]);

  const centerOffset = useMemo(() => {
    const box = new THREE.Box3().setFromObject(root);
    const center = new THREE.Vector3();
    box.getCenter(center);
    return center;
  }, [root]);

  const headerMap = useCanvasTexture(
    () => createHeaderCanvas(profile.name),
    [profile.name],
  );
  const highlightMap = useCanvasTexture(() => createHighlightCanvas(), []);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!signMode) return;
    const target = event.object;
    if (!(target instanceof THREE.Mesh) || !isSignableMesh(target.name)) return;
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

  const ink = (
    <>
      {headerMap ? (
        <SurfaceInk
          position={headerAnchor.position}
          normal={headerAnchor.normal}
          width={headerAnchor.width}
          height={headerAnchor.height}
          map={headerMap}
          renderOrder={1}
        />
      ) : null}

      {signatures.map((sig) =>
        sig.imageData ? (
          <SignatureInk
            key={sig.id}
            signature={sig}
            width={signatureWidth}
          />
        ) : null,
      )}

      {pendingHit && highlightMap ? (
        <SurfaceInk
          position={pendingHit.position}
          normal={pendingHit.normal}
          width={highlightSize}
          height={highlightSize}
          map={highlightMap}
          renderOrder={3}
        />
      ) : null}
    </>
  );

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
          if (e.object instanceof THREE.Mesh && isSignableMesh(e.object.name)) {
            e.stopPropagation();
            document.body.style.cursor = "crosshair";
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      />

      {shirtMesh ? createPortal(ink, shirtMesh) : <group>{ink}</group>}
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
  modelUrl?: string;
  signMode?: boolean;
  pendingHit?: HitPayload | null;
  onHit?: (hit: HitPayload) => void;
  className?: string;
  hint?: string;
};

export default function ShirtViewer({
  profile,
  signatures,
  modelUrl = SHIRT_MODEL_URL,
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
          "radial-gradient(ellipse 70% 55% at 50% 42%, rgba(184,149,42,0.16), transparent 60%), radial-gradient(ellipse 45% 40% at 28% 28%, rgba(5,150,105,0.08), transparent 55%), #f4f0e8",
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
            key={modelUrl}
            modelUrl={modelUrl}
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
useGLTF.preload("/models/rolled-sleeves.glb");
useGLTF.preload("/models/shirt-clo.glb");
useGLTF.preload("/models/mens-shirt.glb");
useGLTF.preload("/models/hood-down.glb");
