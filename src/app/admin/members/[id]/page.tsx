import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  deleteMemberAction,
  saveMemberNoteAction,
  setMemberBannedAction,
  setMemberRoleAction,
  setMemberVerifiedAction,
} from "@/app/actions/members";
import { setUserPlanAction } from "@/app/actions/admin";
import { PLAN_ORDER } from "@/lib/plans";
import { formatMinor, whatsappLink } from "@/lib/format";
import { spamSignals } from "@/lib/signupGuard";
import { MEMBER_EMAIL_TEMPLATES } from "@/lib/memberEmails";
import { MemberEmailForm } from "@/components/admin/MemberEmailForm";
import { Badge, Card, inputClass } from "@/components/ui";
import { deskFallback } from "@/lib/adminSections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Member | Godesi admin" };

const ROLES = ["CLIENT", "BUSINESS", "MODERATOR", "ADMIN"] as const;

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export default async function MemberPage({
  params,
}: {
  params: { id: string };
}) {
  const admin = await getCurrentUser();
  if (!admin) redirect(`/login?next=/admin/members/${params.id}`);
  if (admin.role !== "ADMIN")
    redirect(deskFallback(admin, "Members"));

  const member = await db.user.findUnique({
    where: { id: params.id },
    include: {
      business: {
        select: { name: true, slug: true, city: true, status: true, featured: true },
      },
      payments: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!member) notFound();

  const [listings, events, leads, points, referrals] = await Promise.all([
    db.listing.count({ where: { ownerId: member.id } }),
    db.event.count({ where: { organizerId: member.id } }),
    db.lead.count({ where: { clientId: member.id } }),
    db.pointsEntry.aggregate({
      where: { userId: member.id },
      _sum: { points: true },
    }),
    db.user.count({ where: { referredById: member.id } }),
  ]);

  const signals = spamSignals(member);
  const totalPaid = member.payments.reduce(
    (sum, payment) => sum + payment.amountMinor,
    0,
  );

  return (
    <div className="space-y-4">
      <Link href="/admin/members" className="text-sm font-semibold text-indigo-600">
        ← All members
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{member.name}</h1>
        {member.bannedAt ? <Badge tone="red">Suspended</Badge> : null}
        {member.emailVerifiedAt ? (
          <Badge tone="green">Email confirmed</Badge>
        ) : (
          <Badge tone="amber">Email not confirmed</Badge>
        )}
        <Badge tone={member.plan === "FREE" ? "slate" : "indigo"}>
          {member.plan}
        </Badge>
      </div>

      {signals.length ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Spam signals: {signals.join(" · ")}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-2 text-lg font-bold">Account</h2>
          <Row
            label="Email"
            value={
              <a href={`mailto:${member.email}`} className="text-indigo-700">
                {member.email}
              </a>
            }
          />
          <Row
            label="Phone"
            value={
              member.phone ? (
                <a
                  href={whatsappLink(member.phone)}
                  className="text-indigo-700"
                  target="_blank"
                  rel="noreferrer"
                >
                  {member.phone}
                </a>
              ) : (
                "—"
              )
            }
          />
          <Row label="Role" value={member.role} />
          <Row label="Joined" value={member.createdAt.toLocaleString("en-IN")} />
          <Row
            label="Public profile"
            value={
              member.username ? (
                <Link href={`/${member.username}`} className="text-indigo-700">
                  /{member.username}
                </Link>
              ) : (
                "—"
              )
            }
          />
          <Row label="City" value={member.location ?? "—"} />
          <Row
            label="Last emailed"
            value={
              member.lastContactedAt
                ? member.lastContactedAt.toLocaleDateString("en-IN")
                : "Never"
            }
          />
          {member.bannedReason ? (
            <Row label="Suspended for" value={member.bannedReason} />
          ) : null}
        </Card>

        <Card>
          <h2 className="mb-2 text-lg font-bold">What they posted</h2>
          <Row
            label="Business card"
            value={
              member.business ? (
                <Link
                  href={`/b/${member.business.slug}`}
                  className="text-indigo-700"
                >
                  {member.business.name} · {member.business.status}
                </Link>
              ) : (
                "None"
              )
            }
          />
          <Row label="Property, rooms & items" value={listings} />
          <Row label="Events" value={events} />
          <Row label="Requirements" value={leads} />
          <Row label="Reward points" value={points._sum.points ?? 0} />
          <Row label="Members referred" value={referrals} />
          <Row
            label="Paid so far"
            value={
              member.payments.length
                ? formatMinor(totalPaid, member.payments[0].currency)
                : "—"
            }
          />
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-bold">Change plan</h2>
          <div className="flex flex-wrap gap-2">
            {PLAN_ORDER.filter((plan) => plan !== member.plan).map((plan) => (
              <form key={plan} action={setUserPlanAction}>
                <input type="hidden" name="id" value={member.id} />
                <input type="hidden" name="plan" value={plan} />
                <button
                  type="submit"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
                >
                  Set {plan}
                </button>
              </form>
            ))}
          </div>

          <h2 className="mb-3 mt-5 text-lg font-bold">Role</h2>
          <form action={setMemberRoleAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="id" value={member.id} />
            <select
              name="role"
              defaultValue={member.role}
              className={`${inputClass} max-w-[220px]`}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
            >
              Save role
            </button>
          </form>

          <h2 className="mb-3 mt-5 text-lg font-bold">Moderation</h2>
          <div className="flex flex-wrap gap-2">
            <form action={setMemberVerifiedAction}>
              <input type="hidden" name="id" value={member.id} />
              <input
                type="hidden"
                name="verified"
                value={member.emailVerifiedAt ? "no" : "yes"}
              />
              <button
                type="submit"
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
              >
                {member.emailVerifiedAt
                  ? "Mark email unconfirmed"
                  : "Mark email confirmed"}
              </button>
            </form>

            <form action={setMemberBannedAction} className="flex flex-wrap gap-2">
              <input type="hidden" name="id" value={member.id} />
              <input
                type="hidden"
                name="banned"
                value={member.bannedAt ? "no" : "yes"}
              />
              {member.bannedAt ? null : (
                <input
                  name="reason"
                  placeholder="Reason (optional)"
                  className={`${inputClass} max-w-[220px]`}
                />
              )}
              <button
                type="submit"
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  member.bannedAt
                    ? "border border-slate-300 hover:bg-slate-50"
                    : "bg-amber-500 text-white hover:bg-amber-600"
                }`}
              >
                {member.bannedAt ? "Lift suspension" : "Suspend account"}
              </button>
            </form>

            <form action={deleteMemberAction}>
              <input type="hidden" name="id" value={member.id} />
              <button
                type="submit"
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete member
              </button>
            </form>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Suspending signs them out and unpublishes their cards but keeps the
            record. Deleting removes the account and everything they posted.
          </p>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-bold">Email this member</h2>
          <MemberEmailForm
            memberId={member.id}
            templates={MEMBER_EMAIL_TEMPLATES.map(({ key, label, subject }) => ({
              key,
              label,
              subject,
            }))}
          />
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-bold">Private note</h2>
          <form action={saveMemberNoteAction} className="space-y-2">
            <input type="hidden" name="id" value={member.id} />
            <textarea
              name="note"
              rows={4}
              defaultValue={member.adminNote ?? ""}
              placeholder="Called on 5 Aug, wants to think about the package…"
              className={inputClass}
            />
            <button
              type="submit"
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
            >
              Save note
            </button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-bold">Payments</h2>
          {member.payments.length ? (
            <ul className="divide-y divide-slate-100 text-sm">
              {member.payments.map((payment) => (
                <li key={payment.id} className="flex justify-between py-2">
                  <span>{payment.plan}</span>
                  <span className="text-slate-500">
                    {formatMinor(payment.amountMinor, payment.currency)} ·{" "}
                    {payment.createdAt.toLocaleDateString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No payments yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
