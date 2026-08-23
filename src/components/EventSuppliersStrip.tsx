import { recommendedLinks } from "@/lib/resourcesQueries";
import { LinkImpressions } from "@/components/LinkImpressions";

/**
 * Decorations, printers and party supplies under the event list. Managed in
 * Admin → Resources with the "Party supplies & printers" rail selected, so the
 * strip disappears on its own when there is nothing worth showing.
 */
export async function EventSuppliersStrip() {
  const links = await recommendedLinks(null, 8, "event-suppliers");
  if (!links.length) return null;

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
      <h2 className="text-base font-bold text-amber-900">
        🎈 Planning an event? Order the bits here
      </h2>
      <p className="mt-1 text-xs text-amber-800">
        Decorations, printing, banners and hire — suppliers we point people to.
        Some are paid placements or affiliate links.
      </p>
      <LinkImpressions ids={links.map((link) => link.id)} />
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <li key={link.id} className="rounded-xl bg-white p-3">
            <a
              href={`/api/links/${link.id}/click`}
              target="_blank"
              rel="noreferrer sponsored nofollow"
              className="text-sm font-bold text-amber-900 hover:underline"
            >
              {link.title}
            </a>
            {link.description ? (
              <p className="mt-0.5 text-xs text-slate-600">
                {link.description}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
