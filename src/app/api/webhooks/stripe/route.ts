import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { activatePlan, assertPaidPlan } from "@/lib/billing";
import { confirmTicket } from "@/lib/events";

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
      const userId = session.metadata?.userId ?? session.client_reference_id;
      const plan = session.metadata?.plan;

      if (session.metadata?.kind === "ticket" && ticketId) {
        await confirmTicket({
          ticketId,
          provider: "stripe",
          reference: session.id,
          amount: Math.round((session.amount_total ?? 0) / 100),
          currency: (session.currency ?? "inr").toUpperCase(),
        });
      } else if (userId && plan) {
        await activatePlan({
          userId,
          plan: assertPaidPlan(plan),
          provider: "stripe",
          reference: session.id,
          amount: Math.round((session.amount_total ?? 0) / 100),
          currency: (session.currency ?? "inr").toUpperCase(),
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
