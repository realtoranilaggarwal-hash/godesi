import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PLANS } from "@/lib/plans";
import { formatMinor } from "@/lib/format";
import { upiEnabled, upiIntentUrl, upiVpa } from "@/lib/upi";
import { UpiConfirmForm } from "@/components/forms/UpiConfirmForm";
import { Alert, Badge, Card } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Pay by UPI",
  robots: { index: false },
};

export default async function UpiCheckoutPage({
  params,
}: {
  params: { reference: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/pricing/upi/${params.reference}`);

  const upi = await db.upiRequest.findUnique({
    where: { reference: params.reference },
  });
  if (!upi || upi.userId !== user.id) notFound();

  const plan = PLANS[upi.plan];
  const amount = formatMinor(upi.amountMinor, upi.currency);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Pay by UPI</h1>
        <p className="mt-1 text-sm text-slate-600">
          {plan.name} membership · 30 days ·{" "}
          <span className="font-semibold text-slate-900">{amount}</span>
        </p>
      </div>

      {upi.status === "PAID" ? (
        <Alert tone="success">
          Payment confirmed — your {plan.name} plan is active. See it on your{" "}
          <Link href="/dashboard" className="font-semibold underline">
            dashboard
          </Link>
          .
        </Alert>
      ) : null}
      {upi.status === "REJECTED" ? (
        <Alert>
          We could not match this payment. If you did pay, please{" "}
          <Link href="/contact" className="font-semibold underline">
            contact us
          </Link>{" "}
          with the transaction number.
        </Alert>
      ) : null}

      {upi.status === "PENDING" ? (
        <>
          {!upiEnabled() ? (
            <Alert>
              UPI is not configured on this site yet — please use another payment
              method.
            </Alert>
          ) : (
            <Card className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/qr/upi/${upi.reference}`}
                  alt={`UPI QR code for ${amount}`}
                  className="h-64 w-64 rounded-2xl border border-slate-200 bg-white p-2"
                />
                <a
                  href={upiIntentUrl({
                    amountMinor: upi.amountMinor,
                    reference: upi.reference,
                    currency: upi.currency,
                  })}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 sm:hidden"
                >
                  Open my UPI app
                </a>
              </div>

              <dl className="grid gap-2 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2">
                  <dt className="font-semibold text-slate-700">UPI ID</dt>
                  <dd className="flex items-center gap-2 font-mono">
                    {upiVpa()}
                    <CopyButton value={upiVpa()} label="Copy" />
                  </dd>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2">
                  <dt className="font-semibold text-slate-700">Amount</dt>
                  <dd className="font-semibold">{amount}</dd>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-50 px-3 py-2">
                  <dt className="font-semibold text-amber-900">
                    Reference (put this in the note)
                  </dt>
                  <dd className="flex items-center gap-2 font-mono font-bold text-amber-900">
                    {upi.reference}
                    <CopyButton value={upi.reference} label="Copy" />
                  </dd>
                </div>
              </dl>

              <ol className="space-y-1 text-sm text-slate-700">
                <li>1. Scan the QR with PhonePe, Google Pay, Paytm or your bank app.</li>
                <li>
                  2. Check the amount is {amount} and add{" "}
                  <span className="font-mono font-semibold">{upi.reference}</span>{" "}
                  in the remarks/note.
                </li>
                <li>3. Pay, then paste the transaction number below.</li>
              </ol>

              <UpiConfirmForm reference={upi.reference} utr={upi.utr} />

              {upi.utr ? (
                <Alert tone="info">
                  Received — we are checking transaction{" "}
                  <span className="font-mono">{upi.utr}</span> and will activate
                  your plan shortly. <Badge tone="amber">Awaiting review</Badge>
                </Alert>
              ) : null}

              <p className="text-xs text-slate-500">
                UPI payments are confirmed by our team, so activation is not
                instant. Pay only the amount shown, and never send money to
                anyone who contacts you claiming to be Godesi — this page is the
                only place we ask for a UPI payment.
              </p>
            </Card>
          )}
        </>
      ) : null}

      <p className="text-center text-sm">
        <Link href="/pricing" className="font-semibold text-indigo-600 underline">
          Back to plans
        </Link>
      </p>
    </div>
  );
}
