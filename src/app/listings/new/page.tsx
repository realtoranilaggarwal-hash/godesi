import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ListingKind } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { mediaLimit } from "@/lib/plans";
import { ListingForm } from "@/components/forms/ListingForm";
import { Card } from "@/components/ui";
import { requestCurrency } from "@/lib/currency";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Post a listing" };

const KINDS: ListingKind[] = [
  "PROPERTY_SALE",
  "PROPERTY_RENT",
  "ROOM_OFFERED",
  "ROOM_WANTED",
  "MARKETPLACE",
];

export default async function NewListingPage({
  searchParams,
}: {
  searchParams: { kind?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/listings/new");

  const business = await db.business.findUnique({
    where: { ownerId: user.id },
    select: { whatsappNumber: true, phone: true },
  });

  const kind = KINDS.includes(searchParams.kind as ListingKind)
    ? (searchParams.kind as ListingKind)
    : "PROPERTY_SALE";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Post a listing</h1>
        <p className="text-sm text-slate-600">
          Property, a room to share or something to sell — it takes a minute and it is free.
        </p>
      </div>
      <Card>
        <ListingForm
          defaultKind={kind}
          imageLimit={mediaLimit(user)}
          defaultWhatsapp={business?.whatsappNumber ?? business?.phone ?? ""}
          defaultCurrency={requestCurrency()}
        />
      </Card>
    </div>
  );
}
