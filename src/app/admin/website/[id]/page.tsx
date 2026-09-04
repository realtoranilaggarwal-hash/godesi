import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { deskFallback } from "@/lib/adminSections";
import {
  loadPowerUps,
  projectFound,
  projectQuoted,
  projectSources,
  quoteFor,
} from "@/lib/websiteProjects";
import { updateWebsiteProjectAction } from "@/app/actions/adminWebsite";
import { ActionForm } from "@/components/gigs/GigForms";
import { Card, Field, inputClass } from "@/components/ui";
import { WEBSITE_GOALS, websitePath } from "@/lib/websiteBuilder";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Website project" };

const STATUSES = ["DRAFT", "PREVIEW", "APPROVED", "PAID", "LIVE", "CANCELLED"] as const;

export default async function AdminWebsiteProjectPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/admin/website/${params.id}`);
  if (!isStaff(user)) redirect(deskFallback(user, "Websites"));

  const project = await db.websiteProject.findUnique({
    where: { id: params.id },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });
  if (!project) notFound();
  const found = projectFound(project);
  const sources = projectSources(project);
  const quote = quoteFor(project, await loadPowerUps());
  const goals = WEBSITE_GOALS.filter((goal) => project.goals.includes(goal.key));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/website" className="text-sm text-slate-500 hover:underline">
          ← Websites
        </Link>
        <h1 className="text-2xl font-bold">{project.businessName}</h1>
        <p className="text-sm text-slate-600">
          {project.category} · {project.city} · {project.status}
          {project.paidAt ? ` · paid ${project.paidAt.toLocaleDateString()}` : ""}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-bold">Contact</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <div><dt className="inline text-slate-500">Phone: </dt><dd className="inline">{project.phone ?? "—"}</dd></div>
            <div><dt className="inline text-slate-500">WhatsApp: </dt><dd className="inline">{project.whatsapp ?? "—"}</dd></div>
            <div><dt className="inline text-slate-500">Email: </dt><dd className="inline">{project.email ?? project.user?.email ?? "—"}</dd></div>
            <div><dt className="inline text-slate-500">Address: </dt><dd className="inline">{project.address ?? "—"}</dd></div>
            <div><dt className="inline text-slate-500">Own domain: </dt><dd className="inline">{project.domain ?? "— (register one)"}</dd></div>
            <div><dt className="inline text-slate-500">Member: </dt><dd className="inline">{project.user ? `${project.user.name ?? ""} ${project.user.email}` : "not signed in"}</dd></div>
          </dl>
          {Object.keys(sources).length ? (
            <ul className="mt-3 space-y-1 text-sm">
              {Object.entries(sources).map(([key, url]) => (
                <li key={key}>
                  <span className="text-slate-500">{key}: </span>
                  <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-indigo-700 underline">
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {found?.from.length ? (
            <p className="mt-2 text-xs text-slate-500">Read from: {found.from.join(", ")}</p>
          ) : null}
        </Card>

        <Card>
          <h2 className="font-bold">Order</h2>
          <ul className="mt-2 space-y-1 text-sm">
            <li className="flex justify-between"><span>Setup</span><span className="font-semibold">${quote.setupUsd}</span></li>
            {quote.lines.map((line) => (
              <li key={line.label} className="flex justify-between">
                <span>{line.label}{line.kind === "custom" ? " (custom — confirm)" : ""}</span>
                <span>${line.monthlyUsd}/mo</span>
              </li>
            ))}
            <li className="flex justify-between border-t border-slate-200 pt-1 font-semibold">
              <span>Monthly</span><span>${quote.monthlyUsd}/mo</span>
            </li>
          </ul>
          {projectQuoted(project).length ? (
            <div className="mt-3 rounded-xl bg-amber-50 p-2 text-xs text-amber-900">
              <strong>Extras they asked for:</strong>
              <ul className="mt-1 list-disc pl-4">
                {projectQuoted(project).map((item, index) => (
                  <li key={index}>{item.label} — ${item.monthlyUsd}/mo · {item.note}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="mt-2 text-xs text-slate-500">
            Stripe session {project.stripeSessionId ?? "—"} · subscription {project.stripeSubscriptionId ?? "—"}
          </p>
        </Card>

        <Card>
          <h2 className="font-bold">What they asked for</h2>
          <p className="mt-1 text-sm">{goals.map((goal) => `${goal.emoji} ${goal.label}`).join(" · ") || "—"}</p>
          {project.wish ? <p className="mt-2 text-sm"><span className="text-slate-500">Anything else: </span>{project.wish}</p> : null}
          {project.changeNotes ? <p className="mt-2 text-sm"><span className="text-slate-500">Change notes: </span>{project.changeNotes}</p> : null}
          <p className="mt-3 text-sm">
            <a href={websitePath(project.id, "/site")} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-700 underline">
              Open the approved preview ↗
            </a>{" "}
            <span className="text-slate-500">(design seed {project.designSeed}, {project.uploads.length} uploads)</span>
          </p>
        </Card>

        <Card>
          <h2 className="font-bold">Update</h2>
          <ActionForm action={updateWebsiteProjectAction} submitLabel="Save">
            <input type="hidden" name="id" value={project.id} />
            <Field label="Status">
              <select name="status" defaultValue={project.status} className={inputClass}>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </Field>
            <Field label="Live address" hint="Set this and status LIVE once the site is up — the customer sees it on their done page.">
              <input name="liveUrl" type="url" defaultValue={project.liveUrl ?? ""} placeholder="https://" className={inputClass} />
            </Field>
            <Field label="Staff notes">
              <textarea name="staffNotes" rows={3} defaultValue={project.staffNotes ?? ""} className={inputClass} />
            </Field>
          </ActionForm>
        </Card>
      </div>
    </div>
  );
}
