import Link from "next/link";
import { db } from "@/lib/db";
import { cachedCurrentUser } from "@/lib/auth";
import { CONTENT_TTL, cachedQuery } from "@/lib/cache";
import { optionalRead } from "@/lib/resilient";
import { ageFromBirthYear, canSeeRishtaPhoto } from "@/lib/rishta";
import { RishtaPhoto } from "@/components/RishtaCard";

const newestRishtas = cachedQuery("home-rishtas", CONTENT_TTL, () =>
  db.rishtaProfile.findMany({
    where: { status: "APPROVED", visible: true },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: {
      id: true,
      userId: true,
      displayName: true,
      birthYear: true,
      city: true,
      photoUrl: true,
      hidePhoto: true,
      updatedAt: true,
    },
  }),
);

function MandapScene({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 160"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-hidden
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mandap-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fb7185" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="240" height="160" fill="url(#mandap-sky)" />
      <path d="M40 46 Q120 6 200 46Z" fill="#fde68a" />
      <rect x="46" y="46" width="8" height="96" fill="#fef3c7" />
      <rect x="186" y="46" width="8" height="96" fill="#fef3c7" />
      <path
        d="M54 50 Q120 74 186 50"
        stroke="#fef3c7"
        strokeWidth="3"
        fill="none"
        strokeDasharray="2 6"
        strokeLinecap="round"
      />
      <rect x="0" y="138" width="240" height="22" fill="#be123c" />
      <text x="70" y="132" fontSize="46">
        🤵
      </text>
      <text x="122" y="132" fontSize="46">
        👰
      </text>
      <text x="108" y="70" fontSize="22">
        💞
      </text>
      <text x="16" y="34" fontSize="18">
        🪔
      </text>
      <text x="204" y="34" fontSize="18">
        🪔
      </text>
      <text x="16" y="128" fontSize="18">
        💐
      </text>
      <text x="204" y="128" fontSize="18">
        💐
      </text>
    </svg>
  );
}

/** Home invitation to Rishta: wedding scene, find/post buttons and the newest approved profiles. */
export async function RishtaHomeBox() {
  const [viewer, rows] = await Promise.all([
    optionalRead(() => cachedCurrentUser(), null),
    optionalRead(() => newestRishtas(), []),
  ]);
  const profiles = rows.map((row) => ({
    ...row,
    updatedAt: new Date(row.updatedAt),
  }));

  return (
    <section className="overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50">
      <div className="grid grid-cols-[96px_minmax(0,1fr)] sm:grid-cols-[110px_minmax(0,1fr)] lg:grid-cols-[110px_minmax(0,1fr)_minmax(0,1.4fr)]">
        <Link
          href="/rishta"
          className="relative block min-h-[96px]"
          aria-label="Open Rishta"
        >
          <MandapScene className="absolute inset-0 h-full w-full" />
        </Link>
        <div className="flex flex-col justify-center gap-2 p-3">
          <h2 className="text-base font-black text-slate-900">
            💍 Rishta: find your match
          </h2>
          <p className="text-sm text-slate-700">
            Marriage-minded profiles posted by the person or their family, each
            reviewed by GoDesi, with a free 36-guna kundli match.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/rishta"
              className="rounded-full bg-rose-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-rose-700"
            >
              Find a match →
            </Link>
            <Link
              href="/rishta/new"
              className="rounded-full border border-rose-300 bg-white px-3 py-1.5 text-sm font-bold text-rose-700 hover:bg-rose-50"
            >
              Post a profile
            </Link>
          </div>
        </div>
        {profiles.length ? (
          <ul className="col-span-2 grid grid-cols-2 gap-2 border-t border-rose-100 p-3 sm:grid-cols-4 lg:col-span-1 lg:border-l lg:border-t-0">
            {profiles.map((profile) => (
              <li key={profile.id}>
                <Link
                  href={`/rishta/${profile.id}`}
                  className="block rounded-xl bg-white/90 p-1.5 text-center hover:bg-white"
                >
                  <RishtaPhoto
                    profile={profile}
                    canSee={canSeeRishtaPhoto(profile, viewer)}
                    className="h-20 text-[11px]"
                  />
                  <p className="mt-1 truncate text-xs font-bold text-slate-900">
                    {profile.displayName}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {ageFromBirthYear(profile.birthYear)} · {profile.city}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
