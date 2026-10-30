import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { CopyButton } from "@/components/CopyButton";
import { LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";

// Partner guides library — swap for the owner's affiliate URL when it arrives.
const PARTNER_GUIDES = "https://monetizehub.net/articles";

export const metadata: Metadata = {
  title: "Make money online — free tools, guides & AI prompts",
  description:
    "Free member toolkit: guides to earning online, ready-to-use AI prompts for automating your business, and ways to earn on GoDesi itself. Sign in free to unlock.",
};

const GUIDES = [
  {
    name: "Affiliate marketing for beginners",
    blurb: "How affiliate links, referrals and commissions work — with a first-content example you can copy.",
  },
  {
    name: "Compare affiliate programs before joining",
    blurb: "A checklist for picking offers: commission math, permitted promotion and payment terms.",
  },
  {
    name: "Write product reviews that help readers choose",
    blurb: "Honest-review structure: early verdict, real evidence, limitations and a comparison.",
  },
  {
    name: "Affiliate email marketing",
    blurb: "Recommendations subscribers actually want — one decision, one offer, clear disclosure.",
  },
  {
    name: "SEO for affiliate sites",
    blurb: "Pages that help readers choose and stay crawlable — includes a completed content brief.",
  },
  {
    name: "YouTube monetization beyond ads",
    blurb: "Affiliate links, sponsorships, memberships and services — pick what fits your viewers.",
  },
  {
    name: "TikTok Shop affiliate demo",
    blurb: "Plan a useful product demonstration — eligibility, seller terms and product fit.",
  },
  {
    name: "How to disclose affiliate links",
    blurb: "Blog, email and video examples that keep your recommendations clear and compliant.",
  },
];

const PROMPTS = [
  {
    name: "Find what to automate",
    text: "List 10 repetitive tasks in a small [type of business] that AI or simple tools can automate, ranked by hours saved per week. For each, name a free or cheap tool that does it.",
  },
  {
    name: "A month of short videos",
    text: "Write a 4-week content calendar of 15–30 second TikTok/Reels video ideas for a [type of business] in [city]. Each idea: the hook line, what's on screen, and the call to action.",
  },
  {
    name: "Honest affiliate review",
    text: "Outline an honest review of [product]: a one-line verdict, three things it genuinely does well, two real limitations, who should skip it, and a fair comparison with one alternative.",
  },
  {
    name: "Cold email that gets replies",
    text: "Draft a short, friendly cold email to [type of business] owners offering [your service]. No jargon, one clear benefit, one question that is easy to answer.",
  },
  {
    name: "Side income on a family budget",
    text: "Give me 5 realistic side-income ideas that fit around a family schedule, need under $100 to start, and can earn within 30 days. For each: the first three steps this week.",
  },
  {
    name: "Google Business posts",
    text: "Turn this description into 5 short Google Business Profile posts with a hook, one benefit and a call to action: [paste your description]",
  },
];

const EARN_HERE = [
  {
    href: "/rewards",
    icon: "🎁",
    name: "Refer & earn points",
    blurb: "Points for every signup, listing and upgrade — spend them on promotion, featured listings or ads.",
  },
  {
    href: "/ambassador",
    icon: "🤝",
    name: "Become a city ambassador",
    blurb: "Represent GoDesi in your city, onboard local businesses and earn while the community grows.",
  },
  {
    href: "/dashboard/gigs",
    icon: "🛠️",
    name: "Sell a gig for $5–$100",
    blurb: "Small services — design, writing, tech help — listed to thousands of desi buyers.",
  },
  {
    href: "/jobs/new",
    icon: "💼",
    name: "Post a job or mini-job",
    blurb: "Hire for telecalling, nanny, delivery and more — or find paid work yourself.",
  },
];

export default async function EarnPage() {
  const me = await getCurrentUser();
  const locked = !me;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 px-5 py-8 text-white sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
          Members' money toolkit
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Make money online 💸
        </h1>
        <p className="mt-3 max-w-2xl text-white/90">
          Most people want to earn online but don&apos;t know where to start.
          This free toolkit puts it in one place — plain-English guides,
          copy-paste AI prompts that do the heavy lifting, and ways to earn
          right here on GoDesi.
        </p>
        {locked ? (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <LinkButton href="/signup?next=/earn" variant="secondary">
              Join free — unlock the toolkit
            </LinkButton>
            <span className="text-sm text-white/80">
              Already a member?{" "}
              <Link href="/login?next=/earn" className="font-bold underline">
                Sign in
              </Link>
            </span>
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-black text-slate-900">
          📚 Step-by-step guides — learn how online earning works
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Plain-English guides on affiliate marketing, SEO, reviews and
          creator income from our partner library.
        </p>
        <ul className="mt-3 divide-y divide-slate-100">
          {GUIDES.map((guide) => (
            <li key={guide.name} className="flex items-start justify-between gap-3 py-2.5">
              <div className="min-w-0">
                {locked ? (
                  <span className="text-sm font-semibold text-slate-800">
                    🔒 {guide.name}
                  </span>
                ) : (
                  <a
                    href={PARTNER_GUIDES}
                    target="_blank"
                    rel="noreferrer sponsored nofollow"
                    className="text-sm font-semibold text-indigo-700 hover:underline"
                  >
                    {guide.name} ↗
                  </a>
                )}
                <p className="text-sm text-slate-600">{guide.blurb}</p>
              </div>
            </li>
          ))}
        </ul>
        {locked ? (
          <p className="mt-2 text-xs text-slate-500">
            Sign in free to open the guides.
          </p>
        ) : null}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-black text-slate-900">
          🤖 AI prompts that do the work
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Paste these into any AI chat (ChatGPT, Gemini, the ✨ Ask Godesi
          button). Fill in the [brackets] with your business.
        </p>
        <ul className="mt-3 space-y-3">
          {PROMPTS.map((prompt) => (
            <li
              key={prompt.name}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-800">
                  {locked ? "🔒 " : ""}
                  {prompt.name}
                </p>
                {!locked ? <CopyButton value={prompt.text} label="Copy prompt" /> : null}
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {locked ? "Sign in free to see and copy this prompt." : prompt.text}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-black text-slate-900">
          🇮🇳 Earn on GoDesi itself
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {EARN_HERE.map((item) => (
            <li key={item.href}>
              <Link
                href={locked ? "/signup?next=/earn" : item.href}
                className="block rounded-2xl border border-slate-100 bg-amber-50/60 p-3 hover:border-amber-300"
              >
                <p className="text-sm font-bold text-slate-800">
                  {item.icon} {item.name}
                </p>
                <p className="mt-1 text-sm text-slate-600">{item.blurb}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="px-1 text-xs text-slate-500">
        Some links are partner links — we may earn a commission at no cost to
        you. Guides are educational, not income promises: results depend on
        your effort and market.
      </p>
    </div>
  );
}
