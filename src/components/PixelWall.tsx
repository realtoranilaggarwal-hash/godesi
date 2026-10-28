"use client";

import { useEffect, useRef, useState } from "react";
import { startPixelWallCheckoutAction } from "@/app/actions/ads";

type Block = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  imageUrl: string;
  linkUrl: string;
  status: string;
};

const SIZE = 1000;
const SNAP = 2; // selections snap to 2px — a 2x2 = 4px brick is the $4 minimum
const FREE_Y = 900; // bottom 100 rows = the free zone
const FREE_CODE = "godesi.com";
/** Giveaway codes — one free 4px brick anywhere (BRICK/TEMPLE for promos,
 *  FREE4 is the public code published on the site). */
const ONE_BRICK_CODES = new Set(["brick", "temple", "free4"]);
/** Member points buy one 4px brick anywhere on the board. */
const BRICK_POINTS = 100;

const hit = (blocks: Block[], px: number, py: number) =>
  blocks.find(
    (b) => px >= b.x && px < b.x + b.w && py >= b.y && py < b.y + b.h && b.status === "ACTIVE",
  );

/**
 * The million-dollar wall: a 1000x1000 canvas. Free pixels get a festive
 * checkerboard, sold blocks paint their banner across their whole rectangle,
 * and visitors drag a box to buy ($1/px, 4px min) or click a sold block.
 */
