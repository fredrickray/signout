import * as THREE from "three";

/** T-shirt silhouette in local XY (centered). */
export function createShirtShape() {
  const s = new THREE.Shape();

  s.moveTo(-0.52, 0.52);
  s.lineTo(-0.98, 0.32);
  s.lineTo(-0.98, 0.02);
  s.lineTo(-0.52, 0.2);
  s.lineTo(-0.5, -0.92);
  s.lineTo(0.5, -0.92);
  s.lineTo(0.52, 0.2);
  s.lineTo(0.98, 0.02);
  s.lineTo(0.98, 0.32);
  s.lineTo(0.52, 0.52);
  s.quadraticCurveTo(0.3, 0.7, 0.16, 0.78);
  s.quadraticCurveTo(0, 0.66, -0.16, 0.78);
  s.quadraticCurveTo(-0.3, 0.7, -0.52, 0.52);
  s.closePath();

  return s;
}

/** Map shape bounds → full 0–1 UVs so canvas textures fit the silhouette. */
export function createShirtPanelGeometry() {
  const shape = createShirtShape();
  const geometry = new THREE.ShapeGeometry(shape, 48);
  geometry.computeBoundingBox();

  const bbox = geometry.boundingBox!;
  const sizeX = bbox.max.x - bbox.min.x || 1;
  const sizeY = bbox.max.y - bbox.min.y || 1;
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // u: left→right, v: bottom→top in shape space → flip v for image space (top=0)
    uv.setXY(
      i,
      (x - bbox.min.x) / sizeX,
      (y - bbox.min.y) / sizeY,
    );
  }
  uv.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

/** Thin rim so the shirt reads as having thickness when rotated. */
export function createShirtRimGeometry(depth = 0.09) {
  const shape = createShirtShape();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 24,
  });
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}
