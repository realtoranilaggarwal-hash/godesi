import { db } from "../src/lib/db";
import { slugify } from "../src/lib/slug";

/**
 * Writes the "What's new" posts that tell a visitor what GoDesi actually does.
 * They appear on /blog, in the blog RSS feed and on the #godesi wall, so
 * somebody landing on the home page can scroll and learn the site.
 *
 *   npm run db:updates
 *
 * Re-runnable: a post is keyed by its slug, and one that already exists is
 * refreshed rather than duplicated.
 */

type Update = {
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
};

const UPDATES: Update[] = [
  {
    title: "Your business card on GoDesi, free",
    excerpt:
      "A free page for your business with photos, hours, WhatsApp button, QR code and reviews.",
    body: [
      "Every business on GoDesi gets its own page: what you do, where you are, your hours, your photos, your packages and a WhatsApp button people can tap.",
      "Each card comes with a QR code you can print for your counter, and a “Verified on GoDesi” badge you can put on your own website.",
      "Listing is free. Search for your business first — if we already listed it from public record, you can claim it instead of typing it again.",
      "Start at /listings/new, or browse the directory at /search.",
    ].join("\n\n"),
    tags: ["business cards", "free listing"],
  },
  {
    title: "Post what you need and let businesses quote you",
    excerpt:
      "Say what you want — a caterer, a realtor, a tutor — and desi businesses come back with quotes.",
    body: [
      "Instead of ringing ten shops, post the requirement once: what you need, where, when and roughly what you want to spend.",
      "Businesses in that trade see it and respond. You pick who to talk to, and your phone number is never shown publicly.",
      "Budgets are in your own currency — dollars in America, rupees in India, pounds, euros, dirhams and more.",
      "Post one at /leads/new.",
    ].join("\n\n"),
    tags: ["requirements", "quotes"],
  },
  {
    title: "Events with real categories, languages and timings",
    excerpt:
      "Garba, Bollywood nights, concerts, temple programmes and expos — filtered by category, language, state and venue.",
    body: [
      "An event on GoDesi carries its own categories (up to six) and its language, so a Navratri show can be Garba, Bollywood and Food at once.",
      "You can filter by category, language, event type, state, city and venue, and every event shows its time in the venue's own timezone — Eastern events in Eastern, an India event in IST.",
      "Every upcoming event has an “Add to calendar” row: Apple/Outlook .ics, Google Calendar and Outlook.com, carrying the correct time.",
      "See what's on at /events, or list yours free at /events/new.",
    ].join("\n\n"),
    tags: ["events", "calendar"],
  },
  {
    title: "Wedding services, broken down the way weddings actually work",
    excerpt:
      "55 wedding services from mandap decorators to saree draping, with vendor counts and a quote request.",
    body: [
      "The wedding section lists each service separately — venues, caterers, decorators, priests, mehndi artists, hair and makeup, saree draping and pagri tying, DJs and bands, photographers, videographers, cakes, bartending, valet, photo booths, live streaming, honeymoon travel and more.",
      "Each tile shows how many businesses are listed for it, and a bar at the top takes a city and a service and turns it into a quote request every matching vendor can answer.",
      "Browse it at /wedding.",
    ].join("\n\n"),
    tags: ["wedding"],
  },
  {
    title: "Homes for sale and rent, described for American buyers",
    excerpt:
      "Finished sq ft, lot size, full and half baths, HOA, taxes, school district, MLS number and open houses.",
    body: [
      "A property listing now asks what an American buyer or renter actually wants to know: property type, who is posting, finished square feet and lot size separately, full/half/three-quarter baths, year built, sale type, HOA or condo fee, property tax, deposit and maintenance for rentals, school district, MLS number and parking.",
      "Tick-boxes cover flooring, construction, amenities, utilities and selling points such as near transit, near a temple, desi groceries nearby, finished basement or solar.",
      "Open houses show on the card, and buyers can filter for sale type, minimum square feet, year built and those selling points at /real-estate.",
    ].join("\n\n"),
    tags: ["real estate"],
  },
  {
    title: "Rooms, roommates and things to buy or sell",
    excerpt: "Shared rooms, sublets and a classifieds board for the community.",
    body: [
      "Looking for a room near work, or a roommate who eats the same food? Rooms and roommate posts carry rent, deposit, furnishing and preferences.",
      "There is also a plain classifieds board for furniture, cars, gadgets and anything else the community buys and sells.",
      "Post at /listings/new and browse at /listings.",
    ].join("\n\n"),
    tags: ["rooms", "classifieds"],
  },
  {
    title: "909 desi associations and nonprofits, ready to be claimed",
    excerpt:
      "Regional and language associations, cultural groups, student and senior bodies, sports clubs and chambers of commerce.",
    body: [
      "The community section now lists hundreds of real desi organisations across more than forty states, compiled from the public register of tax-exempt bodies.",
      "Each card is free and unclaimed: the name, the town and the source, with nothing copied and no phone number published.",
      "If you run one, claim the card and add your programmes, photos, WhatsApp and membership details. Start at /categories/community-orgs.",
    ].join("\n\n"),
    tags: ["community", "nonprofits"],
  },
  {
    title: "Temples, gurdwaras, mosques and churches near you",
    excerpt: "Places of worship with their timings, festivals and programmes.",
    body: [
      "The worship directory lists places of worship with their address, timings and the programmes they run, and the temple calendars we follow push their events onto GoDesi automatically.",
      "Find one at /religious, and submit a missing place at /religious/new.",
    ].join("\n\n"),
    tags: ["temples", "religion"],
  },
  {
    title: "Desi news, filed by the community",
    excerpt:
      "Headlines, local reports from members and a live wall of what is happening on GoDesi.",
    body: [
      "The news wall carries desi headlines by topic — community, immigration, business, faith and India — and members can file their own local reports for review.",
      "The #godesi wall on the home page scrolls everything as it happens: new members, new cards, new listings, new events and fresh reports.",
      "Read it at /news.",
    ].join("\n\n"),
    tags: ["news"],
  },
  {
    title: "GoDesi Elite: recognition for desi leaders",
    excerpt:
      "Profiles of desi entrepreneurs, professionals and community leaders — including well-known names, unclaimed and waiting.",
    body: [
      "GoDesi Elite is the recognition directory: founders, professionals, doctors, lawyers, artists and community leaders, with an interview and video for members who want one.",
      "It now also carries profiles of well-known desi figures in America, written by us from public record and clearly marked unclaimed — no photograph or biography copied, no contact number published.",
      "If one of them is you, claim it and the page becomes yours to correct and complete. Apply or nominate someone at /desi-elite.",
    ].join("\n\n"),
    tags: ["elite"],
  },
  {
    title: "Radio, TV and the buzz wall",
    excerpt: "Desi radio and television channels, plus what the community is talking about.",
    body: [
      "Live desi radio and TV channels play through their own official players at /live, and members can suggest a station we are missing.",
      "The buzz wall at /buzz collects what the community is sharing right now.",
    ].join("\n\n"),
    tags: ["radio", "tv"],
  },
  {
    title: "Refer friends, earn points, spend them on GoDesi",
    excerpt: "Referrals, reward points and coupons for members and businesses.",
    body: [
      "Invite friends with your referral link and earn points when they join and use GoDesi; points go towards featured placement, banners and paid access.",
      "Businesses can publish coupons on their card, and advertisers can book banner slots by city and category.",
      "See your points at /rewards.",
    ].join("\n\n"),
    tags: ["referrals", "rewards"],
  },
];

/** The very first update post was written as a raw chat note; retire it. */
const RETIRE = /^Live on https?:\/\//i;

async function main() {
  let added = 0;
  let refreshed = 0;

  for (const update of UPDATES) {
    const slug = slugify(update.title);
    const existing = await db.blogPost.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing) {
      await db.blogPost.update({
        where: { id: existing.id },
        data: {
          title: update.title,
          excerpt: update.excerpt,
          body: update.body,
          tags: update.tags,
          kind: "UPDATE",
          published: true,
        },
      });
      refreshed += 1;
    } else {
      await db.blogPost.create({
        data: {
          slug,
          title: update.title,
          excerpt: update.excerpt,
          body: update.body,
          tags: update.tags,
          kind: "UPDATE",
          published: true,
        },
      });
      added += 1;
    }
  }

  const stale = await db.blogPost.findMany({
    where: { kind: "UPDATE", published: true },
    select: { id: true, title: true },
  });
  const retired = stale.filter((post) => RETIRE.test(post.title));
  if (retired.length) {
    await db.blogPost.updateMany({
      where: { id: { in: retired.map((post) => post.id) } },
      data: { published: false },
    });
  }

  console.log(
    `Updates: ${added} added, ${refreshed} refreshed, ${retired.length} retired.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
