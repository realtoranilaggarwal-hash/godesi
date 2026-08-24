import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { AdminBannersCard } from "@/components/AdminBannersCard";
import { deskFallback } from "@/lib/adminSections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Banners" };

/** The full admin panel loads two dozen tables; adding a banner should not. */
export default async function AdminBannersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/banners");
  if (user.role !== "ADMIN")
    redirect(deskFallback(user, "Banners"));

  const banners = await db.banner.findMany({
    orderBy: [{ slot: "asc" }, { position: "asc" }],
    include: { advertiser: { select: { email: true, name: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Banner desk</h1>
        <Link
          href="/admin"
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          ← Admin panel
        </Link>
      </div>
      <AdminBannersCard banners={banners} />
    </div>
  );
}
