export const MIN_YEAR = 1950;

/** Matching key for an institution: case, punctuation and spacing all ignored. */
export function institutionSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type AlumniEntry = {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  city: string;
  endYear: string;
  current: boolean;
};

export const EMPTY_ENTRY: AlumniEntry = {
  institution: "",
  degree: "",
  fieldOfStudy: "",
  city: "",
  endYear: "",
  current: false,
};

export type AlumniMatch = {
  id: string;
  institution: string;
  degree: string | null;
  fieldOfStudy: string | null;
  city: string | null;
  endYear: number | null;
  current: boolean;
  user: {
    name: string;
    username: string | null;
    avatarUrl: string | null;
    headline: string | null;
    location: string | null;
  };
};
