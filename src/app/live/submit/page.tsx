import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Alert, Card, LinkButton } from "@/components/ui";
import { LiveChannelForm } from "@/components/forms/LiveChannelForm";
import {
  LIVE_CHANNEL_MONTHLY_USD,
  LIVE_CHANNEL_MONTHS,
} from "@/lib/liveChannels";
import { startLiveChannelCheckoutAction } from "@/app/actions/liveChannels";

export const metadata: Metadata = {
  title: "Add your radio station or TV channel | Godesi",
  description:
    "Get your desi radio station or TV channel carried on Godesi for $50 a month — free for charities and non-profits. Official embeds only.",
};

export const dynamic = "force-dynamic";

const STATUS_LABEL = {
  PENDING: "With our team for review",
  APPROVED: "Approved — playing on Godesi",
  REJECTED: "Not approved",
} as const;

function when(date: Date) {
  return date.toLocaleDateString("en-US", { dateStyle: "medium" });
}

export default async function SubmitLiveChannelPage({
  searchParams,
}: {
  searchParams: { paid?: string; error?: string };
}) {
  const user = await getCurrentUser();
  const mine = user
    ? await db.liveChannel.findMany({
        where: { submittedById: user.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const premium = user?.plan === "PREMIUM";

  return (
    <div className="space-y-4">
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
        <h1 className="text-2xl font-black sm:text-3xl">
          ➕ Add your radio station or TV channel
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700">
          Godesi carries desi radio and TV using only the broadcaster&apos;s own
          player — we never host or re-stream anything. Send us your station and
          our team checks it plays cleanly before it goes on the site.
        </p>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <p className="rounded-xl bg-white/70 p-3">
            <strong>${LIVE_CHANNEL_MONTHLY_USD}/month</strong>
            <br />
            Commercial stations and channels.
          </p>
          <p className="rounded-xl bg-white/70 p-3">
            <strong>Free</strong>
            <br />
            Charity, non-profit or community stations you suggest.
          </p>
          <p className="rounded-xl bg-white/70 p-3">
            <strong>Featured spot</strong>
            <br />
            Premium members sit above every other station.{" "}
            <Link href="/pricing" className="font-semibold underline">
              See Premium
            </Link>
          </p>
        </div>
      </Card>

      {searchParams.paid ? (
        <Alert tone="success">
          Payment received. Your station goes live as soon as our team approves
          the stream — we&apos;ll notify you.
        </Alert>
      ) : null}
      {searchParams.error ? (
        <Alert tone="error">
          {searchParams.error === "cancelled"
            ? "Payment cancelled — nothing was charged."
            : "We couldn't start that payment. Please try again or contact us."}
        </Alert>
      ) : null}

      <Card className="space-y-2">
        <h2 className="text-lg font-black">How to submit — step by step</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
          <li>
            <strong>Radio:</strong> find your station on{" "}
            <a
              href="https://tunein.com"
              target="_blank"
              rel="noreferrer nofollow"
              className="font-semibold text-indigo-600 underline"
            >
              tunein.com
            </a>{" "}
            and copy the page address. It contains an id like{" "}
            <code className="rounded bg-slate-100 px-1">s123456</code>. If your
            station isn&apos;t on TuneIn yet, claim it there first — it&apos;s
            free.
          </li>
          <li>
            <strong>TV:</strong> open your YouTube channel, copy the address that
            looks like{" "}
            <code className="rounded bg-slate-100 px-1">
              youtube.com/channel/UC…
            </code>
            . Your channel must have live streaming enabled and embedding allowed.
          </li>
          <li>
            Fill the form below with the name, city/language and that link. Tick
            the non-profit box only for charity or community stations.
          </li>
          <li>
            Commercial stations: pay the ${LIVE_CHANNEL_MONTHLY_USD} monthly
            carriage below. Nothing is charged for non-profit suggestions.
          </li>
          <li>
            Our team plays the stream, checks the broadcaster allows embedding,
            then approves it. You get a notification and it appears on{" "}
            <Link href="/live-radio" className="font-semibold underline">
              /live-radio
            </Link>{" "}
            or{" "}
            <Link href="/live-tv" className="font-semibold underline">
              /live-tv
            </Link>
            .
          </li>
        </ol>
        <p className="text-xs text-slate-500">
          We only carry streams the broadcaster publishes publicly for embedding.
          If a rights holder asks us to remove a stream, we remove it the same
          day.
        </p>
      </Card>

      {user ? (
        <Card>
          <h2 className="mb-3 text-lg font-black">Your submission</h2>
          <LiveChannelForm />
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-slate-700">
            Please{" "}
            <Link href="/login" className="font-semibold underline">
              sign in
            </Link>{" "}
            to submit a station or channel.
          </p>
        </Card>
      )}

      {mine.length ? (
        <Card className="space-y-3">
          <h2 className="text-lg font-black">Your stations</h2>
          {mine.map((channel) => {
            const paid = channel.paidUntil && channel.paidUntil > new Date();
            return (
              <div
                key={channel.id}
                className="rounded-xl border border-slate-200 p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">
                      {channel.kind === "TV" ? "📺 " : "🎧 "}
                      {channel.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {channel.place} · {STATUS_LABEL[channel.status]}
                      {channel.featured ? " · ⭐ Featured" : ""}
                    </p>
                    <p className="text-xs text-slate-500">
                      {channel.nonProfit
                        ? "Non-profit — no charge"
                        : paid
                          ? `Paid until ${when(channel.paidUntil!)}`
                          : "Carriage not paid yet"}
                    </p>
                    {channel.adminNote ? (
                      <p className="mt-1 text-xs text-slate-600">
                        Note from our team: {channel.adminNote}
                      </p>
                    ) : null}
                  </div>

                  {!channel.nonProfit ? (
                    <form
                      action={startLiveChannelCheckoutAction}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <input type="hidden" name="channelId" value={channel.id} />
                      <select
                        name="months"
                        aria-label="Months"
                        className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                      >
                        {LIVE_CHANNEL_MONTHS.map((months) => (
                          <option key={months} value={months}>
                            {months} month{months > 1 ? "s" : ""} · $
                            {months * LIVE_CHANNEL_MONTHLY_USD}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white"
                      >
                        {paid ? "Extend carriage" : "Pay carriage"}
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            );
          })}

          {premium ? (
            <Alert tone="success">
              You&apos;re on Premium — ask our team to feature any of your
              approved stations at the top of the page.
            </Alert>
          ) : (
            <Alert tone="info">
              Want your station pinned at the top with a ⭐ Featured ribbon? That
              needs the{" "}
              <Link href="/pricing" className="font-bold underline">
                Premium package
              </Link>
              .
            </Alert>
          )}
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <LinkButton href="/live-radio">🎧 Live radio</LinkButton>
        <LinkButton
          href="/live-tv"
          className="bg-white text-slate-900 ring-1 ring-slate-300"
        >
          📺 Live TV
        </LinkButton>
      </div>
    </div>
  );
}
