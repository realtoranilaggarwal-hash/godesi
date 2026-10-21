type Scene = {
  cast: [string, string, string];
  props: string[];
  sky: [string, string];
};

/** Cartoon cast per top-level category: centre star, two helpers, small props. */
const SCENES: Record<string, Scene> = {
  "home-services": {
    cast: ["🧑‍🔧", "🏠", "🧰"],
    props: ["🔧", "🪛", "🧹", "💡"],
    sky: ["#38bdf8", "#6366f1"],
  },
  "care-services": {
    cast: ["🤱", "👵", "🧸"],
    props: ["❤️", "🍼", "🩹", "🌼"],
    sky: ["#fb7185", "#f472b6"],
  },
  "it-training": {
    cast: ["🧑‍💻", "💻", "🚀"],
    props: ["⚙️", "☁️", "📊", "🔐"],
    sky: ["#22d3ee", "#2563eb"],
  },
  education: {
    cast: ["🧑‍🏫", "📚", "🎓"],
    props: ["✏️", "🔬", "🧮", "⭐"],
    sky: ["#818cf8", "#7c3aed"],
  },
  "business-services": {
    cast: ["🧑‍💼", "📈", "🤝"],
    props: ["💼", "🧾", "📞", "💡"],
    sky: ["#34d399", "#0d9488"],
  },
  "real-estate": {
    cast: ["🏡", "🧑‍💼", "🔑"],
    props: ["🏢", "📝", "🌳", "✨"],
    sky: ["#fb923c", "#f43f5e"],
  },
  "rooms-roommates": {
    cast: ["🛋️", "🧑‍🤝‍🧑", "🗝️"],
    props: ["🛏️", "🪴", "📦", "🏠"],
    sky: ["#2dd4bf", "#0891b2"],
  },
  "beauty-lifestyle": {
    cast: ["💃", "💅", "💄"],
    props: ["✨", "🌸", "🪞", "💇"],
    sky: ["#e879f9", "#db2777"],
  },
  "events-wedding": {
    cast: ["👰", "💐", "🤵"],
    props: ["🎉", "💍", "🥁", "🪔"],
    sky: ["#fb7185", "#f59e0b"],
  },
  "food-catering": {
    cast: ["🧑‍🍳", "🍛", "🥘"],
    props: ["🫓", "🌶️", "🍲", "☕"],
    sky: ["#fbbf24", "#ea580c"],
  },
  travel: {
    cast: ["🧳", "✈️", "🗺️"],
    props: ["🌍", "🚕", "🏝️", "🛂"],
    sky: ["#22d3ee", "#3b82f6"],
  },
  "religious-services": {
    cast: ["🛕", "🪔", "🙏"],
    props: ["🌺", "🔔", "🕉️", "✨"],
    sky: ["#a78bfa", "#f59e0b"],
  },
  jobs: {
    cast: ["🧑‍💻", "💼", "🧑‍🏭"],
    props: ["📄", "✅", "💰", "🗓️"],
    sky: ["#34d399", "#16a34a"],
  },
  professionals: {
    cast: ["🧑‍⚖️", "🧑‍⚕️", "🧑‍💼"],
    props: ["⚖️", "📋", "🏆", "💡"],
    sky: ["#22d3ee", "#4f46e5"],
  },
  "trade-sourcing": {
    cast: ["🚢", "📦", "🧑‍💼"],
    props: ["🌍", "🚚", "🏭", "📑"],
    sky: ["#fbbf24", "#0ea5e9"],
  },
  "health-medical": {
    cast: ["🧑‍⚕️", "🩺", "💊"],
    props: ["❤️", "🦷", "🧘", "🏥"],
    sky: ["#fb7185", "#14b8a6"],
  },
  "financial-services": {
    cast: ["🧑‍💼", "💰", "📊"],
    props: ["🏦", "🧾", "🪙", "📈"],
    sky: ["#a3e635", "#16a34a"],
  },
  "auto-services": {
    cast: ["🧑‍🔧", "🚗", "🛞"],
    props: ["🔧", "⛽", "🚙", "🧽"],
    sky: ["#38bdf8", "#475569"],
  },
  construction: {
    cast: ["👷", "🏗️", "🧱"],
    props: ["🔨", "🚜", "📐", "🦺"],
    sky: ["#fb923c", "#ca8a04"],
  },
  "shops-retail": {
    cast: ["🏪", "🛒", "🧑‍💼"],
    props: ["🛍️", "🏷️", "🎁", "🧾"],
    sky: ["#e879f9", "#f97316"],
  },
  "community-orgs": {
    cast: ["🧑‍🤝‍🧑", "🤝", "🎪"],
    props: ["❤️", "🎤", "🏏", "🪔"],
    sky: ["#a78bfa", "#ec4899"],
  },
  "buy-sell": {
    cast: ["🛍️", "🤝", "📱"],
    props: ["🪑", "🚲", "💵", "🏷️"],
    sky: ["#a3e635", "#0d9488"],
  },
};

const FALLBACK: Scene = {
  cast: ["🧑‍🤝‍🧑", "⭐", "🏪"],
  props: ["✨", "💬", "📍", "❤️"],
  sky: ["#f97316", "#c026d3"],
};

const PROP_SPOTS = [
  { x: 34, y: 34, size: 24, tilt: -12 },
  { x: 286, y: 30, size: 26, tilt: 10 },
  { x: 60, y: 140, size: 22, tilt: 8 },
  { x: 262, y: 142, size: 22, tilt: -8 },
];

/** Big cartoon scene that shows at a glance what a category covers. */
export function CategoryArt({
  slug,
  icon,
  className = "",
}: {
  slug: string;
  icon?: string;
  className?: string;
}) {
  const scene = SCENES[slug] ?? {
    ...FALLBACK,
    cast: [icon ?? FALLBACK.cast[0], FALLBACK.cast[1], FALLBACK.cast[2]],
  };
  const id = `sky-${slug}`;
  const [left, centre, right] = [scene.cast[1], scene.cast[0], scene.cast[2]];

  return (
    <svg
      viewBox="0 0 320 170"
      role="img"
      aria-hidden
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={scene.sky[0]} />
          <stop offset="1" stopColor={scene.sky[1]} />
        </linearGradient>
      </defs>
      <rect width="320" height="170" fill={`url(#${id})`} />
      <circle cx="262" cy="-6" r="62" fill="#fff" opacity="0.16" />
      <circle cx="40" cy="190" r="70" fill="#fff" opacity="0.12" />
      <ellipse cx="160" cy="176" rx="190" ry="46" fill="#fff" opacity="0.22" />
      <ellipse cx="160" cy="150" rx="98" ry="12" fill="#000" opacity="0.12" />
      <g
        fontFamily="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif"
        textAnchor="middle"
      >
        {PROP_SPOTS.map((spot, index) => (
          <text
            key={index}
            x={spot.x}
            y={spot.y}
            fontSize={spot.size}
            dominantBaseline="middle"
            transform={`rotate(${spot.tilt} ${spot.x} ${spot.y})`}
            opacity="0.9"
          >
            {scene.props[index]}
          </text>
        ))}
        <text
          x="88"
          y="112"
          fontSize="52"
          dominantBaseline="middle"
          transform="rotate(-6 88 112)"
        >
          {left}
        </text>
        <text
          x="232"
          y="112"
          fontSize="52"
          dominantBaseline="middle"
          transform="rotate(6 232 112)"
        >
          {right}
        </text>
        <text x="160" y="92" fontSize="84" dominantBaseline="middle">
          {centre}
        </text>
      </g>
    </svg>
  );
}
