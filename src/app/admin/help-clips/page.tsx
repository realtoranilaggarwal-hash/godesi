import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getCategoryTree } from "@/lib/directory";
import {
  deleteHelpClipAction,
  toggleHelpClipAction,
} from "@/app/actions/helpClips";
import { HelpClipForm } from "@/components/forms/HelpClipForm";
import { Card } from "@/components/ui";
import { deskFallback } from "@/lib/adminSections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Help clips" };

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/help-clips");
  if (user.role !== "ADMIN")
    redirect(deskFallback(user, "Help clips"));

  const [clips, tree] = await Promise.all([
    db.helpClip.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 200,
    }),
    getCategoryTree(),
  ]);

  const categories = tree.flatMap((parent) => [
    { slug: parent.slug, name: parent.name, depth: 0 },
    ...parent.children.map((child) => ({
      slug: child.slug,
      name: child.name,
      depth: 1,
    })),
  ]);
  const names = new Map(categories.map((entry) => [entry.slug, entry.name]));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Help clips</h1>
      <Card>
        <h2 className="mb-1 text-lg font-bold">Add a clip ({clips.length})</h2>
        <p className="mb-3 text-sm text-slate-500">
          Upload the video to YouTube first (public or unlisted, Shorts are
          fine) and paste the link here. The card sits at the top of the sidebar,
          opens itself only on a visitor&apos;s first visit, and loads nothing
          from YouTube until they press play.
        </p>
        <HelpClipForm categories={categories} />
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-bold">Clips in use</h2>
        <ul className="divide-y divide-slate-100 text-sm">
          {clips.map((clip) => (
            <li
              key={clip.id}
              className="flex flex-wrap items-start justify-between gap-2 py-2"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {clip.title}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    {clip.active ? "live" : "off"}
                  </span>
                </p>
                <p className="break-all text-xs text-slate-400">{clip.url}</p>
                <p className="text-xs text-slate-500">
                  {clip.categorySlug
                    ? (names.get(clip.categorySlug) ?? clip.categorySlug)
                    : "Everywhere"}{" "}
                  · {clip.plays.toLocaleString()} plays · order {clip.sortOrder}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <form action={toggleHelpClipAction}>
                  <input type="hidden" name="id" value={clip.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                  >
                    {clip.active ? "turn off" : "turn on"}
                  </button>
                </form>
                <form action={deleteHelpClipAction}>
                  <input type="hidden" name="id" value={clip.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                  >
                    delete
                  </button>
                </form>
              </div>
            </li>
          ))}
          {clips.length === 0 ? (
            <li className="py-2 text-slate-500">No clips yet.</li>
          ) : null}
        </ul>
      </Card>
    </div>
  );
}
