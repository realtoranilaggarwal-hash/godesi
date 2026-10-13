/**
 * The event's own categories — what kind of night out it is, not which trade
 * runs it. Business categories (`Category`) answer "who provides this service";
 * these answer "garba, standup or satsang", the way ticket sites list events.
 *
 * Slugs are stored on the event, so rename a label freely but never a slug.
 */
export const EVENT_CATEGORY_GROUPS = [
  {
    label: "Music & concerts",
    options: [
      { slug: "live-concert", label: "Live in concert", icon: "🎤", match: /\blive in concert|concert tour|live show\b/i },
      { slug: "bollywood-night", label: "Bollywood night", icon: "🎬", match: /bollywood|filmi|playback singer/i },
      { slug: "classical-music", label: "Classical music", icon: "🎻", match: /carnatic|hindustani|classical (music|concert)|kutcheri|sabha/i },
      { slug: "ghazal-sufi", label: "Ghazal & sufi", icon: "🕊️", match: /ghazal|sufi|qawwali|mushaira/i },
      { slug: "folk-music", label: "Folk & regional", icon: "🪕", match: /folk|lok geet|baul|rajasthani night/i },
      { slug: "dj-night", label: "DJ & club night", icon: "🎧", match: /\bdj\b|club night|after party|night party|rooftop party/i },
      { slug: "singing-contest", label: "Singing contest", icon: "🎙️", match: /singing (competition|contest)|antakshari|open mic (singing|music)/i },
    ],
  },
  {
    label: "Dance",
    options: [
      { slug: "garba-dandiya", label: "Garba & dandiya", icon: "🪘", match: /garba|dandiya|navratri|raas/i },
      { slug: "bhangra-gidda", label: "Bhangra & gidda", icon: "🥁", match: /bhangra|gidda|giddha|punjabi night/i },
      { slug: "classical-dance", label: "Classical dance", icon: "💃", match: /bharatanatyam|kathak|kuchipudi|odissi|mohiniyattam|kathakali|arangetram/i },
      { slug: "dance-show", label: "Dance show", icon: "🕺", match: /dance (show|night|party|performance)|nritya|dance competition/i },
      { slug: "dance-workshop", label: "Dance workshop", icon: "🩰", match: /dance (workshop|class|bootcamp)|choreography workshop/i },
    ],
  },
  {
    label: "Comedy, theatre & film",
    options: [
      { slug: "standup-comedy", label: "Stand-up comedy", icon: "🎭", match: /stand[- ]?up|comedy|comedian|hasya/i },
      { slug: "theatre-drama", label: "Theatre & drama", icon: "🎟️", match: /theat(re|er)|drama|natak|nataka|play\b|skit/i },
      { slug: "film-screening", label: "Film screening", icon: "🍿", match: /film (screening|festival)|movie (screening|premiere)|premiere show/i },
      { slug: "fashion-show", label: "Fashion & pageant", icon: "👗", match: /fashion (show|week)|pageant|miss |mr |couture/i },
      { slug: "art-exhibition", label: "Art & photo exhibition", icon: "🖼️", match: /art (show|exhibition)|painting exhibition|photo(graphy)? exhibition|gallery/i },
      { slug: "book-literature", label: "Books & literature", icon: "📚", match: /book (launch|reading|fair)|kavi sammelan|poetry|literature|sahitya/i },
    ],
  },
  {
    label: "Festivals & culture",
    options: [
      { slug: "festival-mela", label: "Festival & mela", icon: "🎪", match: /\bmela\b|festival|utsav|utsavam|carnival|fair\b/i },
      { slug: "diwali", label: "Diwali", icon: "🪔", match: /diwali|deepavali|deepotsav|annakut/i },
      { slug: "holi", label: "Holi", icon: "🎨", match: /holi|rangpanchami|dhulandi/i },
      { slug: "onam-pongal-bihu", label: "Onam · Pongal · Bihu · Baisakhi", icon: "🌾", match: /onam|pongal|bihu|baisakhi|vaisakhi|ugadi|gudi padwa|vishu|puthandu|sankranti/i },
      { slug: "durga-puja", label: "Durga puja & Dussehra", icon: "🌺", match: /durga puja|dussehra|dashain|vijayadashami|ramleela|ramlila/i },
      { slug: "ganesh-utsav", label: "Ganesh utsav", icon: "🐘", match: /ganesh|ganapati|vinayaka chaturthi/i },
      { slug: "eid-christmas", label: "Eid · Christmas · Nowruz", icon: "🌙", match: /\beid\b|iftar|christmas|nowruz|navroz/i },
      { slug: "new-year-party", label: "New Year party", icon: "🎉", match: /new year|nye\b|31st night/i },
      { slug: "independence-republic", label: "Independence & Republic Day", icon: "🇮🇳", match: /independence day|republic day|flag hoisting|india day parade/i },
      { slug: "parade", label: "Parade & procession", icon: "🚩", match: /parade|procession|rath yatra|shobha yatra|nagar kirtan/i },
    ],
  },
  {
    label: "Religion & wellbeing",
    options: [
      { slug: "devotional", label: "Devotional & satsang", icon: "🙏", match: /satsang|bhajan|kirtan|devotional|naam|sankirtan|parayanam|sahasranama|chalisa|aarti/i },
      { slug: "temple-service", label: "Temple service & puja", icon: "🛕", match: /puja|pooja|abhishek|homam|yagna|yagya|havan|archana|vratam|temple|mandir|gurudwara|masjid/i },
      { slug: "katha-pravachan", label: "Katha & pravachan", icon: "📖", match: /katha|pravachan|discourse|gita|upanyasam|bhagavat/i },
      { slug: "yoga-meditation", label: "Yoga & meditation", icon: "🧘", match: /yoga|meditation|pranayam|dhyan|vipassana|mindfulness/i },
      { slug: "health-camp", label: "Health camp & blood drive", icon: "🩺", match: /health (camp|fair|screening)|blood (drive|donation)|checkup|wellness camp/i },
    ],
  },
  {
    label: "Business & learning",
    options: [
      { slug: "networking", label: "Networking & meetup", icon: "🤝", match: /networking|meetup|mixer|chamber of commerce|business breakfast/i },
      { slug: "conference-expo", label: "Conference & expo", icon: "🏢", match: /conference|summit|expo|trade show|convention|symposium/i },
      { slug: "workshop-class", label: "Workshop & class", icon: "🛠️", match: /workshop|masterclass|bootcamp|training|class(es)?\b|course/i },
      { slug: "seminar-webinar", label: "Seminar & webinar", icon: "💻", match: /seminar|webinar|talk\b|info session|lecture/i },
      { slug: "startup-pitch", label: "Startup & investing", icon: "🚀", match: /startup|pitch|founder|angel|investor|venture/i },
      { slug: "job-fair", label: "Job fair & career", icon: "💼", match: /job fair|career fair|hiring|recruitment drive|resume/i },
      { slug: "immigration-legal", label: "Immigration & legal help", icon: "🛂", match: /immigration|visa|green card|h1b|citizenship|legal clinic|notary/i },
      { slug: "money-tax", label: "Money, tax & insurance", icon: "💵", match: /tax|financial planning|insurance|retirement|401k|mortgage seminar/i },
    ],
  },
  {
    label: "Family & community",
    options: [
      { slug: "kids-family", label: "Kids & family", icon: "👨‍👩‍👧", match: /kids|children|family (day|fun)|toddler|storytelling|summer camp/i },
      { slug: "youth-college", label: "Youth & college", icon: "🎓", match: /youth|college|student|campus|alumni|university/i },
      { slug: "seniors", label: "Seniors", icon: "👴", match: /senior|elder|retire(e|es)|60\+/i },
      { slug: "women", label: "Women's event", icon: "👩", match: /women|mahila|sakhi|ladies (night|special)/i },
      { slug: "charity-fundraiser", label: "Charity & fundraiser", icon: "❤️", match: /charity|fundrais|donation drive|gala dinner|seva|non[- ]?profit/i },
      { slug: "awards-night", label: "Awards & felicitation", icon: "🏆", match: /award|felicitation|honou?r(ing|s)|recognition night/i },
      { slug: "civic-meeting", label: "Civic & town hall", icon: "🏛️", match: /town hall|civic|council meeting|election|voter|political/i },
    ],
  },
  {
    label: "Food, sport & outings",
    options: [
      { slug: "food-drink", label: "Food & drink", icon: "🍛", match: /food (festival|fest|fair|truck)|sadhya|prasad|annadanam|potluck|dinner|brunch|tasting|wine|chai/i },
      { slug: "cooking-class", label: "Cooking class", icon: "👩‍🍳", match: /cooking (class|workshop|demo)|baking class|masterchef/i },
      { slug: "sports-tournament", label: "Sports tournament", icon: "🏏", match: /tournament|cricket|kabaddi|badminton|volleyball|soccer|football|chess|carrom|league/i },
      { slug: "run-walkathon", label: "Run & walkathon", icon: "🏃", match: /marathon|walkathon|5k|10k|run\b|cyclothon/i },
      { slug: "picnic-tour", label: "Picnic & tour", icon: "🚌", match: /picnic|day trip|tour\b|excursion|cruise|yatra travel/i },
      { slug: "party-social", label: "Party & social", icon: "🥂", match: /party|social|get[- ]?together|reunion|anniversary|birthday/i },
    ],
  },
  {
    label: "Weddings & matches",
    options: [
      { slug: "wedding-expo", label: "Wedding expo & showcase", icon: "💍", match: /wedding (expo|show|fair|showcase)|bridal (show|expo)/i },
      { slug: "sangeet-mehndi", label: "Sangeet & mehndi night", icon: "🎶", match: /sangeet|mehndi|mehendi|baraat|haldi/i },
      { slug: "matrimony-meet", label: "Matrimony meet", icon: "💐", match: /matrimon|swayamvar|parents meet|match(-| )making/i },
    ],
  },
] as const;

