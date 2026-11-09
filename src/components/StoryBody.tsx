/**
 * Renders a member's report as paragraphs, bullets and sub-headings. Everything
 * is React text, never HTML, so anything a member pastes — including markup —
 * shows as the characters they typed and can never run.
 */
const URL_PATTERN = /(https?:\/\/[^\s<>"]+|(?<![\w.@-])(?:www\.)?godesi\.com\/[^\s<>"]*)/gi;
const TRAILING_PUNCTUATION = /[.,;:!?)\]'"]+$/;

/** Turns pasted web addresses into links; everything else stays plain text. */
function Linkified({ text }: { text: string }) {
  const parts = text.split(URL_PATTERN);
  return (
    <>
      {parts.map((part, index) => {
        if (index % 2 === 0 || !part) return part;
        const trailing = part.match(TRAILING_PUNCTUATION)?.[0] ?? "";
        const label = trailing ? part.slice(0, -trailing.length) : part;
        const href = /^https?:\/\//i.test(label) ? label : `https://${label}`;
        let internal = false;
        try {
          internal = /(^|\.)godesi\.com$/i.test(new URL(href).hostname);
        } catch {
          return part;
        }
        return (
          <span key={index}>
            <a
              href={href}
              className="break-all font-semibold text-indigo-700 underline hover:text-indigo-900"
              {...(internal
                ? {}
                : { target: "_blank", rel: "nofollow ugc noopener noreferrer" })}
            >
              {label}
            </a>
            {trailing}
          </span>
        );
      })}
    </>
  );
}

export function StoryBody({ text }: { text: string }) {
  const blocks = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-slate-700">
      {blocks.map((block, index) => {
        const lines = block
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        const bullets = lines.filter((line) => /^[-*•]\s+/.test(line));
        if (bullets.length && bullets.length === lines.length) {
          return (
            <ul key={index} className="ml-5 list-disc space-y-1">
              {lines.map((line, item) => (
                <li key={item}>
                  <Linkified text={line.replace(/^[-*•]\s+/, "")} />
                </li>
              ))}
            </ul>
          );
        }

        // Several short lines with no full stop are a list the writer typed
        // without any bullet characters.
        if (
          lines.length >= 3 &&
          lines.every((line) => line.length <= 80 && !/[.!?]$/.test(line))
        ) {
          return (
            <ul key={index} className="ml-5 list-disc space-y-1">
              {lines.map((line, item) => (
                <li key={item}>
                  <Linkified text={line} />
                </li>
              ))}
            </ul>
          );
        }

        // A lone short line with no full stop is a section heading in practice.
        if (
          lines.length === 1 &&
          lines[0].length <= 70 &&
          !/[.!?:;,]$/.test(lines[0]) &&
          !/https?:\/\/|godesi\.com\//i.test(lines[0])
        ) {
          return (
            <h2
              key={index}
              className="pt-1 text-base font-black text-slate-900"
            >
              {lines[0]}
            </h2>
          );
        }

        return (
          <p key={index} className="whitespace-pre-line">
            <Linkified text={lines.join("\n")} />
          </p>
        );
      })}
    </div>
  );
}
