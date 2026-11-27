import Link from "next/link";
import { WEBSITE_CONTENT_PACKAGE as PKG, websiteContentPackageRegularUsd } from "@/lib/websiteOffer";

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export function WebsiteContentPackage() {
  const regular = websiteContentPackageRegularUsd();
  return (
    <section id="package" className="scroll-mt-24 rounded-3xl border-2 border-amber-300 bg-amber-50 p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Package deal</p>
      <h2 className="mt-1 text-2xl font-black text-slate-900">
        Website + Content package — {usd(PKG.priceUsd)} for the first year
      </h2>
      <p className="mt-1 text-sm text-slate-700">
        Your website, plus fresh content every week to post on WhatsApp, Facebook, Instagram and
        LinkedIn, and a year of promotion on GoDesi.
      </p>

      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-amber-200 text-left text-xs uppercase text-slate-500">
            <th className="py-1.5 font-semibold">What you get</th>
            <th className="py-1.5 text-right font-semibold">Regular price</th>
          </tr>
        </thead>
        <tbody>
          {PKG.items.map((item) => (
            <tr key={item.name} className="border-b border-amber-100 align-top">
              <td className="py-1.5 pr-3">
                <span className="font-semibold text-slate-800">{item.name}</span>
                <span className="block text-xs text-slate-500">{item.detail}</span>
              </td>
              <td className="py-1.5 text-right font-semibold text-slate-700">
                {item.regularUsd ? usd(item.regularUsd) : "Free"}
              </td>
            </tr>
          ))}
          <tr className="border-b border-amber-200">
            <td className="py-1.5 font-semibold text-slate-600">Regular GoDesi price</td>
            <td className="py-1.5 text-right font-semibold text-slate-500 line-through">{usd(regular)}</td>
          </tr>
          <tr>
            <td className="py-2 text-base font-black text-slate-900">Your first-year price</td>
            <td className="py-2 text-right text-xl font-black text-emerald-700">{usd(PKG.priceUsd)}</td>
          </tr>
        </tbody>
      </table>
      <p className="text-right text-xs font-bold text-emerald-700">You save {usd(regular - PKG.priceUsd)}</p>

      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700">
        <li>
          Pay {usd(PKG.depositUsd)} to start and {usd(PKG.priceUsd - PKG.depositUsd)} when your website is
          finished.
        </li>
        <li>
          Every content picture has a QR code to your GoDesi page, and your GoDesi page links to your
          website.
        </li>
        <li>You post the content we send you to your social media.</li>
        <li>From the second year: {PKG.renewals.join(" · ")}.</li>
      </ul>

      <p className="mt-3 rounded-2xl bg-white p-3 text-sm text-slate-700">
        <strong>See RSS in action:</strong> the latest website posts of{" "}
        <Link href={PKG.rssExample.href} className="font-semibold text-indigo-700 underline">
          {PKG.rssExample.name}
        </Link>{" "}
        show live on his GoDesi page. Your posts will show the same way.
      </p>

      <Link
        href={`/website?package=content#start`}
        className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-3 text-base font-bold text-white shadow hover:bg-emerald-700"
      >
        Choose this package →
      </Link>
    </section>
  );
}
