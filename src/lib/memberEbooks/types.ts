export type Chapter = { title: string; body: string[]; checklist?: string[] };
export type Ebook = {
  slug: string;
  title: string;
  subtitle: string;
  audience: string;
  color: string;
  pitch: string;
  bullets: string[];
  chapters: Chapter[];
  related: string[];
  /** Outside references and Anil's original articles on AnilSellsNJ.com. */
  sources?: { label: string; url: string }[];
  /** Affiliate products (Amazon tag anilaggarwal-20, approved partners); shown with a disclosure. */
  products?: { label: string; url: string; note: string }[];
  /** A ready-made PDF (repo path under member-ebooks/) served instead of rendering `chapters`. */
  file?: string;
  /** Cover image under /public. */
  cover?: string;
};
