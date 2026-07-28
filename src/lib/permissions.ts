import type { Role } from "@prisma/client";

/** Everything a moderator can be given; admins always hold all of them. */
export const STAFF_PERMISSIONS = [
  { key: "events", label: "Events", hint: "Post, edit, approve and reject events" },
  {
    key: "listings",
    label: "Business cards & listings",
    hint: "Approve or reject business cards, property, rooms and items",
  },
  { key: "news", label: "News", hint: "Approve, reject, feature and delete stories" },
  { key: "blog", label: "Blog & updates", hint: "Write and publish blog posts" },
  { key: "resources", label: "Resource links", hint: "Approve and manage recommended links" },
  { key: "worship", label: "Temples & places of worship", hint: "Approve submitted places" },
] as const;

export type StaffPermission = (typeof STAFF_PERMISSIONS)[number]["key"];

export const ALL_PERMISSIONS = STAFF_PERMISSIONS.map((permission) => permission.key);

export function isStaffPermission(value: string): value is StaffPermission {
  return ALL_PERMISSIONS.includes(value as StaffPermission);
}

export function permissionLabel(key: string) {
  return STAFF_PERMISSIONS.find((permission) => permission.key === key)?.label ?? key;
}

type StaffUser = { role: Role; staffPermissions: string[] };

/** Admins can do everything; moderators only what they were granted. */
export function can(user: StaffUser, permission: StaffPermission) {
  if (user.role === "ADMIN") return true;
  return user.role === "MODERATOR" && user.staffPermissions.includes(permission);
}

export function permissionsOf(user: StaffUser): StaffPermission[] {
  if (user.role === "ADMIN") return [...ALL_PERMISSIONS];
  if (user.role !== "MODERATOR") return [];
  return ALL_PERMISSIONS.filter((permission) =>
    user.staffPermissions.includes(permission),
  );
}
