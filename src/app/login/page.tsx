"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";

function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialTab = params.get("tab") === "create" ? "create" : "signin";
  const [tab, setTab] = useState<"signin" | "create">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const heading = useMemo(
    () => (tab === "signin" ? "Welcome" : "Create your page"),
    [tab],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Demo auth — route into the interactive shirt experience
    router.push("/s/laetitia");
  };

  return (
    <div className="hero-wash grain flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-cloth/90 p-8 shadow-[var(--shadow)] backdrop-blur">
        <Link
          href="/"
          className="mx-auto block text-center font-display text-2xl text-ink"
        >
          Sign-Out
          <span className="ml-0.5 inline-block h-2 w-2 rounded-full bg-gold align-super" />
        </Link>
        <h1 className="mt-6 text-center font-display text-4xl text-ink">
          {heading}
        </h1>
        <p className="mt-2 text-center font-script text-xl text-teal">
          Sign. Share. Remember.
        </p>
        <p className="mt-3 text-center text-sm text-muted">
          <Link href="/#features" className="font-medium text-teal hover:underline">
            What are you celebrating?
          </Link>
        </p>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink hover:bg-parchment"
          >
            Continue with Google
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink hover:bg-parchment"
          >
            Continue with Apple
          </button>
        </div>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted">
          <div className="h-px flex-1 bg-line" />
          or with email
          <div className="h-px flex-1 bg-line" />
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-full bg-parchment p-1">
          <button
            type="button"
            onClick={() => setTab("signin")}
            className={`rounded-full py-2 text-sm font-semibold transition ${
              tab === "signin" ? "bg-cloth text-ink shadow-sm" : "text-muted"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setTab("create")}
            className={`rounded-full py-2 text-sm font-semibold transition ${
              tab === "create" ? "bg-cloth text-ink shadow-sm" : "text-muted"
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
                className="mt-1.5 w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none ring-teal focus:ring-2"
                placeholder="Your name"
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
              className="mt-1.5 w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none ring-teal focus:ring-2"
              placeholder="you@school.edu.ng"
            />
          </label>

          <label className="block text-sm font-medium text-ink">
            <span className="flex items-center justify-between">
              Password
              {tab === "signin" ? (
                <span className="text-xs font-semibold text-teal">
                  Forgot password?
                </span>
              ) : null}
            </span>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none ring-teal focus:ring-2"
              placeholder="••••••••"
            />
          </label>

          <button type="submit" className="btn-primary w-full">
            {tab === "signin" ? "Sign in" : "Create account"}
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
