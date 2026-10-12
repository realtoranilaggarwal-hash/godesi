import Link from "next/link";
import type { ReactNode } from "react";
import type { MemberCard } from "@/lib/membersQueries";
import { thumbImage } from "@/lib/proxyImage";
import { properName } from "@/lib/names";

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "🙂"
  );
}

/** Photo, name and one line — the card used in the rows of members. */
export function MemberTile({
  member,
  compact = false,
}: {
  member: MemberCard;
  /** One-line row tile, about the height of a business mini banner. */
  compact?: boolean;
}) {
  const line = member.headline ?? member.location;
  const shell = compact
    ? "flex h-14 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 shadow-sm"
    : "flex h-full flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm";
  // A member who has not picked a handle has no page to open yet.
  const Shell = ({ children }: { children: ReactNode }) =>
    member.username ? (
      <Link
        href={`/${member.username}`}
        className={`${shell} transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md`}
      >
        {children}
      </Link>
    ) : (
      <div className={shell}>{children}</div>
    );

  if (compact)
    return (
      <Shell>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-400 to-fuchsia-500 text-xs font-black text-white">
          {member.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbImage(member.avatarUrl, 384)}
              alt={member.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            initials(member.name)
          )}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-xs font-bold text-slate-900">
            {properName(member.name)}
          </span>
          {line ? (
            <span className="block truncate text-[10px] text-slate-500">
              {line}
            </span>
          ) : member.foundingNumber !== null ? (
            <span className="block truncate text-[10px] font-semibold text-amber-700">
              🏅 Founding #{member.foundingNumber}
            </span>
          ) : null}
        </span>
      </Shell>
    );

  return (
    <Shell>
      <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-400 to-fuchsia-500 text-base font-black text-white">
        {member.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbImage(member.avatarUrl, 384)}
            alt={member.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          initials(member.name)
        )}
      </span>

      <span className="w-full">
        <span className="block truncate text-sm font-bold text-slate-900">
          {properName(member.name)}
        </span>
        {line ? (
          <span className="mt-0.5 line-clamp-2 block text-xs text-slate-600">
            {line}
          </span>
        ) : null}
      </span>

      <span className="mt-auto flex flex-wrap justify-center gap-1">
        {member.foundingNumber !== null ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
            🏅 Founding #{member.foundingNumber}
          </span>
        ) : null}
        {member.openToWork ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            Open to work
          </span>
        ) : null}
      </span>
    </Shell>
  );
}
