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
  return (
    <section id="universities" className="px-5 py-20 md:px-10">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
          Trusted nationwide
        </p>
        <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">
          Trusted by students across{" "}
          <span className="italic text-teal">Nigerian universities</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-ink-soft">
          Built for graduating students across universities, polytechnics, and
          higher institutions throughout Nigeria.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {universities.map(([code, name]) => (
            <article
              key={code}
              className="rounded-2xl border border-line bg-cloth px-3 py-5"
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-parchment font-display text-xs text-teal">
                {code.slice(0, 2)}
              </div>
              <p className="mt-3 font-semibold text-teal">{code}</p>
              <p className="mt-1 text-[11px] leading-snug text-muted">{name}</p>
            </article>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted">
          From Abuja to Lagos, Kano to Port Harcourt — preserve graduation
          memories that last a lifetime.
        </p>
      </div>
    </section>
  );
}
