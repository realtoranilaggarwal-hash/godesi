export function AskReferredByField({
  defaultChecked = false,
}: {
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-start gap-2 text-sm text-slate-700 sm:col-span-2">
      <input
        type="checkbox"
        name="askReferredBy"
        defaultChecked={defaultChecked}
        className="mt-0.5"
      />
      <span>
        Ask people who book <strong>“Referred by”</strong> — handy for
        networking events. You see the answers in your attendee list and CSV
        on the event page.
      </span>
    </label>
  );
}
