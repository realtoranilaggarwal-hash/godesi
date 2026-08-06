import type { Metadata } from "next";
import { ListingSectionPage } from "@/components/ListingSection";
import type { ListingFilters } from "@/lib/listings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Buy & sell — desi marketplace",
  description:
    "Buy and sell within the desi community: jewellery, sarees and ethnic wear, furniture, electronics, homemade food, kids' things and more. Free to post, WhatsApp the seller directly.",
  alternates: { canonical: "/marketplace" },
};

export default function MarketplacePage({
  searchParams,
}: {
  searchParams: ListingFilters;
}) {
  return (
    <ListingSectionPage
      section="marketplace"
      filters={searchParams}
      title="Buy & sell 🛍️"
      blurb="Jewellery, ethnic wear, furniture, electronics, homemade food and more — sold by desi families near you. Free to post, message the seller on WhatsApp."
      color="rose"
      postHref="/listings/new?kind=MARKETPLACE"
      postLabel="Sell something"
    />
  );
}
