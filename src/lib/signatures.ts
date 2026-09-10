import type { ShirtSignature } from "./types";
import { DEMO_GRADUATE } from "./types";

const storageKey = (slug: string) => `signout:signatures:v3:${slug}`;

/** Seed placements in Continuous_cotton_shirt local space (model has no UVs). */
const SEED_SIGNATURES: ShirtSignature[] = [
  {
    id: "seed-1",
    name: "Fred",
    message: "Congrats! Wishing you the best always",
    color: "#1d4ed8",
    side: "front",
    position: [-0.22, 0.72, 0.2],
    normal: [0, 0.05, 1],
    imageData: "",
    scale: 1.1,
    rotation: -8,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-2",
    name: "Blessing",
    message: "Gooo girl. New stage",
    color: "#9f1239",
    side: "front",
    position: [0.2, 0.58, 0.21],
    normal: [0.05, 0, 1],
    imageData: "",
    scale: 1.15,
    rotation: 6,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-3",
    name: "Daddy",
    message: "Proud of you always",
    color: "#0a1628",
    side: "front",
    position: [0.02, 0.42, 0.22],
    normal: [0, 0, 1],
    imageData: "",
    scale: 1.05,
    rotation: -4,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-4",
    name: "Chioma",
    message: "To the moon and beyond!",
    color: "#1a6b5c",
    side: "back",
    position: [-0.12, 0.7, -0.2],
    normal: [0, 0, -1],
    imageData: "",
    scale: 1.15,
    rotation: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-5",
    name: "Tunde",
    message: "Class of legends",
    color: "#b8952a",
    side: "back",
    position: [0.18, 0.5, -0.21],
    normal: [0, 0, -1],
    imageData: "",
    scale: 1.1,
    rotation: -10,
    createdAt: new Date().toISOString(),
  },
];

function createTextSignatureImage(
  text: string,
  color: string,
  width = 640,
  height = 280,
): string {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "italic 64px Caveat, 'Segoe Script', 'Apple Chancery', cursive";

  const words = text.split(" ");
  let line = "";
  let y = height / 2 - 28;
  const lineHeight = 68;
  const maxWidth = width - 48;
  const lines: string[] = [];

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, width / 2, y + i * lineHeight));
  return canvas.toDataURL("image/png");
}

export function getSeedSignatures(): ShirtSignature[] {
  return SEED_SIGNATURES.map((sig) => ({
    ...sig,
    imageData:
      sig.imageData ||
      createTextSignatureImage(sig.message || sig.name, sig.color),
  }));
}

function isValidSignature(sig: unknown): sig is ShirtSignature {
  if (!sig || typeof sig !== "object") return false;
  const s = sig as ShirtSignature;
  return (
    Array.isArray(s.position) &&
    s.position.length === 3 &&
    Array.isArray(s.normal) &&
    s.normal.length === 3 &&
    typeof s.id === "string"
  );
}

function hydrateSignatures(list: ShirtSignature[]): ShirtSignature[] {
  return list.filter(isValidSignature).map((sig) => {
    if (sig.imageData) return sig;
    return {
      ...sig,
      imageData: createTextSignatureImage(sig.message || sig.name, sig.color),
    };
  });
}

export function loadSignatures(slug: string): ShirtSignature[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (!raw) {
      if (slug === DEMO_GRADUATE.slug) {
        const seeded = getSeedSignatures();
        localStorage.setItem(storageKey(slug), JSON.stringify(seeded));
        return seeded;
      }
      return [];
    }
    const parsed = hydrateSignatures(JSON.parse(raw) as ShirtSignature[]);
    if (parsed.length === 0 && slug === DEMO_GRADUATE.slug) {
      const seeded = getSeedSignatures();
      localStorage.setItem(storageKey(slug), JSON.stringify(seeded));
      return seeded;
    }
    localStorage.setItem(storageKey(slug), JSON.stringify(parsed));
    return parsed;
  } catch {
    return slug === DEMO_GRADUATE.slug ? getSeedSignatures() : [];
  }
}

export function saveSignatures(slug: string, signatures: ShirtSignature[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(slug), JSON.stringify(signatures));
}

export function addSignature(slug: string, signature: ShirtSignature) {
  const next = [...loadSignatures(slug), signature];
  saveSignatures(slug, next);
  return next;
}
