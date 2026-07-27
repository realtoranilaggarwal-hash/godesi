import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { activatePlan, assertPaidPlan } from "@/lib/billing";
import { confirmTicket } from "@/lib/events";
import { confirmAdOrder } from "@/lib/adOrders";
import { confirmResourceOrder } from "@/lib/resourceOrders";
import { recordCouponFromMetadata } from "@/lib/coupons";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeEnabled() || !secret) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.payment_status === "paid") {
      const ticketId = session.metadata?.ticketId;
      const adOrderId = session.metadata?.adOrderId;
      const resourceOrderId = session.metadata?.resourceOrderId;
      const userId = session.metadata?.userId ?? session.client_reference_id;
      const plan = session.metadata?.plan;

      if (session.metadata?.kind === "ticket" && ticketId) {
        await confirmTicket({
          ticketId,
          provider: "stripe",
          reference: session.id,
          amountMinor: session.amount_total ?? 0,
          currency: (session.currency ?? "inr").toUpperCase(),
        });
      } else if (session.metadata?.kind === "ad" && adOrderId) {
        await confirmAdOrder({
          adOrderId,
          provider: "stripe",
          reference: session.id,
          amountMinor: session.amount_total ?? 0,
          currency: (session.currency ?? "inr").toUpperCase(),
        });
      } else if (session.metadata?.kind === "resource" && resourceOrderId) {
        await confirmResourceOrder({
          resourceOrderId,
          provider: "stripe",
          reference: session.id,
          amountMinor: session.amount_total ?? 0,
          currency: (session.currency ?? "inr").toUpperCase(),
        });
      } else if (userId && plan) {
        await activatePlan({
          userId,
          plan: assertPaidPlan(plan),
          provider: "stripe",
          reference: session.id,
          amountMinor: session.amount_total ?? 0,
          currency: (session.currency ?? "inr").toUpperCase(),
        });
      }

      /** Ticket coupons are held on the ticket row; plan/ad ones ride the session. */
      if (userId && session.metadata?.kind !== "ticket") {
        await recordCouponFromMetadata({
          metadata: session.metadata,
          userId,
          currency: (session.currency ?? "inr").toUpperCase(),
          reference: session.id,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
