import type { Metadata } from "next";
import Link from "next/link";
import { LiveVisitorMap } from "@/components/LiveVisitorMap";
import { GlobalChat } from "@/components/GlobalChat";
import { SponsoredCard } from "@/components/SponsoredCard";
import { ActivityWall } from "@/components/ActivityWall";
import { getCurrentUser } from "@/lib/auth";
import { recentChat } from "@/lib/chat";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live visitors | Godesi",
  description:
    "See where people are browsing Godesi right now — anonymous, city-level only.",
};

export default async function LivePage() {
  const user = await getCurrentUser();
  const messages = await recentChat(user?.id ?? null);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 xl:flex-row">
      {/* Advertising sits in one rail only; the chat gets the other side. */}
      <div className="order-2 space-y-4 xl:order-1 xl:w-[300px] xl:shrink-0">
        <SponsoredCard />
      </div>

      <div className="order-1 min-w-0 flex-1 space-y-4 xl:order-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Live visitors on Godesi
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Every dot is someone browsing right now. We show the city only —
            never names, IP addresses or accounts.
          </p>
        </div>

        <LiveVisitorMap />

        <p className="text-sm text-slate-600">
          Want your business in front of them?{" "}
          <Link
            href="/signup"
            className="font-semibold text-indigo-600 underline"
          >
            List free
          </Link>{" "}
          or{" "}
          <Link
            href="/advertise"
            className="font-semibold text-indigo-600 underline"
          >
            advertise on Godesi
          </Link>
          .
        </p>
      </div>

      <div className="order-3 space-y-4 xl:w-[360px] xl:shrink-0">
        <GlobalChat initial={messages} signedIn={user !== null} />
        <ActivityWall limit={10} />
      </div>
    </div>
  );
}
