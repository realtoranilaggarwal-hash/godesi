/**
 * One email and one call opener per beat, so a moderator working the call list
 * never has to invent the pitch — she picks the row, copies the text, and the
 * only thing she types is what the owner said.
 *
 * Every line here has to be true on the page we send them: a listing is free,
 * Pro is $5.99 and Premium $11.99 a month, and the phone and email we already
 * hold stay hidden on the card until the owner claims it and takes a plan.
 */

export type PitchContext = {
  /** The business as it is written on the card. */
  business: string;
  city: string | null;
  /** Their own card, ready to claim, e.g. https://godesi.com/b/…?claim=1 */
  cardUrl: string | null;
  /** The girl's name, so the mail is signed by a person. */
  from: string;
};

export type ProspectPitch = {
  /** Category slug from CATEGORY_TREE, or "default" for anything unsorted. */
  slug: string;
  label: string;
  icon: string;
  /** The one reason this trade should care, in the girl's own opening breath. */
  hook: string;
  subject: (context: PitchContext) => string;
  email: (context: PitchContext) => string;
  call: (context: PitchContext) => string;
  objections: { question: string; answer: string }[];
};

function where(city: string | null) {
  return city ? ` in ${city}` : "";
}

function near(city: string | null) {
  return city ? `${city} and around` : "your area";
}

/** The two paragraphs every mail ends with, so nobody promises anything else. */
function close(context: PitchContext, ask: string) {
  return [
    context.cardUrl
      ? `Your page is already up: ${context.cardUrl}\nClaim it there and it becomes yours — your photos, your words, your timings. Your phone number and email are on the page but hidden; they show once you claim it and take a plan ($5.99 a month Pro, $11.99 Premium), so only real owners appear with contact details.`
      : `Listing is free: https://godesi.com/add-business — it takes about four minutes.`,
    ask,
    `Whatever you put on Godesi also publishes to our own network (godesi.wiki and our sister sites) at no extra cost.`,
    `Thanks,\n${context.from}\nGoDesi.com`,
  ].join("\n\n");
}

const DEFAULT_PITCH: ProspectPitch = {
  slug: "default",
  label: "Any business",
  icon: "🏪",
  hook: "Their page is already on GoDesi — they just have to claim it.",
  subject: (c) => `${c.business} — your GoDesi page is ready to claim`,
  email: (c) =>
    [
      `Namaste 🙏`,
      `I'm ${c.from} from GoDesi.com, the desi directory for the community${where(
        c.city,
      )}. We have built a page for ${c.business} from public listings so desi customers searching for you${where(c.city)} can find you here.`,
      close(
        c,
        `Could you tell me if the details are right — the trade, the town and the number we hold? I'll correct them while we're on the phone.`,
      ),
    ].join("\n\n"),
  call: (c) =>
    [
      `Namaste 🙏 Is this ${c.business}?`,
      ``,
      `I'm calling from GoDesi.com — the desi directory for ${near(c.city)}. Your page is already on our site; I'm ringing so the real owner takes charge of it. It's free, and I can finish it with you now: your photos, your timings, your WhatsApp button.`,
      ``,
      `Your number and email are on the page but hidden until you claim it — shall I send you the link?`,
    ].join("\n"),
  objections: [
    {
      question: "Who gave you my number?",
      answer:
        "It's on your own website / the public directory where you advertise — that's where we read it. Nothing is shown on our page until you claim it, and I'll remove the page today if you'd rather not be listed.",
    },
    {
      question: "Is it really free?",
      answer:
        "The listing is free and stays free. A paid plan starts at $5.99 a month and is only for extras: showing your phone and email, more photos and videos, and appearing above the free cards.",
    },
  ],
};

