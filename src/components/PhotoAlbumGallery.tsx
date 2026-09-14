import { albumPreview, albumThumb, isAlbumLink } from "@/lib/photoAlbum";

/**
 * Thumbnails from a member's public Google Photos album. Google serves the
 * pictures and every tile opens the album, so Godesi stores only the link.
 */
export async function PhotoAlbumGallery({
  url,
  heading = "Photo gallery",
  limit = 9,
}: {
  url: string | null;
  heading?: string;
  /** Thumbnails shown here; the album link always opens the rest. */
  limit?: number;
}) {
  if (!url || !isAlbumLink(url)) return null;

  const { images, title } = await albumPreview(url);
  const tiles = images.slice(0, limit);
  const held = images.length - tiles.length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">{heading}</h2>
        <a
          href={url}
          target="_blank"
          rel="noreferrer nofollow"
          className="text-sm font-semibold text-indigo-700 underline"
        >
          See all photos →
        </a>
      </div>
      {title ? <p className="text-sm text-slate-500">{title}</p> : null}
      {held > 0 ? (
        <p className="text-xs text-slate-500">
          Showing {tiles.length} of {images.length} — the rest open in the
          album.
        </p>
      ) : null}

      {tiles.length ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {tiles.map((image) => (
            <a
              key={image}
              href={url}
              target="_blank"
              rel="noreferrer nofollow"
              className="group relative block aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-900"
            >
              {/* Served straight from Google, so no Godesi storage or optimizer cost. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={albumThumb(image, 400, 400)}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-lg"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={albumThumb(image, 400, 400, false)}
                alt=""
                loading="lazy"
                className="relative h-full w-full object-contain transition group-hover:scale-105"
              />
            </a>
          ))}
        </div>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noreferrer nofollow"
          className="mt-3 block rounded-xl bg-slate-50 p-4 text-sm text-slate-600"
        >
          📷 Open the photo album on Google Photos →
        </a>
      )}
    </section>
  );
}
