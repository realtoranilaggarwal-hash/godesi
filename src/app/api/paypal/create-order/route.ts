import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createPayPalOrder, paypalEnabled } from "@/lib/paypal";
import { planOrThrow } from "@/lib/billing";
import { PLAN_TERMS, planTermPrice, planTerms, termOrThrow } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!paypalEnabled()) {
    return NextResponse.json({ error: "PayPal is not configured" }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    plan?: string;
    term?: string;
  } | null;

  try {
    const plan = planOrThrow(String(body?.plan ?? ""));
    const term = termOrThrow(String(body?.term ?? "MONTH"));
    const amount = planTerms(plan).includes(term)
      ? planTermPrice(plan, term, "USD")
      : null;
    if (amount === null) throw new Error("That term is not on sale");
    const order = await createPayPalOrder({
      amount,
      currency: "USD",
      description: `Godesi ${plan.name} — ${PLAN_TERMS[term].label}`,
      customId: `${user.id}:${plan.id}:${PLAN_TERMS[term].months}`,
    });
    return NextResponse.json({ id: order.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
