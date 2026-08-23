/**
 * The staff handbook: one written procedure per beat, so a new moderator can be
 * given a login and a section and know exactly what to do without being taught
 * it in person. Content only — the pages under /admin/handbook render it.
 */

export type HandbookScript = { label: string; hint?: string; text: string };
export type HandbookStep = { title: string; detail: string };
export type HandbookLink = { label: string; href: string };

export type HandbookPlaybook = {
  slug: string;
  title: string;
  icon: string;
  /** One line for the index card. */
  blurb: string;
  /** Who this section is for and what "done" looks like for her week. */
  goal: string;
  /** The honest pitch: what a member gets here that other sites do not give. */
  whyUs: string[];
  /** Where the prospects already are on our own site. */
  wherePeopleAre: HandbookLink[];
  steps: HandbookStep[];
  /** Everything she must have in hand before a page can go live. */
  collect: string[];
  scripts: HandbookScript[];
  objections: { question: string; answer: string }[];
  /** Beat-specific lines on top of the house rules. */
  rules: string[];
  /** Numbers to aim at, so she can measure her own day. */
  targets: string[];
};

const HOUSE_RULES = [
  "Never promise a price, a placement or a refund that is not written on the page you are sending. If you are not sure, ask before you answer.",
  "Never publish a phone number, email, WhatsApp number or home address that the owner has not told you to show. Optional fields stay empty unless they ask.",
  "Never copy a description, a photo or a review from another website. Write it in our own words, or ask the owner to send their own text and pictures.",
  "Never mark a claim approved because the person is pleasant. Approve only when the email, the number or the website line up with the listing.",
  "Never argue with a member in public — on a review, a comment or a social post. Move it to WhatsApp or email and tell your admin.",
  "One person, one account. Do not share your login, and do not sign in for a member using their password.",
];

export const HANDBOOK_HOUSE_RULES = HOUSE_RULES;

export const HANDBOOK_ONBOARDING: HandbookStep[] = [
  {
    title: "Sign up like any member",
    detail:
      "Go to godesi.com/signup with your own email and set a password. Verify the email that arrives. Do not create a second account later — everything you do is recorded against this one.",
  },
  {
    title: "Send your email to the admin",
    detail:
      "He searches your email on the team page and presses Make moderator. Until he does, /admin pages will simply send you back to your dashboard.",
  },
  {
    title: "Open the content desk",
    detail:
      "Once approved, go to /admin/content. That is your workplace: events, business cards and listings, news, reviews, blog, resource links and temples, and whichever of those you were given.",
  },
  {
    title: "Read your section's procedure here",
    detail:
      "Read this handbook page for your beat end to end before you contact anybody. It tells you what we offer, what it costs, what to say, what to collect, and what you must never do.",
  },
  {
    title: "Work the list, write down the outcome",
    detail:
      "Every person you contact gets a note: contacted, waiting, listed, refused. Use the outreach desk where it exists so nobody is messaged twice by two of us.",
  },
];

export const HANDBOOK_WHAT_WE_ARE = [
  "Godesi.com is a desi directory and marketplace: free digital business cards with a QR code and a WhatsApp button, a requirements board where customers post what they need, events with ticketing, property, rooms, jobs, news and the Elite section.",
  "A listing is free and stays free. Pro is $5.99 (₹499) and Premium is $11.99 (₹999) — that is the whole price list for a member. We charge no commission on enquiries.",
  "Whatever a member puts on Godesi also publishes to our own network — godesi.wiki, eventringer.com for events, djs.wiki for the music trades, desiwhoswho.com for Elite — free for the first year. Nobody else in this market gives a small business four sites for nothing.",
  "Many pages already exist as unclaimed listings we built from public sources. Your job is usually not to sell — it is to tell the real owner that their page is already there, and hand it over.",
];

