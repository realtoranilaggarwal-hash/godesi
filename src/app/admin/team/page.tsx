import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ModeratorForm } from "@/components/forms/ModeratorForm";
import { ALL_PERMISSIONS, STAFF_PERMISSIONS } from "@/lib/permissions";
import { Badge, Card, inputClass } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Team access" };

export default async function Page({
  searchParams,
}: {
  searchParams: { q?: string; done?: string; error?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/team");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const q = (searchParams.q ?? "").trim();

  const where: Prisma.UserWhereInput = {
    role: { in: ["CLIENT", "BUSINESS"] },
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { username: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [moderators, candidates] = await Promise.all([
    db.user.findMany({
      where: { role: "MODERATOR" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, staffPermissions: true },
    }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: q ? 25 : 10,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        emailVerifiedAt: true,
      },
    }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Team access</h1>

      {searchParams.done ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {searchParams.done}
        </p>
      ) : null}
      {searchParams.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {searchParams.error}
        </p>
      ) : null}

      <Card id="make-moderator">
        <h2 className="mb-1 text-lg font-bold">Make someone a moderator</h2>
        <p className="mb-3 text-sm text-slate-500">
          Search the member, then press <strong>Make moderator</strong> — one
          click gives them the whole{" "}
          <Link href="/admin/content" className="font-semibold text-indigo-600">
            content desk
          </Link>{" "}
          (events, business cards, news, reviews, blog, links, temples). Narrow
          it with the tick boxes below. They must have signed up on Godesi
          first, and they never see members, payments, ads or reward points.
        </p>
        <p className="mb-3 text-sm text-slate-500">
          Then send her the{" "}
          <Link
            href="/admin/handbook"
            className="font-semibold text-indigo-600"
          >
            staff handbook
          </Link>{" "}
          — one written procedure per beat (events, DJs, astrologers, IT
          companies, Elite) with the pitch, the messages to send and what she
          must collect before a page goes live.
        </p>

        <form method="get" className="flex flex-wrap gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search her name, email or username"
            className={`${inputClass} sm:max-w-md`}
          />
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Search
          </button>
          {q ? (
            <Link
              href="/admin/team"
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
            >
              Clear
            </Link>
          ) : null}
        </form>

        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {q ? "Matching members" : "Newest members"}
        </p>
        <ul className="divide-y divide-slate-100 text-sm">
          {candidates.map((candidate) => (
            <li
              key={candidate.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {candidate.name ?? "Member"}{" "}
                  {candidate.emailVerifiedAt ? null : (
                    <Badge tone="amber">email unconfirmed</Badge>
                  )}
                </p>
                <p className="text-xs text-slate-400">
                  {candidate.email} · joined{" "}
                  {candidate.createdAt.toLocaleDateString("en-IN")}
                </p>
              </div>
              <form method="post" action="/admin/team/apply">
                <input type="hidden" name="intent" value="make" />
                <input type="hidden" name="id" value={candidate.id} />
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Make moderator
                </button>
              </form>
            </li>
          ))}
          {candidates.length === 0 ? (
            <li className="py-2 text-slate-500">
              No member matches that — ask her to sign up at godesi.com first.
            </li>
          ) : null}
        </ul>
      </Card>

      <Card id="team-access">
        <h2 className="mb-1 text-lg font-bold">Moderators</h2>
        <p className="mb-3 text-sm text-slate-500">
          Tick what each one may manage and press save. Send them{" "}
          <span className="font-mono text-xs">godesi.com/admin/content</span>{" "}
          after they sign in.
        </p>
        <ul className="divide-y divide-slate-100 text-sm">
          {moderators.map((moderator) => (
            <li
              key={moderator.id}
              className="flex items-start justify-between gap-2 py-2"
            >
              <div className="min-w-0">
                <p className="font-medium">{moderator.name ?? "Member"}</p>
                <p className="text-xs text-slate-400">{moderator.email}</p>
                <form
                  method="post"
                  action="/admin/team/apply"
                  className="mt-1 flex flex-wrap items-center gap-2"
                >
                  <input type="hidden" name="intent" value="permissions" />
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
              <div className="flex shrink-0 flex-col gap-1">
                {moderator.staffPermissions.length < ALL_PERMISSIONS.length ? (
                  <form method="post" action="/admin/team/apply">
                    <input type="hidden" name="intent" value="make" />
                    <input type="hidden" name="id" value={moderator.id} />
                    {ALL_PERMISSIONS.map((permission) => (
                      <input
                        key={permission}
                        type="hidden"
                        name="permissions"
                        value={permission}
                      />
                    ))}
                    <button
                      type="submit"
                      className="w-full rounded-lg border border-emerald-200 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                    >
                      give everything
                    </button>
                  </form>
                ) : null}
                <form method="post" action="/admin/team/apply">
                  <input type="hidden" name="intent" value="revoke" />
                  <input type="hidden" name="id" value={moderator.id} />
                  <button
                    type="submit"
                    className="w-full rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    remove access
                  </button>
                </form>
              </div>
            </li>
          ))}
          {moderators.length === 0 ? (
            <li className="py-2 text-slate-500">No moderators yet.</li>
          ) : null}
        </ul>
      </Card>

      <Card id="by-email">
        <h2 className="mb-1 text-lg font-bold">Or add by email</h2>
        <p className="mb-3 text-sm text-slate-500">
          Useful when you know the address but not the name she signed up with.
        </p>
        <ModeratorForm />
      </Card>
    </div>
  );
}
