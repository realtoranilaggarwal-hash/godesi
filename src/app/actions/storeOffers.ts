"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { syncCjOffers } from "@/lib/cj";

function refresh() {
  revalidatePath("/deals");
  revalidatePath("/shop");
  revalidatePath("/admin/resources");
}

/** Staff: keep an off-brand or unsuitable store offer off the site through re-syncs. */
export async function toggleStoreOfferAction(formData: FormData) {
  const user = await requireUser();
  if (!can(user, "resources")) throw new Error("FORBIDDEN");
  const id = String(formData.get("id") ?? "");
  const offer = await db.storeOffer.findUnique({ where: { id } });
  if (!offer) return;
  await db.storeOffer.update({
    where: { id },
    data: { hidden: !offer.hidden },
  });
  refresh();
}

export async function syncStoreOffersAction() {
  const user = await requireUser();
  if (!can(user, "resources")) throw new Error("FORBIDDEN");
  await syncCjOffers();
  refresh();
}
