import Link from "next/link";
import {
  blockChatterMemberAction,
  deleteChatterPostAction,
  toggleChatterFollowAction,
  toggleChatterLikeAction,
} from "@/app/actions/chatter";
import {
  bodyParts,
  chatterAge,
  chatterExcerpt,
  chatterPath,
  topicOf,
  translateLink,
  type ChatterPostRow,
} from "@/lib/chatter";
import { siteUrl } from "@/lib/format";
import { properName } from "@/lib/names";
import { ChatterEditForm } from "@/components/chatter/ChatterEditForm";
import { ChatterReportForm } from "@/components/chatter/ChatterReportForm";
import { ChatterShare } from "@/components/chatter/ChatterShare";

export function ChatterBody({ body }: { body: string }) {
  return (
    <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-slate-800">
      {bodyParts(body).map((part, index) =>
        part.kind === "text" ? (
          <span key={index}>{part.text}</span>
        ) : part.kind === "link" ? (
          <a
            key={index}
            href={part.href}
            target="_blank"
            rel="nofollow ugc noopener noreferrer"
            className="break-all text-indigo-700 underline"
          >
            {part.text.replace(/^https?:\/\//, "")}
          </a>
        ) : (
          <Link
            key={index}
            href={`/chatter?tag=${encodeURIComponent(part.tag)}`}
            className="font-semibold text-indigo-700 hover:underline"
          >
            {part.text}
          </Link>
        ),
      )}
    </p>
  );
}

function Avatar({ author }: { author: ChatterPostRow["author"] }) {
  return author.avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={author.avatarUrl}
      alt=""
      className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover"
    />
  ) : (
    <span
      aria-hidden
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 via-rose-500 to-fuchsia-600 text-sm font-black text-white"
    >
      {author.name.slice(0, 1).toUpperCase()}
    </span>
  );
}

const linkButton = "text-xs font-semibold text-slate-500 hover:text-slate-800";

export function ChatterPostCard({
  post,
  viewerId,
  liked,
  following,
  uploads,
  linkToPost = true,
}: {
  post: ChatterPostRow;
  viewerId: string | null;
  liked: boolean;
  following: boolean;
  uploads: boolean;
  linkToPost?: boolean;
}) {
  const author = post.author;
  const name = properName(author.name);
  const mine = viewerId === author.id;
  const topic = topicOf(post.topic);
  const path = chatterPath(post.id);
  const signIn = `/login?next=${encodeURIComponent(path)}`;

  return (
    <article className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4">
      {author.username ? (
        <Link href={`/${author.username}`} aria-label={name}>
          <Avatar author={author} />
        </Link>
      ) : (
        <Avatar author={author} />
      )}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
          {author.username ? (
            <Link
              href={`/${author.username}`}
              className="font-bold hover:underline"
            >
              {name}
            </Link>
          ) : (
            <span className="font-bold">{name}</span>
          )}
          {author.username ? (
            <span className="text-xs text-slate-400">@{author.username}</span>
          ) : null}
          <span className="text-xs text-slate-400">·</span>
          <Link
            href={path}
            className="text-xs text-slate-500 hover:underline"
            title={post.createdAt.toISOString()}
          >
            <time dateTime={post.createdAt.toISOString()}>
              {chatterAge(post.createdAt)}
            </time>
            {post.editedAt ? " · edited" : ""}
          </Link>
          {viewerId && !mine ? (
            <form action={toggleChatterFollowAction} className="ml-auto">
              <input type="hidden" name="userId" value={author.id} />
              <input type="hidden" name="postId" value={post.id} />
              <button
                type="submit"
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  following
                    ? "border border-slate-300 text-slate-600"
                    : "bg-slate-900 text-white"
                }`}
              >
                {following ? "Following" : "+ Follow"}
              </button>
            </form>
          ) : null}
        </div>
        {post.parentId ? null : (
          <div className="flex flex-wrap gap-1.5 text-xs">
            <Link
              href={`/chatter?topic=${topic.id}`}
              className="rounded-full bg-orange-50 px-2 py-0.5 font-semibold text-orange-700"
            >
              {topic.emoji} {topic.label}
            </Link>
            {post.city ? (
              <Link
                href={`/chatter?city=${encodeURIComponent(post.city)}`}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600"
              >
                📍 {post.city}
              </Link>
            ) : null}
          </div>
        )}
        {linkToPost ? (
          <Link href={path} className="block">
            <ChatterBody body={post.body} />
          </Link>
        ) : (
          <ChatterBody body={post.body} />
        )}
        {post.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.imageUrl}
            alt=""
            loading="lazy"
            className="max-h-[420px] w-auto max-w-full rounded-lg border border-slate-200 object-contain"
          />
        ) : null}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
          {viewerId ? (
            <form action={toggleChatterLikeAction}>
              <input type="hidden" name="postId" value={post.id} />
              <button
                type="submit"
                aria-pressed={liked}
                className={`text-xs font-semibold ${liked ? "text-rose-600" : "text-slate-500 hover:text-rose-600"}`}
              >
                {liked ? "♥" : "♡"} {post.likeCount}
              </button>
            </form>
          ) : (
            <Link href={signIn} className={linkButton}>
              ♡ {post.likeCount}
            </Link>
          )}
          <Link href={`${path}#reply`} className={linkButton}>
            💬 {post.replyCount}
          </Link>
          <ChatterShare
            url={`${siteUrl()}${path}`}
            text={`${name} on GoDesi Chatter: “${chatterExcerpt(post.body, 100)}”`}
          />
          {post.language !== "en" ? (
            <a
              href={translateLink(post.body)}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={linkButton}
            >
              🌐 Translate
            </a>
          ) : null}
          {mine ? (
            <>
              <ChatterEditForm
                uploads={uploads}
                post={{
                  id: post.id,
                  body: post.body,
                  topic: post.topic,
                  city: post.city,
                  language: post.language,
                  imageUrl: post.imageUrl,
                  isReply: Boolean(post.parentId),
                }}
              />
              <form action={deleteChatterPostAction}>
                <input type="hidden" name="id" value={post.id} />
                <button
                  type="submit"
                  className="text-xs font-semibold text-slate-500 hover:text-rose-600"
                >
                  🗑 Delete
                </button>
              </form>
            </>
          ) : viewerId ? (
            <>
              <ChatterReportForm postId={post.id} />
              <form action={blockChatterMemberAction}>
                <input type="hidden" name="userId" value={author.id} />
                <input type="hidden" name="postId" value={post.id} />
                <button
                  type="submit"
                  className="text-xs font-semibold text-slate-500 hover:text-rose-600"
                >
                  🚫 Block
                </button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
