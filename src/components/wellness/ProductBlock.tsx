import { AMAZON_DISCLOSURE, DEFAULT_DISCLOSURE, categoryLabel, productClickPath, type PublicProduct } from "@/lib/wellness";

/**
 * Recommended products with the FTC disclosure above them. Only products with
 * an approved affiliate link ever reach this component (see liveProductWhere),
 * and every link goes through the click counter, never the raw tracking URL.
 */
export function ProductBlock({
  products,
  title = "Recommended for your wellness routine",
  className = "",
}: {
  products: PublicProduct[];
  title?: string;
  className?: string;
}) {
  if (!products.length) return null;
  const disclosures = Array.from(
    new Set([
      ...(products.some((product) => product.amazon) ? [AMAZON_DISCLOSURE] : []),
      DEFAULT_DISCLOSURE,
      ...products.map((product) => product.disclosureText || DEFAULT_DISCLOSURE),
    ]),
  );
  return (
    <section className={`rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 ${className}`}>
      <h2 className="text-lg font-black text-emerald-900">🛍️ {title}</h2>
      {disclosures.map((text) => (
        <p key={text} className="mt-1 text-xs font-semibold text-slate-600">
          Disclosure: {text}
        </p>
      ))}
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const category = categoryLabel(product.category);
          return (
            <li key={product.id} className="min-w-0">
              <a
                href={productClickPath(product.id)}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                className="flex h-full gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:border-emerald-400"
              >
                {product.imageUrl ? (
                  // Merchant photos come from many hosts, so next/image is not used here.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    loading="lazy"
                    className="h-20 w-20 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-3xl"
                  >
                    {category.emoji}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block break-words font-bold text-slate-900">{product.name}</span>
                  <span className="block text-xs text-slate-500">
                    {product.merchantName} · {category.label}
                  </span>
                  {product.description ? (
                    <span className="mt-1 line-clamp-2 block text-xs text-slate-600">
                      {product.description}
                    </span>
                  ) : null}
                  <span className="mt-1 block text-xs font-bold text-emerald-700">
                    View at {product.merchantName} →
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
