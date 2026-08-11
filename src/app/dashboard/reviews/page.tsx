import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Alert, Badge, Card, EmptyState, inputClass } from "@/components/ui";
import { startReviewDisputeAction } from "@/app/actions/reviews";
import { requestCurrency } from "@/lib/currency";
import { disputeFee } from "@/lib/reviewDisputes";
import { formatMinor } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reviews on my card" };

const ERRORS: Record<string, string> = {
  reason: "Please explain in at least 20 characters why the review should come down.",
  already_open: "You already have an open request on that review.",
  stripe_unavailable: "Card payments are not available right now — please try again later.",
  stripe_session: "We could not start the payment. Please try again.",
  cancelled: "Payment cancelled — no request was submitted.",
};

export default async function MyReviewsPage({
  searchParams,
}: {
  searchParams: { error?: string; paid?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const business = await db.business.findUnique({
    where: { ownerId: user.id },
    select: { id: true, slug: true, name: true },
  });

  const reviews = business
    ? await db.review.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: "desc" },
        include: { disputes: { orderBy: { createdAt: "desc" }, take: 1 } },
      })
    : [];

  const currency = requestCurrency();
  const fee = formatMinor(disputeFee(currency) * 100, currency);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Reviews on my card</h1>
        <p className="text-sm text-slate-600">
          Honest criticism stays up. If a review is fake, written by someone who was
          never a customer, or breaks the rules, you can ask Godesi staff to look at
          it. The {fee} fee pays for that review — it does not buy a removal.
        </p>
      </div>

      {searchParams.error ? (
        <Alert tone="error">
          {ERRORS[searchParams.error] ?? "Something went wrong."}
        </Alert>
      ) : null}
      {searchParams.paid ? (
        <Alert tone="success">
          Payment received — your request is in the moderation queue. We usually
          decide within 5 working days.
        </Alert>
      ) : null}

      {!business ? (
        <EmptyState
          title="No business card yet"
          body="Create your card first — reviews land here."
        />
      ) : reviews.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          body="Share your card link on WhatsApp to collect your first reviews."
        />
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => {
            const dispute = review.disputes[0];
            const open =
              dispute?.status === "AWAITING_PAYMENT" || dispute?.status === "PENDING";
            return (
              <Card key={review.id} id={`review-${review.id}`} className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{review.authorName}</span>
                  <Badge tone="amber">{"★".repeat(review.rating)}</Badge>
                  <span className="text-xs text-slate-500">
                    {review.createdAt.toLocaleDateString("en-IN")}
                  </span>
                  {review.hidden ? <Badge tone="slate">Hidden by staff</Badge> : null}
                </div>
                {review.comment ? (
                  <p className="text-sm text-slate-700">{review.comment}</p>
                ) : null}

                {review.hidden ? (
                  <p className="text-xs text-slate-500">
                    This review is no longer shown on your public card.
                  </p>
                ) : dispute && open ? (
                  <p className="text-xs font-semibold text-amber-700">
                    {dispute.status === "AWAITING_PAYMENT"
                      ? "Request created — payment not completed yet."
                      : "Request paid and waiting for a decision."}
                  </p>
                ) : dispute?.status === "REJECTED" ? (
                  <p className="text-xs text-slate-600">
                    Request declined. {dispute.decisionNote ?? ""}
                  </p>
                ) : (
                  <form action={startReviewDisputeAction} className="space-y-2">
                    <input type="hidden" name="reviewId" value={review.id} />
                    <textarea
                      name="reason"
                      rows={2}
                      required
                      minLength={20}
                      placeholder="Why should this review be removed? Give facts — dates, order numbers, why this person was never a customer."
                      className={inputClass}
                    />
                    <button
                      type="submit"
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                    >
                      Request removal — {fee}
                    </button>
                  </form>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-xs text-slate-500">
        Godesi removes reviews that are fake, defamatory, paid for or off-topic. We do
        not remove a review only because you disagree with it. See our{" "}
        <Link href="/terms" className="text-indigo-600 hover:underline">
          terms
        </Link>
        .
      </p>
    </div>
  );
}
