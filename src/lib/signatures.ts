import type { ShirtSignature } from "./types";
import { DEMO_GRADUATE } from "./types";

/** Bump when demo seed placements change so localStorage refreshes. */
const SEED_VERSION = "v8";
const storageKey = (slug: string) =>
  `signout:signatures:${SEED_VERSION}:${slug}`;

/**
 * Seed placements raycast onto shirtie.glb torso (mesh-local),
 * scattered around the name rather than piled at the origin.
 */
const SEED_SIGNATURES: ShirtSignature[] = [
  {
    id: "seed-1",
    name: "Fred",
    message: "You did that!",
    color: "#1d4ed8",
    side: "front",
    position: [-59.4, 346.2, 122.1],
    normal: [-0.012, -0.502, 0.865],
    imageData: "",
    scale: 0.78,
    rotation: -12,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-2",
    name: "Ngozi",
    message: "Next chapter!",
    color: "#9f1239",
    side: "front",
    position: [65.2, 346.2, 122.2],
    normal: [-0.008, -0.576, 0.817],
    imageData: "",
    scale: 0.72,
    rotation: 10,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-3",
    name: "Uncle Emeka",
    message: "Proud forever",
    color: "#0a1628",
    side: "front",
    position: [2.9, 255.2, 109.2],
    normal: [0.003, 0.016, 1],
    imageData: "",
    scale: 0.85,
    rotation: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-4",
    name: "Zainab",
    message: "Shine on",
    color: "#c45c26",
    side: "front",
    position: [-90.6, 300.7, 90.3],
    normal: [-0.652, -0.183, 0.736],
    imageData: "",
    scale: 0.7,
    rotation: -8,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-5",
    name: "Tunde",
    message: "Legends only",
    color: "#b8952a",
    side: "front",
    position: [96.3, 300.7, 85.6],
    normal: [0.655, -0.233, 0.719],
    imageData: "",
    scale: 0.74,
    rotation: 14,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-6",
    name: "Chioma",
    message: "See you up",
    color: "#1a6b5c",
    side: "back",
    position: [-59.4, 391.8, -95.7],
    normal: [-0.12, -0.139, -0.983],
    imageData: "",
    scale: 0.76,
    rotation: -6,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-7",
    name: "Bola",
    message: "God abeg",
    color: "#1d4ed8",
    side: "back",
    position: [65.2, 346.2, -84.5],
    normal: [0.25, -0.207, -0.946],
    imageData: "",
    scale: 0.7,
    rotation: 9,
    createdAt: new Date().toISOString(),
  },
];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function hashSeed(input: string) {
  let s = 2166136261;
  for (let i = 0; i < input.length; i++) {
    s ^= input.charCodeAt(i);
    s = Math.imul(s, 16777619);
  }
  return s >>> 0;
}

