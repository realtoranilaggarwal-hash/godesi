import { db } from "@/lib/db";

/** Fire-and-forget in-app notification; never blocks the action that raised it. */
export async function notify({
  userId,
  title,
  body,
  href,
}: {
  userId: string;
  title: string;
  body?: string;
  href?: string;
}) {
  try {
    await db.notification.create({
      data: { userId, title, body: body ?? null, href: href ?? null },
    });
  } catch {
    // A missed notification must never fail the underlying action.
  }
}

export function unreadCount(userId: string) {
  return db.notification.count({ where: { userId, readAt: null } });
}
