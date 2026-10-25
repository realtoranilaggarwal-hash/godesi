export type Lesson = {
  title: string;
  minutes: number;
  paragraphs: string[];
  bullets?: string[];
};

export type CourseHighlight = {
  icon: string;
  title: string;
  body: string;
};

export type Course = {
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  pitch: string;
  emoji: string;
  cover: string;
  priceMinor: number;
  listPriceMinor: number;
  highlights: CourseHighlight[];
  lessons: Lesson[];
};

export const AUTHOR_NAME = "Anil Aggarwal, Realtor";
export const AUTHOR_PHOTO = "/images/courses/anil-aggarwal.jpg";
export const AUTHOR_PROFILE_HREF = "/b/broker-anil-aggarwal-iselin";

export const LAUNCH_PRICE_MINOR = 900;
export const LAUNCH_LIST_PRICE_MINOR = 9_900;
