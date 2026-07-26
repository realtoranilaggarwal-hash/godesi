import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { effectivePlan } from "@/lib/plans";
import { getCategoryTree } from "@/lib/directory";
import { gradientFor } from "@/lib/categories";
import { Badge } from "@/components/ui";

const NAV = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/search", label: "Businesses", icon: "🏪" },
  { href: "/leads", label: "Leads", icon: "📋" },
  { href: "/events", label: "Events", icon: "🎟️" },
  { href: "/news", label: "News", icon: "📰" },
];

export async function SiteHeader() {
  const [user, categories] = await Promise.all([getCurrentUser(), getCategoryTree()]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 bg-clip-text text-xl font-black tracking-tight text-transparent"
        >
          Godesi
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-700 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900"
            >
              <span aria-hidden className="mr-1">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
          <Link href="/pricing" className="rounded-lg px-2.5 py-1.5 hover:bg-slate-100">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-2 text-sm font-medium">
          {user ? (
            <>
              <Link
                href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="rounded-lg px-2 py-1 hover:text-slate-900"
              >
                {user.role === "ADMIN" ? "Admin" : "Dashboard"}
              </Link>
              <Badge tone={effectivePlan(user) === "FREE" ? "slate" : "indigo"}>
                {effectivePlan(user)}
              </Badge>
              <form action={logoutAction}>
                <button type="submit" className="rounded-lg px-2 py-1 hover:text-slate-900">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-2 py-1 hover:text-slate-900">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-1.5 font-semibold text-white hover:opacity-90"
              >
                List free
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Colourful category strip — the primary way around the directory. */}
      <div className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2 text-xs font-semibold">
          <div className="flex gap-2 md:hidden">
            {NAV.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full bg-slate-900 px-3 py-1.5 text-white"
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </div>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className={`whitespace-nowrap rounded-full bg-gradient-to-r ${gradientFor(category.color)} px-3 py-1.5 text-white opacity-90 hover:opacity-100`}
            >
              {category.icon} {category.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
