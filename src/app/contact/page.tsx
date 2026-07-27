import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { SITE, socialLinks } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get in touch with the Godesi team about listings, ads or support.",
};

export default function ContactPage() {
  const socials = socialLinks();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Contact us</h1>
        <p className="mt-1 text-slate-600">
          We usually reply within one business day.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold">Support</h2>
          <p className="mt-1 text-sm text-slate-600">
            Listings, tickets, accounts and billing.
          </p>
          <a
            href={`mailto:${SITE.supportEmail}`}
            className="mt-2 inline-block font-semibold text-indigo-600"
          >
            {SITE.supportEmail}
          </a>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Advertising & partnerships</h2>
          <p className="mt-1 text-sm text-slate-600">
            Banner bookings, sponsorships and bulk listings.
          </p>
          <a
            href={`mailto:${SITE.salesEmail}`}
            className="mt-2 inline-block font-semibold text-indigo-600"
          >
            {SITE.salesEmail}
          </a>
          <p className="mt-2 text-sm">
            <Link href="/advertise" className="text-indigo-600 underline">
              See advertising rates →
            </Link>
          </p>
        </Card>
      </div>

      {socials.length ? (
        <Card>
          <h2 className="text-lg font-bold">Follow Godesi</h2>
          <div className="mt-2 flex flex-wrap gap-3 text-sm font-semibold text-indigo-600">
            {socials.map((social) => (
              <a key={social.key} href={social.url} target="_blank" rel="noreferrer">
                {social.icon} {social.label}
              </a>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
