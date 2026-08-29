"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ShirtViewerLazy from "@/components/shirt/ShirtViewerLazy";
import { DEMO_GRADUATE, type ShirtSignature } from "@/lib/types";
import { getSeedSignatures } from "@/lib/signatures";
import { useEffect, useState } from "react";

export default function Hero() {
  const [signatures, setSignatures] = useState<ShirtSignature[]>([]);

  useEffect(() => {
    setSignatures(getSeedSignatures());
  }, []);

  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-4 md:px-10 md:pb-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative z-10 max-w-xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-teal">
            Sign. Share. Remember.
          </p>
          <h1 className="font-display text-[2.75rem] leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl">
            Your Milestone.
            <br />
            Your Story.
            <br />
            <span className="italic text-teal">Forever on fabric.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft md:text-lg">
            From graduation to NYSC POP — collect signatures, prayers, and gifts
            on a real 3D keepsake friends can spin, sign, and cherish.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/login?tab=create" className="btn-primary">
              Create Your Celebration
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={`/s/${DEMO_GRADUATE.slug}`} className="btn-ghost">
              View Demo
            </Link>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-line pt-8">
            {[
              ["12k+", "Signatures"],
              ["850+", "Graduates"],
              ["60+", "Universities"],
            ].map(([stat, label]) => (
              <div key={label}>
                <dt className="font-display text-2xl text-ink md:text-3xl">
                  {stat}
                </dt>
                <dd className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="float-soft relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-white/60 bg-cloth/50 shadow-[var(--shadow)] backdrop-blur-sm">
            <ShirtViewerLazy
              profile={DEMO_GRADUATE}
              signatures={signatures}
              autoRotate
              hint="Drag to rotate · Front & back"
            />
            <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-cloth/90 px-3 py-1.5 text-xs font-semibold text-ink shadow-sm backdrop-blur">
              🎓 Graduation Sign-Out
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
