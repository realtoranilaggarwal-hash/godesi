/**
 * Publishes three original wedding guides on the GoDesi blog: two for families
 * planning a desi wedding, one for the vendors we want to list. Re-runnable —
 * an existing slug is left as it is.
 *
 *   DATABASE_URL=... npx tsx scripts/post-wedding-guides.ts
 */
import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/slug";

const db = new PrismaClient();
const AUTHOR_ID = "cms24edsq0000t9gk48f24h5h";

const GUIDES: { title: string; excerpt: string; body: string; tags: string[] }[] = [
  {
    title: "How to budget a desi wedding in New Jersey",
    excerpt:
      "Where the money goes in a multi-day desi wedding, what makes each line go up or down, and how to get real quotes before you commit.",
    body: `A desi wedding in New Jersey is rarely one event. Most families plan a mehndi or sangeet, a garba or haldi, the ceremony and a reception — often across two or three days and two or three venues. That is why the budget feels hard to pin down. This guide breaks it into the parts vendors actually quote on.

1. Guest count drives almost everything
Venue, catering, chairs, centrepieces and even the photographer's hours scale with the number of guests. Fix a guest range for each event first; a 150-guest sangeet and a 400-guest reception are priced very differently.

2. The big four: venue, catering, decor, photo/video
For most families these four take the largest share of the budget. Banquet halls in Edison, Piscataway, Somerset and Old Bridge often bundle catering with the hall, so compare like for like: ask whether tax, service charge, bar and cake cutting are included.

3. The ceremony itself
The mandap, the pandit (or granthi, imam or officiant), the havan and puja samagri, and the baraat (dhol, horse or car) are usually quoted separately from the reception.

4. Bride and groom
Bridal and groom wear, jewellery, makeup and hair for each event, mehndi, saree draping and turban tying. Makeup artists usually price per event and per person, so count the family members who want it.

5. Entertainment
DJ and sound, dhol, lighting, LED walls, cold sparklers and a choreographer for sangeet performances. Ask for the overtime rate — desi receptions run late.

6. Everything else
Invitations, gifts and favours, guest transport and hotel blocks, valet, insurance and the vendor meals that venues charge per head.

How to get real numbers quickly
Instead of calling twenty vendors, post one requirement on GoDesi with your date, city, guest count and the services you need: https://godesi.com/wedding/requirements/new — matching wedding vendors near you are alerted and reply on WhatsApp. Your phone number stays hidden until you hear from them.

Browse vendors by service and city at https://godesi.com/wedding`,
    tags: ["wedding", "new-jersey", "budget"],
  },
  {
    title: "Desi wedding vendor checklist: who to book and when",
    excerpt:
      "A month-by-month checklist of the vendors a desi wedding needs, from the venue and pandit to mehndi, makeup and the baraat.",
    body: `Popular wedding dates in New Jersey and New York book out early, especially the autumn and spring weekends. Use this checklist to book the right vendors in the right order.

12 or more months before
- Venue or banquet hall (and the caterer, if the hall does not include one)
- Pandit, granthi or officiant — check the muhurat dates with them first
- Wedding planner or coordinator, if you want one

9 to 12 months before
- Photographer and videographer
- Decorator and mandap
- DJ, sound and lighting

6 to 9 months before
- Bridal and groom wear, jewellery
- Makeup and hair artists for each event
- Mehndi artist (bridal plus guests)
- Dhol and baraat: horse, car or carriage

3 to 6 months before
- Invitations or digital invites
- Choreographer for sangeet performances
- Guest transport and hotel blocks
- Saree draping and turban (safa) tying for the families

Last 2 months
- Confirm timings, arrival windows and overtime rates with every vendor
- Share one run-of-show with the planner, DJ, photographer and venue

Find vendors for every line of this list in one place: https://godesi.com/wedding — or post your wedding requirement once and let the vendors come to you: https://godesi.com/wedding/requirements/new`,
    tags: ["wedding", "checklist", "vendors"],
  },
  {
    title: "Wedding vendors: how to get more bookings from desi families",
    excerpt:
      "Why families search differently for desi wedding vendors, and five free things a mehndi artist, decorator, DJ or caterer can do this month to get more enquiries.",
    body: `Desi families do not pick wedding vendors the way a single couple picks a photographer. Parents, aunties and cousins all weigh in, recommendations travel on WhatsApp groups, and the same family books five or six events in one season. Vendors who are easy to find and easy to message win those bookings.

1. Be findable by service and town
Families search for "mehndi artist Edison" or "mandap decorator NJ", not your business name. List the exact services you offer and the towns you travel to.

2. Show prices, or at least a starting price
"Packages from" or "custom quote" saves everyone a call and brings in the families who fit your range.

3. Make WhatsApp the first button
Most desi families would rather send a WhatsApp message than fill in a contact form.

4. Post real work, not stock photos
Recent events, with the venue named, build trust faster than anything you can write.

5. Ask happy families for a review the week after the wedding
That is when they are most likely to say yes.

List your wedding business free on GoDesi
GoDesi.com is the free community directory desi families use to plan weddings and events. Families post wedding requirements with their date, city, guest count and services, and matching vendors get an alert straight away. The first 50 wedding vendors get Premium free for 6 months, and vendors who refer 3 other wedding vendors get a month of Premium free.

Join here: https://godesi.com/wedding/vendors`,
    tags: ["wedding", "vendors", "marketing"],
  },
];

async function main() {
  const author = await db.user.findUnique({ where: { id: AUTHOR_ID }, select: { id: true } });
  for (const guide of GUIDES) {
    const slug = slugify(guide.title).slice(0, 70);
    await db.blogPost.upsert({
      where: { slug },
      create: { ...guide, slug, kind: "POST", authorId: author?.id ?? null },
      update: {},
    });
    console.log(`https://godesi.com/blog/${slug}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
