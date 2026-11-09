/**
 * Renders a member's report as paragraphs, bullets and sub-headings. Everything
 * is React text, never HTML, so anything a member pastes — including markup —
 * shows as the characters they typed and can never run.
 */
import type { ReactNode } from "react";

const LINK_PATTERN =
  /\[([^\]\n]+)\]\((https?:\/\/[^\s<>"()]+)\)|(https?:\/\/[^\s<>"]+|(?<![\w.@-])(?:www\.)?godesi\.com\/[^\s<>"]*)/gi;
const TRAILING_PUNCTUATION = /[.,;:!?)\]'"]+$/;

function StoryLink({ href, label }: { href: string; label: string }) {
  let internal = false;
  try {
    internal = /(^|\.)godesi\.com$/i.test(new URL(href).hostname);
  } catch {
    return <>{label}</>;
  }
  return (
    <a
      href={href}
      className="break-words font-semibold text-indigo-700 underline hover:text-indigo-900"
      {...(internal
        ? {}
        : {
            target: "_blank",
            rel: "nofollow sponsored ugc noopener noreferrer",
          })}
    >
      {label}
    </a>
  );
}

/**
 * Turns pasted web addresses, and `[words](https://…)` links, into links;
 * everything else stays plain text.
 */
function Linkified({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of Array.from(text.matchAll(LINK_PATTERN))) {
    const start = match.index ?? 0;
    if (start > cursor) nodes.push(text.slice(cursor, start));
    cursor = start + match[0].length;
    if (match[1] && match[2]) {
      nodes.push(<StoryLink key={start} href={match[2]} label={match[1]} />);
      continue;
    }
    const raw = match[3];
    const trailing = raw.match(TRAILING_PUNCTUATION)?.[0] ?? "";
    const label = trailing ? raw.slice(0, -trailing.length) : raw;
    const href = /^https?:\/\//i.test(label) ? label : `https://${label}`;
    nodes.push(
      <span key={start} className="break-all">
        <StoryLink href={href} label={label} />
        {trailing}
      </span>,
    );
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <>{nodes}</>;
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
