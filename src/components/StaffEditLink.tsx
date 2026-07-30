import Link from "next/link";
import { cachedCurrentUser, isStaff } from "@/lib/auth";

/**
 * Inline "Edit" shortcut for admins and moderators, so staff can fix any card
 * or event from where they spotted it. Renders nothing for everybody else.
 */
export async function StaffEditLink({
  href,
  className = "",
  label = "✏️ Staff edit",
}: {
  href: string;
  className?: string;
  label?: string;
}) {
  const user = await cachedCurrentUser();
  if (!user || !isStaff(user)) return null;

  return (
    <Link
      href={href}
      className={`rounded-lg border border-rose-300 bg-white/90 px-2 py-1 text-xs font-bold text-rose-700 hover:bg-rose-50 ${className}`}
    >
      {label}
    </Link>
  );
}
