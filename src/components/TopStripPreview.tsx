/** What a top-strip (SKIN) ad looks like: one line of words with an arrow, no picture. */
export function TopStripPreview({
  text = "Your offer in one line — Book now",
  className = "",
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex h-9 min-w-0 items-center justify-center rounded-lg border-2 border-indigo-400 bg-white px-3 text-sm font-semibold text-slate-800 ${className}`}
    >
      <span className="truncate">{text}</span>
      <span className="ml-2 shrink-0 text-indigo-600" aria-hidden>
        →
      </span>
    </div>
  );
}
