"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole, requireUser } from "@/lib/auth";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { siteUrl } from "@/lib/format";
import { courseBySlug } from "@/lib/courses";
import {
  FREE_CODE_PROVIDER,
  freeCodeReference,
  generateFreeCourseCode,
  verifyFreeCourseCode,
} from "@/lib/courseCodes";

/** $9 launch seat in a catalog course; PAID unlocks /course/[slug]/learn. */
export async function buyCourseAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("course") ?? "");
  const course = courseBySlug(slug);
  if (!course) redirect("/course");
  const user = await requireUser();
  if (!stripeEnabled()) redirect(`/course/${slug}?error=stripe_unavailable`);

  const enrollment = await db.courseEnrollment.upsert({
    where: {
      userId_courseSlug: { userId: user.id, courseSlug: slug },
    },
    create: {
      userId: user.id,
      courseSlug: slug,
      amountMinor: course.priceMinor,
      currency: "USD",
    },
    update: {},
  });
  if (enrollment.status === "PAID") redirect(`/course/${slug}/learn`);

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
          unit_amount: course.priceMinor,
          product_data: {
            name: course.title,
            description: `Lifetime access — ${course.tagline}`,
          },
        },
      },
    ],
    success_url: `${siteUrl()}/course/${slug}/learn?welcome=1`,
    cancel_url: `${siteUrl()}/course/${slug}?error=cancelled`,
  });
  if (!session.url) redirect(`/course/${slug}?error=stripe_unavailable`);
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

export async function hasCourseAccess(userId: string, slug: string) {
  const enrollment = await db.courseEnrollment.findUnique({
    where: {
      userId_courseSlug: { userId, courseSlug: slug },
    },
    select: { status: true },
  });
  return enrollment?.status === "PAID";
}

/** Staff mint a one-time "any course free" code to give a home buyer/seller client. */
export async function generateFreeCourseCodeAction(): Promise<void> {
  await requireRole("ADMIN");
  redirect(`/admin/coupons?freeCode=${generateFreeCourseCode()}#free-course`);
}

/** Unlocks one course with a free-course code; each code works exactly once. */
export async function redeemFreeCourseCodeAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("course") ?? "");
  const course = courseBySlug(slug);
  if (!course) redirect("/course");
  const user = await requireUser();
  const code = verifyFreeCourseCode(String(formData.get("code") ?? ""));
  if (!code) redirect(`/course/${slug}?error=code_invalid#free-code`);

  const reference = freeCodeReference(code);
  const used = await db.courseEnrollment.findUnique({ where: { reference } });
  if (used) {
    redirect(
      used.userId === user.id && used.courseSlug === slug
        ? `/course/${slug}/learn`
        : `/course/${slug}?error=code_used#free-code`,
    );
  }

  const existing = await db.courseEnrollment.findUnique({
    where: { userId_courseSlug: { userId: user.id, courseSlug: slug } },
  });
  if (existing?.status === "PAID") redirect(`/course/${slug}/learn`);

  try {
    await db.courseEnrollment.upsert({
      where: { userId_courseSlug: { userId: user.id, courseSlug: slug } },
      create: {
        userId: user.id,
        courseSlug: slug,
        amountMinor: 0,
        currency: "USD",
        provider: FREE_CODE_PROVIDER,
        reference,
        status: "PAID",
      },
      update: {
        amountMinor: 0,
        provider: FREE_CODE_PROVIDER,
        reference,
        status: "PAID",
      },
    });
  } catch {
    // Unique `reference` clash: someone redeemed the same code a moment ago.
    redirect(`/course/${slug}?error=code_used#free-code`);
  }
  redirect(`/course/${slug}/learn?welcome=1`);
}
