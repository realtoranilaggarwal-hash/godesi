import type { Metadata } from "next";
import Link from "next/link";
import { AD_PLACEMENTS, AD_SLOT_ORDER } from "@/lib/ads";
import { DesignHelp } from "@/components/DesignHelp";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Banner sizes, design prompts and upload",
  description:
    "Every GoDesi banner size with a ready-made design prompt, plus where to upload your banner.",
};

export default function BannerDesignPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Design &amp; upload your banner</h1>
        <p className="mt-1 text-sm text-slate-600">
          Every banner spot on GoDesi has its own size. Find yours below, copy
          its prompt into ChatGPT, then upload the image.
        </p>
      </div>

      <Card>
        <h2 className="text-lg font-bold">Where to upload</h2>
        <ol className="mt-2 space-y-2 text-sm text-slate-600">
          <li>
            <strong>1. Book a spot</strong> on{" "}
            <Link
              href="/advertise#placements"
              className="font-semibold text-indigo-600"
            >
              Advertise
            </Link>
            .
          </li>
          <li>
            <strong>2. Upload your banner</strong> in{" "}
            <Link
              href="/dashboard/ads"
              className="font-semibold text-indigo-600"
            >
              Dashboard → My ads
            </Link>
            : drag the image in (JPG, PNG, WebP or GIF, up to 6 MB), add the web
            address clicks should go to, and save. We check it and switch it on.
          </li>
          <li>
            <strong>Already have a banner with us?</strong> It is in My ads too
            — upload a new image there any time.
          </li>
        </ol>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {AD_SLOT_ORDER.map((slot) => {
          const placement = AD_PLACEMENTS[slot];
          return (
            <div key={slot} className="space-y-2">
              <DesignHelp size={placement.size} name={placement.name} />
              <p className="px-1 text-xs text-slate-500">
                Shows on:{" "}
                {placement.where.map((page, index) => (
                  <span key={page.href + page.label}>
                    {index ? ", " : ""}
                    <Link
                      href={page.href}
                      className="text-indigo-600 hover:underline"
                    >
                      {page.label}
                    </Link>
                  </span>
                ))}{" "}
                ·{" "}
                <Link
                  href={`/advertise/where/${slot.toLowerCase()}`}
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  Book this spot →
                </Link>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
