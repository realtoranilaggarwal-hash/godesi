"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";

export async function dismissSearchMissAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !isStaff(user)) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.searchMiss.deleteMany({ where: { id } });
  revalidatePath("/admin/missed-searches");
}
