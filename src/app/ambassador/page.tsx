import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Alert, Card, LinkButton } from "@/components/ui";
import { AmbassadorForm } from "@/components/forms/AmbassadorForm";
import { AMBASSADOR_PERKS, AMBASSADOR_PLEDGE } from "@/lib/joinGoals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Become a GoDesi Local Ambassador",
  description:
    "Represent GoDesi in your city: help local desi businesses and families get discovered, earn reward points and commission, and get a badge and certificate. Sign the ethics pledge to apply.",
  alternates: { canonical: "/ambassador" },
};

export default async function AmbassadorPage() {
  const user = await getCurrentUser();
  const application = user
    ? await db.ambassador.findUnique({ where: { userId: user.id } })
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-100">
          GoDesi Local Ambassadors
        </p>
        <h1 className="mt-1 text-3xl font-black sm:text-4xl">
          Represent GoDesi in your city 🤝
        </h1>
        <p className="mt-2 max-w-2xl text-emerald-50">
          Help desi businesses, families and organisers near you be discovered,
          heard and remembered. Ambassadors bring their community onto GoDesi,
          and GoDesi honours and rewards them for it.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">What you get</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AMBASSADOR_PERKS.map((perk) => (
            <Card key={perk.title}>
              <p className="text-2xl" aria-hidden>
                {perk.icon}
              </p>
              <h3 className="mt-1 font-bold">{perk.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{perk.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">How it works</h2>
        <ol className="grid gap-2 text-sm text-slate-700 sm:grid-cols-4">
          {[
            "Create a free GoDesi account.",
            "Fill in the form below and sign the ethics pledge.",
            "The GoDesi team reviews you and gets in touch.",
            "Once approved, your badge and certificate go live.",
          ].map((step, index) => (
            <li key={step} className="rounded-xl bg-slate-50 p-3">
              <span className="block text-lg font-black text-emerald-700">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <Card id="apply">
        <h2 className="text-xl font-bold">Apply</h2>
        {!user ? (
          <div className="mt-2 space-y-3 text-sm text-slate-700">
            <p>
              Sign in or create a free account to apply. The pledge you sign:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              {AMBASSADOR_PLEDGE.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <LinkButton href="/signup?next=/ambassador%23apply">
                Create free account
              </LinkButton>
              <LinkButton
                href="/login?next=/ambassador%23apply"
                variant="secondary"
              >
                Log in
              </LinkButton>
            </div>
          </div>
        ) : application?.status === "APPROVED" ? (
          <div className="mt-2 space-y-3">
            <Alert tone="success">
              You are a GoDesi Local Ambassador for {application.city}. Thank
              you!
            </Alert>
            <LinkButton href={`/ambassador/certificate/${application.id}`}>
              🏅 View my certificate
            </LinkButton>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {application?.status === "PENDING" ? (
              <Alert tone="info">
                Your application is with the GoDesi team. You signed the pledge
                on {application.pledgedAt.toDateString()}; you can update it
                below.
              </Alert>
            ) : null}
            {application?.status === "DECLINED" ? (
              <Alert tone="info">
                Your last application was not approved. You can update it and
                apply again.
              </Alert>
            ) : null}
            <AmbassadorForm
              name={user.name}
              defaults={{
                city: application?.city ?? user.location ?? "",
                phone: application?.phone ?? user.offerPhone ?? "",
                pitch: application?.pitch ?? "",
                helps: application?.helps ?? [],
              }}
            />
          </div>
        )}
      </Card>

      <p className="text-xs text-slate-500">
        Points have no cash value. Commission is agreed in writing with the
        GoDesi team before you sell anything. Questions?{" "}
        <Link href="/contact" className="underline">
          Contact us
        </Link>
        .
      </p>
    </div>
  );
}
