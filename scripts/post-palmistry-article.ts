/**
 * Publishes the free palm-reading guide (ebook) news post on the GoDesi blog,
 * with Anil's $10-per-hand WhatsApp palm reading. Re-runnable: an existing
 * slug is left as it is.
 *
 *   DATABASE_URL=... npx tsx scripts/post-palmistry-article.ts
 */
import { PrismaClient } from "@prisma/client";
import { PALM_READING } from "../src/lib/palmistry";

const db = new PrismaClient();
const AUTHOR_ID = "cms24edsq0000t9gk48f24h5h";
const G = "https://godesi.com";

const POST = {
  slug: "free-palm-reading-guide-ebook-book-anil",
  title: "Free palm reading guide: read your own hand, or book Anil for $10",
  excerpt:
    "GoDesi's free palmistry ebook explains hand shape, fingers, thumb, the six major lines, mounts and special marks. Anil, known in college as the fortune teller, now reads palms on WhatsApp for $10 per hand.",
  tags: ["palmistry", "astrology", "palm reading", "ebook", "guide"],
  body: `Palmistry (hast rekha shastra) is one of the oldest traditions in India: reading character from the shape of the hand, the fingers and the lines on the palm. Grandparents, pandits and friends have read palms at family gatherings for generations.

GoDesi has published a free palm reading guide, with a full labelled palm chart, so you can read your own hand. [Open the guide](${G}${PALM_READING.href}) or [download the free ebook (PDF)](${G}${PALM_READING.pdf}).

Read your own hand in 6 steps
- Hand shape: square or long palm, short or long fingers (Earth, Air, Fire or Water hand).
- Fingers and thumb: index for leadership, middle for responsibility, ring for creativity, little for communication; a thumb that opens wide shows independence.
- The six major lines: life, head, heart, fate, sun and Mercury lines.
- The mounts: the raised pads under each finger, at the base of the thumb and on the outer palm.
- Special marks: triangles, squares, stars, crosses and islands.
- Compare both hands: what you were born with, and what you have made of it.

Book a palm reading with Anil
Anil Aggarwal, the founder of GoDesi.com, was known in college as the fortune teller: friends lined up to show him their palms. Now anyone can book a personal reading with him. Send a clear photo of your palm on WhatsApp and he will read it for you.

- Price: ${PALM_READING.price}
- [Book on WhatsApp](${PALM_READING.whatsapp}) — ${PALM_READING.whatsappDisplay}

Prefer a professional astrologer or palm reader? [Find one on GoDesi](${G}/astrology#astrologers).

Note: palmistry is a traditional practice for reflection and fun, not a science. It is not medical, legal, financial or mental-health advice.`,
};

async function main() {
  const author = await db.user.findUnique({
    where: { id: AUTHOR_ID },
    select: { id: true },
  });
  await db.blogPost.upsert({
    where: { slug: POST.slug },
    create: { ...POST, kind: "POST", authorId: author?.id ?? null },
    update: {},
  });
  console.log(`${G}/blog/${POST.slug}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
