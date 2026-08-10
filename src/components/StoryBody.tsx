/**
 * Renders a member's report as paragraphs, bullets and sub-headings. Everything
 * is React text, never HTML, so anything a member pastes — including markup —
 * shows as the characters they typed and can never run.
 */
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
                <li key={item}>{line.replace(/^[-*•]\s+/, "")}</li>
              ))}
            </ul>
          );
        }

        // A lone short line with no full stop is a section heading in practice.
        if (
          lines.length === 1 &&
          lines[0].length <= 70 &&
          !/[.!?:;,]$/.test(lines[0])
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
            {lines.join("\n")}
          </p>
        );
      })}
    </div>
  );
}
