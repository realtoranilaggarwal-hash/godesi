import Link from "next/link";
import type { ProfessionalCardData } from "@/lib/professionalsQueries";
import { thumbImage } from "@/lib/proxyImage";
import { Card } from "@/components/ui";

/** Portrait, what they do, where, and the skills they listed. */
export function ProfessionalCard({
  person,
}: {
  person: ProfessionalCardData;
}) {
  return (
    <Card className="flex h-full flex-col gap-2 border-slate-200">
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            person.avatarUrl
              ? thumbImage(person.avatarUrl, 384)
              : "/placeholder-logo.svg"
          }
          alt={person.name}
          className="h-14 w-14 shrink-0 rounded-full border border-slate-200 bg-slate-100 object-cover object-top"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <Link
            href={`/${person.username}`}
            className="block truncate font-bold text-slate-900 hover:text-indigo-600"
          >
            {person.name}
          </Link>
          {person.headline ? (
            <p className="line-clamp-2 text-sm text-slate-700">
              {person.headline}
            </p>
          ) : null}
          {person.location ? (
            <p className="mt-0.5 text-xs text-slate-500">📍 {person.location}</p>
          ) : null}
        </div>
      </div>

      {person.skills.length ? (
        <ul className="flex flex-wrap gap-1">
          {person.skills.slice(0, 5).map((skill) => (
            <li
              key={skill}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
            >
              {skill}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-1">
        {person.foundingNumber !== null ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
            🏅 Founding #{person.foundingNumber}
          </span>
        ) : null}
        {person.openToWork ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
            Open to work
          </span>
        ) : null}
        <Link
          href={`/${person.username}`}
          className="ml-auto text-xs font-bold text-indigo-600 hover:underline"
        >
          View profile →
        </Link>
      </div>

      {/* The free listing is the doorway to the paid recognition. */}
      <Link
        href="/desi-elite/apply?nominate=other"
        className="text-[11px] font-semibold text-amber-700 hover:underline"
      >
        🏆 Nominate for GoDesi Elite
      </Link>
    </Card>
  );
}
