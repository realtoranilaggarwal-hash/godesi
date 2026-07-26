"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Plan } from "@prisma/client";
import { Alert } from "@/components/ui";

type PayPalButtonsConfig = {
  style?: Record<string, string>;
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  onError: (error: unknown) => void;
};

type PayPalNamespace = {
  Buttons: (config: PayPalButtonsConfig) => { render: (el: HTMLElement) => Promise<void> };
};

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

const SDK_ID = "paypal-sdk";

function loadSdk(clientId: string) {
  return new Promise<void>((resolve, reject) => {
    if (window.paypal) return resolve();
    const existing = document.getElementById(SDK_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("SDK failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.id = SDK_ID;
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("SDK failed to load"));
    document.body.appendChild(script);
  });
}

export function PayPalCheckout({ plan, clientId }: { plan: Plan; clientId: string }) {
  const container = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadSdk(clientId)
      .then(() => {
        if (cancelled || rendered.current || !container.current || !window.paypal) return;
        rendered.current = true;

        window.paypal
          .Buttons({
            style: { layout: "horizontal", height: "40", tagline: "false" },
            createOrder: async () => {
              const response = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan }),
              });
              const data = await response.json();
              if (!response.ok) throw new Error(data.error ?? "Could not start payment");
              return data.id as string;
            },
            onApprove: async (data) => {
              const response = await fetch("/api/paypal/capture-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: data.orderID }),
              });
              const result = await response.json();
              if (!response.ok) {
                setError(result.error ?? "Payment could not be confirmed");
                return;
              }
              router.push(`/dashboard?upgraded=${result.plan}`);
              router.refresh();
            },
            onError: () => setError("PayPal could not process this payment."),
          })
          .render(container.current)
          .catch(() => setError("PayPal buttons failed to load."));
      })
      .catch(() => setError("PayPal is unavailable right now."));

    return () => {
      cancelled = true;
    };
  }, [clientId, plan, router]);

  return (
    <div className="space-y-2">
      <div ref={container} />
      {error ? <Alert>{error}</Alert> : null}
    </div>
  );
}
