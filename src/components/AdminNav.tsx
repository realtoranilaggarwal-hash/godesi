"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminSection } from "@/lib/adminSections";

export function AdminNav({ sections }: { sections: AdminSection[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1.5 text-sm font-semibold">
      {sections.map((section) => (
        <Link
          key={section.href}
          href={section.href}
          className={`rounded-full px-3 py-1.5 ${
            pathname === section.href
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          <span aria-hidden className="mr-1">
            {section.icon}
          </span>
          {section.label}
        </Link>
      ))}
    </nav>
  );
}
