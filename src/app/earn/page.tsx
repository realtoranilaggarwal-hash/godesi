import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { CopyButton } from "@/components/CopyButton";
import { LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Make money online — free tools, guides & AI prompts",
  description:
    "Free member toolkit: plain-English guides to earning online, ready-to-use AI prompts for automating your business, and ways to earn on GoDesi itself. Sign in free to unlock.",
};

const GUIDES = [
  {
    name: "Affiliate marketing for beginners",
    blurb: "How earning commissions by recommending products actually works.",
    steps: [
      "Pick one product you already use and genuinely like — trust is the whole game.",
      "Join the seller's affiliate program (most are free) and get your tracking link.",
      "Write or film one honest piece: what it does, who it's for, one limitation.",
      "Put your link where the reader naturally looks for it, with a clear “this is a partner link” note.",
      "Check what earned clicks after two weeks; make more of whatever worked.",
    ],
  },
  {
    name: "Choosing an affiliate program",
    blurb: "How to compare offers before you spend time promoting them.",
    steps: [
      "Match the product to your audience first — a great commission on a product nobody needs earns nothing.",
      "Check the commission math: percentage, cookie window, and what counts as a qualifying sale.",
      "Read the rules on where you may promote — some programs ban paid ads or coupon sites.",
      "Confirm how and when you get paid (threshold, method, holding period).",
      "Start with one or two programs; five half-promoted links earn less than two good ones.",
    ],
  },
  {
    name: "Reviews that make people buy",
    blurb: "A review structure readers trust — and act on.",
    steps: [
      "Open with your verdict in one line — readers decide in seconds whether to keep reading.",
      "Show real evidence: photos, your own use, numbers — not spec-sheet copy.",
      "Name one or two honest limitations; a review with no downside reads like an ad.",
      "Compare with one alternative so the reader can choose, not just agree.",
      "End with who should buy it and who should skip it — the skip list builds trust.",
    ],
  },
  {
    name: "Earning from short videos",
    blurb: "TikTok, Reels and Shorts as an income channel.",
    steps: [
      "Pick one niche you can talk about weekly — money tips, local deals, how-tos.",
      "Hook in the first 2 seconds: a question, a number, or a bold claim you then prove.",
      "Post consistently — 3–5 short videos a week beats one polished video a month.",
      "Point viewers to one place: your page, your link, your WhatsApp — not five destinations.",
      "Once you have viewers, add income: affiliate links, sponsored shoutouts, your own service or digital product.",
    ],
  },
  {
    name: "Email that sells without spamming",
    blurb: "Turn a small email list into repeat income.",
    steps: [
      "Collect emails with one clear promise — a weekly deal, a tip, a free checklist.",
      "Send one useful thing per email: a decision, a deal, or a how-to — not a newsletter of everything.",
      "Make one offer per email, tied to the useful content, and label partner links honestly.",
      "Keep the same send day and time so readers expect you.",
      "Watch which emails get replies and clicks; that tells you what your list wants to buy.",
    ],
  },
  {
    name: "Local services as online income",
    blurb: "The fastest honest dollar for most people — sell a service online.",
    steps: [
      "List what you already do well: tutoring, design, repairs, cooking, tax prep, translation.",
      "Package it as a fixed-price gig — “logo in 48 hours for $40” sells better than “design services”.",
      "Post it on GoDesi gigs and share the card on WhatsApp groups you already belong to.",
      "Deliver the first jobs fast and collect reviews — early ratings do your marketing.",
      "Raise the price after five reviews; add a second gig that upsells the first.",
    ],
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
          Members&apos; money toolkit
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
          📚 Step-by-step guides — how online earning actually works
        </h2>
        <ul className="mt-3 space-y-4">
          {GUIDES.map((guide) => (
            <li
              key={guide.name}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              <p className="text-sm font-bold text-slate-800">
                {locked ? "🔒 " : ""}
                {guide.name}
              </p>
              <p className="mt-0.5 text-sm text-slate-600">{guide.blurb}</p>
              {locked ? (
                <p className="mt-2 text-xs font-semibold text-indigo-700">
                  Sign in free to read the steps.
                </p>
              ) : (
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700">
                  {guide.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ul>
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
        Guides are educational, not income promises — results depend on your
        effort and market. If we ever add partner links, they&apos;ll be
        labelled.
      </p>
    </div>
  );
}
