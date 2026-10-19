/** Small "GoDesi.com" corner mark laid over photos; the parent must be `relative`. */
export function GodesiMark() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute bottom-1.5 left-1.5 rounded-md bg-black/45 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white/90"
    >
      GoDesi.com
    </span>
  );
}
