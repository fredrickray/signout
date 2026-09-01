export type ShirtSide = "front" | "back";

export type Vec3 = [number, number, number];

export type ShirtSignature = {
  id: string;
  name: string;
  message?: string;
  color: string;
  side: ShirtSide;
  /** Mesh-local position where the signature was placed */
  position: Vec3;
  /** Mesh-local surface normal at placement */
  normal: Vec3;
  /** Drawn signature as a PNG data URL */
  imageData: string;
  scale: number;
  /** Extra twist around the surface normal (degrees) */
  rotation: number;
  createdAt: string;
};

export type GraduateProfile = {
  slug: string;
  name: string;
  school: string;
  faculty: string;
  classOf: string;
  celebration: "graduation" | "nysc";
};

export const DEMO_GRADUATE: GraduateProfile = {
  slug: "laetitia",
  name: "Laetitia",
  school: "Veritas University, Abuja",
  faculty: "Computer Science",
  classOf: "Class of 2026",
  celebration: "graduation",
};

export const SIGNATURE_COLORS = [
  "#0a1628",
  "#1a6b5c",
  "#c45c26",
  "#1d4ed8",
  "#9f1239",
  "#b8952a",
] as const;

export const SHIRT_MODEL_URL = "/models/graduation-shirt.glb";
