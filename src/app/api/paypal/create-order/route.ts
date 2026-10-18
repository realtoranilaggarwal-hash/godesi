import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createPayPalOrder, paypalEnabled } from "@/lib/paypal";
import { planOrThrow } from "@/lib/billing";
import { PLAN_TERMS, planTermPrice, planTerms, termOrThrow } from "@/lib/plans";
import { checkCoupon, planCouponScopes } from "@/lib/coupons";
import { fromMinor, toMinor } from "@/lib/format";

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
    couponCode?: string;
  } | null;

  try {
    const plan = planOrThrow(String(body?.plan ?? ""));
    const term = termOrThrow(String(body?.term ?? "MONTH"));
    const amount = planTerms(plan).includes(term)
      ? planTermPrice(plan, term, "USD")
      : null;
    if (amount === null) throw new Error("That term is not on sale");
    const code = String(body?.couponCode ?? "").trim();
    const check = code
      ? await checkCoupon({
          code,
          scope: planCouponScopes(plan.id, term),
          userId: user.id,
          subtotalMinor: toMinor(amount),
          currency: "USD",
        })
      : null;
    if (check && !check.ok) throw new Error(check.error);
    const discountMinor = check?.ok ? check.discountMinor : 0;
    const couponPart = check?.ok ? `:${check.coupon.id}:${discountMinor}` : "";
    const order = await createPayPalOrder({
      amount: fromMinor(toMinor(amount) - discountMinor),
      currency: "USD",
      description: `Godesi ${plan.name} — ${PLAN_TERMS[term].label}${discountMinor ? " · coupon applied" : ""}`,
      customId: `${user.id}:${plan.id}:${PLAN_TERMS[term].months}${couponPart}`,
    });
    return NextResponse.json({ id: order.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
