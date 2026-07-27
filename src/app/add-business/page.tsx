import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Public entry point for "Add your business" — sends new users through signup. */
export default async function AddBusinessPage() {
  const user = await getCurrentUser();
  redirect(user ? "/dashboard/profile" : "/signup?next=/dashboard/profile");
}
