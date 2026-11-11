import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { deskFallback } from "@/lib/adminSections";
import {
  loadPowerUps,
  previewHref,
  projectFound,
  projectLinks,
  projectPages,
  projectQuoted,
  quoteFor,
} from "@/lib/websiteProjects";
import {
  markChangeDoneAction,
  saveDesignLinkAction,
  updateWebsiteProjectAction,
} from "@/app/actions/adminWebsite";
import { siteUrl } from "@/lib/format";
import { ActionForm } from "@/components/gigs/GigForms";
import { Card, Field, inputClass } from "@/components/ui";
import { WEBSITE_GOALS } from "@/lib/websiteBuilder";
import { ShareLookLink } from "@/components/website/ShareLookLink";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Website project" };

const STATUSES = ["DRAFT", "PREVIEW", "APPROVED", "PAID", "LIVE", "CANCELLED"] as const;

export default async function AdminWebsiteProjectPage({
  params,
  searchParams = {},
}: {
  params: { id: string };
  searchParams?: { new?: string; sent?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/admin/website/${params.id}`);
  if (!isStaff(user)) redirect(deskFallback(user, "Websites"));

  const project = await db.websiteProject.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      changeRequests: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!project) notFound();
  const sharedCode = /^Shared with code (\S+)/.exec(project.staffNotes ?? "")?.[1] ?? "";
  const found = projectFound(project);
  const links = projectLinks(project);
  const pages = projectPages(project);
  const custom = project.tier === "CUSTOM";
  const preview = previewHref(project);

  const quote = quoteFor(project, await loadPowerUps());
  const per = quote.term === "YEAR" ? "yr" : "mo";
  const goals = WEBSITE_GOALS.filter((goal) => project.goals.includes(goal.key));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/website" className="text-sm text-slate-500 hover:underline">
          ← Websites
        </Link>
        <h1 className="text-2xl font-bold">{project.businessName}</h1>
        <p className="text-sm text-slate-600">
          {custom ? "🎨 Custom design" : "🤖 AI website"} · {project.category} · {project.city} · {project.status}
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
          {links.length ? (
            <ul className="mt-3 space-y-1 text-sm">
              {links.map(({ label, url }) => (
                <li key={label}>
                  <span className="text-slate-500">{label}: </span>
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
            {project.setupMinor !== null && project.setupMinor !== quote.setupUsd * 100 ? (
              <li className="flex justify-between text-emerald-700"><span>Charged after discount code</span><span>${(project.setupMinor / 100).toFixed(2)}</span></li>
            ) : null}
            {quote.lines.map((line) => (
              <li key={line.label} className="flex justify-between">
                <span>{line.label}{line.kind === "custom" ? " (custom — confirm)" : ""}</span>
                <span>${line.amountUsd}/{per}</span>
              </li>
            ))}
            <li className="flex justify-between border-t border-slate-200 pt-1 font-semibold">
              <span>{quote.term === "YEAR" ? "Yearly" : "Monthly"}</span><span>${quote.recurringUsd}/{per}</span>
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
          {project.changeNotes ? <p className="mt-2 whitespace-pre-wrap text-sm"><span className="text-slate-500">Change notes: </span>{project.changeNotes}</p> : null}
          {preview ? (
            <p className="mt-3 text-sm">
              <a href={preview} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-700 underline">
                Open the customer&apos;s preview ↗
              </a>{" "}
              {custom ? null : (
                <span className="text-slate-500">(design seed {project.designSeed}, {project.uploads.length} uploads)</span>
              )}
            </p>
          ) : null}
        </Card>

        {custom ? (
          <Card>
            <h2 className="font-bold">🎨 Custom design</h2>
            <p className="mt-1 text-xs text-slate-500">
              Paste the link to the design you made. The customer only ever sees the private
              GoDesi link — this address is not in the email or on their page.
            </p>
            <ActionForm action={saveDesignLinkAction} submitLabel="Save link" className="mt-2">
              <input type="hidden" name="id" value={project.id} />
              <Field label="New design link">
                <input
                  name="designUrl"
                  type="url"
                  required
                  defaultValue={project.designUrl ?? ""}
                  placeholder="https://…"
                  className={inputClass}
                />
              </Field>
              <Field label="Discount code to fill in for them (optional)">
                <input name="code" maxLength={40} defaultValue={sharedCode} placeholder="e.g. WEB20" className={`${inputClass} uppercase`} />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="send" value="send" defaultChecked={!project.previewSentAt} className="h-4 w-4" />
                Email the customer their private preview link{project.email ? ` (${project.email})` : ""}
              </label>
            </ActionForm>
            {project.previewToken ? (
              <>
                {searchParams.new ? (
                  <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    ✓ Client preview created{searchParams.sent ? ` and emailed to ${project.email}` : ""}. Copy the link below to send it on WhatsApp.
                  </p>
                ) : null}
                <ShareLookLink
                  base={`${siteUrl()}/website/look/${project.previewToken}`}
                  initialCode={sharedCode}
                />
                {project.previewSentAt ? (
                  <p className="mt-1 text-xs text-slate-500">Emailed {project.previewSentAt.toLocaleString()}</p>
                ) : null}
              </>
            ) : null}
          </Card>
        ) : null}

        {pages.length ? (
          <Card className="lg:col-span-2">
            <h2 className="font-bold">Their pages ({pages.length})</h2>
            <div className="mt-2 grid gap-3 md:grid-cols-2">
              {pages.map((page, index) => (
                <div key={index} className="rounded-xl bg-slate-50 p-3 text-sm">
                  <div className="font-semibold">{page.name}</div>
                  <p className="mt-1 whitespace-pre-wrap text-slate-700">{page.text}</p>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        {project.changeRequests.length ? (
          <Card>
            <h2 className="font-bold">Change requests on the live site</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {project.changeRequests.map((request) => (
                <li key={request.id} className="rounded-xl bg-slate-50 p-2">
                  <span className="text-xs text-slate-500">{request.createdAt.toLocaleDateString()}</span>
                  <p className="whitespace-pre-wrap">{request.text}</p>
                  {request.doneAt ? (
                    <span className="text-xs text-emerald-700">✅ Done {request.doneAt.toLocaleDateString()}</span>
                  ) : (
                    <ActionForm action={markChangeDoneAction} submitLabel="Mark done" variant="secondary">
                      <input type="hidden" name="id" value={request.id} />
                    </ActionForm>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

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
