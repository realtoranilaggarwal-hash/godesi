import { db } from "../src/lib/db";
import { uniqueEliteSlug } from "../src/lib/eliteSlug";

/**
 * Seeds GoDesi Elite with well-known desi figures in the United States, so the
 * directory opens with recognisable names our team can invite to claim.
 *
 *   npm run db:elite
 *
 * Every row is public record only: the person's name, the town they work from,
 * their field and one line of plain fact written by us, with the encyclopaedia
 * or official page we took the fact from credited and linked. No photograph is
 * copied, no biography is copied, no phone or email is published, and the entry
 * is explicitly unclaimed until the person (or someone they authorise) claims
 * it and takes over the page. Re-runnable: rows are keyed by their source page,
 * and an entry somebody has claimed or a human has edited is left alone.
 */

type Seed = {
  name: string;
  /** Company, office or institution the person is known for, if any. */
  org?: string;
  category: string;
  city: string;
  state: string;
  /** One line of public fact, in our own words. */
  bio: string;
  /** Public reference page the fact came from. */
  source: string;
  /** Their own site, when they have one we can point at. */
  website?: string;
};

const WIKI = "https://en.wikipedia.org/wiki/";

const PEOPLE: Seed[] = [
  {
    name: "Satya Nadella",
    org: "Microsoft",
    category: "Technology",
    city: "Redmond",
    state: "WA",
    bio: "Chairman and chief executive of Microsoft, which he joined in 1992 and has led since 2014.",
    source: `${WIKI}Satya_Nadella`,
  },
  {
    name: "Sundar Pichai",
    org: "Alphabet and Google",
    category: "Technology",
    city: "Mountain View",
    state: "CA",
    bio: "Chief executive of Alphabet and Google, where he previously led Chrome, Android and the company's product work.",
    source: `${WIKI}Sundar_Pichai`,
  },
  {
    name: "Arvind Krishna",
    org: "IBM",
    category: "Technology",
    city: "Armonk",
    state: "NY",
    bio: "Chairman and chief executive of IBM, and the engineer who drove its move into hybrid cloud and AI.",
    source: `${WIKI}Arvind_Krishna`,
  },
  {
    name: "Shantanu Narayen",
    org: "Adobe",
    category: "Technology",
    city: "San Jose",
    state: "CA",
    bio: "Chairman and chief executive of Adobe, which he moved from boxed software to subscription creative tools.",
    source: `${WIKI}Shantanu_Narayen`,
  },
  {
    name: "Nikesh Arora",
    org: "Palo Alto Networks",
    category: "Technology",
    city: "Santa Clara",
    state: "CA",
    bio: "Chairman and chief executive of Palo Alto Networks, and formerly president of SoftBank and a senior Google executive.",
    source: `${WIKI}Nikesh_Arora`,
  },
  {
    name: "Indra Nooyi",
    org: "PepsiCo",
    category: "Business & Entrepreneurship",
    city: "Greenwich",
    state: "CT",
    bio: "Led PepsiCo as chief executive from 2006 to 2018 and wrote the memoir 'My Life in Full'.",
    source: `${WIKI}Indra_Nooyi`,
  },
  {
    name: "Ajay Banga",
    org: "World Bank",
    category: "Finance & Insurance",
    city: "Washington",
    state: "DC",
    bio: "President of the World Bank, after a decade as chief executive of Mastercard.",
    source: `${WIKI}Ajay_Banga`,
  },
  {
    name: "Raj Subramaniam",
    org: "FedEx",
    category: "Business & Entrepreneurship",
    city: "Memphis",
    state: "TN",
    bio: "President and chief executive of FedEx, which he joined as a marketing analyst in 1991.",
    source: `${WIKI}Raj_Subramaniam`,
  },
  {
    name: "Revathi Advaithi",
    org: "Flex",
    category: "Business & Entrepreneurship",
    city: "Austin",
    state: "TX",
    bio: "Chief executive of the global manufacturing group Flex, and a long-time industrial engineer.",
    source: `${WIKI}Revathi_Advaithi`,
  },
  {
    name: "Jayshree Ullal",
    org: "Arista Networks",
    category: "Technology",
    city: "Santa Clara",
    state: "CA",
    bio: "President and chief executive of Arista Networks, the cloud networking company she took public in 2014.",
    source: `${WIKI}Jayshree_Ullal`,
  },
  {
    name: "Aneel Bhusri",
    org: "Workday",
    category: "Technology",
    city: "Pleasanton",
    state: "CA",
    bio: "Co-founder and chairman of Workday, and a partner at the venture firm Greylock.",
    source: `${WIKI}Aneel_Bhusri`,
  },
  {
    name: "Vinod Khosla",
    org: "Khosla Ventures",
    category: "Technology",
    city: "Menlo Park",
    state: "CA",
    bio: "Co-founder of Sun Microsystems and founder of Khosla Ventures, an early backer of clean energy and AI startups.",
    source: `${WIKI}Vinod_Khosla`,
  },
  {
    name: "Neal Mohan",
    org: "YouTube",
    category: "Technology",
    city: "San Bruno",
    state: "CA",
    bio: "Chief executive of YouTube, which he joined after leading Google's display advertising business.",
    source: `${WIKI}Neal_Mohan`,
  },
  {
    name: "Sanjay Mehrotra",
    org: "Micron Technology",
    category: "Technology",
    city: "Boise",
    state: "ID",
    bio: "President and chief executive of Micron Technology, and co-founder of the flash memory pioneer SanDisk.",
    source: `${WIKI}Sanjay_Mehrotra`,
  },
  {
    name: "George Kurian",
    org: "NetApp",
    category: "Technology",
    city: "San Jose",
    state: "CA",
    bio: "Chief executive of the data storage company NetApp since 2015.",
    source: `${WIKI}George_Kurian_(businessman)`,
  },
  {
    name: "Thomas Kurian",
    org: "Google Cloud",
    category: "Technology",
    city: "Sunnyvale",
    state: "CA",
    bio: "Chief executive of Google Cloud, after two decades building Oracle's product line.",
    source: `${WIKI}Thomas_Kurian`,
  },
  {
    name: "Jay Chaudhry",
    org: "Zscaler",
    category: "Technology",
    city: "San Jose",
    state: "CA",
    bio: "Founder and chief executive of Zscaler, his fifth security company, after growing up in a village in Himachal Pradesh.",
    source: `${WIKI}Jay_Chaudhry`,
  },
  {
    name: "Ravi Kumar S",
    org: "Cognizant",
    category: "Technology",
    city: "Teaneck",
    state: "NJ",
    bio: "Chief executive of Cognizant, and previously president of Infosys.",
    source: `${WIKI}Ravi_Kumar_Singisetti`,
  },
  {
    name: "Romesh Wadhwani",
    org: "SymphonyAI",
    category: "Business & Entrepreneurship",
    city: "Palo Alto",
    state: "CA",
    bio: "Founder of SymphonyAI and Symphony Technology Group, and a philanthropist funding skills training in India.",
    source: `${WIKI}Romesh_Wadhwani`,
  },
  {
    name: "Ram Shriram",
    org: "Sherpalo Ventures",
    category: "Business & Entrepreneurship",
    city: "Menlo Park",
    state: "CA",
    bio: "Founding board member and first investor in Google, and founder of the venture firm Sherpalo.",
    source: `${WIKI}Ram_Shriram`,
  },
  {
    name: "Dheeraj Pandey",
    org: "DevRev",
    category: "Technology",
    city: "Palo Alto",
    state: "CA",
    bio: "Co-founder and former chief executive of Nutanix, now building the customer support company DevRev.",
    source: `${WIKI}Dheeraj_Pandey`,
  },
  {
    name: "Anjali Sud",
    org: "Tubi",
    category: "Arts, Media & Music",
    city: "San Francisco",
    state: "CA",
    bio: "Chief executive of the streaming service Tubi, after leading Vimeo through its public listing.",
    source: `${WIKI}Anjali_Sud`,
  },
  {
    name: "Vivek Ranadive",
    org: "Sacramento Kings",
    category: "Sports & Fitness",
    city: "Sacramento",
    state: "CA",
    bio: "Owner and chairman of the NBA's Sacramento Kings, and founder of the software company TIBCO.",
    source: `${WIKI}Vivek_Ranadiv%C3%A9`,
  },
  {
    name: "Vivek Ramaswamy",
    org: "Roivant Sciences",
    category: "Business & Entrepreneurship",
    city: "Cincinnati",
    state: "OH",
    bio: "Founder of the biotech company Roivant Sciences and a candidate in the 2024 Republican presidential primary.",
    source: `${WIKI}Vivek_Ramaswamy`,
  },
  {
    name: "Kamala Harris",
    category: "Public Service & Politics",
    city: "Los Angeles",
    state: "CA",
    bio: "Vice President of the United States from 2021 to 2025, and previously a US senator and California's attorney general.",
    source: `${WIKI}Kamala_Harris`,
  },
  {
    name: "Nikki Haley",
    category: "Public Service & Politics",
    city: "Bamberg",
    state: "SC",
    bio: "Born in Bamberg, South Carolina; served as the state's governor and as United States ambassador to the United Nations.",
    source: `${WIKI}Nikki_Haley`,
  },
  {
    name: "Ro Khanna",
    category: "Public Service & Politics",
    city: "Fremont",
    state: "CA",
    bio: "United States representative for California's 17th district, covering much of Silicon Valley.",
    source: `${WIKI}Ro_Khanna`,
  },
  {
    name: "Pramila Jayapal",
    category: "Public Service & Politics",
    city: "Seattle",
    state: "WA",
    bio: "United States representative for Washington's 7th district and a former immigrant rights organiser.",
    source: `${WIKI}Pramila_Jayapal`,
  },
  {
    name: "Raja Krishnamoorthi",
    category: "Public Service & Politics",
    city: "Schaumburg",
    state: "IL",
    bio: "United States representative for Illinois's 8th district in the northwest Chicago suburbs.",
    source: `${WIKI}Raja_Krishnamoorthi`,
  },
  {
    name: "Ami Bera",
    category: "Public Service & Politics",
    city: "Elk Grove",
    state: "CA",
    bio: "Physician and United States representative for California's 6th district in the Sacramento area.",
    source: `${WIKI}Ami_Bera`,
  },
  {
    name: "Shri Thanedar",
    category: "Public Service & Politics",
    city: "Detroit",
    state: "MI",
    bio: "Chemist turned businessman, and United States representative for Michigan's 13th district.",
    source: `${WIKI}Shri_Thanedar`,
  },
  {
    name: "Suhas Subramanyam",
    category: "Public Service & Politics",
    city: "Ashburn",
    state: "VA",
    bio: "United States representative for Virginia's 10th district, and previously a state senator and White House technology adviser.",
    source: `${WIKI}Suhas_Subramanyam`,
  },
  {
    name: "Aruna Miller",
    category: "Public Service & Politics",
    city: "Annapolis",
    state: "MD",
    bio: "Lieutenant Governor of Maryland, and formerly a transportation engineer and state delegate.",
    source: `${WIKI}Aruna_Miller`,
  },
  {
    name: "Vivek Murthy",
    category: "Healthcare",
    city: "Washington",
    state: "DC",
    bio: "Served twice as Surgeon General of the United States, writing public advisories on loneliness and youth mental health.",
    source: `${WIKI}Vivek_Murthy`,
  },
  {
    name: "Atul Gawande",
    org: "Harvard University",
    category: "Healthcare",
    city: "Boston",
    state: "MA",
    bio: "Surgeon, Harvard professor and author of 'Being Mortal' and 'The Checklist Manifesto'.",
    source: `${WIKI}Atul_Gawande`,
  },
  {
    name: "Siddhartha Mukherjee",
    org: "Columbia University",
    category: "Healthcare",
    city: "New York",
    state: "NY",
    bio: "Oncologist at Columbia and author of 'The Emperor of All Maladies', which won the Pulitzer Prize in 2011.",
    source: `${WIKI}Siddhartha_Mukherjee`,
  },
  {
    name: "Sanjay Gupta",
    org: "CNN",
    category: "Healthcare",
    city: "Atlanta",
    state: "GA",
    bio: "Neurosurgeon at Emory University and chief medical correspondent for CNN.",
    source: `${WIKI}Sanjay_Gupta`,
  },
  {
    name: "Ashish Jha",
    org: "Brown University",
    category: "Healthcare",
    city: "Providence",
    state: "RI",
    bio: "Dean of Brown University's School of Public Health, and White House Covid-19 response coordinator in 2022-23.",
    source: `${WIKI}Ashish_Jha`,
  },
  {
    name: "Arati Prabhakar",
    category: "Technology",
    city: "Washington",
    state: "DC",
    bio: "Engineer who has led the White House Office of Science and Technology Policy, DARPA and the National Institute of Standards and Technology.",
    source: `${WIKI}Arati_Prabhakar`,
  },
  {
    name: "Sunita Williams",
    org: "NASA",
    category: "Other",
    city: "Houston",
    state: "TX",
    bio: "NASA astronaut who has flown three spaceflights and held the record for the longest spaceflight by a woman.",
    source: `${WIKI}Sunita_Williams`,
  },
  {
    name: "Raja Chari",
    org: "NASA",
    category: "Other",
    city: "Houston",
    state: "TX",
    bio: "NASA astronaut and US Air Force test pilot who commanded the SpaceX Crew-3 mission to the space station.",
    source: `${WIKI}Raja_Chari`,
  },
  {
    name: "Neal Katyal",
    org: "Georgetown Law",
    category: "Law & Immigration",
    city: "Washington",
    state: "DC",
    bio: "Appellate lawyer and Georgetown professor who served as Acting Solicitor General of the United States.",
    source: `${WIKI}Neal_Katyal`,
  },
  {
    name: "Preet Bharara",
    category: "Law & Immigration",
    city: "New York",
    state: "NY",
    bio: "Former United States Attorney for the Southern District of New York, now a professor, author and podcast host.",
    source: `${WIKI}Preet_Bharara`,
  },
  {
    name: "Sri Srinivasan",
    category: "Law & Immigration",
    city: "Washington",
    state: "DC",
    bio: "Chief Judge of the United States Court of Appeals for the District of Columbia Circuit.",
    source: `${WIKI}Sri_Srinivasan`,
  },
  {
    name: "Rajiv Shah",
    org: "Rockefeller Foundation",
    category: "Community & Non-profit",
    city: "New York",
    state: "NY",
    bio: "President of the Rockefeller Foundation, and administrator of USAID from 2010 to 2015.",
    source: `${WIKI}Rajiv_Shah`,
  },
  {
    name: "Nitin Nohria",
    org: "Harvard Business School",
    category: "Education",
    city: "Boston",
    state: "MA",
    bio: "Professor at Harvard Business School, which he led as dean from 2010 to 2020.",
    source: `${WIKI}Nitin_Nohria`,
  },
  {
    name: "Sunil Kumar",
    org: "Tufts University",
    category: "Education",
    city: "Medford",
    state: "MA",
    bio: "President of Tufts University, and previously provost of Johns Hopkins and dean of Chicago Booth.",
    source: `${WIKI}Sunil_Kumar_(academic_administrator)`,
  },
  {
    name: "Pradeep Khosla",
    org: "UC San Diego",
    category: "Education",
    city: "San Diego",
    state: "CA",
    bio: "Chancellor of the University of California, San Diego since 2012, and an engineer by training.",
    source: `${WIKI}Pradeep_Khosla`,
  },
  {
    name: "Neeli Bendapudi",
    org: "Penn State University",
    category: "Education",
    city: "University Park",
    state: "PA",
    bio: "President of Penn State University, and previously president of the University of Louisville.",
    source: `${WIKI}Neeli_Bendapudi`,
  },
  {
    name: "Renu Khator",
    org: "University of Houston",
    category: "Education",
    city: "Houston",
    state: "TX",
    bio: "Chancellor of the University of Houston System and president of the university since 2008.",
    source: `${WIKI}Renu_Khator`,
  },
  {
    name: "Satish Tripathi",
    org: "University at Buffalo",
    category: "Education",
    city: "Buffalo",
    state: "NY",
    bio: "President of the University at Buffalo, the largest campus in the State University of New York system.",
    source: `${WIKI}Satish_K._Tripathi`,
  },
  {
    name: "Mindy Kaling",
    category: "Arts, Media & Music",
    city: "Los Angeles",
    state: "CA",
    bio: "Actor, writer and producer, known for 'The Office', 'The Mindy Project' and 'Never Have I Ever'.",
    source: `${WIKI}Mindy_Kaling`,
  },
  {
    name: "Aziz Ansari",
    category: "Arts, Media & Music",
    city: "Los Angeles",
    state: "CA",
    bio: "Comedian, actor and director, and creator of the Emmy-winning series 'Master of None'.",
    source: `${WIKI}Aziz_Ansari`,
  },
  {
    name: "Hasan Minhaj",
    category: "Arts, Media & Music",
    city: "Los Angeles",
    state: "CA",
    bio: "Comedian and former 'Daily Show' correspondent who hosted Netflix's 'Patriot Act'.",
    source: `${WIKI}Hasan_Minhaj`,
  },
  {
    name: "Kal Penn",
    category: "Arts, Media & Music",
    city: "Los Angeles",
    state: "CA",
    bio: "Actor known for 'Harold & Kumar' and 'House', who also worked in the Obama White House on public engagement.",
    source: `${WIKI}Kal_Penn`,
  },
  {
    name: "M. Night Shyamalan",
    category: "Arts, Media & Music",
    city: "Philadelphia",
    state: "PA",
    bio: "Filmmaker behind 'The Sixth Sense', 'Unbreakable' and 'Split', who shoots most of his films around Philadelphia.",
    source: `${WIKI}M._Night_Shyamalan`,
  },
  {
    name: "Kunal Nayyar",
    category: "Arts, Media & Music",
    city: "Los Angeles",
    state: "CA",
    bio: "Actor who played Raj Koothrappali across twelve seasons of 'The Big Bang Theory'.",
    source: `${WIKI}Kunal_Nayyar`,
  },
  {
    name: "Padma Lakshmi",
    category: "Arts, Media & Music",
    city: "New York",
    state: "NY",
    bio: "Author and television host, known for 'Top Chef' and 'Taste the Nation'.",
    source: `${WIKI}Padma_Lakshmi`,
  },
  {
    name: "Jhumpa Lahiri",
    org: "Barnard College",
    category: "Arts, Media & Music",
    city: "New York",
    state: "NY",
    bio: "Novelist who won the Pulitzer Prize for 'Interpreter of Maladies' and teaches writing at Barnard College.",
    source: `${WIKI}Jhumpa_Lahiri`,
  },
  {
    name: "Vijay Iyer",
    org: "Harvard University",
    category: "Arts, Media & Music",
    city: "Cambridge",
    state: "MA",
    bio: "Jazz pianist and composer, a MacArthur Fellow who teaches music at Harvard.",
    source: `${WIKI}Vijay_Iyer`,
  },
  {
    name: "Nina Davuluri",
    category: "Arts, Media & Music",
    city: "New York",
    state: "NY",
    bio: "Crowned Miss America in 2014, the first Indian American to win the title, and now a filmmaker and speaker.",
    source: `${WIKI}Nina_Davuluri`,
  },
  {
    name: "Vikas Khanna",
    org: "Bungalow",
    category: "Food & Hospitality",
    city: "New York",
    state: "NY",
    bio: "Michelin-starred chef, cookbook author and restaurateur behind Bungalow in Manhattan.",
    source: `${WIKI}Vikas_Khanna`,
  },
  {
    name: "Maneet Chauhan",
    org: "Chauhan Ale & Masala House",
    category: "Food & Hospitality",
    city: "Nashville",
    state: "TN",
    bio: "Chef and Food Network judge who runs a group of restaurants in Nashville.",
    source: `${WIKI}Maneet_Chauhan`,
  },
  {
    name: "Chintan Pandya",
    org: "Unapologetic Foods",
    category: "Food & Hospitality",
    city: "New York",
    state: "NY",
    bio: "Chef behind Dhamaka and Adda, and winner of the James Beard award for Best Chef: New York State.",
    source: `${WIKI}Dhamaka_(restaurant)`,
  },
  {
    name: "Rajeev Ram",
    category: "Sports & Fitness",
    city: "Carmel",
    state: "IN",
    bio: "Doubles specialist who has won multiple Grand Slam titles and an Olympic silver medal for the United States.",
    source: `${WIKI}Rajeev_Ram`,
  },
];

/** Public reference pages are what makes a compiled entry checkable. */
const SOURCE_NAME = "Wikipedia";

async function main() {
  let added = 0;
  let skipped = 0;

  for (const person of PEOPLE) {
    const existing = await db.eliteEntry.findFirst({
      where: {
        OR: [
          { sourceUrl: person.source },
          { fullName: { equals: person.name, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });
    if (existing) {
      skipped += 1;
      continue;
    }

    await db.eliteEntry.create({
      data: {
        slug: await uniqueEliteSlug(person.name, person.city),
        fullName: person.name,
        businessName: person.org ?? null,
        category: person.category,
        city: person.city,
        state: person.state,
        country: "USA",
        shortBio: person.bio,
        websiteUrl: person.website ?? null,
        sourceUrl: person.source,
        sourceName: SOURCE_NAME,
        // A staff-compiled entry is a nomination until the person claims it.
        nominationType: "OTHER",
        nomineeName: person.name,
        status: "PUBLISHED",
        badge: "BASIC",
        publishedAt: new Date(),
        adminNote:
          "Compiled by GoDesi from public sources. Unclaimed: invite the person to claim and complete it.",
      },
    });
    added += 1;
  }

  console.log(`Elite: ${added} added, ${skipped} already present.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