export const HANDBOOK_PLAYBOOKS: HandbookPlaybook[] = [
  {
    slug: "events",
    title: "Events",
    icon: "🎟️",
    blurb:
      "Get imported events claimed by the real organiser, then get them selling tickets here.",
    goal:
      "Every event on Godesi should end up owned by the organiser who is running it, with tickets sold on our page instead of somebody else's. Your week is good if organisers claimed events and at least a few of them switched their ticket link to us.",
    whyUs: [
      "Listing an event costs nothing, on any plan, for as many events as they like.",
      "Free-entry events never pay us anything at all — no ticket, no fee.",
      "On paid tickets we keep 2% on the free plan and nothing on Pro ($5.99) or Premium ($11.99). The card processor takes its own ~3% whichever plan they are on. Most ticket sites take several times that and add a booking fee on top, which their buyer pays.",
      "100 seats at $20 is $2,000: we keep $40 on the free plan, and nothing at all on a plan that costs less than three tickets. That is the whole argument — say it with their own numbers.",
      "QR tickets by email, price tiers, coupon codes, a live seat count, and on Premium the ticket money goes straight into their own Stripe account.",
      "One post appears on Godesi, EventRinger.com, godesi.wiki and their category page, with add-to-calendar for attendees and an embed code for their own website.",
      "Everything above is written out at /events/how-it-works. Send that link rather than typing your own version of the fees.",
    ],
    wherePeopleAre: [
      { label: "Imported events waiting for an owner", href: "/admin/events/wire" },
      { label: "The events desk (approve, edit, reject)", href: "/admin/events" },
      { label: "The public events board", href: "/events" },
      { label: "The page you send organisers", href: "/events/how-it-works" },
      { label: "Claims waiting for a decision", href: "/admin/claims#event-claims" },
    ],
    steps: [
      {
        title: "Pick events that are still imported",
        detail:
          "On an imported event page the ticket box says Godesi does not sell tickets for it and sends the visitor to the organiser's own page. Those are your leads: the traffic is already ours, the money is going elsewhere.",
      },
      {
        title: "Find the organiser, not the ticket site",
        detail:
          "Use the organiser's own website, their Facebook or Instagram page for the event, or the temple or association running it. Public contact details only. Never sign into anything, and never scrape a page that needs a login.",
      },
      {
        title: "Open with their page, not with a pitch",
        detail:
          "Send them the live Godesi page for their event first. They can see it is real, already indexed and already sending them visitors. Then tell them they can claim it free.",
      },
      {
        title: "Walk them through the claim",
        detail:
          "They sign in on Godesi, open their event page and press Claim this event — it's free in the green box, then write who they are and leave an email or number we can check. Tell them plainly that nothing on the page changes until we approve.",
      },
      {
        title: "Verify before you recommend approval",
        detail:
          "Good proof: an email on the event's own domain, a number that matches the poster or website, or a reply from the event's own social account. Weak proof: a free email address and 'trust me'. Write what you checked into the claim note so the admin can see it.",
      },
      {
        title: "Then help them switch the tickets over",
        detail:
          "This is the part that earns. Sit with them (WhatsApp is fine) while they set price tiers, seat counts and a coupon code, and explain that buyers get a QR ticket by email. On Premium, point them at Stripe so the money reaches them as tickets sell.",
      },
      {
        title: "Finish the page properly",
        detail:
          "Category and event type, venue picked from the list so the address and map fill in, start and end time in the venue's own time zone, one YouTube clip, a public Google Photos album, line-up or speakers, and the embed code for their own site.",
      },
      {
        title: "Tell them where else it went",
        detail:
          "Show them the same event live on EventRinger.com and godesi.wiki. This is what makes them post the next one here first.",
      },
    ],
    collect: [
      "Event title, and one honest paragraph in their words about what it is",
      "Date, start time, end time — and confirm the city's time zone",
      "Venue name and full address, or the online joining link for an online event",
      "Whether entry is free or ticketed; every ticket type with its price and how many seats",
      "Any coupon or early-bird they want, with the last date",
      "Organiser name as it should appear publicly, plus the contact they are happy to show",
      "A poster or cover picture they own the rights to, sized landscape if possible",
      "One YouTube link and a public Google Photos album link, if they have them",
      "Line-up, artists or speakers, and the language of the programme",
      "For ticketing: who receives the money, and on Premium their Stripe account",
    ],
    scripts: [
      {
        label: "WhatsApp — first message to an organiser",
        hint: "Paste their event name and the Godesi link in place of the brackets.",
        text: `Namaste 🙏

Your event [EVENT NAME] is already listed on Godesi and getting visitors here:
[GODESI EVENT LINK]

We built the page from your public listing, so right now anyone wanting tickets is sent back to the other site. You can claim the page free and sell the same seats here instead — listing is free, and we keep 2% of ticket money on the free plan and nothing at all on a paid plan (₹499 / $5.99).

On 100 tickets at $20 that is $40 versus nothing, against the much bigger cut the ticket sites take from you and your buyers.

Fees, tickets and where you get listed: https://godesi.com/events/how-it-works

Shall I help you claim it? It takes two minutes.`,
      },
      {
        label: "WhatsApp — after they claim",
        text: `Thank you — the claim is in, and our admin approves it once we can match your email or number to the event. Nothing on the page changes until then.

Once it is yours you can set ticket prices and seat counts, add a coupon code, and buyers get a QR ticket by email. On Premium the money goes straight into your own Stripe account.

The same page also publishes free to EventRinger.com and GoDesi.wiki, and we give you a code to show the event on your own website.

Send me the poster, the ticket prices and the venue name and I will set it up with you.`,
      },
      {
        label: "Phone opening — 20 seconds",
        text: `Namaste, this is [NAME] from Godesi.com, the desi directory. Your event is already on our events board and people are finding it there — I am calling because the ticket link still goes to the other site, and you can take that page over free and sell the tickets yourself through us. We keep 2% on the free plan and nothing on a plan that costs less than three tickets. Can I send you the link on WhatsApp?`,
      },
    ],
    objections: [
      {
        question: "I already sell on another site.",
        answer:
          "Keep them both — nothing stops you. Put our link on your poster and compare what lands in your account after fees. On free entry we take nothing at all.",
      },
      {
        question: "Will I get my money?",
        answer:
          "On the free and Pro plans we collect and send it after the event. On Premium it goes into your own Stripe account as tickets sell, so it never sits with us.",
      },
      {
        question: "I do not want the hassle of setting it up.",
        answer:
          "The page already exists — I built it. Send me the prices, the poster and the venue and I will fill it in while you are on WhatsApp with me.",
      },
      {
        question: "Why is my event on your site at all?",
        answer:
          "It was on a public listing and we list community events so people can find them. It credits where we first listed it. If you would rather it came down, say so and I will remove it today.",
      },
    ],
    rules: [
      "Never say Godesi is selling tickets for an event that is still imported — until the organiser claims it and the admin approves, tickets are the other site's.",
      "Leave the source credit and the organiser's own link on the page. Do not quietly delete where it came from.",
      "If an organiser asks for the listing to be removed, remove it and tell your admin. Do not negotiate.",
      "Do not re-type an event's blurb from the other site. Ask the organiser for their words, or write a plain factual line.",
    ],
    targets: [
      "20 organisers contacted a day, each with their own live Godesi link in the message",
      "Every contact noted so nobody is messaged twice",
      "5 claims a week that pass verification",
      "2 organisers a week actually selling tickets on Godesi — this is the number that counts",
    ],
  },
  {
    slug: "djs",
    title: "DJs & music trades",
    icon: "🎧",
    blurb: "DJs, dhol, bands, singers and MCs — free listing plus a free DJs.wiki page.",
    goal:
      "Fill the five music categories with real, approved cards, each one complete enough that a bride can choose from it — and get them onto DJs.wiki, which is the hook nobody else has.",
    whyUs: [
      "Free listing with a proper showreel: a DJ's card takes one YouTube video free, six on Pro and twelve on Premium, plus photos from their own Google Photos album.",
      "A free DJs.wiki page for a year — the same card published on a domain that is only about desi DJs and music. That is the line that gets the reply.",
      "The card asks the questions a couple actually asks: music languages, rig and lighting, packages, event types, travel radius, years of experience, whether they bring their own sound, whether they work alongside another DJ.",
      "A QR code and a WhatsApp button, so a card handed out at a wedding opens their page and a chat.",
      "Enquiries come to them directly and we take no commission. Pro shows their phone and email on the card; Premium unlocks the contact details on requirement posts, which is where the couples are.",
      "They also appear on godesi.wiki and, when they play a public night, on EventRinger.",
    ],
    wherePeopleAre: [
      { label: "DJ & Sound", href: "/categories/events-wedding-dj-and-sound" },
      { label: "Dhol & Baraat", href: "/categories/events-wedding-dhol-and-baraat" },
      { label: "Live Bands", href: "/categories/events-wedding-live-bands" },
      { label: "Anchors & Artists (singers, MCs)", href: "/categories/events-wedding-anchors-and-artists" },
      {
        label: "Stage & Sound Rentals",
        href: "/categories/events-wedding-stage-and-sound-rentals",
      },
      { label: "Unclaimed cards to invite", href: "/admin/outreach" },
      { label: "The site they get for free", href: "https://djs.wiki" },
    ],
    steps: [
      {
        title: "Work the unclaimed cards first",
        detail:
          "The outreach desk lists businesses we built from public sources with no owner yet, with a ready WhatsApp invite. Their page already exists, so the conversation starts warm.",
      },
      {
        title: "Then go where DJs advertise themselves",
        detail:
          "Public Facebook and Instagram business pages, their own websites, wedding-expo listings. Public contact details only, and never a page behind a login.",
      },
      {
        title: "Lead with DJs.wiki",
        detail:
          "Free for a year on a domain built only for desi DJs, fed automatically from the Godesi card. Say it in the first two lines.",
      },
      {
        title: "Get the card finished the same day",
        detail:
          "A half-empty card does not win work and makes DJs.wiki look thin. Sit on WhatsApp with them and fill music languages, services, rig, packages, event types and travel radius before you close the chat.",
      },
      {
        title: "Push for one video and the album",
        detail:
          "One clip of a real floor is worth more than any description. If they only have Instagram footage, ask them to upload it to YouTube — even unlisted works.",
      },
      {
        title: "Show them the requirements board",
        detail:
          "Couples post what they need with date and budget. Free and Pro see the post; Premium unlocks the contact. This is the honest reason to upgrade — do not sell Premium any other way.",
      },
      {
        title: "Approve and check the result",
        detail:
          "Approve the card on the listings desk, then open their DJs.wiki entry and their category page and make sure both look right on a phone.",
      },
    ],
    collect: [
      "Business or artist name, and the city they are based in",
      "Services they actually do — DJ, dhol, live band, singer, MC, lighting, stage and sound hire",
      "Music languages and styles: Hindi, Punjabi, Bollywood, Gujarati, Tamil, Telugu, English and so on",
      "What they bring: decks, speakers, mics, uplighting, LED wall, smoke, cold sparklers, own generator",
      "Packages and rough price band, and what a package includes in hours",
      "Event types: wedding, sangeet, garba, reception, corporate, NYE, temple programme, birthday",
      "Travel radius in miles or kilometres, and whether travel is charged",
      "Years of experience and roughly how many events a year",
      "One or more YouTube links, and a public Google Photos album",
      "Logo or cover picture they own, plus what contact they want shown",
      "Payment methods, and whether they take a deposit",
    ],
    scripts: [
      {
        label: "WhatsApp — invite a DJ",
        text: `Namaste 🙏

I am [NAME] from Godesi.com, the desi directory. We have started DJs.wiki — a site only for desi DJs, dhol players, bands, singers and MCs — and for the first year the listing is free.

You list once on Godesi (also free) and the same card publishes on DJs.wiki, with your music languages, rig, packages, event types, travel radius, videos and photos: [GODESI CARD OR CATEGORY LINK]

Enquiries come straight to you and we take no commission. Couples also post what they need here with the date and budget, so you can approach them.

Send me your services, music languages, what equipment you bring and one YouTube clip, and I will build the page for you today.`,
      },
      {
        label: "WhatsApp — chasing the missing details",
        text: `Your page is live: [LINK]

Two things still empty, and they are the two people search on — the music languages you play and the equipment you bring. Send me those plus one video of a real event and I will finish it, and it will look much better on DJs.wiki too.`,
      },
    ],
    objections: [
      {
        question: "I get all my work from Instagram.",
        answer:
          "Keep it. This is where somebody searching 'Punjabi DJ near me' finds you, and it costs nothing. Your Instagram cannot show your rig, languages, packages and travel radius in a way people can filter.",
      },
      {
        question: "What is the catch on free?",
        answer:
          "None. The card is free forever and DJs.wiki is free for the first year. Pro at $5.99 shows your phone and email on the card; Premium unlocks contacts on the couples' requirement posts. Nothing is hidden and there is no commission.",
      },
      {
        question: "There are hardly any DJs on it yet.",
        answer:
          "True, and that is why being on it now is worth it — you are at the top of a new site instead of page nine of an old one.",
      },
    ],
    rules: [
      "Do not copy a DJ's write-up or photos from their Instagram or another directory. Ask them to send it.",
      "Do not put someone's mobile number on the card unless they said to show it.",
      "Do not promise a spot on the DJs.wiki front page — the ordering is automatic.",
      "Do not approve a card with no services and no city. It helps nobody and it makes the site look empty.",
    ],
    targets: [
      "15 DJs or artists invited a day",
      "5 complete cards approved a week — complete meaning services, languages, rig, area and one photo",
      "3 with a video",
      "Check the five category pages weekly and clear anything half-finished",
    ],
  },
  {
    slug: "astrologers",
    title: "Astrologers & pandits",
    icon: "🔮",
    blurb: "Astrologers, horoscope matching and pandits — careful, respectful listings.",
    goal:
      "A complete astrologer and pandit section people trust: what they practise, which languages, in person or online, and how to reach them — with no medical or money claims on the page.",
    whyUs: [
      "Free listing that names their actual practice — Vedic, KP, Nadi, Western, numerology, vastu, palmistry, gemstones, horoscope matching, muhurat.",
      "Consultation by phone, WhatsApp video or in person, and they can say which, so nobody rings them at the wrong time.",
      "Languages spoken shown on the card, which for this trade is the main reason someone calls one person and not another.",
      "A QR code for their own visiting card and a WhatsApp button, which suits a practice run from home.",
      "Wedding families search for horoscope matching and muhurat inside our wedding section, and temples and pooja services sit right next to them.",
      "Free membership on godesi.wiki for the first year, and no commission on any consultation.",
    ],
    wherePeopleAre: [
      { label: "Astrologers (professionals)", href: "/categories/professionals-astrologers" },
      {
        label: "Astrologers (religious services)",
        href: "/categories/religious-services-astrologers",
      },
      {
        label: "Horoscope matching (wedding)",
        href: "/categories/events-wedding-astrologers-and-horoscope-matching",
      },
      { label: "Pandits", href: "/categories/events-wedding-pandits" },
      { label: "Temples desk", href: "/admin/temples" },
      { label: "Unclaimed cards to invite", href: "/admin/outreach" },
    ],
    steps: [
      {
        title: "Start with temples and pooja services",
        detail:
          "Temples know every pandit and most astrologers in the city, and an introduction from a temple is worth fifty cold messages. Ask the temple office if you may list the priests who serve there.",
      },
      {
        title: "Be respectful in the first line",
        detail:
          "Many are older and are not selling anything. Explain that families are searching for this and cannot find them, and that the listing is free.",
      },
      {
        title: "Write the practice down precisely",
        detail:
          "Vedic, KP, Nadi, numerology, vastu, palmistry, gemstone advice, horoscope matching, muhurat, naming a baby, remedies. Precision is what makes the page useful.",
      },
      {
        title: "Set the consultation detail",
        detail:
          "In person at their place, at the client's home, phone, WhatsApp video, Zoom. Hours they take calls, and whether they consult on particular days only.",
      },
      {
        title: "Keep the claims clean",
        detail:
          "No cure, no guaranteed result, no 'get your visa', no 'get your husband back', no money-back promise. If their own text says that, ask them to change it or write a plain factual line yourself.",
      },
      {
        title: "Finish with languages and area",
        detail:
          "Languages spoken, city and how far they travel, and for pandits the ceremonies they perform and whether they bring samagri.",
      },
    ],
    collect: [
      "Name as they wish to be known, and the city",
      "What they practise, named exactly",
      "Years of practice, and lineage or training if they want it shown",
      "Languages they consult in",
      "How they consult: in person, phone, WhatsApp video, Zoom — and their hours",
      "Whether they travel to homes, temples or venues, and how far",
      "For pandits: ceremonies performed, whether samagri is included, indoor or outdoor",
      "Fee band if they are willing to show one, or 'on enquiry'",
      "A photo they own, and what contact they want shown",
      "Payment methods accepted",
    ],
    scripts: [
      {
        label: "WhatsApp — respectful first message",
        text: `Namaste 🙏

I am [NAME] from Godesi.com, a desi directory for our community here. Families search on our site for astrologers, horoscope matching and pandits for pooja and muhurat, and I would like to list you so they can find you.

There is no charge — the listing is free, enquiries come directly to you and we take no commission. Your page can show what you practise, the languages you speak, whether you consult in person, on phone or on WhatsApp video, and your hours.

If you agree, please tell me: what you practise, languages, how you like to be contacted, and your city. I will prepare the page and send it to you to check before it goes live.`,
      },
      {
        label: "WhatsApp — asking a temple for introductions",
        text: `Namaste 🙏

I am [NAME] from Godesi.com. We list temples and pooja services free so families can find timings and priests, and your temple's page is here: [LINK]

May I also list the pandits and astrologers who serve at the temple? It is free for them, enquiries go straight to them, and it saves your office answering the same phone calls. I will send each page to them to approve before it goes live.`,
      },
    ],
    objections: [
      {
        question: "I do not want my phone number on the internet.",
        answer:
          "Then we do not put it. Leave the phone field empty and no number appears — enquiries reach you through the page instead.",
      },
      {
        question: "I do not need advertising.",
        answer:
          "This is not advertising you pay for. It is so that a family new to the city can find you at all, and it costs nothing.",
      },
      {
        question: "Can you write that I solve problems and give guaranteed results?",
        answer:
          "I cannot put guarantees or cures on the page — that is a rule for every listing on the site. I can write your practice, your experience and your languages, which is what people actually search for.",
      },
    ],
    rules: [
      "No page may promise a cure, a visa, a marriage, a court result or money back. Refuse it politely, every time.",
      "No black magic, vashikaran or 'bring your lover back' wording. If they insist, do not list them and tell your admin.",
      "Do not publish a home address unless they specifically ask for it. A city is enough.",
      "Do not copy a horoscope reading, an article or photographs from another site.",
    ],
    targets: [
      "10 astrologers or pandits approached a day, temples first",
      "3 complete cards a week, each with practice, languages and consultation method filled",
      "Every new card read once for claims wording before you approve it",
    ],
  },
  {
    slug: "it-companies",
    title: "IT companies & training",
    icon: "💻",
    blurb: "Software firms, web and app shops, staffing and IT training institutes.",
    goal:
      "A credible business-to-business section: software and web companies, staffing and consulting firms, and IT training institutes with real course and placement detail.",
    whyUs: [
      "Free company page with services, technologies, industries served, team size and the cities they cover.",
      "Pro shows the phone and email on the card and gives twenty photos and six videos — enough for case-study screenshots and a demo reel.",
      "Premium unlocks contact details on requirement posts, which is where a business asking for a website or a Salesforce contractor actually appears.",
      "Training institutes get to state courses, batch timings, online or classroom, OPT and CPT support, interview and resume prep, and placement assistance in the form students search for.",
      "Business banners are available when they want reach rather than a listing: in-content leaderboard from $39 a month, homepage hero $179, and impression packs — sold at /advertise, never invented by you.",
      "Free godesi.wiki membership for the first year and no commission on any deal.",
    ],
    wherePeopleAre: [
      { label: "Software Companies", href: "/categories/business-services-software-companies" },
      {
        label: "Web & App Development",
        href: "/categories/business-services-web-and-app-development",
      },
      { label: "Digital Marketing", href: "/categories/business-services-digital-marketing" },
      { label: "IT Training & Career Services", href: "/categories/it-training" },
      {
        label: "Staffing & Consulting",
        href: "/categories/it-training-staffing-and-consulting",
      },
      { label: "Requirement posts from buyers", href: "/leads" },
      { label: "Banner prices", href: "/advertise" },
    ],
    steps: [
      {
        title: "Go for owners, not switchboards",
        detail:
          "In small IT firms the founder answers. Public LinkedIn company pages, their own site's contact page, chamber-of-commerce and desi association member lists. Public contact details only.",
      },
      {
        title: "Pitch the buyers, not the directory",
        detail:
          "They do not care about being listed. They care that desi businesses on our site post work — a restaurant wanting a website, a realtor wanting a CRM, a clinic wanting booking software. Lead with that.",
      },
      {
        title: "Make them pick narrow services",
        detail:
          "'Software development' wins nothing. Push for the specifics: Shopify stores, WordPress, React, Salesforce, QuickBooks integrations, mobile apps, staff augmentation, data and reporting.",
      },
      {
        title: "Ask for proof they are allowed to show",
        detail:
          "Client names only with permission, screenshots they own, an anonymous case study otherwise. Never lift a client logo from their site without them saying yes.",
      },
      {
        title: "Training institutes: get the boring facts",
        detail:
          "Course list, duration, fees or fee band, batch timings including weekends, online or classroom, trainer experience, placement support and any OPT or CPT help. Vague course pages do not convert.",
      },
      {
        title: "Show them the requirements board before upgrades",
        detail:
          "Open a live requirement post with them. Free and Pro see the post, Premium unlocks the contact. Let the board do the selling.",
      },
    ],
    collect: [
      "Legal or trading name, city and the cities or countries they serve",
      "Services, named narrowly, and the technologies they work in",
      "Industries they have delivered in",
      "Team size, years in business, and whether they work remote, on-site or hybrid",
      "Engagement model: fixed price, hourly, monthly retainer, staff augmentation — and a rough starting price if they will give one",
      "Case studies or screenshots they own, and any client names they have permission to show",
      "For training: courses, duration, fees, batch timings, online or classroom, trainer experience, placement support, OPT/CPT help",
      "Certifications and partner status: Microsoft, AWS, Google, Salesforce, ISO",
      "Logo, cover picture, website, and the contact they want shown",
      "Payment methods, and whether they invoice",
    ],
    scripts: [
      {
        label: "Email or LinkedIn — first approach",
        text: `Subject: Desi businesses on Godesi are asking for [SERVICE]

Hello [NAME],

I am [NAME] from Godesi.com, a directory and marketplace for the desi community. Businesses on our site post what they need — websites, e-commerce, apps, CRM setups, IT staffing — with a budget and a timeline.

Listing your company is free. Your page shows your services, technologies, industries, team size and the cities you cover, and enquiries come straight to you with no commission. Free plan sees the requirement posts; Premium at $11.99 a month unlocks the requester's contact details.

Here is the section you would sit in: [CATEGORY LINK]

If you send me your services, technologies and a logo I will build the page and send it to you to approve.

Regards,
[NAME] — Godesi.com`,
      },
      {
        label: "WhatsApp — IT training institute",
        text: `Namaste 🙏

I am [NAME] from Godesi.com. Students and OPT/CPT candidates search our IT Training section for courses, batch timings and placement help. Listing your institute is free.

Your page can show each course with duration and fees, weekend and evening batches, online or classroom, trainer experience, interview and resume prep, and placement assistance.

Send me the course list with timings and fees and one photo of the classroom or your logo, and I will set it up today: [CATEGORY LINK]`,
      },
    ],
    objections: [
      {
        question: "We only work through referrals.",
        answer:
          "This is a referral channel — desi businesses posting the exact work they need, in your city. Free to be there, and no commission on anything you win.",
      },
      {
        question: "Is this a lead-selling site?",
        answer:
          "No. We never sell a lead twice or charge per lead. The requirement post is visible to you free; a Premium plan just shows the requester's contact instead of routing through the page.",
      },
      {
        question: "Our marketing team handles listings.",
        answer:
          "Happy to send it to them — it takes ten minutes and it is free. Send me the address and I will prepare the page so they only have to approve it.",
      },
    ],
    rules: [
      "Never quote a price for their work, a timeline or a guarantee of leads.",
      "Never publish a client name or logo without written permission from the company.",
      "Never invent certifications or partner badges. If you cannot verify it, leave it off.",
      "Banner prices come from /advertise only — do not negotiate your own rate.",
    ],
    targets: [
      "20 companies approached a day, by email or LinkedIn",
      "5 complete company pages a week",
      "3 training institutes a week with full course and batch detail",
      "Note every reply, including the refusals, so we do not chase them again",
    ],
  },
  {
    slug: "elite",
    title: "Elite members",
    icon: "🏆",
    blurb: "Desi Who's Who — get seeded profiles claimed, then sell the interview.",
    goal:
      "Every seeded Elite profile either claimed by the person or corrected, and a steady flow of new paid interviews. Elite is the one section where money comes up early, so be exact about what is paid and what is not.",
    whyUs: [
      "Desi Who's Who is a recognition section for people who have built something — business, medicine, law, technology, arts, community work — and it lives on its own domain at desiwhoswho.com as well as on Godesi.",
      "Many well-known names are already there as unclaimed profiles built from public facts. Claiming is free: they correct the details, add their own photo and story and take the profile over.",
      "The paid part is plain: the Elite interview with a 30–60 second video is a one-time $50, a professionally produced three-minute film is $500, and placement boosts are $100, $250 or $500 to sit higher in their section. Nothing else is charged.",
      "The interview can be done by phone, WhatsApp, Zoom or Facebook Live — or skipped if they would rather send written answers.",
      "Elite cards carry a gold border and a larger portrait, and the profile links to their business listing, so recognition also feeds their work.",
      "Profiles also appear on desiwhoswho.com and godesi.wiki, and there is an RSS feed journalists can follow.",
    ],
    wherePeopleAre: [
      { label: "Elite desk", href: "/admin/desi-elite" },
      { label: "Claims waiting", href: "/admin/claims" },
      { label: "The public section", href: "/desi-elite" },
      { label: "How someone applies", href: "/desi-elite/apply" },
      { label: "The standalone site", href: "https://desiwhoswho.com" },
    ],
    steps: [
      {
        title: "Work the unclaimed profiles first",
        detail:
          "They are already published from public facts and already rank. Telling someone their profile exists and inviting them to correct it is a far easier conversation than asking them to buy an interview.",
      },
      {
        title: "Check the facts before you write to them",
        detail:
          "Read the profile against public sources. If something is wrong, fix it before you send the link — being told 'we already published something wrong about you' loses the person.",
      },
      {
        title: "Invite the claim, free",
        detail:
          "They sign in, open their profile and press to claim it, saying who they are. On approval they can edit their story, portrait and links themselves.",
      },
      {
        title: "Only then mention the interview",
        detail:
          "Once the profile is theirs, offer the interview and video — $250 for a year, $500 for five years. It is optional; the profile stays either way. Never suggest a claim depends on paying.",
      },
      {
        title: "Prepare the interview properly",
        detail:
          "Send the questions ahead, agree the channel and a time in their time zone, and collect the portrait and any footage first. Ten minutes of their time, well organised, is what earns the referral to their friends.",
      },
      {
        title: "Publish, then tell them where it went",
        detail:
          "Send them the live Godesi profile, the desiwhoswho.com page and the RSS feed, and ask for two names of people who deserve to be in the section. That is how this beat grows.",
      },
    ],
    collect: [
      "Full name and how it should be spelled and shown",
      "City and state, and the country they came from if they want it shown",
      "Section: business, real estate, finance, healthcare, technology, law, education, arts and media, food, community, religion and culture, sport, public service",
      "Their story in their words: what they built, when, and what it took",
      "Achievements, awards, board positions and community work, with dates",
      "Their business or organisation, and its Godesi listing if it has one",
      "A portrait they own the rights to, taken face-on and not cropped tight",
      "Links they want shown: website, LinkedIn, their organisation",
      "For the interview: preferred channel, a time and their time zone",
      "For the film: photos, footage and any brand material they want used",
      "Which package they chose, and who is paying",
    ],
    scripts: [
      {
        label: "WhatsApp or email — claim an existing profile",
        text: `Respected [NAME],

I am [NAME] from Godesi.com. We publish Desi Who's Who, a recognition section for desis who have built something here, and your profile is already listed from public information:
[PROFILE LINK]

Claiming it is free. Sign in on Godesi, open the profile and claim it — once we verify it is you, you can correct anything, add your own photograph and your own words, and link your organisation.

If anything on it is wrong, tell me and I will fix it today.

The same profile also appears on desiwhoswho.com, our directory site for the community.

Regards,
[NAME] — Godesi.com`,
      },
      {
        label: "After the claim — offering the interview",
        text: `Thank you, the profile is yours now.

If you would like it told properly, we also do an Elite interview: a short conversation by phone, WhatsApp, Zoom or Facebook Live, published on your profile with a 30–60 second video. That is a one-time $50. A professionally produced three-minute film from your own photos and footage is $500.

Both are optional — your profile stays either way, at no cost. If you would like the interview, tell me a time that suits you and your time zone and I will send the questions ahead.`,
      },
      {
        label: "Nomination — someone suggesting a name",
        text: `Namaste 🙏

Thank you for the name. Desi Who's Who is for people who have genuinely built something — a business, a practice, a cause. If you can send me what they have done, their city and a public link about them, I will prepare a profile from public facts and invite them to claim it free.`,
      },
    ],
    objections: [
      {
        question: "Who put me on your site?",
        answer:
          "We did, from public information, because the section is about desis who have built something here. It is free, you can correct or take over the profile, and if you would rather not appear at all I will remove it today.",
      },
      {
        question: "Do I have to pay to be listed?",
        answer:
          "No. Being listed and claiming your profile is free. Only the interview and video, the three-minute film and the placement boosts are paid, and they are optional.",
      },
      {
        question: "Is this an award I am buying?",
        answer:
          "It is not an award — it is a published profile and an interview, and we say so plainly. The boost only changes where you sit in your section.",
      },
    ],
    rules: [
      "Never call Elite an award, a prize or a jury decision. It is paid recognition and a published interview, and the page must not pretend otherwise.",
      "Never tie a free claim to a payment, in writing or on a call.",
      "Only public facts on an unclaimed profile, and only photographs we are licensed to use. If in doubt, no picture.",
      "Take a profile down on request, the same day, without argument.",
      "Never put a birth date, home address or family detail on a profile.",
    ],
    targets: [
      "15 unclaimed profiles worked a day: facts checked, then invited",
      "5 claims a week that pass verification",
      "2 paid interviews a week",
      "Two nominations asked for from every member you publish",
    ],
  },
  {
    slug: "call-list",
    title: "The call list",
    icon: "☎️",
    blurb:
      "Ring businesses that already pay to advertise elsewhere, and get them to build their own free card.",
    goal:
      "Work through the call list at /admin/prospects and turn names into real cards built by the owners themselves. Your week is good if the batch you took is fully called, every call has an outcome written on it, and a handful of owners have created their own card.",
    whyUs: [
      "Everybody on this list already pays somebody else — a magazine, a wedding portal, a classifieds site — to be found. You are offering the same thing free.",
      "The listing is free and stays free: photos, timings, a WhatsApp button, a QR code, offers, and enquiries straight to them with no commission.",
      "The same card also publishes to godesi.wiki, and to djs.wiki or EventRinger where the trade fits, free for the first year.",
      "They can be found by town and by trade — a desi customer searching for their trade near them lands on their page.",
      "Nothing about them is on Godesi until they put it there. That is the honest answer when they ask where you got their number.",
    ],
    wherePeopleAre: [
      { label: "The call list", href: "/admin/prospects" },
      { label: "Your batch (Mine)", href: "/admin/prospects?mine=1" },
      { label: "To call back", href: "/admin/prospects?status=CALL_BACK" },
      { label: "Unclaimed cards to invite instead", href: "/admin/outreach" },
      { label: "The page they sign up on", href: "/dashboard/business" },
    ],
    steps: [
      {
        title: "Take a batch, do not browse",
        detail:
          "Open /admin/prospects, choose your beat (a trade, or a town from the search box), then press 'Give me this many to call' — 20 is a good morning. Those rows become yours so no two of us ring the same shop.",
      },
      {
        title: "Look at their own website first",
        detail:
          "Every row has 'their website' and 'found on'. Thirty seconds on their site tells you what they actually do and who to ask for, and it stops you reading a stale trade back to them.",
      },
      {
        title: "Ring, and use the same opening",
        detail:
          "The card shows the standard opening line — press WhatsApp and it is already written. Confirm you have the right business, say the listing is free, and ask if you can send the link.",
      },
      {
        title: "Send the link while you are on the phone",
        detail:
          "WhatsApp or email them godesi.com/dashboard/business there and then. A promise to send it later is a call you have to make twice.",
      },
      {
        title: "Never build the page for them from another site",
        detail:
          "You may type in what the owner tells you on the call. You may not copy their description or their photos from the directory you found them on — that is the one thing that can get us a legal letter.",
      },
      {
        title: "Write the outcome before the next call",
        detail:
          "Set the status — called, call back, interested, not interested, wrong number, listed — and one line of what they said. A call with no note is a call somebody else has to make again.",
      },
      {
        title: "Close the loop when they list",
        detail:
          "When their card is live, paste its /b/… address into 'Their card' and set the status to Listed. That is how your week gets counted.",
      },
      {
        title: "Hand back what you cannot finish",
        detail:
          "Press 'Put back in the pool' on anything you will not get to, so it goes back on the list instead of sitting on your name.",
      },
    ],
    collect: [
      "The right person's name and the best number or WhatsApp for them",
      "What they actually do now, in their words, and the town they serve",
      "Their email, so you can send the signup link and follow up",
      "Whether they want their phone and email shown on the card or kept private",
      "Whether they have photos and a logo ready to upload themselves",
      "Any correction to the phone, town or street we had — put it in the note",
      "A time to call back, if they are busy — and put it in the note",
    ],
    scripts: [
      {
        label: "Phone — the opening",
        hint: "The card's WhatsApp button already fills this in for you.",
        text: `Namaste 🙏 Is this [BUSINESS]?

I am [NAME] from Godesi.com — the desi directory for [TOWN] and around. We list desi businesses free, and I can send you the link to set your page up today: your own photos, timings, a WhatsApp button and your offers, so desi customers near you find you and message you.

It costs nothing to be listed. Shall I send you the link on WhatsApp?

godesi.com/dashboard/business`,
      },
      {
        label: "WhatsApp — after a yes",
        text: `Thank you for your time 🙏

Here is the link to create your free Godesi page: godesi.com/dashboard/business

Put in your own photos, your timings and your WhatsApp number. It is free and stays free, enquiries come straight to you and we take no commission. Your page also publishes on godesi.wiki free for the first year.

Any trouble, message me here and I will walk you through it.`,
      },
      {
        label: "WhatsApp — the follow-up two days later",
        text: `Namaste 🙏 [NAME] from Godesi here — just checking you managed to create the page: godesi.com/dashboard/business

If it is easier, send me your timings and three photos and I will set it up with you on a five-minute call.`,
      },
    ],
    objections: [
      {
        question: "Where did you get my number?",
        answer:
          "From your public listing on [SOURCE] and your own website — say exactly which one, it is on the row in front of you. Nothing about you is on Godesi; that is why I am ringing.",
      },
      {
        question: "I already advertise in the magazine / on that wedding site.",
        answer:
          "Good — keep it. This is free, so it costs you nothing to also be found by people searching your trade in your town. You are paying them for the same thing.",
      },
      {
        question: "What does it cost, really?",
        answer:
          "The listing is free forever. If they later want the gold Featured ring, contact shown to everyone and top of category, that is $50 a month or $600 a year — but do not sell that on the first call.",
      },
      {
        question: "I don't have time for this.",
        answer:
          "Two minutes: send me three photos and your timings on WhatsApp and I will sit with you on a short call and it is done.",
      },
      {
        question: "Take me off your list.",
        answer:
          "Apologise, mark it Not interested with 'asked not to be contacted' in the note, and never ring again. This one is not negotiable.",
      },
    ],
    rules: [
      "Never copy a photo, a logo or a written advert from the directory you found them on, even if the owner says 'just take it from there' — ask them to send it to you.",
      "Never create a card for a business that has not agreed to it on the call.",
      "Never ring the same business twice in a week, and never at all once it is marked Not interested or 'do not contact'.",
      "Never read out or share the call list outside the admin — it is our own working list, not a published directory.",
      "Never say we are calling on behalf of the magazine, portal or site you found them on. We are Godesi and nobody else.",
      "Never promise a placement, a price or a refund that is not written on godesi.com/pricing.",
    ],
    targets: [
      "One batch of 20 taken and fully called each morning",
      "40–60 calls a day once you are used to the opening",
      "Every row you touched has a status and a note — no blanks left behind",
      "5 owners a week with a live card of their own, marked Listed with the /b/ link",
    ],
  },
];

export function playbookBySlug(slug: string) {
  return HANDBOOK_PLAYBOOKS.find((playbook) => playbook.slug === slug);
}
