/**
 * Adds NJ/NY temples, gurdwaras, churches, restaurants and a few service
 * businesses that an old desi directory lists but GoDesi did not have. Each
 * row was confirmed and its details taken from the place's own website or its
 * OpenStreetMap entry; nothing is copied from the directory itself. Rows go
 * into the admin call list (Prospect), not onto public cards.
 *
 *   DATABASE_URL=... npx tsx scripts/import-nynj-checklist-prospects.ts
 */
import { db } from "@/lib/db";
import { subcategorySlug } from "@/lib/categories";

type Place = {
  name: string;
  category: string;
  trade: string;
  sub?: string;
  url: string;
  website?: string;
  city?: string;
  state: string;
  address?: string;
  phone?: string;
  email?: string;
};

const osm = (id: string) =>
  `https://www.openstreetmap.org/${id[0] === "n" ? "node" : "way"}/${id.slice(1)}`;

const PLACES: Place[] = [
  // Temples & gurdwaras
  {
    name: "Shree Dwarkadhish Temple",
    category: "religious-services",
    trade: "Temples & Trusts",
    sub: "Temples & Trusts",
    url: "http://www.dwarkadhishtemple.org/",
    city: "Parlin",
    state: "NJ",
  },
  {
    name: "ISSSV Shree Swaminarayan Temple",
    category: "religious-services",
    trade: "Temples & Trusts",
    sub: "Temples & Trusts",
    url: "https://www.iswaminarayan.org/",
    city: "Somerset",
    state: "NJ",
    phone: "732-873-8000",
  },
  {
    name: "Sri Venkateswara Temple",
    category: "religious-services",
    trade: "Temples & Trusts",
    sub: "Temples & Trusts",
    url: osm("w606852548"),
    city: "Bridgewater",
    state: "NJ",
    address: "1 Balaji Temple Drive",
  },
  {
    name: "Gayatri Chetna Center",
    category: "religious-services",
    trade: "Temples & Trusts",
    sub: "Temples & Trusts",
    url: osm("w204460669"),
    city: "Piscataway",
    state: "NJ",
    address: "240 Centennial Avenue",
  },
  {
    name: "The Singh Sabha Gurudwara",
    category: "religious-services",
    trade: "Temples & Trusts",
    sub: "Temples & Trusts",
    url: "http://www.thesinghsabha.org/",
    city: "Carteret",
    state: "NJ",
    phone: "732-541-4411",
    email: "thesinghsabha@gmail.com",
  },
  {
    name: "Shri Surya Narayan Mandir",
    category: "religious-services",
    trade: "Temples & Trusts",
    sub: "Temples & Trusts",
    url: "http://www.shrisuryanarayanmandir.org/",
    city: "Queens",
    state: "NY",
  },
  {
    name: "Staten Island Hindu Temple (Shree Ram Mandir)",
    category: "religious-services",
    trade: "Temples & Trusts",
    sub: "Temples & Trusts",
    url: "http://www.sihindutemple.com/",
    website: "http://www.sihindutemple.com/",
    city: "Staten Island",
    state: "NY",
    address: "1318 Victory Boulevard",
  },
  {
    name: "Sri Maha Vallabha Ganapati Devasthanam (Ganesh Temple)",
    category: "religious-services",
    trade: "Temples & Trusts",
    sub: "Temples & Trusts",
    url: "https://nyganeshtemple.org/",
    city: "Flushing",
    state: "NY",
    phone: "718-460-8484",
  },
  {
    name: "Hindu Temple of Rochester",
    category: "religious-services",
    trade: "Temples & Trusts",
    sub: "Temples & Trusts",
    url: "https://hindutempleofrochester.com/",
    city: "Pittsford",
    state: "NY",
    address: "120 Pinnacle Road",
    phone: "585-427-8091",
  },
  {
    name: "Hindu Cultural Society of Western NY",
    category: "religious-services",
    trade: "Temples & Trusts",
    sub: "Temples & Trusts",
    url: "http://www.hcswny.org/",
    state: "NY",
  },
  {
    name: "Sikh Center of New York",
    category: "religious-services",
    trade: "Temples & Trusts",
    sub: "Temples & Trusts",
    url: osm("w284556330"),
    city: "Flushing",
    state: "NY",
    address: "38-17 Parsons Boulevard",
  },
  {
    name: "Guru Gobind Singh Sikh Center",
    category: "religious-services",
    trade: "Temples & Trusts",
    sub: "Temples & Trusts",
    url: osm("w555023920"),
    city: "Plainview",
    state: "NY",
    address: "1065 Old Country Road",
  },
  // Churches
  {
    name: "Love of Jesus Indian Church",
    category: "community-orgs",
    trade: "Indian church",
    url: "https://lojindianchurch.com/",
    city: "Edison",
    state: "NJ",
    email: "mosesten@yahoo.com",
  },
  {
    name: "St. Mary's Indian Orthodox Church of Rockland",
    category: "community-orgs",
    trade: "Indian church",
    url: "https://stmarysrockland.org/",
    city: "Suffern",
    state: "NY",
    email: "secretary@stmarysrockland.org",
  },
  {
    name: "India Pentecostal Church (IPC) Rockland",
    category: "community-orgs",
    trade: "Indian church",
    url: "https://www.ipcrockland.com/",
    city: "Nyack",
    state: "NY",
  },
  {
    name: "Bethlehem Punjabi Church",
    category: "community-orgs",
    trade: "Indian church",
    url: "http://www.bethlehempunjabichurch.com/",
    city: "Richmond Hill",
    state: "NY",
    address: "87-47 111th Street",
  },
  // Restaurants
  {
    name: "Udipi Cafe",
    category: "food-catering",
    trade: "Restaurants",
    sub: "Restaurants",
    url: "http://www.udipicafe.com/",
    city: "Parsippany",
    state: "NJ",
  },
  {
    name: "Pongal",
    category: "food-catering",
    trade: "Restaurants",
    sub: "Restaurants",
    url: "https://www.pongalnyc.com/",
    city: "New York",
    state: "NY",
    phone: "833-317-5095",
    email: "info@pongalnyc.com",
  },
  {
    name: "La'zeez Restaurant",
    category: "food-catering",
    trade: "Restaurants",
    sub: "Restaurants",
    url: "https://lazeezrestaurant.wixsite.com/lazeez",
    city: "Albany",
    state: "NY",
    email: "lazeezrestaurant@gmail.com",
  },
  {
    name: "Chola Coastal Indian Cuisine",
    category: "food-catering",
    trade: "Restaurants",
    sub: "Restaurants",
    url: osm("n10982332452"),
    city: "New York",
    state: "NY",
    address: "232 East 58th Street",
  },
  {
    name: "Kismat Indian Restaurant",
    category: "food-catering",
    trade: "Restaurants",
    sub: "Restaurants",
    url: osm("n5415839909"),
    city: "New York",
    state: "NY",
    address: "603 Fort Washington Avenue",
  },
  {
    name: "Diwan",
    category: "food-catering",
    trade: "Restaurants",
    sub: "Restaurants",
    url: osm("w769678462"),
    city: "Port Washington",
    state: "NY",
    address: "37 Shore Road",
  },
  {
    name: "Joy Indian Restaurant",
    category: "food-catering",
    trade: "Restaurants",
    sub: "Restaurants",
    url: osm("n2701913638"),
    city: "Brooklyn",
    state: "NY",
    address: "Prospect Place",
  },
  // Beauty, mehndi, dance
  {
    name: "ARC Beauty Salon",
    category: "beauty-lifestyle",
    trade: "Salons & Parlours",
    sub: "Salons & Parlours",
    url: "https://www.arcbeautysalon.com/",
    city: "Fair Lawn",
    state: "NJ",
  },
  {
    name: "Hayat Gul Henna",
    category: "beauty-lifestyle",
    trade: "Mehndi Artists",
    sub: "Mehndi Artists",
    url: "http://www.hayatgul.com/",
    city: "Wayne",
    state: "NJ",
    email: "hayatgul48@gmail.com",
  },
  {
    name: "Kalamandir Dance Company",
    category: "education",
    trade: "Dance Classes",
    sub: "Dance Classes",
    url: "https://www.kalamandirdanceco.com/",
    state: "NJ",
  },
  {
    name: "The Kathak Ensemble & Friends",
    category: "education",
    trade: "Dance Classes",
    sub: "Dance Classes",
    url: "https://kathakensemble.com/",
    city: "New York",
    state: "NY",
    email: "info@kathakensemble.com",
  },
];

async function main() {
  let created = 0;
  for (const p of PLACES) {
    const taken = await db.prospect.findFirst({
      where: {
        OR: [
          { sourceUrl: p.url },
          { name: { equals: p.name, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });
    const listed = await db.business.findFirst({
      where: { name: { equals: p.name, mode: "insensitive" } },
      select: { id: true },
    });
    if (taken || listed) continue;
    const ownSite =
      p.website ?? (p.url.includes("openstreetmap.org") ? null : p.url);
    await db.prospect.create({
      data: {
        name: p.name,
        trade: p.trade,
        categorySlug: p.category,
        subcategorySlug: p.sub ? subcategorySlug(p.category, p.sub) : null,
        city: p.city ?? null,
        state: p.state,
        address: p.address ?? null,
        phone: p.phone ?? null,
        email: p.email ?? null,
        websiteUrl: ownSite,
        sourceUrl: p.url,
        source: new URL(p.url).hostname.replace(/^www\./, ""),
      },
    });
    created += 1;
  }
  console.log(
    `Created ${created} prospects (${PLACES.length - created} already on GoDesi).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
