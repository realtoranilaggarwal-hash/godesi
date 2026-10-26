import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { TOOL_CATEGORIES } from "@/lib/tools";
import { siteUrl } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const TITLE = "50+ free tools for creators & marketers — SEO, design, video, email";
const DESCRIPTION =
  "Curated free and freemium tools for content creators, small businesses and marketers: SEO research, writing, design, video, scheduling, analytics, email and automation. Free for GoDesi members.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${siteUrl()}/tools` },
  openGraph: { title: TITLE, description: DESCRIPTION },
};

const itemList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Free tools for content creators and marketers",
  itemListElement: TOOL_CATEGORIES.flatMap((cat, ci) =>
    cat.tools.map((tool, ti) => ({
      "@type": "ListItem",
      position: ci * 10 + ti + 1,
      name: tool.name,
      url: tool.url,
    })),
  ),
};

function Hero({ total }: { total: number }) {
  return (
    <Card className="bg-gradient-to-br from-teal-600 to-cyan-700 text-white">
      <h1 className="text-3xl font-black">🧰 {total} free tools for creators &amp; marketers</h1>
      <p className="mt-2 max-w-2xl text-sm text-white/90">
        The toolkit desi creators and small businesses actually use — SEO,
        writing, design, video, scheduling, analytics, email and automation.
        Everything here has a genuinely useful free tier.
      </p>
      <p className="mt-2 text-xs text-white/70">
        A few links marked “Partner” are GoDesi deals that support the site at
        no extra cost to you.
      </p>
    </Card>
  );
}

function CoursesCard() {
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black">
            📚 GoDesi Courses — $9 guides that pair with these tools
          </h2>
          <p className="mt-1 text-sm text-white/80">
            SEO, affiliate marketing, Instagram, YouTube, email lists — short
            courses that teach you to actually use this toolkit.
          </p>
        </div>
        <Link
          href="/course"
          className="shrink-0 rounded-full bg-amber-400 px-5 py-2 text-sm font-black text-slate-900 transition hover:bg-amber-300"
        >
          Browse courses →
        </Link>
      </div>
    </Card>
  );
}

function GuestTeaser({ total }: { total: number }) {
  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-black">What&apos;s inside</h2>
      <ul className="grid gap-2 sm:grid-cols-3">
        {TOOL_CATEGORIES.map((cat) => (
          <li
            key={cat.name}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700"
          >
            {cat.icon} {cat.name}
            <span className="ml-1 text-xs font-semibold text-slate-400">
              {cat.tools.length} tools
            </span>
          </li>
        ))}
      </ul>
      <div className="rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50 p-5 text-center">
        <p className="text-lg font-black text-teal-900">
          🔒 All {total} tools unlock free for GoDesi members
        </p>
        <p className="mx-auto mt-1 max-w-md text-sm text-teal-800">
          Join free in under a minute — you also get a digital business card,
          deals, events and reward points.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/signup?next=/tools"
            className="rounded-full bg-teal-600 px-6 py-2.5 text-sm font-black text-white transition hover:bg-teal-500"
          >
            Join free — unlock the tools →
          </Link>
          <Link
            href="/login?next=/tools"
            className="rounded-full border border-teal-600 px-6 py-2.5 text-sm font-bold text-teal-700 transition hover:bg-teal-100"
          >
            Sign in
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default async function ToolsPage() {
  const user = await getCurrentUser();
  const total = TOOL_CATEGORIES.reduce((n, c) => n + c.tools.length, 0);

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
        />
        <Hero total={total} />
        <GuestTeaser total={total} />
        <CoursesCard />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <Hero total={total} />

      {TOOL_CATEGORIES.map((cat) => (
        <Card key={cat.name} className="space-y-3">
          <h2 className="text-lg font-black">
            {cat.icon} {cat.name}
            <span className="ml-2 text-xs font-semibold text-slate-400">
              {cat.tools.length}
            </span>
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {cat.tools.map((tool) => (
              <li key={tool.name}>
                <a
                  href={tool.url}
                  target="_blank"
                  rel={
                    tool.partner
                      ? "noopener sponsored"
                      : "noopener noreferrer"
                  }
                  className="block rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition hover:border-teal-300 hover:shadow"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-bold text-slate-900">
                      {tool.name}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      {tool.partner ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">
                          🤝 Partner
                        </span>
                      ) : null}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                          tool.pricing === "Free"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-sky-100 text-sky-800"
                        }`}
                      >
                        {tool.pricing}
                      </span>
                    </span>
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-slate-600">
                    {tool.blurb}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <CoursesCard />

      <Card className="text-sm text-slate-600">
        <p>
          Building something online? Put your business on a free GoDesi card and
          get found:{" "}
          <Link
            href="/add-business"
            className="font-bold text-indigo-600 hover:underline"
          >
            Create your free listing →
          </Link>
        </p>
      </Card>
    </div>
  );
}
