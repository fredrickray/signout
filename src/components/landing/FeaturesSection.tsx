import {
  Gift,
  QrCode,
  Shirt,
  PenLine,
  ImageIcon,
  Frame,
} from "lucide-react";

const features = [
  {
    icon: Shirt,
    title: "3D Digital T-Shirt",
    body: "A rotatable, mobile-first shirt — front and back — with signatures mapped to the fabric.",
  },
  {
    icon: PenLine,
    title: "Real Signatures",
    body: "Visitors draw with finger, mouse, or stylus. Every stroke lives on your shirt.",
  },
  {
    icon: Gift,
    title: "Graduation Gifts",
    body: "Bank transfer or Paystack. Public or anonymous. With heartfelt notes.",
  },
  {
    icon: QrCode,
    title: "QR Code Sharing",
    body: "Print on flyers or invitation cards. One scan to open and sign.",
  },
  {
    icon: ImageIcon,
    title: "Shirt Preservation",
    body: "Upload photos of your physical shirt to keep both worlds together.",
  },
  {
    icon: Frame,
    title: "Premium Framing",
    body: "Standard, Premium, or Acrylic — frame and deliver the memory home.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="px-5 py-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Everything you need
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight text-ink md:text-5xl">
          Built for the moment that{" "}
          <span className="italic text-coral">only happens once.</span>
        </h2>
        <p className="mt-4 max-w-xl text-ink-soft">
          A premium toolkit for graduates — designed to feel as meaningful as
          the day itself.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-3xl border border-line bg-cloth p-6 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal/10 text-teal">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
