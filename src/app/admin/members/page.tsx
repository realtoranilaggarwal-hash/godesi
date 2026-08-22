import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { deleteMembersAction } from "@/app/actions/members";
import { formatMinor } from "@/lib/format";
import { looksLikeSpam, spamSignals } from "@/lib/signupGuard";
import { Badge, Card, inputClass } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Members & payments" };

const PAGE_SIZE = 60;

const FILTERS = [
  { key: "all", label: "Everyone" },
  { key: "spam", label: "Suspected spam" },
  { key: "unverified", label: "Email not confirmed" },
  { key: "paid", label: "Paid members" },
  { key: "banned", label: "Suspended" },
] as const;

type Filter = (typeof FILTERS)[number]["key"];

export default async function Page({
  searchParams,
}: {
  searchParams: {
    q?: string;
    filter?: string;
    page?: string;
    removed?: string;
    deleted?: string;
  };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/members");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const q = (searchParams.q ?? "").trim();
  const filter = (FILTERS.find((entry) => entry.key === searchParams.filter)
    ?.key ?? "all") as Filter;
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);

  const where: Prisma.UserWhereInput = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { username: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { business: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(filter === "unverified" ? { emailVerifiedAt: null } : {}),
    ...(filter === "paid" ? { plan: { in: ["PRO", "PREMIUM"] } } : {}),
    ...(filter === "banned" ? { NOT: { bannedAt: null } } : {}),
    // The spam view is scored in code, so it only narrows to unconfirmed here.
    ...(filter === "spam" ? { emailVerifiedAt: null, bannedAt: null } : {}),
  };

  const [rows, total, counts, payments] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: filter === "spam" ? 0 : (page - 1) * PAGE_SIZE,
      take: filter === "spam" ? 200 : PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        createdAt: true,
        emailVerifiedAt: true,
        bannedAt: true,
        lastContactedAt: true,
        business: { select: { name: true, status: true } },
      },
    }),
    db.user.count({ where }),
    Promise.all([
      db.user.count(),
      db.user.count({ where: { emailVerifiedAt: null } }),
      db.user.count({ where: { plan: { in: ["PRO", "PREMIUM"] } } }),
      db.user.count({ where: { NOT: { bannedAt: null } } }),
    ]),
    db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: { id: true, email: true } } },
    }),
  ]);

  const visible = filter === "spam" ? rows.filter(looksLikeSpam) : rows;
  const [allCount, unverifiedCount, paidCount, bannedCount] = counts;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const href = (next: Partial<{ q: string; filter: string; page: number }>) => {
    const params = new URLSearchParams();
    const value = { q, filter, page, ...next };
    if (value.q) params.set("q", value.q);
    if (value.filter && value.filter !== "all") params.set("filter", value.filter);
    if (value.page && value.page > 1) params.set("page", String(value.page));
    const query = params.toString();
    return query ? `/admin/members?${query}` : "/admin/members";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Members &amp; payments</h1>
        <p className="text-sm text-slate-500">
          {allCount} members · {unverifiedCount} unconfirmed · {paidCount} paid ·{" "}
          {bannedCount} suspended
        </p>
      </div>

      {searchParams.removed ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          Removed {searchParams.removed} account
          {searchParams.removed === "1" ? "" : "s"}.
        </p>
      ) : null}
      {searchParams.deleted ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          Member deleted.
        </p>
      ) : null}

      <Card>
        <form method="get" className="flex flex-wrap gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, email, username, phone or business"
            className={`${inputClass} sm:max-w-md`}
          />
          {filter !== "all" ? (
            <input type="hidden" name="filter" value={filter} />
          ) : null}
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Search
          </button>
          {q ? (
            <Link
              href={href({ q: "", page: 1 })}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
            >
              Clear
            </Link>
          ) : null}
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((entry) => (
            <Link
              key={entry.key}
              href={href({ filter: entry.key, page: 1 })}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                filter === entry.key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {entry.label}
            </Link>
          ))}
        </div>
      </Card>

      <Card id="users-and-subscriptions">
        <h2 className="mb-1 text-lg font-bold">
          {filter === "spam" ? "Suspected spam accounts" : "Members"}
        </h2>
        <p className="mb-3 text-sm text-slate-500">
          {filter === "spam"
            ? "Unconfirmed accounts with a bot signature — a random-looking name, a dotted alias of another Gmail address, or a throwaway domain. Tick the ones to remove."
            : "Click a member to see everything they posted, change their plan, email them or suspend them."}
        </p>

        {visible.length ? (
          <form action={deleteMembersAction}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead className="text-left text-xs uppercase text-slate-500">
                  <tr>
                    {filter === "spam" ? <th className="w-8 py-2" /> : null}
                    <th className="py-2">Member</th>
                    <th>Joined</th>
                    <th>Role</th>
                    <th>Plan</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((row) => {
                    const signals = spamSignals(row);
                    return (
                      <tr key={row.id} className="align-top">
                        {filter === "spam" ? (
                          <td className="py-3">
                            <input
                              type="checkbox"
                              name="ids"
                              value={row.id}
                              defaultChecked
                              className="h-4 w-4"
                            />
                          </td>
                        ) : null}
                        <td className="py-3">
                          <Link
                            href={`/admin/members/${row.id}`}
                            className="font-semibold text-indigo-700 hover:underline"
                          >
                            {row.name}
                          </Link>
                          <div className="text-xs text-slate-500">{row.email}</div>
                          {row.business ? (
                            <div className="text-xs text-slate-500">
                              🏪 {row.business.name} · {row.business.status}
                            </div>
                          ) : null}
                          {filter === "spam" && signals.length ? (
                            <div className="mt-1 text-xs text-rose-600">
                              {signals.join(" · ")}
                            </div>
                          ) : null}
                        </td>
                        <td className="whitespace-nowrap text-xs text-slate-500">
                          {row.createdAt.toLocaleDateString("en-IN")}
                        </td>
                        <td className="text-xs">
                          {row.role}
                          {row.role === "CLIENT" || row.role === "BUSINESS" ? (
                            <div className="mt-1">
                              <button
                                type="submit"
                                formMethod="post"
                                formAction="/admin/team/apply"
                                name="id"
                                value={row.id}
                                className="rounded-lg border border-emerald-200 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                              >
                                make moderator
                              </button>
                            </div>
                          ) : null}
                        </td>
                        <td>
                          <Badge tone={row.plan === "FREE" ? "slate" : "indigo"}>
                            {row.plan}
                          </Badge>
                        </td>
                        <td className="space-x-1 whitespace-nowrap">
                          {row.bannedAt ? (
                            <Badge tone="red">Suspended</Badge>
                          ) : row.emailVerifiedAt ? (
                            <Badge tone="green">Confirmed</Badge>
                          ) : (
                            <Badge tone="amber">Unconfirmed</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filter === "spam" ? (
              <button
                type="submit"
                className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete ticked accounts
              </button>
            ) : null}
          </form>
        ) : (
          <p className="text-sm text-slate-500">
            {filter === "spam"
              ? "No spam-looking accounts right now."
              : "No members match this search."}
          </p>
        )}

        {filter !== "spam" && pages > 1 ? (
          <div className="mt-4 flex items-center gap-3 text-sm">
            {page > 1 ? (
              <Link href={href({ page: page - 1 })} className="font-semibold text-indigo-600">
                ← Previous
              </Link>
            ) : null}
            <span className="text-slate-500">
              Page {page} of {pages}
            </span>
            {page < pages ? (
              <Link href={href({ page: page + 1 })} className="font-semibold text-indigo-600">
                Next →
              </Link>
            ) : null}
          </div>
        ) : null}
      </Card>

      <Card id="recent-payments">
        <h2 className="mb-3 text-lg font-bold">Recent payments</h2>
        {payments.length ? (
          <ul className="divide-y divide-slate-100 text-sm">
            {payments.map((payment) => (
              <li key={payment.id} className="flex justify-between py-2">
                <Link
                  href={`/admin/members/${payment.user.id}`}
                  className="font-medium text-indigo-700 hover:underline"
                >
                  {payment.user.email} · {payment.plan}
                </Link>
                <span className="text-slate-500">
                  {formatMinor(payment.amountMinor, payment.currency)} ·{" "}
                  {payment.createdAt.toLocaleDateString("en-IN")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No payments recorded yet.</p>
        )}
      </Card>
    </div>
  );
}
