import { Prisma } from "@prisma/client";
import {
  deleteBannerAction,
  toggleBannerAction,
  updateBannerCreativeAction,
} from "@/app/actions/admin";
import { BannerForm } from "@/components/forms/BannerForm";
import { formatCtr } from "@/lib/ads";
import { proxyImage } from "@/lib/proxyImage";
import { Card } from "@/components/ui";

type BannerRow = Prisma.BannerGetPayload<{
  include: { advertiser: { select: { email: true; name: true } } };
}>;

/** Own component so the banner desk can load without the whole admin panel. */
export function AdminBannersCard({ banners }: { banners: BannerRow[] }) {
  return (
    <Card id="banners">
      <h2 className="mb-1 text-lg font-bold">Banners</h2>
      <p className="mb-3 text-sm text-slate-500">
        10 sidebar slots (300×250), 4 skyscrapers (160×600) and 1 header slot.
        Saving a slot replaces whatever is in it.
      </p>
      <BannerForm />

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="w-24 py-2">Slot</th>
              <th className="w-[420px]">Banner</th>
              <th>Impressions</th>
              <th>Clicks</th>
              <th>CTR</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {banners.map((banner) => (
              <tr key={banner.id}>
                <td className="w-24 py-2 text-xs font-semibold">
                  {banner.slot}{" "}
                  {banner.position ? `#${banner.position}` : "(unassigned)"}
                </td>
                <td>
                  <div className="flex items-start gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={proxyImage(banner.imageUrl)}
                      alt=""
                      className="h-10 w-16 shrink-0 rounded border border-slate-200 object-contain"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <a
                        href={banner.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="line-clamp-2 block break-words font-medium text-indigo-600"
                        title={banner.title}
                      >
                        {banner.title}
                      </a>
                      <div className="text-xs text-slate-400">
                        {banner.status.toLowerCase()} ·{" "}
                        {banner.active ? "running" : "paused"}
                        {banner.advertiser
                          ? ` · ${banner.advertiser.email}`
                          : ""}
                      </div>
                      <form
                        action={updateBannerCreativeAction}
                        className="mt-1 flex flex-wrap items-center gap-1"
                      >
                        <input type="hidden" name="id" value={banner.id} />
                        <input
                          name="imageUrl"
                          defaultValue={banner.imageUrl}
                          placeholder="image URL"
                          className="w-56 rounded border border-slate-200 px-2 py-1 text-[11px]"
                        />
                        <input
                          name="linkUrl"
                          defaultValue={banner.linkUrl}
                          placeholder="destination URL"
                          className="w-56 rounded border border-slate-200 px-2 py-1 text-[11px]"
                        />
                        <button
                          type="submit"
                          className="rounded border border-slate-300 px-2 py-1 text-[11px] font-semibold hover:bg-slate-50"
                        >
                          replace
                        </button>
                      </form>
                    </div>
                  </div>
                </td>
                <td className="text-xs">{banner.impressions}</td>
                <td className="text-xs">{banner.clicks}</td>
                <td className="text-xs text-slate-500">
                  {banner.impressions
                    ? formatCtr(banner.impressions, banner.clicks)
                    : "—"}
                </td>
                <td>
                  <div className="flex flex-nowrap justify-end gap-2">
                    <form action={toggleBannerAction}>
                      <input type="hidden" name="id" value={banner.id} />
                      <button
                        type="submit"
                        className="whitespace-nowrap rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                      >
                        {banner.active ? "pause" : "activate"}
                      </button>
                    </form>
                    <form action={deleteBannerAction}>
                      <input type="hidden" name="id" value={banner.id} />
                      <button
                        type="submit"
                        className="whitespace-nowrap rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {banners.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-3 text-sm text-slate-500">
                  No banners yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
