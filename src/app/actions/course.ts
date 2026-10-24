"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { siteUrl } from "@/lib/format";
import {
  COURSE_PRICE_MINOR,
  COURSE_SLUG,
  COURSE_TITLE,
} from "@/lib/course";

/** $9.99 one-time seat in the marketing course; PAID unlocks /course/learn. */
export async function buyCourseAction(): Promise<void> {
  const user = await requireUser();
  if (!stripeEnabled()) redirect("/course?error=stripe_unavailable");

  const enrollment = await db.courseEnrollment.upsert({
    where: {
      userId_courseSlug: { userId: user.id, courseSlug: COURSE_SLUG },
    },
    create: {
      userId: user.id,
      courseSlug: COURSE_SLUG,
      amountMinor: COURSE_PRICE_MINOR,
      currency: "USD",
    },
    update: {},
  });
  if (enrollment.status === "PAID") redirect("/course/learn");

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: {
      kind: "course",
      courseEnrollmentId: enrollment.id,
      userId: user.id,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: COURSE_PRICE_MINOR,
          product_data: {
            name: COURSE_TITLE,
            description:
              "Lifetime access — UGC, affiliate income, selling online, and scaling it into real assets.",
          },
        },
      },
    ],
    success_url: `${siteUrl()}/course/learn?welcome=1`,
    cancel_url: `${siteUrl()}/course?error=cancelled`,
  });
  if (!session.url) redirect("/course?error=stripe_unavailable");
  redirect(session.url);
}

/** Marks a course seat paid — called by the Stripe webhook (idempotent). */
export async function confirmCourseEnrollment(args: {
  enrollmentId: string;
  provider: string;
  reference: string;
}) {
  const enrollment = await db.courseEnrollment.findUnique({
    where: { id: args.enrollmentId },
  });
  if (!enrollment || enrollment.status === "PAID") return;
  await db.courseEnrollment.update({
    where: { id: enrollment.id },
    data: { status: "PAID", provider: args.provider, reference: args.reference },
  });
}

export async function hasCourseAccess(userId: string) {
  const enrollment = await db.courseEnrollment.findUnique({
    where: {
      userId_courseSlug: { userId, courseSlug: COURSE_SLUG },
    },
    select: { status: true },
  });
  return enrollment?.status === "PAID";
}
