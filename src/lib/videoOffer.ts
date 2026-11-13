/** The $50 AI spokesperson video sold on /upgrade and /video-order. */
export const VIDEO_OFFER = {
  priceUsd: 50,
  maxWords: 80,
  businessNameMax: 60,
  logoMaxBytes: 5 * 1024 * 1024,
  revisions: 1,
  examplesHref: "/about#shorts",
};

export const VIDEO_LANGUAGES = [
  "English",
  "Hindi",
  "Gujarati",
  "Punjabi",
  "Tamil",
  "Telugu",
] as const;

export function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
