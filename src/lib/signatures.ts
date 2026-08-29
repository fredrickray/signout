import type { ShirtSignature } from "./types";
import { DEMO_GRADUATE } from "./types";

const storageKey = (slug: string) => `signout:signatures:${slug}`;

const SEED_SIGNATURES: ShirtSignature[] = [
  {
    id: "seed-1",
    name: "Fred",
    message: "Congrats! Wishing you the best always ✨",
    color: "#1d4ed8",
    side: "front",
    u: 0.28,
    v: 0.62,
    imageData: "",
    scale: 1,
    rotation: -8,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-2",
    name: "Blessing",
    message: "Gooo girl. New stage ❤️",
    color: "#9f1239",
    side: "front",
    u: 0.55,
    v: 0.7,
    imageData: "",
    scale: 1.05,
    rotation: 6,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-3",
    name: "Daddy",
    message: "Proud of you always",
    color: "#0a1628",
    side: "front",
    u: 0.72,
    v: 0.58,
    imageData: "",
    scale: 0.95,
    rotation: -4,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-4",
    name: "Chioma",
    message: "To the moon and beyond!",
    color: "#1a6b5c",
    side: "back",
    u: 0.4,
    v: 0.65,
    imageData: "",
    scale: 1.1,
    rotation: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-5",
    name: "Tunde",
    message: "Class of legends 🎓",
    color: "#b8952a",
    side: "back",
    u: 0.62,
    v: 0.55,
    imageData: "",
    scale: 1,
    rotation: -10,
    createdAt: new Date().toISOString(),
  },
];

function createTextSignatureImage(
  text: string,
  color: string,
  width = 512,
  height = 220,
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
  ctx.font = "italic 42px 'Segoe Script', 'Apple Chancery', cursive";

  const words = text.split(" ");
  let line = "";
  let y = height / 2 - 20;
  const lineHeight = 48;
  const maxWidth = width - 48;

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, width / 2, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, width / 2, y);
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
    return JSON.parse(raw) as ShirtSignature[];
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
