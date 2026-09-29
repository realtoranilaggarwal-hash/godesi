import Link from "next/link";
import { Card } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";
import {
  CLUB_PREMIUM_YEAR_USD,
  clubCategory,
  clubIsPremium,
} from "@/lib/clubs";
import { platformFeePercent } from "@/lib/connect";
import { startClubPremiumCheckoutAction } from "@/app/actions/clubs";

type Club = {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string | null;
  playlistUrl: string | null;
  premiumUntil: Date | null;
};

/** Ready-to-paste prompt so an organiser gets a poster from ChatGPT or any image AI. */
export function posterPrompt(club: Club) {
  const cat = clubCategory(club.category).label.toLowerCase();
  return `Design a square social-media poster for "${club.name}", a Desi ${cat} club${
    club.city ? ` in ${club.city}` : ""
  }. Bold, festive Indian colours (marigold, magenta, royal blue), the club name large at the top, a short tagline, and the line "Join us on GoDesi.com/clubs/${club.slug}" at the bottom. No other text.`;
}

/** Organiser-only: ways to promote the club, and the Premium upgrade. */
export function ClubPromote({ club }: { club: Club }) {
  const premium = clubIsPremium(club);
  const prompt = posterPrompt(club);
  return (
    <>
      <Card className="!border-violet-200 bg-violet-50/40">
        <h2 className="font-bold text-slate-900">Promote your club</h2>
        <ul className="mt-2 space-y-2 text-sm text-slate-700">
          <li>
            <strong>🎨 Poster in one minute.</strong> Paste this into ChatGPT,
            Gemini or Canva AI, save the image, then add it as the club photo
            (Edit club) or upload it on your next event.
            <div className="mt-1 flex items-start gap-2 rounded-lg border border-violet-200 bg-white p-2 text-xs text-slate-600">
              <span className="flex-1">{prompt}</span>
              <CopyButton value={prompt} label="Copy prompt" />
            </div>
          </li>
          <li>
            <strong>🎵 Songs.</strong>{" "}
            {club.playlistUrl ? (
              <>
                Your YouTube playlist plays on this page — share the club link
                and members can practise before the meet.
              </>
            ) : (
              <>
                Add a YouTube playlist (Edit club) — every song shows on this
                page so members practise before the meet.
              </>
            )}{" "}
            Put{" "}
            <Link href="/live-radio" className="font-semibold text-indigo-700">
              GoDesi live desi radio
            </Link>{" "}
            on between turns.
          </li>
          <li>
            <strong>📣 Spread the word.</strong> Post events under the club —
            they appear on{" "}
            <Link href="/events" className="font-semibold text-indigo-700">
              /events
            </Link>{" "}
            and the home page; share the club link on WhatsApp with the buttons
            below; ask members to add{" "}
            <Link href="/signup" className="font-semibold text-indigo-700">
              their GoDesi profile
            </Link>{" "}
            so they show in the member list.
          </li>
        </ul>
      </Card>

      <Card className="!border-amber-200 bg-amber-50/40">
        <h2 className="font-bold text-slate-900">
          {premium ? "⭐ Premium club" : "Go Premium"}
        </h2>
        {premium ? (
          <p className="mt-1 text-sm text-slate-700">
            No Godesi fee on your event tickets, Premium badge and top placement
            on /clubs until{" "}
            <strong>
              {club.premiumUntil!.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </strong>
            . Extend below.
          </p>
        ) : (
          <p className="mt-1 text-sm text-slate-700">
            Free clubs pay Godesi {platformFeePercent()}% on paid event tickets
            and contributions. Premium clubs pay nothing per event, get a ⭐
            badge and are listed first on /clubs.
          </p>
        )}
        <form
          action={startClubPremiumCheckoutAction}
          className="mt-3 flex flex-wrap items-center gap-2"
        >
          <input type="hidden" name="clubId" value={club.id} />
          <select
            name="years"
            defaultValue="1"
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="1">1 year — ${CLUB_PREMIUM_YEAR_USD}</option>
            <option value="2">2 years — ${CLUB_PREMIUM_YEAR_USD * 2}</option>
          </select>
          <button
            type="submit"
            className="rounded-full bg-amber-500 px-4 py-1.5 text-sm font-bold text-white hover:bg-amber-600"
          >
            {premium ? "Extend Premium" : "Upgrade to Premium"}
          </button>
        </form>
      </Card>
    </>
  );
}
