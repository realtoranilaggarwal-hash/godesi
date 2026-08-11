"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { activatePlan, planOrThrow } from "@/lib/billing";
import { planPrice } from "@/lib/currency";
import { toMinor } from "@/lib/format";
import { newUpiReference, upiEnabled } from "@/lib/upi";
import { checkCoupon } from "@/lib/coupons";

/** Creates a UPI request and sends the buyer to the QR page. */
export async function startUpiPaymentAction(formData: FormData) {
  const user = await requireUser();
  const plan = planOrThrow(String(formData.get("plan") ?? ""));
  if (!upiEnabled()) redirect("/pricing?error=upi_unavailable");

  const listAmount = toMinor(planPrice(plan, "INR"));
  const code = String(formData.get("couponCode") ?? "").trim();
  const check = code
    ? await checkCoupon({
        code,
        scope: "PLAN",
        userId: user.id,
        subtotalMinor: listAmount,
        currency: "INR",
      })
    : null;
  if (check && !check.ok) redirect("/pricing?error=coupon");

  const amountMinor = Math.max(
    100,
    listAmount - (check?.ok ? check.discountMinor : 0),
  );

  const request = await db.upiRequest.create({
    data: {
      userId: user.id,
      plan: plan.id,
      amountMinor,
      currency: "INR",
      reference: newUpiReference(),
    },
  });

  redirect(`/pricing/upi/${request.reference}`);
}

/** The buyer tells us they have paid, ideally with the UPI transaction id. */
export async function confirmUpiPaymentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const reference = String(formData.get("reference") ?? "");
    const utr = String(formData.get("utr") ?? "")
      .trim()
      .slice(0, 40);

    const request = await db.upiRequest.findUnique({ where: { reference } });
    if (!request || request.userId !== user.id) {
      return { error: "We could not find that payment request." };
    }
    if (request.status !== "PENDING") {
      return { error: "This request has already been reviewed." };
    }
    if (utr.length < 6) {
      return {
        error:
          "Please paste the UPI transaction / UTR number from your payment app.",
      };
    }

    await db.upiRequest.update({
      where: { id: request.id },
      data: { utr },
    });

    revalidatePath(`/pricing/upi/${reference}`);
    revalidatePath("/admin");
    return {
      success:
        "Thanks! We will check the credit and activate your plan — usually within a few hours.",
    };
  } catch (error) {
    return fieldError(error);
  }
}

/** Admin confirms the money arrived (or rejects the request). */
export async function reviewUpiPaymentAction(formData: FormData) {
  const staff = await requireUser();
  if (staff.role !== "ADMIN") throw new Error("FORBIDDEN");

  const id = String(formData.get("id") ?? "");
  const approve = String(formData.get("decision") ?? "") === "approve";

  const request = await db.upiRequest.findUnique({ where: { id } });
  if (!request || request.status !== "PENDING") return;

  if (approve) {
    await activatePlan({
      userId: request.userId,
      plan: request.plan,
      provider: "upi",
      reference: `upi_${request.reference}`,
      amountMinor: request.amountMinor,
      currency: request.currency,
    });
  }

  await db.upiRequest.update({
    where: { id: request.id },
    data: {
      status: approve ? "PAID" : "REJECTED",
      reviewedAt: new Date(),
      reviewedById: staff.id,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath(`/pricing/upi/${request.reference}`);
}
