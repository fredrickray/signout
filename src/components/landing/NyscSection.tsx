import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Flag,
  Heart,
  Mail,
  Tent,
} from "lucide-react";

const steps = [
  {
    n: "01",
    title: "CALL-UP",
    body: "Your service year begins.",
    icon: Mail,
  },
  {
    n: "02",
    title: "CAMP",
    body: "New faces. New experiences. A new chapter.",
    icon: Tent,
  },
  {
    n: "03",
    title: "SERVICE YEAR",
    body: "Capture the people, places and moments that made the year special.",
    icon: Camera,
  },
  {
    n: "04",
    title: "MEMORIES",
    body: "Preserve photos, videos, stories, messages and prayers.",
    icon: Heart,
  },
  {
    n: "05",
    title: "POP",
    body: "Celebrate completing your service year and let everyone leave their mark.",
    icon: Flag,
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
    <section className="border-t border-line bg-white px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-green-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-green-deep">
            🇳🇬 NYSC Journey
          </span>
          <h2 className="mt-5 font-display text-4xl leading-tight text-ink md:text-5xl">
            From Call-Up to POP —{" "}
            <span className="italic text-green">Preserve the Journey.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
            Your NYSC year is more than a service requirement. It is a year of
            friendships, challenges, growth, and unforgettable moments.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login?tab=create" className="btn-teal">
              Create My NYSC POP
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-1 text-sm font-semibold text-green hover:underline"
            >
              See How It Works
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Vertical timeline */}
        <ol className="relative mt-16 space-y-5">
          <div className="absolute bottom-8 left-[1.35rem] top-8 w-px bg-green/25 md:left-[1.6rem]" />
          {steps.map(({ n, title, body, icon: Icon }) => (
            <li key={n} className="relative flex gap-4 md:gap-6">
              <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-green/20 bg-white text-green shadow-sm md:h-12 md:w-12">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <article className="card-clean min-w-0 flex-1 px-6 py-6 md:px-8">
                <p className="text-xs font-semibold tracking-[0.18em] text-green">
                  {n}
                </p>
                <h3 className="mt-2 font-display text-xl tracking-wide text-ink md:text-2xl">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted md:text-base">
                  {body}
                </p>
              </article>
            </li>
          ))}
        </ol>

        <div className="mt-16 rounded-[2rem] bg-green-soft px-6 py-12 md:px-10">
          <h3 className="font-display text-3xl text-ink md:text-4xl">
            Then comes POP.
          </h3>
          <p className="mt-4 max-w-2xl text-muted">
            Choose your POP signature item and let friends, family and fellow
            corps members leave their mark on a keepsake you can spin forever.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-white bg-white p-6 shadow-[var(--shadow)]"
              >
                <div className="flex h-24 items-center justify-center rounded-2xl bg-surface text-5xl">
                  {item.emoji}
                </div>
                <h4 className="mt-5 font-display text-xl text-ink">{item.title}</h4>
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
