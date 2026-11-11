import { LinkifiedText } from "@/components/LinkifiedText";
import type { WellnessBlock } from "@/lib/wellness";

function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={index} className="text-slate-900">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <LinkifiedText key={index} text={part} />
        ),
      )}
    </>
  );
}

export function WellnessText({ blocks }: { blocks: WellnessBlock[] }) {
  return (
    <div className="space-y-4 break-words text-[15px] leading-7 text-slate-700">
      {blocks.map((block, index) =>
        block.type === "heading" ? (
          block.level === 2 ? (
            <h2 key={index} id={block.id} className="scroll-mt-40 pt-2 text-xl font-black text-slate-900">
              {block.text}
            </h2>
          ) : (
            <h3 key={index} id={block.id} className="scroll-mt-40 text-lg font-bold text-slate-900">
              {block.text}
            </h3>
          )
        ) : block.type === "list" ? (
          <ul key={index} className="list-disc space-y-1 pl-5">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                <Inline text={item} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={index} className="whitespace-pre-line">
            <Inline text={block.text} />
          </p>
        ),
      )}
    </div>
  );
}
