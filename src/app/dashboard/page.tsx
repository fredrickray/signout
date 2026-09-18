"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ApiError,
  listMyCelebrations,
  logout,
  me,
  type ApiCelebration,
  type ApiUser,
} from "@/lib/api";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
} from "@/lib/auth-storage";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [celebrations, setCelebrations] = useState<ApiCelebration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const cached = getStoredUser();
    if (cached) setUser(cached);

    Promise.all([me(token), listMyCelebrations(token)])
      .then(([fresh, list]) => {
        setUser(fresh);
        localStorage.setItem("signout:user", JSON.stringify(fresh));
        setCelebrations(list);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearSession();
          router.replace("/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const onLogout = async () => {
    try {
      await logout(getRefreshToken());
    } catch {
      // ignore network errors on logout
    }
    clearSession();
    router.replace("/login");
  };

  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-muted">
        Loading your account…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="font-display text-2xl text-ink">
            Sign-Out<span className="text-brand">!</span>
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-surface"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl text-ink">
              Welcome{user?.full_name ? `, ${user.full_name}` : ""}
            </h1>
            <p className="mt-2 text-muted">{user?.email}</p>
          </div>
          <Link href="/create" className="btn-primary">
            Create celebration
          </Link>
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <section className="mt-10">
          <h2 className="font-display text-2xl text-ink">Your pages</h2>
          {celebrations.length === 0 ? (
            <div className="mt-4 rounded-[1.5rem] border border-dashed border-line bg-white p-8 text-center">
              <p className="text-muted">
                No celebration yet. Pick a shirt and publish your sign-out page.
              </p>
              <Link href="/create" className="btn-primary mt-5 inline-flex">
                Choose a shirt
              </Link>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {celebrations.map((c) => (
                <Link
                  key={c.id}
                  href={`/s/${c.slug}`}
                  className="card-clean block p-6 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-green">
                    {c.celebration_type}
                    {c.shirt ? ` · ${c.shirt.name}` : ""}
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-ink">
                    {c.display_name}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {c.school} · {c.class_of}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-ink">
                    /s/{c.slug}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="mt-10">
          <Link
            href="/s/amaka"
            className="text-sm font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
          >
            Try the demo shirt →
          </Link>
        </div>
      </main>
    </div>
  );
}