export type EventCategoryOption =
  (typeof EVENT_CATEGORY_GROUPS)[number]["options"][number];

export const EVENT_CATEGORIES: EventCategoryOption[] =
  EVENT_CATEGORY_GROUPS.flatMap((group) => [...group.options]);

const BY_SLUG = new Map<string, EventCategoryOption>(
  EVENT_CATEGORIES.map((option) => [option.slug, option]),
);

export function isEventCategory(slug: string) {
  return BY_SLUG.has(slug);
}

export function eventCategoryLabel(slug: string) {
  return BY_SLUG.get(slug)?.label ?? slug;
}

export function eventCategoryIcon(slug: string) {
  return BY_SLUG.get(slug)?.icon ?? "🎟️";
}

/** Keeps only real slugs, in the order the vocabulary lists them, capped. */
export function cleanEventCategories(values: string[], limit = 6) {
  const wanted = new Set(values.map((value) => value.trim()));
  return EVENT_CATEGORIES.filter((option) => wanted.has(option.slug))
    .map((option) => option.slug)
    .slice(0, limit);
}

/**
 * Guesses categories from a title and blurb, so an imported event lands in the
 * right lists before anyone edits it. The desk still sees and can change them.
 */
export function guessEventCategories(...parts: (string | null | undefined)[]) {
  const text = parts.filter(Boolean).join(" ");
  if (!text.trim()) return [];
  return EVENT_CATEGORIES.filter((option) => option.match.test(text))
    .map((option) => option.slug)
    .slice(0, 4);
}

