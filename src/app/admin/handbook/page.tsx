import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { Card } from "@/components/ui";
import {
  HANDBOOK_HOUSE_RULES,
  HANDBOOK_ONBOARDING,
  HANDBOOK_PLAYBOOKS,
  HANDBOOK_WHAT_WE_ARE,
} from "@/lib/handbook";

export const metadata: Metadata = { title: "Staff handbook | Godesi admin" };
export const dynamic = "force-dynamic";

export default async function AdminHandbookPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/handbook");
  if (!isStaff(user)) redirect("/dashboard");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Staff handbook</h1>
        <p className="mt-1 text-sm text-slate-600">
          Read your own section before you contact anybody. Everything here is
          the approved wording — if a member asks something that is not written
          here, ask your admin instead of guessing.
        </p>
      </div>

      <Card>
        <h2 className="text-lg font-bold">What Godesi is, in four lines</h2>
        <ul className="mt-2 space-y-2 text-sm text-slate-700">
          {HANDBOOK_WHAT_WE_ARE.map((line) => (
            <li key={line} className="flex gap-2">
              <span aria-hidden className="text-indigo-500">
                •
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Your section</h2>
        <p className="mb-3 mt-1 text-sm text-slate-500">
          Each one has the pitch, the step-by-step, the messages to send, the
          answers to the usual objections, and what to collect before a page can
          go live.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {HANDBOOK_PLAYBOOKS.map((playbook) => (
            <li key={playbook.slug}>
              <Link
                href={`/admin/handbook/${playbook.slug}`}
                className="block h-full rounded-xl border border-slate-200 p-3 hover:border-indigo-300 hover:bg-indigo-50/50"
              >
                <p className="font-bold text-slate-900">
                  <span aria-hidden className="mr-1.5">
                    {playbook.icon}
                  </span>
                  {playbook.title}
                </p>
                <p className="mt-1 text-sm text-slate-600">{playbook.blurb}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Getting your login</h2>
        <ol className="mt-2 space-y-3 text-sm text-slate-700">
          {HANDBOOK_ONBOARDING.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {index + 1}
              </span>
              <span>
                <strong className="text-slate-900">{step.title}</strong>
                <span className="block text-slate-600">{step.detail}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-slate-500">
          Admin: promote her on{" "}
          <Link href="/admin/team" className="font-semibold text-indigo-600">
            /admin/team
          </Link>
          , then send her{" "}
          <Link href="/admin/content" className="font-semibold text-indigo-600">
            /admin/content
          </Link>{" "}
          and this handbook.
        </p>
      </Card>

      <Card className="border-rose-200 bg-rose-50/60">
        <h2 className="text-lg font-bold text-rose-900">
          Rules for everyone, every section
        </h2>
        <ul className="mt-2 space-y-2 text-sm text-rose-900">
          {HANDBOOK_HOUSE_RULES.map((rule) => (
            <li key={rule} className="flex gap-2">
              <span aria-hidden>⚠️</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
