import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { safePartnerUrl } from "@/lib/mediaPartners";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Reading via GoDesi",
  robots: { index: false },
};

/**
 * Reader wrapper: outbound clicks from /newspapers land here so a slim GoDesi
 * bar stays on top while the partner site loads inside the frame. Only hosts
 * in the mediaPartners allowlist may be framed — no open proxying.
 */
export default function ReadPage({
  searchParams,
}: {
  searchParams: { u?: string; n?: string };
}) {
  const url = safePartnerUrl(searchParams.u);
  if (!url) redirect("/newspapers");

  const name = searchParams.n?.slice(0, 80) ?? new URL(url).hostname;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-900 px-4 py-2 text-white">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-godesi.png" alt="GoDesi" className="h-7 w-7 rounded" />
          <span className="text-sm font-bold">GoDesi</span>
        </Link>
        <p className="hidden text-xs text-slate-300 sm:block">
          Reading <span className="font-semibold text-white">{name}</span> via GoDesi
        </p>
        <div className="flex items-center gap-2">
          <Link
            href="/newspapers"
            className="rounded-lg border border-slate-600 px-3 py-1 text-xs font-semibold hover:bg-slate-800"
          >
            ← All papers
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900 hover:bg-amber-300"
          >
            Join GoDesi free
          </Link>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-600 px-3 py-1 text-xs font-semibold hover:bg-slate-800"
          >
            Open full site ↗
          </a>
        </div>
      </div>
      <iframe
        src={url}
        title={name}
        className="h-full w-full flex-1 border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
      <noscript>
        <p className="p-4">
          Continue to <a href={url}>{name}</a>.
        </p>
      </noscript>
    </div>
  );
}
