import Link from "next/link";
import type { Metadata } from "next";
import { gamesFeed } from "@/lib/gamesFeed";

export const metadata: Metadata = {
  title: "Free games — play in your browser, no download",
  description:
    "Play free HTML5 games on GoDesi — racing, puzzles, arcade and more. No download, no signup, works on phone and computer.",
};

export default async function GamesPage() {
  const games = await gamesFeed();
  const categories = [...new Set(games.map((g) => g.category))].sort();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          🎮 Free games
        </h1>
        <p className="text-sm text-slate-600">
          {games.length} games you can play right in the browser — no
          download, no signup. Works on phone and computer.
        </p>
      </div>

      {categories.length ? (
        <div className="flex flex-wrap gap-1.5">
          {categories.map((category) => (
            <span
              key={category}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-600"
            >
              {category}
            </span>
          ))}
        </div>
      ) : null}

      {games.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={game.thumb}
                alt={game.title}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-2.5">
                <p className="truncate text-sm font-bold text-slate-900 group-hover:text-indigo-700">
                  {game.title}
                </p>
                <p className="text-xs text-slate-500">
                  {game.category} · play now →
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Games are loading — check back in a minute.
        </div>
      )}

      <p className="text-xs text-slate-400">
        Games by GameMonetize — free to play, ad-supported.
      </p>
    </div>
  );
}
