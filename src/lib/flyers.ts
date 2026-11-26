/**
 * GoDesi's own flyers for WhatsApp, social media and print. Each QR opens
 * sign-up with its own ?src= so scans can be told apart. `rail` is a 2x copy
 * sized for the 260px sidebar (portrait) or a 336px-wide card (landscape).
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
];

export const PORTRAIT_FLYERS = GODESI_FLYERS.filter((flyer) => flyer.height > flyer.width);
