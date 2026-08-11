import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/slug";

const db = new PrismaClient();

/** The "what's new on Godesi" history, published once and editable from /admin. */
const UPDATES: { title: string; excerpt: string; body: string; tags: string[] }[] = [
  {
    title: "Wedding services marketplace is live",
    excerpt:
      "Browse wedding vendors by service, city and budget, and post your requirement in a few taps.",
    body: `Planning a wedding on Godesi is now a single place instead of a dozen phone calls.

- Vendor cards with photos, packages, starting price, rating and city
- Grouped wedding categories: bridal & groom, photography, catering, entertainment, decor, venues, transport, religious and invitations
- Filters for city, service, budget and rating, with featured vendors on top
- WhatsApp button on every card so you reach the vendor directly
- Couples post a requirement with tick-boxes instead of typing, and "nothing decided yet" is a valid answer
- Only Premium vendors can unlock contact details, so your phone number is not passed around`,
    tags: ["wedding", "marketplace"],
  },
  {
    title: "Trust & safety: report an issue, hire safely, buy and sell safely",
    excerpt:
      "A safety guide, a report form that reaches us directly, and housing notices on every housing page.",
    body: `We added the safety layer that a community marketplace needs.

- /safety covers eight checks before you hire and a full safe buying & selling guide: verify the seller, payment safety, meet in public, test items, check documents and red flags
- /report takes your name, email, the vendor or listing, the issue type, a description and a screenshot, and it comes straight to us
- A "Need help?" box sits in the sidebar of listing, vendor and marketplace pages
- Fair Housing Notice and the Room & Shared Housing Disclaimer appear on every housing surface and in Terms
- Godesi is not a party to your transaction, but we review complaints and act on them`,
    tags: ["safety", "trust"],
  },
  {
    title: "Professional profiles for attorneys, agents, astrologers and more",
    excerpt:
      "Pick your subcategory and the right credential fields appear — specialisations, licences and certifications.",
    body: `One system now drives posting, filtering and the tags on cards for every profession.

- Attorneys: 15 legal service areas, at least one required
- Real Estate Agents: brokerage, licence number and type, MLS, specialisations, certifications and languages, all inline on the posting form
- Astrologers, Consultants, Insurance Agents and Financial Advisors: specialisations, certifications, fees or pricing model, and licence number where the law expects one
- The same checkboxes become the search filters on each category page
- Paid plans can highlight one "featured specialisation" badge
- Members must provide accurate credentials — we review complaints about false claims`,
    tags: ["professionals", "directory"],
  },
  {
    title: "Cars & Bikes listings that feel like a real vehicle marketplace",
    excerpt:
      "Dropdowns for make and model, mileage, fuel, ownership and condition, with matching filters.",
    body: `Selling a vehicle on Godesi now captures what buyers actually ask.

- Vehicle type, make, dependent model dropdown, year, mileage with unit, fuel, transmission, ownership, condition, price and a negotiable flag
- A 20-item features grid and document checks: registration, insurance, service history and accident history
- Cards show Year | Mileage | Fuel | Owner | Price at a glance
- The category page filters on year, mileage, price range and must-have features
- Individual sellers only see website, Instagram and Facebook instead of the full business social block`,
    tags: ["marketplace", "cars"],
  },
  {
    title: "Search everything from the header",
    excerpt:
      "One box that searches businesses, events, listings, temples, requirements and resources at once.",
    body: `A search box now sits in the header on every page and lands on /find.

It searches businesses and professionals including their specialisations, so "photographer" returns wedding photographers, event photographers and freelancers together, plus events, property, rooms and items, temples, open requirements, categories and recommended links. Results are grouped by type with an optional city filter.

We built it in-house rather than using Google so brand new listings and every filter are included instantly.`,
    tags: ["search"],
  },
  {
    title: "Events module: modes, speakers and agendas",
    excerpt:
      "Post conferences, workshops, melas and satsangs with speakers, a multi-session agenda and tickets.",
    body: `The event form grew up.

- Event type, mode (offline, online or hybrid, with a join link) and frequency (one-time or recurring)
- Mandatory city, state and country, plus tags and capacity
- Dynamic category and subcategory, and tick-boxes to list the event under other categories too
- Repeatable speakers with name, photo and bio
- A repeatable agenda with session, stage or room, speaker and times
- Free and paid tickets with ticket tiers as before`,
    tags: ["events"],
  },
  {
    title: "Refer & earn, coupons and points",
    excerpt: "Share Godesi, collect points and spend them on things you would otherwise pay for.",
    body: `Points are Godesi credit, not cash.

- Earn: +10 when someone signs up on your link, +20 when they complete a profile, +15 per listing they post, +100 if they upgrade, plus points for your own profile, listings and upgrade
- Spend: featured listing 300, homepage event promotion 250, a month of Pro 400, a 300x250 banner for a month 500
- Nothing expires; duplicate or fake signups are reversed
- /pricing shows the "don't want to pay? earn it instead" route for every paid feature`,
    tags: ["rewards", "pricing"],
  },
  {
    title: "About.me-style personal profiles",
    excerpt:
      "A public page at godesi.com/yourname with your story, education, videos, socials and everything you post.",
    body: `Your personal profile is now a proper page.

- Headline, what you do and what you are looking for, with an "open to work" badge
- Education, work and achievements, skills, interests and languages
- Up to three YouTube or Vimeo videos that play on the page
- Twelve social links and an optional WhatsApp button
- Your business card, listings, events, requirements and reviews appear automatically`,
    tags: ["profiles"],
  },
  {
    title: "Resources tag cloud and category news feeds",
    excerpt:
      "Browse recommended links by tag, and pull any category's newest items into your own site by RSS.",
    body: `Two small things that make Godesi easier to share.

- /resources has a sticky tag cloud — the bigger the chip, the more items behind it — and each tag opens a filtered page showing matching links and matching events, with a one-line description beside every link
- Every category page shows five latest news headlines and offers an RSS feed you can syndicate anywhere, and this blog has one at /blog/rss.xml`,
    tags: ["resources", "rss"],
  },
];

async function main() {
  for (const update of UPDATES) {
    const slug = slugify(update.title).slice(0, 70);
    await db.blogPost.upsert({
      where: { slug },
      create: { ...update, slug, kind: "UPDATE" },
      update: {},
    });
  }
  console.log(`Seeded ${UPDATES.length} product updates.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
