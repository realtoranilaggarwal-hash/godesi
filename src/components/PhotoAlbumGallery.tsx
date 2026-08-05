import { albumPreview, albumThumb, isAlbumLink } from "@/lib/photoAlbum";

/**
 * Nine thumbnails from a member's public Google Photos album. Google serves the
 * pictures and every tile opens the album, so Godesi stores only the link.
 */
export async function PhotoAlbumGallery({
  url,
  heading = "Photo gallery",
}: {
  url: string | null;
  heading?: string;
}) {
  if (!url || !isAlbumLink(url)) return null;

  const { images, title } = await albumPreview(url);
  const tiles = images.slice(0, 9);

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

      {tiles.length ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {tiles.map((image) => (
            <a
              key={image}
              href={url}
              target="_blank"
              rel="noreferrer nofollow"
              className="group relative block aspect-square overflow-hidden rounded-xl border border-slate-200"
            >
              {/* Served straight from Google, so no Godesi storage or optimizer cost. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={albumThumb(image, 400, 400)}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition group-hover:scale-105"
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
