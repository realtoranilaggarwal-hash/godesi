"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const KEY = "godesi_rewards_nudge";
const HIDDEN_ON = ["/rewards", "/dashboard/rewards", "/login", "/signup"];

const MESSAGES = [
  "Did you know? Share Godesi and earn points for every business that joins.",
  "Promote your profile and get rewarded — points buy featured placement.",
  "Share your listing on WhatsApp and collect reward points.",
  "Invite a business, earn points, spend them on ads instead of cash.",
];

/** A quiet, once-dismissed prompt that tells members the rewards programme exists. */
export function RewardsNudge() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState(MESSAGES[0]);

  useEffect(() => {
    if (window.localStorage.getItem(KEY)) return;
    if (!window.localStorage.getItem("godesi_cookie_consent")) return;
    setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    const timer = window.setTimeout(() => setVisible(true), 6000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible || HIDDEN_ON.some((path) => pathname.startsWith(path))) return null;

  const dismiss = () => {
    window.localStorage.setItem(KEY, "1");
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-3 bottom-3 z-30 sm:inset-x-auto sm:left-4 sm:max-w-sm">
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-rose-50 px-4 py-3 shadow-lg">
        <span aria-hidden className="text-xl">
          🎁
        </span>
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold text-slate-800">{message}</p>
          <Link
            href="/rewards"
            onClick={dismiss}
            className="mt-1 inline-block font-bold text-rose-600 underline"
          >
            See how rewards work →
          </Link>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
