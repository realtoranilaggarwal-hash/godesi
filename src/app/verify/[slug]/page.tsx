import type { Metadata } from "next";
import Link from "next/link";
import { badgeStatus } from "@/lib/badge";
import { siteUrl } from "@/lib/format";
import { Card, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const status = await badgeStatus(params.slug);
  if (status.level === "NONE") {
    return { title: "Not listed on Godesi", robots: { index: false } };
  }
  const label = status.level === "VERIFIED" ? "Verified" : "Listed";
  return {
    title: `${status.name} — ${label} on Godesi`,
    description: `${status.name} is ${label.toLowerCase()} on Godesi: ${status.category} in ${status.city}. Check what the Godesi badge on their website means.`,
    alternates: { canonical: `${siteUrl()}/verify/${status.slug}` },
  };
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Where the badge on a business's own website points. A trust mark nobody can
 * check is just a picture, so this page states plainly what we did and did not
 * check — including saying so when a business is not listed at all.
 */
export default async function Page({ params }: { params: { slug: string } }) {
  const status = await badgeStatus(params.slug);

  if (status.level === "NONE") {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <section className="rounded-3xl bg-slate-900 px-6 py-8 text-white">
          <h1 className="text-2xl font-black">Not listed on Godesi</h1>
          <p className="mt-2 text-white/80">
            We have no live business card at{" "}
            <code className="rounded bg-white/10 px-1">/b/{params.slug}</code>.
            If you arrived here from a badge on somebody&apos;s website, that
            badge is out of date or was not issued by us — treat it as no
            verification at all.
          </p>
        </section>
        <Card>
          <p className="text-sm text-slate-600">
            Think this is wrong, or want your business listed?{" "}
            <Link href="/contact" className="font-semibold text-indigo-600">
              Tell us
            </Link>{" "}
            or{" "}
            <Link href="/signup" className="font-semibold text-indigo-600">
              create a free card
            </Link>
            .
          </p>
        </Card>
      </div>
    );
  }

  const verified = status.level === "VERIFIED";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <section
        className={`rounded-3xl px-6 py-8 text-white ${
          verified
            ? "bg-gradient-to-r from-emerald-600 to-teal-600"
            : "bg-gradient-to-r from-indigo-600 to-fuchsia-600"
        }`}
      >
        <p className="text-sm font-bold uppercase tracking-wide text-white/80">
          {verified ? "✅ Verified on Godesi.com" : "Listed on Godesi.com"}
        </p>
        <h1 className="mt-1 text-3xl font-black">{status.name}</h1>
        <p className="mt-1 text-white/90">
          {status.category} · {status.city}
        </p>
      </section>

      <Card>
        <h2 className="font-bold">What this badge means</h2>
        <p className="mt-1 text-sm text-slate-600">{status.reason}</p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Card claimed by its owner</dt>
            <dd className="font-semibold">{status.claimed ? "Yes" : "No"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Paid Godesi membership</dt>
            <dd className="font-semibold">{status.paid ? "Yes" : "No"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">ID and licence checked by staff</dt>
            <dd className="font-semibold">
              {status.staffChecked ? "Yes" : "Not checked"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Listed since</dt>
            <dd className="font-semibold">{formatDate(status.listedSince)}</dd>
          </div>
        </dl>
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Godesi checks that a real owner controls this card
          {status.staffChecked ? " and has shown us ID and a licence" : ""}. We
          are not a regulator and this is not a guarantee of the work done —
          always agree terms in writing.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href={`/b/${status.slug}`}>
            See the Godesi card →
          </LinkButton>
          <Link
            href="/contact"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Report a problem
          </Link>
        </div>
      </Card>

      <Card>
        <h2 className="font-bold">Own this business?</h2>
        <p className="mt-1 text-sm text-slate-600">
          {status.claimed
            ? "Get your badge, in every size and format, from the badge page."
            : "Claim this card and the badge on your website upgrades itself to “Verified on Godesi.com” — no code change needed."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <LinkButton href="/badge">Get the badge</LinkButton>
          {status.claimed ? null : (
            <Link
              href={`/b/${status.slug}`}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Claim this card
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
