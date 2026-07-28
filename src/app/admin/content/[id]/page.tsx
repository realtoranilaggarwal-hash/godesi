import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { BlogPostForm } from "@/components/forms/BlogPostForm";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit post" };

export default async function EditBlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isStaff(user)) redirect("/dashboard");

  const post = await db.blogPost.findUnique({ where: { id: params.id } });
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/admin/content" className="text-sm font-semibold text-indigo-600">
        ← Content desk
      </Link>
      <Card>
        <h1 className="mb-3 text-xl font-bold">Edit post</h1>
        <BlogPostForm post={post} />
      </Card>
    </div>
  );
}
