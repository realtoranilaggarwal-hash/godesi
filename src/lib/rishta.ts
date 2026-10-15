import type { RishtaMarital, RishtaPostedBy } from "@prisma/client";
import { type MoonPlacement, gunaMilan } from "@/lib/gunaMilan";

export const RISHTA_MIN_AGE = 18;

export const POSTED_BY_LABELS: Record<RishtaPostedBy, string> = {
  SELF: "Self",
  PARENT: "Father / mother",
  SIBLING: "Brother / sister",
  RELATIVE: "Relative",
  FRIEND: "Friend",
};

export const RISHTA_MARITAL_LABELS: Record<RishtaMarital, string> = {
  NEVER_MARRIED: "Never married",
  DIVORCED: "Divorced",
  WIDOWED: "Widowed",
};

export const RELIGIONS = [
  "Hindu",
  "Muslim",
  "Sikh",
  "Christian",
  "Jain",
  "Buddhist",
  "Parsi",
  "Other",
];

/** 4'6" to 7'0" in one-inch steps, stored as centimetres. */
export const HEIGHTS_CM = Array.from({ length: 31 }, (_, index) =>
  Math.round((54 + index) * 2.54),
);

export function heightLabel(cm: number) {
  const inches = Math.round(cm / 2.54);
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

export function ageFromBirthYear(birthYear: number, now = new Date()) {
  return now.getFullYear() - birthYear;
}

export function placement(profile: {
  moonSign: number | null;
  nakshatra: number | null;
}): MoonPlacement | null {
  return profile.moonSign !== null && profile.nakshatra !== null
    ? { moonSign: profile.moonSign, nakshatra: profile.nakshatra }
    : null;
}

/** Guna milan between two profiles, oriented groom → bride; null if either lacks a Moon. */
export function matchBetween(
  a: { gender: string; moonSign: number | null; nakshatra: number | null },
  b: { gender: string; moonSign: number | null; nakshatra: number | null },
) {
  const pa = placement(a);
  const pb = placement(b);
  if (!pa || !pb || a.gender === b.gender) return null;
  return a.gender === "MAN" ? gunaMilan(pa, pb) : gunaMilan(pb, pa);
}

export function sameGotra(a: string | null, b: string | null) {
  return Boolean(a && b && a.trim().toLowerCase() === b.trim().toLowerCase());
}

export function canSeeRishtaPhoto(
  profile: { userId: string; hidePhoto: boolean },
  viewer: { id: string; role: string } | null,
) {
  if (!viewer) return false;
  return (
    viewer.id === profile.userId ||
    viewer.role === "ADMIN" ||
    !profile.hidePhoto
  );
}

export function rishtaPhotoSrc(profile: { id: string; updatedAt: Date }) {
  return `/rishta/${profile.id}/photo?v=${profile.updatedAt.getTime()}`;
}
