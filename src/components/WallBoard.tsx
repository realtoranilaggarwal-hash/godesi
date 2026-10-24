"use client";

import { useRef, useState } from "react";
import { startWallCheckoutAction } from "@/app/actions/ads";

type Brick = {
  n: number;
  state: "free" | "reserved" | "live";
  title?: string;
  imageUrl?: string;
  linkUrl?: string;
  bannerId?: string;
};

const COLS = 12;

const TINTS = [
  "border-amber-300 bg-amber-50 text-amber-700",
  "border-rose-300 bg-rose-50 text-rose-700",
  "border-orange-300 bg-orange-50 text-orange-700",
  "border-emerald-300 bg-emerald-50 text-emerald-700",
  "border-sky-300 bg-sky-50 text-sky-700",
  "border-violet-300 bg-violet-50 text-violet-700",
  "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700",
  "border-teal-300 bg-teal-50 text-teal-700",
];

/**
 * The interactive wall board: vendors drag across free bricks to pick a block
 * (million-dollar-script style), then check out for $1 a brick.
 */
export function WallBoard({
  bricks,
  priceUsd,
}: {
  bricks: Brick[];
  priceUsd: number;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [dragging, setDragging] = useState(false);
  const anchor = useRef<number | null>(null);
  const moved = useRef(false);
  const [booking, setBooking] = useState(false);
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const cellOf = (n: number) => ({ col: (n - 1) % COLS, row: Math.floor((n - 1) / COLS) });
  const brickAt = (n: number) => bricks[n - 1];

  const rectSelect = (from: number, to: number) => {
    const a = cellOf(from);
    const b = cellOf(to);
    const next = new Set<number>();
    for (let row = Math.min(a.row, b.row); row <= Math.max(a.row, b.row); row++) {
      for (let col = Math.min(a.col, b.col); col <= Math.max(a.col, b.col); col++) {
        const n = row * COLS + col + 1;
        if (brickAt(n)?.state === "free") next.add(n);
      }
    }
    setSelected(next);
  };

  const down = (n: number) => {
    if (brickAt(n)?.state !== "free") return;
    anchor.current = n;
    moved.current = false;
    setDragging(true);
  };

  const enter = (n: number) => {
    if (dragging && anchor.current !== null && n !== anchor.current) {
      moved.current = true;
      rectSelect(anchor.current, n);
    }
  };

  const up = () => {
    // A plain click toggles that brick; a drag already built the selection.
    if (anchor.current !== null && !moved.current) {
      const n = anchor.current;
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(n)) next.delete(n);
        else next.add(n);
        return next;
      });
    }
    setDragging(false);
    anchor.current = null;
  };

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("purpose", "banner");
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
      setImageUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed — try again");
    } finally {
      setUploading(false);
    }
  };

  const book = async () => {
    if (!selected.size) return;
    setBusy(true);
    setError(null);
    try {
      const result = await startWallCheckoutAction({
        cells: Array.from(selected).sort((a, b) => a - b),
        title,
        linkUrl,
        imageUrl,
      });
      if (result?.error) {
        setError(
          result.error === "stripe_unavailable"
            ? "Card checkout isn't configured yet — message us and we'll book your bricks manually."
            : result.error === "stripe_session"
              ? "Could not start checkout — please try again."
              : result.error,
        );
      }
    } catch (e) {
      if (!(e instanceof Error && e.message === "NEXT_REDIRECT")) {
        setError("Something went wrong — please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  const selectedCount = selected.size;

  return (
    <div className="space-y-4">
      <div
        onPointerUp={up}
        onPointerLeave={up}
        className="select-none rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-rose-50 p-3 sm:p-5"
        style={{ touchAction: "pan-y" }}
      >
        <div className="grid grid-cols-12 gap-1 sm:gap-1.5">
          {bricks.map((brick) => {
            const picked = selected.has(brick.n);
            if (brick.state === "live") {
              return (
                <a
                  key={brick.n}
                  href={`/api/banners/${brick.bannerId}/click`}
                  target="_blank"
                  rel="noreferrer sponsored"
                  title={brick.title}
                  className="relative aspect-square overflow-hidden rounded-md border-2 border-amber-300 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={brick.imageUrl}
                    alt={brick.title ?? `Brick ${brick.n}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </a>
              );
            }
            if (brick.state === "reserved") {
              return (
                <div
                  key={brick.n}
                  title={`Brick ${brick.n} — just booked`}
                  className="flex aspect-square items-center justify-center rounded-md border-2 border-indigo-300 bg-indigo-100 text-[8px] font-black uppercase text-indigo-500"
                >
                  {brick.n}
                </div>
              );
            }
            return (
              <button
                key={brick.n}
                type="button"
                onPointerDown={() => down(brick.n)}
                onPointerEnter={() => enter(brick.n)}
                title={`Brick ${brick.n} — $${priceUsd}`}
                className={`flex aspect-square items-center justify-center rounded-md border-2 text-[9px] font-black transition ${
                  picked
                    ? "border-indigo-500 bg-indigo-500 text-white shadow-md"
                    : `border-dashed opacity-70 hover:opacity-100 ${TINTS[brick.n % TINTS.length]}`
                }`}
              >
                {brick.n}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-center text-xs font-semibold text-slate-500">
          Drag across the free bricks to pick your spot — every brick is $
          {priceUsd}. Colored numbers are open, indigo blocks are just booked.
        </p>
      </div>

      {selectedCount > 0 ? (
        <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 via-violet-50 to-fuchsia-50 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-lg font-black text-slate-900">
              🧱 {selectedCount} brick{selectedCount > 1 ? "s" : ""} = $
              {selectedCount * priceUsd}
              <span className="ml-2 text-xs font-semibold text-slate-500">
                bricks {Array.from(selected).sort((a, b) => a - b).slice(0, 15).join(", ")}
                {selectedCount > 15 ? "…" : ""} — yours for good
              </span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setBooking(true)}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-black text-white shadow hover:opacity-90"
              >
                Book {selectedCount === 1 ? "this brick" : "these bricks"} →
              </button>
            </div>
          </div>

          {booking ? (
            <div className="mt-4 space-y-3 rounded-2xl bg-white/80 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Your name / business
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Raj Jewels, Iselin"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-normal"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Link when people click
                  <input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://yourwebsite.com or your godesi.com/business/…"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-normal"
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Upload your logo / banner
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void upload(file);
                    }}
                    className="mt-1 w-full text-sm font-normal"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  …or paste an image link
                  <input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://…/logo.png (optional — add later)"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-normal"
                  />
                </label>
              </div>
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Your wall brick"
                  className="h-16 rounded-lg border border-slate-200 object-cover"
                />
              ) : null}
              {error ? (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                  {error}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => void book()}
                disabled={busy || uploading || !title.trim() || !linkUrl.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 px-4 py-3 text-base font-black text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy
                  ? "Opening checkout…"
                  : `Pay $${selectedCount * priceUsd} — book ${selectedCount} brick${selectedCount > 1 ? "s" : ""} today 🧱`}
              </button>
              <p className="text-center text-xs text-slate-500">
                Card checkout by Stripe. Your bricks show as booked right away and
                go live on the wall once we approve the artwork (usually same day).
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
