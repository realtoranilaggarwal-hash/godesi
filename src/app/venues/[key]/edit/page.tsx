import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { canEditVenue, findVenue, venuePath } from "@/lib/venues";
import { Card } from "@/components/ui";
import { EditVenueForm } from "@/components/forms/EditVenueForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Edit venue | Godesi",
  robots: { index: false },
};

export default async function EditVenuePage({
  params,
}: {
  params: { key: string };
}) {
  const venue = await findVenue(params.key);
  if (!venue) notFound();
  const path = venuePath(venue);
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`${path}/edit`)}`);
  if (!canEditVenue(user, venue)) redirect(path);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <Link
          href={path}
          className="text-xs font-semibold text-violet-700 hover:underline"
        >
          ← Back to {venue.name}
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Edit {venue.name}</h1>
        <p className="text-sm text-slate-600">{venue.city}</p>
      </div>
      <Card>
        <EditVenueForm venue={venue} />
      </Card>
    </div>
  );
}
