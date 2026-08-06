import Link from "next/link";
import type { PostedBy as PostedByUser } from "@/lib/profiles";

/** Byline avatar + name, linking to the member's personal profile when set. */
export function PostedBy({
  user,
  prefix = "Posted by",
  className = "",
}: {
  user: PostedByUser;
  prefix?: string;
  className?: string;
}) {
  const inner = (
    <>
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatarUrl}
          alt={user.name ?? "Godesi member"}
          className="h-7 w-7 rounded-full border border-slate-200 object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 via-rose-500 to-fuchsia-600 text-xs font-black text-white"
        >
          {user.name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className="text-xs text-slate-600">
        {prefix} <span className="font-semibold text-slate-800">{user.name}</span>
      </span>
    </>
  );

  if (!user.username) {
    return <span className={`inline-flex items-center gap-2 ${className}`}>{inner}</span>;
  }

  return (
    <Link
      href={`/${user.username}`}
      className={`inline-flex items-center gap-2 hover:opacity-80 ${className}`}
    >
      {inner}
    </Link>
  );
}
