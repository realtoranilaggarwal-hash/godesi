/** Words that stay lowercase inside a title. */
const SMALL_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "but",
  "by",
  "for",
  "from",
  "in",
  "nor",
  "of",
  "on",
  "or",
  "per",
  "the",
  "to",
  "via",
  "vs",
  "with",
]);

/** Abbreviations members type in lower case that should be shown upper case. */
const ACRONYMS = new Set([
  "llc",
  "llp",
  "inc",
  "ltd",
  "pvt",
  "plc",
  "pllc",
  "pc",
  "dba",
  "cpa",
  "cfp",
  "cfa",
  "mba",
  "md",
  "dds",
  "dmd",
  "rn",
  "it",
  "hvac",
  "suv",
  "bhk",
  "usa",
  "uk",
  "uae",
  "nri",
  "gst",
  "hr",
  "seo",
  "diy",
  "vip",
  "dj",
  "bbq",
  "atm",
  "id",
  "tv",
  "ai",
]);

function fixWord(word: string, isEdge: boolean) {
  // Anything the member deliberately cased (McDonald, iPhone, ABC) is left alone.
  if (/[A-Z]/.test(word.slice(1))) return word;
  const bare = word.replace(/[^A-Za-z]/g, "").toLowerCase();
  if (!bare) return word;
  if (ACRONYMS.has(bare)) return word.replace(bare, bare.toUpperCase());
  if (!isEdge && SMALL_WORDS.has(bare)) return word.toLowerCase();
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Title-cases a member-typed heading ("independence day celebration" →
 * "Independence Day Celebration") without touching deliberate casing or acronyms.
 */
export function titleCase(value: string) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return trimmed;
  // Shouting titles read as spam, so they are normalised like lower-case ones.
  const words = (trimmed === trimmed.toUpperCase() ? trimmed.toLowerCase() : trimmed).split(
    " ",
  );
  return words
    .map((word, index) => fixWord(word, index === 0 || index === words.length - 1))
    .join(" ");
}

/**
 * Sentence-cases member-typed prose: the first letter of every sentence and of
 * every new line is capitalised, and nothing else about the text is touched.
 */
export function sentenceCase(value: string) {
  return value
    .trim()
    .replace(
      /(^|[.!?]\s+|\n\s*)([a-z])/g,
      (_match, lead: string, letter: string) => `${lead}${letter.toUpperCase()}`,
    );
}
