import { redirect } from "next/navigation";

/** Old link kept working — the marketing course's learn page lives under its slug now. */
export default function LegacyLearnRedirect() {
  redirect("/course/marketing/learn");
}
