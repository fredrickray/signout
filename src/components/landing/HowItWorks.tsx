import Link from "next/link";
import { ArrowRight } from "lucide-react";

const how = [
  {
    step: "Step 1",
    title: "Create Profile",
    body: "Sign up and add your school, faculty, and photo in under 2 minutes.",
  },
  {
    step: "Step 2",
    title: "Share Your Link",
    body: "One beautiful link for WhatsApp, Instagram, X — plus a printable QR.",
  },
  {
    step: "Step 3",
    title: "Collect Signatures",
    body: "Friends sign your 3D shirt. Their ink wraps the fabric as you rotate.",
  },
  {
    step: "Step 4",
    title: "Receive Gifts",
    body: "Enable cash gifts — bank transfer or Paystack — with personal notes.",
  },
  {
    step: "Step 5",
    title: "Preserve Forever",
    body: "Keep the digital shirt, upload your physical one, request framing.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="border-y border-line bg-cloth/60 px-5 py-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">
          How it works
        </p>
        <h2 className="mt-3 max-w-xl font-display text-4xl text-ink md:text-5xl">
          From sign-up to{" "}
          <span className="italic text-coral">forever memory.</span>
        </h2>

        <ol className="mt-12 grid gap-4 md:grid-cols-5">
          {how.map((item) => (
            <li key={item.step} className="rounded-3xl border border-line bg-parchment p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold">
                {item.step}
              </p>
              <h3 className="mt-3 font-display text-xl text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ol>

        <div
          id="start"
          className="mt-16 overflow-hidden rounded-[2rem] bg-ink px-8 py-12 text-center text-cloth md:px-16"
        >
          <p className="font-script text-2xl text-gold-soft">
            — Sign. Share. Remember. —
          </p>
          <h3 className="mt-4 font-display text-4xl md:text-5xl">
            Graduation Ends.
            <br />
            Memories Shouldn&apos;t.
          </h3>
          <p className="mx-auto mt-4 max-w-lg text-cloth/70">
            Create your Sign-Out page today. Receive signatures, messages, and
            gifts on a 3D shirt the whole world helped you write.
          </p>
          <Link
            href="/login?tab=create"
            className="btn-primary mt-8 !bg-gold !text-ink hover:!bg-gold-soft"
          >
            Create Your Celebration
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4 text-xs text-cloth/50">
            No App Required · Mobile Friendly · Secure Payments
          </p>
        </div>
      </div>
    </section>
  );
}
