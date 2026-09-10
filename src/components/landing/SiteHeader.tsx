import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SiteHeader() {
  return (
    <header className="relative z-20 flex items-center justify-between gap-4 px-5 py-5 md:px-10">
      <Link href="/" className="font-display text-2xl tracking-tight text-ink">
        Sign-Out
        <span className="ml-0.5 inline-block h-2 w-2 rounded-full bg-gold align-super" />
      </Link>

      <nav className="hidden items-center gap-7 text-sm font-medium text-ink-soft md:flex">
        <a href="/#how" className="hover:text-ink">
          How it works
        </a>
        <a href="/#features" className="hover:text-ink">
          Features
        </a>
        <a href="/#start" className="hover:text-ink">
          Get started
        </a>
        <a href="/#universities" className="hover:text-ink">
          Hall of Fame
        </a>
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/login"
          className="rounded-full border border-ink/20 bg-cloth/60 px-4 py-2 text-sm font-semibold text-ink backdrop-blur hover:bg-cloth"
        >
          Log in
        </Link>
        <Link href="/login?tab=create" className="btn-primary !px-4 !py-2 text-sm">
          Create page
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
