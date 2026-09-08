import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Desi city guides — restaurants, caterers, wedding vendors",
  description:
    "Hand-written guides to Indian and South Asian businesses by city: where to eat, who caters, who to call for a wedding — with every listing's contact details.",
};

export default function GuideIndexPage() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white">
        <h1 className="text-2xl font-black md:text-3xl">Desi city guides</h1>
        <p className="mt-2 text-sm text-white/90">
          One page per city and trade, written by us from what is actually
          listed on GoDesi. More cities are added as the directory fills in.
        </p>
      </Card>
      <ul className="grid gap-3 sm:grid-cols-2">
        {GUIDES.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={`/guide/${guide.slug}`}
              className="block rounded-2xl border border-slate-200 bg-white p-4 hover:border-indigo-300"
            >
              <div className="font-black">{guide.title}</div>
              <p className="mt-1 text-sm text-slate-600">{guide.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
