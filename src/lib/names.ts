/**
 * Tidies a name for display: people type "anil aggarwal" at signup and it
 * looked careless printed next to a business card. Only words that are
 * entirely lower case are lifted, so "McDonald", "de Souza" and "VJ" are left
 * exactly as their owner wrote them.
 */
export function properName(name: string): string {
  return name
    .split(/(\s+)/)
    .map((part) => {
      if (!part.trim()) return part;
      if (part !== part.toLowerCase()) return part;
      return part.replace(
        /(^|[-'’.])([a-z])/g,
        (_match, lead, letter) => `${lead}${(letter as string).toUpperCase()}`,
      );
    })
    .join("");
}
