/**
 * Service timings for US gurdwaras and NJ Hindu temples, from each place's own
 * website where it posts them, else public map listings (checked Nov 2026).
 * Run once: npx tsx scripts/worship-timings-more.ts
 */
import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/slug";

const db = new PrismaClient();

/** slug → [timings, official site the timings came from (optional)] */
const TIMES: Record<string, [string[], string?]> = {
  "nishkam-seva-gurdwara-sahib-glendale-az": [["Sunday: Sukhmani Sahib 10 AM, Kirtan Darbar 11:30 AM – 1 PM", "Wednesday Kirtan Darbar: 6:30 – 7:30 PM", "Friday Kirtan Darbar: 6:30 – 8:15 PM", "Daily: Prakash 5:30 AM, Sukhasan 7:30 PM"], "https://www.nishkamsevagurdwara.org/"],
  "sikh-temple-kern-county-ca": [["Open daily 4:30 AM – 8 PM"]],
  "sikh-gurudwara-of-sadh-sangat-norco-ca": [["Open daily from 6 AM, usually till 7 PM"], "https://norcogurdwara.org/"],
  "gurudwara-san-diego-poway-ca": [["Open daily 6:30 AM – 9 PM"]],
  "sikh-gurdwara-san-jose-san-jose-ca": [["Open daily 4 AM – 9 PM"]],
  "sikh-temple-stockton-ca": [["Open daily 5 AM – 8 PM", "Gatka class: Fridays 5:30 PM"]],
  "sikh-center-of-orange-county-santa-ana-ca": [["Sunday: Asa Ki Var 8 – 9:45 AM, Kirtan 12 – 12:45 PM, then Langar", "Daily: Prakash and Nitnem 6 AM, Rehras Sahib 6 PM"], "https://sikhcenteroc.org/"],
  "sikh-temple-stanislaus-county-ca": [["Open daily 7 AM – 8 PM"]],
  "denver-sikh-gurudwara-arapahoe-county-co": [["Sunday diwan: 9 AM – 2:30 PM", "Wednesday: 5:30 – 7:30 PM"], "http://www.denversikhgurudwara.org/"],
  "gurdwara-nanak-darbar-southington-ct": [["Sunday diwan: 10:30 AM – 1 PM", "Friday kirtan diwan: 6 – 8 PM", "Open daily 5 AM – 9 PM"]],
  "sikh-gurdwara-dc-washington-dc": [["Rehras Sahib with the sangat: 7 – 8:15 PM"]],
  "gurdwara-nanaksar-thath-isher-darbar-kissimmee-fl": [["Sunday diwan: 11 AM – 1 PM, then Langar", "Open daily 6 AM – 8 PM"], "https://www.gurdwarananaksarflorida.com/"],
  "sikh-gurdwara-of-tampa-bay-thonotosassa-fl": [["Sunday: Asa Di Vaar 11:10 AM, Kirtan 11:40 AM, Ardas 12:45 PM, Langar 1 – 2:30 PM"], "https://tampagurdwara.com/services/"],
  "guru-singh-sabha-of-augusta-evans-ga": [["Sunday: Sukhmani Sahib 10 AM, Kirtan 11:15 AM, Ardas 1:15 PM, Langar 1:30 PM", "Evening: Rehras Sahib 6:45 PM, Kirtan 7 – 8:15 PM", "Morning: Prakash 5:45 AM"], "https://gurusinghsabhaofaugusta.com/regular-programs/"],
  "sewa-gurdwara-sahib-roswell-ga": [["Sunday: Asa Ki Vaar 9:30 AM, Kirtan 11 AM – 12:20 PM, then Langar", "Evening: Rehraas Sahib 7:30 PM, Kirtan 8 – 8:45 PM, then Langar"], "https://www.sewageorgia.org/schedule/"],
  "sikh-religious-society-of-chicago-gurdwara-sahib-palatine-il": [["Daily: Nitnem 5 AM, Rehras Sahib 6 PM, Kirtan & Katha 6:40 – 8:20 PM"], "https://srschicago.org/"],
  "illinois-sikh-community-center-wheaton-il": [["Sunday diwan: 9 AM – 12:30 PM", "Wednesday diwan: 6:30 – 8 PM, then Langar", "Asa Ki Vaar: first Saturday 7 – 9 AM"], "https://ilscc.com/"],
  "dashmesh-gurudwara-fort-wayne-in": [["Open daily 5 AM – 8 PM", "Sunday: Langar 12 – 2 PM, Punjabi school 11:30 AM"]],
  "sikh-temple-of-bluegrass-lexington-ky": [["Open daily 7 AM – 6 PM"]],
  "westborough-gurdwara-sahib-nessc-westborough-ma": [["Sunday: Asa Di Var 8:30 – 10 AM, Katha 11:15 AM", "Evening: Rehras Sahib 6:30 PM, Kirtan, Ardas around 8 – 8:30 PM", "Open daily 6 AM – 9 PM"], "https://www.nessc.org/"],
  "baltimore-sikh-society-dundalk-md": [["Open daily 6 AM – 8 PM"]],
  "gurdwara-washington-sikh-center-laytonsville-md": [["Sunday diwan: 11:45 AM – 1:30 PM, Kirtan, Katha, Ardaas, then Langar", "Punjabi / Gurmat classes: Sundays from 10:30 AM"], "https://www.washingtonsikhcenter.org/visit.html"],
  "singh-sabha-temple-canton-mi": [["Open daily 6 AM – 9 PM", "Langar: Sunday 1 PM, around 7 PM other days"]],
  "sikh-gurdwara-rochester-hills-mi": [["Sunday: 8 AM – 12:15 PM", "Evening: 6:30 – 8 PM"], "https://www.sikhgurdwara.com/"],
  "gurdwara-sahib-sterling-heights-mi": [["Sunday: Asa Ki Var 10 AM, Kirtan 10:30 AM – 12:30 PM", "Daily: 6 – 7 AM and 6 – 7 PM", "Open 9 AM – 7:30 PM, 7 days"], "https://michigangurdwara.com/"],
  "sikh-society-of-minnesota-bloomington-mn": [["Sunday service: 9:30 AM – 1:30 PM", "Friday evening: Sukhmani Sahib 5 PM, Rehras 6:30 PM, Kirtan, Langar 8 PM"], "https://www.mnsikhs.com/visitors.html"],
  "gurdwara-baba-deep-singh-las-vegas-nv": [["Open daily 5:30 AM – 8:30 PM"]],
  "gurdwara-mata-sahib-kaur-glen-cove-ny": [["Open 5 AM – 9 PM (Friday–Sunday till 10 PM)"]],
  "gurudwara-mid-hudson-sikh-temple-hughsonville-ny": [["Open 7 AM – 7 PM (Sunday 6:30 AM – 7:30 PM)"]],
  "gurudwara-sahib-hudson-valley-sikh-society-middletown-ny": [["Open 5 AM – 8 PM (Sunday from 7 AM)"]],
  "guru-nanak-darbar-sikh-temple-niskayuna-ny": [["Sunday diwan: 8:30 AM – 1:15 PM", "Saturday: 6 – 8 PM", "Punjabi class: Sunday 11 AM – 12 PM"], "https://gurunanakdarbarofalbany.org/"],
  "gurdwara-sikh-temple-queens-ny": [["Open daily 3 AM – 9:30 PM"]],
  "gurudwara-guru-bhagati-ghar-queens-ny": [["Open daily 3:30 AM – 10:30 PM"]],
  "sikh-gurdwara-of-oklahoma-oklahoma-city-ok": [["Sunday: 10:30 AM – 1 PM"]],
  "guru-ram-das-gurdwara-eugene-or": [["Mon–Fri 8:30 AM – 4:30 PM, Saturday till 3:30 PM, Sunday 7 AM – 4:30 PM"]],
  "dasmesh-darbar-sikh-temple-salem-or": [["Sunday: Sukhmani Sahib, Kirtan 12 – 1:30 PM", "Daily: morning program 5 – 9 AM, Rehraas Sahib 6 – 8 PM", "Open 5 AM – 9 PM, 7 days"], "https://salemgurdwara.com/"],
  "philadelphia-sikh-society-upper-darby-pa": [["Sunday: Sukhmani Sahib 9:40 AM, Katha 11:50 AM, Kirtan, Ardaas 1:30 PM, then Langar", "Daily: morning program from 5:15 AM, evening 6 – 8 PM"], "https://www.philadelphiasikhsociety.com/"],
  "gurdwara-guru-nanak-darbar-jonestown-tx": [["Open every day 6 AM – 7 PM"], "https://austingurdwara.com/"],
  "sikh-center-of-san-antonio-san-antonio-tx": [["Open daily 5 AM – 8 PM"]],
  "sikh-temple-of-utah-taylorsville-ut": [["Open 7 AM – 1 PM and 3 – 7 PM (Sunday 7 AM – 3 PM, 4:30 – 7:30 PM)"]],
  "gurudwara-sacha-marag-auburn-wa": [["Open daily 5:30 AM – 8 PM"]],
  "singh-sabha-gurdwara-bellingham-bellingham-wa": [["Open daily 5 AM – 9 PM"]],
  "gurdwara-sri-guru-tegh-bahadur-sahib-ji-kent-wa": [["Open daily 4 AM – 9 PM"]],
  "guru-nanak-gursikh-gurudwara-lynden-wa": [["Open daily from 5 AM"]],
  "guru-nanak-sikh-temple-of-marysville-marysville-wa": [["Sunday diwan: 10 AM – 1 PM", "Thursday kirtan: 7 – 8:30 PM", "Daily: Nitnem 5 AM, Rehras 6 PM"], "https://wasikh.com/"],
  "gurudwara-singh-sabha-of-washington-renton-wa": [["Morning: Prakash 5 AM, Nitnem, Asa Ki Vaar, Kirtan & Katha 6 – 7:45 AM", "Evening: Rehraas Sahib 5:30 PM, Kirtan 6 PM, Katha 6:45 PM, Ardaas 7:30 PM"], "https://www.gsswa.org/"],
  "gurdwara-sahib-vancouver-wa": [["Open daily 6 AM – 9 PM"]],
  "gurudwara-shaibji-middleton-wi": [["Open daily 5 AM – 8:30 PM (Saturday till 9:30 PM)"]],
  "sikh-temple-of-wisconsin-oak-creek-wi": [["Open daily 6 AM – 9 PM"]],
  "hanuman-ji-temple-jersey-city": [["Evening Aarti: 7 – 7:30 PM", "Sunderkand Paath programs: 6 – 7:30 PM, then Maha Aarti and Mahaprasad"], "https://shrihanumantemplejc.org/"],
  "shree-siddhi-dham-mandir-jersey-city": [["Open 8 AM – 12:30 PM and 4:30 – 8:30 PM (weekends till 1 PM)"]],
  "govinda-sanskar-center-jersey-city": [["Mon–Fri: 9 AM – 12 PM and 4 – 7 PM", "Sat–Sun and festival days: 9 AM – 7 PM"], "https://govindatemple.org/"],
  "swaminarayan-mandir-vasna-sanstha-jersey-city": [["Open daily 6 AM – 12 PM and 4 – 8 PM", "Sunday sabha: 4 – 6 PM"], "https://smvs.org/centers/usa/north-america/jersey-city"],
};

