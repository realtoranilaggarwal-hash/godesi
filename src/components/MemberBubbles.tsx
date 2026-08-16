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
 * Spots inside the hero so bubbles never sit on top of each other: five
 * columns over four rows, nudged off the grid so it still reads as a scatter.
 * The last slot stays empty for the member counter in the bottom corner.
 */
const COLUMNS = [1, 20, 39, 58, 77];
const ROWS = [1, 24, 47, 70];
const SIZES = [38, 30, 42, 32, 36];

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
).slice(0, ROWS.length * COLUMNS.length - 1);

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * Floating photo bubbles of the newest members in the empty half of the home
 * hero. It refreshes every half minute, so a member who signs up drifts in
 * without a reload.
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

    const timer = window.setInterval(load, 180_000);
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
    <div className="relative hidden h-52 lg:block" aria-hidden={false}>
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
        const content = (
          <span
            title={`${member.name}${member.location ? ` · ${member.location}` : ""}`}
            className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-white/70 bg-white/25 text-xs font-black text-white shadow-lg backdrop-blur"
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
            {member.username ? (
              <Link
                href={`/${member.username}`}
                className="block h-full w-full"
              >
                {content}
              </Link>
            ) : (
              content
            )}
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
  );
}
