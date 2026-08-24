import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  revokePressCardAction,
  verifyJournalistAction,
} from "@/app/actions/admin";
import { Badge, Card } from "@/components/ui";
import { deskFallback } from "@/lib/adminSections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Local journalists" };

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/journalists");
  if (user.role !== "ADMIN")
    redirect(deskFallback(user, "Journalists"));

  const journalists = await db.user.findMany({
    where: { journalistSince: { not: null } },
    orderBy: { journalistSince: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      journalistBeat: true,
      emailVerifiedAt: true,
      phoneVerifiedAt: true,
      kycVerifiedAt: true,
      pressCardId: true,
      pressCardExpiresAt: true,
      _count: { select: { news: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Local journalists</h1>
      <Card id="journalists">
        <h2 className="mb-1 text-lg font-bold">Local journalists</h2>
        <p className="mb-3 text-sm text-slate-500">
          Confirm a reporter&rsquo;s mobile number (message the number on
          WhatsApp) and any ID you have sighted. A press card only issues once
          the member reaches Editor level with these ticked.
        </p>
        {journalists.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Reporter</th>
                  <th>Beat</th>
                  <th>Stories</th>
                  <th>Checks</th>
                  <th className="text-right">Press card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {journalists.map((row) => (
                  <tr key={row.id}>
                    <td className="py-2">
                      <div className="font-medium">{row.name}</div>
                      <div className="text-xs text-slate-500">
                        {row.email}
                        {row.phone ? ` · ${row.phone}` : " · no number yet"}
                      </div>
                    </td>
                    <td className="text-xs text-slate-600">
                      {row.journalistBeat ?? "—"}
                    </td>
                    <td className="text-xs">{row._count.news}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        <Badge tone={row.emailVerifiedAt ? "green" : "slate"}>
                          email
                        </Badge>
                        <form action={verifyJournalistAction}>
                          <input type="hidden" name="id" value={row.id} />
                          <input type="hidden" name="field" value="phone" />
                          <button
                            type="submit"
                            className={`whitespace-nowrap rounded-lg border px-2 py-1 text-xs font-semibold ${
                              row.phoneVerifiedAt
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                : "border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            {row.phoneVerifiedAt ? "✔ mobile" : "verify mobile"}
                          </button>
                        </form>
                        <form action={verifyJournalistAction}>
                          <input type="hidden" name="id" value={row.id} />
                          <input type="hidden" name="field" value="kyc" />
                          <button
                            type="submit"
                            className={`whitespace-nowrap rounded-lg border px-2 py-1 text-xs font-semibold ${
                              row.kycVerifiedAt
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                : "border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            {row.kycVerifiedAt ? "✔ ID" : "mark ID seen"}
                          </button>
                        </form>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        {row.pressCardId &&
                        row.pressCardExpiresAt &&
                        row.pressCardExpiresAt > new Date() ? (
                          <>
                            <span className="font-mono text-xs">
                              {row.pressCardId}
                            </span>
                            <form action={revokePressCardAction}>
                              <input type="hidden" name="id" value={row.id} />
                              <button
                                type="submit"
                                className="whitespace-nowrap rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                revoke
                              </button>
                            </form>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Nobody has joined the journalist programme yet.
          </p>
        )}
      </Card>
    </div>
  );
}
