import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { activatePlan, assertPaidPlan } from "@/lib/billing";
import { Alert, Card, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Payment complete" };

/**
 * Verifies the Checkout Session server-side before granting the plan, so a user
 * cannot self-upgrade by visiting this URL. The webhook does the same thing;
 * `activatePlan` is idempotent on the session id, so whichever lands first wins.
 */
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!searchParams.session_id || !stripeEnabled()) redirect("/pricing");

  let granted: string | null = null;
  let error: string | null = null;

  try {
    const session = await getStripe().checkout.sessions.retrieve(searchParams.session_id);
    const userId = session.metadata?.userId ?? session.client_reference_id;
    const plan = session.metadata?.plan;

    if (session.payment_status !== "paid") {
      error = "Your payment has not completed yet. It may take a moment to confirm.";
    } else if (userId !== user.id || !plan) {
      error = "This payment belongs to a different account.";
    } else {
      await activatePlan({
        userId: user.id,
        plan: assertPaidPlan(plan),
        provider: "stripe",
        reference: session.id,
        amount: Math.round((session.amount_total ?? 0) / 100),
        currency: (session.currency ?? "inr").toUpperCase(),
      });
      granted = plan;
    }
  } catch {
    error = "We could not verify this payment. Please contact support.";
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 py-8 text-center">
      <Card className="space-y-4">
        {granted ? (
          <>
            <h1 className="text-2xl font-bold">Payment successful</h1>
            <p className="text-slate-600">
              Your <strong>{granted}</strong> plan is active for the next 30 days.
            </p>
            <LinkButton href="/dashboard">Go to dashboard</LinkButton>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Payment pending</h1>
            <Alert>{error}</Alert>
            <p className="text-sm text-slate-500">
              If you were charged, your plan activates automatically once the payment
              confirms.
            </p>
            <Link href="/pricing" className="font-semibold text-indigo-600">
              Back to plans
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}
