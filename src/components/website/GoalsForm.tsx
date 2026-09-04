"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { saveGoalsAction } from "@/app/actions/websiteBuilder";
import { emptyState } from "@/lib/actions";
import { Button, Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import { ImageDropzone } from "@/components/ImageDropzone";
import { WEBSITE_GOALS } from "@/lib/websiteBuilder";

const BUILD_LINES = [
  "Business information",
  "Services",
  "Photos",
  "Reviews",
  "Website design",
  "Mobile version",
  "SEO basics",
];

function BuildButton({ hasContent }: { hasContent: boolean }) {
  const { pending } = useFormStatus();
  return (
    <div className="space-y-3">
      {pending ? (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
          <p className="font-semibold">🚀 Your website is being created…</p>
          <p className="mt-1 text-indigo-800/80">
            We&apos;re using your business information, online profiles, photos and
            preferences to write the first version.
          </p>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {BUILD_LINES.map((line, index) => (
              <li
                key={line}
                className="animate-pulse"
                style={{ animationDelay: `${index * 300}ms` }}
              >
                ✓ {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="py-3 text-base">
          {pending ? "Building…" : hasContent ? "Rebuild my preview →" : "✨ Build my website →"}
        </Button>
      </div>
    </div>
  );
}

/** Screen 3: optional pictures, then the plain-English "what should it do" list. */
export function GoalsForm({
  id,
  goals,
  wish,
  uploads,
  hasContent,
}: {
  id: string;
  goals: string[];
  wish: string | null;
  uploads: string[];
  hasContent: boolean;
}) {
  const [state, formAction] = useFormState(saveGoalsAction.bind(null, id), emptyState);
  const [pictures, setPictures] = useState(uploads);
  const [picked, setPicked] = useState<string[]>(
    goals.length ? goals : ["call", "whatsapp", "inquiry", "directions"],
  );

  return (
    <form action={formAction} className="space-y-6">
      <FormError>{state.error}</FormError>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">Upload anything you want us to use</h2>
        <p className="text-sm text-slate-600">
          Logo, business card, menu, price list, photos of your work or shop, screenshots of
          an old site — optional. Don&apos;t have anything? No problem, AI creates the first
          version from what you already gave us.
        </p>
        <ImageDropzone
          purpose="website"
          multiple
          fields={{ projectId: id }}
          label="📎 Upload pictures (logo, menu, photos…)"
          hint="JPG or PNG, up to 12. Have a PDF brochure? Screenshot the pages you like and upload them."
          onUploaded={(url) => setPictures((current) => [...current, url])}
        />
        {pictures.length ? (
          <div className="flex flex-wrap gap-2">
            {pictures.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="h-16 w-16 rounded-lg object-cover" />
            ))}
          </div>
        ) : null}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">What would you like customers to be able to do?</h2>
        <p className="text-sm text-slate-600">Tick everything that applies — no tech talk needed.</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {WEBSITE_GOALS.map((goal) => {
            const on = picked.includes(goal.key);
            return (
              <label
                key={goal.key}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                  on ? "border-indigo-500 bg-indigo-50 text-indigo-900" : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  name="goals"
                  value={goal.key}
                  checked={on}
                  onChange={() =>
                    setPicked((current) =>
                      on ? current.filter((key) => key !== goal.key) : [...current, goal.key],
                    )
                  }
                  className="h-4 w-4 accent-indigo-600"
                />
                <span>{goal.emoji}</span>
                <span className="font-medium">{goal.label}</span>
              </label>
            );
          })}
        </div>
        <Field label="Other — anything else the website should do?" className="pt-2">
          <textarea
            name="wish"
            rows={2}
            maxLength={1000}
            defaultValue={wish ?? ""}
            placeholder='e.g. "Customers should be able to book a table" or "I want an AI receptionist"'
            className={inputClass}
          />
        </Field>
      </section>

      <BuildButton hasContent={hasContent} />
    </form>
  );
}
