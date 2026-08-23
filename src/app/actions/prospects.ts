"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ProspectStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

const DESK = "/admin/prospects";

function isStatus(value: string): value is ProspectStatus {
  return Object.values(ProspectStatus).includes(value as ProspectStatus);
}

/**
 * Records the call: who made it, what the business said, and where the row goes
 * next. Taking a row assigns it, so two moderators never ring the same shop.
 */
export async function saveProspectCallAction(formData: FormData) {
  const staff = await requireStaff();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 800);
  const listedSlug = String(formData.get("listedSlug") ?? "")
    .trim()
    .replace(/^.*\/b\//, "")
    .slice(0, 120);
  if (!id || !isStatus(status)) return;

  const prospect = await db.prospect.findUnique({
    where: { id },
    select: { ownerId: true },
  });
  if (!prospect) return;

  await db.prospect.update({
    where: { id },
    data: {
      status,
      note: note || null,
      listedSlug: listedSlug || null,
      // A call is what moves a row on, so anything past NEW is dated.
      calledAt: status === "NEW" ? null : new Date(),
      // The first person to work a row owns it until an admin frees it.
      ownerId: prospect.ownerId ?? staff.id,
    },
  });

  revalidatePath(DESK);
}

/** Puts a row back in the pool, e.g. when a moderator leaves or is off. */
export async function releaseProspectAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db.prospect.update({
    where: { id },
    data: { ownerId: null },
  });
  revalidatePath(DESK);
}

/** Hands a moderator the next batch of untouched rows on her beat. */
export async function takeProspectsAction(formData: FormData) {
  const staff = await requireStaff();
  const categorySlug = String(formData.get("categorySlug") ?? "");
  const howMany = Math.min(
    50,
    Math.max(1, Number(formData.get("howMany") ?? "20") || 20),
  );

  const rows = await db.prospect.findMany({
    where: {
      ownerId: null,
      status: "NEW",
      ...(categorySlug ? { categorySlug } : {}),
      // Only rows she can actually ring or write to.
      OR: [{ phone: { not: null } }, { email: { not: null } }],
    },
    orderBy: { name: "asc" },
    take: howMany,
    select: { id: true },
  });

  if (rows.length) {
    await db.prospect.updateMany({
      where: { id: { in: rows.map((row) => row.id) } },
      data: { ownerId: staff.id },
    });
  }

  revalidatePath(DESK);
  redirect(`${DESK}?mine=1${categorySlug ? `&category=${categorySlug}` : ""}`);
}
