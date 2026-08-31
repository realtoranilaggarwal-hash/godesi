/**
 * Invite limits live apart from the sending code so the member-facing form can
 * quote them without pulling the database client into the browser bundle.
 */
export const INVITE_MAX_PER_SUBMIT = 20;
export const INVITE_MAX_PER_DAY = 60;
