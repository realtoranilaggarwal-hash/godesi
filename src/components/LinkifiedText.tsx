const URL_PATTERN = /(https?:\/\/[^\s<>()]*[^\s<>().,;:!?'"])/g;

/** Plain text with every http(s) address turned into a link. */
export function LinkifiedText({ text }: { text: string }) {
  return (
    <>
      {text.split(URL_PATTERN).map((part, index) =>
        index % 2 === 1 ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="break-all font-semibold text-indigo-600 underline"
          >
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </>
  );
}
