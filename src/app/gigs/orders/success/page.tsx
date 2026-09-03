import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { confirmGigOrder } from "@/lib/gigs";
import { Alert, Card, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Order placed",
  robots: { index: false },
};

/** Verifies the Checkout Session with Stripe before marking the order paid; idempotent with the webhook. */
export default async function GigOrderSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!searchParams.session_id || !stripeEnabled()) redirect("/gigs");

  let orderId: string | null = null;
  let error: string | null = null;

  try {
    const session = await getStripe().checkout.sessions.retrieve(
      searchParams.session_id,
    );
    const id = session.metadata?.gigOrderId;
    if (session.metadata?.kind !== "gig" || !id) {
      error = "This payment is not a gig order.";
    } else if (session.payment_status !== "paid") {
      error = "Your payment has not completed yet.";
    } else {
      const order = await db.gigOrder.findUnique({ where: { id } });
      if (!order) {
        error = "We could not find that order.";
      } else if (order.buyerId !== user.id) {
        error = "This order belongs to a different account.";
      } else {
        await confirmGigOrder({
          orderId: order.id,
          sessionId: session.id,
          paymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
        });
        orderId = order.id;
      }
    }
  } catch {
    error = "We could not verify this payment. Please contact support.";
  }

  if (orderId) redirect(`/gigs/orders/${orderId}?paid=1`);

  return (
    <div className="mx-auto max-w-lg space-y-4 py-8 text-center">
      <Card className="space-y-4">
        <h1 className="text-2xl font-bold">Order pending</h1>
        <Alert>{error}</Alert>
        <p className="text-sm text-slate-500">
          If you were charged, the order confirms automatically within a minute.
        </p>
        <LinkButton href="/dashboard/gigs" variant="secondary">
          My orders
        </LinkButton>
        <Link href="/gigs" className="block font-semibold text-indigo-600">
          Back to gigs
        </Link>
      </Card>
    </div>
  );
}
