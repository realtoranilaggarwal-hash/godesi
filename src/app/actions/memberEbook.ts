"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import {
  MEMBER_EBOOK_PRICE_MINOR,
  MEMBER_EBOOK_PROVIDER,
  freePickReference,
  memberEbookBySlug,
  memberEbookKey,
} from "@/lib/memberEbooks";

async function bookAndUser(formData: FormData) {
  const book = memberEbookBySlug(String(formData.get("ebook") ?? ""));
  if (!book) redirect("/");
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/ebooks/${book.slug}`);
  return { book, user };
}

/** Whether the member already used their one free pick from this owner's shelf. */
export async function freePickUsed(owner: string, userId: string) {
  return Boolean(
    await db.courseEnrollment.findUnique({
      where: { reference: freePickReference(owner, userId) },
      select: { id: true },
    }),
  );
}

/** A signed-in member's one free ebook from a shelf. */
export async function claimFreeMemberEbookAction(formData: FormData): Promise<void> {
  const { book, user } = await bookAndUser(formData);
  const key = memberEbookKey(book.slug);
  const back = `/ebooks/${book.slug}`;
  const existing = await db.courseEnrollment.findUnique({
    where: { userId_courseSlug: { userId: user.id, courseSlug: key } },
  });
  if (existing?.status === "PAID") redirect(`${back}?welcome=1`);
  if (await freePickUsed(book.owner, user.id)) redirect(`${back}?error=pick_used`);
  const data = {
    status: "PAID" as const,
    amountMinor: 0,
    provider: MEMBER_EBOOK_PROVIDER,
    reference: freePickReference(book.owner, user.id),
  };
  try {
    await db.courseEnrollment.upsert({
      where: { userId_courseSlug: { userId: user.id, courseSlug: key } },
      create: { userId: user.id, courseSlug: key, currency: "USD", ...data },
      update: data,
    });
  } catch (err) {
    // Unique `reference`: a second tab claimed a different book a moment ago.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      redirect(`${back}?error=pick_used`);
    }
    throw err;
  }
  redirect(`${back}?welcome=1`);
}

/** $9.99 card checkout; the Stripe webhook marks the enrollment PAID. */
export async function buyMemberEbookAction(formData: FormData): Promise<void> {
  const { book, user } = await bookAndUser(formData);
  const key = memberEbookKey(book.slug);
  const back = `/ebooks/${book.slug}`;
  if (!stripeEnabled()) redirect(`${back}?error=stripe_unavailable`);
  const enrollment = await db.courseEnrollment.upsert({
    where: { userId_courseSlug: { userId: user.id, courseSlug: key } },
    create: { userId: user.id, courseSlug: key, amountMinor: MEMBER_EBOOK_PRICE_MINOR, currency: "USD" },
    update: {},
  });
  if (enrollment.status === "PAID") redirect(`${back}?welcome=1`);
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: { kind: "member-ebook", courseEnrollmentId: enrollment.id, userId: user.id, owner: book.owner },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: MEMBER_EBOOK_PRICE_MINOR,
          product_data: { name: `${book.title} (ebook)`, description: `PDF ebook by ${book.ownerName}` },
        },
      },
    ],
    success_url: `${siteUrl()}${back}?welcome=1`,
    cancel_url: `${siteUrl()}${back}?error=cancelled`,
  });
  if (!session.url) redirect(`${back}?error=stripe_unavailable`);
  redirect(session.url);
}
