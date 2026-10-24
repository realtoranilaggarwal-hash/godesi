import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, EmptyState, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Card leads" };

export default async function CardLeadsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const business = await db.business.findUnique({
    where: { ownerId: user.id },
    select: { id: true, slug: true, name: true },
  });
  const leads = business
    ? await db.cardLead.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: "desc" },
        take: 200,
      })
    : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Card leads</h1>
        {business ? (
          <LinkButton href={`/business/${business.slug}`} variant="secondary">
            View my card
          </LinkButton>
        ) : null}
      </div>
      <p className="text-sm text-slate-600">
        Visitors who shared their details from your digital card. Share your
        card link or QR to collect more.
      </p>

      {!business ? (
        <Card>
          <EmptyState
            title="Create your card first"
            body="Your digital card is your business profile — set one up and start sharing it."
          />
          <div className="mt-4 text-center">
            <LinkButton href="/dashboard/profile">Create my card</LinkButton>
          </div>
        </Card>
      ) : leads.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {leads.map((lead) => (
            <Card key={lead.id} className="space-y-2">
              <p className="font-semibold">{lead.name}</p>
              <div className="text-sm">
                {lead.phone ? (
                  <p>
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-indigo-600"
                    >
                      {lead.phone}
                    </a>
                  </p>
                ) : null}
                {lead.email ? (
                  <p>
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-indigo-600"
                    >
                      {lead.email}
                    </a>
                  </p>
                ) : null}
                {lead.note ? (
                  <p className="mt-1 text-slate-600">“{lead.note}”</p>
                ) : null}
              </div>
              <p className="text-xs text-slate-400">
                {lead.createdAt.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="No leads yet"
            body="Share your card link or print the QR — when someone leaves their details, they show up here."
          />
          <div className="mt-4 text-center">
            <Link href={`/business/${business.slug}`} className="text-sm font-semibold text-indigo-600 underline">
              Open my card →
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
