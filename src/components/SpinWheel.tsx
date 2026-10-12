"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  spinAction,
  spinStatusAction,
  type SpinResult,
  type SpinStatus,
} from "@/app/actions/spin";
import { DealCard } from "@/components/DealCard";
import { SPIN_SLICES, SPIN_TOTAL_WEIGHT } from "@/lib/spin";

const HIDDEN_ON = ["/login", "/signup", "/admin"];
const SIZE = 260;
const R = SIZE / 2;
const SLICE_DEG = 360 / SPIN_SLICES.length;
const SPIN_MS = 4200;

function point(deg: number, radius: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [R + radius * Math.cos(rad), R + radius * Math.sin(rad)];
}

/** Turns that leave slice `index` under the pointer at the top. */
function landingAngle(index: number, spins: number, jitter = 0) {
  return spins * 360 + (360 - (index * SLICE_DEG + SLICE_DEG / 2)) + jitter;
}

function Wheel({ rotation, animate }: { rotation: number; animate: boolean }) {
  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1 text-3xl leading-none text-rose-600 drop-shadow">
        ▼
      </div>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        className="rounded-full shadow-lg"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: animate
            ? `transform ${SPIN_MS}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
            : "none",
        }}
        aria-hidden
      >
        {SPIN_SLICES.map((slice, i) => {
          const [x0, y0] = point(i * SLICE_DEG, R - 2);
          const [x1, y1] = point((i + 1) * SLICE_DEG, R - 2);
          const [tx, ty] = point(i * SLICE_DEG + SLICE_DEG / 2, R * 0.62);
          return (
            <g key={slice.key}>
              <path
                d={`M ${R} ${R} L ${x0} ${y0} A ${R - 2} ${R - 2} 0 0 1 ${x1} ${y1} Z`}
                fill={slice.color}
                stroke="#fff"
                strokeWidth={3}
              />
              <text
                x={tx}
                y={ty}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={slice.key === "deal" ? 26 : 22}
                fontWeight={800}
                fill="#1e293b"
                transform={`rotate(${i * SLICE_DEG + SLICE_DEG / 2} ${tx} ${ty})`}
              >
                {slice.short}
              </text>
            </g>
          );
        })}
        <circle
          cx={R}
          cy={R}
          r={26}
          fill="#4f46e5"
          stroke="#fff"
          strokeWidth={4}
        />
        <text
          x={R}
          y={R}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          fontWeight={800}
          fill="#fff"
        >
          GoDesi
        </text>
      </svg>
    </div>
  );
}

function ResultBox({ result }: { result: SpinResult }) {
  return (
    <div className="space-y-2 text-center">
      {result.points > 0 ? (
        <p className="text-lg font-black text-emerald-700">
          🎉 +{result.points} points added to your rewards
        </p>
      ) : null}
      {result.deal ? (
        <>
          <p className="text-lg font-black text-rose-700">
            🏷️ You found a deal
          </p>
          <div className="text-left">
            <DealCard {...result.deal} />
          </div>
        </>
      ) : null}
      <p className="text-xs text-slate-500">
        Come back tomorrow for another free spin ·{" "}
        <Link
          href="/dashboard/rewards"
          className="font-semibold text-indigo-700 underline"
        >
          My points
        </Link>
      </p>
    </div>
  );
}

/** Side tab that opens the daily wheel: one free spin per verified member per day. */
export function SpinWheel() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<SpinStatus | null>(null);
  const [rotation, setRotation] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [shown, setShown] = useState<SpinResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open || status) return;
    spinStatusAction()
      .then((next) => {
        setStatus(next);
        if (next.state === "spun") {
          setRotation(landingAngle(next.result.slice, 0));
          setShown(next.result);
        }
      })
      .catch(() => setError("Couldn't load the wheel. Please try again."));
  }, [open, status]);

  if (HIDDEN_ON.some((path) => pathname.startsWith(path))) return null;

  const spin = () => {
    setError(null);
    startTransition(async () => {
      try {
        const next = await spinAction();
        setStatus(next);
        if (next.state !== "spun") return;
        setAnimate(true);
        setRotation(
          landingAngle(next.result.slice, 6, Math.random() * 30 - 15),
        );
        window.setTimeout(() => setShown(next.result), SPIN_MS);
      } catch {
        setError("Something went wrong — please try again.");
      }
    });
  };

  const spinning = pending || (status?.state === "spun" && !shown);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-0 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-0.5 rounded-l-2xl bg-gradient-to-b from-amber-400 to-rose-500 px-2 py-3 text-xs font-black text-white shadow-lg hover:brightness-110"
        aria-label="Spin the GoDesi wheel"
      >
        <span className="text-xl leading-none">🎡</span>
        <span>Spin</span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-3"
          onClick={() => !spinning && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="GoDesi daily spin"
            className="max-h-[92vh] w-full max-w-md space-y-4 overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">🎡 Daily spin</h2>
                <p className="text-sm text-slate-600">
                  Win GoDesi points or a deal from a desi business.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={spinning}
                className="rounded-full px-2 text-2xl leading-none text-slate-400 hover:text-slate-700 disabled:opacity-40"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <Wheel rotation={rotation} animate={animate} />

            {error ? (
              <p className="text-center text-sm text-rose-600">{error}</p>
            ) : null}

            {!status ? (
              <p className="text-center text-sm text-slate-500">Loading…</p>
            ) : status.state === "signed-out" ? (
              <div className="text-center">
                <Link
                  href={`/login?next=${encodeURIComponent(pathname)}`}
                  className="inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
                >
                  Sign in to spin
                </Link>
                <p className="mt-1 text-xs text-slate-500">
                  New here?{" "}
                  <Link
                    href="/signup"
                    className="font-semibold text-indigo-700 underline"
                  >
                    Join free
                  </Link>
                </p>
              </div>
            ) : status.state === "unverified" ? (
              <p className="text-center text-sm text-slate-600">
                Confirm your email to start spinning.{" "}
                <Link
                  href="/verify-email"
                  className="font-semibold text-indigo-700 underline"
                >
                  Verify now
                </Link>
              </p>
            ) : status.state === "ready" ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={spin}
                  disabled={pending}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-8 py-3 text-base font-black text-white shadow hover:brightness-110 disabled:opacity-60"
                >
                  {pending ? "Spinning…" : "Spin the wheel"}
                </button>
              </div>
            ) : shown ? (
              <ResultBox result={shown} />
            ) : (
              <p className="text-center text-sm font-semibold text-slate-600">
                Spinning…
              </p>
            )}

            <details className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <summary className="cursor-pointer font-semibold text-slate-700">
                Rules &amp; odds
              </summary>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>
                  No purchase needed. One free spin per signed-in member with a
                  confirmed email, per day; the day resets at midnight New York
                  time.
                </li>
                <li>
                  Odds per spin:{" "}
                  {SPIN_SLICES.map(
                    (slice) =>
                      `${slice.label} ${Math.round((slice.weight / SPIN_TOTAL_WEIGHT) * 100)}%`,
                  ).join(" · ")}
                  . If no business deal is running, that slice pays 2 points.
                </li>
                <li>
                  Points are GoDesi credit for promotion on GoDesi (see{" "}
                  <Link href="/rewards" className="underline">
                    rewards
                  </Link>
                  ) — no cash value and not transferable.
                </li>
                <li>
                  A deal is that business&apos;s own offer on their terms.
                  Shopping and affiliate links never earn points.
                </li>
              </ul>
            </details>
          </div>
        </div>
      ) : null}
    </>
  );
}
