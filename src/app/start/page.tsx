import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostAnything } from "@/components/PostAnything";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Welcome — what do you want to do first?",
  robots: { index: false },
};

const EXPLORE: { href: string; label: string; blurb: string }[] = [
  { href: "/tools", label: "🧰 52 free tools", blurb: "Marketing, design, video & SEO tools" },
  { href: "/games", label: "🎮 Games", blurb: "Quick desi games & brain breaks" },
  { href: "/astrology", label: "🔮 Astrology", blurb: "Daily rashi & panchang" },
  { href: "/markets", label: "📈 Markets", blurb: "Stocks & indices at a glance" },
  { href: "/crypto-fear-greed", label: "🪙 Crypto fear & greed", blurb: "Today’s market mood" },
  { href: "/news", label: "📰 Desi news", blurb: "Headlines from the community" },
  { href: "/events", label: "🎉 Events", blurb: "Melas, garbas & meetups near you" },
  { href: "/walloffame", label: "🧱 Wall of Fame", blurb: "10,000 desi bricks — find yours" },
];

/**
 * Where brand-new members land: every kind of post in one view, so an organiser
 * picks "Event" instead of a sell-listing, a freelancer picks "Gig", etc. Also
 * a mini-map of the whole site and the founding-brick explainer.
 */
export default async function StartPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signup?next=/start");

  const hasCard = Boolean(
    await db.business.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    }),
  );

  const brick = await db.wallBlock.findFirst({
    where: { advertiserId: user.id },
    select: { x: true, y: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-slate-600">
          Pick what you came to do — each option opens the right form, so your
          event lands on the events calendar, your item for sale in the
          marketplace, your service as a gig.
        </p>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3 bg-amber-50">
        <div className="text-sm text-slate-700">
          <p className="font-bold">🧱 Your founding brick is on the Wall of Fame</p>
          <p className="mt-0.5">
            Every member gets one free desi brick — hover it to see your
            profile, and it stays for life as a founding member.
            {brick ? (
              <>
                {" "}
                Yours is placed at row {brick.y / 10 + 1}, column{" "}
                {(1000 - brick.x) / 10} from the right.
              </>
            ) : null}{" "}
            100 points = 1 more brick — keep posting, referring and reviewing to
            buy bricks anywhere on the wall.
          </p>
        </div>
        <Link
          href="/walloffame"
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600"
        >
          See the wall →
        </Link>
      </Card>

      <PostAnything
        title="Everything you can post on GoDesi"
        hasCard={hasCard}
      />

      <Card>
        <p className="text-sm font-bold text-slate-700">
          A quick tour — everything else on GoDesi
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {EXPLORE.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-slate-200 p-3 transition hover:border-indigo-300 hover:bg-indigo-50"
            >
              <p className="text-sm font-bold text-slate-800">{item.label}</p>
              <p className="text-xs text-slate-500">{item.blurb}</p>
            </Link>
          ))}
        </div>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Or just look around — you can always come back here at{" "}
          <strong>godesi.com/start</strong>.
        </p>
        <Link
          href="/dashboard"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
        >
          Go to my dashboard →
        </Link>
      </Card>
    </div>
  );
}
