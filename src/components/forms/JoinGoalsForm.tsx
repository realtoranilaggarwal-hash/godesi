"use client";

import { useFormState } from "react-dom";
import { saveJoinGoalsAction } from "@/app/actions/joinGoals";
import { emptyState } from "@/lib/actions";
import { JoinGoalChips } from "@/components/JoinGoalChips";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";

export function JoinGoalsForm({ selected }: { selected: string[] }) {
  const [state, formAction] = useFormState(saveJoinGoalsAction, emptyState);
  return (
    <form action={formAction} className="space-y-4">
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>
      <JoinGoalChips selected={selected} />
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}
