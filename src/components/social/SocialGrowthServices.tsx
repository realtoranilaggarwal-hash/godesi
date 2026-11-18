import {
  SOCIAL_ORDER_PHONE,
  SOCIAL_ORDER_PHONE_HREF,
  SOCIAL_PLATFORMS,
  SOCIAL_SERVICES,
  formatSocialQty,
  formatSocialUsd,
} from "@/lib/socialGrowth";
import { SocialGrowthOrderForm } from "./SocialGrowthOrderForm";

/** Price list for every social media service plus the phone/Zelle order form. */
export function SocialGrowthServices({ source }: { source: "upgrade" | "proposal" }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
        {SOCIAL_PLATFORMS.map((platform) => (
          <div
            key={platform}
            className="min-w-0 break-inside-avoid rounded-2xl border border-slate-200 bg-white p-3"
          >
            <h4 className="font-black text-slate-900">
              <span aria-hidden>{SOCIAL_SERVICES.find((s) => s.platform === platform)?.icon}</span>{" "}
              {platform}
            </h4>
            <ul className="mt-1 space-y-1">
              {SOCIAL_SERVICES.filter((service) => service.platform === platform).map((service) => (
                <li key={service.slug} className="text-sm">
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-baseline justify-between gap-2">
                      <span className="font-semibold text-slate-800">{service.label}</span>
                      <span className="whitespace-nowrap text-xs font-bold text-indigo-700">
                        from {formatSocialUsd(service.packages[0].priceUsd)}
                        <span className="ml-1 text-slate-400 group-open:hidden print:hidden">▾</span>
                      </span>
                    </summary>
                    <p className="mt-1 text-xs text-slate-600">{service.blurb}</p>
                    <table className="mt-1 w-full text-xs">
                      <tbody>
                        {service.packages.map((pkg) => (
                          <tr key={pkg.qty} className="border-b border-slate-100">
                            <td className="py-1 text-slate-700">
                              {formatSocialQty(pkg.qty)} {service.unit}
                            </td>
                            <td className="py-1 text-right font-semibold text-slate-800">
                              {formatSocialUsd(pkg.priceUsd)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Tap a service to see every package. Order below, or call{" "}
        <a href={SOCIAL_ORDER_PHONE_HREF} className="font-semibold underline">
          {SOCIAL_ORDER_PHONE}
        </a>{" "}
        — we take payment by phone or Zelle.
      </p>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 print:hidden">
        <h4 className="mb-2 font-bold text-slate-900">Order a package</h4>
        <SocialGrowthOrderForm source={source} />
      </div>
    </div>
  );
}
