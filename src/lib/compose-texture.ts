import type { GraduateProfile, ShirtSide, ShirtSignature } from "./types";

const TEX_SIZE = 1024;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawFabricBase(ctx: CanvasRenderingContext2D, side: ShirtSide) {
  ctx.fillStyle = "#f7f5f1";
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  // Soft fabric weave
  ctx.strokeStyle = "rgba(10, 22, 40, 0.03)";
  ctx.lineWidth = 1;
  for (let i = 0; i < TEX_SIZE; i += 8) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, TEX_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(TEX_SIZE, i);
    ctx.stroke();
  }

  // Subtle vignette so edges feel tucked into seams
  const vignette = ctx.createRadialGradient(
    TEX_SIZE / 2,
    TEX_SIZE / 2,
    TEX_SIZE * 0.2,
    TEX_SIZE / 2,
    TEX_SIZE / 2,
    TEX_SIZE * 0.72,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(10, 22, 40, 0.06)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  // Side label watermark (very faint)
  ctx.fillStyle = "rgba(10, 22, 40, 0.04)";
  ctx.font = "600 28px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(side === "front" ? "FRONT" : "BACK", TEX_SIZE / 2, TEX_SIZE - 36);
}

function drawGraduateHeader(
  ctx: CanvasRenderingContext2D,
  profile: GraduateProfile,
) {
  ctx.fillStyle = "#0a1628";
  ctx.textAlign = "center";

  ctx.font = "700 64px Georgia, 'Times New Roman', serif";
  ctx.fillText(profile.name, TEX_SIZE / 2, 170);

  ctx.font = "500 28px system-ui, sans-serif";
  ctx.fillStyle = "#1c2e44";
  ctx.fillText(profile.school, TEX_SIZE / 2, 220);

  ctx.font = "400 24px system-ui, sans-serif";
  ctx.fillStyle = "#6b7280";
  ctx.fillText(profile.faculty, TEX_SIZE / 2, 258);

  ctx.font = "700 42px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = "#0a1628";
  ctx.fillText(profile.classOf, TEX_SIZE / 2, 320);

  // Thin gold rule under header
  ctx.strokeStyle = "rgba(184, 149, 42, 0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(TEX_SIZE * 0.28, 350);
  ctx.lineTo(TEX_SIZE * 0.72, 350);
  ctx.stroke();
}

async function stampSignature(
  ctx: CanvasRenderingContext2D,
  signature: ShirtSignature,
) {
  if (!signature.imageData) return;

  const img = await loadImage(signature.imageData);
  const baseW = 220 * signature.scale;
  const baseH = (img.height / img.width) * baseW;

  ctx.save();
  ctx.translate(signature.u * TEX_SIZE, signature.v * TEX_SIZE);
  ctx.rotate((signature.rotation * Math.PI) / 180);
  ctx.globalAlpha = 0.92;
  ctx.drawImage(img, -baseW / 2, -baseH / 2, baseW, baseH);
  ctx.restore();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function composeShirtTexture(
  side: ShirtSide,
  profile: GraduateProfile,
  signatures: ShirtSignature[],
  highlight?: { u: number; v: number } | null,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  drawFabricBase(ctx, side);

  if (side === "front") {
    drawGraduateHeader(ctx, profile);
  } else {
    ctx.fillStyle = "#0a1628";
    ctx.textAlign = "center";
    ctx.font = "600 36px Georgia, serif";
    ctx.fillText("Signed with love", TEX_SIZE / 2, 180);
    ctx.font = "400 22px system-ui, sans-serif";
    ctx.fillStyle = "#6b7280";
    ctx.fillText(`For ${profile.name}`, TEX_SIZE / 2, 220);
  }

  const sideSigs = signatures.filter((s) => s.side === side);
  for (const sig of sideSigs) {
    await stampSignature(ctx, sig);
  }

  if (highlight) {
    ctx.save();
    ctx.strokeStyle = "rgba(26, 107, 92, 0.85)";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    roundRect(
      ctx,
      highlight.u * TEX_SIZE - 90,
      highlight.v * TEX_SIZE - 50,
      180,
      100,
      12,
    );
    ctx.stroke();
    ctx.restore();
  }

  return canvas;
}

export { TEX_SIZE };
