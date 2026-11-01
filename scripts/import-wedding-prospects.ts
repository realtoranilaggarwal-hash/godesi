/**
 * Loads NJ/NY desi wedding vendors into the admin call list (Prospect, category
 * "events-wedding") so moderators can ring them and publish a starter card.
 * Every row is read from the vendor's own website (or, where noted, its public
 * marketplace page); only names and published contact facts travel.
 *
 *   DATABASE_URL=... npx tsx scripts/import-wedding-prospects.ts
 */
import { db } from "@/lib/db";
import { subcategorySlug } from "@/lib/categories";
import { WEDDING_SLUG } from "@/lib/wedding";

type Vendor = {
  name: string;
  trade: string;
  url: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
};

const VENDORS: Vendor[] = [
  // Mehndi
  { name: "Rita Shah Mehndi Artist", trade: "Mehndi Artists", url: "https://www.ritashahmehndiartist.com/", city: "Lyndhurst", state: "NJ", phone: "732-570-6706", email: "ritashahmehndiartist@gmail.com" },
  { name: "Raida Henna", trade: "Mehndi Artists", url: "https://raidahenna.com/", city: "Wayne", state: "NJ", phone: "973-389-6217", email: "raidahenna@gmail.com" },
  { name: "Rup's Art by Rupal Patel", trade: "Mehndi Artists", url: "https://www.rupsart.com/", state: "NJ", phone: "732-710-7972", email: "rupsartusa@gmail.com" },
  { name: "Henna by Tanvi", trade: "Mehndi Artists", url: "https://hennabytanvi.com/", state: "NJ", phone: "973-706-6806", email: "hennabytanvi@gmail.com" },
  { name: "Henna by Ash NJ", trade: "Mehndi Artists", url: "https://www.hennabyashnj.com/", state: "NJ" },
  // Decor & mandap
  { name: "Tradition & Trends", trade: "Mandap Setup", url: "https://www.traditionandtrends.com/", city: "South Plainfield", state: "NJ", phone: "862-281-9575", email: "info@traditionandtrends.com" },
  { name: "Dream Maker Events & Decors", trade: "Decorators & Florists", url: "https://dmdecors.com/", city: "Cranbury", state: "NJ", phone: "732-329-2546", email: "info@dmdecors.com" },
  { name: "Mandap Milap", trade: "Mandap Setup", url: "https://mandapmilap.com/", city: "Edison", state: "NJ", phone: "732-405-1371", email: "mandapmilap@gmail.com" },
  { name: "Nirali Decor", trade: "Decorators & Florists", url: "https://www.niralidecor.com/", city: "Middlesex", state: "NJ", phone: "609-703-5879", email: "niralidecor@gmail.com" },
  { name: "Daniela Events", trade: "Decorators & Florists", url: "https://danielaevents.com/", city: "Somerset", state: "NJ" },
  // Catering
  { name: "Akbar Restaurant & Catering", trade: "Caterers", url: "https://akbarrestaurant.com/catering/", city: "Edison", state: "NJ", phone: "732-632-8822", email: "akbarrestaurant@yahoo.com" },
  { name: "Moghul Caterers", trade: "Caterers", url: "https://www.moghulcatering.com/", city: "Edison", state: "NJ", phone: "732-549-7976", email: "info@moghulcatering.com" },
  { name: "Mejwaani Catering", trade: "Caterers", url: "https://www.mejwaanicatering.com/", city: "Edison", state: "NJ", phone: "908-279-7460", email: "info@mejwaani.com" },
  { name: "Pakvaan Desi Spice", trade: "Caterers", url: "https://www.pakvaandesispice.com/catering.html", city: "Edison", state: "NJ", phone: "732-767-1263", email: "support@pakvaandesispice.com" },
  { name: "Bawarchi Biryani Edison", trade: "Caterers", url: "https://www.bawarchiedison.com/", city: "Edison", state: "NJ", phone: "732-243-9777", email: "info.edison@bawarchibiryanipoint.com" },
  // Photo & video
  { name: "DesiLens Photo & Film", trade: "Photographers", url: "https://indian-photographers.com/", state: "NY", phone: "917-304-9878" },
  { name: "Shrey Patel Photography", trade: "Photographers", url: "https://shreypatelphotography.com/", state: "NJ", phone: "201-688-6442", email: "info.shreypatelphotography@gmail.com" },
  { name: "Surya Garigipati Photography & Films", trade: "Photographers", url: "https://www.suryagarigipati.com/", city: "Flemington", state: "NJ" },
  { name: "Twin Production", trade: "Videographers", url: "https://www.twinproduction.com/", city: "Warren", state: "NJ", phone: "908-903-0722", email: "twin@twinproduction.com" },
  { name: "Virdee Films", trade: "Videographers", url: "https://www.virdeefilms.com/", state: "NJ", phone: "732-444-2211", email: "info@virdeefilms.com" },
  { name: "Atèpá Media", trade: "Photographers", url: "https://www.atepamedia.com/", city: "Bronx", state: "NY", phone: "929-992-8372", email: "atepamedia@gmail.com" },
  { name: "The World is Rich Productions", trade: "Videographers", url: "https://www.theworldisrich.com/", city: "Queens", state: "NY", phone: "929-224-4714", email: "info@theworldisrich.com" },
  // Makeup
  { name: "Aisha Rizvi Artistry", trade: "Makeup Artists", url: "https://aisharizvimakeup.com/", city: "Edison", state: "NJ", phone: "631-408-1708", email: "hello@aisharizvimakeup.com" },
  { name: "Shikha The Makeup Artist", trade: "Makeup Artists", url: "https://shikhathemakeupartist.com/", state: "NJ", phone: "646-732-0065" },
  { name: "Divine Beauty by Vaishali", trade: "Makeup Artists", url: "https://divinebeautybyvaishali.com/", state: "NJ", phone: "646-239-9123" },
  { name: "BEAUTbyFAR", trade: "Makeup Artists", url: "https://www.beautbyfar.com/", city: "Union", state: "NJ" },
  // DJ & dhol
  { name: "DJ Raj", trade: "DJ & Sound", url: "https://djraj.com/", state: "NJ", phone: "201-723-7702" },
  { name: "Mehak Events & Entertainment", trade: "DJ & Sound", url: "https://newjerseyeventservices.com/", state: "NJ" },
  { name: "DJ Mehul", trade: "DJ & Sound", url: "https://www.djmehul.com/", state: "NJ" },
  { name: "Desi Decibel", trade: "Dhol & Baraat", url: "https://desidecibel.com/", city: "Newark", state: "NJ", phone: "407-789-0555", email: "info@desidecibel.com" },
  // Pandits
  { name: "Pandit Joshi — Hindu Priest", trade: "Pandits", url: "https://hindupriestus.com/", city: "Iselin", state: "NJ", phone: "973-779-3023", email: "yjoshi1@yahoo.com" },
  { name: "Priest Yogeshbhai Joshi", trade: "Pandits", url: "https://www.weddingindianpriest.com/", city: "Iselin", state: "NJ", phone: "201-699-9820", email: "j56yogesh@gmail.com" },
  { name: "Indian Priest NJ", trade: "Pandits", url: "http://www.indianpriestnj.com/", state: "NJ", phone: "973-778-3117" },
  { name: "Dinesh Jani — Hindu Priest", trade: "Pandits", url: "https://dineshjani.com/", city: "Hillsborough", state: "NJ" },
  { name: "Priest for Hindu Wedding (Srinivas Chambakur Bhatter)", trade: "Pandits", url: "https://priestforhinduwedding.com/", state: "NJ" },
  // Venues
  { name: "Deewan Banquet", trade: "Banquet Halls & Venues", url: "https://www.deewanbanquet.com/", city: "Piscataway", state: "NJ", phone: "732-968-7000", email: "sales@deewanbanquet.com" },
  { name: "Indian Cultural Center of South Jersey", trade: "Banquet Halls & Venues", url: "https://www.iccofsj.org/rental/banquet-hall", city: "Marlton", state: "NJ", phone: "855-422-6375", email: "info@iccofsj.org" },
  { name: "The Grove", trade: "Banquet Halls & Venues", url: "https://www.thegrovenj.com/", city: "Cedar Grove", state: "NJ", phone: "973-239-0270" },
  { name: "Moghul Ballroom", trade: "Banquet Halls & Venues", url: "https://www.moghulballroom.com/", state: "NJ", phone: "732-947-3000", email: "info@moghulballroom.com" },
  { name: "The Grove at Centerton", trade: "Banquet Halls & Venues", url: "https://groveatcenterton.com/", state: "NJ", phone: "856-358-3325", email: "info@thegroveevents.com" },
  // Turban tying & saree draping
  { name: "Saffas for Weddings", trade: "Saree Draping & Pagri Tying", url: "https://www.theknot.com/marketplace/saffas-for-weddings-mount-holly-nj-2060353", city: "Mount Holly", state: "NJ" },
  { name: "NJ Saree Drapist", trade: "Saree Draping & Pagri Tying", url: "https://njsareedrapist.com/", state: "NJ", email: "njsareedrapist@gmail.com" },
  { name: "Sunita Saree Draping Services", trade: "Saree Draping & Pagri Tying", url: "https://sunitasareedraping.com/", city: "Milltown", state: "NJ", phone: "218-277-7773", email: "sunitasareedrapingservices@gmail.com" },
  // Planners
  { name: "Tum Hi Ho Events", trade: "Wedding Planners", url: "https://www.tumhihoevents.com/", city: "Edison", state: "NJ", email: "info@tumhihoevents.com" },
  { name: "Marigold Wedding Planners", trade: "Wedding Planners", url: "https://marigoldweddingplanners.com/", city: "Hillsborough", state: "NJ", phone: "248-250-4066", email: "tina@marigoldwedding.com" },
  { name: "Vedika Creations", trade: "Wedding Planners", url: "https://www.vedikacreations.com/", city: "South Plainfield", state: "NJ", phone: "804-299-4608", email: "vedika.welcome@gmail.com" },
  { name: "Posh Wedding Planners", trade: "Wedding Planners", url: "https://www.poshweddingplanners.com/", state: "NJ" },
  { name: "Sapphire Events by Ujala", trade: "Wedding Planners", url: "https://www.sapphireeventsbyujala.com/", state: "NJ" },
];

async function main() {
  let created = 0;
  for (const v of VENDORS) {
    const existing = await db.prospect.findUnique({
      where: { sourceUrl: v.url },
      select: { id: true },
    });
    if (existing) continue;
    await db.prospect.create({
      data: {
        name: v.name,
        trade: v.trade,
        categorySlug: WEDDING_SLUG,
        subcategorySlug: subcategorySlug(WEDDING_SLUG, v.trade),
        city: v.city ?? null,
        state: v.state ?? null,
        phone: v.phone ?? null,
        email: v.email ?? null,
        websiteUrl: v.url,
        sourceUrl: v.url,
        source: new URL(v.url).hostname.replace(/^www\./, ""),
      },
    });
    created += 1;
  }
  console.log(`Created ${created} wedding prospects (${VENDORS.length - created} already existed).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
