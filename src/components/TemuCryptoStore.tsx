/** Temu affiliate picks for crypto fans on /crypto-fear-greed. */
const PRODUCTS = [
  { emoji: "📘", name: "Cryptocurrency for Beginners (book)", href: "https://temu.to/k/phmdkg6uazk" },
  { emoji: "📗", name: "Crypto Investing for Beginners (book)", href: "https://temu.to/k/pzyl8sid9s1" },
  { emoji: "📈", name: "The Chart Illusion — technical analysis (book)", href: "https://temu.to/k/p2h95idfhy3" },
  { emoji: "🧢", name: "Bitcoin hat", href: "https://temu.to/k/ptu1rakalff" },
  { emoji: "👕", name: "Men's black XRP T-shirt", href: "https://temu.to/k/pcgs8lsdg50" },
  { emoji: "💰", name: "Money bag LED neon sign", href: "https://temu.to/k/p1me6wejrub" },
];

export function TemuCryptoStore() {
  return (
    <section className="space-y-3 rounded-2xl border border-orange-300 bg-orange-50 p-4">
      <p className="flex items-center justify-between gap-2">
        <span className="font-bold text-orange-900">🛍️ Crypto store — books, hats &amp; gifts</span>
        <span className="text-[10px] uppercase tracking-wide text-slate-500">Ad · paid links</span>
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {PRODUCTS.map((product) => (
          <a
            key={product.href}
            href={product.href}
            target="_blank"
            rel="noopener noreferrer sponsored nofollow"
            className="flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-sm font-semibold text-orange-800 transition hover:bg-orange-100"
          >
            <span aria-hidden className="text-xl">{product.emoji}</span>
            <span className="flex-1">{product.name}</span>
            <span aria-hidden>→</span>
          </a>
        ))}
      </div>
      <p className="text-[11px] text-slate-500">
        Sold and shipped by Temu; prices change. GoDesi may earn a commission at no cost to you.
      </p>
    </section>
  );
}
