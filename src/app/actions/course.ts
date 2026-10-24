"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { siteUrl } from "@/lib/format";
import { courseBySlug } from "@/lib/courses";

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
