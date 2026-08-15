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

/** Scattered spots inside the hero so bubbles never sit on top of each other. */
const SPOTS = [
  { left: 8, top: 6, size: 48, delay: 0 },
  { left: 46, top: 0, size: 40, delay: 1.4 },
  { left: 74, top: 14, size: 54, delay: 0.6 },
  { left: 22, top: 34, size: 62, delay: 2.1 },
  { left: 58, top: 40, size: 46, delay: 0.9 },
  { left: 4, top: 62, size: 42, delay: 1.8 },
  { left: 38, top: 68, size: 54, delay: 0.3 },
  { left: 72, top: 62, size: 40, delay: 2.6 },
  { left: 88, top: 40, size: 34, delay: 1.1 },
  { left: 56, top: 20, size: 32, delay: 3.1 },
];

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
          50% { transform: translateY(-14px) }
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
