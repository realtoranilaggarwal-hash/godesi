import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isClubOrganizer } from "@/lib/clubAccess";
import { ClubForm } from "@/components/forms/ClubForm";
import { DeleteClubForm } from "@/components/forms/DeleteClubForm";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Edit club",
  robots: { index: false },
};

export default async function EditClubPage({
  params,
}: {
  params: { slug: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/clubs/${params.slug}/edit`);
  const club = await db.club.findUnique({ where: { slug: params.slug } });
  if (!club) notFound();
  if (!(await isClubOrganizer(club.id, user))) redirect(`/clubs/${club.slug}`);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <Link href={`/clubs/${club.slug}`} className="text-sm text-indigo-600">
          ← Back to {club.name}
        </Link>
        <h1 className="text-2xl font-bold">Edit club</h1>
      </div>
      <Card>
        <ClubForm club={club} />
      </Card>
      <Card className="border-rose-200">
        <h2 className="mb-2 text-lg font-bold text-rose-700">Delete club</h2>
        <DeleteClubForm clubId={club.id} clubName={club.name} />
      </Card>
    </div>
  );
}
