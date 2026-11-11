import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { requestCountry } from "@/lib/currency";
import { Card } from "@/components/ui";
import { VenueForm } from "@/components/forms/VenueForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Add your venue — free venue page | Godesi",
  description:
    "Banquet hall, temple or community centre owner? Add your venue free on Godesi so guests find every desi event held there.",
  alternates: { canonical: "/venues/new" },
};

export default async function NewVenuePage({
  searchParams,
}: {
  searchParams: { name?: string; city?: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    const query = new URLSearchParams(
      Object.entries(searchParams).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    ).toString();
    redirect(
      `/login?next=${encodeURIComponent(`/venues/new${query ? `?${query}` : ""}`)}`,
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <Link
          href="/venues"
          className="text-xs font-semibold text-violet-700 hover:underline"
        >
          ← All venues
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Add your venue 🏛️</h1>
        <p className="text-sm text-slate-600">
          Free. Your venue gets its own page listing every event booked there,
          with your address, website and map. Already on Godesi? Enter the same
          name and city — we fill in anything missing and take you to its page.
        </p>
      </div>
      <Card>
        <VenueForm
          defaultName={searchParams.name}
          defaultCity={searchParams.city}
          defaultCountry={requestCountry()}
        />
      </Card>
    </div>
  );
}
