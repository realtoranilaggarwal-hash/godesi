import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  RequestResetForm,
  ResetPasswordForm,
} from "@/components/forms/ForgotPasswordForm";
import { Alert, Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Forgot your password? — Godesi",
  description: "Get a code by email and set a new Godesi password.",
  robots: { index: false },
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { email?: string; sent?: string };
}) {
  if (await getCurrentUser()) redirect("/dashboard");

  const email = searchParams.email?.trim().toLowerCase() ?? "";
  const sent = searchParams.sent === "1" && email.length > 0;

  return (
    <div className="mx-auto max-w-md space-y-4 py-6">
      <h1 className="text-2xl font-bold">
        {sent ? "Check your email" : "Forgot your password?"}
      </h1>
      <Card>
        {sent ? (
          <div className="space-y-4">
            <Alert tone="success">
              If <span className="font-semibold">{email}</span> has a Godesi
              account, a 6-digit code is on its way (check spam too). Enter it
              below with your new password.
            </Alert>
            <ResetPasswordForm email={email} />
            <p className="text-center text-sm text-slate-500">
              No email after a minute?{" "}
              <Link
                href={`/forgot-password?email=${encodeURIComponent(email)}`}
                className="font-semibold text-indigo-600 hover:underline"
              >
                Send again
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Enter the email you joined with and we will send a 6-digit code.
              Use it to set a new password — you are signed in straight after.
            </p>
            <RequestResetForm email={email} />
          </div>
        )}
      </Card>
      <Card>
        <h2 className="text-sm font-bold">Not sure how you joined?</h2>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          <li>
            • Joined with <span className="font-semibold">Google</span> or{" "}
            <span className="font-semibold">Facebook</span>? Just use that
            button on the{" "}
            <Link href="/login" className="font-semibold text-indigo-600">
              sign-in page
            </Link>{" "}
            — no password needed. The code above also works: it adds a password
            to that same account.
          </li>
          <li>
            • Search your inbox for &ldquo;Godesi&rdquo; — the welcome or
            verification email shows which address you used.
          </li>
          <li>
            • Still stuck?{" "}
            <Link href="/contact" className="font-semibold text-indigo-600">
              Contact us
            </Link>{" "}
            and we will find your account.
          </li>
        </ul>
      </Card>
      <p className="text-center text-sm text-slate-600">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-indigo-600">
          Sign in
        </Link>
      </p>
    </div>
  );
}
