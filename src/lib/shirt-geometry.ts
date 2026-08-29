import * as THREE from "three";

/** T-shirt silhouette in local XY (centered, roughly unit height). */
export function createShirtShape() {
  const s = new THREE.Shape();

  // Coordinates: x left→right, y bottom→top. Origin at shirt center.
  s.moveTo(-0.55, 0.55);
  s.lineTo(-0.95, 0.35); // left sleeve outer
  s.lineTo(-0.95, 0.05);
  s.lineTo(-0.55, 0.22); // left armpit
  s.lineTo(-0.52, -0.85); // left hem
  s.lineTo(0.52, -0.85); // right hem
  s.lineTo(0.55, 0.22); // right armpit
  s.lineTo(0.95, 0.05);
  s.lineTo(0.95, 0.35); // right sleeve outer
  s.lineTo(0.55, 0.55);
  s.quadraticCurveTo(0.28, 0.72, 0.18, 0.78); // right neck
  s.quadraticCurveTo(0, 0.68, -0.18, 0.78); // neck dip
  s.quadraticCurveTo(-0.28, 0.72, -0.55, 0.55);
  s.closePath();

  return s;
}

export function createShirtGeometry(depth = 0.12) {
  const shape = createShirtShape();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.015,
    bevelSegments: 2,
    curveSegments: 12,
  });

  geometry.center();
  // Remap UVs so front face uses full 0–1 and back face uses full 0–1 separately
  // ExtrudeGeometry: groups are front, back, sides — we assign custom UVs via raycasting side
  geometry.computeVertexNormals();
  return geometry;
}
