import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { effectivePlan, mediaLimit } from "@/lib/plans";
import { AddMediaForm } from "@/components/forms/AddMediaForm";
import { deleteMediaAction } from "@/app/actions/business";
import { Card, EmptyState, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gallery" };

export default async function MediaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const business = await db.business.findUnique({
    where: { ownerId: user.id },
    include: { media: { orderBy: { sortOrder: "asc" } } },
  });

  if (!business) {
    return (
      <Card>
        <EmptyState
          title="Create your business card first"
          body="You need a profile before adding gallery items."
        />
        <div className="mt-4 text-center">
          <LinkButton href="/dashboard/profile">Create my card</LinkButton>
        </div>
      </Card>
    );
  }

  const limit = mediaLimit(user);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Gallery</h1>
        <p className="text-sm text-slate-600">
          {business.media.length} of {limit} items used on the {effectivePlan(user)} plan.
        </p>
      </div>

      <Card>
        <AddMediaForm />
      </Card>

      {business.media.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {business.media.map((item) => (
            <Card key={item.id} className="space-y-2">
              {item.type === "VIDEO" ? (
                <video src={item.url} controls className="h-40 w-full rounded-xl bg-black" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt={item.caption ?? ""}
                  className="h-40 w-full rounded-xl border border-slate-200 object-cover"
                />
              )}
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm text-slate-600">
                  {item.caption ?? item.type}
                </span>
                <form action={deleteMediaAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-red-200 px-3 py-1 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No gallery items yet" body="Add image or video URLs above." />
      )}
    </div>
  );
}
