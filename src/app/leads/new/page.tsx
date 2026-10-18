import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCategory } from "@/lib/directory";
import { CATEGORY_TREE } from "@/lib/categories";
import { WEDDING_SLUG } from "@/lib/wedding";
import type { ServiceGroup } from "@/components/forms/ServicePicker";
import { LeadForm } from "@/components/forms/LeadForm";
import type { RequirementOptionSet } from "@/components/forms/RequirementOptions";
import { specialtySet } from "@/lib/specialties";
import { Card } from "@/components/ui";
import { displayCurrency } from "@/lib/displayCurrency";
import { PostingSidebar } from "@/components/PostingSidebar";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Post a requirement — get quotes from desi businesses",
  description:
    "Tell desi businesses what you need — pick the services, add your city, budget and date, and get quotes. Your contact stays private until a Featured business unlocks it.",
  alternates: { canonical: "/leads/new" },
};

/** Prefill for the "Compare agents" box on the real estate pages. */
const AGENT_REQUESTS = {
  sell: {
    title: (city?: string) =>
      city ? `Selling my home in ${city}` : "Selling my home",
    description:
      "I'd like to compare local real estate agents to sell my home. Please share your experience, recent sales nearby and how you would market it.",
  },
  buy: {
    title: (city?: string) =>
      city ? `Looking to buy a home in ${city}` : "Looking to buy a home",
    description:
      "I'd like to compare local buyer's agents. Please share your experience in the area and how you would help me find and win the right home.",
  },
};

export default async function NewLeadPage({
  searchParams,
}: {
  searchParams: { category?: string; do?: string; city?: string };
}) {
  if (searchParams.category === WEDDING_SLUG) redirect("/wedding/requirements/new");

  const user = await getCurrentUser();
  if (!user) {
    const back = new URLSearchParams(
      Object.entries(searchParams).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    ).toString();
    const next = back ? `/leads/new?${back}` : "/leads/new";
    redirect(`/signup?role=CLIENT&next=${encodeURIComponent(next)}`);
  }

  const city = searchParams.city?.trim().slice(0, 80) || undefined;
  const agentRequest =
    searchParams.category === "real-estate" &&
    (searchParams.do === "sell" || searchParams.do === "buy")
      ? AGENT_REQUESTS[searchParams.do]
      : null;

  const category = searchParams.category
    ? await getCategory(searchParams.category)
    : null;

  const groups: ServiceGroup[] = category
    ? [{ title: category.name, icon: category.icon, items: category.children.map((child) => child.name) }]
    : CATEGORY_TREE.map((entry) => ({
        title: entry.name,
        icon: entry.icon,
        items: entry.children,
      }));

  const optionSources = category
    ? category.children.length
      ? category.children
      : [category]
    : [];
  const optionSets: RequirementOptionSet[] = optionSources.flatMap((entry) => {
    const set = specialtySet(entry.slug);
    return set ? [{ slug: entry.slug, name: entry.name, set }] : [];
  });

  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-2xl flex-1 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Post your requirement</h1>
          <p className="text-sm text-slate-600">
            Businesses see your requirement instantly. Only Featured members can
            view your contact details.
          </p>
        </div>
        <Card>
          <LeadForm
            defaultName={user.name}
            defaultEmail={user.email}
            defaultCategory={category?.name}
            defaultTitle={agentRequest ? agentRequest.title(city) : undefined}
            defaultDescription={agentRequest?.description}
            defaultCity={city}
            defaultServices={agentRequest ? ["Real Estate Agents"] : undefined}
            groups={groups.filter((group) => group.items.length)}
            optionSets={optionSets}
            defaultOptionSlug={category?.slug}
            currency={displayCurrency()}
          />
        </Card>
      </div>

      <PostingSidebar />
    </div>
  );
}
