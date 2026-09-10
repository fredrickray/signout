"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DEMO_GRADUATE } from "@/lib/types";
import HeroCarousel from "./HeroCarousel";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-4 md:px-10 md:pb-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative z-10 max-w-xl">
          <h1 className="font-display text-[2.75rem] leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl">
            Your Milestone.
            <br />
            Your Story.
            <br />
            <span className="italic text-teal">Forever Preserved.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft md:text-lg">
            From your graduation to your NYSC POP, Sign-Out helps you preserve
            the moments that matter. Collect signatures, messages, prayers,
            memories, and gifts from family and friends — anywhere in the world.
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

        <HeroCarousel />
      </div>
    </section>
  );
}