export function PixelWall({
  blocks,
  priceUsd,
  hasFreeBlock,
  creditUsd,
  pointsBalance,
  signedIn,
}: {
  blocks: Block[];
  priceUsd: number;
  /** True when the signed-in member already used their one free claim. */
  hasFreeBlock: boolean;
  /** Dollars of ad spend convertible to wall bricks. */
  creditUsd: number;
  /** Member's current points balance (0 when signed out). */
  pointsBalance: number;
  /** Signed-out visitors can explore the wall but hit the sign-in gate at booking. */
  signedIn: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const images = useRef(new Map<string, HTMLImageElement>());
  const [sel, setSel] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const drag = useRef<{ sx: number; sy: number } | null>(null);
  const [tip, setTip] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [about, setAbout] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [code, setCode] = useState("");
  const [usePoints, setUsePoints] = useState(false);
  /** Sold block under the pointer — drives the big hover preview card. */
  const [hover, setHover] = useState<{ block: Block; cx: number; cy: number } | null>(null);

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // festive open-pixels checkerboard
    for (let yy = 0; yy < SIZE; yy += 10) {
      for (let xx = 0; xx < SIZE; xx += 10) {
        const pick = (xx / 10 + yy / 10) % 8;
        ctx.fillStyle = [
          "#fff7ed", "#fff1f2", "#fefce8", "#ecfdf5",
          "#f0f9ff", "#f5f3ff", "#fdf2f8", "#f0fdfa",
        ][pick];
        ctx.fillRect(xx, yy, 10, 10);
      }
    }

    // free zone: green band across the bottom of the board
    ctx.fillStyle = "rgba(16, 185, 129, 0.18)";
    ctx.fillRect(0, FREE_Y, SIZE, SIZE - FREE_Y);
    ctx.strokeStyle = "#059669";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(1, FREE_Y + 1, SIZE - 2, SIZE - FREE_Y - 2);
    ctx.setLineDash([]);
    ctx.fillStyle = "#047857";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FREE ZONE — one free brick per member", SIZE / 2, FREE_Y + 36);

    for (const block of blocks) {
      if (block.status === "ACTIVE") {
        const img = images.current.get(block.imageUrl);
        if (img?.complete && img.naturalWidth) {
          ctx.drawImage(img, block.x, block.y, block.w, block.h);
        } else {
          ctx.fillStyle = "#fbbf24";
          ctx.fillRect(block.x, block.y, block.w, block.h);
        }
      } else {
        ctx.fillStyle = "rgba(99, 102, 241, 0.7)";
        ctx.fillRect(block.x, block.y, block.w, block.h);
      }
    }

    if (sel) {
      // Live preview: paint the uploaded art across the picked spot so the
      // vendor sees exactly what the block will look like on the wall.
      const preview = imageUrl ? images.current.get(imageUrl) : undefined;
      if (preview?.complete && preview.naturalWidth) {
        ctx.drawImage(preview, sel.x, sel.y, sel.w, sel.h);
      } else {
        ctx.fillStyle = "rgba(79, 70, 229, 0.25)";
        ctx.fillRect(sel.x, sel.y, sel.w, sel.h);
      }
      ctx.strokeStyle = "#4f46e5";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(sel.x, sel.y, sel.w, sel.h);
      ctx.setLineDash([]);
    }
  };

  useEffect(() => {
    for (const block of blocks) {
      if (block.status === "ACTIVE" && !images.current.has(block.imageUrl)) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = draw;
        img.src = block.imageUrl;
        images.current.set(block.imageUrl, img);
      }
    }
    if (imageUrl && !images.current.has(imageUrl)) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = draw;
      img.src = imageUrl;
      images.current.set(imageUrl, img);
    }
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, sel, imageUrl]);

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const px = Math.round(((e.clientX - rect.left) * SIZE) / rect.width / SNAP) * SNAP;
    const py = Math.round(((e.clientY - rect.top) * SIZE) / rect.height / SNAP) * SNAP;
    return { px: Math.min(Math.max(px, 0), SIZE), py: Math.min(Math.max(py, 0), SIZE) };
  };

  const down = (e: React.PointerEvent) => {
    const { px, py } = pos(e);
    drag.current = { sx: px, sy: py };
    setSel({ x: px, y: py, w: SNAP, h: SNAP });
  };

  const move = (e: React.PointerEvent) => {
    const { px, py } = pos(e);
    if (!drag.current) {
      const over = hit(blocks, px, py);
      canvasRef.current!.style.cursor = over ? "pointer" : "crosshair";
      setTip(over ? `${over.title} — click to visit` : null);
      setHover(over ? { block: over, cx: px, cy: py } : null);
      return;
    }
    setHover(null);
    setSel({
      x: Math.min(drag.current.sx, px),
      y: Math.min(drag.current.sy, py),
      w: Math.max(Math.abs(px - drag.current.sx), SNAP),
      h: Math.max(Math.abs(py - drag.current.sy), SNAP),
    });
  };

  const up = (e: React.PointerEvent) => {
    const { px, py } = pos(e);
    const wasClick = sel && sel.w <= SNAP && sel.h <= SNAP;
    const over = wasClick ? hit(blocks, px, py) : undefined;
    if (over) {
      window.open(`/api/wall/click/${over.id}`, "_blank", "noopener,noreferrer");
      setSel(null);
    }
    drag.current = null;
    if (sel && !wasClick) setBooking(true);
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
    if (!sel) return;
    setBusy(true);
    setError(null);
    try {
      const result = await startPixelWallCheckoutAction({
        x: sel.x, y: sel.y, w: sel.w, h: sel.h,
        title, linkUrl, imageUrl, code, description: about, usePoints,
      });
      if (result?.error) {
        setError(
          result.error === "stripe_unavailable"
            ? "Card checkout isn't configured yet — message us and we'll book your block manually."
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

  const pxCount = sel ? sel.w * sel.h : 0;
  const bricks = pxCount / 4;
  const inFreeZone = !!sel && sel.y >= FREE_Y;
  const entered = code.trim().toLowerCase();
  const codeFree =
    entered === FREE_CODE || (ONE_BRICK_CODES.has(entered) && pxCount <= 4);
  const brickCodeTooBig = ONE_BRICK_CODES.has(entered) && pxCount > 4;
  const free =
    ((inFreeZone && pxCount <= 4) || codeFree) && pxCount > 0 && !hasFreeBlock;
  /** Points redemption: 100 points buys one 4px brick anywhere — a second
   *  option alongside the one-per-member free claim. */
  const canUsePoints = !free && pxCount === 4 && pointsBalance >= BRICK_POINTS;
  const payingByPoints = canUsePoints && usePoints;
  const creditApplied = free || payingByPoints
    ? 0
    : Math.min(creditUsd, pxCount * priceUsd);
  const cost = free || payingByPoints ? 0 : pxCount * priceUsd - creditApplied;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-rose-50 p-3 sm:p-5">
        <div className="overflow-x-auto">
          <div className="relative min-w-[640px]">
            <canvas
              ref={canvasRef}
              width={SIZE}
              height={SIZE}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerLeave={() => setHover(null)}
              className="block w-full cursor-crosshair rounded-xl border border-slate-200"
              style={{ imageRendering: "pixelated", touchAction: "pan-y" }}
            />
            {hover ? (
              <div
                className="pointer-events-none absolute z-10 w-56 -translate-y-4 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl"
                style={{
                  left: `${(hover.cx / SIZE) * 100}%`,
                  // Keep the card fully on the board: clamp its center so a
                  // brick on the top/bottom edge doesn't cut it in half.
                  top: `${(Math.min(Math.max(hover.cy, 170), SIZE - 170) / SIZE) * 100}%`,
                  transform:
                    hover.cx > SIZE / 2
                      ? "translate(calc(-100% - 12px), -50%)"
                      : "translate(12px, -50%)",
                }}
              >
                {hover.block.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={hover.block.imageUrl}
                    alt={hover.block.title}
                    className="max-h-56 w-full rounded-xl border border-slate-100 object-contain"
                  />
                ) : null}
                <p className="mt-1.5 truncate px-1 text-sm font-bold text-slate-900">
                  {hover.block.title}
                </p>
                <p className="truncate px-1 pb-1 text-xs text-indigo-600">
                  Click to visit →
                </p>
              </div>
            ) : null}
          </div>
        </div>
        <p className="mt-3 text-center text-xs font-semibold text-slate-500">
          {tip ??
            `Drag a box over the open bricks — 250,000 desi bricks at $${priceUsd * 4} each. The green FREE ZONE at the bottom gives every member one free brick. Indigo = just booked, pictures = live ads (click to visit).`}
        </p>
      </div>

      {sel ? (
        <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 via-violet-50 to-fuchsia-50 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-lg font-black text-slate-900">
              🧱 {bricks.toLocaleString()} desi bricks ({pxCount.toLocaleString()}{" "}
              px) —{" "}
              {free ? (
                <span className="text-emerald-600">
                  FREE{inFreeZone ? " (free zone)" : ""}
                </span>
              ) : (
                `$${cost.toLocaleString()}`
              )}
              <span className="ml-2 text-xs font-semibold text-slate-500">
                at ({sel.x}, {sel.y}) — one payment, yours for life
                {creditApplied > 0
                  ? ` · $${creditApplied.toLocaleString()} covered by your ad credit`
                  : ""}
              </span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setSel(null); setBooking(false); }}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setBooking(true)}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-black text-white shadow hover:opacity-90"
              >
                {signedIn ? "Book this spot →" : "Sign in to book →"}
              </button>
            </div>
          </div>

          {booking && !signedIn ? (
            <div className="mt-4 rounded-2xl bg-white/80 p-4 text-center">
              <p className="text-lg font-black text-slate-900">
                🔒 Almost there — sign in to book this spot
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Bricks are booked to your GoDesi account so they stay yours for
                life. Sign in (or join free — it takes 30 seconds, and every
                member gets one free brick), then come right back here.
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <a
                  href="/login?next=/walloffame"
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-black text-white shadow hover:opacity-90"
                >
                  Sign in →
                </a>
                <a
                  href="/signup?next=/walloffame"
                  className="rounded-xl border border-indigo-300 bg-white px-4 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50"
                >
                  Join GoDesi free →
                </a>
              </div>
            </div>
          ) : booking ? (
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
              <label className="block text-sm font-semibold text-slate-700">
                About your site or project (~100 words)
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={3}
                  maxLength={600}
                  placeholder="What do you do, who do you help, why should people visit? This shows on the public vendor list under your name."
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-normal"
                />
              </label>
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
                <div className="rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-indigo-600">
                    Preview — this is how your art stretches over your bricks
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Your wall art"
                    className="max-h-40 w-full rounded-lg border border-slate-200 object-contain"
                  />
                </div>
              ) : null}
              {!inFreeZone ? (
                <label className="block max-w-xs text-sm font-semibold text-slate-700">
                  Discount code
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Have a code? Enter it here"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-normal"
                  />
                  {codeFree ? (
                    <span className="mt-1 block text-xs font-black text-emerald-600">
                      {free
                        ? "Code applied — this block is FREE!"
                        : "You've used your free brick — this one is paid."}
                    </span>
                  ) : null}
                  {brickCodeTooBig ? (
                    <span className="mt-1 block text-xs font-semibold text-amber-700">
                      {entered.toUpperCase()} covers one 4px brick — shrink your box.
                    </span>
                  ) : null}
                </label>
              ) : null}
              {canUsePoints ? (
                <label className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-800">
                  <input
                    type="checkbox"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  Use {BRICK_POINTS} points for this brick — free (you have{" "}
                  {pointsBalance.toLocaleString()} pts)
                </label>
              ) : null}
              {error ? (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                  {error}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => void book()}
                disabled={busy || uploading || !title.trim() || !linkUrl.trim() || pxCount < 4}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 px-4 py-3 text-base font-black text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy
                  ? "Working…"
                  : free
                    ? `Claim ${bricks.toLocaleString()} desi bricks — FREE 🎉`
                    : payingByPoints
                      ? `Claim this desi brick — ${BRICK_POINTS} points 🎉`
                      : `Pay $${cost.toLocaleString()} — own ${bricks.toLocaleString()} desi bricks 🧱`}
              </button>
              <p className="text-center text-xs text-slate-500">
                {free
                  ? "Free for now — your desi brick shows after a quick review (one free brick per member)."
                  : payingByPoints
                    ? `${BRICK_POINTS} points are spent when you claim — the brick shows after a quick review.`
                    : "Card checkout by Stripe. Your desi bricks light up the moment payment lands and your art stretches across the whole block."}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
