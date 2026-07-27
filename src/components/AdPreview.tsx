/**
 * A designed stand-in for an unsold placement: brand gradient, the exact size and a
 * clear invitation, so empty inventory still looks intentional.
 */
export function AdPreview({
  width,
  height,
  className = "",
  headline = "Advertise here",
  sub,
}: {
  width: number;
  height: number;
  className?: string;
  headline?: string;
  sub?: string;
}) {
  const tall = height > width;

  return (
    <div
      style={{ aspectRatio: `${width} / ${height}` }}
      className={`relative flex flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 via-rose-500 to-fuchsia-600 p-3 text-center text-white ${className}`}
    >
      <p
        className={`font-black leading-tight drop-shadow-sm ${
          tall ? "text-sm" : "text-base sm:text-xl"
        }`}
      >
        {headline}
      </p>
      <p className="mt-1 text-[11px] font-medium text-white/90 sm:text-xs">
        {sub ?? "Reach the desi community"}
      </p>
      <span className="mt-2 rounded-lg bg-white/95 px-2 py-1 text-[10px] font-bold text-rose-700 sm:text-xs">
        {width} × {height}
      </span>
      <span className="absolute bottom-1 right-2 text-[10px] font-semibold text-white/80">
        godesi.com
      </span>
    </div>
  );
}
