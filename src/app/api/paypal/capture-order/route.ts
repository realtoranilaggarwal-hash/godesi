import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { capturePayPalOrder, paypalEnabled } from "@/lib/paypal";
import { toMinor } from "@/lib/format";
import { activatePlan, assertPaidPlan } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!paypalEnabled()) {
    return NextResponse.json({ error: "PayPal is not configured" }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { orderId?: string } | null;
  if (!body?.orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  try {
    const order = await capturePayPalOrder(body.orderId);
    const unit = order.purchase_units?.[0];
    const capture = unit?.payments?.captures?.[0];

    if (order.status !== "COMPLETED" || capture?.status !== "COMPLETED") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }

    // custom_id is set server-side at order creation, so the buyer cannot forge it.
    const [userId, planId] = (unit?.custom_id ?? "").split(":");
    if (userId !== user.id || !planId) {
      return NextResponse.json({ error: "Payment does not match account" }, { status: 403 });
    }

    await activatePlan({
      userId: user.id,
      plan: assertPaidPlan(planId),
      provider: "paypal",
      reference: capture.id,
      amountMinor: toMinor(Number(capture.amount.value)),
      currency: capture.amount.currency_code,
    });

    revalidatePath("/dashboard");
    revalidatePath("/pricing");
    return NextResponse.json({ ok: true, plan: planId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Capture failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
