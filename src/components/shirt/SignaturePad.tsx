"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SIGNATURE_COLORS } from "@/lib/types";

type SignaturePadProps = {
  color: string;
  onColorChange: (color: string) => void;
  onChange: (dataUrl: string | null) => void;
};

/** Crop transparent padding so stamps aren't tiny ink in a huge empty canvas. */
function exportCropped(canvas: HTMLCanvasElement): string | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const { width, height } = canvas;
  const pixels = ctx.getImageData(0, 0, width, height).data;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = pixels[(y * width + x) * 4 + 3];
      if (a > 8) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) return null;

  const pad = 16;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);

  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const outCtx = out.getContext("2d");
  if (!outCtx) return null;
  outCtx.drawImage(canvas, minX, minY, w, h, 0, 0, w, h);
  return out.toDataURL("image/png");
}

export default function SignaturePad({
  color,
  onColorChange,
  onChange,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

  const publish = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = exportCropped(canvas);
    setHasInk(Boolean(data));
    onChange(data);
  }, [onChange]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onChange(null);
  }, [onChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3.2;
  }, []);

  const pointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = getCtx();
    if (!ctx) return;
    drawing.current = true;
    const { x, y } = pointerPos(e);
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = pointerPos(e);
    ctx.strokeStyle = color;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const finish = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    drawing.current = false;
    publish();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">Draw your signature</p>
        <button
          type="button"
          onClick={clear}
          className="text-sm font-medium text-teal hover:underline"
        >
          Clear
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {SIGNATURE_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Ink ${c}`}
            onClick={() => onColorChange(c)}
            className="h-7 w-7 rounded-full border-2 transition"
            style={{
              background: c,
              borderColor: color === c ? "#0a1628" : "transparent",
              transform: color === c ? "scale(1.1)" : "scale(1)",
            }}
          />
        ))}
      </div>

      <canvas
        ref={canvasRef}
        className="h-44 w-full touch-none rounded-2xl border border-line bg-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(10,22,40,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(10,22,40,0.045) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
      />

      {!hasInk ? (
        <p className="text-xs text-muted">
          Use your finger, mouse, or stylus — just like signing a real shirt.
        </p>
      ) : null}
    </div>
  );
}
