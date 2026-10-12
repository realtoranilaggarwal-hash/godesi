"use client";

import { useFormState } from "react-dom";
import { saveOfferInterestsAction } from "@/app/actions/offerInterests";
import { emptyState } from "@/lib/actions";
import { OfferChips } from "@/components/OfferChips";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";
import { FormSuccess } from "@/components/forms/FormSuccess";

export function OfferInterestsForm({
  selected,
  phone,
}: {
  selected: string[];
  phone: string;
}) {
  const [state, formAction] = useFormState(
    saveOfferInterestsAction,
    emptyState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.success}</FormSuccess>
      <OfferChips selected={selected} phone={phone} />
      <SubmitButton>Save my picks</SubmitButton>
    </form>
  );
}
