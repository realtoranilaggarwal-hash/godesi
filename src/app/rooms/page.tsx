import type { Metadata } from "next";
import { ListingSectionPage } from "@/components/ListingSection";
import type { ListingFilters } from "@/lib/listings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Rooms & roommates",
  description:
    "Need a room or have one to share? Desi flatmates, PGs and shared flats with budget, gender and furnishing filters, plus WhatsApp contact.",
};

export default function RoomsPage({ searchParams }: { searchParams: ListingFilters }) {
  return (
    <ListingSectionPage
      section="rooms"
      filters={searchParams}
      title="Rooms & roommates 🛋️"
      blurb="Looking for a room, or have one going spare? Find desi flatmates with the food, budget and locality that suit you."
      color="teal"
      postHref="/listings/new?kind=ROOM_OFFERED"
      postLabel="Post a room"
    />
  );
}
