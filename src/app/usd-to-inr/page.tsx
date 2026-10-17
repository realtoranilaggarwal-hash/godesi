import type { Metadata } from "next";
import Link from "next/link";
import { dollarRates } from "@/lib/ticker";
import { subcategorySlug } from "@/lib/categories";
import { RupeeConverter } from "@/components/RupeeConverter";
import { ShareButtons } from "@/components/ShareButtons";
import { SidebarBanners } from "@/components/Banners";
import { siteUrl } from "@/lib/format";
import { Card } from "@/components/ui";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { rates } = await dollarRates();
  const inr = rates.find((rate) => rate.code === "INR");
  return {
    title: inr
      ? `USD to INR today: $1 = ₹${inr.perDollar.toFixed(2)} — dollar to rupee rate`
      : "USD to INR today — dollar to rupee rate",
    description:
      "Today's US dollar to Indian rupee reference rate, a converter for sending money home, and dollar rates for Pakistan, Bangladesh, Sri Lanka, Nepal and the UAE.",
    alternates: { canonical: "/usd-to-inr" },
  };
}

const TABLE = [1, 10, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

export default async function UsdToInrPage() {
  const { rates, asOf } = await dollarRates();
  const inr = rates.find((rate) => rate.code === "INR");
  const others = rates.filter((rate) => rate.code !== "INR");
  const rupees = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-5 py-8 text-white sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Dollar to rupee today
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            {inr ? `$1 = ₹${inr.perDollar.toFixed(2)}` : "USD to INR today"}
          </h1>
          <p className="mt-3 max-w-2xl text-white/90">
            Reference rate{asOf ? `, updated ${asOf}` : ""}. Banks and money
            transfer apps add their own margin and fees, so compare what the
            other side actually receives before you send.
          </p>
        </section>

        {inr ? (
          <>
            <Card>
              <h2 className="mb-3 font-bold">Convert dollars to rupees</h2>
              <RupeeConverter perDollar={inr.perDollar} code="INR" />
            </Card>
            <Card>
              <h2 className="mb-2 font-bold">Quick table</h2>
              <div className="grid grid-cols-2 gap-x-6 text-sm sm:grid-cols-3">
                {TABLE.map((amount) => (
                  <p
                    key={amount}
                    className="flex justify-between border-b border-slate-100 py-1.5"
                  >
                    <span>${amount.toLocaleString("en-US")}</span>
                    <span className="font-semibold">
                      {rupees.format(amount * inr.perDollar)}
                    </span>
                  </p>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <Card>
            <p className="text-sm text-slate-600">
              The rate feed is not answering right now — try again in a few
              minutes.
            </p>
          </Card>
        )}

        {others.length ? (
          <Card>
            <h2 className="mb-2 font-bold">Other dollar rates today</h2>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              {others.map((rate) => (
                <p
                  key={rate.code}
                  className="flex justify-between rounded-xl border border-slate-100 px-3 py-2"
                >
                  <span>
                    $1 → {rate.code}{" "}
                    <span className="text-slate-400">· {rate.label}</span>
                  </span>
                  <span className="font-semibold">
                    {rate.perDollar.toLocaleString("en-US", {
                      maximumFractionDigits: rate.perDollar > 10 ? 2 : 4,
                    })}
                  </span>
                </p>
              ))}
            </div>
          </Card>
        ) : null}

        <Card>
          <h2 className="mb-2 font-bold">Sending money home</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>
              Compare the rupees received, not just the fee — a &quot;zero
              fee&quot; transfer can hide a weak rate.
            </li>
            <li>
              NRE accounts keep the money repatriable; NRO is for income earned
              in India.
            </li>
            <li>
              Large gifts to family can need a US gift-tax filing — ask your
              accountant.
            </li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold">
            <Link
              href={`/categories/${subcategorySlug("financial-services", "Money Transfer & Forex")}`}
              className="text-emerald-700 hover:underline"
            >
              Money transfer & forex on GoDesi →
            </Link>
            <Link
              href="/complaints/remittance-money-transfer"
              className="text-emerald-700 hover:underline"
            >
              Problem with a transfer? How to complain →
            </Link>
          </div>
        </Card>

        <Card>
          <p className="text-xs text-slate-500">
            Rates from{" "}
            <a
              href="https://www.exchangerate-api.com"
              target="_blank"
              rel="noreferrer noopener"
              className="underline"
            >
              exchangerate-api
            </a>
            , the previous close — not a live dealing price.
          </p>
          <div className="mt-3">
            <ShareButtons
              url={`${siteUrl()}/usd-to-inr`}
              title={
                inr
                  ? `Dollar to rupee today: $1 = ₹${inr.perDollar.toFixed(2)}`
                  : "Dollar to rupee today"
              }
            />
          </div>
        </Card>
      </div>
      <SidebarBanners />
    </div>
  );
}
