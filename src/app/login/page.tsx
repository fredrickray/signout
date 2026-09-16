"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { ApiError, login, register } from "@/lib/api";
import { saveSession } from "@/lib/auth-storage";

function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialTab = params.get("tab") === "create" ? "create" : "signin";
  const [tab, setTab] = useState<"signin" | "create">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const heading = useMemo(
    () => (tab === "signin" ? "Welcome" : "Create your page"),
    [tab],
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result =
        tab === "create"
          ? await register({
              email: email.trim(),
              password,
              full_name: name.trim(),
            })
          : await login({
              email: email.trim(),
              password,
            });

      saveSession(result.user, result.tokens);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Could not reach the server. Is the API running?");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-wash flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-line bg-white p-8 shadow-[var(--shadow-lg)]">
        <Link
          href="/"
          className="mx-auto block text-center font-display text-2xl text-ink"
        >
          Sign-Out
          <span className="text-brand">!</span>
        </Link>
        <h1 className="mt-6 text-center font-display text-4xl text-ink">
          {heading}
        </h1>
        <p className="mt-2 text-center font-script text-xl text-brand">
          Sign. Share. Remember.
        </p>

        <div className="mt-8 mb-5 grid grid-cols-2 rounded-full bg-surface p-1">
          <button
            type="button"
            onClick={() => {
              setTab("signin");
              setError(null);
            }}
            className={`rounded-full py-2 text-sm font-semibold transition ${
              tab === "signin" ? "bg-white text-ink shadow-sm" : "text-muted"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("create");
              setError(null);
            }}
            className={`rounded-full py-2 text-sm font-semibold transition ${
              tab === "create" ? "bg-white text-ink shadow-sm" : "text-muted"
            }`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {tab === "create" ? (
            <label className="block text-sm font-medium text-ink">
              Full name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none ring-brand focus:ring-2"
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
          ) : null}

          <label className="block text-sm font-medium text-ink">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none ring-brand focus:ring-2"
              placeholder="you@school.edu.ng"
              autoComplete="email"
            />
          </label>

          <label className="block text-sm font-medium text-ink">
            Password
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none ring-brand focus:ring-2"
              placeholder="••••••••"
              autoComplete={tab === "create" ? "new-password" : "current-password"}
            />
          </label>

          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Please wait…"
              : tab === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="hero-wash flex min-h-screen items-center justify-center">
          Loading…
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
