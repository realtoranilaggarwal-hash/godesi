import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  deleteWellnessEbookAction,
  deleteWellnessProductAction,
  saveWellnessEbookAction,
  saveWellnessProductAction,
} from "@/app/actions/wellness";
import { Card, Field, inputClass } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { deskFallback } from "@/lib/adminSections";
import { db } from "@/lib/db";
import { DEFAULT_DISCLOSURE, WELLNESS_CATEGORIES, WELLNESS_PATH, categoryLabel } from "@/lib/wellness";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wellness admin" };

type Product = Awaited<ReturnType<typeof loadProducts>>[number];
type Ebook = Awaited<ReturnType<typeof loadEbooks>>[number];

const loadProducts = () =>
  db.wellnessProduct.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
const loadEbooks = () =>
  db.wellnessEbook.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { downloads: true } } },
  });

const button = "rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white";

function ProductFields({ product }: { product?: Product }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <Field label="Product name">
        <input name="name" required maxLength={120} defaultValue={product?.name} className={inputClass} />
      </Field>
      <Field label="Merchant">
        <input name="merchantName" required maxLength={80} defaultValue={product?.merchantName} className={inputClass} />
      </Field>
      <Field label="Category" hint="Articles show products by category">
        <select name="category" defaultValue={product?.category ?? WELLNESS_CATEGORIES[0].slug} className={inputClass}>
          {WELLNESS_CATEGORIES.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.emoji} {category.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Photo URL" hint="https://… or /path in public/">
        <input name="imageUrl" defaultValue={product?.imageUrl ?? ""} className={inputClass} />
      </Field>
      <Field label="Regular product URL" hint="Reference only — never shown publicly">
        <input name="regularUrl" defaultValue={product?.regularUrl ?? ""} className={inputClass} />
      </Field>
      <Field
        label="Approved affiliate URL"
        hint="Blank keeps the product hidden. Plain amazon.com links get the GoDesi Associates tag added."
      >
        <input name="affiliateUrl" defaultValue={product?.affiliateUrl ?? ""} className={inputClass} />
      </Field>
      <Field label="Show first on articles" hint="Article slugs, comma-separated. Blank = match by category.">
        <input name="articleSlugs" defaultValue={product?.articleSlugs.join(", ") ?? ""} className={inputClass} />
      </Field>
      <Field label="Short description">
        <input name="description" maxLength={400} defaultValue={product?.description ?? ""} className={inputClass} />
      </Field>
      <Field label="Disclosure text">
        <input name="disclosureText" maxLength={300} defaultValue={product?.disclosureText ?? DEFAULT_DISCLOSURE} className={inputClass} />
      </Field>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="active" defaultChecked={product?.active ?? true} /> Active (unticked = hidden)
      </label>
    </div>
  );
}

function EbookFields({ ebook }: { ebook?: Ebook }) {
  return (
    <div className="grid gap-3">
      {ebook ? <input type="hidden" name="id" value={ebook.id} /> : null}
      <Field label="Title">
        <input name="title" required maxLength={140} defaultValue={ebook?.title} className={inputClass} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Cover image URL" hint="https://… or /path in public/">
          <input name="coverUrl" defaultValue={ebook?.coverUrl ?? ""} className={inputClass} />
        </Field>
        <Field label="PDF" hint="File name in private/ebooks/ (members only) or a full https:// link">
          <input name="pdfUrl" required defaultValue={ebook?.pdfUrl ?? ""} className={inputClass} />
        </Field>
      </div>
      <Field label="Preview — intro and contents" hint='Blank lines split paragraphs, "## " headings, "- " bullets'>
        <textarea name="description" required rows={8} defaultValue={ebook?.description} className={inputClass} />
      </Field>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="active" defaultChecked={ebook?.active ?? true} /> Active
      </label>
    </div>
  );
}

