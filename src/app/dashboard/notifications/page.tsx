import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  markNotificationsReadAction,
  setDigestAction,
} from "@/app/actions/rewards";
import { Card, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/notifications");

  const [notifications, member] = await Promise.all([
    db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.user.findUnique({
      where: { id: user.id },
      select: { digestOptOutAt: true },
    }),
  ]);
  const digestOn = !member?.digestOptOutAt;
  const unread = notifications.filter((item) => !item.readAt).length;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Notifications 🔔</h1>
        {unread ? (
          <form action={markNotificationsReadAction}>
            <button
              type="submit"
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
            >
              Mark all read ({unread})
            </button>
          </form>
        ) : null}
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold">📬 Weekly community digest</p>
          <p className="text-sm text-slate-500">
            One email a week: new reports, upcoming events, new businesses and
            listings. Never for anything else.
          </p>
        </div>
        <form action={setDigestAction}>
          <input type="hidden" name="on" value={digestOn ? "no" : "yes"} />
          <button
            className={`rounded-xl px-3 py-1.5 text-sm font-bold ${
              digestOn
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {digestOn ? "On" : "Off"}
          </button>
        </form>
      </Card>

      {notifications.length ? (
        <Card>
          <ul className="divide-y divide-slate-100">
            {notifications.map((item) => (
              <li key={item.id} className="py-3">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      item.readAt ? "bg-slate-300" : "bg-indigo-500"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">
                      {item.href ? (
                        <Link href={item.href} className="hover:underline">
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )}
                    </p>
                    {item.body ? (
                      <p className="text-sm text-slate-600">{item.body}</p>
                    ) : null}
                    <p className="text-xs text-slate-400">
                      {item.createdAt.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <EmptyState
          title="Nothing yet"
          body="Points, referrals and reward updates will show up here."
        />
      )}
    </div>
  );
}
