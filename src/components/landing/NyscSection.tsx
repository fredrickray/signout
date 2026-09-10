import Link from "next/link";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    n: "01",
    title: "Call-Up",
    body: "Your service year begins.",
  },
  {
    n: "02",
    title: "Camp",
    body: "New faces. New experiences. A new chapter.",
  },
  {
    n: "03",
    title: "Service Year",
    body: "Capture the people, places and moments that made the year special.",
  },
  {
    n: "04",
    title: "Memories",
    body: "Preserve photos, videos, stories, messages and prayers.",
  },
  {
    n: "05",
    title: "POP",
    body: "Celebrate completing your service year and let everyone leave their mark.",
    highlight: true,
  },
];

const items = [
  {
    title: "NYSC Boot",
    body: "Celebrate your service journey with signatures around the digital boot.",
    emoji: "👢",
  },
  {
    title: "NYSC T-Shirt",
    body: "Turn the traditional sign-out shirt into a rotatable 3D memory.",
    emoji: "👕",
  },
  {
    title: "NYSC Hoodie",
    body: "A modern digital keepsake for your service-year memories.",
    emoji: "🧥",
  },
];

export default function NyscSection() {
  return (
    <section className="px-5 py-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-deep">
              🇳🇬 NYSC Journey
            </span>
            <h2 className="mt-5 font-display text-4xl leading-tight text-ink md:text-5xl">
              From Call-Up to POP —{" "}
              <span className="italic text-teal">Preserve the Journey.</span>
            </h2>
          </div>
          <div>
            <p className="text-base leading-relaxed text-ink-soft md:text-lg">
              Your NYSC year is more than a service requirement. It is a year of
              friendships, challenges, growth, and unforgettable moments.
              Sign-Out gives you a place to preserve that journey.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/login?tab=create" className="btn-teal">
                Create My NYSC POP
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-1 text-sm font-semibold text-teal hover:underline"
              >
                See How It Works
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <ol className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step) => (
            <li
              key={step.n}
              className={`rounded-3xl border p-5 ${
                step.highlight
                  ? "border-teal/30 bg-teal/10"
                  : "border-line bg-cloth/70"
              }`}
            >
              <p className="font-display text-sm text-gold">{step.n}</p>
              <h3 className="mt-2 font-display text-xl text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-16 rounded-[2rem] bg-teal-deep px-6 py-12 text-cloth md:px-12">
          <h3 className="font-display text-3xl md:text-4xl">Then comes POP.</h3>
          <p className="mt-4 max-w-2xl text-cloth/80">
            Choose your POP signature item and let friends, family and fellow
            corps members leave their mark on a 3D keepsake you can spin forever.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl bg-cloth p-6 text-ink"
              >
                <div className="flex h-28 items-center justify-center rounded-2xl bg-parchment text-5xl">
                  {item.emoji}
                </div>
                <h4 className="mt-5 font-display text-xl">{item.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
