/**
 * Loads Indian-American newspapers and desi classifieds sites into the admin
 * call list (Prospect, categorySlug "media-partner") so the partnership pitch
 * shows when a moderator opens the row.
 *
 *   DATABASE_URL=... npx tsx scripts/import-media-prospects.ts
 */
import { db } from "@/lib/db";

const PAPERS: { name: string; focus: string; url: string }[] = [
  { name: "News India Times", focus: "National Indian-American news", url: "https://newsindiatimes.com" },
  { name: "Desi Talk", focus: "NY/NJ/CT + Chicago edition", url: "https://www.desitalk.com" },
  { name: "India Tribune", focus: "Chicago-based Indian-American newspaper", url: "https://www.indiatribune.com" },
  { name: "India-West", focus: "West Coast Indian-American news", url: "https://www.indiawest.com" },
  { name: "India Journal", focus: "Southern California", url: "https://www.indiajournal.com" },
  { name: "The Indian Panorama", focus: "New York & Dallas; news and classifieds", url: "https://www.theindianpanorama.news" },
  { name: "India Currents", focus: "Journalism & community issues", url: "https://indiacurrents.com" },
  { name: "India New England", focus: "New England Indian-American community", url: "https://indianewengland.com" },
  { name: "Khabar", focus: "Atlanta & the Southeast", url: "https://www.khabar.com" },
  { name: "Desh-Videsh", focus: "Florida & the broader diaspora", url: "https://www.deshvidesh.com" },
  { name: "Khaas Baat", focus: "Florida Indian community", url: "https://www.khaasbaat.com" },
  { name: "The South Asian Times", focus: "New York metropolitan area", url: "https://thesouthasiantimes.info" },
  { name: "India Herald", focus: "Houston-area Indian community", url: "https://india-herald.com" },
  { name: "India Post", focus: "News & community coverage", url: "https://www.indiapost.com" },
  { name: "Indus Business Journal", focus: "Business & professional community", url: "https://www.indusbusinessjournal.com" },
  { name: "The Asian Era", focus: "Tri-state & Indian diaspora", url: "https://www.asianeraonline.com" },
  { name: "Panjab Express", focus: "Punjabi-language & English news", url: "https://www.panjabexpress.com" },
  { name: "India Bulletin", focus: "Chicago-area South Asian community", url: "https://www.indiabulletinusa.com" },
  { name: "India Life & Style", focus: "Indian-American lifestyle", url: "https://www.indianlifeandstyle.com" },
  { name: "Gujarati Samachar", focus: "Gujarati community in the USA", url: "https://www.gujaratsamachar.com" },
  { name: "Sandesh", focus: "Gujarati-language readership", url: "https://www.sandesh.com" },
  { name: "Telugu Naadi", focus: "Telugu-speaking diaspora", url: "https://www.telugunaadi.com" },
  { name: "India Abroad", focus: "Long-running diaspora newspaper — verify it still publishes", url: "https://www.indiaabroad.com" },
  { name: "Little India", focus: "Diaspora news, features & community", url: "https://www.littleindia.com" },
  { name: "Sulekha US", focus: "Desi classifieds — rentals, jobs, services", url: "https://us.sulekha.com" },
  { name: "ApnaUSA", focus: "Desi classifieds — rooms, jobs, events", url: "https://apnausa.co" },
  { name: "eKnazar", focus: "City-based desi classifieds", url: "https://www.eknazar.com/ekClassifieds/" },
];

async function main() {
  let created = 0;
  for (const p of PAPERS) {
    const existing = await db.prospect.findUnique({
      where: { sourceUrl: p.url },
      select: { id: true },
    });
    if (existing) continue;
    await db.prospect.create({
      data: {
        name: p.name,
        trade: "Newspaper / media partner",
        categorySlug: "media-partner",
        websiteUrl: p.url,
        sourceUrl: p.url,
        source: "media-list",
        draftAbout: `${p.name} — ${p.focus}. Potential advertising/referral partner: advertisers carry a free GoDesi listing alongside print ads; the paper earns a referral fee on paid plans.`,
      },
    });
    created += 1;
  }
  console.log(`Created ${created} media prospects (${PAPERS.length - created} already existed).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
