"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { scratchAction, type ScratchResult } from "@/app/actions/scratch";

/** Buy a card, then rub the silver coating off to see the prize. */
export function ScratchGame({
  cost,
  balance,
}: {
  cost: number;
  balance: number;
}) {
  const [result, setResult] = useState<ScratchResult | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const el = canvas.current;
    if (!el || !result || "error" in result) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "source-over";
    const shine = ctx.createLinearGradient(0, 0, el.width, el.height);
    shine.addColorStop(0, "#cbd5e1");
    shine.addColorStop(0.5, "#f1f5f9");
    shine.addColorStop(1, "#94a3b8");
    ctx.fillStyle = shine;
    ctx.fillRect(0, 0, el.width, el.height);
    ctx.fillStyle = "#475569";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Scratch here ✨", el.width / 2, el.height / 2 + 8);
    setRevealed(false);
  }, [result]);

  function rub(clientX: number, clientY: number) {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const box = el.getBoundingClientRect();
    const x = ((clientX - box.left) / box.width) * el.width;
    const y = ((clientY - box.top) / box.height) * el.height;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  function checkCleared() {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const pixels = ctx.getImageData(0, 0, el.width, el.height).data;
    let clear = 0;
    for (let i = 3; i < pixels.length; i += 16) if (pixels[i] === 0) clear++;
    if (clear / (pixels.length / 16) > 0.45) setRevealed(true);
  }

  const won = result && !("error" in result) ? result : null;

  return (
    <div className="space-y-3">
      {won ? (
        <div className="relative mx-auto h-48 w-full max-w-sm select-none overflow-hidden rounded-2xl border-4 border-amber-400 bg-gradient-to-br from-amber-50 to-rose-50">
          <div className="flex h-full flex-col items-center justify-center p-3 text-center">
            {won.prize === "gift" && won.gift ? (
              <>
                <p className="text-3xl">🎁</p>
                <p className="font-black">You won: {won.gift.title}</p>
                <p className="text-sm">from {won.gift.business}</p>
                <p className="mt-1 rounded-lg bg-white px-3 py-1 font-mono text-lg font-bold tracking-widest">
                  {won.code}
                </p>
              </>
            ) : won.prize === "points" ? (
              <>
                <p className="text-4xl">⭐</p>
                <p className="text-2xl font-black">+{won.points} points!</p>
              </>
            ) : (
              <>
                <p className="text-4xl">🙈</p>
                <p className="text-xl font-black">Not this time</p>
                <p className="text-sm text-slate-600">Try another card!</p>
              </>
            )}
          </div>
          {!revealed ? (
            <canvas
              ref={canvas}
              width={384}
              height={192}
              className="absolute inset-0 h-full w-full cursor-pointer touch-none"
              onPointerDown={(event) => {
                drawing.current = true;
                rub(event.clientX, event.clientY);
              }}
              onPointerMove={(event) => {
                if (drawing.current) rub(event.clientX, event.clientY);
              }}
              onPointerUp={() => {
                drawing.current = false;
                checkCleared();
              }}
              onPointerLeave={() => {
                drawing.current = false;
              }}
            />
          ) : null}
        </div>
      ) : null}

      {won?.gift && revealed ? (
        <div className="mx-auto max-w-sm rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 ring-1 ring-emerald-200">
          <p className="font-bold">How to collect: {won.gift.claim}.</p>
          {won.gift.address ? <p>📍 {won.gift.address}</p> : null}
          <Link
            href={`/b/${won.gift.slug}`}
            className="font-semibold underline"
          >
            Open {won.gift.business} on GoDesi →
          </Link>
          <p className="mt-1 text-xs">
            Your code is saved under “My prizes” below.
          </p>
        </div>
      ) : null}

      {result && "error" in result ? (
        <p
          role="alert"
          className="text-center text-sm font-semibold text-red-700"
        >
          {result.error}
        </p>
      ) : null}

      <div className="text-center">
        <button
          type="button"
          disabled={pending || balance < cost}
          onClick={() =>
            start(async () => {
              setResult(await scratchAction());
              router.refresh();
            })
          }
          className="rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-5 py-2.5 font-bold text-white shadow hover:opacity-90 disabled:opacity-50"
        >
          {pending
            ? "Getting your card…"
            : won
              ? `Scratch another (${cost} points)`
              : `Get a scratch card (${cost} points)`}
        </button>
        {balance < cost ? (
          <p className="mt-1 text-xs text-slate-500">
            You need {cost} points.{" "}
            <Link href="/dashboard/rewards" className="underline">
              Earn points
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
