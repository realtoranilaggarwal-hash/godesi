import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";
import { badgeStatus } from "@/lib/badge";
import { BadgeEmbed } from "@/components/BadgeEmbed";
import { SidebarBanners } from "@/components/Banners";
import { Card, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Verified on Godesi badge",
  description:
    "Add the “Verified on Godesi.com” badge to your website. Customers can click it to check your listing is real — free for every Godesi business.",
};

export default async function BadgePage() {
  const user = await getCurrentUser();
  const business = user
    ? await db.business.findFirst({
        where: { ownerId: user.id },
        select: { slug: true, name: true },
      })
    : null;

  const status = business ? await badgeStatus(business.slug) : null;
  const origin = siteUrl();

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-500 px-5 py-8 text-white sm:px-8">
          <h1 className="text-3xl font-black">Verified on Godesi 🏅</h1>
          <p className="mt-2 max-w-2xl text-white/90">
            A free badge for your own website, shop window or email signature.
            Clicking it opens a Godesi page that confirms your business is real
            — so it is a trust mark customers can check, not just a sticker.
          </p>
        </section>

        {business && status ? (
          <Card>
            <h2 className="font-bold">Your badge — {business.name}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {status.level === "VERIFIED"
                ? "Your card qualifies for the Verified badge. Paste it anywhere — it reads your live card, so it stays correct on its own."
                : "Your card is live, so the badge says “Listed on Godesi.com” for now. It upgrades itself to Verified once you claim the card or start a paid membership — no need to change the code on your website."}
            </p>
            <div className="mt-3">
              <BadgeEmbed
                slug={business.slug}
                name={business.name}
                level={status.level}
                origin={origin}
              />
            </div>
          </Card>
        ) : (
          <Card>
            <h2 className="font-bold">Grab the badge</h2>
            <p className="mt-1 text-sm text-slate-600">
              Every approved Godesi business gets one free, in three sizes,
              light or dark, SVG or PNG. Sign in and this page fills in your own
              snippet.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 rounded-2xl bg-slate-50 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${origin}/api/badge/your-business`}
                alt="Godesi badge example"
                width={200}
                height={64}
              />
              <p className="text-xs text-slate-500">
                Example. Yours carries your own verification link.
              </p>
            </div>
            <div className="mt-4">
              <LinkButton href="/signup">List your business free</LinkButton>
            </div>
          </Card>
        )}

        <Card>
          <h2 className="font-bold">What the badge says, and when</h2>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            <li>
              <b className="text-emerald-700">✅ Verified on Godesi.com</b> —
              the owner has claimed the card, or holds a paid membership. Free
              to display.
            </li>
            <li>
              <b className="text-indigo-700">Listed on Godesi.com</b> — the card
              is live but nobody has claimed it yet.
            </li>
            <li>
              <b>Neither</b> — if a card is removed or hidden, its badge stops
              claiming anything and the verification page says so. That is what
              makes the badge worth something to your customers.
            </li>
          </ul>
          <p className="mt-3 text-sm text-slate-600">
            The badge image is generated from your live card each time it loads,
            so you never have to update the code you pasted.
          </p>
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
