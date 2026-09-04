"use client";

import { useState } from "react";

/** The rendered site in an iframe, with a desktop / phone toggle. */
export function PreviewFrame({ src, seed }: { src: string; seed: number }) {
  const [mobile, setMobile] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex rounded-xl border border-slate-300 bg-white p-0.5 text-sm">
          <button
            type="button"
            onClick={() => setMobile(false)}
            className={`rounded-lg px-3 py-1.5 font-medium ${!mobile ? "bg-slate-900 text-white" : "text-slate-700"}`}
          >
            🖥️ Desktop
          </button>
          <button
            type="button"
            onClick={() => setMobile(true)}
            className={`rounded-lg px-3 py-1.5 font-medium ${mobile ? "bg-slate-900 text-white" : "text-slate-700"}`}
          >
            📱 Phone
          </button>
        </div>
        <a href={src} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-700 underline">
          Open full size ↗
        </a>
      </div>
      <div className="flex justify-center rounded-2xl border border-slate-200 bg-slate-100 p-2 sm:p-4">
        <iframe
          key={`${seed}-${mobile}`}
          src={src}
          title="Website preview"
          sandbox=""
          className={`rounded-xl border border-slate-300 bg-white shadow-lg transition-all ${
            mobile ? "h-[720px] w-[390px] max-w-full" : "h-[720px] w-full"
          }`}
        />
      </div>
    </div>
  );
}
