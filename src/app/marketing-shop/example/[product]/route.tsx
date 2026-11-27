import type { ReactNode } from "react";
import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { siteUrl } from "@/lib/format";
import { findMarketingProduct } from "@/lib/marketingShop";
import { logoDataUrl } from "@/lib/qrBrand";

/** Product-photo-style mockups of each Marketing Shop item, branded with the GoDesi logo and a live QR. */

const PORTRAIT = { width: 600, height: 750 };
const LANDSCAPE = { width: 750, height: 600 };
const INDIGO = "#1e1b4b";
const ORANGE = "#f97316";
const ROSE = "#e11d48";
const BACKGROUND = "linear-gradient(135deg, #f97316 0%, #e11d48 50%, #312e81 100%)";
const SHADOW = "0 24px 48px rgba(15, 10, 40, 0.45)";

type Art = { logo: string | null; qr: string };
type Mockup = { size: { width: number; height: number }; render: (art: Art) => ReactNode };

function Logo({ src, size }: { src: string | null; size: number }) {
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  return <img src={src} width={size} height={size} style={{ borderRadius: size * 0.12 }} />;
}

function Qr({ src, size, pad = 8, radius = 12 }: { src: string; size: number; pad?: number; radius?: number }) {
  return (
    <div style={{ display: "flex", background: "#ffffff", padding: pad, borderRadius: radius }}>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img src={src} width={size} height={size} />
    </div>
  );
}

function Brand({ size, color = INDIGO }: { size: number; color?: string }) {
  return (
    <div style={{ display: "flex", fontSize: size, fontWeight: 800, color, letterSpacing: 0.5 }}>
      GoDesi.com
    </div>
  );
}

