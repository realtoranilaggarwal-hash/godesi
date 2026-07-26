import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createPayPalOrder, paypalEnabled } from "@/lib/paypal";
import { planOrThrow } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!paypalEnabled()) {
    return NextResponse.json({ error: "PayPal is not configured" }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { plan?: string } | null;

  try {
    const plan = planOrThrow(String(body?.plan ?? ""));
    const order = await createPayPalOrder({
      amount: plan.priceUsd,
      currency: "USD",
      description: `Godesi ${plan.name} — 30 days`,
      customId: `${user.id}:${plan.id}`,
    });
    return NextResponse.json({ id: order.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