export const PROSPECT_PITCHES: ProspectPitch[] = [
  {
    slug: "it-training",
    label: "IT Training & Career Services",
    icon: "💻",
    hook: "Desi engineers looking for training, OPT/H-1B help and their next job.",
    subject: (c) => `${c.business} — reach desi engineers on GoDesi`,
    email: (c) =>
      [
        `Hello,`,
        `I'm ${c.from} from GoDesi.com — a directory used by South Asian families and engineers${where(
          c.city,
        )}. People come to us looking for training, placement help and consulting work, and I'd like ${c.business} to be the firm they find.`,
        `We've already built your page from public filings and your own website, with your trade and town. What it needs from you is what you actually do: the technologies you train or staff for, whether you take freshers, and how a candidate reaches you.`,
        close(
          c,
          `Who handles marketing or recruitment with you? I'll send them the link directly.`,
        ),
      ].join("\n\n"),
    call: () =>
      [
        `Namaste 🙏 May I speak to whoever looks after marketing or recruitment?`,
        ``,
        `I'm from GoDesi.com — a desi directory. The people on our site are desi engineers looking for training and jobs, and desi families near your office. Your company page is already there from public records; I'm calling so you can claim it and put your own services and contact on it.`,
        ``,
        `It's free to claim. Shall I email you the link?`,
      ].join("\n"),
    objections: [
      {
        question: "We only hire through vendors.",
        answer:
          "That's fine — most firms use the page for the candidates and for local visibility, not to replace their vendors. It also puts you in front of desi families near your office.",
      },
      {
        question: "Where did you get our details?",
        answer:
          "From the Department of Labor's own published H-1B filings and your website — both public. Your number is hidden on the page until you claim it.",
      },
    ],
  },
  {
    slug: "events-wedding",
    label: "Wedding & Event Services",
    icon: "💍",
    hook: "Couples planning a desi wedding, posting exactly what they need.",
    subject: (c) => `${c.business} — desi couples are asking for your trade on GoDesi`,
    email: (c) =>
      [
        `Namaste 🙏`,
        `I'm ${c.from} from GoDesi.com. Couples planning desi weddings${where(
          c.city,
        )} post what they need on our requirements board — venue, caterer, decor, DJ, photographer — and vendors answer them. I'd like ${c.business} to be one of the vendors they see.`,
        `Your page is built from public listings, so it has your trade and town but none of your work. Weddings sell on pictures: your album, your packages and one video finish it properly.`,
        close(
          c,
          `Send me three photos and your package prices and I'll put them on for you today.`,
        ),
      ].join("\n\n"),
    call: (c) =>
      [
        `Namaste 🙏 Is this ${c.business}?`,
        ``,
        `I'm from GoDesi.com — desi couples${where(c.city)} use us to find wedding vendors, and they post their requirements with dates and budgets. Your page is already on the site; I'm ringing so you can claim it and add your album and packages.`,
        ``,
        `Claiming is free. Are you taking bookings for this season?`,
      ].join("\n"),
    objections: [
      {
        question: "I already pay a wedding site.",
        answer:
          "This is desi-specific and the enquiries come with no commission — we take nothing on the job. Keep the other one; being on both costs you nothing here.",
      },
      {
        question: "I'm fully booked.",
        answer:
          "Then claim it for next season and switch the enquiries off meanwhile — the page still holds your name so nobody else takes it.",
      },
    ],
  },
  {
    slug: "food-catering",
    label: "Food & Catering",
    icon: "🍛",
    hook: "Parties, poojas and office lunches — people search by cuisine and town.",
    subject: (c) => `${c.business} — your catering page on GoDesi`,
    email: (c) =>
      [
        `Namaste 🙏`,
        `I'm ${c.from} from GoDesi.com. Families${where(
          c.city,
        )} search us for desi catering — pooja lunches, birthdays, weddings, office orders — and ${c.business} already has a page there.`,
        `To make it work it needs your menu, whether you do pure veg / Jain / halal, your minimum order and a few photos of the food.`,
        close(c, `Send me your menu as it is — a photo of the card is fine — and I'll set it up.`),
      ].join("\n\n"),
    call: (c) =>
      [
        `Namaste 🙏 Is this ${c.business}?`,
        ``,
        `I'm from GoDesi.com, the desi directory. People near you look for catering for poojas and parties on our site, and your page is already there. I'm calling so you can claim it and put your menu and photos on it — it's free.`,
        ``,
        `Do you do pure veg, and what's your minimum order?`,
      ].join("\n"),
    objections: [
      {
        question: "I only do word of mouth.",
        answer:
          "This is word of mouth with a page attached — when a customer tells a friend about you, the friend searches your name and finds your menu instead of nothing.",
      },
      ...DEFAULT_PITCH.objections.slice(1),
    ],
  },
  {
    slug: "religious-services",
    label: "Religious & Cultural",
    icon: "🕉️",
    hook: "Families looking for a pandit, temple timings or a pooja at home.",
    subject: (c) => `${c.business} — pooja and temple listings on GoDesi`,
    email: (c) =>
      [
        `Namaste 🙏`,
        `I'm ${c.from} from GoDesi.com. Families${where(
          c.city,
        )} come to us for pandits, temples and pooja services — griha pravesh, satyanarayan pooja, weddings, last rites — and we hold a page for ${c.business}.`,
        `It would help people to see which poojas you perform, the languages you speak and whether you travel to homes.`,
        close(c, `If you tell me those three things I'll write the page for you.`),
      ].join("\n\n"),
    call: (c) =>
      [
        `Namaste 🙏 Am I speaking with ${c.business}?`,
        ``,
        `I'm from GoDesi.com — families near you search our site for pandits and pooja services. Your listing is already there and I'd like you to have charge of it, at no cost.`,
        ``,
        `Which poojas do you perform, and do you go to people's homes?`,
      ].join("\n"),
    objections: [
      {
        question: "I don't want my number online.",
        answer:
          "It stays hidden — an unclaimed page shows no number at all, and even after claiming you decide whether to show it or take enquiries only through the site.",
      },
      ...DEFAULT_PITCH.objections.slice(1),
    ],
  },
  {
    slug: "business-services",
    label: "Business & Professional Services",
    icon: "💼",
    hook: "Accountants, attorneys, insurance and consultants — searched by need.",
    subject: (c) => `${c.business} — your professional page on GoDesi`,
    email: (c) =>
      [
        `Hello,`,
        `I'm ${c.from} from GoDesi.com, a directory the South Asian community${where(
          c.city,
        )} uses to find professionals — tax, immigration paperwork, insurance, company formation. ${c.business} has a page there already, built from public listings.`,
        `Professionals get chosen on specifics: your practice areas, your licence or registration number, your consultation fee and the languages you work in.`,
        close(c, `Reply with those and I'll finish the page while we speak.`),
      ].join("\n\n"),
    call: (c) =>
      [
        `Namaste 🙏 Is this ${c.business}?`,
        ``,
        `I'm from GoDesi.com — the desi community${where(c.city)} uses us to find accountants, attorneys and insurance people. Your page is on the site and unclaimed; claiming it is free and lets you list your practice areas and languages.`,
        ``,
        `Which services should I put first?`,
      ].join("\n"),
    objections: [
      {
        question: "I get referrals, I don't need a directory.",
        answer:
          "Referrals still look you up. A page with your practice areas and languages is what converts that look-up into a call — and it's free.",
      },
      ...DEFAULT_PITCH.objections.slice(1),
    ],
  },
  {
    slug: "travel",
    label: "Travel & Transport",
    icon: "✈️",
    hook: "India tickets, visas, airport pickups and packages.",
    subject: (c) => `${c.business} — India travel searches on GoDesi`,
    email: (c) =>
      [
        `Namaste 🙏`,
        `I'm ${c.from} from GoDesi.com. People${where(
          c.city,
        )} search us for India tickets, visa and OCI help, airport pickups and holiday packages, and ${c.business} already has a page.`,
        `What it needs is the routes and services you actually handle, and whether you're open on weekends — that's what makes somebody ring a travel agent.`,
        close(c, `Tell me your main routes and I'll put them on the page.`),
      ].join("\n\n"),
    call: (c) =>
      [
        `Namaste 🙏 Is this ${c.business}?`,
        ``,
        `I'm from GoDesi.com — people near you look for India tickets, visas and airport cabs on our site. Your page is already there; claiming it is free and you can add your routes and offers.`,
        ``,
        `Do you handle visas and OCI as well as tickets?`,
      ].join("\n"),
    objections: DEFAULT_PITCH.objections,
  },
  {
    slug: "beauty-lifestyle",
    label: "Beauty & Lifestyle",
    icon: "💅",
    hook: "Bridal makeup, mehendi, threading and salons — booked on photos.",
    subject: (c) => `${c.business} — your salon page on GoDesi`,
    email: (c) =>
      [
        `Namaste 🙏`,
        `I'm ${c.from} from GoDesi.com. Brides and families${where(
          c.city,
        )} search us for bridal makeup, mehendi, threading and salon services, and ${c.business} has a page there.`,
        `Your work is the pitch — an album of your own photos, your bridal package price and whether you travel to the venue.`,
        close(c, `Send me your album link or a few photos and I'll add them.`),
      ].join("\n\n"),
    call: (c) =>
      [
        `Namaste 🙏 Is this ${c.business}?`,
        ``,
        `I'm from GoDesi.com — brides near you use our site to find makeup and mehendi artists. Your page is already on it; claiming it is free and then your photos and bridal prices go on.`,
        ``,
        `Do you do bridal at the venue, or at your studio?`,
      ].join("\n"),
    objections: [
      {
        question: "I post everything on Instagram.",
        answer:
          "Keep doing that — we link your Instagram from the page. The difference is a bride searching for makeup in your town finds you here without knowing your handle.",
      },
      ...DEFAULT_PITCH.objections.slice(1),
    ],
  },
  {
    slug: "community-orgs",
    label: "Community & Nonprofit",
    icon: "🤝",
    hook: "Associations and nonprofits — free listing, free events, free news posts.",
    subject: (c) => `${c.business} — free listing and event posts on GoDesi`,
    email: (c) =>
      [
        `Namaste 🙏`,
        `I'm ${c.from} from GoDesi.com, a desi community directory. We list associations and nonprofits${where(
          c.city,
        )} free, and you can post your events and notices free as well — free-entry events cost nothing at all, and paid tickets can be sold through us.`,
        `We already hold a page for ${c.business}. Claiming it lets you keep your committee's contact and your event calendar current.`,
        close(c, `Who is your secretary or media person? I'll hand the page to them.`),
      ].join("\n\n"),
    call: (c) =>
      [
        `Namaste 🙏 I'm from GoDesi.com — a desi community directory.`,
        ``,
        `We list community organisations free, and your events too. ${c.business} already has a page on the site; I'm ringing so your committee can take charge of it and start posting your programmes.`,
        ``,
        `Who looks after your publicity?`,
      ].join("\n"),
    objections: [
      {
        question: "Will you charge us later?",
        answer:
          "No. Community and nonprofit listings and free-entry events are free, and that's written on the page. Paid plans are only for businesses wanting extras.",
      },
    ],
  },
  {
    slug: "financial-services",
    label: "Financial Services",
    icon: "💰",
    hook: "Money transfer, mortgages, tax and investment help for desi families.",
    subject: (c) => `${c.business} — your page on GoDesi`,
    email: (c) =>
      [
        `Hello,`,
        `I'm ${c.from} from GoDesi.com. Desi families${where(
          c.city,
        )} search us for money transfer, mortgages, tax filing and investment advice, and ${c.business} already has a page.`,
        `Rates and specifics decide these calls: which services you offer, your licence or registration number, and how a new client starts.`,
        close(c, `Reply with those and I'll finish the page.`),
      ].join("\n\n"),
    call: (c) =>
      [
        `Namaste 🙏 Is this ${c.business}?`,
        ``,
        `I'm from GoDesi.com — desi families near you look for mortgage, tax and remittance help on our site. Your page is there and unclaimed; it's free to claim and then you can list your services and licence.`,
        ``,
        `Which service brings you most enquiries?`,
      ].join("\n"),
    objections: DEFAULT_PITCH.objections,
  },
  {
    slug: "health-medical",
    label: "Health & Medical",
    icon: "🩺",
    hook: "Doctors, dentists, ayurveda and therapists who speak the language.",
    subject: (c) => `${c.business} — patients looking for desi-language care`,
    email: (c) =>
      [
        `Hello,`,
        `I'm ${c.from} from GoDesi.com. Patients${where(
          c.city,
        )} come to us specifically to find a doctor, dentist, therapist or ayurvedic practitioner who speaks their language, and ${c.business} has a page already.`,
        `What matters on it: your specialisation, languages, insurance accepted and clinic hours.`,
        close(c, `Tell me those four and the page is done.`),
      ].join("\n\n"),
    call: () =>
      [
        `Namaste 🙏 May I speak to the practice manager?`,
        ``,
        `I'm from GoDesi.com — patients use our site to find doctors who speak Hindi, Gujarati, Tamil and so on. Your clinic already has a page; claiming it is free and lets you show your hours and the insurance you accept.`,
        ``,
        `Which languages does the doctor speak?`,
      ].join("\n"),
    objections: [
      {
        question: "We can't advertise like that.",
        answer:
          "It's a directory listing with your hours and languages, no claims or prices — the same information as your own website.",
      },
      ...DEFAULT_PITCH.objections.slice(1),
    ],
  },
  {
    slug: "real-estate",
    label: "Real Estate & Homes",
    icon: "🏡",
    hook: "Buyers and tenants searching by town — and a property board to post on.",
    subject: (c) => `${c.business} — post your listings on GoDesi free`,
    email: (c) =>
      [
        `Namaste 🙏`,
        `I'm ${c.from} from GoDesi.com. Desi buyers and tenants${where(
          c.city,
        )} search our property board, and agents post their listings there free. ${c.business} already has an agent page on the site.`,
        `Claim it and you get your licence number, areas served and languages on it, plus your own listings feed.`,
        close(c, `Shall I walk you through posting your first property?`),
      ].join("\n\n"),
    call: (c) =>
      [
        `Namaste 🙏 Is this ${c.business}?`,
        ``,
        `I'm from GoDesi.com — desi buyers and renters near you use our property board. You already have an agent page; claiming it is free and you can post listings straight away.`,
        ``,
        `Are you working mostly sales or rentals right now?`,
      ].join("\n"),
    objections: [
      {
        question: "I'm on Zillow already.",
        answer:
          "We link your Zillow and Realtor profiles from the page. What we add is the desi buyer who searches in their own language and wants an agent from the community.",
      },
      ...DEFAULT_PITCH.objections.slice(1),
    ],
  },
  {
    slug: "shops-retail",
    label: "Shops & Retail",
    icon: "🛍️",
    hook: "Grocery, sweets, jewellery and clothing — found by town and timings.",
    subject: (c) => `${c.business} — your shop page on GoDesi`,
    email: (c) =>
      [
        `Namaste 🙏`,
        `I'm ${c.from} from GoDesi.com. People${where(
          c.city,
        )} search us for desi grocery, sweets, jewellery and clothing shops, and ${c.business} has a page there.`,
        `Timings, a couple of photos of the shop and your current offers are what bring somebody in this week.`,
        close(c, `Send me your timings and any offer and I'll put it up today.`),
      ].join("\n\n"),
    call: (c) =>
      [
        `Namaste 🙏 Is this ${c.business}?`,
        ``,
        `I'm from GoDesi.com — the desi directory for ${near(c.city)}. Your shop is already listed on our site; I'm ringing so you can claim it, put your timings and offers on, and be found by people nearby. It's free.`,
        ``,
        `What are your opening hours?`,
      ].join("\n"),
    objections: DEFAULT_PITCH.objections,
  },
  {
    slug: "home-services",
    label: "Home Services",
    icon: "🔧",
    hook: "Plumbers, electricians, cleaning and AC repair — urgent, local searches.",
    subject: (c) => `${c.business} — local jobs on GoDesi`,
    email: (c) =>
      [
        `Namaste 🙏`,
        `I'm ${c.from} from GoDesi.com. Desi families${where(
          c.city,
        )} post jobs on our requirements board — repairs, cleaning, AC, moving — and tradespeople answer them. ${c.business} has a page already.`,
        `Claim it and add the areas you cover, your hours and whether you do emergency call-outs.`,
        close(c, `Which towns do you cover? I'll add them for you.`),
      ].join("\n\n"),
    call: (c) =>
      [
        `Namaste 🙏 Is this ${c.business}?`,
        ``,
        `I'm from GoDesi.com — desi families near you post repair and cleaning jobs on our board. Your page is already on the site; claim it free and customers can reach you from it.`,
        ``,
        `Which areas do you cover, and do you take emergency calls?`,
      ].join("\n"),
    objections: DEFAULT_PITCH.objections,
  },
  {
    slug: "auto-services",
    label: "Auto & Vehicle Services",
    icon: "🚗",
    hook: "Repairs, driving schools and dealers, searched locally.",
    subject: (c) => `${c.business} — your page on GoDesi`,
    email: (c) =>
      [
        `Namaste 🙏`,
        `I'm ${c.from} from GoDesi.com. People${where(
          c.city,
        )} search us for garages, driving instructors and dealers from the community, and ${c.business} has a page already.`,
        `Add the services you do, your hours and whether you give free estimates and it starts working.`,
        close(c, `Tell me your services and hours and I'll finish it.`),
      ].join("\n\n"),
    call: (c) =>
      [
        `Namaste 🙏 Is this ${c.business}?`,
        ``,
        `I'm from GoDesi.com — the desi directory. Your garage is already listed with us; claiming the page is free and you can put your services, hours and offers on it.`,
        ``,
        `Do you do free estimates?`,
      ].join("\n"),
    objections: DEFAULT_PITCH.objections,
  },
  {
    slug: "rooms-roommates",
    label: "Rooms & Roommates",
    icon: "🛏️",
    hook: "Students and new arrivals looking for a desi-friendly room.",
    subject: (c) => `${c.business} — post rooms on GoDesi free`,
    email: (c) =>
      [
        `Namaste 🙏`,
        `I'm ${c.from} from GoDesi.com. Students and newly arrived families${where(
          c.city,
        )} search our rooms board every day, and posting is free.`,
        `${c.business} already has a page with us. Claim it and your rooms stay listed with rent, deposit and whether it's veg-only.`,
        close(c, `Do you have anything vacant this month? I'll post it with you.`),
      ].join("\n\n"),
    call: (c) =>
      [
        `Namaste 🙏 Is this ${c.business}?`,
        ``,
        `I'm from GoDesi.com — students and new arrivals look for rooms on our site. Posting is free and your page is already there; I'm ringing so you can claim it.`,
        ``,
        `Do you have a room vacant now?`,
      ].join("\n"),
    objections: DEFAULT_PITCH.objections,
  },
  {
    slug: "education",
    label: "Education & Training",
    icon: "📚",
    hook: "Parents looking for tuition, music, dance and coaching classes.",
    subject: (c) => `${c.business} — parents searching for classes on GoDesi`,
    email: (c) =>
      [
        `Namaste 🙏`,
        `I'm ${c.from} from GoDesi.com. Desi parents${where(
          c.city,
        )} search us for tuition, Bharatanatyam, music, chess and coaching classes, and ${c.business} has a page already.`,
        `Parents choose on the details: ages you teach, batch timings, fees and whether it's online or in person.`,
        close(c, `Send me your batches and fees and I'll set the page up.`),
      ].join("\n\n"),
    call: (c) =>
      [
        `Namaste 🙏 Is this ${c.business}?`,
        ``,
        `I'm from GoDesi.com — desi parents near you look for classes on our site. Your page is already there; claiming it is free and then your batches, ages and fees go on it.`,
        ``,
        `What ages do you teach, and are the classes online or in person?`,
      ].join("\n"),
    objections: DEFAULT_PITCH.objections,
  },
  {
    slug: "care-services",
    label: "Care Services",
    icon: "🧑‍🍼",
    hook: "Nannies, elder care and daycare — trust-led, local searches.",
    subject: (c) => `${c.business} — your care listing on GoDesi`,
    email: (c) =>
      [
        `Namaste 🙏`,
        `I'm ${c.from} from GoDesi.com. Families${where(
          c.city,
        )} search us for daycare, nannies and elder care from within the community, and ${c.business} has a page already.`,
        `For care work people look for your licence, your years of experience and references — those go on the page.`,
        close(c, `Are you licensed? I'll add it to the page with your hours.`),
      ].join("\n\n"),
    call: (c) =>
      [
        `Namaste 🙏 Is this ${c.business}?`,
        ``,
        `I'm from GoDesi.com — desi families near you look for daycare and elder care on our site. Your listing is already there; claiming it is free and you can show your licence and experience.`,
        ``,
        `Are you licensed, and what hours do you cover?`,
      ].join("\n"),
    objections: DEFAULT_PITCH.objections,
  },
  {
    slug: "professionals",
    label: "Professionals & Experts",
    icon: "🎓",
    hook: "A free professional profile, and the Elite directory above it.",
    subject: (c) => `${c.business} — your professional profile on GoDesi`,
    email: (c) =>
      [
        `Hello,`,
        `I'm ${c.from} from GoDesi.com. We keep a free directory of desi professionals at godesi.com/professionals — anybody with a complete profile appears there automatically — and ${c.business} already has a page on the site.`,
        `Above it sits GoDesi Elite (godesi.com/desi-elite): a reviewed list of recognised founders and leaders, with an interview. That one is paid — $500 for a year, or $250 for five years on the current offer.`,
        close(c, `Start with the free profile; if you'd like to be considered for Elite I'll send the form.`),
      ].join("\n\n"),
    call: (c) =>
      [
        `Namaste 🙏 Am I speaking with ${c.business}?`,
        ``,
        `I'm from GoDesi.com. We list desi professionals free, and your page is already on the site. Complete it and you appear in our professionals directory automatically.`,
        ``,
        `There's also GoDesi Elite — reviewed, with an interview, $500 a year or $250 for five years on the current offer. Shall I send you both links?`,
      ].join("\n"),
    objections: [
      {
        question: "What do I get for the Elite fee?",
        answer:
          "A reviewed profile in the Elite directory, an interview written up, the badge for your own site and social posts, and five years for $250 on the current offer. The free professional listing stays free either way.",
      },
      ...DEFAULT_PITCH.objections.slice(1),
    ],
  },
];

export function pitchFor(categorySlug: string | null): ProspectPitch {
  return (
    PROSPECT_PITCHES.find((pitch) => pitch.slug === categorySlug) ?? DEFAULT_PITCH
  );
}

export { DEFAULT_PITCH };
