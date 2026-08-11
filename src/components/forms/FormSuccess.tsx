"use client";

import { useEffect, useRef } from "react";
import { Alert } from "@/components/ui";

/**
 * Server-action confirmation. The submit button sits at the bottom of long
 * forms, so the banner brings itself into view and takes focus — otherwise the
 * poster has no idea whether anything happened.
 */
export function FormSuccess({ children }: { children?: string | null }) {
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
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      tabIndex={-1}
      className="outline-none"
    >
      <Alert tone="success">{children}</Alert>
    </div>
  );
}
