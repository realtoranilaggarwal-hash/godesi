import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { requestCurrency } from "@/lib/currency";
import { getCategoryTree } from "@/lib/directory";
import { RESOURCE_PACKS, formatResourcePrice } from "@/lib/resources";
import { startLinkCheckoutAction } from "@/app/actions/resources";
import { Alert, Card, Field, inputClass } from "@/components/ui";
import { SidebarBanners } from "@/components/Banners";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Advertise a link — text links from $10 per 1,000 views",
  description:
    "Promote your website, offer or affiliate link inside Godesi's Recommended links boxes. Pick a category, buy a views pack and the link retires when the views are delivered.",
  alternates: { canonical: "/resources/new" },
};

const ERRORS: Record<string, string> = {
  cancelled: "Checkout was cancelled — you have not been charged.",
  invalid: "Please check the title and URL and try again.",
  blocked: "That link cannot be promoted on Godesi.",
  stripe_unavailable: "Card payments are not configured yet. Please email us.",
  stripe_session: "We could not start the checkout. Please try again.",
};

export default async function AdvertiseLinkPage({
  searchParams,
}: {
  searchParams: { error?: string; category?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/resources/new");

  const [categories, currency] = [await getCategoryTree(), requestCurrency()];

  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-2xl flex-1 space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Advertise your link</h1>
          <p className="mt-1 text-sm text-slate-600">
            Your link appears in the “Recommended links” box on the category and
            listing pages you pick. You pay per 1,000 views and the link retires
            automatically once those views are delivered.
          </p>
        </div>

        {user.role === "ADMIN" ? (
          <Alert tone="success">
            Admin: publish links straight away, with no payment, from{" "}
            <Link href="/admin#resources" className="font-semibold underline">
              Admin → Resources
            </Link>
            .
          </Alert>
        ) : null}

        {searchParams.error ? (
          <Alert>{ERRORS[searchParams.error] ?? "Something went wrong."}</Alert>
        ) : null}

        <Card>
          <form action={startLinkCheckoutAction} className="space-y-4">
            <Field
              label="Link title"
              hint="What visitors will read, e.g. “Cheap flights to India”"
            >
              <input
                name="title"
                required
                maxLength={90}
                className={inputClass}
              />
            </Field>

            <Field label="Destination URL">
              <input
                name="url"
                type="url"
                required
                placeholder="https://"
                className={inputClass}
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Show on category"
                hint="Leave blank to show across the site"
              >
                <select
                  name="categorySlug"
                  defaultValue={searchParams.category ?? ""}
                  className={inputClass}
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label="Tags"
                hint="Comma separated, e.g. travel, visa — people browse by tag"
              >
                <input
                  name="tags"
                  maxLength={200}
                  placeholder="travel, visa"
                  className={inputClass}
                />
              </Field>
              <Field
                label="One-line description"
                hint="Shown next to your link — max 140 characters"
              >
                <input name="description" maxLength={140} className={inputClass} />
              </Field>
              <Field label="Link type">
                <select
                  name="kind"
                  defaultValue="SPONSORED"
                  className={inputClass}
                >
                  <option value="SPONSORED">Sponsored</option>
                  <option value="AFFILIATE">Affiliate</option>
                </select>
              </Field>
              <Field label="Views pack">
                <select
                  name="impressions"
                  defaultValue={RESOURCE_PACKS[0]}
                  className={inputClass}
                >
                  {RESOURCE_PACKS.map((pack) => (
                    <option key={pack} value={pack}>
                      {pack.toLocaleString()} views —{" "}
                      {formatResourcePrice(currency, pack)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Continue to payment
            </button>
            <p className="text-xs text-slate-500">
              Links are reviewed before they appear. Adult, misleading or
              malware links are rejected and refunded. Every paid link is
              labelled sponsored or affiliate.
            </p>
          </form>
        </Card>
      </div>

      <SidebarBanners />
    </div>
  );
}
