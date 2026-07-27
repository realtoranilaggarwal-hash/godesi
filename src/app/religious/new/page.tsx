import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { Faith } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { requestCountry } from "@/lib/currency";
import { mediaLimit } from "@/lib/plans";
import { isFaith } from "@/lib/worship";
import { WorshipForm } from "@/components/forms/WorshipForm";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Add a place of worship" };

export default async function NewWorshipPage({
  searchParams,
}: {
  searchParams: { faith?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/religious/new");

  const defaultFaith: Faith = isFaith(searchParams.faith)
    ? searchParams.faith
    : "HINDU_TEMPLE";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Add a place of worship</h1>
        <p className="text-sm text-slate-600">
          Temples, gurudwaras, mosques and churches — submissions are reviewed before they
          go live, so the directory stays accurate.
        </p>
      </div>
      <Card>
        <WorshipForm
          imageLimit={mediaLimit(user)}
          defaultFaith={defaultFaith}
          defaultCountry={requestCountry()}
        />
      </Card>
    </div>
  );
}
