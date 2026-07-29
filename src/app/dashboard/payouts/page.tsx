import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Alert, Badge, Card } from "@/components/ui";
import {
  refreshConnectStatusAction,
  startConnectOnboardingAction,
} from "@/app/actions/connect";
import { platformFeePercent } from "@/lib/connect";
import { formatMinor } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ticket payouts" };

const ERRORS: Record<string, string> = {
  stripe_unavailable: "Card payments are not configured yet — please try again later.",
  not_connected: "Connect your Stripe account first.",
};

export default async function PayoutsPage({
  searchParams,
}: {
  searchParams: { connected?: string; refresh?: string; error?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/payouts");

  const events = await db.event.findMany({
    where: { organizerId: user.id },
    orderBy: { startsAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      currency: true,
      tickets: {
        where: { status: "CONFIRMED" },
        select: { amountMinor: true, quantity: true },
      },
    },
  });

  const fee = platformFeePercent();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Ticket payouts</h1>
        <p className="text-sm text-slate-600">
          Connect your own Stripe account and ticket money goes straight to you.
          Godesi keeps a {fee}% service fee per ticket; Stripe charges its own
          processing fee separately.
        </p>
      </div>

      {searchParams.error ? (
        <Alert tone="error">
          {ERRORS[searchParams.error] ?? "Something went wrong."}
        </Alert>
      ) : null}
      {searchParams.connected ? (
        <Alert tone="success">
          Stripe returned you here — press “Refresh status” to confirm your account
          can take payments.
        </Alert>
      ) : null}

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold">Your Stripe account</h2>
          {user.stripePayoutsEnabled ? (
            <Badge tone="green">Ready — you get paid directly</Badge>
          ) : user.stripeAccountId ? (
            <Badge tone="amber">Started, not finished</Badge>
          ) : (
            <Badge tone="slate">Not connected</Badge>
          )}
        </div>
        <p className="text-sm text-slate-600">
          {user.stripePayoutsEnabled
            ? "Buyers pay you directly. Refunds and payouts are managed in your own Stripe dashboard."
            : "Until this is connected, paid tickets are collected by Godesi and settled with you manually."}
        </p>
        <div className="flex flex-wrap gap-2">
          <form action={startConnectOnboardingAction}>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              {user.stripeAccountId ? "Continue on Stripe" : "Connect Stripe"}
            </button>
          </form>
          {user.stripeAccountId ? (
            <form action={refreshConnectStatusAction}>
              <button
                type="submit"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Refresh status
              </button>
            </form>
          ) : null}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-bold">Ticket sales by event</h2>
        {events.length === 0 ? (
          <p className="text-sm text-slate-500">No events yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {events.map((event) => {
              const gross = event.tickets.reduce(
                (sum, ticket) => sum + ticket.amountMinor,
                0,
              );
              const seats = event.tickets.reduce(
                (sum, ticket) => sum + ticket.quantity,
                0,
              );
              return (
                <li key={event.id} className="flex justify-between gap-3 py-2">
                  <span className="min-w-0 truncate font-medium">{event.title}</span>
                  <span className="shrink-0 text-slate-600">
                    {seats} seat(s) · {formatMinor(gross, event.currency)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
