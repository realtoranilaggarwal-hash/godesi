/**
 * Publishes the "What is Panchang?" explainer (Anil's script, edited) on the
 * GoDesi blog, linked to the daily Panchang, astrology, astrologers, rishta and
 * wedding sections, with Amazon puja-item links. Re-runnable: an existing slug
 * is left as it is.
 *
 *   DATABASE_URL=... npx tsx scripts/post-panchang-article.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const AUTHOR_ID = "cms24edsq0000t9gk48f24h5h";
const TAG = "godesi03-20";
const amazon = (q: string) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(q).replace(/%20/g, "+")}&tag=${TAG}`;
const G = "https://godesi.com";

const POST = {
  slug: "what-is-panchang-tithi-nakshatra-rahu-kaal-explained",
  title:
    "What is Panchang? The ancient Indian calendar behind Tithi, Nakshatra and Rahu Kaal",
  excerpt:
    "Why Diwali moves every year, what Tithi and Nakshatra mean, how Panchang is calculated, and why yours should be worked out for where you live in America.",
  tags: ["panchang", "astrology", "gujarati", "festivals", "guide"],
  body: `Have you ever wondered why Diwali falls on a different date every year? Why Ekadashi keeps moving? Or why Hindu families ask a Pandit or astrologer before starting a business, buying a house, getting married or doing a Puja?

There is an ancient Indian system behind all of these traditions. It is called Panchang (પંચાંગ).

Many of us grew up hearing the word, but not everyone knows what it means, how it works, or why it still matters today. Here is the connection between Indian astronomy, mathematics, astrology and our everyday traditions.

1. What is Panchang?
The word comes from Sanskrit: Panch means five and Ang means parts. Panchang is the traditional Hindu almanac that describes five elements of each day.

- Tithi (તિથિ), the lunar day: worked out from the angle between the Sun and the Moon. A lunar month has 30 Tithis, split into Shukla Paksha (waxing Moon) and Krishna Paksha (waning Moon). Ekadashi, Purnima, Amavasya and Diwali all depend on it.
- Nakshatra (નક્ષત્ર), the lunar mansion: the zodiac is divided into 27 Nakshatras, and the Moon's position decides which one is active. Nakshatras matter in Vedic astrology, birth charts, compatibility matching and choosing auspicious times.
- Yoga (યોગ): calculated from the combined longitudes of the Sun and Moon. There are 27 traditional Yogas.
- Karana (કરણ): half of a Tithi. There are 11 named Karanas, another factor when choosing a Muhurat.
- Vara (વાર), the weekday: Ravivar (Sunday), Somvar (Monday), Mangalvar (Tuesday), Budhvar (Wednesday), Guruvar (Thursday), Shukravar (Friday) and Shanivar (Saturday).

Together, these five elements make the Panchang.

2. Why Panchang still fascinates
Long before smartphones and digital calendars, Indian astronomers tracked the Sun, the Moon, lunar phases and seasons with remarkable accuracy. Those calculations became part of our religious and cultural life.

A Panchang tells you when the next full Moon comes, when a Tithi begins and ends, which Nakshatra is active, when the Sun rises in your city, and which periods of the day are traditionally considered good or bad for certain activities. It is astronomy, mathematics and tradition in one daily calendar.

3. How is Panchang calculated?
A Panchang is not someone writing festival dates into a calendar. It is built from the positions of the Sun and Moon:


- Step 1: calculate where the Sun and Moon are at a given date and time.
- Step 2: use those positions to work out Tithi, Nakshatra, Yoga, Karana and Vara.
- Step 3: use the latitude, longitude and time zone of a place to find its local sunrise and sunset.
- Step 4: work out traditional periods such as Rahu Kaal, Yamaganda, Gulika Kaal and Abhijit Muhurat from the length of that local day.
- Step 5: show it all with start and end times, so you can follow the day.

Many Panchangs use the Lahiri (Chitrapaksha) Ayanamsa for these sidereal calculations. Different calculation methods and regional traditions are why two Panchangs can sometimes disagree slightly.

4. Why Panchang is different from the English calendar
In the Gregorian calendar, dates are fixed: January 1 is always January 1, and July 4 is always July 4. Hindu festivals follow the Moon instead. Diwali is tied to Amavasya, Holi to Phalguna Purnima, Janmashtami to Krishna Ashtami, and Ekadashi comes twice in most lunar months. That is why their English dates change every year. See this year's dates on the [GoDesi festival calendar](${G}/festivals).

The Hindu calendar is lunisolar: it uses lunar months but adjusts them to stay in step with the seasons. The English calendar tells you the date. The Panchang tells you what kind of day it is.

5. How astrologers use Panchang
Vedic astrology, Jyotish Shastra, starts from the same astronomical positions. Astrologers and Pandits look at the Panchang for:


- Marriage: choosing a wedding Muhurat and matching Nakshatras. Try GoDesi's [free Kundli matching guide](${G}/astrology/kundli-matching-for-marriage), and if you are looking for a match, [post a free rishta](${G}/rishta/new) or [browse rishtas](${G}/rishta). Planning the wedding? Find [wedding vendors](${G}/wedding/vendors) or [post what you need free](${G}/wedding/requirements/new).
- Griha Pravesh: picking an auspicious time to move into a new home. You can [book a Pandit for a Puja](${G}/pooja) on GoDesi.
- Business openings: choosing a Muhurat to open a shop or office. [List your new business free](${G}/post?type=business) on GoDesi too.
- Naming ceremonies: using the baby's birth Nakshatra for traditional name letters.
- Birth charts: using the exact birth date, time and place. Make yours with the free [GoDesi Kundli calculator](${G}/astrology/kundli-calculator).
- Puja, Havan and Vrat: finding the right Tithi and timing.

Need a personal reading? [Find astrologers on GoDesi](${G}/categories/religious-services-astrologers), or read [how to choose an astrologer](${G}/astrology/how-to-choose-an-astrologer) first. Are you an astrologer or Pandit? [List your services free](${G}/post?type=business) so families near you can find you.

One honest note: the Panchang itself is astronomy. Astrological interpretation is a separate layer of tradition and belief. It is part of our culture and religious practice, not a scientifically proven prediction of the future.

6. Rahu Kaal, Yamaganda and Abhijit Muhurat
These are the timings people check most:


- Rahu Kaal: a period traditionally avoided for starting important work.
- Yamaganda: another period many families avoid for new beginnings.
- Gulika Kaal: a weekday-based period used in Hindu astrology.
- Abhijit Muhurat: an auspicious window around local midday.

Families who follow these traditions check them before starting important work. Again, they are traditional guidelines, not a scientific measure of success.

7. Why your location matters
This matters most for Indians living outside India. If you live in New Jersey and read a Panchang made for Ahmedabad, the sunrise is completely different. So are the time zone and the local solar timings.

That changes local sunrise and sunset, which Tithi is running at your sunrise, the transition times, and Rahu Kaal, Yamaganda, Gulika Kaal and Abhijit Muhurat. Whether a fast or festival falls today can also depend on your local sunrise. A Panchang should be calculated for where you are, not copied from India and converted to American time.

8. Free daily Panchang for your city on GoDesi
[GoDesi's daily Panchang](${G}/astrology/panchang) is worked out for your own city's sunrise. It uses your approximate location, or you can pick your city from the list: New Jersey, New York, California, Texas and more.

Every day it shows:

- Tithi, with its end time
- Nakshatra, with its end time
- Yoga
- Sunrise and sunset
- Rahu Kaal, Yamaganda and Gulika Kaal
- Abhijit Muhurat
- Today's fasts and festivals

You don't need to be an astrologer to understand it. Just check it each morning, or get it in your inbox with GoDesi's free morning email. While you're there, read [today's horoscope for every rashi](${G}/astrology/horoscope).

9. A message to Gujarati families in America
Many Gujarati families keep Ekadashi, Poonam, Amavasya, Mahashivratri, Navratri and Diwali. Our parents and grandparents had a printed Gujarati calendar on the wall and checked the Tithi, Vaar and Nakshatra every day. Our children are growing up in America, and many homes no longer have that calendar.

Technology helps keep the tradition alive. Tap "ગુજરાતીમાં વાંચો" at the top of this page or the Panchang page to read it in Gujarati, and share it with your family on WhatsApp.

Explain to your children what Ekadashi means. Tell them why Diwali follows the Moon. Show them how our ancestors studied the Sun and the Moon. Tradition and technology can work together.

For your home mandir

- [Brass puja thali sets](${amazon("brass puja thali set")})
- [Brass diyas](${amazon("brass diya oil lamp")})
- [Gujarati Panchang calendars](${amazon("gujarati calendar panchang")})
- [Bhagavad Gita in Gujarati](${amazon("bhagavad gita gujarati")})

As an Amazon Associate GoDesi earns from qualifying purchases. It costs you nothing extra.

Your daily Panchang is one visit away: [open today's Panchang on GoDesi](${G}/astrology/panchang). Free, calculated for your city, wherever you are.

Note: Panchang calculations and festival observances can vary by regional tradition and calculation method. For important ceremonies and fasts, ask your family Pandit or temple.`,
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