function Scene({ size, label, children }: { size: { width: number; height: number }; label: string; children: ReactNode }) {
  return (
    <div
      style={{
        ...size,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: BACKGROUND,
        fontFamily: "sans-serif",
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          bottom: 14,
          right: 18,
          display: "flex",
          fontSize: 16,
          color: "rgba(255,255,255,0.85)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

const MOCKUPS: Record<string, Mockup> = {
  "triangle-flags": {
    size: PORTRAIT,
    render: ({ logo, qr }) => (
      <div style={{ display: "flex", position: "relative", width: 600, height: 700 }}>
        <svg width="600" height="700" viewBox="0 0 600 700" style={{ position: "absolute", left: 0, top: 0 }}>
          <path d="M-10 70 Q 300 130 610 70" fill="none" stroke="#f5f5f4" strokeWidth="5" />
          <polygon points="-60,82 50,92 -5,330" fill="#312e81" stroke="#ffffff" strokeWidth="6" />
          <polygon points="550,92 660,82 605,330" fill="#fb923c" stroke="#ffffff" strokeWidth="6" />
          <polygon points="60,100 540,100 300,690" fill="#ffffff" stroke={ORANGE} strokeWidth="10" strokeLinejoin="round" />
          <circle cx="78" cy="102" r="10" fill="#d6d3d1" stroke="#78716c" strokeWidth="3" />
          <circle cx="522" cy="102" r="10" fill="#d6d3d1" stroke="#78716c" strokeWidth="3" />
        </svg>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 128,
            width: 600,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Logo src={logo} size={96} />
          <Brand size={36} />
          <div style={{ display: "flex", marginTop: 8 }}>
            <Qr src={qr} size={150} pad={6} />
          </div>
          <div style={{ display: "flex", fontSize: 16, color: ROSE, marginTop: 4 }}>Scan me</div>
        </div>
      </div>
    ),
  },

  "car-sticker": {
    size: LANDSCAPE,
    render: ({ logo, qr }) => (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: 660,
          height: 500,
          borderRadius: 40,
          background: "linear-gradient(180deg, #f1f5f9 0%, #cbd5e1 55%, #94a3b8 100%)",
          boxShadow: SHADOW,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 30,
            top: 24,
            width: 600,
            height: 110,
            borderRadius: "60px 24px 8px 8px",
            background: "linear-gradient(160deg, #334155 0%, #0f172a 70%)",
          }}
        />
        <div style={{ position: "absolute", left: 0, top: 160, width: 660, height: 3, background: "#64748b" }} />
        <div
          style={{
            position: "absolute",
            right: 52,
            top: 186,
            width: 96,
            height: 22,
            borderRadius: 11,
            background: "linear-gradient(180deg, #e2e8f0, #64748b)",
            boxShadow: "0 3px 6px rgba(0,0,0,0.35)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            width: 280,
            height: 280,
            marginTop: 120,
            marginRight: 90,
            borderRadius: 36,
            background: "#ffffff",
            border: `8px solid ${ORANGE}`,
            boxShadow: "0 6px 14px rgba(0,0,0,0.3)",
            transform: "rotate(-4deg)",
          }}
        >
          <Logo src={logo} size={72} />
          <Brand size={26} />
          <Qr src={qr} size={130} pad={4} />
        </div>
      </div>
    ),
  },

  "wall-banner": {
    size: LANDSCAPE,
    render: ({ logo, qr }) => (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", width: 680, height: 500 }}>
        <svg width="680" height="60" viewBox="0 0 680 60">
          <line x1="40" y1="0" x2="42" y2="60" stroke="#f5f5f4" strokeWidth="3" />
          <line x1="640" y1="0" x2="638" y2="60" stroke="#f5f5f4" strokeWidth="3" />
        </svg>
        <div
          style={{
            display: "flex",
            position: "relative",
            width: 640,
            height: 420,
            background: "#ffffff",
            boxShadow: SHADOW,
            border: `10px solid ${INDIGO}`,
            alignItems: "center",
            justifyContent: "space-around",
            padding: "0 30px",
          }}
        >
          {[
            [6, 6],
            [296, 6],
            [592, 6],
            [6, 368],
            [296, 368],
            [592, 368],
          ].map(([left, top]) => (
            <div
              key={`${left}-${top}`}
              style={{
                position: "absolute",
                left,
                top,
                width: 22,
                height: 22,
                borderRadius: 11,
                background: "#ffffff",
                border: "6px solid #a8a29e",
              }}
            />
          ))}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Logo src={logo} size={170} />
            <Brand size={46} />
            <div style={{ display: "flex", fontSize: 22, color: ROSE }}>Find · Connect · Grow</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Qr src={qr} size={210} pad={8} />
            <div style={{ display: "flex", fontSize: 20, color: INDIGO }}>Scan to visit us</div>
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              width: 620,
              height: 18,
              background: `linear-gradient(90deg, ${ORANGE}, ${ROSE}, #312e81)`,
            }}
          />
        </div>
      </div>
    ),
  },

  "rollup-banner-stand": {
    size: PORTRAIT,
    render: ({ logo, qr }) => (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", width: 330, height: 14, borderRadius: 7, background: "linear-gradient(180deg, #f8fafc, #94a3b8)" }} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 300,
            height: 570,
            background: "linear-gradient(180deg, #ffffff 0%, #ffffff 70%, #ffedd5 100%)",
            boxShadow: SHADOW,
            paddingTop: 34,
            gap: 10,
          }}
        >
          <Logo src={logo} size={150} />
          <Brand size={38} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: 18, color: ROSE }}>
            <div style={{ display: "flex" }}>Business · Events · Deals</div>
          </div>
          <div style={{ display: "flex", marginTop: 14 }}>
            <Qr src={qr} size={180} pad={8} />
          </div>
          <div style={{ display: "flex", fontSize: 18, color: INDIGO }}>Scan to visit us</div>
        </div>
        <div
          style={{
            display: "flex",
            width: 370,
            height: 38,
            borderRadius: "10px 10px 6px 6px",
            background: "linear-gradient(180deg, #e2e8f0 0%, #94a3b8 60%, #475569 100%)",
            boxShadow: "0 10px 18px rgba(0,0,0,0.4)",
          }}
        />
        <div style={{ display: "flex", width: 370, justifyContent: "space-between", padding: "0 30px" }}>
          <div style={{ display: "flex", width: 40, height: 8, borderRadius: 4, background: "#334155" }} />
          <div style={{ display: "flex", width: 40, height: 8, borderRadius: 4, background: "#334155" }} />
        </div>
      </div>
    ),
  },

  "vertical-flags": {
    size: PORTRAIT,
    render: ({ logo, qr }) => (
      <div style={{ display: "flex", position: "relative", width: 600, height: 720 }}>
        <svg width="600" height="720" viewBox="0 0 600 720" style={{ position: "absolute", left: 0, top: 0 }}>
          <path d="M180 690 L180 40 Q 180 20 200 22 Q 420 40 430 170 L 430 640 L 186 640 Z" fill="#ffffff" stroke={ORANGE} strokeWidth="8" strokeLinejoin="round" />
          <rect x="172" y="20" width="12" height="680" rx="6" fill="#d4d4d8" stroke="#52525b" strokeWidth="2" />
          <path d="M126 712 L178 692 L230 712" fill="none" stroke="#3f3f46" strokeWidth="10" strokeLinecap="round" />
        </svg>
        <div
          style={{
            position: "absolute",
            left: 190,
            top: 120,
            width: 236,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Logo src={logo} size={130} />
          <Brand size={30} />
          <div style={{ display: "flex", fontSize: 18, color: ROSE }}>Open today</div>
          <div style={{ display: "flex", marginTop: 26 }}>
            <Qr src={qr} size={170} pad={6} />
          </div>
          <div style={{ display: "flex", fontSize: 16, color: INDIGO }}>Scan to visit</div>
        </div>
      </div>
    ),
  },

  "qr-stickers": {
    size: LANDSCAPE,
    render: ({ qr }) => (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignContent: "center",
          gap: 18,
          width: 660,
          height: 500,
          borderRadius: 18,
          background: "#f5f5f4",
          boxShadow: SHADOW,
          padding: 24,
        }}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 134,
              height: 134,
              borderRadius: 67,
              background: `linear-gradient(135deg, ${ORANGE}, ${ROSE} 55%, #312e81)`,
              boxShadow: i === 5 ? "0 10px 18px rgba(0,0,0,0.35)" : "0 1px 3px rgba(0,0,0,0.25)",
              ...(i === 5 ? { transform: "rotate(-12deg) translate(6px, -8px)" } : {}),
            }}
          >
            <div style={{ display: "flex", fontSize: 13, color: "#ffffff", marginBottom: 3 }}>GoDesi.com</div>
            <Qr src={qr} size={62} pad={3} radius={6} />
            <div style={{ display: "flex", fontSize: 11, color: "#ffffff", marginTop: 3 }}>Scan me</div>
          </div>
        ))}
      </div>
    ),
  },

  "a5-flyers": {
    size: PORTRAIT,
    render: ({ logo, qr }) => (
      <div style={{ display: "flex", position: "relative", width: 440, height: 620 }}>
        <div
          style={{
            position: "absolute",
            left: 34,
            top: 14,
            width: 400,
            height: 580,
            borderRadius: 10,
            background: "#e7e5e4",
            transform: "rotate(5deg)",
            boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 10,
            top: 20,
            width: 400,
            height: 580,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 10,
            background: "#ffffff",
            transform: "rotate(-3deg)",
            boxShadow: SHADOW,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 400,
              padding: "26px 0 20px",
              background: `linear-gradient(135deg, #312e81, ${ROSE})`,
              gap: 8,
            }}
          >
            <div style={{ display: "flex", background: "#ffffff", borderRadius: 20, padding: 6 }}>
              <Logo src={logo} size={96} />
            </div>
            <Brand size={34} color="#ffffff" />
          </div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 32, color: INDIGO }}>Grow your business</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 8, fontSize: 18, color: "#57534e", gap: 2 }}>
            <div style={{ display: "flex" }}>Free listing · Events · Deals</div>
            <div style={{ display: "flex" }}>Reach desi customers near you</div>
          </div>
          <div style={{ display: "flex", marginTop: 16 }}>
            <Qr src={qr} size={150} pad={6} />
          </div>
          <div style={{ display: "flex", marginTop: 8, fontSize: 18, color: ROSE }}>Scan to join free</div>
        </div>
      </div>
    ),
  },

  "qr-keychains": {
    size: PORTRAIT,
    render: ({ logo, qr }) => (
      <div style={{ display: "flex", position: "relative", width: 600, height: 720, justifyContent: "center" }}>
        <div
          style={{
            position: "absolute",
            left: 130,
            top: 140,
            width: 340,
            height: 520,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 48,
            background: "rgba(255,255,255,0.96)",
            border: "8px solid rgba(255,255,255,0.55)",
            boxShadow: SHADOW,
            paddingTop: 84,
            gap: 8,
          }}
        >
          <Logo src={logo} size={130} />
          <Brand size={34} />
          <div style={{ display: "flex", marginTop: 10 }}>
            <Qr src={qr} size={170} pad={6} />
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 276,
            top: 160,
            width: 48,
            height: 48,
            borderRadius: 24,
            background: "linear-gradient(135deg, #f97316, #e11d48)",
            border: "4px solid #d6d3d1",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 230,
            top: 20,
            width: 140,
            height: 140,
            borderRadius: 70,
            border: "12px solid #cbd5e1",
            boxShadow: "0 4px 8px rgba(0,0,0,0.35), inset 0 2px 4px rgba(0,0,0,0.3)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 290,
            top: 140,
            width: 20,
            height: 46,
            borderRadius: 10,
            border: "6px solid #94a3b8",
          }}
        />
      </div>
    ),
  },

  "printed-pens": {
    size: LANDSCAPE,
    render: ({ logo, qr }) => (
      <div style={{ display: "flex", position: "relative", width: 750, height: 600 }}>
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 150,
            display: "flex",
            alignItems: "center",
            transform: "rotate(-14deg)",
          }}
        >
          <svg width="70" height="64" viewBox="0 0 70 64">
            <polygon points="70,0 70,64 6,34 6,30" fill="#d4d4d8" />
            <polygon points="10,30 0,32 10,34" fill="#18181b" />
          </svg>
          <div style={{ display: "flex", width: 90, height: 64, background: "linear-gradient(180deg, #a1a1aa, #3f3f46)" }} />
          <div
            style={{
              display: "flex",
              position: "relative",
              alignItems: "center",
              gap: 14,
              width: 440,
              height: 72,
              padding: "0 18px",
              borderRadius: "6px 36px 36px 6px",
              background: "linear-gradient(180deg, #ffffff 0%, #f5f5f4 55%, #d6d3d1 100%)",
              boxShadow: "0 14px 22px rgba(0,0,0,0.35)",
            }}
          >
            <Logo src={logo} size={52} />
            <Brand size={30} />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img src={qr} width={54} height={54} />
            <div
              style={{
                position: "absolute",
                right: 40,
                top: -26,
                width: 170,
                height: 22,
                borderRadius: "11px 4px 4px 11px",
                background: "linear-gradient(180deg, #f8fafc, #94a3b8)",
                boxShadow: "0 3px 5px rgba(0,0,0,0.3)",
              }}
            />
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            right: 40,
            bottom: 40,
            width: 250,
            height: 250,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 125,
            background: "#ffffff",
            border: "8px solid #e2e8f0",
            boxShadow: SHADOW,
            gap: 4,
          }}
        >
          <div style={{ display: "flex", fontSize: 16, color: "#78716c" }}>Close-up</div>
          <Qr src={qr} size={140} pad={6} />
          <Brand size={20} />
        </div>
      </div>
    ),
  },

  "bamboo-pens": {
    size: LANDSCAPE,
    render: ({ logo, qr }) => (
      <div style={{ display: "flex", position: "relative", width: 750, height: 600 }}>
        <div
          style={{
            position: "absolute",
            left: 330,
            top: 250,
            width: 320,
            height: 260,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            borderRadius: 16,
            background: "linear-gradient(160deg, #e7d3b0, #c8a774)",
            boxShadow: SHADOW,
            transform: "rotate(4deg)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Logo src={logo} size={90} />
            <div style={{ display: "flex", fontSize: 20, color: "#5b3a1a" }}>GoDesi.com</div>
          </div>
          <Qr src={qr} size={130} pad={5} radius={8} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 120,
            display: "flex",
            alignItems: "center",
            transform: "rotate(-10deg)",
          }}
        >
          <svg width="56" height="52" viewBox="0 0 56 52">
            <polygon points="56,2 56,50 6,28 6,24" fill="#d6d3d1" />
            <polygon points="8,24 0,26 8,28" fill="#1c1917" />
          </svg>
          <div
            style={{
              display: "flex",
              position: "relative",
              alignItems: "center",
              width: 520,
              height: 60,
              paddingLeft: 120,
              borderRadius: "4px 30px 30px 4px",
              background: "linear-gradient(180deg, #e9c98f 0%, #d4a35f 45%, #a8743a 100%)",
              boxShadow: "0 14px 22px rgba(0,0,0,0.35)",
            }}
          >
            {[60, 250, 420].map((left) => (
              <div
                key={left}
                style={{ position: "absolute", left, top: 0, width: 6, height: 60, background: "rgba(107, 63, 22, 0.45)" }}
              />
            ))}
            <div
              style={{
                display: "flex",
                fontSize: 30,
                color: "#5b3a1a",
                letterSpacing: 2,
                textShadow: "0 1px 0 rgba(255, 236, 200, 0.8), 0 -1px 0 rgba(60, 30, 5, 0.6)",
              }}
            >
              GoDesi.com
            </div>
            <div
              style={{
                position: "absolute",
                right: 36,
                top: -20,
                width: 150,
                height: 18,
                borderRadius: "9px 3px 3px 9px",
                background: "linear-gradient(180deg, #f8fafc, #94a3b8)",
              }}
            />
          </div>
        </div>
      </div>
    ),
  },

  "nfc-review-stand": {
    size: PORTRAIT,
    render: ({ logo, qr }) => (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 380,
            height: 560,
            borderRadius: "22px 22px 6px 6px",
            background: "#ffffff",
            boxShadow: SHADOW,
            paddingTop: 26,
            gap: 6,
          }}
        >
          <Logo src={logo} size={96} />
          <Brand size={30} />
          <div style={{ display: "flex", gap: 4 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <svg key={i} width="28" height="28" viewBox="0 0 24 24">
                <path d="M12 2l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 18l-6.4 3.6 1.4-7.1-5.3-5 7.2-.9z" fill="#f59e0b" />
              </svg>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 10 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: 120,
                height: 150,
                borderRadius: 18,
                background: `linear-gradient(160deg, #312e81, ${ROSE})`,
                gap: 6,
              }}
            >
              <svg width="70" height="70" viewBox="0 0 24 24">
                <path d="M8.5 7.5a6 6 0 0 1 0 9" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M12 5a9.5 9.5 0 0 1 0 14" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M15.5 2.5a13 13 0 0 1 0 19" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="5.5" cy="12" r="1.6" fill="#ffffff" />
              </svg>
              <div style={{ display: "flex", fontSize: 18, color: "#ffffff" }}>NFC tap</div>
            </div>
            <Qr src={qr} size={150} pad={4} />
          </div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 28, color: INDIGO }}>Tap or scan to review</div>
          <div style={{ display: "flex", fontSize: 16, color: "#78716c" }}>Google · Instagram · Facebook</div>
        </div>
        <svg width="440" height="60" viewBox="0 0 440 60">
          <polygon points="20,0 420,0 440,46 0,46" fill="rgba(226,232,240,0.85)" stroke="#ffffff" strokeWidth="2" />
          <ellipse cx="220" cy="54" rx="200" ry="6" fill="rgba(0,0,0,0.3)" />
        </svg>
      </div>
    ),
  },

  "rainbow-backdrop": {
    size: LANDSCAPE,
    render: ({ logo, qr }) => (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", width: 680, height: 16, borderRadius: 8, background: "linear-gradient(180deg, #f8fafc, #78716c)" }} />
        <div
          style={{
            display: "flex",
            position: "relative",
            width: 640,
            height: 470,
            background: "#fff7ed",
            boxShadow: SHADOW,
            overflow: "hidden",
            justifyContent: "center",
          }}
        >
          <svg width="640" height="470" viewBox="0 0 640 470" style={{ position: "absolute", left: 0, top: 0 }}>
            {["#ef4444", "#f97316", "#facc15", "#22c55e", "#3b82f6", "#8b5cf6"].map((color, i) => (
              <path key={color} d={`M ${40 + i * 30} 470 A ${280 - i * 30} ${280 - i * 30} 0 0 1 ${600 - i * 30} 470`} fill="none" stroke={color} strokeWidth="30" />
            ))}
          </svg>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 40, gap: 4 }}>
            <div style={{ display: "flex", fontSize: 44, color: ROSE }}>Happy Birthday!</div>
            <Brand size={24} />
          </div>
          <div style={{ position: "absolute", left: 250, top: 300, display: "flex" }}>
            <Logo src={logo} size={140} />
          </div>
          <div style={{ position: "absolute", right: 16, bottom: 16, display: "flex" }}>
            <Qr src={qr} size={110} pad={5} />
          </div>
        </div>
      </div>
    ),
  },
};

export async function GET(_request: Request, { params }: { params: { product: string } }) {
  const mockup = MOCKUPS[params.product];
  const product = findMarketingProduct(params.product);
  if (!mockup || !product) return new Response("Not found", { status: 404 });

  const [qr, logo] = await Promise.all([
    // High error correction so it still scans when printed small.
    QRCode.toDataURL(`${siteUrl()}/?src=shop-example`, {
      width: 600,
      margin: 1,
      errorCorrectionLevel: "H",
      color: { dark: INDIGO, light: "#ffffff" },
    }),
    logoDataUrl(),
  ]);

  const image = new ImageResponse(
    <Scene size={mockup.size} label={`Example · ${product.name}`}>
      {mockup.render({ logo, qr })}
    </Scene>,
    mockup.size,
  );
  const headers = new Headers(image.headers);
  headers.set("Content-Disposition", `inline; filename="godesi-${params.product}-example.png"`);
  headers.set("Cache-Control", "public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400");
  return new Response(image.body, { status: 200, headers });
}
