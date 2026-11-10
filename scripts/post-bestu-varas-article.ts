/**
 * Publishes the Gujarati New Year (Bestu Varas, Vikram Samvat 2083) explainer
 * on the GoDesi blog, linked to the festivals calendar, daily Panchang,
 * astrology, events, business listings and temples, with Amazon New Year /
 * home mandir links. Re-runnable: an existing slug is left as it is.
 *
 *   DATABASE_URL=... npx tsx scripts/post-bestu-varas-article.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const AUTHOR_ID = "cms24edsq0000t9gk48f24h5h";
const TAG = "godesi03-20";
const amazon = (q: string) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(q).replace(/%20/g, "+")}&tag=${TAG}`;
const G = "https://godesi.com";

const POST = {
  slug: "gujarati-new-year-bestu-varas-vikram-samvat-2083",
  title: "Happy Gujarati New Year 2083! Why Does Our New Year Begin After Diwali?",
  excerpt:
    "Saal Mubarak! Bestu Varas begins Vikram Samvat 2083 the day after Diwali. Why the Gujarati New Year follows Diwali, what Chopda Pujan and Annakut mean, and India's many New Years.",
  tags: ["gujarati", "new-year", "bestu-varas", "diwali", "festivals", "guide"],
  coverUrl: "/images/categories/festivals.jpg",
  body: `Saal Mubarak! Nutan Varshabhinandan! (સાલ મુબારક! નૂતન વર્ષાભિનંદન!)

Today, November 10, 2026, is Bestu Varas (બેસતું વર્ષ), the Gujarati New Year and the first day of Vikram Samvat 2083. Across Gujarat and in Gujarati homes all over America, families are visiting temples, touching the feet of elders and sharing sweets with neighbours.

One note before we begin: the date of Bestu Varas follows the lunar Tithi (Kartik Shukla Pratipada), so it can fall on a different day depending on where you live. Please follow your local Panchang. [GoDesi's free daily Panchang](${G}/astrology/panchang) is worked out for your own city's sunrise.

Why does the Gujarati New Year begin after Diwali?
For many Gujarati families, Diwali is the last day of the old year, and the very next day the new year begins. The order of the days tells the story.

- Diwali closes the old year: homes are cleaned and lit with diyas, and families do Lakshmi Puja and Ganesha Puja to give thanks for the year that is ending and to welcome prosperity.
- Chopda Pujan: Gujarati business families worship their account books (chopda) on Diwali. Old accounts are closed, and new books are opened with "Shubh" and "Labh" and a swastik written in kumkum, so the business starts the new year with blessings.
- Bestu Varas opens the new year: early morning temple visits, elders' blessings, new clothes, and plates of sweets and farsan shared with family and friends. Everyone greets each other with "Saal Mubarak".
- Annakut and Govardhan Puja: temples offer Lord Krishna a "mountain of food" (Annakut) in gratitude, remembering how He lifted Govardhan hill to protect the people of Vraj. Many families visit a temple just to take Annakut darshan.

So the new year begins with gratitude for the old one, clean accounts, blessings from elders and a fresh start.

India has many New Years
India does not have just one New Year. Different communities welcome the new year on different days, each with its own traditions:

- Bestu Varas: the Gujarati New Year, the day after Diwali
- Gudi Padwa: the New Year in Maharashtra
- Ugadi: the New Year in Andhra Pradesh, Telangana and Karnataka
- Baisakhi: the harvest New Year in Punjab
- Cheti Chand: the Sindhi New Year
- Navreh: the Kashmiri New Year

Different dates, different languages, one message: a fresh beginning, with gratitude and hope. See every festival date for the year on the [GoDesi festival calendar](${G}/festivals).

Start the new year with GoDesi

- Check this year's festival dates on the [GoDesi festival calendar](${G}/festivals).
- See today's Tithi, Nakshatra, Rahu Kaal and Muhurat in the [daily Panchang for your city](${G}/astrology/panchang).
- Read today's horoscope and more on [GoDesi Astrology](${G}/astrology).
- Hosting a New Year get-together, Annakut or community program? [Post your New Year event free](${G}/events/new).
- Business owners: just as Chopda Pujan opens fresh account books, start Vikram Samvat 2083 by [claiming your free business listing](${G}/post?type=business) so customers near you can find you.
- Find a temple near you for Bestu Varas darshan and Annakut in [GoDesi temples and religious places](${G}/religious).

For your home mandir and the New Year

- [Brass diyas](${amazon("brass diya oil lamp")})
- [Brass puja thali sets](${amazon("brass puja thali set")})
- [Gujarati Panchang calendars](${amazon("gujarati calendar panchang")})
- [Diwali and New Year sweets gift boxes](${amazon("diwali sweets gift box")})
- [Chopda Pujan account books](${amazon("chopda pujan account book")})

As an Amazon Associate GoDesi earns from qualifying purchases. It costs you nothing extra.

May Vikram Samvat 2083 bring happiness, health and prosperity to you and your family. Saal Mubarak!

Your community. Your culture. Your GoDesi.`,
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
