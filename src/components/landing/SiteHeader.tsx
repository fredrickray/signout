import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-10">
        <Link href="/" className="font-display text-2xl tracking-tight text-ink">
          Sign-Out
          <span className="text-brand">!</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex">
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
            🏆 Hall of Fame
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-semibold text-ink-soft hover:text-ink"
          >
            Log in
          </Link>
          <Link href="/login?tab=create" className="btn-primary !px-4 !py-2.5 text-sm">
            Create page
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
