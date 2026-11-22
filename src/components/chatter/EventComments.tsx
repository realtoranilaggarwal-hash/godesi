import Link from "next/link";
import {
  eventComments,
  eventCommentsReturnPath,
  viewerState,
  type ChatterPostRow,
} from "@/lib/chatter";
import { uploadsEnabled } from "@/lib/uploads";
import { ChatterComposer } from "@/components/chatter/ChatterComposer";
import { ChatterPostCard } from "@/components/chatter/ChatterPostCard";

/** Chatter comments, with replies, under an event page. */
export async function EventComments({
  eventId,
  slug,
  viewerId,
}: {
  eventId: string;
  slug: string;
  viewerId: string | null;
}) {
  const threads = await eventComments(eventId);
  const viewer = await viewerState(
    viewerId,
    threads.flatMap((thread) => [thread.comment, ...thread.replies]),
  );
  const shown = threads
    .filter((thread) => !viewer.blocked.has(thread.comment.author.id))
    .map((thread) => ({
      comment: thread.comment,
      replies: thread.replies.filter(
        (reply) => !viewer.blocked.has(reply.author.id),
      ),
    }));
  const count = shown.reduce(
    (sum, thread) => sum + 1 + thread.replies.length,
    0,
  );
  const uploads = uploadsEnabled();
  const signIn = `/login?next=${encodeURIComponent(eventCommentsReturnPath(slug))}`;
  const card = (row: ChatterPostRow) => (
    <ChatterPostCard
      key={row.id}
      post={row}
      viewerId={viewerId}
      liked={viewer.liked.has(row.id)}
      following={viewer.following.has(row.author.id)}
      uploads={uploads}
    />
  );

  return (
    <section
      id="comments"
      className="scroll-mt-24 space-y-3 border-t border-slate-100 pt-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-bold">💬 Comments{count ? ` (${count})` : ""}</h2>
        <Link
          href="/chatter/rules"
          className="text-xs text-slate-500 hover:underline"
        >
          Comment rules
        </Link>
      </div>
      {viewerId ? (
        <ChatterComposer eventId={eventId} uploads={uploads} />
      ) : (
        <p className="text-sm text-slate-600">
          <Link
            href={signIn}
            className="font-semibold text-indigo-700 underline"
          >
            Log in
          </Link>{" "}
          to ask a question or tell people you&apos;re going.
        </p>
      )}
      {shown.length === 0 ? (
        <p className="text-sm text-slate-500">
          No comments yet. Be the first to say hello.
        </p>
      ) : null}
      {shown.map(({ comment, replies }) => (
        <div key={comment.id} className="space-y-2">
          {card(comment)}
          {replies.length || viewerId ? (
            <div className="space-y-2 pl-6 sm:pl-10">
              {replies.map(card)}
              {viewerId ? (
                <details>
                  <summary className="cursor-pointer text-xs font-semibold text-indigo-700">
                    Reply
                  </summary>
                  <div className="mt-2">
                    <ChatterComposer parentId={comment.id} uploads={uploads} />
                  </div>
                </details>
              ) : null}
            </div>
          ) : null}
        </div>
      ))}
    </section>
  );
}
