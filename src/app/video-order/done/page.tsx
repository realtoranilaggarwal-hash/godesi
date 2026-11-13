import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { confirmVideoOrder, VIDEO_OFFER } from "@/lib/videoOrders";
import { Alert, Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Video ordered",
  robots: { index: false },
};

/** Verifies the Checkout Session with Stripe before marking the order paid; idempotent with the webhook. */
export default async function VideoOrderDonePage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/video-order");
  if (!searchParams.session_id || !stripeEnabled()) redirect("/video-order");

  let order: Awaited<ReturnType<typeof confirmVideoOrder>> = null;
  let error: string | null = null;
  try {
    const session = await getStripe().checkout.sessions.retrieve(searchParams.session_id);
    const id = session.metadata?.videoOrderId;
    const found = id ? await db.videoOrder.findUnique({ where: { id } }) : null;
    if (session.metadata?.kind !== "ai-video" || !found) {
      error = "We could not find that video order.";
    } else if (found.userId !== user.id) {
      error = "This order belongs to a different account.";
    } else if (session.payment_status !== "paid") {
      error = "Your payment has not completed yet.";
    } else {
      order = await confirmVideoOrder({
        orderId: found.id,
        sessionId: session.id,
        paymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : (session.payment_intent?.id ?? null),
        email: session.customer_details?.email,
      });
    }
  } catch {
    error = "We could not verify this payment. Please contact support.";
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 py-8">
      {order ? (
        <Card className="space-y-3 border-emerald-200 bg-emerald-50">
          <h1 className="text-2xl font-black text-slate-900">🎬 Your video is ordered</h1>
          <p className="text-sm text-slate-700">
            Thank you! We are making the video for <strong>{order.businessName}</strong> in{" "}
            {order.language} and will WhatsApp it to <strong>{order.deliveryWhatsapp}</strong>.
            Want a change? Just reply on WhatsApp — {VIDEO_OFFER.revisions} revision is included.
          </p>
          <Link href={VIDEO_OFFER.examplesHref} className="block text-sm font-semibold text-indigo-700 underline">
            Watch GoDesi Shorts while you wait →
          </Link>
        </Card>
      ) : (
        <Card className="space-y-3 text-center">
          <h1 className="text-2xl font-bold">Order pending</h1>
          <Alert>{error}</Alert>
          <p className="text-sm text-slate-500">
            If you were charged, the order confirms automatically within a minute.
          </p>
          <Link href="/video-order" className="block font-semibold text-indigo-600">
            Back to the video order
          </Link>
        </Card>
      )}
    </div>
  );
}
