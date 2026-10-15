/**
 * Puja and gemstone words in astrology pages that link to a store search.
 * Each term is matched as a whole word, case-insensitively; only the first
 * mention of an item on a page becomes a link.
 */
export type AstroShopItem = {
  id: string;
  label: string;
  query: string;
  terms: string[];
};

export const ASTRO_SHOP_ITEMS: AstroShopItem[] = [
  {
    id: "ruby",
    label: "Ruby (manik)",
    query: "ruby gemstone certified loose",
    terms: ["ruby", "manik"],
  },
  {
    id: "pearl",
    label: "Pearl (moti)",
    query: "natural pearl moti gemstone certified",
    terms: ["pearl", "moti"],
  },
  {
    id: "coral",
    label: "Red coral (moonga)",
    query: "red coral moonga gemstone certified",
    terms: ["red coral", "moonga"],
  },
  {
    id: "emerald",
    label: "Emerald (panna)",
    query: "emerald panna gemstone certified",
    terms: ["emerald", "panna"],
  },
  {
    id: "pukhraj",
    label: "Yellow sapphire (pukhraj)",
    query: "yellow sapphire pukhraj certified",
    terms: ["yellow sapphire", "pukhraj"],
  },
  {
    id: "neelam",
    label: "Blue sapphire (neelam)",
    query: "blue sapphire neelam certified",
    terms: ["blue sapphire", "neelam"],
  },
  {
    id: "gomed",
    label: "Hessonite (gomed)",
    query: "hessonite gomed gemstone certified",
    terms: ["hessonite", "gomed"],
  },
  {
    id: "catseye",
    label: "Cat's eye (lehsunia)",
    query: "cats eye lehsunia gemstone certified",
    terms: ["cat's eye", "lehsunia"],
  },
  {
    id: "rudraksha",
    label: "Rudraksha mala",
    query: "rudraksha mala",
    terms: ["rudraksha"],
  },
  {
    id: "yantra",
    label: "Shree yantra",
    query: "shree yantra brass",
    terms: ["yantra", "shree yantra"],
  },
  {
    id: "navagraha",
    label: "Navagraha yantra",
    query: "navagraha yantra",
    terms: ["navagraha yantra"],
  },
  {
    id: "thali",
    label: "Puja thali set",
    query: "puja thali set brass",
    terms: ["puja thali"],
  },
  {
    id: "diya",
    label: "Brass diya",
    query: "brass diya oil lamp",
    terms: ["diya", "diyas"],
  },
  {
    id: "havan",
    label: "Havan kund & samagri",
    query: "havan kund samagri",
    terms: ["havan"],
  },
  {
    id: "mandir",
    label: "Home mandir",
    query: "wooden home mandir temple",
    terms: ["mandir"],
  },
  {
    id: "panchang",
    label: "Hindu panchang calendar",
    query: "hindu panchang calendar",
    terms: ["panchang"],
  },
];

export const DEFAULT_ASTRO_SHOP = [
  "rudraksha",
  "yantra",
  "thali",
  "mandir",
  "pukhraj",
  "pearl",
];

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const TERM_TO_ITEM = new Map(
  ASTRO_SHOP_ITEMS.flatMap((item) =>
    item.terms.map((term) => [term.toLowerCase(), item] as const),
  ),
);

/** Longest terms first so "shree yantra" wins over "yantra". */
export const ASTRO_SHOP_PATTERN = new RegExp(
  `\\b(${Array.from(TERM_TO_ITEM.keys())
    .sort((a, b) => b.length - a.length)
    .map(escape)
    .join("|")})\\b`,
  "gi",
);

export function astroShopItemFor(term: string) {
  return TERM_TO_ITEM.get(term.toLowerCase()) ?? null;
}

/** Items mentioned anywhere in the given text, in first-mention order. */
export function astroShopItemsIn(texts: string[]) {
  const found = new Map<string, AstroShopItem>();
  for (const text of texts) {
    for (const match of Array.from(text.matchAll(ASTRO_SHOP_PATTERN))) {
      const item = astroShopItemFor(match[0]);
      if (item) found.set(item.id, item);
    }
  }
  return Array.from(found.values());
}

export function astroShopItemsById(ids: string[]) {
  return ids.flatMap(
    (id) => ASTRO_SHOP_ITEMS.find((item) => item.id === id) ?? [],
  );
}
