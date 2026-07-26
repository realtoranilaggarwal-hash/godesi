import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { effectivePlan } from "@/lib/plans";
import { Badge } from "@/components/ui";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-black tracking-tight text-indigo-600">
          Godesi
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium text-slate-600 sm:gap-3">
          <Link href="/search" className="rounded-lg px-2 py-1 hover:text-slate-900">
            Discover
          </Link>
          <Link href="/leads" className="rounded-lg px-2 py-1 hover:text-slate-900">
            Leads
          </Link>
          <Link href="/pricing" className="hidden rounded-lg px-2 py-1 hover:text-slate-900 sm:block">
            Pricing
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
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
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-lg px-2 py-1 hover:text-slate-900">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-indigo-600 px-3 py-1.5 font-semibold text-white hover:bg-indigo-700"
              >
                Get started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
