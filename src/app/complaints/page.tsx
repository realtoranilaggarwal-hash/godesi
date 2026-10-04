import type { Metadata } from "next";
import Link from "next/link";
import {
  COMPLAINT_GUIDES,
  EVERGREEN_EVIDENCE,
  POST_RULES,
} from "@/lib/complaints";
import { SidebarBanners } from "@/components/Banners";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "How to file a complaint — consumer help for the desi community",
  description:
    "Mouldy sweets at the grocery, a landlord who kept the deposit, a travel agent who vanished, unpaid wages: step-by-step guides to filing a complaint in the US and Canada, plus anonymous consumer alerts from GoDesi members.",
  alternates: { canonical: "/complaints" },
};

export default function ComplaintsPage() {
  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-3xl flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-5 py-8 text-white sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Consumer help
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Something wrong? Here is exactly who to tell. ⚠️
          </h1>
          <p className="mt-3 max-w-2xl text-white/90">
            Most of us just walk out of the store and warn a few friends. A
            five-minute complaint to the right office gets the shelf inspected,
            the deposit back or the agent shut down — and it works the same
            whether you are a citizen, on a visa or a student. Pick your
            situation.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
            <Link
              href="/news/report?topic=consumer"
              className="rounded-xl bg-white px-3 py-2 text-rose-700"
            >
              Post a consumer alert (can be anonymous)
            </Link>
            <Link
              href="/news?topic=consumer"
              className="rounded-xl border border-white/40 px-3 py-2"
            >
              Read alerts from members
            </Link>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          {COMPLAINT_GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/complaints/${guide.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-rose-300 hover:shadow-sm"
            >
              <p className="text-2xl">{guide.emoji}</p>
              <p className="mt-1 font-bold text-slate-900">{guide.title}</p>
              <p className="mt-1 line-clamp-3 text-sm text-slate-600">
                {guide.example}
              </p>
              <p className="mt-2 text-xs font-bold text-rose-600">
                Who to call · what to gather · template →
              </p>
            </Link>
          ))}
        </div>

        <Card>
          <h2 className="text-lg font-bold">
            Before you call anyone: gather this
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {EVERGREEN_EVIDENCE.map((point) => (
              <li key={point}>• {point}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">Posting an alert on GoDesi</h2>
          <p className="mt-1 text-sm text-slate-600">
            Alerts appear under{" "}
            <Link
              href="/news?topic=consumer"
              className="font-semibold text-rose-600 hover:underline"
            >
              News → Consumer alerts
            </Link>{" "}
            after the news desk reads them. Readers can confirm, doubt or flag
            them, and share them on WhatsApp. The rules:
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
            {POST_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-slate-500">
            GoDesi is a community notice board, not a regulator, court or law
            firm. These guides point you to official bodies; nothing here is
            legal advice. Business named in an alert? Claim your card and reply
            from it, or write to us via{" "}
            <Link href="/report" className="underline">
              /report
            </Link>
            .
          </p>
        </Card>
      </div>
      <SidebarBanners />
    </div>
  );
}
