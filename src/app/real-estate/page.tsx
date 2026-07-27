import type { Metadata } from "next";
import { ListingSectionPage } from "@/components/ListingSection";
import type { ListingFilters } from "@/lib/listings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Real estate — buy, sell and rent",
  description:
    "Desi property listings: flats and plots for sale, homes for rent and trusted agents. Filter by city, budget and furnishing, then contact owners on WhatsApp.",
};

export default function RealEstatePage({
  searchParams,
}: {
  searchParams: ListingFilters;
}) {
  return (
    <ListingSectionPage
      section="real-estate"
      filters={searchParams}
      title="Real estate & homes 🏢"
      blurb="Buy, sell or rent — flats, plots, shops and villas listed by owners and agents in our community."
      color="orange"
      postHref="/listings/new?kind=PROPERTY_SALE"
      postLabel="Post a property"
    />
  );
}
