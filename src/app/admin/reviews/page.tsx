import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { can, getCurrentUser, isStaff } from "@/lib/auth";
import { Badge, Card, EmptyState, inputClass } from "@/components/ui";
import {
  decideReviewDisputeAction,
  deleteReviewAction,
  setReviewHiddenAction,
} from "@/app/actions/reviews";
import { formatMinor } from "@/lib/format";
import { AdminTabs } from "@/components/AdminTabs";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Review desk" };

export default async function ReviewDeskPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isStaff(user) || !can(user, "reviews")) redirect("/dashboard");

  const [disputes, reviews] = await Promise.all([
    db.reviewDispute.findMany({
      where: { status: { in: ["PENDING", "AWAITING_PAYMENT"] } },
      orderBy: { createdAt: "asc" },
      include: {
        raisedBy: { select: { name: true, email: true } },
        review: {
          include: { business: { select: { slug: true, name: true } } },
        },
      },
    }),
    db.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 60,
      include: { business: { select: { slug: true, name: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Review desk</h1>
        <p className="text-sm text-slate-600">
          Paid takedown requests and the latest reviews. Hide fake, abusive or
          paid-for reviews; keep honest criticism, even when the owner dislikes
          it.
        </p>
      </div>

      <AdminTabs
        tabs={[
          {
            id: "requests",
            label: "Takedown requests",
            count: disputes.length,
          },
          { id: "latest", label: "Latest reviews" },
        ]}
      />

      <Card id="requests">
        <h2 className="mb-3 text-lg font-bold">Takedown requests</h2>
        {disputes.length === 0 ? (
          <EmptyState
            title="Nothing waiting"
            body="Paid requests will appear here."
          />
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <div
                key={dispute.id}
                className="space-y-2 rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Link
                    href={`/b/${dispute.review.business.slug}`}
                    className="font-semibold hover:text-indigo-600"
                  >
                    {dispute.review.business.name}
                  </Link>
                  <Badge
                    tone={dispute.status === "PENDING" ? "amber" : "slate"}
                  >
                    {dispute.status === "PENDING"
                      ? "Fee paid"
                      : "Awaiting payment"}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {formatMinor(dispute.feeMinor, dispute.feeCurrency)} ·{" "}
                    {dispute.raisedBy.name ?? dispute.raisedBy.email}
                  </span>
                </div>
                <p className="rounded-xl bg-slate-50 p-3 text-sm">
                  <span className="font-semibold">
                    {"★".repeat(dispute.review.rating)}{" "}
                    {dispute.review.authorName}:
                  </span>{" "}
                  {dispute.review.comment ?? "(no comment)"}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Owner says:</span>{" "}
                  {dispute.reason}
                </p>
                {dispute.status === "PENDING" ? (
                  <form
                    action={decideReviewDisputeAction}
                    className="space-y-2"
                  >
                    <input type="hidden" name="disputeId" value={dispute.id} />
                    <input
                      name="note"
                      placeholder="Decision note shown to the owner"
                      className={inputClass}
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        name="decision"
                        value="approve"
                        className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        Approve — hide review
                      </button>
                      <button
                        type="submit"
                        name="decision"
                        value="reject"
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                      >
                        Reject — review stays
                      </button>
                    </div>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card id="latest">
        <h2 className="mb-3 text-lg font-bold">Latest reviews</h2>
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/b/${review.business.slug}`}
                    className="font-semibold hover:text-indigo-600"
                  >
                    {review.business.name}
                  </Link>
                  <Badge tone="amber">{"★".repeat(review.rating)}</Badge>
                  <span className="text-xs text-slate-500">
                    {review.authorName} ·{" "}
                    {review.createdAt.toLocaleDateString("en-IN")}
                  </span>
                  {review.hidden ? <Badge tone="slate">Hidden</Badge> : null}
                </div>
                <p className="mt-1 text-slate-700">
                  {review.comment ?? "(no comment)"}
                </p>
                {review.hiddenReason ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Reason: {review.hiddenReason}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={setReviewHiddenAction} className="flex gap-2">
                  <input type="hidden" name="reviewId" value={review.id} />
                  <input
                    type="hidden"
                    name="hidden"
                    value={review.hidden ? "0" : "1"}
                  />
                  {review.hidden ? null : (
                    <input
                      name="reason"
                      placeholder="Reason"
                      className="w-36 rounded-xl border border-slate-300 px-2 py-1 text-xs"
                    />
                  )}
                  <button
                    type="submit"
                    className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                  >
                    {review.hidden ? "Restore" : "Hide"}
                  </button>
                </form>
                <form action={deleteReviewAction}>
                  <input type="hidden" name="reviewId" value={review.id} />
                  <button
                    type="submit"
                    className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
