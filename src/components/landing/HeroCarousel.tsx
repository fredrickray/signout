"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DEMO_GRADUATE } from "@/lib/types";

type Slide = {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  image: string;
  alt: string;
};

const SLIDES: Slide[] = [
  {
    id: "grad",
    badge: "🎓 Graduation Sign-Out",
    title: "Graduation",
    subtitle: "Your graduation. Your story.",
    image: "/images/hero-shirt.jpg",
    alt: "White graduation sign-out shirt covered in handwritten signatures with a mortarboard cap",
  },
  {
    id: "nysc",
    badge: "🇳🇬 NYSC POP Sign-Out",
    title: "NYSC Journey",
    subtitle: "From Call-Up to POP.",
    image: "/images/hero-nysc.jpg",
    alt: "NYSC cap and boots hanging on a wall — POP sign-out keepsake",
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white shadow-[0_24px_60px_rgba(10,22,40,0.12)]">
        <div className="relative aspect-[4/5] bg-[#f7f4ef]">
          <Image
            key={slide.id}
            src={slide.image}
            alt={slide.alt}
            fill
            priority
            sizes="(max-width: 768px) 90vw, 420px"
            className="object-contain object-center p-2 sm:p-3"
          />

          <button
            type="button"
            aria-label="Previous"
            onClick={() =>
              setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)
            }
            className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink/50 shadow-sm backdrop-blur hover:text-ink"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => setIndex((i) => (i + 1) % SLIDES.length)}
            className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink/50 shadow-sm backdrop-blur hover:text-ink"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-4 z-20 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink shadow-sm">
            {slide.badge}
          </div>
        </div>

        <div className="flex items-end justify-between border-t border-line/60 px-5 py-4">
          <div>
            <p className="font-semibold text-ink">{slide.title}</p>
            <p className="text-sm text-muted">{slide.subtitle}</p>
          </div>
          <div className="mb-1 flex gap-1.5">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={s.title}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-ink" : "w-1.5 bg-ink/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-muted">
        Try the interactive signing shirt →{" "}
        <Link
          href={`/s/${DEMO_GRADUATE.slug}`}
          className="font-semibold text-teal hover:underline"
        >
          Open demo
        </Link>
      </p>
    </div>
  );
}
