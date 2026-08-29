"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SIGNATURE_COLORS } from "@/lib/types";

type SignaturePadProps = {
  color: string;
  onColorChange: (color: string) => void;
  onChange: (dataUrl: string | null) => void;
};

export default function SignaturePad({
  color,
  onColorChange,
  onChange,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

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
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.6;
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    setHasInk(true);
    onChange(canvas.toDataURL("image/png"));
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
        className="h-40 w-full touch-none rounded-2xl border border-line bg-cloth"
        style={{
          backgroundImage:
            "linear-gradient(rgba(10,22,40,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(10,22,40,0.04) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerLeave={finish}
      />

      {!hasInk ? (
        <p className="text-xs text-muted">
          Use your finger, mouse, or stylus — just like signing a real shirt.
        </p>
      ) : null}
    </div>
  );
}
