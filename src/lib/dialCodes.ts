/** Country dial codes offered on phone fields, desi diaspora first. */
export const DIAL_CODES = [
  { code: "1", label: "United States / Canada", flag: "🇺🇸" },
  { code: "91", label: "India", flag: "🇮🇳" },
  { code: "44", label: "United Kingdom", flag: "🇬🇧" },
  { code: "971", label: "United Arab Emirates", flag: "🇦🇪" },
  { code: "61", label: "Australia", flag: "🇦🇺" },
  { code: "64", label: "New Zealand", flag: "🇳🇿" },
  { code: "65", label: "Singapore", flag: "🇸🇬" },
  { code: "60", label: "Malaysia", flag: "🇲🇾" },
  { code: "974", label: "Qatar", flag: "🇶🇦" },
  { code: "966", label: "Saudi Arabia", flag: "🇸🇦" },
  { code: "968", label: "Oman", flag: "🇴🇲" },
  { code: "965", label: "Kuwait", flag: "🇰🇼" },
  { code: "973", label: "Bahrain", flag: "🇧🇭" },
  { code: "353", label: "Ireland", flag: "🇮🇪" },
  { code: "49", label: "Germany", flag: "🇩🇪" },
  { code: "33", label: "France", flag: "🇫🇷" },
  { code: "31", label: "Netherlands", flag: "🇳🇱" },
  { code: "41", label: "Switzerland", flag: "🇨🇭" },
  { code: "27", label: "South Africa", flag: "🇿🇦" },
  { code: "254", label: "Kenya", flag: "🇰🇪" },
  { code: "977", label: "Nepal", flag: "🇳🇵" },
  { code: "94", label: "Sri Lanka", flag: "🇱🇰" },
  { code: "880", label: "Bangladesh", flag: "🇧🇩" },
  { code: "92", label: "Pakistan", flag: "🇵🇰" },
  { code: "81", label: "Japan", flag: "🇯🇵" },
  { code: "82", label: "South Korea", flag: "🇰🇷" },
  { code: "852", label: "Hong Kong", flag: "🇭🇰" },
];

/** Longest-match dial code contained at the start of a stored number. */
export function splitDialCode(value: string) {
  const digits = value.replace(/\D/g, "");
  const match = [...DIAL_CODES]
    .sort((a, b) => b.code.length - a.code.length)
    .find((entry) => digits.startsWith(entry.code));
  return match
    ? { code: match.code, rest: digits.slice(match.code.length) }
    : { code: "", rest: digits };
}

export const DIAL_CODE_HINT =
  "Pick your country code first — a number without it (or with the wrong one) can't be called or WhatsApped.";
