import { citySlug } from "@/lib/citySlug";

/**
 * A stock banner per city, shown on /b profile pages whose business has not
 * uploaded its own cover photo — the page gets a local, finished look instead
 * of a bare header. Keyed by citySlug; add one image per city under
 * /public/images/cities/<slug>.jpg as city guides get built out.
 */
const CITY_COVERS: Record<string, string> = {
  iselin: "/images/cities/iselin.jpg",
};

export function cityCover(city: string | null | undefined): string | null {
  if (!city) return null;
  return CITY_COVERS[citySlug(city)] ?? null;
}
