import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { setUserPlanAction } from "@/app/actions/admin";
import { PLAN_ORDER } from "@/lib/plans";
import { formatMinor } from "@/lib/format";
import { Badge, Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Members & payments" };

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/members");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [users, payments] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: { email: true } } },
    }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Members & payments</h1>
      <Card id="users-and-subscriptions">
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
                    <Badge tone={row.plan === "FREE" ? "slate" : "indigo"}>
                      {row.plan}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      {PLAN_ORDER.filter((plan) => plan !== row.plan).map(
                        (plan) => (
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
                        ),
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card id="recent-payments">
        <h2 className="mb-3 text-lg font-bold">Recent payments</h2>
        {payments.length ? (
          <ul className="divide-y divide-slate-100 text-sm">
            {payments.map((payment) => (
              <li key={payment.id} className="flex justify-between py-2">
                <span>
                  {payment.user.email} · {payment.plan}
                </span>
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
