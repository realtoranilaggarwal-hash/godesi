/**
 * Required notice on every housing surface: listings, rooms and the posting
 * forms. Wording is fixed — do not paraphrase.
 */
export function FairHousingNotice({ className = "" }: { className?: string }) {
  return (
    <section
      aria-label="Fair housing notice"
      className={`rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600 ${className}`}
    >
      <p className="text-sm font-bold text-slate-800">Fair Housing Notice</p>
      <p className="mt-1">
        Godesi is committed to providing an inclusive platform for housing and real
        estate listings. All users must comply with applicable fair housing laws.
      </p>
      <p className="mt-2">
        Listings must not discriminate based on race, color, religion, sex,
        disability, familial status, national origin, sexual orientation, gender
        identity, or any other protected characteristic under applicable laws.
      </p>
      <p className="mt-2">
        Users are solely responsible for the content they post. Godesi does not verify
        listings and is not responsible for any claims or agreements between parties.
      </p>
    </section>
  );
}

/** Additional notice for room shares, where preference wording is common. */
export function RoomSharingNotice({ className = "" }: { className?: string }) {
  return (
    <section
      aria-label="Room and shared housing disclaimer"
      className={`rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600 ${className}`}
    >
      <p className="text-sm font-bold text-slate-800">
        Room &amp; Shared Housing Disclaimer
      </p>
      <p className="mt-1">
        Listings for shared housing or roommates are intended for individuals seeking
        compatible living arrangements.
      </p>
      <p className="mt-2">
        While users may describe preferences (such as lifestyle, cleanliness, or
        habits), discriminatory language or exclusion based on protected
        characteristics is strictly prohibited.
      </p>
      <p className="mt-2">
        Please ensure all listings comply with local housing and anti-discrimination
        laws.
      </p>
    </section>
  );
}
