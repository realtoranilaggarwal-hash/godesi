import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";

export async function uniqueBlogSlug(title: string) {
  const base = slugify(title).slice(0, 70) || "post";
  let slug = base;
  for (let attempt = 2; await db.blogPost.findUnique({ where: { slug } }); attempt += 1) {
    slug = `${base}-${attempt}`;
  }
  return slug;
}

/**
 * Posts are plain text; blank lines separate paragraphs, "- " makes a bullet and
 * a line of "![caption](/path.png)" becomes a screenshot.
 */
export function blogBlocks(body: string) {
  return body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim());
      const image = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
      if (image) {
        return {
          type: "image" as const,
          caption: image[1],
          src: image[2],
        };
      }
      const bullets = lines.every((line) => line.startsWith("- "));
      return bullets
        ? { type: "list" as const, items: lines.map((line) => line.slice(2)) }
        : { type: "text" as const, text: block };
    });
}

export function blogSummary(post: { excerpt: string | null; body: string }) {
  return post.excerpt ?? `${post.body.replace(/\s+/g, " ").slice(0, 157)}…`;
}
