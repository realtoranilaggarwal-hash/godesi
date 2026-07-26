import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { confirmTicket } from "@/lib/events";
import { Alert, Card, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ticket confirmed", robots: { index: false } };

/**
 * Verifies the Checkout Session server-side before confirming the ticket, so seats
 * can never be taken without payment. Idempotent with the webhook.
 */
export default async function TicketSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!searchParams.session_id || !stripeEnabled()) redirect("/events");

  let code: string | null = null;
  let error: string | null = null;

  try {
    const session = await getStripe().checkout.sessions.retrieve(searchParams.session_id);
    const ticketId = session.metadata?.ticketId;

    if (session.metadata?.kind !== "ticket" || !ticketId) {
      error = "This payment is not a ticket purchase.";
    } else if (session.payment_status !== "paid") {
      error = "Your payment has not completed yet.";
    } else {
      const ticket = await db.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        error = "We could not find that ticket.";
      } else if (ticket.userId !== user.id) {
        error = "This ticket belongs to a different account.";
      } else {
        const result = await confirmTicket({
          ticketId,
          provider: "stripe",
          reference: session.id,
          amount: Math.round((session.amount_total ?? 0) / 100),
          currency: (session.currency ?? "inr").toUpperCase(),
        });
        code = result.ticket.code;
      }
    }
  } catch {
    error = "We could not verify this payment. Please contact support.";
  }

  if (code) redirect(`/tickets/${code}`);

  return (
    <div className="mx-auto max-w-lg space-y-4 py-8 text-center">
      <Card className="space-y-4">
        <h1 className="text-2xl font-bold">Booking pending</h1>
        <Alert>{error}</Alert>
        <p className="text-sm text-slate-500">
          If you were charged, your ticket confirms automatically within a minute.
        </p>
        <LinkButton href="/dashboard/tickets" variant="secondary">
          My tickets
        </LinkButton>
        <Link href="/events" className="block font-semibold text-indigo-600">
          Back to events
        </Link>
      </Card>
    </div>
  );
}
