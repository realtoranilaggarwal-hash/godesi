import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCategoryTree } from "@/lib/directory";
import { EventForm } from "@/components/forms/EventForm";
import { Card } from "@/components/ui";
import { FeaturedEventRail } from "@/components/FeaturedEvents";
import { requestCountry, requestCurrency } from "@/lib/currency";
import { venueSuggestions } from "@/lib/venues";
import { organiserPaysFee, platformFeePercent } from "@/lib/connect";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Post a desi event — free listing and ticketing",
  description:
    "List your garba, concert, puja, workshop or community event free on Godesi, sell tickets, add coupons and feature it to reach more people in your city.",
  alternates: { canonical: "/events/new" },
};

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: { category?: string; subcategory?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/events/new");
  const [categories, venues] = await Promise.all([
    getCategoryTree(),
    venueSuggestions(),
  ]);

  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-2xl flex-1 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Post your event 🎟️</h1>
          <p className="text-sm text-slate-600">
            Free to list. Attendees book seats online and get a QR ticket you
            can scan at the gate. Paid tickets are collected securely by Stripe.
          </p>
        </div>
        <Card>
          <EventForm
            categories={categories}
            defaultCurrency={requestCurrency()}
            defaultCategory={searchParams.category}
            defaultSubcategory={searchParams.subcategory}
            defaultCountry={requestCountry()}
            venues={venues}
            feePercent={platformFeePercent()}
            feeWaived={!organiserPaysFee(user)}
          />
        </Card>
      </div>

      <FeaturedEventRail />
    </div>
  );
}
