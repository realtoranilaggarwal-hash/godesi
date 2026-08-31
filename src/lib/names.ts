/**
 * Name particles that stay lower case in the middle of a name, so "de Souza"
 * and "bin Rashid" are not printed as "De Souza" and "Bin Rashid".
 */
const PARTICLES = new Set([
  "bin",
  "binte",
  "bint",
  "da",
  "das",
  "de",
  "del",
  "della",
  "der",
  "di",
  "do",
  "dos",
  "du",
  "el",
  "la",
  "le",
  "van",
  "von",
  "y",
]);

/**
 * Tidies a name for display: people type "anil aggarwal" at signup and it
 * looked careless printed next to a business card. Only words that are
 * entirely lower case are lifted, so "McDonald" and "VJ" keep the spelling
 * their owner used, and a particle inside a multi-word name stays lower case.
 */
export function properName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const multiWord = words.length > 1;
  return name
    .split(/(\s+)/)
    .map((part) => {
      if (!part.trim()) return part;
      if (part !== part.toLowerCase()) return part;
      if (multiWord && PARTICLES.has(part)) return part;
      return part.replace(
        /(^|[-'’.])([a-z])/g,
        (_match, lead, letter) => `${lead}${(letter as string).toUpperCase()}`,
      );
    })
    .join("");
}
