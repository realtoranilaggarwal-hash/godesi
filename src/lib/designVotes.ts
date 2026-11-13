/** Client-safe: the choices on the before/after poll and the shape of its tally. */
export const DESIGN_VOTES = [
  { key: "NEW", label: "👍 New design" },
  { key: "OLD", label: "↩️ Old site" },
  { key: "NEEDS_WORK", label: "🛠️ Needs work" },
] as const;

export type DesignVoteKey = (typeof DESIGN_VOTES)[number]["key"];
export type DesignTally = Record<DesignVoteKey, number>;

export const emptyTally = (): DesignTally => ({ NEW: 0, OLD: 0, NEEDS_WORK: 0 });

export const ANIL_PHONE_DISPLAY = "732-983-7958";
export const ANIL_PHONE_TEL = "tel:+17329837958";
export const ANIL_SMS = "sms:+17329837958";
