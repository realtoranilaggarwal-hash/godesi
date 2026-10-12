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
  premium: boolean;
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
      className={`flex h-full gap-3 rounded-2xl border bg-white p-3 ${club.premium ? "border-amber-300 ring-1 ring-amber-200" : "border-slate-200"} shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md`}
    >
      <span className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-3xl">
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
        <span className="flex items-center gap-1.5">
          <span className="min-w-0 truncate font-bold text-slate-900">
            {club.name}
          </span>
          {club.premium ? (
            <span className="shrink-0">
              <Badge tone="amber">⭐ Premium</Badge>
            </span>
          ) : null}
          {club.visibility === "PRIVATE" ? (
            <span className="shrink-0">
              <Badge tone="slate">🔒 Private</Badge>
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 line-clamp-1 text-xs text-slate-500">
          {cat.label}
          {clubPlace(club) ? ` · ${clubPlace(club)}` : ""} · {club.memberCount}{" "}
          member{club.memberCount === 1 ? "" : "s"}
        </span>
        <span className="mt-1 line-clamp-2 h-10 text-sm leading-5 text-slate-600">
          {club.description}
        </span>
        <span className="mt-1.5 block truncate text-xs font-semibold text-indigo-700">
          {club.nextEvent
            ? `Next: ${club.nextEvent.title} · ${club.nextEvent.startsAt.toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" },
              )}`
            : club.visibility === "PRIVATE"
              ? "Ask the organiser to join"
              : "Open to join"}
        </span>
      </span>
    </Link>
  );
}
