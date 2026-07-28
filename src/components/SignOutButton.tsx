import { logoutAction } from "@/app/actions/auth";

/** Signing out has to be reachable from the account pages, not just the header menu. */
export function SignOutButton({ className = "" }: { className?: string }) {
  return (
    <form action={logoutAction} className={className}>
      <button
        type="submit"
        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Sign out
      </button>
    </form>
  );
}
