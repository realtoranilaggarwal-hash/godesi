const LINK_PATTERN =
  /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>()]*[^\s<>().,;:!?'"])/g;

const AFFILIATE_HOSTS = /(^|\.)(amazon\.[a-z.]+|amzn\.to|ebay\.[a-z.]+)$/i;

function relFor(href: string) {
  try {
    if (AFFILIATE_HOSTS.test(new URL(href).hostname)) return "nofollow sponsored noopener noreferrer";
  } catch {}
  return "nofollow noopener noreferrer";
}

/**
 * Plain text with links: "[words](https://…)" shows the words as a link, and any
 * bare http(s) address is linked as-is. Amazon/eBay links are marked sponsored.
 */
export function LinkifiedText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  const pattern = new RegExp(LINK_PATTERN.source, "g");
  for (let match = pattern.exec(text); match; match = pattern.exec(text)) {
    const index = match.index;
    if (index > last) parts.push(text.slice(last, index));
    const href = match[2] ?? match[3];
    const label = match[1] ?? match[3];
    parts.push(
      <a
        key={index}
        href={href}
        target="_blank"
        rel={relFor(href)}
        className={`font-semibold text-indigo-600 underline${match[1] ? "" : " break-all"}`}
      >
        {label}
      </a>,
    );
    last = index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
