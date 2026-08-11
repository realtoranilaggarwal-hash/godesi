import type { JournalistLevel } from "@/lib/journalists";

/** Star badge shown next to a contributor's name on news cards and profiles. */
export function JournalistBadge({
  level,
  beat,
}: {
  level: JournalistLevel | null;
  beat?: string | null;
}) {
  if (!level) return null;
  return (
    <span
      title={`${level.title}${beat ? ` · ${beat}` : ""}`}
      className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800"
    >
      <span aria-hidden>{level.stars}</span>
      {level.title}
    </span>
  );
}
