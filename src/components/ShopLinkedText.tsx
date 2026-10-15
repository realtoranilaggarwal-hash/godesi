import type { ReactNode } from "react";
import { ASTRO_SHOP_PATTERN, astroShopItemFor } from "@/lib/astrologyShop";
import { amazonSearchUrl, ebaySearchUrl, shopConfig } from "@/lib/shop";

/**
 * Text with the first mention of each puja or gemstone item linked to a store
 * search. `linked` is shared across one page so an item is linked only once.
 */
export function ShopLinkedText({
  text,
  linked,
}: {
  text: string;
  linked: Set<string>;
}) {
  const { amazonTag, ebayCampaignId } = shopConfig();
  if (!amazonTag && !ebayCampaignId) return <>{text}</>;

  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of Array.from(text.matchAll(ASTRO_SHOP_PATTERN))) {
    const item = astroShopItemFor(match[0]);
    const start = match.index ?? 0;
    if (!item || linked.has(item.id)) continue;
    linked.add(item.id);
    parts.push(text.slice(last, start));
    parts.push(
      <a
        key={`${item.id}-${start}`}
        href={
          amazonTag
            ? amazonSearchUrl(item.query, amazonTag)
            : ebaySearchUrl(item.query, ebayCampaignId as string)
        }
        target="_blank"
        rel="noopener noreferrer sponsored nofollow"
        title={`Shop ${item.label} (paid link)`}
        className="font-semibold text-amber-700 underline decoration-dotted underline-offset-2 hover:text-amber-800"
      >
        {match[0]}
      </a>,
    );
    last = start + match[0].length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}
