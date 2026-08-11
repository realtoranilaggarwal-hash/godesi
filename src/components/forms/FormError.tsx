"use client";

import { useEffect, useRef } from "react";
import { Alert } from "@/components/ui";

/**
 * Server-action error banner. Long forms scroll far past the top, so the banner
 * brings itself into view and takes focus — otherwise submitting looks like
 * nothing happened at all.
 */
export function FormError({ children }: { children?: string | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!children) return;
    const node = ref.current;
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    node.focus({ preventScroll: true });
  }, [children]);

  if (!children) return null;

  return (
    <div ref={ref} role="alert" aria-live="assertive" tabIndex={-1} className="outline-none">
      <Alert>{children}</Alert>
    </div>
  );
}
