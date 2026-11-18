import type { Metadata } from "next";
import { VenmoPay } from "@/components/VenmoPay";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pay GoDesi with Venmo",
  description: "Scan the GoDesi Venmo code to pay for tickets, services or anything we've quoted you.",
};

export default function VenmoPage() {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-black">Pay GoDesi with Venmo</h1>
      <p className="text-sm text-slate-600">
        For tickets, social media services or anything we&apos;ve quoted you. Put your name and what
        the payment is for in the Venmo note, then text us at 732-877-8585 or email{" "}
        {SITE.salesEmail} so we can confirm it.
      </p>
      <VenmoPay />
    </div>
  );
}
