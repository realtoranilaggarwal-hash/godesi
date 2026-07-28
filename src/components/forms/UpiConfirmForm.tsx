"use client";

import { useFormState } from "react-dom";
import { confirmUpiPaymentAction } from "@/app/actions/upi";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";

export function UpiConfirmForm({
  reference,
  utr,
}: {
  reference: string;
  utr: string | null;
}) {
  const [state, formAction] = useFormState(confirmUpiPaymentAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      <FormError>{state.error}</FormError>
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}
      <input type="hidden" name="reference" value={reference} />
      <Field
        label="UPI transaction / UTR number"
        hint="In PhonePe, Google Pay or your bank app, open the payment and copy the transaction ID"
      >
        <input
          name="utr"
          required
          defaultValue={utr ?? ""}
          placeholder="e.g. 412345678901"
          className={inputClass}
        />
      </Field>
      <SubmitButton pendingLabel="Sending…">
        {utr ? "Update my payment details" : "I have paid — tell the team"}
      </SubmitButton>
    </form>
  );
}
