import Link from "next/link";
import { joinGoal } from "@/lib/joinGoals";
import { Card, LinkButton } from "@/components/ui";

/** Dashboard card: one next step per goal the member ticked. */
export function JoinGoalSteps({ goals }: { goals: string[] }) {
  const picked = goals.flatMap((id) => {
    const goal = joinGoal(id);
    return goal ? [goal] : [];
  });

  if (!picked.length)
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <h2 className="text-lg font-bold text-emerald-900">
          ✅ What would you like to do on GoDesi?
        </h2>
        <p className="mt-1 text-sm text-emerald-900/80">
          Business profile, Rishta profile, finding a service, leads, a
          discounted website, events or becoming a local ambassador — tick what
          you want and we&apos;ll show you the next step.
        </p>
        <div className="mt-3">
          <LinkButton href="/dashboard/goals">Choose</LinkButton>
        </div>
      </Card>
    );

  return (
    <Card className="border-emerald-200">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold">✅ Your next steps</h2>
        <Link
          href="/dashboard/goals"
          className="text-sm font-semibold text-indigo-700 hover:underline"
        >
          Change
        </Link>
      </div>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {picked.map((goal) => (
          <li key={goal.id}>
            <Link
              href={goal.href}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:border-emerald-400 hover:bg-emerald-50"
            >
              <span aria-hidden>{goal.icon}</span>
              <span>
                <span className="block font-semibold text-slate-900">
                  {goal.next} →
                </span>
                <span className="text-xs text-slate-500">{goal.label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
