/**
 * A designed stand-in for an unsold placement: brand artwork cropped to the exact
 * placement size, so empty inventory still looks intentional and sells itself.
 */
function artworkFor(width: number, height: number) {
  if (height > width) return "/ad-skyscraper.jpg";
  return width / height > 2 ? "/ad-leaderboard.jpg" : "/ad-sidebar.jpg";
}

export function AdPreview({
  width,
  height,
  className = "",
}: {
  width: number;
  height: number;
  className?: string;
}) {
  return (
    <div
      style={{ aspectRatio: `${width} / ${height}`, maxWidth: width }}
      className={`relative mx-auto overflow-hidden rounded-xl ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={artworkFor(width, height)}
        alt="Advertise here — reach the desi community on Godesi"
        loading="lazy"
        className="h-full w-full object-cover"
      />
      <span className="absolute bottom-1 left-1 rounded bg-black/35 px-1.5 py-0.5 text-[10px] font-semibold text-white">
        {width} × {height}
      </span>
    </div>
  );
}
