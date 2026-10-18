import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { siteUrl } from "@/lib/format";
import { properName } from "@/lib/names";
import { uploadsEnabled } from "@/lib/uploads";
import {
  chatterExcerpt,
  chatterPath,
  chatterThread,
  viewerState,
  type ChatterPostRow,
} from "@/lib/chatter";
import { ChatterComposer } from "@/components/chatter/ChatterComposer";
import { ChatterPostCard } from "@/components/chatter/ChatterPostCard";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const thread = await chatterThread(params.id);
  if (!thread) return { title: "Post not found", robots: { index: false } };
  const { post } = thread;
  const name = properName(post.author.name);
  const url = `${siteUrl()}${chatterPath(post.id)}`;
  const title = `${name} on GoDesi Chatter: “${chatterExcerpt(post.body, 60)}”`;
  const description = chatterExcerpt(post.body, 160);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: post.imageUrl ? [post.imageUrl] : undefined,
    },
    twitter: {
      card: post.imageUrl ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}

export default async function ChatterPostPage({
  params,
}: {
  params: { id: string };
}) {
  const [thread, user] = await Promise.all([
    chatterThread(params.id),
    getCurrentUser(),
  ]);
  if (!thread) notFound();
  const { post, replies } = thread;
  const viewer = await viewerState(user?.id ?? null, [post, ...replies]);
  if (viewer.blocked.has(post.author.id)) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <Card>
          <p className="text-sm text-slate-700">
            You blocked this member, so their posts are hidden for you.
          </p>
          <Link
            href="/chatter"
            className="mt-2 inline-block text-sm text-indigo-700 underline"
          >
            Back to Chatter
          </Link>
        </Card>
      </div>
    );
  }
  const uploads = uploadsEnabled();
  const shown = replies.filter((reply) => !viewer.blocked.has(reply.author.id));
  const card = (row: ChatterPostRow) => (
    <ChatterPostCard
      key={row.id}
      post={row}
      viewerId={user?.id ?? null}
      liked={viewer.liked.has(row.id)}
      following={viewer.following.has(row.author.id)}
      uploads={uploads}
    />
  );
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    url: `${siteUrl()}${chatterPath(post.id)}`,
    datePublished: post.createdAt.toISOString(),
    ...(post.editedAt ? { dateModified: post.editedAt.toISOString() } : {}),
    text: post.body,
    inLanguage: post.language,
    ...(post.imageUrl ? { image: post.imageUrl } : {}),
    author: {
      "@type": "Person",
      name: properName(post.author.name),
      ...(post.author.username
        ? { url: `${siteUrl()}/${post.author.username}` }
        : {}),
    },
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: post.likeCount,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: post.replyCount,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Link href="/chatter" className="text-sm font-semibold text-indigo-700">
        ← GoDesi Chatter
      </Link>
      {post.parent && !post.parent.hiddenAt ? (
        <p className="text-sm text-slate-600">
          Replying to{" "}
          <Link
            href={chatterPath(post.parent.id)}
            className="font-semibold text-indigo-700 underline"
          >
            {properName(post.parent.author.name)}: “
            {chatterExcerpt(post.parent.body, 60)}”
          </Link>
        </p>
      ) : null}
      {card(post)}
      <section id="reply" className="space-y-3 pl-4 sm:pl-8">
        <h2 className="text-sm font-bold text-slate-700">
          {post.replyCount === 1 ? "1 reply" : `${post.replyCount} replies`}
        </h2>
        {shown.map(card)}
        {user ? (
          <Card>
            <ChatterComposer parentId={post.id} uploads={uploads} />
          </Card>
        ) : (
          <p className="text-sm text-slate-600">
            <Link
              href={`/login?next=${encodeURIComponent(chatterPath(post.id))}`}
              className="font-semibold text-indigo-700 underline"
            >
              Log in
            </Link>{" "}
            to reply.
          </p>
        )}
      </section>
    </div>
  );
}
