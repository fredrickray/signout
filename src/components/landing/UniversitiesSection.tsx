const universities = [
  ["FUAM", "Federal University of Agriculture"],
  ["BUK", "Bayero University Kano"],
  ["UNIZIK", "Nnamdi Azikiwe University"],
  ["FUTA", "FUT Akure"],
  ["UNIBEN", "University of Benin"],
  ["LASU", "Lagos State University"],
  ["UNILAG", "University of Lagos"],
  ["UI", "University of Ibadan"],
  ["ABU", "Ahmadu Bello University"],
  ["OAU", "Obafemi Awolowo University"],
  ["UNN", "University of Nigeria"],
  ["CU", "Covenant University"],
];

export default function UniversitiesSection() {
  const row = [...universities, ...universities];

  return (
    <section
      id="universities"
      className="overflow-hidden bg-white px-5 py-20 md:px-10 md:py-28"
    >
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
          Trusted nationwide
        </p>
        <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">
          Trusted by students across{" "}
          <span className="italic text-gradient-brand">
            Nigerian universities
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-muted md:text-lg">
          Built for graduating students across universities, polytechnics, and
          higher institutions throughout Nigeria.
        </p>
      </div>

      <div className="relative mt-14">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent md:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent md:w-28" />

        <div className="flex overflow-hidden">
          <div className="animate-marquee flex min-w-max gap-4 px-2">
            {row.map(([code, name], i) => (
              <article
                key={`${code}-${i}`}
                className="w-44 shrink-0 rounded-3xl border border-line bg-white px-4 py-6 text-center shadow-[var(--shadow)]"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft font-display text-sm font-semibold text-brand">
                  {code.slice(0, 2)}
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-brand">
                  {code}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-muted">{name}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-muted">
        From Abuja to Lagos, Kano to Port Harcourt — Sign-Out helps students
        preserve graduation memories that last a lifetime.
      </p>
    </section>
  );
}
