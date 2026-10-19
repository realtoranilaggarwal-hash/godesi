import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { KIND_LABELS, priceLabel } from "@/lib/listings";
import { Badge, Card, EmptyState, LinkButton } from "@/components/ui";
import { deleteListingAction } from "@/app/actions/listings";
import { PostAnything } from "@/components/PostAnything";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My listings" };

export default async function MyListingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/listings");

  const [listings, card] = await Promise.all([
    db.listing.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
    }),
    db.business.findUnique({
      where: { ownerId: user.id },
      select: {
        slug: true,
        name: true,
        category: true,
        profileType: true,
        logoUrl: true,
      },
    }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My listings</h1>
          <p className="text-sm text-slate-600">
            Your profiles and everything you have posted.
          </p>
        </div>
        <LinkButton href="/listings/new">Post a listing</LinkButton>
      </div>
      <Card className="space-y-2">
        <h2 className="text-lg font-bold">My profiles</h2>
        {card ? (
          <ProfileRow
            icon={card.profileType === "PROFESSIONAL" ? "🎓" : "🏪"}
            title={card.name}
            sub={`${card.profileType === "PROFESSIONAL" ? "Professional profile" : "Business card"} · ${card.category}`}
            view={`/b/${card.slug}`}
            edit="/dashboard/profile"
          />
        ) : (
          <ProfileRow
            icon="🏪"
            title="Business card or professional profile"
            sub="Not made yet — free, takes 2 minutes"
            edit="/post?type=business"
            editLabel="Create"
          />
        )}
        <ProfileRow
          icon="🙋"
          title="Personal profile"
          sub={user.username ? `godesi.com/${user.username}` : "Pick your name"}
          view={user.username ? `/${user.username}` : undefined}
          edit="/dashboard/me"
        />
      </Card>

      <PostAnything
        title="What would you like to list?"
        hasCard={Boolean(card)}
      />

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
              <Link
                href={`/listings/${listing.slug}/edit`}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Edit
              </Link>
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

function ProfileRow({
  icon,
  title,
  sub,
  view,
  edit,
  editLabel = "Edit",
}: {
  icon: string;
  title: string;
  sub: string;
  view?: string;
  edit: string;
  editLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3">
      <span aria-hidden className="text-2xl">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-slate-500">{sub}</p>
      </div>
      {view ? (
        <Link
          href={view}
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          View
        </Link>
      ) : null}
      <Link
        href={edit}
        className="text-xs font-semibold text-indigo-600 hover:underline"
      >
        {editLabel}
      </Link>
    </div>
  );
}
