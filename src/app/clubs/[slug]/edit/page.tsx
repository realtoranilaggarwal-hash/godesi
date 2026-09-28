import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isClubOrganizer } from "@/lib/clubAccess";
import { ClubForm } from "@/components/forms/ClubForm";
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
  if (!(await isClubOrganizer(club.id, user.id)))
    redirect(`/clubs/${club.slug}`);

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
    </div>
  );
}
