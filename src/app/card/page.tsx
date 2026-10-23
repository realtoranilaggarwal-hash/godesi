import { redirect } from "next/navigation";

/**
 * The cards directory merged into /search (renamed "Cards") — old links
 * like /card?cat=plumbers or /card?letter=a keep working by forwarding
 * their filters.
 */
export default function CardDirectoryRedirect({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const query = new URLSearchParams();
  const forward: Record<string, string> = {
    q: "q",
    cat: "category",
    letter: "letter",
    loc: "city",
  };
  for (const [from, to] of Object.entries(forward)) {
    const value = searchParams[from];
    if (value) query.set(to, value);
  }
  const qs = query.toString();
  redirect(`/search${qs ? `?${qs}` : ""}`);
}
