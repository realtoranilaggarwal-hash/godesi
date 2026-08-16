import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card, LinkButton } from "@/components/ui";
import { SidebarBanners } from "@/components/Banners";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Free featuring for event organisers",
  description:
    "Display a Godesi standee at your venue and your event is featured free at the top of Godesi, with free banner artwork designed for you.",
  alternates: { canonical: "/events/partner" },
};

const STEPS = [
  {
    title: "Post your event on Godesi",
    body: "Free, takes two minutes. Tick “Yes, promote my event” on the form.",
  },
  {
    title: "Print the standee",
    body: "Download the 38×70 in artwork below and get it printed — we point you at a printer that does roll-up standees cheaply.",
  },
  {
    title: "Stand it at the entrance",
    body: "One standee where people walk in, and photograph it. Upload the photo on your event page.",
  },
  {
    title: "We feature you",
    body: "Your event goes to the top of Godesi events for free, and we design your banner artwork.",
  },
];

export default async function EventPartnerPage() {
  const kit = await db.partnerKit.findUnique({ where: { id: "default" } });

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-600 px-5 py-8 text-white sm:px-8">
          <h1 className="text-3xl font-black">
            Put up our standee, get featured free 🤝
          </h1>
          <p className="mt-2 max-w-2xl text-white/90">
            Display one Godesi standee at your venue and your event is pinned to
            the top of Godesi events — no fee. We also design your web banners
            (160×600 and 728×90) and hand you the files to use anywhere.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href="/events/new" variant="secondary">
              Post your event
            </LinkButton>
          </div>
        </section>

        <Card>
          <h2 className="text-lg font-bold">How it works</h2>
          <ol className="mt-3 grid gap-3 sm:grid-cols-2">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-black text-indigo-700">
                  Step {index + 1}
                </p>
                <p className="font-bold text-slate-900">{step.title}</p>
                <p className="mt-1 text-sm text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">The artwork</h2>
          {kit?.standeePdfUrl || kit?.printerUrl ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {kit.standeePdfUrl ? (
                <a
                  href={kit.standeePdfUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
                >
                  Download the standee (PDF, 38×70 in)
                </a>
              ) : null}
              {kit.printerUrl ? (
                <a
                  href={kit.printerUrl}
                  target="_blank"
                  rel="noreferrer noopener sponsored"
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Get it printed →
                </a>
              ) : null}
              {kit.banner160Url ? (
                <a
                  href={kit.banner160Url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Banner 160×600
                </a>
              ) : null}
              {kit.banner728Url ? (
                <a
                  href={kit.banner728Url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Banner 728×90
                </a>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              The printable standee is being finalised. Post your event and tick
              “Yes, promote my event” — we will send you the file and arrange
              the printing.
            </p>
          )}
          {kit?.note ? (
            <p className="mt-3 text-sm text-slate-600">{kit.note}</p>
          ) : null}
          <p className="mt-3 text-xs text-slate-500">
            Printing costs are yours; the design, the featuring and the banners
            are ours. Featuring runs until the event finishes, and we take it
            down if the standee never goes up.
            {kit?.printerUrl
              ? " The printer link is a referral link, so Godesi may earn a small commission — it costs you no more."
              : ""}
          </p>
        </Card>

        <p className="text-sm text-slate-500">
          Questions?{" "}
          <Link href="/contact" className="font-semibold text-indigo-600">
            Ask us
          </Link>{" "}
          — or just{" "}
          <Link href="/events/new" className="font-semibold text-indigo-600">
            post your event
          </Link>
          .
        </p>
      </div>

      <SidebarBanners />
    </div>
  );
}
