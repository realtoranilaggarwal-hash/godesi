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

const hit = (blocks: Block[], px: number, py: number) =>
  blocks.find(
    (b) => px >= b.x && px < b.x + b.w && py >= b.y && py < b.y + b.h && b.status === "ACTIVE",
  );

/**
 * The million-dollar wall: a 1000x1000 canvas. Free pixels get a festive
 * checkerboard, sold blocks paint their banner across their whole rectangle,
 * and visitors drag a box to buy ($1/px, 4px min) or click a sold block.
 */
export function PixelWall({ blocks, priceUsd }: { blocks: Block[]; priceUsd: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const images = useRef(new Map<string, HTMLImageElement>());
  const [sel, setSel] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const drag = useRef<{ sx: number; sy: number } | null>(null);
  const [tip, setTip] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
      ctx.strokeStyle = "#4f46e5";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(sel.x, sel.y, sel.w, sel.h);
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(79, 70, 229, 0.25)";
      ctx.fillRect(sel.x, sel.y, sel.w, sel.h);
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
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, sel]);

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
      return;
    }
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
        title, linkUrl, imageUrl,
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
  const cost = pxCount * priceUsd;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-rose-50 p-3 sm:p-5">
        <div className="overflow-x-auto">
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            className="block w-full min-w-[640px] cursor-crosshair rounded-xl border border-slate-200"
            style={{ imageRendering: "pixelated", touchAction: "pan-y" }}
          />
        </div>
        <p className="mt-3 text-center text-xs font-semibold text-slate-500">
          {tip ??
            `Drag a box over the open pixels — $${priceUsd} a pixel, 4 pixels ($${priceUsd * 4}) minimum. Indigo = just booked, pictures = live ads (click to visit).`}
        </p>
      </div>

      {sel ? (
        <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 via-violet-50 to-fuchsia-50 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-lg font-black text-slate-900">
              🧱 {sel.w} × {sel.h} px = {pxCount.toLocaleString()} pixels — $
              {cost.toLocaleString()}
              <span className="ml-2 text-xs font-semibold text-slate-500">
                at ({sel.x}, {sel.y}) — yours for good
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
                Book this spot →
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
                  alt="Your wall art"
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
                disabled={busy || uploading || !title.trim() || !linkUrl.trim() || pxCount < 4}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 px-4 py-3 text-base font-black text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy
                  ? "Opening checkout…"
                  : `Pay $${cost.toLocaleString()} — own ${pxCount.toLocaleString()} pixels 🧱`}
              </button>
              <p className="text-center text-xs text-slate-500">
                Card checkout by Stripe. Your pixels light up the moment payment
                lands and your art stretches across the whole block.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
