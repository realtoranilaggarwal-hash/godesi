import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui";
import { ADMIN_SECTIONS } from "@/components/AdminNav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin" };

/** Overview only: each desk loads its own data on its own page. */
export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [
    businessCount,
    pendingListings,
    userCount,
    leadCount,
    pendingClaims,
    pendingAds,
    pendingUpi,
    pendingNews,
    pendingMeetups,
    pendingWorship,
    openRedemptions,
  ] = await Promise.all([
    db.business.count(),
    db.business.count({ where: { status: "PENDING" } }),
    db.user.count(),
    db.lead.count(),
    db.businessClaim.count({ where: { status: "PENDING" } }),
    db.banner.count({ where: { status: "PENDING" } }),
    db.upiRequest.count({ where: { status: "PENDING" } }),
    db.newsItem.count({ where: { status: "PENDING" } }),
    db.meetupProfile.count({ where: { status: "PENDING" } }),
    db.worshipPlace.count({ where: { status: "PENDING" } }),
    db.redemption.count({ where: { status: "REQUESTED" } }),
  ]);

  const waiting: { href: string; label: string; count: number }[] = [
    {
      href: "/admin/listings",
      label: "Listings to approve",
      count: pendingListings,
    },
    { href: "/admin/claims", label: "Business claims", count: pendingClaims },
    { href: "/admin/ads", label: "Ads to approve", count: pendingAds },
    { href: "/admin/upi", label: "UPI payments to check", count: pendingUpi },
    { href: "/admin/news", label: "Stories to review", count: pendingNews },
    {
      href: "/admin/connect",
      label: "Connect profiles",
      count: pendingMeetups,
    },
    {
      href: "/admin/temples",
      label: "Temples to review",
      count: pendingWorship,
    },
    {
      href: "/admin/rewards",
      label: "Rewards to fulfil",
      count: openRedemptions,
    },
  ].filter((item) => item.count > 0);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Admin panel</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Businesses", businessCount],
          ["Pending approval", pendingListings],
          ["Members", userCount],
          ["Requirements", leadCount],
        ].map(([label, value]) => (
          <Card key={label as string} className="text-center">
            <p className="text-2xl font-black text-indigo-600">{value}</p>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {label}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-bold">Waiting for you</h2>
        {waiting.length ? (
          <ul className="divide-y divide-slate-100 text-sm">
            {waiting.map((item) => (
              <li key={item.href} className="py-2">
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-2 font-semibold text-indigo-600 hover:underline"
                >
                  {item.label}
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                    {item.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">
            Nothing is waiting — all clear.
          </p>
        )}
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_SECTIONS.filter((section) => section.href !== "/admin").map(
          (section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-2xl border border-slate-200 bg-white p-4 font-bold text-slate-900 shadow-sm hover:-translate-y-0.5 hover:shadow-md"
            >
              <span aria-hidden className="mr-2">
                {section.icon}
              </span>
              {section.label} →
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
