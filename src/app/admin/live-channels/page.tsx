import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { Card, inputClass } from "@/components/ui";
import {
  updateLiveChannelAction,
  deleteLiveChannelAction,
  resolveLiveReportAction,
} from "@/app/actions/liveChannels";
import { LIVE_CHANNEL_MONTHS } from "@/lib/liveChannels";

export const metadata: Metadata = { title: "Live radio & TV desk | Godesi admin" };
export const dynamic = "force-dynamic";

const STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

function when(date: Date) {
  return date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export default async function AdminLiveChannelsPage() {
  await requireStaff();

  const [channels, reports] = await Promise.all([
    db.liveChannel.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { submittedBy: { select: { name: true, email: true, plan: true } } },
      take: 200,
    }),
    db.liveChannelReport.findMany({
      where: { resolved: false },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-xl font-black">🎧📺 Live radio & TV desk</h1>
        <p className="mt-1 text-sm text-slate-600">
          Approve member-submitted stations, feature paid ones and clear
          &ldquo;not working&rdquo; reports. Carriage is $50/month; charity and
          non-profit suggestions are free. Featuring is for Premium members.
        </p>
        <div className="mt-2 flex gap-3 text-sm font-semibold text-indigo-600">
          <Link href="/live-radio">Live radio →</Link>
          <Link href="/live-tv">Live TV →</Link>
        </div>
      </Card>

      <Card className="space-y-2">
        <h2 className="font-black">
          🚩 Not-working reports ({reports.length})
        </h2>
        {reports.length ? (
          reports.map((report) => (
            <div
              key={report.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-2 text-sm"
            >
              <div>
                <p className="font-semibold">
                  {report.kind === "TV" ? "📺 " : "🎧 "}
                  {report.label}
                  <span className="ml-2 font-normal text-slate-500">
                    {report.channelKey}
                  </span>
                </p>
                <p className="text-xs text-slate-500">
                  {when(report.createdAt)}
                  {report.note ? ` · ${report.note}` : ""}
                </p>
              </div>
              <form action={resolveLiveReportAction}>
                <input type="hidden" name="id" value={report.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-bold text-slate-700"
                >
                  Mark fixed
                </button>
              </form>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No open reports.</p>
        )}
      </Card>

      {channels.map((channel) => {
        const paid = channel.paidUntil && channel.paidUntil > new Date();
        return (
          <Card key={channel.id}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-bold">
                  {channel.kind === "TV" ? "📺 " : "🎧 "}
                  {channel.name}
                </p>
                <p className="text-xs text-slate-500">
                  {channel.place} · embed{" "}
                  <code className="rounded bg-slate-100 px-1">
                    {channel.embedId}
                  </code>
                  {channel.websiteUrl ? (
                    <>
                      {" · "}
                      <a
                        href={channel.websiteUrl}
                        target="_blank"
                        rel="noreferrer nofollow"
                        className="text-indigo-600"
                      >
                        site ↗
                      </a>
                    </>
                  ) : null}
                </p>
                <p className="text-xs text-slate-500">
                  {channel.submittedBy?.name ?? "unknown"} (
                  {channel.submittedBy?.email ?? "—"}) ·{" "}
                  {channel.submittedBy?.plan ?? "FREE"} · {when(channel.createdAt)}
                </p>
                {channel.about ? (
                  <p className="mt-1 text-xs text-slate-600">{channel.about}</p>
                ) : null}
                {channel.contactPhone || channel.contactEmail ? (
                  <p className="text-xs text-slate-500">
                    Contact: {channel.contactName ?? ""}{" "}
                    {channel.contactPhone ?? ""} {channel.contactEmail ?? ""}
                  </p>
                ) : null}
              </div>
              <p className="text-right text-xs">
                <span className="font-bold text-slate-700">{channel.status}</span>
                <br />
                {channel.nonProfit
                  ? "Non-profit — free"
                  : paid
                    ? `Paid until ${when(channel.paidUntil!)}`
                    : "Unpaid"}
                {channel.featured ? <><br />⭐ Featured</> : null}
              </p>
            </div>

            <form
              action={updateLiveChannelAction}
              className="mt-3 grid gap-2 sm:grid-cols-6"
            >
              <input type="hidden" name="id" value={channel.id} />
              <select
                name="status"
                defaultValue={channel.status}
                className={inputClass}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.toLowerCase()}
                  </option>
                ))}
              </select>
              <select name="addMonths" defaultValue="0" className={inputClass}>
                <option value="0">No extra months</option>
                {LIVE_CHANNEL_MONTHS.map((months) => (
                  <option key={months} value={months}>
                    +{months} month{months > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={channel.featured}
                />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  name="nonProfit"
                  defaultChecked={channel.nonProfit}
                />
                Non-profit
              </label>
              <input
                name="adminNote"
                defaultValue={channel.adminNote ?? ""}
                placeholder="Note to the submitter"
                className={inputClass}
              />
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white"
              >
                Save
              </button>
            </form>

            <form action={deleteLiveChannelAction} className="mt-2">
              <input type="hidden" name="id" value={channel.id} />
              <button
                type="submit"
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Delete
              </button>
            </form>
          </Card>
        );
      })}
    </div>
  );
}
