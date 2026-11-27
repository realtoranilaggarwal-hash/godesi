/**
 * GoDesi's own flyers for WhatsApp, social media and print. Each QR opens
 * `signup` (the flyer's GoDesi page) with its own ?src= so scans can be told
 * apart. `rail` is a 2x copy sized for the 260px sidebar (portrait) or a
 * 336px-wide card (landscape). `sidebar` puts a portrait flyer in the rail rotation.
 */
export type Flyer = {
  slug: string;
  title: string;
  line: string;
  full: string;
  rail: string;
  width: number;
  height: number;
  signup: string;
  sidebar?: boolean;
};

export const GODESI_FLYERS: Flyer[] = [
  {
    slug: "find-everything",
    title: "Find everything Desi",
    line: "Businesses, events, deals and community near you.",
    full: "/media-kit/flyers/godesi-find-everything.jpg",
    rail: "/media-kit/flyers/godesi-find-everything-300w.jpg",
    width: 1024,
    height: 1536,
    signup: "/signup?src=flyer-find-everything",
    sidebar: true,
  },
  {
    slug: "grow-business",
    title: "Grow your business",
    line: "A free GoDesi page with WhatsApp, reviews and a QR card.",
    full: "/media-kit/flyers/godesi-grow-business.jpg",
    rail: "/media-kit/flyers/godesi-grow-business-300w.jpg",
    width: 1024,
    height: 1536,
    signup: "/signup?src=flyer-grow-business",
    sidebar: true,
  },
  {
    slug: "unique-name",
    title: "Grab your unique username",
    line: "godesi.com/yourname — first come, first served.",
    full: "/media-kit/flyers/godesi-unique-name.jpg",
    rail: "/media-kit/flyers/godesi-unique-name-336w.jpg",
    width: 1536,
    height: 1024,
    signup: "/signup?src=flyer-unique-name",
  },
  {
    slug: "journalist",
    title: "Become a local journalist",
    line: "Share local stories, earn recognition and points.",
    full: "/media-kit/flyers/godesi-journalist.jpg",
    rail: "/media-kit/flyers/godesi-journalist-336w.jpg",
    width: 1672,
    height: 941,
    signup: "/journalists?src=flyer-journalist",
  },
  {
    slug: "one-platform",
    title: "All Desi services, one platform",
    line: "Restaurants, real estate, healthcare, legal and more.",
    full: "/media-kit/flyers/godesi-one-platform.jpg",
    rail: "/media-kit/flyers/godesi-one-platform-336w.jpg",
    width: 1402,
    height: 1122,
    signup: "/signup?src=flyer-one-platform",
  },
  {
    slug: "marketing-services",
    title: "Free marketing & SEO",
    line: "We market your business, plus a free GoDesi.wiki listing.",
    full: "/media-kit/flyers/godesi-marketing-services.jpg",
    rail: "/media-kit/flyers/godesi-marketing-services-336w.jpg",
    width: 1536,
    height: 1024,
    signup: "/marketing?src=flyer-marketing",
  },
  {
    slug: "dj-services",
    title: "DJ services",
    line: "Free marketing for DJs, plus a free DJs.wiki listing.",
    full: "/media-kit/flyers/godesi-dj-services.jpg",
    rail: "/media-kit/flyers/godesi-dj-services-336w.jpg",
    width: 1536,
    height: 1024,
    signup: "/dj?src=flyer-dj",
  },
  {
    slug: "how-events-work",
    title: "How events work on GoDesi",
    line: "Post once, sell tickets, get found everywhere.",
    full: "/media-kit/flyers/godesi-how-events-work.jpg",
    rail: "/media-kit/flyers/godesi-how-events-work-300w.jpg",
    width: 1024,
    height: 1536,
    signup: "/events/how-it-works?src=flyer-events",
  },
  {
    slug: "work-with-us",
    title: "Work with us",
    line: "Promote GoDesi to Desi businesses and earn.",
    full: "/media-kit/flyers/godesi-work-with-us.jpg",
    rail: "/media-kit/flyers/godesi-work-with-us-300w.jpg",
    width: 1024,
    height: 1536,
    signup: "/ambassador?src=flyer-work",
  },
  {
    slug: "connect-share-grow",
    title: "Connect, share, grow together",
    line: "Everything Desi in one place: community, events, jobs and more.",
    full: "/media-kit/flyers/godesi-connect-share-grow.jpg",
    rail: "/media-kit/flyers/godesi-connect-share-grow-300w.jpg",
    width: 928,
    height: 1695,
    signup: "/signup?src=flyer-connect",
  },
  {
    slug: "india-global",
    title: "India's global community platform",
    line: "Where Indians connect, collaborate and grow.",
    full: "/media-kit/flyers/godesi-india-global.jpg",
    rail: "/media-kit/flyers/godesi-india-global-300w.jpg",
    width: 926,
    height: 1698,
    signup: "/signup?src=flyer-india",
  },
  {
    slug: "elite",
    title: "GoDesi Elite recognition",
    line: "Are you a community leader? Apply for GoDesi Elite.",
    full: "/media-kit/flyers/godesi-elite.jpg",
    rail: "/media-kit/flyers/godesi-elite-300w.jpg",
    width: 864,
    height: 1821,
    signup: "/desi-elite/apply?src=flyer-elite",
  },
];

export const PORTRAIT_FLYERS = GODESI_FLYERS.filter(
  (flyer) => flyer.sidebar && flyer.height > flyer.width,
);
