import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { ContactForm } from "@/components/forms/ContactForm";
import { SidebarBanners } from "@/components/Banners";
import { socialLinks } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Contact the Godesi team for support",
  description:
    "Get in touch with the Godesi team about your listing, membership, event tickets, advertising or anything that is not working — we reply to every message.",
};

export default function ContactPage({
  searchParams,
}: {
  searchParams: { topic?: string };
}) {
  const socials = socialLinks();

  return (
    <div className="flex gap-6">
      <div className="min-w-0 max-w-3xl flex-1 space-y-5">
        <div>
          <h1 className="text-3xl font-bold">Contact us</h1>
          <p className="mt-1 text-slate-600">
            Pick what your query is about and we will route it to the right
            team. We usually reply within one business day.
          </p>
        </div>

        <Card>
          <ContactForm defaultTopic={searchParams.topic} />
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h2 className="text-lg font-bold">Advertising</h2>
            <p className="mt-1 text-sm text-slate-600">
              Banner spots, sponsored links and featured placements — rates and
              self-serve booking are online.
            </p>
            <Link
              href="/advertise"
              className="mt-2 inline-block font-semibold text-indigo-600"
            >
              See advertising rates →
            </Link>
          </Card>
          <Card>
            <h2 className="text-lg font-bold">Quick answers</h2>
            <p className="mt-1 text-sm text-slate-600">
              Claiming a listing, tickets, points and plans are all covered in
              the FAQ.
            </p>
            <Link
              href="/faq"
              className="mt-2 inline-block font-semibold text-indigo-600"
            >
              Read the FAQ →
            </Link>
          </Card>
        </div>

        {socials.length ? (
          <Card>
            <h2 className="text-lg font-bold">Follow Godesi</h2>
            <div className="mt-2 flex flex-wrap gap-3 text-sm font-semibold text-indigo-600">
              {socials.map((social) => (
                <a
                  key={social.key}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {social.icon} {social.label}
                </a>
              ))}
            </div>
          </Card>
        ) : null}
      </div>

      <SidebarBanners />
    </div>
  );
}
