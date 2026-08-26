import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { normalizeUsername, usernameError } from "@/lib/profiles";
import { ClaimHandleForm } from "@/components/forms/ClaimHandleForm";
import { SignupForm } from "@/components/forms/SignupForm";
import { SocialSignIn } from "@/components/SocialSignIn";
import { HandleClaim } from "@/components/HandleClaim";
import { Alert, Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Claim your Godesi name",
  description:
    "Get godesi.com/yourname free: your own page with photos, services, WhatsApp button and QR code. First come, first served.",
  alternates: { canonical: "/claim" },
};

const PERKS = [
  "Your own short link — godesi.com/yourname — free forever",
  "A QR code for your visiting cards, flyers and shop window",
  "A WhatsApp button so customers message you directly",
  "Listed in the directory, so people searching your trade find you",
];

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: { u?: string };
}) {
  const handle = normalizeUsername(searchParams.u ?? "");
  const invalid = handle ? usernameError(handle) : null;
  const owner =
    handle && !invalid
      ? await db.user.findUnique({
          where: { username: handle },
          select: { id: true },
        })
      : null;
  const user = await getCurrentUser();
  const mine = owner !== null && user !== null && owner.id === user.id;

  return (
    <div className="mx-auto max-w-3xl space-y-5 py-4">
      {!handle || invalid ? (
        <>
          <h1 className="text-3xl font-black">Claim your Godesi name</h1>
          {invalid ? <Alert>{invalid}</Alert> : null}
          <p className="text-slate-600">
            Pick the name you want at the end of the link. First come, first
            served.
          </p>
          <HandleClaim tone="plain" />
        </>
      ) : owner && !mine ? (
        <>
          <h1 className="text-3xl font-black">
            godesi.com/{handle} is already taken
          </h1>
          <p className="text-slate-600">
            Someone got there first. Try another spelling, add your city or your
            trade — <strong>{handle}-nj</strong>, <strong>{handle}-events</strong>.
          </p>
          <HandleClaim tone="plain" />
          <Link
            href={`/${handle}`}
            className="inline-block text-sm font-semibold text-indigo-600 hover:underline"
          >
            See whose page it is →
          </Link>
        </>
      ) : (
        <>
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">
            Available
          </p>
          <h1 className="text-3xl font-black">
            godesi.com/<span className="text-indigo-600">{handle}</span> is
            yours to take
          </h1>
          <ul className="space-y-1 text-sm text-slate-700">
            {PERKS.map((perk) => (
              <li key={perk}>✅ {perk}</li>
            ))}
          </ul>

          <Card>
            {user ? (
              <>
                <h2 className="mb-2 text-lg font-bold">
                  {mine
                    ? "This one is already yours"
                    : "One tap and it is yours"}
                </h2>
                {mine ? (
                  <Link
                    href={`/${handle}`}
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    Open godesi.com/{handle} →
                  </Link>
                ) : (
                  <ClaimHandleForm handle={handle} />
                )}
              </>
            ) : (
              <>
                <h2 className="mb-1 text-lg font-bold">
                  Create your free account to hold it
                </h2>
                <p className="mb-3 text-sm text-slate-500">
                  Nobody else can take godesi.com/{handle} once it is on your
                  account.
                </p>
                <SocialSignIn
                  next={`/claim?u=${encodeURIComponent(handle)}`}
                  verb="Sign up"
                />
                <SignupForm handle={handle} />
              </>
            )}
          </Card>

          {user ? null : (
            <p className="text-sm text-slate-600">
              Already a member?{" "}
              <Link
                href={`/login?next=${encodeURIComponent(`/claim?u=${handle}`)}`}
                className="font-semibold text-indigo-600"
              >
                Sign in and claim it
              </Link>
            </p>
          )}
        </>
      )}
    </div>
  );
}
