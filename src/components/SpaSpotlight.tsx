import Link from "next/link";

const PICKS = [
  { slug: "beauty-lifestyle-spa-and-massage", label: "Spa & Massage" },
  { slug: "beauty-lifestyle-salons-and-parlours", label: "Salons & Parlours" },
  { slug: "beauty-lifestyle-yoga-classes", label: "Yoga Classes" },
  { slug: "beauty-lifestyle-gyms-and-fitness", label: "Gyms & Fitness" },
];

/** Fills the spare cell in the category grid with the spa & wellness picks. */
export function SpaSpotlight({ listings }: { listings: number }) {
  return (
    <Link
      href="/categories/beauty-lifestyle-spa-and-massage"
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center gap-3 bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-3 text-white">
        <span className="text-2xl" aria-hidden>
          💆
        </span>
        <div>
          <p className="font-bold leading-tight">Spa &amp; Wellness</p>
          <p className="text-xs text-white/80">
            {listings} listings · massage, ayurveda and relaxation
          </p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-slate-600">
          Ayurvedic massage, spas, salons, yoga and fitness near you.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PICKS.map((pick) => (
            <span
              key={pick.slug}
              className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs text-teal-700"
            >
              {pick.label}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
