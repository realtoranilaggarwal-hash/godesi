import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCategoryTree } from "@/lib/directory";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sitemap",
  description: "Every section of Godesi in one page: categories, cities and pages.",
};

const SECTIONS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Browse",
    links: [
      { href: "/", label: "Home" },
      { href: "/search", label: "Businesses & professionals" },
      { href: "/categories", label: "All categories" },
      { href: "/leads", label: "Buyer requirements" },
      { href: "/events", label: "Events & tickets" },
      { href: "/real-estate", label: "Real estate" },
      { href: "/rooms", label: "Rooms & roommates" },
      { href: "/wedding", label: "Wedding services" },
      { href: "/religious", label: "Temples & places of worship" },
      { href: "/connect", label: "Connect — meet desis near you" },
      { href: "/resources", label: "Resources & important links" },
      { href: "/news", label: "News" },
      { href: "/desi-elite", label: "GoDesi Elite — recognised leaders" },
      { href: "/live-radio", label: "Live desi radio" },
      { href: "/live-tv", label: "Live desi TV" },
    ],
  },
  {
    title: "Post & sell",
    links: [
      { href: "/post", label: "Post anything" },
      { href: "/add-business", label: "Add your business" },
      { href: "/events/new", label: "Post an event" },
      { href: "/listings/new", label: "Post a property or room" },
      { href: "/leads/new", label: "Request a service" },
      { href: "/religious/new", label: "Submit a place of worship" },
      { href: "/connect/new", label: "Create a Connect profile" },
      { href: "/resources/new", label: "Advertise a link" },
      { href: "/advertise", label: "Advertise on Godesi" },
      { href: "/pricing", label: "Membership plans" },
    ],
  },
  {
    title: "Your account",
    links: [
      { href: "/signup", label: "Create an account" },
      { href: "/login", label: "Sign in" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/dashboard/profile", label: "Business card" },
      { href: "/dashboard/me", label: "Personal profile" },
      { href: "/dashboard/rewards", label: "Refer & earn" },
      { href: "/dashboard/ads", label: "My ads" },
      { href: "/dashboard/tickets", label: "My tickets" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/live", label: "Live visitor map" },
      { href: "/journalists", label: "Become a local journalist" },
      { href: "/buzz", label: "#godesi social wall" },
      { href: "/alumni", label: "Find your batchmates" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact us" },
      { href: "/terms", label: "Terms of service" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/cookies", label: "Cookie policy" },
      { href: "/refunds", label: "Refund policy" },
      { href: "/sitemap.xml", label: "XML sitemap" },
    ],
  },
];

export default async function SitemapPage() {
  const [categories, cities] = await Promise.all([
    getCategoryTree(),
    db.business.groupBy({
      by: ["city"],
      where: { status: "APPROVED" },
      _count: { city: true },
      orderBy: { _count: { city: "desc" } },
      take: 40,
    }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Sitemap 🧭</h1>
        <p className="text-sm text-slate-600">
          Every part of Godesi in one place. Search engines use the{" "}
          <Link href="/sitemap.xml" className="font-semibold text-indigo-600">
            XML sitemap
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SECTIONS.map((section) => (
          <Card key={section.title}>
            <p className="mb-2 font-bold">{section.title}</p>
            <ul className="space-y-1 text-sm text-slate-600">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-indigo-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card>
        <p className="mb-2 font-bold">Categories</p>
        <ul className="grid gap-x-4 gap-y-1 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/categories/${category.slug}`}
                className="font-semibold hover:text-indigo-600"
              >
                {category.icon} {category.name}
              </Link>
              {category.children.length ? (
                <span className="block text-xs text-slate-500">
                  {category.children.map((child) => child.name).join(" · ")}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>

      {cities.length ? (
        <Card>
          <p className="mb-2 font-bold">Cities with listings</p>
          <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
            {cities.map((row) => (
              <Link
                key={row.city}
                href={`/search?city=${encodeURIComponent(row.city)}`}
                className="rounded-full border border-slate-200 px-2.5 py-1 text-slate-700 hover:bg-slate-50"
              >
                {row.city} ({row._count.city})
              </Link>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
