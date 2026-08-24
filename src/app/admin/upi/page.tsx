import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { reviewUpiPaymentAction } from "@/app/actions/upi";
import { upiEnabled, upiVpa } from "@/lib/upi";
import { formatMinor } from "@/lib/format";
import { Badge, Card } from "@/components/ui";
import { deskFallback } from "@/lib/adminSections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "UPI payments" };

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/upi");
  if (user.role !== "ADMIN")
    redirect(deskFallback(user, "UPI payments"));

  const upiRequests = await db.upiRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 40,
    include: { user: { select: { email: true, name: true } } },
  });
  const pendingUpi = upiRequests.filter((row) => row.status === "PENDING");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">UPI payments</h1>
      <Card id="upi">
        <h2 className="mb-1 text-lg font-bold">
          UPI payments{" "}
          {pendingUpi.length ? (
            <Badge tone="amber">{pendingUpi.length} to check</Badge>
          ) : null}
        </h2>
        <p className="mb-3 text-sm text-slate-600">
          {upiEnabled() ? (
            <>
              Buyers pay into{" "}
              <span className="font-mono font-semibold">{upiVpa()}</span>{" "}
              quoting a reference. Check the credit in your bank or PhonePe
              history, then approve — approving activates the plan for 30 days.
            </>
          ) : (
            <>
              Set the <span className="font-mono">UPI_VPA</span> environment
              variable (and optionally{" "}
              <span className="font-mono">UPI_PAYEE_NAME</span>) to offer UPI
              payments on the pricing page.
            </>
          )}
        </p>
        {upiRequests.length ? (
          <ul className="divide-y divide-slate-100 text-sm">
            {upiRequests.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2"
              >
                <div className="min-w-0">
                  <p className="font-semibold">
                    <span className="font-mono">{row.reference}</span> ·{" "}
                    {formatMinor(row.amountMinor, row.currency)} · {row.plan}
                  </p>
                  <p className="text-xs text-slate-500">
                    {row.user.email} · {row.createdAt.toLocaleString("en-IN")}
                    {row.utr ? (
                      <>
                        {" "}
                        · UTR <span className="font-mono">{row.utr}</span>
                      </>
                    ) : (
                      " · buyer has not confirmed yet"
                    )}
                  </p>
                </div>
                {row.status === "PENDING" ? (
                  <div className="flex gap-2">
                    <form action={reviewUpiPaymentAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <input type="hidden" name="decision" value="approve" />
                      <button
                        type="submit"
                        className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Money received — activate
                      </button>
                    </form>
                    <form action={reviewUpiPaymentAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <input type="hidden" name="decision" value="reject" />
                      <button
                        type="submit"
                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Not received
                      </button>
                    </form>
                  </div>
                ) : (
                  <Badge tone={row.status === "PAID" ? "green" : "slate"}>
                    {row.status === "PAID" ? "Activated" : "Rejected"}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No UPI payments yet.</p>
        )}
      </Card>
    </div>
  );
}
