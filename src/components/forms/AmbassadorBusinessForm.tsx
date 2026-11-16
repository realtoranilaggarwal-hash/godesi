"use client";

import { useFormState } from "react-dom";
import { saveAmbassadorBusinessAction } from "@/app/actions/joinGoals";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";
import { ImageField } from "@/components/forms/ImageField";

export function AmbassadorBusinessForm({
  defaults,
}: {
  defaults: {
    businessName: string;
    socialUrl: string;
    logoUrl: string;
    businessInfo: string;
  };
}) {
  const [state, formAction] = useFormState(
    saveAmbassadorBusinessAction,
    emptyState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <FormError>{state.error}</FormError>
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business name" required>
          <input
            name="businessName"
            defaultValue={defaults.businessName}
            required
            maxLength={120}
            className={inputClass}
          />
        </Field>
        <Field label="Website or social media link">
          <input
            name="socialUrl"
            type="url"
            defaultValue={defaults.socialUrl}
            placeholder="https://instagram.com/yourpage"
            className={inputClass}
          />
        </Field>
      </div>
      <ImageField
        name="logoUrl"
        label="Logo"
        purpose="logo"
        square
        defaultValue={defaults.logoUrl}
        hint="Square logos look best."
      />
      <Field
        label="About the business"
        hint="One or two lines shown under your logo."
      >
        <textarea
          name="businessInfo"
          rows={3}
          maxLength={1000}
          defaultValue={defaults.businessInfo}
          className={inputClass}
        />
      </Field>
      <SubmitButton pendingLabel="Saving...">Submit for review</SubmitButton>
    </form>
  );
}
