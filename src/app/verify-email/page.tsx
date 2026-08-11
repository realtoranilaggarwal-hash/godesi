import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { VerifyEmailForm } from "@/components/forms/VerifyEmailForm";
import { Alert, Card } from "@/components/ui";
import { emailEnabled } from "@/lib/email";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Verify your email" };

export default async function VerifyEmailPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/verify-email");
  if (user.emailVerifiedAt) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Verify your email</h1>
      <Card>
        {emailEnabled() ? (
          <VerifyEmailForm email={user.email} />
        ) : (
          <Alert tone="info">
            Email verification is not switched on yet — you can keep using Godesi as
            normal.
          </Alert>
        )}
      </Card>
      <p className="text-center text-sm text-slate-500">
        <Link href="/dashboard" className="font-semibold text-indigo-600 hover:underline">
          Skip for now
        </Link>
      </p>
    </div>
  );
}
