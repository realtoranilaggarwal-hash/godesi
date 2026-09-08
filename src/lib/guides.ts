/**
 * Hand-picked "<what> in <city>" pages at /guide/<slug>. Each one exists only
 * because the directory already holds enough real cards for that combination;
 * the copy is written per page, not templated, so add a page here only after
 * checking the inventory and writing text specific to that city.
 */
export type Guide = {
  slug: string;
  /** What a searcher types, used as the H1 and title. */
  title: string;
  description: string;
  /** Top-level directory category the listings come from. */
  category: string;
  /** Narrow to these subcategory slugs; empty means the whole category. */
  subcategories: string[];
  /** Spellings of the city as stored on cards; matched case-insensitively. */
  cities: string[];
  /** Short city name for headings and event lookups. */
  cityLabel: string;
  intro: string[];
  tips: string[];
  faqs: { q: string; a: string }[];
};

export const GUIDES: Guide[] = [
  {
    slug: "indian-restaurants-chicago",
    title: "Indian restaurants in Chicago",
    description:
      "Indian and South Asian restaurants in Chicago, many along Devon Avenue: addresses, phone numbers and WhatsApp on one page.",
    category: "food-catering",
    subcategories: ["food-catering-restaurants"],
    cities: ["Chicago"],
    cityLabel: "Chicago",
    intro: [
      "Chicago's Indian food is concentrated on West Devon Avenue in West Ridge, where a dozen-plus restaurants, sweet shops and fast-food counters sit within a few blocks — South Indian vegetarian, Punjabi, Hyderabadi biryani and Indo-Chinese all side by side. The listings below carry the address and phone number so you can call ahead or check hours.",
      "This is a directory, not a review site: we list every Indian restaurant we know of in Chicago, and owners can claim their card to add photos, menus, a description and a WhatsApp number.",
    ],
    tips: [
      "Devon Avenue between Western and California is walkable — park once and compare menus on foot.",
      "Many places are cash-friendly and busiest Friday to Sunday evenings; weekday lunch buffets are quieter.",
      "Call before a large-group or festival-day visit (Diwali, Navratri, Eid) — several close for private events.",
    ],
    faqs: [
      {
        q: "Where is Chicago's Indian neighbourhood?",
        a: "West Devon Avenue in the West Ridge area, roughly from Western Avenue to California Avenue, is the city's main South Asian strip, with restaurants, grocers, sari shops and jewellers.",
      },
      {
        q: "Are these restaurants vegetarian?",
        a: "Some are fully vegetarian (typically South Indian and Gujarati kitchens); most others have a large vegetarian section. Call the number on the card to confirm.",
      },
      {
        q: "How do I add or correct a restaurant?",
        a: "Owners can claim the card free at the link on each listing and edit hours, photos and contact details. Anyone can suggest a missing restaurant from the Add a business page.",
      },
    ],
  },
  {
    slug: "indian-restaurants-los-angeles",
    title: "Indian restaurants in Los Angeles",
    description:
      "Indian restaurants across Los Angeles — Artesia's Little India, Westside, Downtown and the Valley — with phone numbers and addresses.",
    category: "food-catering",
    subcategories: ["food-catering-restaurants"],
    cities: ["Los Angeles"],
    cityLabel: "Los Angeles",
    intro: [
      "Los Angeles spreads its Indian restaurants across the map: the Pioneer Boulevard strip in Artesia (Little India) to the south-east, long-running spots in Culver City and Santa Monica, and newer kitchens in the San Fernando Valley. The list below is the cards tagged Los Angeles in the GoDesi directory, with address and phone on each.",
      "Owners can claim a card to add a menu, photos, hours and WhatsApp ordering; unclaimed cards show only what is publicly known.",
    ],
    tips: [
      "For the widest choice in one place drive to Artesia — Pioneer Boulevard has restaurants, sweet shops and chaat counters within walking distance.",
      "Westside restaurants fill up on weekend evenings; book by phone.",
      "Check the card for a WhatsApp number — many take takeaway orders that way.",
    ],
    faqs: [
      {
        q: "Where is Little India in Los Angeles?",
        a: "Artesia, along Pioneer Boulevard between 183rd and 187th Street, about 20 miles south-east of downtown LA.",
      },
      {
        q: "Do the listings include Pakistani and Bangladeshi restaurants?",
        a: "Yes — the directory covers South Asian food broadly. Cuisine is shown on the card where the owner has filled it in.",
      },
      {
        q: "How do I list my restaurant?",
        a: "Search for your restaurant here and claim the card, or add it from the Add a business page. Listing is free.",
      },
    ],
  },
  {
    slug: "indian-restaurants-austin",
    title: "Indian restaurants in Austin",
    description:
      "Indian restaurants and caterers in Austin, Texas — North Austin, Round Rock and downtown — with phone numbers, addresses and WhatsApp.",
    category: "food-catering",
    subcategories: [],
    cities: ["Austin"],
    cityLabel: "Austin",
    intro: [
      "Austin's desi community has grown with its tech industry, and its Indian restaurants cluster along North Lamar, Parmer Lane and the Round Rock corridor near the office parks, with a handful downtown. Below are the restaurants and caterers tagged Austin in the GoDesi directory.",
      "Each card shows the address and phone number we have on file; claimed cards add photos, menus and WhatsApp.",
    ],
    tips: [
      "Lunch buffets are common on weekdays near the North Austin tech campuses.",
      "Several restaurants here also cater — ask when you call if you are planning a pooja, birthday or office lunch.",
      "Check the events list below: Austin's Diwali and Holi celebrations often have food stalls from these same kitchens.",
    ],
    faqs: [
      {
        q: "Which part of Austin has the most Indian restaurants?",
        a: "North Austin — along North Lamar Boulevard, Parmer Lane and toward Round Rock and Cedar Park — has the largest cluster, close to the Indian grocery stores.",
      },
      {
        q: "Can I order catering for an event?",
        a: "Several listed restaurants offer catering. The card shows a phone number; claimed cards may also show a WhatsApp button for quotes.",
      },
      {
        q: "Is this list complete?",
        a: "It is the set of Austin cards in the GoDesi directory today. If a restaurant is missing, add it free from the Add a business page.",
      },
    ],
  },
  {
    slug: "indian-restaurants-caterers-houston",
    title: "Indian restaurants and caterers in Houston",
    description:
      "Indian and Pakistani restaurants, caterers and halal kitchens in Houston — Hillcroft, Sugar Land and beyond — with phone numbers and addresses.",
    category: "food-catering",
    subcategories: [],
    cities: ["Houston"],
    cityLabel: "Houston",
    intro: [
      "Houston has one of the largest South Asian populations in the United States, centred on the Mahatma Gandhi District along Hillcroft Avenue and spreading to Sugar Land, Katy and Pearland. The cards below are the restaurants, caterers and food businesses tagged Houston in the GoDesi directory — Indian, Pakistani, halal and vegetarian.",
      "Caterers are listed alongside restaurants because most Houston wedding and pooja catering comes from the same kitchens. Owners can claim a card to add menus, photos and WhatsApp.",
    ],
    tips: [
      "Hillcroft Avenue between Highway 59 and Westpark is the historic strip; Sugar Land has newer, larger restaurants with parking.",
      "For wedding or large-event catering, call two or three kitchens — Houston caterers book months ahead for peak wedding season.",
      "Many kitchens are halal; the card says so where the owner has filled it in.",
    ],
    faqs: [
      {
        q: "Where is Houston's Indian district?",
        a: "The Mahatma Gandhi District along Hillcroft Avenue in south-west Houston, with a second cluster in Sugar Land.",
      },
      {
        q: "Do you list Pakistani restaurants too?",
        a: "Yes. The directory covers Indian, Pakistani, Bangladeshi and other South Asian food; the card shows cuisine where the owner has set it.",
      },
      {
        q: "How do I get catering quotes?",
        a: "Call the number on the card, or use the WhatsApp button on claimed cards. GoDesi does not take a commission on catering enquiries.",
      },
    ],
  },
  {
    slug: "indian-restaurants-edison-nj",
    title: "Indian restaurants in Edison, NJ",
    description:
      "Indian restaurants and caterers in Edison, New Jersey — Oak Tree Road and nearby — with addresses, phone numbers and WhatsApp.",
    category: "food-catering",
    subcategories: [],
    cities: ["Edison"],
    cityLabel: "Edison",
    intro: [
      "Oak Tree Road, running through Edison and Iselin, is the East Coast's best-known Indian commercial strip — restaurants, chaat houses, sweet shops and caterers packed along a two-mile stretch. The list below is every restaurant and caterer tagged Edison in the GoDesi directory, with the address and phone we have on file.",
      "Owners can claim their card free to add photos, a menu and WhatsApp ordering.",
    ],
    tips: [
      "Weekend evenings on Oak Tree Road are busy and parking is tight; go early or on a weekday.",
      "Iselin (Woodbridge Township) is the other half of the same strip — check the Iselin listings too.",
      "Festival weekends (Diwali, Navratri) bring street stalls and extended hours; call to confirm.",
    ],
    faqs: [
      {
        q: "Is Oak Tree Road in Edison or Iselin?",
        a: "Both. The Indian strip runs from Edison into Iselin, in Woodbridge Township, along the same road.",
      },
      {
        q: "Which restaurants cater weddings?",
        a: "Cards tagged as caterers are listed with the restaurants below. Call the number on the card for menus and per-plate pricing.",
      },
      {
        q: "How do I add my restaurant?",
        a: "Claim the card if it already exists, or add it free from the Add a business page.",
      },
    ],
  },
  {
    slug: "indian-restaurants-minneapolis",
    title: "Indian restaurants in Minneapolis",
    description:
      "Indian and Nepali restaurants in Minneapolis and the Twin Cities, with addresses and phone numbers on every card.",
    category: "food-catering",
    subcategories: [],
    cities: ["Minneapolis"],
    cityLabel: "Minneapolis",
    intro: [
      "The Twin Cities' Indian restaurants are spread between Minneapolis proper — Uptown, Dinkytown near the university, the Midtown Global Market — and the south-west suburbs where much of the desi community lives. Below are the restaurants tagged Minneapolis in the GoDesi directory, including Nepali and Indo-Chinese kitchens.",
      "Each card shows the address and phone; claimed cards add photos, menu links and WhatsApp.",
    ],
    tips: [
      "Student-area restaurants near the University of Minnesota tend to be cheaper and open later.",
      "Check the suburbs (Eden Prairie, Bloomington, Maple Grove) on the City pages for more options — many Twin Cities desi businesses are not inside Minneapolis city limits.",
      "Winter hours change; call before driving across town.",
    ],
    faqs: [
      {
        q: "Are there Indian restaurants in the Minneapolis suburbs too?",
        a: "Yes — this page lists cards tagged Minneapolis. Use the City pages for Eden Prairie, Bloomington, Plymouth and other suburbs.",
      },
      {
        q: "Do you list Nepali restaurants?",
        a: "Yes; South Asian cuisine broadly is included and the cuisine appears on the card where set by the owner.",
      },
      {
        q: "How do I correct a listing?",
        a: "Owners claim the card free and edit it. Anyone else can report an error from the card page.",
      },
    ],
  },
  {
    slug: "indian-caterers-new-york",
    title: "Indian caterers in New York City",
    description:
      "Indian wedding and party caterers in New York City, plus Indian restaurants and grocers — phone numbers and WhatsApp on every card.",
    category: "food-catering",
    subcategories: [],
    cities: ["New York"],
    cityLabel: "New York",
    intro: [
      "New York's Indian caterers work weddings, mehndi nights, poojas and corporate events across the five boroughs and out to Long Island and New Jersey. The cards below are the caterers, restaurants and food businesses tagged New York in the GoDesi directory. Queens (Jackson Heights, Flushing) and Brooklyn businesses appear on their own city pages.",
      "Catering is quote-based, so cards rarely show prices; call or WhatsApp the caterer with your date, headcount and cuisine.",
    ],
    tips: [
      "Book wedding catering six to twelve months ahead for spring and autumn dates — the same caterers serve the whole tri-state area.",
      "Ask whether the quote includes service staff, rentals and venue delivery fees; Manhattan venues often charge for loading access.",
      "For smaller gatherings, several listed restaurants do party trays at lower minimums than full-service caterers.",
    ],
    faqs: [
      {
        q: "Do these caterers deliver outside Manhattan?",
        a: "Most cover the five boroughs, Long Island, Westchester and northern New Jersey. Confirm the delivery area and fee when you call.",
      },
      {
        q: "Where are Jackson Heights and Flushing restaurants listed?",
        a: "On their own city pages — search the City directory for Jackson Heights, Flushing or Queens.",
      },
      {
        q: "How do I list my catering business?",
        a: "Claim your card or add one free from the Add a business page; claimed cards get a WhatsApp button and photo gallery.",
      },
    ],
  },
  {
    slug: "indian-wedding-vendors-houston",
    title: "Indian wedding vendors in Houston",
    description:
      "Indian wedding planners, decorators, photographers, makeup artists and event rentals in Houston, Texas — contact details on every card.",
    category: "events-wedding",
    subcategories: [],
    cities: ["Houston"],
    cityLabel: "Houston",
    intro: [
      "Houston hosts some of the largest South Asian weddings in the country, and the vendor scene to match: planners, mandap and floral decorators, photographers and videographers, bridal makeup and hair, DJs, rentals and jewellers. The list below is every wedding-and-events card tagged Houston in the GoDesi directory.",
      "Many of these cards are unclaimed starter listings built from public information. A claimed card — with the owner's own photos, prices and WhatsApp — is marked as such; unclaimed cards show only a name and category until the owner takes them over.",
    ],
    tips: [
      "Houston's big wedding venues are in Sugar Land, Stafford and the Galleria area; ask vendors which venues they have worked before.",
      "Peak season is October to December and March to May; decorators and photographers book a year ahead for those dates.",
      "Post your requirement once on the Wedding page and let vendors come to you with quotes.",
    ],
    faqs: [
      {
        q: "What types of vendors are on this page?",
        a: "Everything in the Wedding & Event Services category tagged Houston: planners, decorators, photographers, videographers, makeup artists, DJs, rentals, invitations and jewellery. Use the filter on the category page to narrow to one type.",
      },
      {
        q: "Why do some cards have no photos?",
        a: "Those are starter listings the owner has not claimed yet. Once claimed, the owner adds photos, prices and a description.",
      },
      {
        q: "How do I get quotes from several vendors at once?",
        a: "Post your date, guest count and needs on the Wedding requirements page; matching Houston vendors are notified and reply to you directly.",
      },
    ],
  },
  {
    slug: "desi-travel-agents-chicago",
    title: "Indian travel agents in Chicago",
    description:
      "Desi travel agencies in Chicago for India flights, visas, Umrah and group tours — phone numbers and addresses on every card.",
    category: "travel",
    subcategories: ["travel-travel-agents"],
    cities: ["Chicago"],
    cityLabel: "Chicago",
    intro: [
      "Chicago's South Asian travel agencies, many on and around Devon Avenue, specialise in India, Pakistan and Bangladesh fares, multi-city itineraries, OCI and visa paperwork, Umrah and Hajj packages and group tours. Below are the travel-agent cards tagged Chicago in the GoDesi directory.",
      "Agencies here still compete on consolidator fares and on handling the paperwork airlines' websites will not — that is why the phone number matters more than a booking widget.",
    ],
    tips: [
      "For December–January India travel, book by September; agents get consolidator seats that disappear early.",
      "Ask about baggage allowance on the specific fare — agency fares sometimes carry different rules from the airline's own.",
      "Check whether the agency is ARC/IATA accredited if you are paying a large group deposit.",
    ],
    faqs: [
      {
        q: "Can these agents help with an Indian visa or OCI card?",
        a: "Many do, for a service fee. The card lists services where the owner has set them; otherwise call and ask.",
      },
      {
        q: "Are agency fares cheaper than booking online?",
        a: "Often for India routes in peak season, because agencies hold consolidator inventory. Compare — and ask about change fees.",
      },
      {
        q: "How do I list my travel agency?",
        a: "Claim your existing card or add one free from the Add a business page.",
      },
    ],
  },
  {
    slug: "mehndi-threading-charlotte",
    title: "Mehndi, threading and Indian beauty services in Charlotte",
    description:
      "Henna (mehndi) artists, eyebrow threading and Indian bridal beauty services in Charlotte, North Carolina — with contact details.",
    category: "beauty-lifestyle",
    subcategories: [],
    cities: ["Charlotte"],
    cityLabel: "Charlotte",
    intro: [
      "Charlotte's growing desi community — around Ballantyne, the Arboretum area and University City — supports a set of home-based and salon beauty businesses: henna artists for weddings and Eid, eyebrow threading, bridal makeup and hair. The cards below are the beauty-and-lifestyle listings tagged Charlotte in the GoDesi directory.",
      "Many of these are one-person businesses working from home or by appointment, so WhatsApp or a phone call is the normal way to book.",
    ],
    tips: [
      "Book bridal mehndi four to six weeks ahead; artists take one bride per day in wedding season.",
      "Ask to see recent photos of the artist's own work — a claimed card shows a gallery.",
      "Eid and Karva Chauth weeks fill up fast for henna; message early.",
    ],
    faqs: [
      {
        q: "Do these artists travel to the venue or home?",
        a: "Most home-based mehndi and makeup artists travel within the Charlotte area for a fee. Confirm when booking.",
      },
      {
        q: "Is threading available without an appointment?",
        a: "Salon-based listings usually take walk-ins; home-based ones are appointment only. The card shows which where the owner has set it.",
      },
      {
        q: "How do I list my beauty business?",
        a: "Add a card free from the Add a business page; you can add photos of your work and a WhatsApp booking button.",
      },
    ],
  },
];

export function guideBySlug(slug: string) {
  return GUIDES.find((guide) => guide.slug === slug) ?? null;
}
