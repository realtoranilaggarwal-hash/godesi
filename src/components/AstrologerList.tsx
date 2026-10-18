import Link from "next/link";
import type { BusinessListItem } from "@/lib/businesses";
import { BusinessCard } from "@/components/BusinessCard";
import { Card } from "@/components/ui";

export function AstrologerList({
  astrologers,
}: {
  astrologers: BusinessListItem[];
}) {
  return (
    <Card id="astrologers">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold">
          🔮 Astrologers & pandits on GoDesi
        </h2>
        <Link
          href="/categories/religious-services-astrologers"
          className="text-sm font-bold text-violet-700 hover:underline"
        >
          See all →
        </Link>
      </div>
      {astrologers.length ? (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {astrologers.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              variant="compact"
            />
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-600">
          No astrologers listed yet.
        </p>
      )}
      <p className="mt-3 text-sm text-slate-600">
        Are you an astrologer or pandit?{" "}
        <Link
          href="/add-business"
          className="font-bold text-violet-700 hover:underline"
        >
          List your practice free
        </Link>{" "}
        or claim your card if it&apos;s already here.
      </p>
    </Card>
  );
}
