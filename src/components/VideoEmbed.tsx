import { videoEmbedUrl } from "@/lib/video";

/** Responsive 16:9 YouTube/Vimeo player; renders nothing for unsupported links. */
export function VideoEmbed({ url, title }: { url: string | null; title: string }) {
  const src = videoEmbedUrl(url);
  if (!src) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black">
      <div className="relative aspect-video">
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}
