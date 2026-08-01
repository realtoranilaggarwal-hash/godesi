import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { retryShareAction, setAutoShareAction } from "@/app/actions/admin";
import {
  SHARE_KINDS,
  facebookConfigured,
  shareSettings,
  telegramConfigured,
} from "@/lib/autoShare";
import { Badge, Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Auto-share" };

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/auto-share");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [autoShare, shareLogs] = await Promise.all([
    shareSettings(),
    db.shareLog.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Auto-share</h1>
      <Card id="auto-share">
        <h2 className="mb-1 text-lg font-bold">Auto-share to social</h2>
        <p className="mb-3 text-sm text-slate-500">
          New posts are broadcast to the Godesi Facebook page and Telegram
          channel. Tokens live in the server environment, never here.
        </p>

        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          <Badge tone={facebookConfigured() ? "green" : "slate"}>
            Facebook {facebookConfigured() ? "connected" : "not connected"}
          </Badge>
          <Badge tone={telegramConfigured() ? "green" : "slate"}>
            Telegram {telegramConfigured() ? "connected" : "not connected"}
          </Badge>
        </div>

        {!facebookConfigured() && !telegramConfigured() ? (
          <p className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            Nothing is connected yet, so nothing is being posted. Add
            FACEBOOK_PAGE_ID + FACEBOOK_PAGE_TOKEN and/or TELEGRAM_BOT_TOKEN +
            TELEGRAM_CHAT_ID to the environment.
          </p>
        ) : null}

        <ul className="mb-5 divide-y divide-slate-100 text-sm">
          {SHARE_KINDS.map((kind) => (
            <li
              key={kind.key}
              className="flex items-center justify-between gap-3 py-2"
            >
              <span>
                {kind.icon} {kind.label}
              </span>
              <form action={setAutoShareAction} className="flex gap-2">
                <input type="hidden" name="key" value={kind.key} />
                <input
                  type="hidden"
                  name="enabled"
                  value={autoShare[kind.key] ? "off" : "on"}
                />
                <button
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    autoShare[kind.key]
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {autoShare[kind.key] ? "On" : "Off"}
                </button>
              </form>
            </li>
          ))}
        </ul>

        <h3 className="mb-2 text-sm font-semibold">Recent broadcasts</h3>
        {shareLogs.length ? (
          <ul className="divide-y divide-slate-100 text-sm">
            {shareLogs.map((log) => (
              <li
                key={log.id}
                className="flex flex-wrap items-start justify-between gap-2 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{log.title}</p>
                  <p className="text-xs text-slate-400">
                    {log.channel} · {log.createdAt.toLocaleString()}
                    {log.status === "FAILED" && log.detail
                      ? ` · ${log.detail}`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={log.status === "SENT" ? "green" : "red"}>
                    {log.status.toLowerCase()}
                  </Badge>
                  <form action={retryShareAction}>
                    <input type="hidden" name="subject" value={log.subject} />
                    <button className="text-xs font-semibold text-brand-600">
                      re-share
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Nothing broadcast yet.</p>
        )}
      </Card>
    </div>
  );
}
