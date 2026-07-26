import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  setListingStatusAction,
  setUserPlanAction,
  toggleFeaturedAction,
} from "@/app/actions/admin";
import { Badge, Card } from "@/components/ui";
import { PLAN_ORDER } from "@/lib/plans";
import { formatInr } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [businesses, users, payments, leadCount] = await Promise.all([
    db.business.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { owner: { select: { email: true, plan: true } } },
    }),
    db.user.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: { email: true } } },
    }),
    db.lead.count(),
  ]);

  const pending = businesses.filter((b) => b.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin panel</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Businesses", businesses.length],
          ["Pending approval", pending],
          ["Users", users.length],
          ["Leads", leadCount],
        ].map(([label, value]) => (
          <Card key={label as string} className="text-center">
            <p className="text-2xl font-black text-indigo-600">{value}</p>
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-bold">Listings</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Business</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Featured</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {businesses.map((business) => (
                <tr key={business.id}>
                  <td className="py-2">
                    <Link href={`/b/${business.slug}`} className="font-medium text-indigo-600">
                      {business.name}
                    </Link>
                    <div className="text-xs text-slate-500">
                      {business.category} · {business.city}
                    </div>
                  </td>
                  <td className="text-xs text-slate-600">{business.owner.email}</td>
                  <td>
                    <Badge
                      tone={
                        business.status === "APPROVED"
                          ? "green"
                          : business.status === "PENDING"
                            ? "amber"
                            : "red"
                      }
                    >
                      {business.status}
                    </Badge>
                  </td>
                  <td>
                    <form action={toggleFeaturedAction}>
                      <input type="hidden" name="id" value={business.id} />
                      <button type="submit" className="text-xs font-semibold text-indigo-600">
                        {business.featured ? "Yes — unset" : "No — set"}
                      </button>
                    </form>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      {(["APPROVED", "REJECTED", "PENDING"] as const)
                        .filter((status) => status !== business.status)
                        .map((status) => (
                          <form key={status} action={setListingStatusAction}>
                            <input type="hidden" name="id" value={business.id} />
                            <input type="hidden" name="status" value={status} />
                            <button
                              type="submit"
                              className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                            >
                              {status.toLowerCase()}
                            </button>
                          </form>
                        ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-bold">Users &amp; subscriptions</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">User</th>
                <th>Role</th>
                <th>Plan</th>
                <th className="text-right">Change plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((row) => (
                <tr key={row.id}>
                  <td className="py-2">
                    <div className="font-medium">{row.name}</div>
                    <div className="text-xs text-slate-500">{row.email}</div>
                  </td>
                  <td className="text-xs">{row.role}</td>
                  <td>
                    <Badge tone={row.plan === "FREE" ? "slate" : "indigo"}>{row.plan}</Badge>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      {PLAN_ORDER.filter((plan) => plan !== row.plan).map((plan) => (
                        <form key={plan} action={setUserPlanAction}>
                          <input type="hidden" name="id" value={row.id} />
                          <input type="hidden" name="plan" value={plan} />
                          <button
                            type="submit"
                            className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                          >
                            {plan}
                          </button>
                        </form>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-bold">Recent payments</h2>
        {payments.length ? (
          <ul className="divide-y divide-slate-100 text-sm">
            {payments.map((payment) => (
              <li key={payment.id} className="flex justify-between py-2">
                <span>
                  {payment.user.email} · {payment.plan}
                </span>
                <span className="text-slate-500">
                  {formatInr(payment.amount)} · {payment.createdAt.toLocaleDateString("en-IN")}
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
