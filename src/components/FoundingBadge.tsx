import { FOUNDING_LIMIT } from "@/lib/founding";

/** 🏅 badge for the first 1000 members, shown next to their name. */
export function FoundingBadge({ number }: { number: number | null }) {
  if (number === null) return null;
  return (
    <span
      title={`Founding member #${number} — one of the first ${FOUNDING_LIMIT} on Godesi`}
      className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white"
    >
      <span aria-hidden>🏅</span>
      Founding member #{number}
    </span>
  );
}