/** The language the show is performed in — the way desi ticket sites list it. */
export const EVENT_LANGUAGES = [
  { slug: "hindi", label: "Hindi", match: /\bhindi\b/i },
  { slug: "english", label: "English", match: /\benglish\b/i },
  { slug: "tamil", label: "Tamil", match: /\btamil\b/i },
  { slug: "telugu", label: "Telugu", match: /\btelugu\b/i },
  { slug: "kannada", label: "Kannada", match: /\bkannada\b/i },
  { slug: "malayalam", label: "Malayalam", match: /\bmalayalam\b/i },
  { slug: "marathi", label: "Marathi", match: /\bmarathi\b/i },
  { slug: "gujarati", label: "Gujarati", match: /\bgujarati\b/i },
  { slug: "punjabi", label: "Punjabi", match: /\bpunjabi\b/i },
  { slug: "bengali", label: "Bengali", match: /\bbengali\b|\bbangla\b/i },
  { slug: "odia", label: "Odia", match: /\bodia\b|\boriya\b/i },
  { slug: "urdu", label: "Urdu", match: /\burdu\b/i },
  { slug: "nepali", label: "Nepali", match: /\bnepali\b/i },
  { slug: "sinhala", label: "Sinhala", match: /\bsinhala\b/i },
  { slug: "sanskrit", label: "Sanskrit", match: /\bsanskrit\b/i },
  { slug: "multilingual", label: "Multilingual", match: /\bmultilingual\b|\bbilingual\b/i },
] as const;

const LANGUAGE_BY_SLUG = new Map<string, (typeof EVENT_LANGUAGES)[number]>(
  EVENT_LANGUAGES.map((option) => [option.slug, option]),
);

export function eventLanguageLabel(slug: string) {
  return LANGUAGE_BY_SLUG.get(slug)?.label ?? slug;
}

export function cleanEventLanguages(values: string[], limit = 3) {
  const wanted = new Set(values.map((value) => value.trim()));
  return EVENT_LANGUAGES.filter((option) => wanted.has(option.slug))
    .map((option) => option.slug)
    .slice(0, limit);
}

export function guessEventLanguages(...parts: (string | null | undefined)[]) {
  const text = parts.filter(Boolean).join(" ");
  if (!text.trim()) return [];
  return EVENT_LANGUAGES.filter((option) => option.match.test(text))
    .map((option) => option.slug)
    .slice(0, 2);
}
