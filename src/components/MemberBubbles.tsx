"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type BubbleMember = {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  location: string | null;
};

/**
 * Spots inside the hero so bubbles never sit on top of each other: six columns
 * over six rows, nudged off the grid so it still reads as a scatter. The last
 * two slots stay empty for the member counter in the bottom corner.
 */
const COLUMNS = [0, 17, 34, 51, 68, 85];
const ROWS = [0, 16, 32, 48, 64, 80];
const SIZES = [30, 24, 33, 26, 28];

const SPOTS = ROWS.flatMap((top, row) =>
  COLUMNS.map((left, column) => {
    const index = row * COLUMNS.length + column;
    return {
      left: left + (row % 2 ? 3 : 0),
      top: top + (column % 2 ? 4 : 0),
      size: SIZES[(index + row) % SIZES.length],
      delay: (index % 7) * 0.45,
    };
  }),
).slice(0, ROWS.length * COLUMNS.length - 2);

/** A phone has nowhere for a scatter, so the same faces wrap in a row. */
const PHONE_BUBBLES = 21;

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Face({
  member,
  className,
}: {
  member: BubbleMember;
  className: string;
}) {
  return (
    <span
      title={`${member.name}${member.location ? ` · ${member.location}` : ""}`}
      className={`flex items-center justify-center overflow-hidden rounded-full border-2 border-white/70 bg-white/25 text-xs font-black text-white shadow-lg backdrop-blur ${className}`}
    >
      {member.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={member.avatarUrl}
          alt={member.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        initials(member.name) || "🙂"
      )}
    </span>
  );
}

/** Wraps a face in its own page link when the member has claimed a handle. */
function FaceLink({
  member,
  className,
}: {
  member: BubbleMember;
  className: string;
}) {
  const face = <Face member={member} className="h-full w-full" />;
  if (!member.username) return <span className={className}>{face}</span>;
  return (
    <Link href={`/${member.username}`} className={className}>
      {face}
    </Link>
  );
}

/**
 * Photo bubbles of the members who just joined, sitting in the home hero: a
 * floating scatter on a desktop and a wrapped row on a phone. It refreshes on
 * its own, so a member who signs up drifts in without a reload.
 */
export function MemberBubbles({
  members: initial,
  total: initialTotal,
}: {
  members: BubbleMember[];
  total: number;
}) {
  const [members, setMembers] = useState(initial);
  const [total, setTotal] = useState(initialTotal);
  const [arrived, setArrived] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      // A tab left open in the background does not need fresh bubbles.
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch("/api/members");
        if (!response.ok) return;
        const data = (await response.json()) as {
          members?: BubbleMember[];
          total?: number;
        };
        if (!Array.isArray(data.members)) return;
        const next = data.members;
        setMembers((current) => {
          if (next[0] && current[0] && next[0].id !== current[0].id) {
            setArrived(next[0].id);
            window.setTimeout(() => setArrived(null), 6000);
          }
          return next;
        });
        if (typeof data.total === "number") setTotal(data.total);
      } catch {
        // A hiccup just leaves the last set of faces on screen.
      }
    };

    const timer = window.setInterval(load, 600_000);
    return () => window.clearInterval(timer);
  }, []);

  const bubbles = useMemo(
    () =>
      members
        .slice(0, SPOTS.length)
        .map((member, index) => ({ member, spot: SPOTS[index] })),
    [members],
  );

  if (!bubbles.length) return null;

  return (
    <>
      <div className="relative hidden h-64 lg:block">
        <style>{`
        @keyframes godesi-float {
          0%, 100% { transform: translateY(0) }
          50% { transform: translateY(-7px) }
        }
        @keyframes godesi-pop {
          0% { transform: scale(0); opacity: 0 }
          70% { transform: scale(1.15); opacity: 1 }
          100% { transform: scale(1); opacity: 1 }
        }
      `}</style>

        {bubbles.map(({ member, spot }) => {
          const isNew = member.id === arrived;

          return (
            <div
              key={member.id}
              className="absolute"
              style={{
                left: `${spot.left}%`,
                top: `${spot.top}%`,
                width: spot.size,
                height: spot.size,
                animation: isNew
                  ? "godesi-pop 700ms ease-out"
                  : `godesi-float ${6 + (spot.size % 5)}s ease-in-out ${spot.delay}s infinite`,
              }}
            >
              <FaceLink member={member} className="block h-full w-full" />
              {isNew ? (
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-rose-600 shadow">
                  just joined
                </span>
              ) : null}
            </div>
          );
        })}

        <div className="absolute bottom-0 right-0 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
          🎉 {total.toLocaleString()} members and counting
        </div>
      </div>

      <div className="lg:hidden">
        <div className="flex flex-wrap gap-1.5">
          {members.slice(0, PHONE_BUBBLES).map((member) => (
            <FaceLink
              key={member.id}
              member={member}
              className="block h-9 w-9 shrink-0"
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] font-bold text-white/90">
          🎉 {total.toLocaleString()} members and counting
        </p>
      </div>
    </>
  );
}
