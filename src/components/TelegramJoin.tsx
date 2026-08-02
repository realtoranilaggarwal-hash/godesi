import { TELEGRAM_GROUP, TELEGRAM_HANDLE } from "@/lib/site";

/**
 * The Telegram group is where the community actually talks between visits —
 * worth an invitation on the rail and in the footer, not just a small icon.
 */
export function TelegramJoin({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href={TELEGRAM_GROUP}
      target="_blank"
      rel="noreferrer"
      className={`block rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-sm transition hover:brightness-110 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <p
        className={`flex items-center gap-2 font-black ${
          compact ? "text-sm" : "text-base"
        }`}
      >
        <span aria-hidden>✈️</span> Join the GoDesi community on Telegram
      </p>
      <p
        className={`mt-1 text-white/90 ${compact ? "text-[11px]" : "text-sm"}`}
      >
        New listings, events, jobs and desi news — {TELEGRAM_HANDLE}
      </p>
      <span
        className={`mt-2 inline-block rounded-full bg-white font-bold text-sky-700 ${
          compact ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"
        }`}
      >
        Join free →
      </span>
    </a>
  );
}
