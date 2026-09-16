"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, logout, me, type ApiUser } from "@/lib/api";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
} from "@/lib/auth-storage";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);
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

    me(token)
      .then((fresh) => {
        setUser(fresh);
        localStorage.setItem("signout:user", JSON.stringify(fresh));
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearSession();
          router.replace("/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load profile");
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
        <h1 className="font-display text-4xl text-ink">
          Welcome{user?.full_name ? `, ${user.full_name}` : ""}
        </h1>
        <p className="mt-2 text-muted">{user?.email}</p>

        {error ? (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/s/laetitia"
            className="card-clean block p-6 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Demo
            </p>
            <h2 className="mt-2 font-display text-2xl text-ink">
              Open 3D sign-out shirt
            </h2>
            <p className="mt-2 text-sm text-muted">
              Try the rotatable graduation shirt experience.
            </p>
          </Link>
          <div className="card-clean p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-green">
              Next
            </p>
            <h2 className="mt-2 font-display text-2xl text-ink">
              Create your celebration page
            </h2>
            <p className="mt-2 text-sm text-muted">
              Page creation flow will live here next.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
