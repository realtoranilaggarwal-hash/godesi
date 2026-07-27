import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCategoryTree } from "@/lib/directory";
import { EventForm } from "@/components/forms/EventForm";
import { Card } from "@/components/ui";
import { requestCurrency } from "@/lib/currency";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Post an event" };

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: { category?: string; subcategory?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/events/new");
  const categories = await getCategoryTree();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Post your event 🎟️</h1>
        <p className="text-sm text-slate-600">
          Free to list. Attendees book seats online and get a QR ticket you can scan at the
          gate. Paid tickets are collected securely by Stripe.
        </p>
      </div>
      <Card>
        <EventForm
          categories={categories}
          defaultCurrency={requestCurrency()}
          defaultCategory={searchParams.category}
          defaultSubcategory={searchParams.subcategory}
        />
      </Card>
    </div>
  );
}
