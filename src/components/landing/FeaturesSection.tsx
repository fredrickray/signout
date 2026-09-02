import {
  Frame,
  Gift,
  ImageIcon,
  PenLine,
  QrCode,
  Shirt,
} from "lucide-react";

const features = [
  {
    icon: Shirt,
    title: "Digital T-Shirt",
    body: "A realistic, mobile-first interactive shirt — front and back — for every graduate.",
    spotlight: true,
  },
  {
    icon: PenLine,
    title: "Real Signatures",
    body: "Visitors draw with finger, mouse, or stylus. Every signature lives on your shirt.",
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
    <section id="features" className="bg-white px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Everything you need
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight text-ink md:text-5xl">
          Built for the moment that
          <br />
          <span className="italic text-gradient-gold">only happens once.</span>
        </h2>
        <p className="mt-5 max-w-xl text-muted md:text-lg">
          A premium toolkit for graduates — designed to feel as meaningful as
          the day itself.
        </p>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body, spotlight }) => (
            <article
              key={title}
              className={`relative overflow-hidden rounded-[1.75rem] border border-line bg-white p-7 shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] ${
                spotlight ? "ring-1 ring-brand/15" : ""
              }`}
            >
              {spotlight ? (
                <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-brand/20 blur-3xl" />
              ) : null}
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-[0_8px_20px_rgba(109,40,217,0.28)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="relative mt-6 text-lg font-bold text-ink">
                {title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted">
                {body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
