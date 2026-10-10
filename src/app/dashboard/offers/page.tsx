import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui";
import { OfferInterestsForm } from "@/components/forms/OfferInterestsForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My offers" };

export default async function DashboardOffersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/offers");

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/dashboard" className="text-sm font-semibold text-indigo-600">
        ← Dashboard
      </Link>
      <Card className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">
            🎁 What would you like offers on?
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Tick anything you&apos;re interested in and we&apos;ll connect you
            with trusted desi professionals and the best deals for it. Change
            your picks any time.
          </p>
        </div>
        <OfferInterestsForm
          selected={user.offerInterests}
          phone={user.offerPhone ?? ""}
        />
      </Card>
    </div>
  );
}
