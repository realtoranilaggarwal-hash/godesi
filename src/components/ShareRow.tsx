import { siteUrl } from "@/lib/format";
import { CopyButton } from "@/components/CopyButton";

const btn =
  "rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700";

/** Quick share links — WhatsApp, Facebook, X, LinkedIn, copy link. */
export function ShareRow({
  path,
  title,
  text,
}: {
  /** Site-relative URL to share, e.g. /jobs/some-slug */
  path: string;
  /** Link title used in posts. */
  title: string;
  /** Optional extra line added to shared text. */
  text?: string;
}) {
  const url = `${siteUrl()}${path}`;
  const body = text ? `${title} — ${text} ${url}` : `${title} ${url}`;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-semibold text-slate-500">Share:</span>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(body)}`}
        target="_blank"
        rel="noreferrer"
        className={btn}
      >
        💬 WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noreferrer"
        className={btn}
      >
        👥 Facebook
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(body)}`}
        target="_blank"
        rel="noreferrer"
        className={btn}
      >
        🐦 X
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noreferrer"
        className={btn}
      >
        💼 LinkedIn
      </a>
      <CopyButton value={url} label="🔗 Copy link" />
    </div>
  );
}
