"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Everything a visitor can add, in the words they use themselves. */
const OPTIONS = [
  {
    href: "/post?type=business",
    icon: "🏪",
    label: "My business",
    blurb: "Shop, restaurant, agency or service company",
  },
  {
    href: "/post?type=professional",
    icon: "🎓",
    label: "My professional profile",
    blurb: "Agent, attorney, accountant, doctor, consultant",
  },
  {
    href: "/post?type=event",
    icon: "🎟️",
    label: "An event",
    blurb: "Mela, garba, concert, workshop or meetup",
  },
  {
    href: "/post?type=property",
    icon: "🏢",
    label: "Property or room",
    blurb: "Sell, rent or share a home or a room",
  },
  {
    href: "/post?type=requirement",
    icon: "📋",
    label: "What I need",
    blurb: "Get quotes from vendors — free",
  },
  {
    href: "/news/report",
    icon: "📰",
    label: "Local news",
    blurb: "Report what is happening in your city",
  },
];

/** Pages that are already a posting or account flow do not need the button. */
const HIDDEN = ["/post", "/login", "/signup", "/news/report"];

/**
 * People kept asking "where do I put my business?" — so the answer follows them
 * around the site instead of hiding in the header.
 */
export function PostFab({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (HIDDEN.some((path) => pathname === path || pathname.startsWith(`${path}/`)))
    return null;

  const link = (href: string) =>
    signedIn ? href : `/signup?next=${encodeURIComponent(href)}`;

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40"
        />
      ) : null}

      <div className="fixed bottom-20 right-4 z-40 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2">
        {open ? (
          <div className="w-[19rem] max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-4 py-3 text-white">
              <p className="text-sm font-black">What do you want to post?</p>
              <p className="text-xs text-white/85">
                {signedIn
                  ? "Free · takes about two minutes"
                  : "Free — you will be asked to create an account first"}
              </p>
            </div>
            <ul className="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto">
              {OPTIONS.map((option) => (
                <li key={option.href}>
                  <Link
                    href={link(option.href)}
                    className="flex gap-3 px-4 py-3 hover:bg-slate-50"
                  >
                    <span aria-hidden className="text-xl">
                      {option.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-900">
                        {option.label}
                      </span>
                      <span className="block text-xs text-slate-600">
                        {option.blurb}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {signedIn ? null : (
              <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-xs font-semibold">
                <span className="text-slate-600">Already a member?</span>
                <Link href="/login" className="text-indigo-700 underline">
                  Sign in
                </Link>
              </div>
            )}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          className="rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-4 py-3 text-sm font-black text-white shadow-xl hover:brightness-110"
        >
          {open ? "✕ Close" : "＋ Post your business"}
        </button>
      </div>
    </>
  );
}
