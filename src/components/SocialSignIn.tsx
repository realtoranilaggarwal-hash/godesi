import Link from "next/link";
import { googleAuthEnabled } from "@/lib/googleAuth";
import { facebookAuthEnabled } from "@/lib/facebookAuth";

function withNext(path: string, next?: string) {
  return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}

const buttonClass =
  "flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50";

/** Google and Facebook sign-in; each button appears once its keys are set. */
export function SocialSignIn({
  next,
  verb = "Continue",
}: {
  next?: string;
  verb?: string;
}) {
  const google = googleAuthEnabled();
  const facebook = facebookAuthEnabled();
  if (!google && !facebook) return null;

  return (
    <div className="space-y-3">
      {google ? (
        <Link href={withNext("/api/auth/google", next)} className={buttonClass}>
          <svg viewBox="0 0 18 18" aria-hidden className="h-4 w-4">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H1.96v2.33A8.99 8.99 0 0 0 9 18Z"
            />
            <path
              fill="#FBBC05"
              d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H1.96a9 9 0 0 0 0 8.1l2.01-2.33Z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A8.99 8.99 0 0 0 1.96 4.95l2.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
            />
          </svg>
          {verb} with Google
        </Link>
      ) : null}

      {facebook ? (
        <Link
          href={withNext("/api/auth/facebook", next)}
          className={buttonClass}
        >
          <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
            <path
              fill="#1877F2"
              d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.89v2.27h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z"
            />
          </svg>
          {verb} with Facebook
        </Link>
      ) : null}

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or
        <span className="h-px flex-1 bg-slate-200" />
      </div>
    </div>
  );
}
