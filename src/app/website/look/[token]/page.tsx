import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, inputClass } from "@/components/ui";
import { LookActions } from "@/components/website/LookActions";
import { checkCoupon, normalizeCouponCode } from "@/lib/coupons";
import { BASE_MONTHLY_USD, BASE_YEARLY_USD, setupUsdFor, websitePath } from "@/lib/websiteBuilder";
import { loadPowerUps } from "@/lib/websiteProjects";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";
import { PARTNER_HOSTING_NOTE } from "@/lib/partnerPackage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your new website",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

function usd(minor: number) {
  return `$${minor % 100 ? (minor / 100).toFixed(2) : minor / 100}`;
}

/**
 * The private link a custom-design customer gets. The design is shown framed
 * inside GoDesi so its own address is not on the page or in the email. Below it:
 * the price, the extras they can add, and a discount-code box.
 */
export default async function LookPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { code?: string };
}) {
  const project = await db.websiteProject.findUnique({
    where: { previewToken: params.token },
    select: { id: true, businessName: true, designUrl: true, status: true, tier: true, includedIn: true },
  });
  if (!project?.designUrl || project.status === "CANCELLED") notFound();
  const paid = project.status === "PAID" || project.status === "LIVE";

  const setupMinor = setupUsdFor(project.tier) * 100;
  const code = normalizeCouponCode(searchParams.code ?? "");
  let discountMinor = 0;
  let codeError = "";
  if (code && !paid) {
    const check = await checkCoupon({ code, scope: "WEBSITE", userId: "", subtotalMinor: setupMinor, currency: "USD" });
    if (check.ok) discountMinor = check.discountMinor;
    else codeError = check.error;
  }
  const setupDue = setupMinor - discountMinor;
  const powerUps = paid ? [] : (await loadPowerUps()).filter((powerUp) => powerUp.active);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Your new website</p>
        <h1 className="text-2xl font-black text-slate-900">{project.businessName}</h1>
        <p className="text-sm text-slate-600">
          Scroll inside the window to see every page. Tap the menu to move between pages.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <iframe
          src={project.designUrl}
          title={`${project.businessName} — website preview`}
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          className="h-[75vh] min-h-[480px] w-full"
        />
      </div>

      {paid ? (
        <Card>
          <p className="text-sm text-slate-700">
            This website is paid for.{" "}
            <Link href={websitePath(project.id, "/done")} className="font-semibold text-indigo-700 underline">
              Go to your website page
            </Link>{" "}
            to see its address or ask for a change.
          </p>
        </Card>
      ) : project.includedIn ? (
        <LookActions
          token={params.token}
          priceLine={`Included in your GoDesi Partner Package — nothing more to pay today. ${PARTNER_HOSTING_NOTE}`}
        />
      ) : (
        <>
          <LookActions
            token={params.token}
            code={discountMinor ? code : undefined}
            priceLine="You only pay if you love it. You pick hosting and any extras on the next step."
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="font-bold text-slate-900">💵 Your price</h2>
              <table className="mt-2 w-full text-sm">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 pr-2">
                      Custom designed website
                      <span className="block text-xs text-slate-500">
                        Up to {WEBSITE_OFFER.customPages} pages, designed for you — one time
                      </span>
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {discountMinor ? (
                        <>
                          <span className="mr-1 text-slate-400 line-through">{usd(setupMinor)}</span>
                          <span className="text-emerald-700">{usd(setupDue)}</span>
                        </>
                      ) : (
                        usd(setupMinor)
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 pr-2">
                      Hosting, updates and support — <strong>monthly</strong>
                      <span className="block text-xs text-slate-500">
                        Includes {WEBSITE_OFFER.changesPerMonth} change a month · cancel any time
                      </span>
                    </td>
                    <td className="py-2 text-right font-semibold">${BASE_MONTHLY_USD}/month</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-2">
                      …or <strong>yearly</strong> (save ${BASE_MONTHLY_USD * 12 - BASE_YEARLY_USD})
                      <span className="block text-xs text-slate-500">
                        Includes {WEBSITE_OFFER.changesPerYear} changes a year
                      </span>
                    </td>
                    <td className="py-2 text-right font-semibold">${BASE_YEARLY_USD}/year</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-slate-50 p-2">
                  <div className="text-xs text-slate-500">Today, monthly hosting</div>
                  <div className="text-lg font-black">{usd(setupDue + BASE_MONTHLY_USD * 100)}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-2">
                  <div className="text-xs text-slate-500">Today, yearly hosting</div>
                  <div className="text-lg font-black">{usd(setupDue + BASE_YEARLY_USD * 100)}</div>
                </div>
              </div>

              <form method="get" className="mt-4 space-y-1">
                <label className="block text-sm font-medium text-slate-700" htmlFor="look-code">
                  Have a discount code?
                </label>
                <div className="flex gap-2">
                  <input
                    id="look-code"
                    name="code"
                    defaultValue={code}
                    maxLength={40}
                    placeholder="e.g. WEB20"
                    className={`${inputClass} uppercase sm:max-w-xs`}
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Apply
                  </button>
                </div>
                {discountMinor ? (
                  <p className="text-sm text-emerald-700">
                    ✓ {code}: {usd(discountMinor)} off the one-time fee. It&apos;s filled in for you at checkout.
                  </p>
                ) : codeError ? (
                  <p className="text-sm text-red-600">{codeError}</p>
                ) : (
                  <p className="text-xs text-slate-500">Codes take money off the one-time fee.</p>
                )}
              </form>
            </Card>

            {powerUps.length ? (
              <Card>
                <h2 className="font-bold text-slate-900">✨ Extras you can add</h2>
                <p className="text-xs text-slate-500">
                  Optional. Tick the ones you want on the next step. On yearly hosting they bill 12× the monthly price.
                </p>
                <ul className="mt-2 divide-y divide-slate-100 text-sm">
                  {powerUps.map((powerUp) => (
                    <li key={powerUp.key} className="flex items-start justify-between gap-3 py-2">
                      <span>
                        {powerUp.emoji} <strong>{powerUp.label}</strong>
                        <span className="block text-xs text-slate-500">{powerUp.description}</span>
                      </span>
                      <span className="whitespace-nowrap font-semibold">${powerUp.monthlyUsd}/month</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
