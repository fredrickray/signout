"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  ApiError,
  createCelebration,
  listShirts,
  type ApiShirtTemplate,
} from "@/lib/api";
import { getAccessToken } from "@/lib/auth-storage";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export default function CreateCelebrationPage() {
  const router = useRouter();
  const [shirts, setShirts] = useState<ApiShirtTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [school, setSchool] = useState("");
  const [faculty, setFaculty] = useState("");
  const [classOf, setClassOf] = useState("Class of 2026");
  const [celebrationType, setCelebrationType] = useState<"graduation" | "nysc">(
    "graduation",
  );
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login?tab=create");
      return;
    }

    listShirts()
      .then((list) => {
        setShirts(list);
        if (list[0]) setSelectedId(list[0].id);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load shirts");
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Show every shirt for either celebration type — category is a soft hint only.
  const filteredShirts = shirts;

  useEffect(() => {
    if (!filteredShirts.some((s) => s.id === selectedId)) {
      setSelectedId(filteredShirts[0]?.id ?? null);
    }
  }, [filteredShirts, selectedId]);

  useEffect(() => {
    if (!slugTouched && displayName) {
      setSlug(slugify(displayName));
    }
  }, [displayName, slugTouched]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = getAccessToken();
    if (!token || !selectedId) return;

    setError(null);
    setSubmitting(true);
    try {
      const created = await createCelebration(token, {
        slug: slugify(slug),
        display_name: displayName.trim(),
        school: school.trim(),
        faculty: faculty.trim(),
        class_of: classOf.trim(),
        celebration_type: celebrationType,
        shirt_template_id: selectedId,
      });
      router.push(`/s/${created.slug}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Could not create your page. Is the API running?");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-muted">
        Loading shirt options…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link href="/dashboard" className="font-display text-2xl text-ink">
            Sign-Out<span className="text-brand">!</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-muted hover:text-ink"
          >
            Back
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green">
          Step 1 of 1
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink">
          Choose your shirt
        </h1>
        <p className="mt-2 max-w-xl text-muted">
          Pick the 3D shirt friends will rotate and sign. You can only use one
          design per celebration page.
        </p>

        {error ? (
          <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <form onSubmit={onSubmit} className="mt-8 space-y-8">
          <div className="grid grid-cols-2 gap-2 rounded-full bg-white p-1 shadow-sm">
            {(
              [
                ["graduation", "Graduation"],
                ["nysc", "NYSC"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setCelebrationType(value)}
                className={`rounded-full py-2.5 text-sm font-semibold transition ${
                  celebrationType === value
                    ? "bg-ink text-white"
                    : "text-muted hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {filteredShirts.map((shirt) => {
              const selected = shirt.id === selectedId;
              return (
                <button
                  key={shirt.id}
                  type="button"
                  onClick={() => setSelectedId(shirt.id)}
                  className={`overflow-hidden rounded-[1.5rem] border-2 bg-white text-left transition ${
                    selected
                      ? "border-green shadow-[var(--shadow)]"
                      : "border-line hover:border-ink/20"
                  }`}
                >
                  <div className="relative aspect-[4/3] bg-surface">
                    <Image
                      src={shirt.preview_image}
                      alt={shirt.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 320px"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-display text-xl text-ink">{shirt.name}</p>
                    <p className="mt-1 text-sm text-muted">{shirt.description}</p>
                    {selected ? (
                      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-green">
                        Selected
                      </p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-4 rounded-[1.5rem] border border-line bg-white p-6">
            <div>
              <h2 className="font-display text-2xl text-ink">Your details</h2>
              <p className="mt-1 text-sm text-muted">
                Only the name is printed on the shirt. School and class show on
                the page beside it.
              </p>
            </div>

            <label className="block text-sm font-medium text-ink">
              Name on shirt
              <input
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none ring-green focus:ring-2"
                placeholder="e.g. Laetitia"
              />
            </label>

            <div className="rounded-2xl border border-dashed border-line bg-surface/80 p-4 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Shown on your page (not on the fabric)
              </p>

              <label className="block text-sm font-medium text-ink">
                School / institution
                <input
                  required
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none ring-green focus:ring-2"
                  placeholder="e.g. Veritas University, Abuja"
                />
              </label>

              <label className="block text-sm font-medium text-ink">
                Faculty / department
                <input
                  required
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none ring-green focus:ring-2"
                  placeholder="e.g. Computer Science"
                />
              </label>

              <label className="block text-sm font-medium text-ink">
                Class / cohort
                <input
                  required
                  value={classOf}
                  onChange={(e) => setClassOf(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none ring-green focus:ring-2"
                  placeholder="Class of 2026"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-ink">
              Share link slug
              <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-green">
                <span className="shrink-0 text-sm text-muted">/s/</span>
                <input
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                  className="w-full outline-none"
                  placeholder="laetitia"
                  minLength={3}
                  maxLength={48}
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                />
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedId}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create sign-out page"}
          </button>
        </form>
      </main>
    </div>
  );
}
