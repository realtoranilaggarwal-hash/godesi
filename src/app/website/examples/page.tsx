import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Card } from "@/components/ui";
import { SidebarBanners } from "@/components/Banners";
import { DesignPoll } from "@/components/website/DesignPoll";
import { RedesignCallLine, RedesignInquiryForm } from "@/components/website/RedesignInquiryForm";
import {
  loadDesignTallies,
  loadShowcaseProjects,
  showcaseEmbedPath,
  type ShowcaseProject,
} from "@/lib/designShowcase";
import { emptyTally } from "@/lib/designVotes";
import { projectSources } from "@/lib/websiteProjects";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Website redesigns — before & after examples",
  description:
    "Real GoDesi website redesigns: see each business's old site next to the new design and vote which one you like better.",
  alternates: { canonical: "/website/examples" },
};

function externalUrl(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function sides(project: ShowcaseProject) {
  const oldUrl = externalUrl(projectSources(project).website);
  const embed = showcaseEmbedPath(project.id);
  if (project.status === "LIVE") {
    const live = externalUrl(project.liveUrl) ?? externalUrl(project.domain);
    return {
      oldUrl,
      oldLabel: "Before — their old site",
      oldNote: "Archived link: it may now open the new site.",
      newFrame: live ?? embed,
      newHref: live ?? embed,
      newLabel: live ? "Live now" : "New design",
      badge: { text: "✅ Live", className: "bg-emerald-100 text-emerald-800" },
    };
  }
  return {
    oldUrl,
    oldLabel: "Old site",
    oldNote: null,
    newFrame: embed,
    newHref: embed,
    newLabel: "New design",
    badge:
      project.status === "CANCELLED"
        ? { text: "Concept — never launched", className: "bg-slate-200 text-slate-700" }
        : { text: "New design", className: "bg-indigo-100 text-indigo-800" },
  };
}

/**
 * Public portfolio of custom designs: each business's old website next to the
 * design we made, with a quick poll. Only the public embed route and the
 * owner's own old/live links appear — never the private preview token,
 * design host or admin links.
 */
export default async function WebsiteExamplesPage() {
  const [projects, tallies] = await Promise.all([loadShowcaseProjects(), loadDesignTallies()]);
  const voted = new Set((cookies().get("godesi_design_votes")?.value ?? "").split(",").filter(Boolean));

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-6 text-white sm:px-8">
          <p className="text-xs font-bold uppercase tracking-wide text-white/80">Before &amp; after</p>
          <h1 className="text-2xl font-black leading-tight sm:text-3xl">Website redesigns we&apos;ve made</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/90">
            Each card shows a business&apos;s old website next to the new design. Tell us which one you like better.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="#redesign"
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50"
            >
              Get a redesign like this →
            </a>
            <Link
              href="/website"
              className="rounded-xl border border-white/60 px-4 py-2 text-sm font-bold text-white hover:bg-white/10"
            >
              See website plans
            </Link>
          </div>
        </section>

        {projects.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {projects.map((project) => {
              const view = sides(project);
              return (
                <Card key={project.id}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="break-words font-black text-slate-900">{project.businessName}</h2>
                      <p className="text-xs text-slate-500">
                        {[project.category, project.city].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${view.badge.className}`}
                    >
                      {view.badge.text}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">↩️ {view.oldLabel}</p>
                      {view.oldUrl ? (
                        <>
                          <p className="mt-2 text-sm text-slate-600">
                            Open the website they had before we redesigned it.
                          </p>
                          <a
                            href={view.oldUrl}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="mt-auto inline-block pt-3 text-sm font-bold text-indigo-700 underline"
                          >
                            Open their old site ↗
                          </a>
                          {view.oldNote ? <p className="mt-1 text-[11px] text-slate-500">{view.oldNote}</p> : null}
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-slate-600">
                          No website before — this design is their first.
                        </p>
                      )}
                    </div>

                    <div className="min-w-0 overflow-hidden rounded-2xl border border-indigo-200 bg-white">
                      <p className="px-3 pt-2 text-xs font-bold uppercase tracking-wide text-indigo-600">
                        ✨ {view.newLabel}
                      </p>
                      <iframe
                        src={view.newFrame}
                        title={`${project.businessName} — new website design`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        sandbox="allow-scripts allow-same-origin allow-popups"
                        className="mt-2 h-72 w-full border-0"
                      />
                      <a
                        href={view.newHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border-t border-slate-100 px-3 py-2 text-sm font-bold text-indigo-700 underline"
                      >
                        Open full screen ↗
                      </a>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <DesignPoll
                      projectId={project.id}
                      initialTally={tallies[project.id] ?? emptyTally()}
                      alreadyVoted={voted.has(project.id)}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <p className="text-sm text-slate-600">New before &amp; after examples are coming soon.</p>
          </Card>
        )}

        <Card>
          <div id="redesign" className="scroll-mt-24" />
          <h2 className="text-lg font-black text-slate-900">🎨 Want a redesign like this?</h2>
          <RedesignCallLine className="mt-1" />
          <p className="mt-1 text-xs text-slate-500">
            Or leave your details and your current website — we&apos;ll get back to you.
          </p>
          <div className="mt-3">
            <RedesignInquiryForm />
          </div>
        </Card>
      </div>

      <SidebarBanners />
    </div>
  );
}
