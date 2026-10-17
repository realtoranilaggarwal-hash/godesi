/** Cartoon of friends chatting on a charpai under a banyan tree, chai in hand. */
export function VillageChatScene({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 200"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-hidden
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="village-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdba74" />
          <stop offset="1" stopColor="#fde68a" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#village-sky)" />
      <circle cx="262" cy="46" r="22" fill="#fef3c7" opacity="0.9" />
      <path d="M0 150 Q80 130 160 148 T320 140 V200 H0Z" fill="#a3e635" />
      <path d="M0 168 Q90 156 180 170 T320 162 V200 H0Z" fill="#65a30d" />
      <rect x="44" y="70" width="16" height="92" rx="5" fill="#92400e" />
      <ellipse cx="52" cy="58" rx="56" ry="38" fill="#15803d" />
      <ellipse cx="22" cy="74" rx="26" ry="20" fill="#16a34a" />
      <ellipse cx="86" cy="72" rx="28" ry="20" fill="#16a34a" />
      <rect x="96" y="150" width="150" height="10" rx="3" fill="#b45309" />
      <rect x="100" y="158" width="6" height="22" fill="#78350f" />
      <rect x="236" y="158" width="6" height="22" fill="#78350f" />
      <path
        d="M102 152 L240 152 M102 156 L240 156"
        stroke="#fcd34d"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <text x="96" y="148" fontSize="40">
        👳‍♂️
      </text>
      <text x="142" y="148" fontSize="40">
        👵
      </text>
      <text x="188" y="148" fontSize="40">
        🧔
      </text>
      <text x="252" y="176" fontSize="26">
        🐄
      </text>
      <text x="138" y="182" fontSize="16">
        ☕
      </text>
      <text x="180" y="182" fontSize="16">
        ☕
      </text>
      <g fontFamily="sans-serif" fontWeight="700">
        <rect x="86" y="18" width="78" height="26" rx="13" fill="#fff" />
        <path d="M112 44 L118 54 L124 44Z" fill="#fff" />
        <text x="96" y="35" fontSize="12" fill="#9a3412">
          Kya haal? 👋
        </text>
        <rect x="178" y="44" width="96" height="26" rx="13" fill="#fff" />
        <path d="M206 70 L210 82 L218 70Z" fill="#fff" />
        <text x="186" y="61" fontSize="12" fill="#9d174d">
          Cricket dekha? 🏏
        </text>
        <rect x="118" y="78" width="52" height="22" rx="11" fill="#fff" />
        <path d="M150 100 L156 108 L160 100Z" fill="#fff" />
        <text x="128" y="93" fontSize="12" fill="#3730a3">
          Haha 😂
        </text>
      </g>
    </svg>
  );
}
