"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { claimWeddingLaunch } from "@/lib/weddingLaunch";

/** Dashboard button: wedding vendors who joined before the offer can still take a seat. */
export async function claimWeddingLaunchAction() {
  const user = await requireUser();
  const outcome = await claimWeddingLaunch(user.id);
  revalidatePath("/dashboard");
  redirect(outcome.ok ? "/dashboard?wedding=premium" : `/dashboard?wedding=${outcome.reason}`);
}
