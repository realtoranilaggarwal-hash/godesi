import Link from "next/link";
import { Badge } from "@/components/ui";
import { clubCategory } from "@/lib/clubs";
import { thumbImage } from "@/lib/proxyImage";

export type ClubListItem = {
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  category: string;
  city: string | null;
  state: string | null;
  online: boolean;
  visibility: "PUBLIC" | "PRIVATE";
  memberCount: number;
  nextEvent: { slug: string; title: string; startsAt: Date } | null;
};

export function clubPlace(club: {
  city: string | null;
  state: string | null;
  online: boolean;
}) {
  const place = [club.city, club.state].filter(Boolean).join(", ");
  if (club.online && place) return `${place} · online`;
  return club.online ? "Online" : place;
}

export function ClubCard({ club }: { club: ClubListItem }) {
  const cat = clubCategory(club.category);
  return (
    <Link
      href={`/clubs/${club.slug}`}
      className="flex h-full gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-2xl">
        {club.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbImage(club.imageUrl, 384)}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          cat.emoji
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="truncate font-bold text-slate-900">{club.name}</span>
          {club.visibility === "PRIVATE" ? (
            <Badge tone="slate">🔒 Private</Badge>
          ) : null}
        </span>
        <span className="mt-0.5 block text-xs text-slate-500">
          {cat.label}
          {clubPlace(club) ? ` · ${clubPlace(club)}` : ""} · {club.memberCount}{" "}
          member{club.memberCount === 1 ? "" : "s"}
        </span>
        <span className="mt-1 line-clamp-2 block text-sm text-slate-600">
          {club.description}
        </span>
        {club.nextEvent ? (
          <span className="mt-1.5 block truncate text-xs font-semibold text-indigo-700">
            Next: {club.nextEvent.title} ·{" "}
            {club.nextEvent.startsAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
