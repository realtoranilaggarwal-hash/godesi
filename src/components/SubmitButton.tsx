"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonVariant } from "@/components/ui";

export function SubmitButton({
  children,
  variant = "primary",
  className = "",
  pendingLabel = "Saving...",
  disabled = false,
}: {
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  pendingLabel?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      className={className}
      disabled={pending || disabled}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}
