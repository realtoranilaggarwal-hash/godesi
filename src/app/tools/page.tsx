import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { TOOL_CATEGORIES } from "@/lib/tools";
import { siteUrl } from "@/lib/format";

export const revalidate = 86400;

const TITLE = "50+ free tools for creators & marketers — SEO, design, video, email";
const DESCRIPTION =
  "Curated free and freemium tools for content creators, small businesses and marketers: SEO research, writing, design, video, scheduling, analytics, email and automation.";

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

export default function ToolsPage() {
  const total = TOOL_CATEGORIES.reduce((n, c) => n + c.tools.length, 0);
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />

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
