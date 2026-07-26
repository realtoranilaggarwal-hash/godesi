"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Plan } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PLANS } from "@/lib/plans";

/**
 * Mock checkout: records a Payment row and activates the plan for 30 days.
 * Swap the provider block for a real gateway (Stripe/Razorpay) webhook later.
 */
export async function subscribeAction(formData: FormData) {
  const user = await requireUser();
  const planId = String(formData.get("plan") ?? "") as Plan;
  const plan = PLANS[planId];
  if (!plan) throw new Error("Unknown plan");

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  if (plan.id === "FREE") {
    await db.user.update({
      where: { id: user.id },
      data: { plan: "FREE", planExpiresAt: null },
    });
  } else {
    await db.$transaction([
      db.payment.create({
        data: {
          userId: user.id,
          plan: plan.id,
          amount: plan.priceInr,
          provider: "mock",
          reference: `mock_${Date.now()}`,
        },
      }),
      db.user.update({
        where: { id: user.id },
        data: { plan: plan.id, planExpiresAt: expiresAt },
      }),
      db.business.updateMany({
        where: { ownerId: user.id },
        data: { featured: true },
      }),
    ]);
  }

  revalidatePath("/dashboard");
  revalidatePath("/pricing");
  redirect("/dashboard?upgraded=" + plan.id);
}
