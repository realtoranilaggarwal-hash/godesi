import { db } from "../src/lib/db";
import { uniqueBlogSlug } from "../src/lib/blog";

/**
 * Publishes (or refreshes) the "inside the Godesi kitchen" update post. Run with
 * `npx tsx scripts/whats-new-post.ts` against whichever database is loaded.
 */
const TITLE = "Inside the Godesi kitchen — everything we shipped this month";

const BODY = `Godesi started as a simple idea: give every desi business a free digital card that works on WhatsApp. A month of building later it is a directory, a marketplace, a newsroom, a recognition programme and a live media hub. Here is the whole kitchen, dish by dish — with screenshots of the real pages.

![The Godesi homepage: premium businesses, categories, events and news in one scroll](/blog/whatsnew-home.png)

⭐ Premium businesses, and cards that feel premium

- "Featured businesses" is now Premium businesses, with a gold ribbon, gold border and a verified-style badge
- Latest businesses and upcoming events use compact cards, so paid placements visibly stand out
- Our team can feature any business straight from the listing, and staff can edit a business or event in place instead of hunting through the dashboard
- "Feature your business here" invites you into that row

📞 Phone numbers that actually work

Every phone and WhatsApp field now has a country-code picker with flags and dial codes, because a number saved without +1 or +91 can never be called or messaged. Hiring somewhere flexible? Requirements now accept Anywhere, Online / remote, In person area flexible or Open to discuss instead of forcing a city.

🎧 Live desi radio, playing while you browse

![Live radio: 20 stations plus a free search across thousands more](/blog/whatsnew-radio.png)

- 20 built-in stations — Bollywood, Hindi, Punjabi, Gurbani, Tamil, plus UK, US and Netherlands desi radio
- A free search across the open station directory: type "punjabi" or "tamil" and thousands more play inside Godesi
- A floating mini player keeps the stream going as you move around the site, with links back to all stations and all channels
- Every card has a "Not working?" button, and reports land in our admin desk

📺 Live desi TV

![Live TV: news channels in Hindi, English, Marathi, Malayalam, Kannada and Tamil](/blog/whatsnew-tv.png)

Nineteen news channels through the broadcasters' own official YouTube live streams — Hindi, English, Marathi, Malayalam, Kannada and Tamil. Godesi never hosts, records or re-streams anything; we simply resolve which video is live right now so the player never shows "video unavailable".

Own a station or channel? Submit it in minutes. Carriage is $50/month, free for charities, non-profits and community stations, with a premium package if you want to sit at the top. Nothing appears until our team approves it.

🏆 GoDesi Elite

![GoDesi Elite: featured members, video interviews and awards](/blog/whatsnew-elite.png)

- Apply yourself or nominate someone you admire
- $50 one-time interview fee including a 30–60 second video
- $500 three-minute professional film built from the photos, footage and story you supply
- $100 / $250 / $500 placement boosts — spend more, sit higher in your section
- Business awards show beside your photo, and every nominee is invited to the annual GoDesi Elite Awards

🪙 Godesi points

![Top contributors: the members who build the community](/blog/whatsnew-leaderboard.png)

Points recognise the people who build Godesi. They are not money and have no cash value — they buy visibility, nothing else.

- +5 when someone joins on your referral link
- +2 for posting a listing or an event
- +1 for reviewing a business
- 1 point for every $1 you spend with Godesi
- Spend points on featuring a listing, unlocking a requirement's contact details, or banner ads
- Your profile shows a Contribution Score bar with your Elite / Premium / Member badge, and the biggest contributors get a leaderboard

💬 Global chat

![Live visitors and the global chat room](/blog/whatsnew-chat.png)

The live visitor map now sits above a global chat room, so desis online at the same time can actually talk. Sign in to post, links are stripped to keep spam out, and any message can be flagged for review.

🎟 Tickets, money and trust

Event organisers sell tickets through Godesi with Stripe and PayPal. Paid members keep everything after the card processor's fee; free organisers pay a 2% platform fee. Your payouts page shows gross sales, the fee and exactly what is payable, and Premium organisers can take direct Stripe payouts.

📰 News by members first

Member-written stories rank above imported feeds. Free members post one story a week, paid members ten, and the remaining quota is shown on the report page. In-article ads now sit inside news stories, blog posts and the requirements board.

🌐 And a website for $99

Need more than a card? We build a five-page static site for $99 one-time, then $10/month with domain and hosting included, in collaboration with SocialDada.

What next

Everything above is live right now. Tell us what is missing — the roadmap is written by the people using it.`;

const EXCERPT =
  "Premium cards, country-code phone fields, live desi radio and TV, GoDesi Elite, the points system, a global chat room and ticketing — the full behind-the-scenes tour, with screenshots.";

async function main() {
  const existing = await db.blogPost.findFirst({ where: { title: TITLE } });
  const data = {
    title: TITLE,
    excerpt: EXCERPT,
    body: BODY,
    coverUrl: "/blog/whatsnew-home.png",
    kind: "UPDATE" as const,
    tags: ["whats-new", "product", "live-media", "points", "elite"],
    published: true,
  };

  if (existing) {
    await db.blogPost.update({ where: { id: existing.id }, data });
    console.log("updated", existing.slug);
  } else {
    const slug = await uniqueBlogSlug(TITLE);
    await db.blogPost.create({ data: { ...data, slug, publishedAt: new Date() } });
    console.log("created", slug);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
