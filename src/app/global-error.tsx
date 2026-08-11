"use client";

import { useEffect } from "react";
import { isStaleBuild, reloadOnceForBuild } from "@/lib/staleBuild";

/** Last-resort boundary: a layout-level crash (often a stale build) reloads once, then offers a way out. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (isStaleBuild(error)) reloadOnceForBuild();
  }, [error]);

  return (
    <html lang="en">
      {/* The root layout crashed, so its stylesheet is gone: style inline. */}
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "linear-gradient(135deg, #4f46e5, #db2777)",
          color: "#fff",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <p style={{ fontSize: 40, margin: 0 }}>🪔</p>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "12px 0 8px" }}>
            Godesi needs a quick refresh
          </h1>
          <p style={{ margin: 0, opacity: 0.9, lineHeight: 1.5 }}>
            Your browser is holding an old copy of the site. Reloading fixes it
            — nothing is wrong with your account or your listing.
          </p>
          <div
            style={{
              marginTop: 20,
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                background: "#fff",
                color: "#4f46e5",
                border: "none",
                borderRadius: 12,
                padding: "10px 20px",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Reload Godesi
            </button>
            <button
              type="button"
              onClick={reset}
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.5)",
                borderRadius: 12,
                padding: "10px 20px",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
