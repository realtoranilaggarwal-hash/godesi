import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { startInvoiceCheckout } from "@/app/actions/invoices";
import { Button, Card } from "@/components/ui";
import { findInvoice, invoicePaid, usdMinor } from "@/lib/invoices";

export const metadata: Metadata = {
  title: "Pay your GoDesi invoice",
  robots: { index: false, follow: false },
};

export default async function PayInvoicePage({
  params,
  searchParams,
}: {
  params: { key: string };
  searchParams: { paid?: string };
}) {
  const invoice = findInvoice(params.key);
  if (!invoice) notFound();
  const amount = usdMinor(invoice.amountMinor);
  const paid = Boolean(searchParams.paid) || (await invoicePaid(invoice.key));

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-black">
        {paid ? "Thank you!" : `Pay ${amount}`}
      </h1>
      <Card className="space-y-3">
        <p className="text-sm font-semibold text-slate-500">{invoice.client}</p>
        <p className="text-lg font-bold">{invoice.title}</p>
        <p className="text-sm text-slate-600">{invoice.description}</p>
        <p className="text-3xl font-black">{amount}</p>
        {paid ? (
          <p className="rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">
            We received your payment. A receipt is on its way to your email.
          </p>
        ) : (
          <form action={startInvoiceCheckout}>
            <input type="hidden" name="key" value={invoice.key} />
            <Button type="submit" className="w-full">
              Pay {amount} by card
            </Button>
          </form>
        )}
      </Card>
      <p className="text-center text-sm text-slate-500">
        Questions? Call or WhatsApp Anil at{" "}
        <a href="tel:+17329837958">(732) 983-7958</a>.
      </p>
    </div>
  );
}
