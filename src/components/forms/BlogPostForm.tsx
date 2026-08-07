"use client";

import { useFormState } from "react-dom";
import { saveBlogPostAction } from "@/app/actions/blog";
import { emptyState } from "@/lib/actions";
import { Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { ImageField } from "@/components/forms/ImageField";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";

export type BlogPostDraft = {
  id: string;
  title: string;
  excerpt: string | null;
  body: string;
  coverUrl: string | null;
  tags: string[];
  kind: string;
  published: boolean;
};

export function BlogPostForm({ post }: { post?: BlogPostDraft }) {
  const [state, formAction] = useFormState(saveBlogPostAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title">
          <input
            name="title"
            required
            maxLength={140}
            defaultValue={post?.title ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Type">
          <select
            name="kind"
            defaultValue={post?.kind ?? "POST"}
            className={inputClass}
          >
            <option value="POST">Blog post</option>
            <option value="UPDATE">What&apos;s new update</option>
          </select>
        </Field>
      </div>

      <Field label="One-line summary" hint="Used on cards, search and RSS">
        <input
          name="excerpt"
          maxLength={200}
          defaultValue={post?.excerpt ?? ""}
          className={inputClass}
        />
      </Field>

      <Field
        label="Body"
        hint="Blank line starts a new paragraph; lines starting with &quot;- &quot; become bullets"
      >
        <textarea
          name="body"
          required
          rows={10}
          defaultValue={post?.body ?? ""}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <ImageField
          name="coverUrl"
          label="Cover image"
          purpose="banner"
          defaultValue={post?.coverUrl ?? ""}
          previewClassName="h-24 w-40 rounded-xl object-cover"
        />
        <Field label="Tags" hint="Comma separated">
          <input
            name="tags"
            maxLength={200}
            defaultValue={post?.tags.join(", ") ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input
          type="checkbox"
          name="published"
          defaultChecked={post?.published ?? true}
          className="h-4 w-4"
        />
        Published
      </label>

      <FormSuccess>{state.success}</FormSuccess>
      <SubmitButton>{post ? "Save post" : "Publish post"}</SubmitButton>
    </form>
  );
}
