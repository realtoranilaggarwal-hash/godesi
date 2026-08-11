import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";
import { BadgeEmbed } from "@/components/BadgeEmbed";
import { SidebarBanners } from "@/components/Banners";
import { Card, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Listed on Godesi badge",
  description:
    "Add the free “Listed on Godesi” badge to your website and send customers straight to your listing.",
};

export default async function BadgePage() {
  const user = await getCurrentUser();
  const business = user
    ? await db.business.findFirst({
        where: { ownerId: user.id },
        select: { slug: true, name: true },
      })
    : null;

  const listingUrl = business
    ? `${siteUrl()}/b/${business.slug}`
    : `${siteUrl()}/b/your-business`;

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-500 px-5 py-8 text-white sm:px-8">
          <h1 className="text-3xl font-black">Listed on Godesi 🏅</h1>
          <p className="mt-2 max-w-2xl text-white/90">
            A free badge for your own website, shop window or email signature.
            Visitors who click it land on your Godesi page — reviews, photos,
            WhatsApp and all.
          </p>
        </section>

        <Card>
          <h2 className="font-bold">
            {business ? `Your badge — ${business.name}` : "Grab the badge"}
          </h2>
          {!business ? (
            <p className="mt-1 text-sm text-slate-600">
              The snippet below points at{" "}
              <code className="rounded bg-slate-100 px-1">/b/your-business</code>{" "}
              — claim or create your free listing and it fills in automatically.
            </p>
          ) : null}
          <div className="mt-3">
            <BadgeEmbed listingUrl={listingUrl} />
          </div>
          {!business ? (
            <div className="mt-4">
              <LinkButton href="/signup">List your business free</LinkButton>
            </div>
          ) : null}
        </Card>

        <Card>
          <h2 className="font-bold">Where to put it</h2>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            <li>• Footer or “Contact us” page of your website.</li>
            <li>• Your Google Business Profile description (as a plain link).</li>
            <li>• Instagram bio, WhatsApp Business catalogue, email signature.</li>
            <li>• Flyers and shop window — print the QR from your listing page.</li>
          </ul>
          <p className="mt-3 text-sm text-slate-600">
            Questions?{" "}
            <Link href="/contact" className="font-semibold text-indigo-600">
              Talk to us
            </Link>
            .
          </p>
        </Card>
      </div>

      <SidebarBanners />
    </div>
  );
}
