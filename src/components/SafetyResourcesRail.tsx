import { RESOURCE_KIND_LABELS } from "@/lib/resources";
import { recommendedLinks } from "@/lib/resourcesQueries";
import { LinkImpressions } from "@/components/LinkImpressions";
import { SidebarBanners } from "@/components/Banners";

/**
 * Right rail beside Connect: admin-curated safety tools and tips first, then
 * the usual ad inventory. Links are managed in Admin → Resources with the
 * "Safety tools & tips" rail selected.
 */
export async function SafetyResourcesRail() {
  const links = await recommendedLinks(null, 6, "connect-safety");

  return (
    <aside className="hidden w-[260px] shrink-0 space-y-4 lg:order-first lg:block">
      <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4">
        <h2 className="text-base font-bold text-teal-900">
          🛡️ Safety tools & tips
        </h2>
        <p className="mt-1 text-xs text-teal-800">
          Meet in public places, verify who you are meeting and never send
          money. Godesi does not handle payments between members.
        </p>

        {links.length ? (
          <>
            <LinkImpressions ids={links.map((link) => link.id)} />
            <ul className="mt-3 divide-y divide-teal-100">
              {links.map((link) => (
                <li key={link.id} className="py-2">
                  <a
                    href={`/api/links/${link.id}/click`}
                    target="_blank"
                    rel="noreferrer sponsored nofollow"
                    className="text-sm font-semibold text-teal-800 hover:underline"
                  >
                    {link.title}
                  </a>
                  {link.description ? (
                    <p className="text-xs text-teal-800">{link.description}</p>
                  ) : null}
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-teal-700/70">
                    <span>{RESOURCE_KIND_LABELS[link.kind]}</span>
                    {link.tags.length ? (
                      <span>· {link.tags.join(", ")}</span>
                    ) : null}
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      <SidebarBanners />
    </aside>
  );
}
