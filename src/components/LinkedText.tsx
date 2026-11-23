import Link from "next/link";
import { interlinkText } from "@/lib/interlinks";

/** Member-written text with a few known words linked to GoDesi pages (see interlinks). */
export function LinkedText({
  text,
  exclude,
}: {
  text: string;
  exclude?: (string | null | undefined)[];
}) {
  return (
    <>
      {interlinkText(text, { exclude }).map((part, index) =>
        typeof part === "string" ? (
          part
        ) : (
          <Link
            key={index}
            href={part.href}
            className="font-medium text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:decoration-indigo-700"
          >
            {part.text}
          </Link>
        ),
      )}
    </>
  );
}
