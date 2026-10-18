import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui";
import { JoinGoalsForm } from "@/components/forms/JoinGoalsForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "What I want to do on GoDesi" };

export default async function GoalsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/goals");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/dashboard" className="text-sm font-semibold text-indigo-600">
        ← Dashboard
      </Link>
      <h1 className="text-2xl font-bold">
        ✅ What would you like to do on GoDesi?
      </h1>
      <p className="text-sm text-slate-600">
        Tick everything that applies. Your dashboard shows the next step for
        each one.
      </p>
      <Card>
        <JoinGoalsForm selected={user.joinGoals} />
      </Card>
    </div>
  );
}
