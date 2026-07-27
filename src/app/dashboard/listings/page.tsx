import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { KIND_LABELS, priceLabel } from "@/lib/listings";
import { Badge, Card, EmptyState, LinkButton } from "@/components/ui";
import { deleteListingAction } from "@/app/actions/listings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My listings" };

export default async function MyListingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/listings");

  const listings = await db.listing.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My listings</h1>
          <p className="text-sm text-slate-600">
            Property, rooms and marketplace posts you have published.
          </p>
        </div>
        <LinkButton href="/listings/new">Post a listing</LinkButton>
      </div>

      {listings.length ? (
        <Card className="space-y-2">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3"
            >
              {listing.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.images[0].url}
                  alt=""
                  className="h-14 w-20 rounded-lg object-cover"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <Link
                  href={`/listings/${listing.slug}`}
                  className="font-semibold hover:text-indigo-600"
                >
                  {listing.title}
                </Link>
                <p className="text-xs text-slate-500">
                  {KIND_LABELS[listing.kind]} · {listing.city} · {priceLabel(listing)}
                </p>
              </div>
              <Badge tone={listing.status === "APPROVED" ? "green" : "amber"}>
                {listing.status.toLowerCase()}
              </Badge>
              <form action={deleteListingAction}>
                <input type="hidden" name="id" value={listing.id} />
                <button
                  type="submit"
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Delete
                </button>
              </form>
            </div>
          ))}
        </Card>
      ) : (
        <EmptyState
          title="No listings yet"
          body="Post a flat, a room to share or something to sell — it is free and reaches the whole community."
        />
      )}
    </div>
  );
}
