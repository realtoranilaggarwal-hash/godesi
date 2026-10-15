import type { Metadata } from "next";
import { siteUrl } from "@/lib/format";
import { visitorPanchang } from "@/lib/panchangGeo";
import { PanchangPage } from "@/components/PanchangPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Today's Panchang for your city — tithi, nakshatra, Rahu Kaal",
  description:
    "Free daily Hindu panchang for your own city: tithi, nakshatra, yoga, sunrise and sunset, Rahu Kaal, Abhijit muhurat, Ekadashi and other fasts.",
  alternates: { canonical: `${siteUrl()}/astrology/panchang` },
};

export default function Page() {
  const { panchang, label, citySlug } = visitorPanchang();
  return (
    <PanchangPage panchang={panchang} place={label} currentSlug={citySlug} />
  );
}
