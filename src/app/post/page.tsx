import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, LinkButton } from "@/components/ui";
import { PostAnything } from "@/components/PostAnything";
import { PostingSidebar } from "@/components/PostingSidebar";
import { DealsAndShopStrip } from "@/components/DealsAndShopStrip";

export const dynamic = "force-dynamic";

/** Old ?type= deep links go straight to the right form — no category step. */
const TYPE_FORMS: Record<string, string> = {
  business: "/dashboard/profile",
  professional: "/dashboard/profile?type=professional",
  event: "/events/new",
  property: "/listings/new",
  marketplace: "/listings/new?kind=MARKETPLACE",
  requirement: "/leads/new",
  report: "/news/report",
  worship: "/religious/new",
  connect: "/connect/new",
};

export default async function PostPage({
  searchParams,
}: {
  searchParams: { type?: string; category?: string };
}) {
  const form = searchParams.type ? TYPE_FORMS[searchParams.type] : null;
  if (form) redirect(form);

  const user = await getCurrentUser();
  const card = user
    ? await db.business.findUnique({
        where: { ownerId: user.id },
        select: { slug: true, name: true, category: true, profileType: true },
      })
    : null;

  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-4xl flex-1 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Post on GoDesi ✨</h1>
          <p className="text-sm text-slate-600">
            Free to post. Tap what you want and the right form opens — your
            event lands on the events calendar, your item in the marketplace,
            your service as a gig.
          </p>
        </div>

        {card ? (
          <Card className="space-y-3 border-emerald-200 bg-emerald-50">
            <h2 className="text-lg font-bold text-emerald-900">
              ✅ Your{" "}
              {card.profileType === "PROFESSIONAL"
                ? "professional profile"
                : "business card"}{" "}
              is already made
            </h2>
            <p className="text-sm text-emerald-900/80">
              <b>{card.name}</b> · {card.category}. Each account has one card;
              you can change its category, photos and text any time.
            </p>
            <div className="flex flex-wrap gap-2">
              <LinkButton href="/dashboard/profile">Edit my card</LinkButton>
              <LinkButton href={`/business/${card.slug}`} variant="secondary">
                View it
              </LinkButton>
            </div>
          </Card>
        ) : null}

        <PostAnything
          title="What would you like to list?"
          hasCard={Boolean(card)}
          goals={user?.joinGoals ?? []}
        />

        <p className="text-sm text-slate-500">
          Know what you want?{" "}
          <Link
            href="/dashboard/profile"
            className="font-semibold text-indigo-600 hover:underline"
          >
            Go straight to my business card form
          </Link>{" "}
          ·{" "}
          <Link
            href="/listings/new"
            className="font-semibold text-indigo-600 hover:underline"
          >
            new listing
          </Link>{" "}
          ·{" "}
          <Link
            href="/events/new"
            className="font-semibold text-indigo-600 hover:underline"
          >
            new event
          </Link>
        </p>

        <DealsAndShopStrip />
      </div>

      <PostingSidebar />
    </div>
  );
}
