import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { Card } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";
import { playbookBySlug } from "@/lib/handbook";

export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const playbook = playbookBySlug(params.slug);
  return {
    title: playbook
      ? `${playbook.title} — staff handbook | Godesi admin`
      : "Staff handbook | Godesi admin",
  };
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-2 text-sm text-slate-700">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span aria-hidden className="text-indigo-500">
            •
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function HandbookPlaybookPage({
  params,
}: {
  params: { slug: string };
}) {
  await requireStaff();

  const playbook = playbookBySlug(params.slug);
  if (!playbook) notFound();

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/admin/handbook"
          className="text-sm font-semibold text-indigo-600"
        >
          ← Staff handbook
        </Link>
        <h1 className="mt-1 text-2xl font-bold">
          <span aria-hidden className="mr-1.5">
            {playbook.icon}
          </span>
          {playbook.title}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{playbook.goal}</p>
      </div>

      <Card>
        <h2 className="text-lg font-bold">
          Why they should be here and not somewhere else
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Learn these before your first call. Do not add anything to this list.
        </p>
        <Bullets items={playbook.whyUs} />
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Where to find people</h2>
        <ul className="mt-2 flex flex-wrap gap-2 text-sm font-semibold">
          {playbook.wherePeopleAre.map((link) => {
            const external = link.href.startsWith("http");
            const className =
              "rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-200";
            return (
              <li key={link.href}>
                {external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={className}
                  >
                    {link.label} ↗
                  </a>
                ) : (
                  <Link href={link.href} className={className}>
                    {link.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Step by step</h2>
        <ol className="mt-2 space-y-3 text-sm text-slate-700">
          {playbook.steps.map((step, index) => (
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
      </Card>

      <Card>
        <h2 className="text-lg font-bold">What to collect from them</h2>
        <p className="mt-1 text-sm text-slate-500">
          A page is not finished until you have these. Work down the list on the
          call so you do not have to go back twice.
        </p>
        <Bullets items={playbook.collect} />
      </Card>

      <Card>
        <h2 className="text-lg font-bold">What to send them</h2>
        <p className="mb-3 mt-1 text-sm text-slate-500">
          Copy, then replace everything in [brackets]. Always paste their own
          live Godesi link into the message — that is what gets the reply.
        </p>
        <div className="space-y-3">
          {playbook.scripts.map((script) => (
            <div
              key={script.label}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-900">
                  {script.label}
                </p>
                <CopyButton value={script.text} label="Copy message" />
              </div>
              {script.hint ? (
                <p className="mt-1 text-xs text-slate-500">{script.hint}</p>
              ) : null}
              <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-sm text-slate-700">
                {script.text}
              </pre>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">When they push back</h2>
        <dl className="mt-2 space-y-3 text-sm">
          {playbook.objections.map((objection) => (
            <div key={objection.question}>
              <dt className="font-bold text-slate-900">
                “{objection.question}”
              </dt>
              <dd className="text-slate-600">{objection.answer}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="border-rose-200 bg-rose-50/60">
        <h2 className="text-lg font-bold text-rose-900">
          Never, in this section
        </h2>
        <ul className="mt-2 space-y-2 text-sm text-rose-900">
          {playbook.rules.map((rule) => (
            <li key={rule} className="flex gap-2">
              <span aria-hidden>⚠️</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">What a good week looks like</h2>
        <Bullets items={playbook.targets} />
      </Card>
    </div>
  );
}
