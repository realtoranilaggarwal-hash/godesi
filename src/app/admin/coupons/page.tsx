import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CouponForm } from "@/components/forms/CouponForms";
import { toggleCouponAction } from "@/app/actions/coupons";
import { generateFreeCourseCodeAction } from "@/app/actions/course";
import { FREE_CODE_PROVIDER } from "@/lib/courseCodes";
import { courseBySlug } from "@/lib/courses";
import { describeCoupon } from "@/lib/coupons";
import { Badge, Card } from "@/components/ui";
import { deskFallback } from "@/lib/adminSections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Coupons" };

export default async function Page({
  searchParams,
}: {
  searchParams: { freeCode?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/coupons");
  if (user.role !== "ADMIN")
    redirect(deskFallback(user, "Coupons"));

  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      event: { select: { title: true } },
      createdBy: { select: { email: true } },
      redemptions: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          createdAt: true,
          user: { select: { email: true, name: true } },
        },
      },
    },
  });

  const freeCodeUses = await db.courseEnrollment.findMany({
    where: { provider: FREE_CODE_PROVIDER },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      courseSlug: true,
      reference: true,
      createdAt: true,
      user: { select: { email: true, name: true } },
    },
  });
  const newFreeCode = /^ANIL-[A-Z0-9]{6}-[A-Z0-9]{4}$/.test(
    searchParams.freeCode ?? "",
  )
    ? searchParams.freeCode
    : null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Coupons</h1>
      <Card id="free-course">
        <h2 className="mb-1 text-lg font-bold">Free course codes</h2>
        <p className="mb-3 text-sm text-slate-500">
          For clients who hire you to buy or sell a home: make a code and give
          it to them. They sign in, open any course page and type the code
          under &ldquo;Got a free-course code?&rdquo; — that one course unlocks
          free. Each code works once.
        </p>
        <form action={generateFreeCourseCodeAction}>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Make a new free-course code
          </button>
        </form>
        {newFreeCode ? (
          <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
            New code:{" "}
            <span className="select-all font-mono text-base font-bold">
              {newFreeCode}
            </span>{" "}
            — copy it and send it to your client.
          </p>
        ) : null}
        <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100 text-sm">
          {freeCodeUses.map((use) => (
            <li key={use.id} className="py-2">
              <span className="font-mono font-semibold">
                {use.reference?.replace(`${FREE_CODE_PROVIDER}:`, "")}
              </span>{" "}
              · {courseBySlug(use.courseSlug)?.shortTitle ?? use.courseSlug} ·{" "}
              {use.user.name ?? use.user.email} ·{" "}
              {use.createdAt.toLocaleDateString()}
            </li>
          ))}
          {freeCodeUses.length === 0 ? (
            <li className="py-2 text-slate-500">No free-course codes used yet.</li>
          ) : null}
        </ul>
      </Card>
      <Card id="discount-coupons">
        <h2 className="mb-1 text-lg font-bold">Discount coupons</h2>
        <p className="mb-3 text-sm text-slate-500">
          Create a code for each caller — for the complete package, plan
          upgrades, advertising or event tickets. Package codes can cut the
          price, add extra free months (48 makes the one-year package five
          years), or both. Everyone who used a code is listed under it, so you
          can see which caller closed which client.
        </p>
        <CouponForm />
        <ul className="mt-5 divide-y divide-slate-100 border-t border-slate-100 text-sm">
          {coupons.map((coupon) => (
            <li
              key={coupon.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2"
            >
              <div>
                <p className="font-semibold">
                  {coupon.code}{" "}
                  <Badge tone={coupon.active ? "green" : "slate"}>
                    {coupon.active ? "active" : "off"}
                  </Badge>{" "}
                  {coupon.publicOffer ? (
                    <Badge tone="amber">flash offer</Badge>
                  ) : null}
                </p>
                <p className="text-xs text-slate-400">
                  {describeCoupon(coupon)} · {coupon.scope.toLowerCase()}
                  {coupon.event ? ` · ${coupon.event.title}` : ""} ·{" "}
                  {coupon.timesRedeemed}
                  {coupon.maxRedemptions
                    ? `/${coupon.maxRedemptions}`
                    : ""}{" "}
                  used
                  {coupon.expiresAt
                    ? ` · expires ${coupon.expiresAt.toLocaleDateString()}`
                    : ""}
                  {coupon.createdBy ? ` · by ${coupon.createdBy.email}` : ""}
                </p>
                {coupon.redemptions.length ? (
                  <ul className="mt-1 text-xs text-slate-500">
                    {coupon.redemptions.map((redemption) => (
                      <li key={redemption.id}>
                        ✓ {redemption.user.name ?? redemption.user.email} ·{" "}
                        {redemption.createdAt.toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <form action={toggleCouponAction}>
                <input type="hidden" name="id" value={coupon.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                >
                  {coupon.active ? "switch off" : "switch on"}
                </button>
              </form>
            </li>
          ))}
          {coupons.length === 0 ? (
            <li className="py-2 text-slate-500">No coupons yet.</li>
          ) : null}
        </ul>
      </Card>
    </div>
  );
}
