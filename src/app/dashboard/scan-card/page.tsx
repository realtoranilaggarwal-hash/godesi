import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { effectivePlan } from "@/lib/plans";
import { Card, LinkButton } from "@/components/ui";
import { CardScan } from "@/components/CardScan";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Scan a paper card" };

export default async function ScanCardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const canScan =
    user.role === "ADMIN" ||
    effectivePlan(user) === "PREMIUM" ||
    user.foundingNumber !== null;
  const business = canScan
    ? await db.business.findUnique({
        where: { ownerId: user.id },
        select: { slug: true },
      })
    : null;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">📷 Scan a paper card</h1>
        <p className="mt-1 text-sm text-slate-600">
          Photograph your printed business card — AI reads it and fills your
          GoDesi card for you.
        </p>
      </div>

      {!canScan ? (
        <Card className="space-y-3 text-center">
          <p className="text-3xl">⭐</p>
          <h2 className="text-lg font-bold">Premium feature</h2>
          <p className="text-sm text-slate-600">
            Card scanning is included with the Premium plan — upgrade to use it.
          </p>
          <LinkButton href="/dashboard/plan">See plans</LinkButton>
        </Card>
      ) : !business ? (
        <Card className="space-y-3 text-center">
          <h2 className="text-lg font-bold">Create your card first</h2>
          <p className="text-sm text-slate-600">
            The scanner fills your GoDesi card — set one up, then come back.
          </p>
          <LinkButton href="/dashboard/profile">Create my card</LinkButton>
        </Card>
      ) : (
        <Card>
          <CardScan />
        </Card>
      )}
    </div>
  );
}