export default async function WellnessAdminPage({
  searchParams,
}: {
  searchParams: { msg?: string; err?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/wellness");
  if (user.role !== "ADMIN") redirect(deskFallback(user, "Wellness"));

  const [products, ebooks, articles] = await Promise.all([
    loadProducts(),
    loadEbooks(),
    db.wellnessArticle.findMany({
      orderBy: { sortOrder: "asc" },
      select: { slug: true, title: true, views: true, active: true },
    }),
  ]);
  const live = products.filter((product) => product.active && product.affiliateUrl).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">🌿 Natural Healing &amp; Wellness</h1>
        <Link href={WELLNESS_PATH} className="text-sm font-semibold text-indigo-600">View section →</Link>
      </div>
      {searchParams.msg ? <p className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{searchParams.msg}</p> : null}
      {searchParams.err ? <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{searchParams.err}</p> : null}

      <Card>
        <h2 className="text-lg font-bold">Products ({products.length}, {live} live)</h2>
        <p className="mb-3 text-sm text-slate-500">
          A product shows on the site only when it is active <b>and</b> has an approved affiliate URL. Visitors
          always go through the GoDesi click counter, never the raw link.
        </p>
        <details className="rounded-xl border border-slate-200 p-3">
          <summary className="cursor-pointer font-semibold">➕ Add a product</summary>
          <form action={saveWellnessProductAction} className="mt-3 space-y-3">
            <ProductFields />
            <button className={button}>Add product</button>
          </form>
        </details>
        <ul className="mt-3 space-y-2">
          {products.map((product) => {
            const status = !product.active ? "Hidden" : product.affiliateUrl ? "Live" : "Waiting for affiliate URL";
            return (
              <li key={product.id} className="rounded-xl border border-slate-200 p-3">
                <details>
                  <summary className="cursor-pointer break-words">
                    <b>{product.name}</b>{" "}
                    <span className="text-xs text-slate-500">
                      {product.merchantName} · {categoryLabel(product.category).label} · {status} · {product.clicks} clicks
                    </span>
                  </summary>
                  <form action={saveWellnessProductAction} className="mt-3 space-y-3">
                    <ProductFields product={product} />
                    <button className={button}>Save</button>
                  </form>
                  <form action={deleteWellnessProductAction} className="mt-2">
                    <input type="hidden" name="id" value={product.id} />
                    <button className="text-xs font-semibold text-red-600">Delete product</button>
                  </form>
                </details>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-bold">eBooks</h2>
        <ul className="space-y-2">
          {ebooks.map((ebook) => (
            <li key={ebook.id} className="rounded-xl border border-slate-200 p-3">
              <details>
                <summary className="cursor-pointer break-words">
                  <b>{ebook.title}</b>{" "}
                  <span className="text-xs text-slate-500">
                    {ebook.active ? "Active" : "Hidden"} · {ebook._count.downloads} member downloads
                  </span>
                </summary>
                <form action={saveWellnessEbookAction} className="mt-3 space-y-3">
                  <EbookFields ebook={ebook} />
                  <button className={button}>Save</button>
                </form>
                <form action={deleteWellnessEbookAction} className="mt-2">
                  <input type="hidden" name="id" value={ebook.id} />
                  <button className="text-xs font-semibold text-red-600">Delete eBook</button>
                </form>
              </details>
            </li>
          ))}
        </ul>
        <details className="mt-3 rounded-xl border border-slate-200 p-3">
          <summary className="cursor-pointer font-semibold">➕ Add an eBook</summary>
          <form action={saveWellnessEbookAction} className="mt-3 space-y-3">
            <EbookFields />
            <button className={button}>Add eBook</button>
          </form>
        </details>
      </Card>

      <Card>
        <h2 className="mb-2 text-lg font-bold">Articles ({articles.length})</h2>
        <p className="mb-2 text-sm text-slate-500">Seeded by scripts/seed-natural-healing.ts.</p>
        <ul className="divide-y divide-slate-100 text-sm">
          {articles.map((article) => (
            <li key={article.slug} className="flex justify-between gap-2 py-1.5">
              <Link href={`${WELLNESS_PATH}/${article.slug}`} className="min-w-0 break-words text-indigo-600">
                {article.title}
              </Link>
              <span className="shrink-0 text-slate-500">
                {article.views} views{article.active ? "" : " · hidden"}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
