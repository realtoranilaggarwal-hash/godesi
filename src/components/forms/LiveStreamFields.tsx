import { Field, inputClass } from "@/components/ui";

/** YouTube Live link for the event page, optionally only for ticket holders. */
export function LiveStreamFields({
  liveUrl = "",
  ticketOnly = false,
}: {
  liveUrl?: string;
  ticketOnly?: boolean;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-rose-200 bg-rose-50/50 p-4 sm:col-span-2">
      <Field
        label="🔴 Live stream link (YouTube Live)"
        hint="Optional — schedule the stream on YouTube, paste its link (youtube.com/live/…, youtu.be/… or a playlist) and it plays at the top of the event page. Share the event page with your audience."
      >
        <input
          name="liveUrl"
          defaultValue={liveUrl}
          placeholder="https://youtube.com/live/..."
          className={inputClass}
        />
      </Field>
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="liveTicketOnly"
          defaultChecked={ticketOnly}
          className="mt-0.5"
        />
        <span>
          Only ticket holders can watch. Set a ticket price above to charge for
          viewing, and set the stream to <strong>Unlisted</strong> in YouTube
          Studio so it can&apos;t be found on YouTube itself.
        </span>
      </label>
    </div>
  );
}
