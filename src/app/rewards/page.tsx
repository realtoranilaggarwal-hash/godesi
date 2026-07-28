import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { siteUrl } from "@/lib/format";
import { pointValues, REWARDS } from "@/lib/rewards";
import { FOUNDING_LIMIT } from "@/lib/founding";
import { Badge, Card } from "@/components/ui";
import { ShareButtons } from "@/components/ShareButtons";
import { SidebarBanners } from "@/components/Banners";
import { FoundingOffer } from "@/components/FoundingOffer";
import { FoundingBadge } from "@/components/FoundingBadge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Refer & earn — get rewarded for promoting Godesi",
  description:
    "Share Godesi, complete your profile and post listings to collect points, then spend them on featured placement, banner ads or a free month of Pro.",
  alternates: { canonical: `${siteUrl()}/rewards` },
};

const STEPS = [
  {
    icon: "🔗",
    title: "Share your link",
    body: "Every member gets a personal link — godesi.com/ref/yourname. Send it on WhatsApp, put it in your status or print it on your card.",
  },
  {
    icon: "⭐",
    title: "Collect points",
    body: "You earn the moment someone joins with your link, and again when they finish their profile, post a listing or upgrade. Your own activity earns too.",
  },
  {
    icon: "🎁",
    title: "Spend them",
    body: "Turn points into featured placement, a sidebar banner, homepage event promotion or a free month of Pro — no cash needed.",
  },
];

const QUESTIONS = [
  {
    q: "Is it cash?",
    a: "No. Points are Godesi credit — you spend them on promotion instead of paying for it. That keeps the rewards free for everyone and there is nothing to withdraw or declare.",
  },
  {
    q: "When do the points land?",
    a: "Straight away for your own actions. Referral points appear when your invitee completes the step (signs up, finishes their profile, posts, upgrades) and are held for review if the signup looks automated.",
  },
  {
    q: "Do points expire?",
    a: "No. Your balance stays until you spend it.",
  },
  {
    q: "Can I invite the same person twice?",
    a: "Each person counts once. Duplicate or fake accounts are removed along with the points they generated.",
  },
  {
    q: "Who can join?",
    a: "Anyone with a Godesi account — businesses, professionals and personal members. Listing is free.",
  },
];

export default async function RewardsExplainerPage() {
  const [user, points] = await Promise.all([getCurrentUser(), pointValues()]);
  const link = user?.username ? `${siteUrl()}/ref/${user.username}` : null;

  const earningRows: [string, number][] = [
    ["A friend signs up with your link", points.REFERRAL_SIGNUP],
    ["Your referral completes their profile", points.REFERRAL_PROFILE],
    ["Your referral posts a listing or event", points.REFERRAL_LISTING],
    ["Your referral upgrades to a paid plan", points.REFERRAL_UPGRADE],
    ["You complete your own business profile", points.PROFILE_CREATED],
    ["You post a listing or an event", points.LISTING_POSTED],
    ["You upgrade to a paid plan", points.PAID_UPGRADE],
  ];

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <Card className="bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 text-white">
          <p className="text-xs font-bold uppercase tracking-wide opacity-90">
            Refer & earn
          </p>
          <h1 className="mt-1 text-3xl font-black">
            Promote Godesi — get rewarded 🎁
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/90">
            Invite desi businesses, share your own profile and post listings.
            Every action earns points, and points buy the promotion other people
            pay for.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
            <Link
              href={user ? "/dashboard/rewards" : "/signup"}
              className="rounded-xl bg-white px-4 py-2 text-rose-600"
            >
              {user ? "Open my rewards" : "Join free & get my link"}
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl border border-white/70 px-4 py-2"
            >
              See what points replace
            </Link>
          </div>
        </Card>

        {user?.foundingNumber != null ? (
          <Card className="border-amber-200 bg-amber-50">
            <div className="flex flex-wrap items-center gap-2">
              <FoundingBadge number={user.foundingNumber} />
              <p className="text-sm font-semibold text-slate-800">
                You are one of the first {FOUNDING_LIMIT} members — every reward
                below pays you double.
              </p>
            </div>
          </Card>
        ) : (
          <FoundingOffer showCta={!user} />
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step) => (
            <Card key={step.title}>
              <p className="text-2xl" aria-hidden>
                {step.icon}
              </p>
              <h2 className="mt-1 font-bold">{step.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{step.body}</p>
            </Card>
          ))}
        </div>

        {link ? (
          <Card className="space-y-3 bg-gradient-to-r from-orange-50 via-rose-50 to-fuchsia-50">
            <p className="text-sm font-semibold text-slate-700">
              Your referral link
            </p>
            <p className="break-all rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-700">
              {link}
            </p>
            <ShareButtons url={link} title="Join me on Godesi" />
          </Card>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="mb-2 font-bold">What you earn</h2>
            <ul className="space-y-2 text-sm">
              {earningRows.map(([label, value]) => (
                <li
                  key={label}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-slate-700">{label}</span>
                  <Badge tone="green">+{value}</Badge>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="mb-2 font-bold">What points buy</h2>
            <ul className="space-y-2 text-sm">
              {REWARDS.map((reward) => (
                <li
                  key={reward.key}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-slate-700">{reward.label}</span>
                  <Badge tone="indigo">{reward.points} pts</Badge>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Redeem from your dashboard. Featured listings and Pro months apply
              instantly; banners and homepage promotion are scheduled by our team
              within a working day.
            </p>
          </Card>
        </div>

        <Card>
          <h2 className="mb-2 font-bold">Questions</h2>
          <dl className="divide-y divide-slate-100 text-sm">
            {QUESTIONS.map((item) => (
              <div key={item.q} className="py-2">
                <dt className="font-semibold text-slate-800">{item.q}</dt>
                <dd className="text-slate-600">{item.a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-slate-500">
            Godesi may adjust point values or reverse points earned through fake
            accounts, spam or misleading promotion. See our{" "}
            <Link href="/terms" className="underline">
              terms
            </Link>
            .
          </p>
        </Card>
      </div>

      <SidebarBanners />
    </div>
  );
}
