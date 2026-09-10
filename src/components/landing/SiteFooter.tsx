import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-cloth px-5 py-14 md:px-10">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="font-display text-2xl text-ink">
            Sign-Out
            <span className="ml-0.5 inline-block h-2 w-2 rounded-full bg-gold align-super" />
          </Link>
          <p className="mt-3 font-script text-lg text-teal">
            Sign. Share. Remember.
          </p>
          <p className="mt-3 max-w-xs text-sm text-muted">
            Preserving graduation memories for students across Africa — in three
            dimensions.
          </p>
        </div>

        {[
          {
            title: "Product",
            links: ["Features", "How it works", "Demo", "Framing"],
          },
          {
            title: "Company",
            links: ["Contact Us", "Support", "FAQs"],
          },
          {
            title: "Legal",
            links: ["Terms", "Privacy", "Gift Policy"],
          },
        ].map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-ink">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#features" className="text-sm text-muted hover:text-ink">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-12 max-w-6xl text-xs text-muted">
        © {new Date().getFullYear()} Sign-Out. All rights reserved.
      </p>
    </footer>
  );
}
