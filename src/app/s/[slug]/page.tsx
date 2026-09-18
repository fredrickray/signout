"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Gift, PenLine, Share2, X } from "lucide-react";
import ShirtViewerLazy from "@/components/shirt/ShirtViewerLazy";
import SignaturePad from "@/components/shirt/SignaturePad";
import { ApiError, getCelebration } from "@/lib/api";
import {
  addSignature,
  composeNamedSignatureImage,
  loadSignatures,
} from "@/lib/signatures";
import {
  DEMO_GRADUATE,
  SHIRT_MODEL_URL,
  SIGNATURE_COLORS,
  type GraduateProfile,
  type ShirtSide,
  type ShirtSignature,
} from "@/lib/types";

type Hit = {
  side: ShirtSide;
  position: [number, number, number];
  normal: [number, number, number];
};

export default function ShareSignPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [profile, setProfile] = useState<GraduateProfile | null>(null);
  const [modelUrl, setModelUrl] = useState(SHIRT_MODEL_URL);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [signatures, setSignatures] = useState<ShirtSignature[]>([]);
  const [signMode, setSignMode] = useState(false);
  const [pendingHit, setPendingHit] = useState<Hit | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [color, setColor] = useState<string>(SIGNATURE_COLORS[0]);
  const [ink, setInk] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setReady(false);
      setLoadError(null);

      try {
        const celeb = await getCelebration(slug);
        if (cancelled) return;
        setProfile({
          slug: celeb.slug,
          name: celeb.display_name,
          school: celeb.school,
          faculty: celeb.faculty,
          classOf: celeb.class_of,
          celebration:
            celeb.celebration_type === "nysc" ? "nysc" : "graduation",
          modelUrl: celeb.shirt?.model_url,
        });
        setModelUrl(celeb.shirt?.model_url || SHIRT_MODEL_URL);
      } catch (err) {
        if (cancelled) return;
        if (slug === DEMO_GRADUATE.slug) {
          setProfile(DEMO_GRADUATE);
          setModelUrl(SHIRT_MODEL_URL);
        } else if (err instanceof ApiError && err.status === 404) {
          setLoadError("This celebration page was not found.");
        } else {
          setLoadError(
            err instanceof Error ? err.message : "Failed to load page",
          );
        }
      }

      if (!cancelled) {
        setSignatures(loadSignatures(slug));
        setReady(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const onHit = useCallback((hit: Hit) => {
    setPendingHit(hit);
    setDrawerOpen(true);
  }, []);

  const startSigning = () => {
    setSignMode(true);
    setPendingHit(null);
  };

  const cancelSigning = () => {
    setSignMode(false);
    setPendingHit(null);
    setDrawerOpen(false);
    setInk(null);
    setMessage("");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pendingHit || !ink || !name.trim()) return;

    const imageData = await composeNamedSignatureImage({
      name: name.trim(),
      message: message.trim() || undefined,
      inkDataUrl: ink,
      color,
    });

    const next: ShirtSignature = {
      id: crypto.randomUUID(),
      name: name.trim(),
      message: message.trim() || undefined,
      color,
      side: pendingHit.side,
      position: pendingHit.position,
      normal: pendingHit.normal,
      imageData,
      scale: 1,
      rotation: (Math.random() * 16 - 8) | 0,
      createdAt: new Date().toISOString(),
    };

    const all = addSignature(slug, next);
    setSignatures(all);
    cancelSigning();
  };

  const hint = signMode
    ? pendingHit
      ? "Finish your signature below"
      : "Tap a spot on the shirt to place your signature"
    : "Drag to rotate · Front & back";

  if (loadError && !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-parchment px-4 text-center">
        <p className="text-muted">{loadError}</p>
        <Link href="/" className="btn-primary">
          Go home
        </Link>
      </div>
    );
  }

  if (!ready || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-parchment text-muted">
        Loading shirt…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment">
      <header className="flex items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-xl text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal text-sm text-cloth">
            🎓
          </span>
          Sign-Out
        </Link>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-cloth px-4 py-2 text-sm font-semibold text-ink"
          onClick={() => {
            void navigator.clipboard?.writeText(window.location.href);
          }}
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </header>

      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-16 md:px-8">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={startSigning}
            className="btn-primary !bg-teal hover:!bg-teal-deep"
          >
            <PenLine className="h-4 w-4" />
            Sign the shirt
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-full border border-line bg-cloth/60 px-5 py-3 text-sm font-semibold text-muted"
          >
            <Gift className="h-4 w-4" />
            Gifts not active
          </button>
          {signMode ? (
            <button
              type="button"
              onClick={cancelSigning}
              className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-coral"
            >
              Cancel
            </button>
          ) : null}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-stretch">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-line shadow-[var(--shadow)] sm:aspect-[16/12] lg:aspect-auto lg:min-h-[560px]">
            <div className="absolute inset-0">
              <ShirtViewerLazy
                profile={profile}
                signatures={signatures}
                modelUrl={modelUrl}
                signMode={signMode}
                pendingHit={pendingHit}
                onHit={onHit}
                hint={hint}
              />
            </div>
          </div>

          <aside className="rounded-[1.5rem] border border-line bg-cloth p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
              {profile.celebration === "nysc" ? "NYSC" : "Graduation"}
            </p>
            <h1 className="mt-2 font-display text-3xl text-ink">
              {profile.name}
            </h1>
            <p className="mt-1 text-sm text-muted">Name on the shirt</p>

            <dl className="mt-6 space-y-4 border-t border-line pt-5">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                  School
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">
                  {profile.school}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Faculty
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">
                  {profile.faculty}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Class
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">
                  {profile.classOf}
                </dd>
              </div>
            </dl>
          </aside>
        </div>

        <section className="rounded-[1.5rem] border border-teal/20 bg-teal/5 px-6 py-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
            Prayer Wall
          </p>
          <h2 className="mt-2 font-display text-3xl text-ink">
            Say a prayer for {profile.name}
          </h2>
          <p className="mt-2 text-sm text-muted">
            Leave a blessing, a memory, or a gift — it stays on their shirt
            forever.
          </p>
        </section>

        <section>
          <h3 className="font-display text-2xl text-ink">
            Wall of signatures ({signatures.length})
          </h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {signatures.map((sig) => (
              <article
                key={sig.id}
                className="rounded-2xl border border-line bg-cloth p-5 shadow-sm"
              >
                <p
                  className="font-script text-2xl leading-snug"
                  style={{ color: sig.color }}
                >
                  {sig.message || "Signed with love"}
                </p>
                <p className="mt-3 text-sm text-muted">— {sig.name}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wider text-muted/70">
                  {sig.side}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {drawerOpen && pendingHit ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <form
            onSubmit={submit}
            className="relative w-full max-w-md rounded-[1.75rem] bg-cloth p-6 shadow-[var(--shadow)]"
          >
            <button
              type="button"
              onClick={cancelSigning}
              className="absolute right-4 top-4 rounded-full p-1 text-muted hover:bg-parchment"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <p className="text-xs font-semibold uppercase tracking-wider text-teal">
              Placing on {pendingHit.side}
            </p>
            <h3 className="mt-1 font-display text-2xl text-ink">
              Sign {profile.name}&apos;s shirt
            </h3>

            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-ink">
                Your name
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none ring-teal focus:ring-2"
                  placeholder="e.g. Fred"
                />
              </label>

              <label className="block text-sm font-medium text-ink">
                Short message (optional)
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none ring-teal focus:ring-2"
                  placeholder="Congrats!"
                  maxLength={80}
                />
              </label>

              <SignaturePad
                color={color}
                onColorChange={setColor}
                onChange={setInk}
              />
            </div>

            <button
              type="submit"
              disabled={!ink || !name.trim()}
              className="btn-teal mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              Place signature on shirt
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
