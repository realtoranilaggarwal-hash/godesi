"use client";

import { useEffect, useState } from "react";

/** Up / down arrows on long pages so people know there is more to scroll. */
export function BackToTop() {
  const [canUp, setCanUp] = useState(false);
  const [canDown, setCanDown] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const el = document.scrollingElement ?? document.documentElement;
      setCanUp(window.scrollY > 300);
      setCanDown(window.scrollY + window.innerHeight < el.scrollHeight - 300);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const settle = setTimeout(onScroll, 1500);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(settle);
    };
  }, []);

  if (!canUp && !canDown) return null;

  const arrow =
    "flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-lg font-bold text-slate-700 shadow-lg backdrop-blur hover:bg-white";

  return (
    <div className="fab-anchor fixed bottom-24 left-4 z-40 flex flex-col gap-2 sm:bottom-6">
      {canUp ? (
        <button
          type="button"
          aria-label="Scroll to top"
          title="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={arrow}
        >
          ↑
        </button>
      ) : null}
      {canDown ? (
        <button
          type="button"
          aria-label="Scroll down"
          title="More below"
          onClick={() =>
            window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" })
          }
          className={arrow}
        >
          ↓
        </button>
      ) : null}
    </div>
  );
}
