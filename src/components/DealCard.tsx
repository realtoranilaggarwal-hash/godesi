import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { LogoTile } from "@/components/LogoTile";
import { expiryLabel } from "@/lib/dealFormat";

export type DealCardProps = {
  title: string;
  details: string | null;
  code: string | null;
  linkUrl: string | null;
  expiresAt: Date | null;
  business?: {
    slug: string;
    name: string;
    city: string;
    logoUrl: string | null;
    icon?: string | null;
    line?: string | null;
  };
};

export function DealCard({
  title,
  details,
  code,
  linkUrl,
  expiresAt,
  business,
}: DealCardProps) {
  const ends = expiryLabel(expiresAt);
  return (
    <div className="flex h-full flex-col gap-2 rounded-2xl border border-dashed border-rose-300 bg-rose-50/60 p-4">
      {business ? (
        <Link
          href={`/b/${business.slug}`}
          className="flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-indigo-700"
        >
          <LogoTile
            name={business.name}
            icon={business.icon}
            imageUrl={business.logoUrl}
            className="h-9 w-9 shrink-0"
            emojiClassName="text-lg"
          />
          <span className="min-w-0 leading-tight">
            <span className="block truncate">{business.name}</span>
            <span className="block truncate text-xs font-normal text-slate-500">
              {[business.line, business.city].filter(Boolean).join(" · ")}
            </span>
          </span>
        </Link>
      ) : null}
      <p className="font-bold text-rose-900">🏷️ {title}</p>
      {details ? (
        <p className="line-clamp-4 whitespace-pre-line text-sm text-slate-700">
          {details}
        </p>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1 text-xs">
        {code ? (
          <span className="inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-white px-2 py-1">
            <span className="font-mono font-bold tracking-wider text-rose-800">
              {code}
            </span>
            <CopyButton value={code} />
          </span>
        ) : null}
        {linkUrl ? (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="font-semibold text-indigo-700 hover:underline"
          >
            Claim offer →
          </a>
        ) : null}
        {ends ? <span className="text-slate-500">{ends}</span> : null}
      </div>
    </div>
  );
}
