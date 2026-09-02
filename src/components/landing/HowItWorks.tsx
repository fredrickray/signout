import Link from "next/link";
import {
  ArrowRight,
  Gift,
  Link2,
  PenLine,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const how = [
  {
    step: "Step 1",
    title: "Create Profile",
    body: "Sign up and add your school, faculty, and photo in under 2 minutes.",
    icon: UserRound,
  },
  {
    step: "Step 2",
    title: "Share Your Link",
    body: "One beautiful link for WhatsApp, Instagram, X — plus a printable QR.",
    icon: Link2,
  },
  {
    step: "Step 3",
    title: "Collect Signatures",
    body: "Friends sign your 3D shirt. Their ink sits on the fabric as you rotate.",
    icon: PenLine,
  },
  {
    step: "Step 4",
    title: "Receive Gifts",
    body: "Enable cash gifts — bank transfer or Paystack — with personal notes.",
    icon: Gift,
  },
  {
    step: "Step 5",
    title: "Preserve Forever",
    body: "Keep the digital shirt, upload your physical one, request framing.",
    icon: ShieldCheck,
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="bg-surface px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-3xl">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          How it works
        </p>
        <h2 className="mt-3 text-center font-display text-4xl text-ink md:text-5xl">
          From sign-up to{" "}
          <span className="italic text-gradient-gold">forever memory.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-muted">
          Five simple steps to turn your graduation into a keepsake the whole
          world helped you write.
        </p>

        <ol className="mt-12 space-y-4">
          {how.map(({ step, title, body, icon: Icon }) => (
            <li key={step} className="card-clean relative px-6 py-6 md:px-8">
              <span className="absolute right-5 top-5 rounded-full bg-accent/15 px-3 py-1 font-display text-xs font-semibold text-accent-deep md:right-6 md:top-6">
                {step}
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-[0_8px_20px_rgba(109,40,217,0.25)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-2xl text-ink">{title}</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted md:text-base">
                {body}
              </p>
            </li>
          ))}
        </ol>

        <div
          id="start"
          className="mt-16 overflow-hidden rounded-[2rem] bg-ink px-8 py-14 text-center text-white md:px-16"
        >
          <p className="font-script text-2xl text-accent">
            — Sign. Share. Remember. —
          </p>
          <h3 className="mt-4 font-display text-4xl md:text-5xl">
            Graduation Ends.
            <br />
            Memories Shouldn&apos;t.
          </h3>
          <p className="mx-auto mt-4 max-w-lg text-white/70">
            Create your Sign-Out page today. Receive signatures, messages, and
            gifts on a shirt the whole world helped you write.
          </p>
          <Link href="/login?tab=create" className="btn-primary mt-8">
            Create Your Celebration
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4 text-xs text-white/45">
            No App Required · Mobile Friendly · Secure Payments
          </p>
        </div>
      </div>
    </section>
  );
}
