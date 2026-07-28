import type { Metadata } from "next";
import Link from "next/link";
import { LiveVisitorMap } from "@/components/LiveVisitorMap";

export const metadata: Metadata = {
  title: "Live visitors | Godesi",
  description:
    "See where people are browsing Godesi right now — anonymous, city-level only.",
};

export default function LivePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Live visitors on Godesi
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Every dot is someone browsing right now. We show the city only — never
          names, IP addresses or accounts.
        </p>
      </div>

      <LiveVisitorMap />

      <p className="text-sm text-slate-600">
        Want your business in front of them?{" "}
        <Link href="/signup" className="font-semibold text-indigo-600 underline">
          List free
        </Link>{" "}
        or{" "}
        <Link href="/advertise" className="font-semibold text-indigo-600 underline">
          advertise on Godesi
        </Link>
        .
      </p>
    </div>
  );
}
