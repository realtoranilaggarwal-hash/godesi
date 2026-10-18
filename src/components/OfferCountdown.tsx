"use client";

import { useEffect, useState } from "react";

function left(endsAt: number, now: number) {
  const seconds = Math.max(0, Math.floor((endsAt - now) / 1000));
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return days > 0
    ? `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(secs)}s`
    : `${pad(hours)}h ${pad(minutes)}m ${pad(secs)}s`;
}

/** Time until a code stops working; blank until the browser takes over. */
export function OfferCountdown({ endsAt }: { endsAt: string }) {
  const end = new Date(endsAt).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (now === null) return null;
  return (
    <span className="whitespace-nowrap font-mono tabular-nums">
      {left(end, now)}
    </span>
  );
}
