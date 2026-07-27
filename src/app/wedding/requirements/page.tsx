import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canUnlockLeads } from "@/lib/plans";
import { formatInr, whatsappLink } from "@/lib/format";
import { unlockLeadAction } from "@/app/actions/leads";
import { PostedBy } from "@/components/PostedBy";
import { RecommendedLinks } from "@/components/RecommendedLinks";
import { InlineBanner, SidebarBanners } from "@/components/Banners";
import {
  Alert,
  Badge,
  Card,
  EmptyState,
  LinkButton,
  inputClass,
} from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Wedding requirements from couples",
  description:
    "Live wedding requirements posted by brides, grooms and families — budget, city and date. Premium vendors unlock the contact and reply on WhatsApp.",
};

function budgetLabel(min: number | null, max: number | null) {
  if (min === null && max === null) return "Budget open";
  if (min !== null && max !== null) return `${formatInr(min)} – ${formatInr(max)}`;
  return formatInr((min ?? max) as number);
}

export default async function WeddingRequirementsPage({
  searchParams,
}: {
  searchParams: { city?: string; q?: string };
}) {
  const user = await getCurrentUser();
  const premium = user ? canUnlockLeads(user) : false;

  const requirements = await db.lead.findMany({
    where: {
      status: "OPEN",
      category: { contains: "wedding", mode: "insensitive" },
      ...(searchParams.city
        ? { city: { contains: searchParams.city, mode: "insensitive" } }
        : {}),
      ...(searchParams.q
        ? {
            OR: [
              { title: { contains: searchParams.q, mode: "insensitive" } },
              { description: { contains: searchParams.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: {
      unlocks: { where: { userId: user?.id ?? "" } },
      client: { select: { name: true, username: true, avatarUrl: true } },
    },
  });

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Wedding requirements 💍</h1>
            <p className="text-sm text-slate-600">
              What couples are looking for right now. Premium vendors unlock the
              contact and reply on WhatsApp.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/wedding/requirements/new">
              Post your wedding requirement
            </LinkButton>
            <Link
              href="/dashboard/profile?category=events-wedding"
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
            >
              Add your wedding business
            </Link>
          </div>
        </div>

        {user && !premium ? (
          <Alert tone="info">
            Contact details are hidden on your plan.{" "}
            <Link href="/pricing" className="font-semibold underline">
              Upgrade to Premium
            </Link>{" "}
            to unlock couples&apos; numbers and message them on WhatsApp.
          </Alert>
        ) : null}

        <Card>
          <form className="grid gap-3 sm:grid-cols-4">
            <input
              name="q"
              defaultValue={searchParams.q ?? ""}
              placeholder="Search requirements"
              aria-label="Search wedding requirements"
              className={`${inputClass} sm:col-span-2`}
            />
            <input
              name="city"
              defaultValue={searchParams.city ?? ""}
              placeholder="City"
              aria-label="City"
              className={inputClass}
            />
            <button
              type="submit"
              className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Filter
            </button>
          </form>
        </Card>

        {requirements.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {requirements.map((lead) => {
              const unlocked = premium && lead.unlocks.length > 0;
              return (
                <Card key={lead.id} className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="font-semibold hover:text-rose-600"
                    >
                      {lead.title}
                    </Link>
                    <Badge tone="slate">{lead.category}</Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    📍 {lead.city} · {budgetLabel(lead.budgetMin, lead.budgetMax)}
                    {lead.eventDate
                      ? ` · 📅 ${lead.eventDate.toLocaleDateString()}`
                      : ""}
                  </p>
                  <p className="line-clamp-3 text-sm text-slate-700">
                    {lead.description}
                  </p>
                  <PostedBy user={lead.client} />

                  {unlocked ? (
                    <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
                      <p className="font-medium">{lead.contactName}</p>
                      <p>{lead.contactPhone}</p>
                      {lead.contactEmail ? <p>{lead.contactEmail}</p> : null}
                      <a
                        href={whatsappLink(
                          lead.contactPhone,
                          `Hi ${lead.contactName}, I saw your wedding requirement on Godesi — "${lead.title}".`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1eb457]"
                      >
                        Chat on WhatsApp
                      </a>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                      <p className="select-none blur-sm">+1 9XX XXX XXXX</p>
                      <p className="mt-1 text-xs">
                        Contact locked — Premium vendors only
                      </p>
                    </div>
                  )}

                  <div className="mt-auto pt-2">
                    {unlocked ? (
                      <Link
                        href={`/leads/${lead.id}`}
                        className="text-sm font-semibold text-rose-600"
                      >
                        View full requirement →
                      </Link>
                    ) : user ? (
                      <form action={unlockLeadAction}>
                        <input type="hidden" name="leadId" value={lead.id} />
                        <button
                          type="submit"
                          className="w-full rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
                        >
                          {premium ? "Unlock contact" : "Unlock with Premium"}
                        </button>
                      </form>
                    ) : (
                      <LinkButton
                        href="/login?next=/wedding/requirements"
                        className="w-full"
                      >
                        Sign in to unlock
                      </LinkButton>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No wedding requirements yet"
            body="Be the first — post what you need and vendors will come to you."
          />
        )}

        <RecommendedLinks
          categorySlug="events-wedding"
          title="Recommended wedding links"
        />

        <InlineBanner />
      </div>

      <SidebarBanners />
    </div>
  );
}