function makeRng(seed: number) {
  let s = seed || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

/** Scribble ink that looks like a handwritten signature. */
function drawFakeInk(
  ctx: CanvasRenderingContext2D,
  color: string,
  seedKey: string,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const rand = makeRng(hashSeed(seedKey));
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = 0.95;

  // Primary stroke — wavy name-like path
  ctx.lineWidth = 3.5 + rand() * 2.5;
  ctx.beginPath();
  let px = x + w * 0.08;
  let py = y + h * (0.35 + rand() * 0.25);
  ctx.moveTo(px, py);
  const loops = 4 + Math.floor(rand() * 3);
  for (let i = 0; i < loops; i++) {
    const nx = x + w * (0.12 + (0.76 * (i + 1)) / loops);
    const ny = y + h * (0.2 + rand() * 0.55);
    const cpx = (px + nx) / 2 + (rand() - 0.5) * w * 0.08;
    const cpy = Math.min(py, ny) - h * (0.1 + rand() * 0.35);
    ctx.quadraticCurveTo(cpx, cpy, nx, ny);
    px = nx;
    py = ny;
  }
  ctx.stroke();

  // Secondary flourish / underline
  ctx.lineWidth = 2 + rand() * 1.5;
  ctx.beginPath();
  const uy = y + h * (0.72 + rand() * 0.12);
  ctx.moveTo(x + w * 0.1, uy);
  ctx.bezierCurveTo(
    x + w * 0.35,
    uy + h * 0.18,
    x + w * 0.65,
    uy - h * 0.12,
    x + w * 0.9,
    uy + h * 0.05,
  );
  ctx.stroke();

  // Small end flick
  if (rand() > 0.35) {
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    const fx = x + w * (0.82 + rand() * 0.1);
    const fy = y + h * (0.28 + rand() * 0.2);
    ctx.moveTo(fx, fy);
    ctx.quadraticCurveTo(fx + w * 0.06, fy - h * 0.2, fx + w * 0.02, fy + h * 0.15);
    ctx.stroke();
  }

  ctx.restore();
}

type LayoutOpts = {
  name: string;
  message?: string;
  color: string;
  inkDataUrl?: string;
  /** When set, draw generated scribble instead of (or as fallback for) ink */
  fakeInkSeed?: string;
};

/**
 * Compact sticker: name → short message → ink, tightly stacked.
 * Used for live signing and demo seeds.
 */
async function composeStickerImage(opts: LayoutOpts): Promise<string> {
  if (typeof document === "undefined") return opts.inkDataUrl || "";

  const width = 640;
  const height = 300;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return opts.inkDataUrl || "";

  ctx.clearRect(0, 0, width, height);
  ctx.textAlign = "center";
  ctx.fillStyle = opts.color;

  const cx = width / 2;
  let y = 18;

  // Name
  ctx.font = "700 36px Georgia, 'Times New Roman', serif";
  ctx.textBaseline = "top";
  ctx.fillText(opts.name, cx, y);
  y += 40;

  // Short message — close under the name
  const message = opts.message?.trim();
  if (message) {
    ctx.font = "italic 28px Caveat, 'Segoe Script', cursive";
    ctx.globalAlpha = 0.92;
    ctx.fillText(message, cx, y);
    ctx.globalAlpha = 1;
    y += 32;
  } else {
    y += 4;
  }

  // Drawn / fake signature ink — close under the message
  const inkTop = y + 2;
  const inkAreaH = height - inkTop - 12;
  const inkAreaW = width - 80;
  const inkX = 40;

  let drewInk = false;
  if (opts.inkDataUrl) {
    try {
      const img = await loadImage(opts.inkDataUrl);
      const scale = Math.min(inkAreaW / img.width, inkAreaH / img.height, 1.1);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (width - w) / 2;
      ctx.drawImage(img, x, inkTop, w, h);
      drewInk = true;
    } catch {
      // fall through to fake ink
    }
  }

  if (!drewInk) {
    drawFakeInk(
      ctx,
      opts.color,
      opts.fakeInkSeed || opts.name,
      inkX,
      inkTop,
      inkAreaW,
      Math.max(inkAreaH, 70),
    );
  }

  return canvas.toDataURL("image/png");
}

/** Name on top, drawn signature underneath — what gets stamped on the shirt. */
export async function composeNamedSignatureImage(opts: {
  name: string;
  message?: string;
  inkDataUrl: string;
  color: string;
}): Promise<string> {
  return composeStickerImage({
    name: opts.name,
    message: opts.message,
    color: opts.color,
    inkDataUrl: opts.inkDataUrl,
  });
}

function createNamedSeedImage(
  name: string,
  message: string,
  color: string,
  seedId: string,
): string {
  if (typeof document === "undefined") return "";

  // Sync path for seeds — same layout, always with fake ink
  const width = 640;
  const height = 300;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.clearRect(0, 0, width, height);
  ctx.textAlign = "center";
  ctx.fillStyle = color;

  const cx = width / 2;
  let y = 18;

  ctx.font = "700 36px Georgia, 'Times New Roman', serif";
  ctx.textBaseline = "top";
  ctx.fillText(name, cx, y);
  y += 40;

  if (message.trim()) {
    ctx.font = "italic 28px Caveat, 'Segoe Script', cursive";
    ctx.globalAlpha = 0.92;
    ctx.fillText(message.trim(), cx, y);
    ctx.globalAlpha = 1;
    y += 32;
  }

  drawFakeInk(ctx, color, `${seedId}:${name}`, 40, y + 2, width - 80, 110);

  return canvas.toDataURL("image/png");
}

export function getSeedSignatures(): ShirtSignature[] {
  return SEED_SIGNATURES.map((sig) => ({
    ...sig,
    imageData:
      sig.imageData ||
      createNamedSeedImage(
        sig.name,
        sig.message || sig.name,
        sig.color,
        sig.id,
      ),
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
      imageData: createNamedSeedImage(
        sig.name,
        sig.message || sig.name,
        sig.color,
        sig.id,
      ),
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
