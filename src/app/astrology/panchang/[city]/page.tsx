import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteUrl } from "@/lib/format";
import {
  PANCHANG_CITIES,
  computePanchang,
  panchangCity,
  todayIn,
} from "@/lib/panchang";
import { PanchangPage } from "@/components/PanchangPage";

export const revalidate = 600;

export function generateStaticParams() {
  return PANCHANG_CITIES.map((city) => ({ city: city.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { city: string };
}): Metadata {
  const city = panchangCity(params.city);
  if (!city) return { title: "Panchang" };
  return {
    title: `Today's Panchang in ${city.name} — tithi, Rahu Kaal, fasts`,
    description: `Free daily panchang for ${city.name}: tithi, nakshatra, yoga, sunrise, Rahu Kaal, Abhijit muhurat and today's fasts and festivals in local time.`,
    alternates: {
      canonical: `${siteUrl()}/astrology/panchang/${city.slug}`,
    },
  };
}

export default function Page({ params }: { params: { city: string } }) {
  const city = panchangCity(params.city);
  if (!city) notFound();
  return (
    <PanchangPage
      panchang={computePanchang(city, todayIn(city.timeZone))}
      place={city.name}
      currentSlug={city.slug}
    />
  );
}