const NJ_TEMPLES: { name: string; city: string; address?: string; websiteUrl: string; times: string[] }[] = [
  { name: "BAPS Shri Swaminarayan Mandir", city: "Edison", address: "2500 Woodbridge Ave", websiteUrl: "https://www.baps.org/Global-Network/North-America/Edison/Visitor-Info.aspx", times: ["Darshan: 7 – 11 AM and 4 – 8 PM", "Arti: 7 AM and 6:30 PM", "Mandir open 7 AM – 8 PM"] },
  { name: "BAPS Swaminarayan Akshardham", city: "Robbinsville", websiteUrl: "https://www.baps.org/Global-Network/North-America/Robbinsville/Visitor-Info.aspx", times: ["Mahamandir darshan: 9 AM – 7:30 PM", "Shayona Café: 11 AM – 8 PM", "The campus closes on some weekdays: check the website before you go"] },
  { name: "Sri Venkateswara Temple (HTCS)", city: "Bridgewater", websiteUrl: "https://www.venkateswaratemple.org/timings.htm", times: ["Mon–Fri: 8:30 AM – 12:30 PM and 4:30 – 8:30 PM", "Weekends and holidays: 8:30 AM – 8:30 PM"] },
  { name: "Sai Datta Peetham", city: "Edison", websiteUrl: "https://www.saidattanj.org/", times: ["Mon, Tue, Wed, Fri: 8 AM – 1 PM and 5 – 9 PM", "Thu, Sat, Sun and holidays: open all day"] },
  { name: "Guruvayurappan Temple", city: "Morganville", websiteUrl: "https://krishnatemple.org/", times: ["Weekdays: 8:30 – 11:30 AM and 4:30 – 8:30 PM", "Weekends: 8:30 AM – 8:30 PM"] },
  { name: "Shree Swaminarayan Temple Secaucus", city: "Secaucus", websiteUrl: "https://www.swaminarayangadi.com/newjersey", times: ["Weekdays: 6:30 – 11 AM and 4 – 9 PM", "Weekends: 6:30 AM – 12 PM and 2 – 9 PM", "Mangla Aarti 6:30 AM, Sandhya Aarti 6:30 – 7 PM"] },
  { name: "Shirdi Sai Parivaar", city: "Edison", websiteUrl: "https://shirdisaiparivaar.org/baba-darshan/", times: ["Baba darshan daily: 6:15 – 7:45 AM, 11:45 AM – 12:30 PM, 6 – 9 PM"] },
  { name: "Om Sri Sai Balaji Temple", city: "Monroe", websiteUrl: "https://omsrisaibalajitemple.org/", times: ["Mon–Fri: 8:30 – 11:30 AM and 4:30 – 8:30 PM", "Weekends and holidays: 8:30 AM – 8:30 PM"] },
  { name: "Shri Krishna Vrundavana", city: "Edison", websiteUrl: "https://krishnavrunda.org/", times: ["Daily: 6:30 AM – 12 PM and 4:30 – 8 PM"] },
];

async function main() {
  let updated = 0;
  for (const [slug, [times, site]] of Object.entries(TIMES)) {
    const { count } = await db.worshipPlace.updateMany({
      where: { slug },
      data: { serviceTimes: times.join("\n"), ...(site ? { websiteUrl: site } : {}) },
    });
    if (count) updated++;
    else console.log("MISSING", slug);
  }
  console.log(`timings set: ${updated} of ${Object.keys(TIMES).length}`);
  for (const t of NJ_TEMPLES) {
    const slug = slugify(`${t.name} ${t.city} NJ`);
    const data = { name: t.name, city: t.city, address: t.address ?? null, websiteUrl: t.websiteUrl, serviceTimes: t.times.join("\n") };
    await db.worshipPlace.upsert({
      where: { slug },
      update: data,
      create: { ...data, slug, faith: "HINDU_TEMPLE", state: "NJ", country: "USA", source: "web", status: "APPROVED", description: `Hindu temple in ${t.city}, NJ.` },
    });
    console.log("saved", slug);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
