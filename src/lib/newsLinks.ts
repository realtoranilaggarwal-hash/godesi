import { slugify } from "@/lib/slug";

/**
 * Only stories our own people wrote deserve to be indexed: syndicated RSS
 * items are somebody else's article, and asking search engines to rank our
 * copy of it is duplicate content.
 */
export function isOriginalReport(item: { submittedById: string | null }) {
  return item.submittedById !== null;
}

/**
 * Readable URL for a report: the headline in words with the id kept on the end
 * so old `/news/<id>` links still resolve. Ids never contain a dash, so the
 * last segment is always the id.
 */
export function newsPath(item: { id: string; title: string }) {
  const words = slugify(item.title).slice(0, 70).replace(/-+$/, "");
  return words ? `/news/${words}-${item.id}` : `/news/${item.id}`;
}

/** Pulls the id back out of either the readable or the bare form. */
export function newsIdFromParam(param: string) {
  return param.split("-").pop() ?? param;
}
