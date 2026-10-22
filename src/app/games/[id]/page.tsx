import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { feedGame } from "@/lib/gamesFeed";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const game = await feedGame(id);
  return game
    ? { title: `${game.title} — free game`, description: game.description }
    : { title: "Game" };
}

export default async function GamePlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = await feedGame(id);
  if (!game) notFound();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-black text-slate-900">{game.title}</h1>
          <p className="text-xs text-slate-500">
            {game.category} · free to play
          </p>
        </div>
        <Link
          href="/games"
          className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          ← All games
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
        <iframe
          src={game.url}
          title={game.title}
          className="aspect-video w-full"
          allow="autoplay; fullscreen; gamepad"
          allowFullScreen
        />
      </div>

      {game.instructions ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <p className="mb-1 font-bold text-slate-900">How to play</p>
          <p>{game.instructions}</p>
        </div>
      ) : null}

      <p className="text-sm text-slate-600">{game.description}</p>
    </div>
  );
}
