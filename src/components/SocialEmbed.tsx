/**
 * Plays an Instagram post, YouTube video, Facebook post or TikTok inside the
 * page instead of sending the reader away. Every platform's own embed endpoint
 * is used — nothing is re-hosted, and an unknown link stays a plain link.
 */

type Embed = { src: string; title: string; ratio: string };

function parse(rawUrl: string): Embed | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  const path = url.pathname.replace(/\/+$/, "");

  if (host === "instagram.com" || host.endsWith(".instagram.com")) {
    const match = path.match(/^\/(?:[^/]+\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
    if (!match) return null;
    const kind = match[1] === "reels" ? "reel" : match[1];
    return {
      src: `https://www.instagram.com/${kind}/${match[2]}/embed/captioned`,
      title: "Instagram post",
      ratio: "aspect-[4/5]",
    };
  }

  if (host === "youtube.com" || host.endsWith(".youtube.com")) {
    const id = url.searchParams.get("v") ?? path.match(/^\/(?:shorts|embed|live)\/([\w-]+)/)?.[1];
    if (!id) return null;
    return {
      src: `https://www.youtube-nocookie.com/embed/${id}`,
      title: "YouTube video",
      ratio: "aspect-video",
    };
  }

  if (host === "youtu.be") {
    const id = path.slice(1);
    if (!id) return null;
    return {
      src: `https://www.youtube-nocookie.com/embed/${id}`,
      title: "YouTube video",
      ratio: "aspect-video",
    };
  }

  if (host === "facebook.com" || host === "fb.watch" || host.endsWith(".facebook.com")) {
    return {
      src: `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(
        rawUrl,
      )}&show_text=true&width=500`,
      title: "Facebook post",
      ratio: "aspect-[4/5]",
    };
  }

  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) {
    const id = path.match(/\/video\/(\d+)/)?.[1];
    if (!id) return null;
    return {
      src: `https://www.tiktok.com/embed/v2/${id}`,
      title: "TikTok video",
      ratio: "aspect-[9/16]",
    };
  }

  return null;
}

export function SocialEmbed({ url, label }: { url: string; label?: string }) {
  const embed = parse(url);

  if (!embed) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer nofollow"
        className="inline-block rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
      >
        ▶ {label ?? "Open the link"}
      </a>
    );
  }

  return (
    <div className="space-y-1">
      <div className={`${embed.ratio} w-full overflow-hidden rounded-2xl bg-slate-100`}>
        <iframe
          src={embed.src}
          title={embed.title}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          scrolling="no"
          className="h-full w-full border-0"
        />
      </div>
      <a
        href={url}
        target="_blank"
        rel="noreferrer nofollow"
        className="text-xs font-semibold text-indigo-600 hover:underline"
      >
        View on {embed.title.split(" ")[0]} ↗
      </a>
    </div>
  );
}

export function isEmbeddable(url?: string | null) {
  return Boolean(url && parse(url));
}
