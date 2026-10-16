import { JOIN_GOALS } from "@/lib/joinGoals";

export function JoinGoalChips({ selected = [] }: { selected?: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {JOIN_GOALS.map((goal) => (
        <label key={goal.id} className="cursor-pointer">
          <input
            type="checkbox"
            name="goals"
            value={goal.id}
            defaultChecked={selected.includes(goal.id)}
            className="peer sr-only"
          />
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-emerald-300 peer-checked:border-emerald-600 peer-checked:bg-emerald-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-400">
            <span aria-hidden>{goal.icon}</span>
            {goal.label}
          </span>
        </label>
      ))}
    </div>
  );
}
