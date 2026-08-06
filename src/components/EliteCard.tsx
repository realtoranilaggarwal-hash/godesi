import Link from "next/link";
import type { EliteEntry } from "@prisma/client";
import { Card } from "@/components/ui";
import { PlaceLink } from "@/components/PlaceLink";
import { ELITE_BADGES, showsContact } from "@/lib/elite";
import { whatsappLink } from "@/lib/format";
import { StaffEditLink } from "@/components/StaffEditLink";
import { videoEmbedUrl } from "@/lib/video";
import { thumbImage } from "@/lib/proxyImage";

/** Featured entries lead with their video, Basic entries stay small and quiet. */
export function EliteCard({
  entry,
  size = "medium",
}: {
  entry: EliteEntry;
  size?: "large" | "medium" | "small";
}) {
  const badge = ELITE_BADGES[entry.badge];
  const embed = size === "large" && entry.videoUrl ? videoEmbedUrl(entry.videoUrl) : null;

  return (
    <Card className={`relative flex flex-col gap-2 ${badge.card}`}>
      <span
        className={`absolute -top-2.5 left-4 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide shadow ${badge.ribbon}`}
      >
        {badge.label}
      </span>
      <StaffEditLink
        href={`/admin/desi-elite?entry=${entry.id}`}
        className="absolute right-3 top-3"
        label="✏️ Edit"
      />

      <div className="flex items-start gap-3 pt-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={entry.photoUrl ? thumbImage(entry.photoUrl, 384) : "/placeholder-logo.svg"}
          alt={entry.fullName}
          className={`${
            size === "large" ? "h-16 w-16" : size === "small" ? "h-10 w-10" : "h-12 w-12"
          } shrink-0 rounded-full border border-slate-200 object-cover`}
        />
        <div className="min-w-0 flex-1">
          <Link
            href={`/desi-elite/${entry.slug}`}
            className="block truncate font-bold text-slate-900 hover:text-indigo-600"
          >
            {entry.fullName}
          </Link>
          {entry.businessName ? (
            <p className="truncate text-sm text-slate-600">{entry.businessName}</p>
          ) : null}
          <p className="text-xs text-slate-500">
            {entry.category} · <PlaceLink city={entry.city} country={entry.country} />
          </p>
          {entry.awardTitle ? (
            <p className="mt-1 inline-block rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2 py-0.5 text-[11px] font-black text-white">
              🏆 {entry.awardTitle}
              {entry.awardYear ? ` ${entry.awardYear}` : ""}
            </p>
          ) : null}
          {entry.awards.length ? (
            <p className="mt-1 truncate text-[11px] font-semibold text-amber-800">
              🏅 {entry.awards.slice(0, 2).join(" · ")}
              {entry.awards.length > 2 ? ` +${entry.awards.length - 2}` : ""}
            </p>
          ) : null}
        </div>
      </div>

      {embed ? (
        <div className="aspect-video overflow-hidden rounded-xl border border-slate-200">
          <iframe
            src={embed}
            title={`${entry.fullName} interview`}
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : null}

      {size !== "small" ? (
        <p className="line-clamp-3 text-sm text-slate-700">{entry.shortBio}</p>
      ) : null}

      {showsContact(entry.badge) ? (
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {entry.contactPhone ? (
            <a
              href={whatsappLink(entry.contactPhone)}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-white"
            >
              WhatsApp
            </a>
          ) : null}
          {entry.websiteUrl ? (
            <a
              href={entry.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-300 px-2.5 py-1 text-slate-700"
            >
              Website
            </a>
          ) : null}
        </div>
      ) : null}

      <Link
        href={`/desi-elite/${entry.slug}`}
        className="mt-auto text-sm font-semibold text-indigo-600 hover:underline"
      >
        View profile →
      </Link>
    </Card>
  );
}
