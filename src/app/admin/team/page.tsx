import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ModeratorForm } from "@/components/forms/ModeratorForm";
import {
  revokeModeratorAction,
  updateModeratorPermissionsAction,
} from "@/app/actions/team";
import { STAFF_PERMISSIONS } from "@/lib/permissions";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Team access" };

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/team");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const moderators = await db.user.findMany({
    where: { role: "MODERATOR" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, staffPermissions: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Team access</h1>
      <Card id="team-access">
        <h2 className="mb-1 text-lg font-bold">Team access</h2>
        <p className="mb-3 text-sm text-slate-500">
          Moderators use the{" "}
          <Link href="/admin/content" className="font-semibold text-indigo-600">
            content desk
          </Link>{" "}
          to add and approve events, listings, news and blog posts. They cannot
          see members, payments, ads or reward points.
        </p>
        <ModeratorForm />
        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {moderators.map((moderator) => (
            <li
              key={moderator.id}
              className="flex items-center justify-between gap-2 py-2"
            >
              <div className="min-w-0">
                <p className="font-medium">{moderator.name ?? "Member"}</p>
                <p className="text-xs text-slate-400">{moderator.email}</p>
                <form
                  action={updateModeratorPermissionsAction}
                  className="mt-1 flex flex-wrap items-center gap-2"
                >
                  <input type="hidden" name="id" value={moderator.id} />
                  {STAFF_PERMISSIONS.map((permission) => (
                    <label
                      key={permission.key}
                      className="flex items-center gap-1 text-xs text-slate-600"
                    >
                      <input
                        type="checkbox"
                        name="permissions"
                        value={permission.key}
                        defaultChecked={moderator.staffPermissions.includes(
                          permission.key,
                        )}
                      />
                      {permission.label}
                    </label>
                  ))}
                  <button
                    type="submit"
                    className="rounded-lg border border-indigo-200 px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                  >
                    save
                  </button>
                </form>
              </div>
              <form action={revokeModeratorAction}>
                <input type="hidden" name="id" value={moderator.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  remove access
                </button>
              </form>
            </li>
          ))}
          {moderators.length === 0 ? (
            <li className="py-2 text-slate-500">No moderators yet.</li>
          ) : null}
        </ul>
      </Card>
    </div>
  );
}
