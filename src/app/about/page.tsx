import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";
import { publicTeam } from "@/lib/team";

export const metadata: Metadata = {
  title: "About Godesi — our story and mission",
  description:
    "Godesi is a global desi marketplace: business listings, buyer requirements, events, real estate, wedding services, temples and community news.",
};

export default async function AboutPage() {
  const team = await publicTeam();
  const shareUrl = process.env.NEXT_PUBLIC_UMAMI_SHARE_URL;

  return (
    <LegalPage title="About Godesi">
      <p>
        Godesi is a global desi marketplace built for small businesses, professionals
        and the community around them. One place to be found, to find trusted desi
        services, and to keep up with what is happening in your city.
      </p>

      <h2>What you can do here</h2>
      <ul>
        <li>
          <strong>Get a free digital business card</strong> — profile page, gallery, QR
          code and a WhatsApp button you can share anywhere.
        </li>
        <li>
          <strong>Find work</strong> — buyers post requirements and vendors respond.
        </li>
        <li>
          <strong>Sell tickets</strong> — post community events and take payment online
          with QR tickets.
        </li>
        <li>
          <strong>Real estate and rooms</strong> — homes to buy or rent and roommate
          listings with WhatsApp contact.
        </li>
        <li>
          <strong>Wedding services</strong> — planners, photographers, makeup artists,
          caterers, DJs, decorators and venues with packages and reviews.
        </li>
        <li>
          <strong>Temples and culture</strong> — a directory of temples, gurudwaras,
          mosques and churches, a festival calendar and community events.
        </li>
        <li>
          <strong>Advertise</strong> — self-serve banners with live impression and click
          reporting.
        </li>
      </ul>

      <h2>Why businesses use Godesi</h2>
      <ul>
        <li>Free to list, and you can be live in a few minutes.</li>
        <li>Built for phones, where your customers actually are.</li>
        <li>Every enquiry goes straight to you on WhatsApp — we do not sit in between.</li>
        <li>Earn points for inviting others and spend them on ads and upgrades.</li>
      </ul>

      <h2>How our data works</h2>
      <p>
        Listings on Godesi are created by the businesses themselves or added as basic
        starter entries that the owner can claim and complete. We do not copy listings
        from other directories. Places of worship include a small openly licensed
        starter set from OpenStreetMap contributors, and anyone can submit corrections.
        Basic business starter entries also use openly licensed OpenStreetMap data
        (name, area, phone, website) under the ODbL until an owner claims them.
      </p>

      {shareUrl ? (
        <>
          <h2>Our traffic, in the open</h2>
          <p>
            We publish our visitor numbers:{" "}
            <a href={shareUrl} target="_blank" rel="noreferrer">
              live traffic dashboard
            </a>{" "}
            — visitors, countries and referrers, updated in real time. No personal data,
            no cross-site tracking.
          </p>
        </>
      ) : null}

      {team.length ? (
        <>
          <h2 id="team">Our team</h2>
          <p>
            The people who look after Godesi — they check every listing, answer
            your calls and put your business up. Say hello.
          </p>
          <div className="not-prose grid gap-3 sm:grid-cols-2">
            {team.map((member) => {
              const inside = (
                <>
                  {member.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                      {member.name.trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block font-semibold text-slate-900">
                      {member.name}
                    </span>
                    <span className="block text-xs font-semibold uppercase tracking-wide text-indigo-600">
                      {member.teamTitle ??
                        (member.role === "ADMIN" ? "Founder" : "Community team")}
                    </span>
                    {member.headline ? (
                      <span className="block text-xs text-slate-500">
                        {member.headline}
                      </span>
                    ) : null}
                    {member.location ? (
                      <span className="block text-xs text-slate-400">
                        {member.location}
                      </span>
                    ) : null}
                  </span>
                </>
              );
              const className =
                "flex items-center gap-3 rounded-2xl border border-slate-200 p-3";
              return member.username ? (
                <Link
                  key={member.id}
                  href={`/${member.username}`}
                  className={`${className} hover:border-indigo-300 hover:bg-indigo-50/40`}
                >
                  {inside}
                </Link>
              ) : (
                <div key={member.id} className={className}>
                  {inside}
                </div>
              );
            })}
          </div>
        </>
      ) : null}

      <h2>Talk to us</h2>
      <p>
        Questions, corrections or partnership ideas:{" "}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>. See the{" "}
        <Link href="/faq">FAQ</Link> for quick answers, or browse every section on the{" "}
        <Link href="/sitemap">sitemap</Link>.
      </p>
    </LegalPage>
  );
}
