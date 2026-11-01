"""Draws the GoDesi course covers (vdorental ebook style) into public/images/courses/<slug>.jpg.

Run from the repo root: python3 scripts/make-course-covers.py
Needs node (npx tsx), google-chrome and ImageMagick `convert`.
"""
import html, json, pathlib, shutil, subprocess, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
W, H = 1200, 900

COURSES = json.loads(subprocess.check_output(
    ["npx", "tsx", "-e", 'import {COURSES} from "./src/lib/courses"; console.log(JSON.stringify(COURSES))'],
    cwd=ROOT, text=True,
).strip().splitlines()[-1])

ICONS = {
    "house": '<path d="M0 60 L70 0 L140 60 V140 H0Z" fill="#fff" fill-opacity=".95"/><rect x="55" y="85" width="30" height="55" fill="{c}"/><rect x="18" y="72" width="26" height="22" fill="{c}" opacity=".7"/><rect x="96" y="72" width="26" height="22" fill="{c}" opacity=".7"/><rect x="100" y="8" width="16" height="34" fill="#fff"/>',
    "shield": '<path d="M70 0 L140 25 V70 C140 115 105 140 70 150 C35 140 0 115 0 70 V25Z" fill="#fff" fill-opacity=".95"/><path d="M40 75 L62 98 L102 52" stroke="{c}" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    "deed": '<rect x="10" y="0" width="110" height="145" rx="8" fill="#fff" fill-opacity=".95"/><g fill="{c}" opacity=".55"><rect x="28" y="22" width="74" height="8"/><rect x="28" y="42" width="74" height="6"/><rect x="28" y="56" width="60" height="6"/><rect x="28" y="70" width="70" height="6"/></g><circle cx="98" cy="118" r="26" fill="{c}"/><path d="M86 118 L95 127 L111 108" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>',
    "handshake": '<circle cx="70" cy="70" r="70" fill="#fff" fill-opacity=".95"/><path d="M28 40 L70 8 L112 40 V78 H28Z" fill="{c}" opacity=".35"/><rect x="62" y="52" width="16" height="26" fill="{c}" opacity=".6"/><path d="M14 96 L42 76 L66 84 L84 76 L126 96 L100 120 C94 126 86 126 80 120 L70 112 L58 120 C52 124 44 122 40 116 Z" fill="{c}"/><path d="M62 96 L80 112 M54 102 L68 116" stroke="#fff" stroke-width="4" stroke-linecap="round"/>',
    "key": '<circle cx="45" cy="70" r="40" fill="#fff" fill-opacity=".95"/><circle cx="45" cy="70" r="15" fill="{c}"/><rect x="78" y="62" width="62" height="16" fill="#fff" fill-opacity=".95"/><rect x="112" y="78" width="12" height="22" fill="#fff" fill-opacity=".95"/><rect x="128" y="78" width="10" height="16" fill="#fff" fill-opacity=".95"/>',
    "chart": '<rect x="0" y="0" width="140" height="140" rx="16" fill="#fff" fill-opacity=".95"/><g fill="{c}"><rect x="20" y="90" width="20" height="32"/><rect x="50" y="70" width="20" height="52"/><rect x="80" y="48" width="20" height="74"/><rect x="110" y="24" width="14" height="98"/></g><path d="M20 70 L60 44 L88 54 L124 16" stroke="{c}" stroke-width="5" fill="none" opacity=".6"/>',
    "palm": '<circle cx="70" cy="70" r="70" fill="#fff" fill-opacity=".95"/><circle cx="102" cy="38" r="16" fill="#facc15"/><path d="M70 130 C72 100 74 80 70 58" stroke="{c}" stroke-width="8" fill="none"/><path d="M70 58 C50 40 30 44 22 56 M70 58 C88 38 108 42 116 56 M70 58 C62 34 70 22 82 18" stroke="{c}" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="20" y="118" width="100" height="10" rx="5" fill="{c}" opacity=".4"/>',
    "people": '<circle cx="70" cy="70" r="70" fill="#fff" fill-opacity=".95"/><g fill="{c}"><circle cx="45" cy="52" r="15"/><path d="M20 112 a25 25 0 0 1 50 0Z"/><circle cx="95" cy="52" r="15"/><path d="M70 112 a25 25 0 0 1 50 0Z"/><circle cx="70" cy="76" r="10" opacity=".7"/><path d="M54 116 a16 16 0 0 1 32 0Z" opacity=".7"/></g>',
    "building": '<rect x="20" y="0" width="100" height="140" rx="6" fill="#fff" fill-opacity=".95"/><g fill="{c}">' + "".join(f'<rect x="{x}" y="{y}" width="18" height="16" opacity=".7"/>' for y in (16, 44, 72) for x in (36, 61, 86)) + '<rect x="58" y="102" width="24" height="38"/></g>',
    "hammer": '<circle cx="70" cy="70" r="70" fill="#fff" fill-opacity=".95"/><g transform="rotate(-40 70 70)"><rect x="63" y="44" width="14" height="80" rx="5" fill="{c}"/><path d="M36 26 H98 a8 8 0 0 1 8 8 V50 H36 a10 10 0 0 1 -10 -10 V36 a10 10 0 0 1 10 -10Z" fill="{c}"/></g>',
    "megaphone": '<circle cx="70" cy="70" r="70" fill="#fff" fill-opacity=".95"/><path d="M26 58 L92 28 V112 L26 82Z" fill="{c}"/><rect x="18" y="56" width="16" height="28" rx="4" fill="{c}"/><path d="M38 84 L46 112 H60 L54 88" fill="{c}" opacity=".7"/><path d="M104 54 q12 16 0 32 M112 44 q22 26 0 52" stroke="{c}" stroke-width="5" fill="none" stroke-linecap="round"/>',
    "pen": '<circle cx="70" cy="70" r="70" fill="#fff" fill-opacity=".95"/><g transform="rotate(45 70 70)"><rect x="60" y="14" width="20" height="78" rx="4" fill="{c}"/><path d="M60 92 H80 L70 122Z" fill="{c}" opacity=".7"/><rect x="60" y="30" width="20" height="8" fill="#fff" opacity=".6"/></g><path d="M24 118 q20 -10 36 0 t36 0" stroke="{c}" stroke-width="4" fill="none" opacity=".5"/>',
    "link": '<circle cx="70" cy="70" r="70" fill="#fff" fill-opacity=".95"/><g fill="none" stroke="{c}" stroke-width="12" stroke-linecap="round"><path d="M62 82 L44 100 a17 17 0 0 1 -24 -24 L38 58 a17 17 0 0 1 24 0"/><path d="M78 58 L96 40 a17 17 0 0 1 24 24 L102 82 a17 17 0 0 1 -24 0"/><path d="M56 84 L84 56"/></g>',
    "camera": '<rect x="0" y="0" width="140" height="140" rx="36" fill="#fff" fill-opacity=".95"/><rect x="18" y="18" width="104" height="104" rx="28" fill="none" stroke="{c}" stroke-width="10"/><circle cx="70" cy="70" r="24" fill="none" stroke="{c}" stroke-width="10"/><circle cx="102" cy="38" r="7" fill="{c}"/>',
    "play": '<rect x="0" y="18" width="140" height="104" rx="28" fill="#fff" fill-opacity=".95"/><path d="M56 46 L98 70 L56 94Z" fill="{c}"/>',
    "mail": '<rect x="0" y="22" width="140" height="96" rx="10" fill="#fff" fill-opacity=".95"/><path d="M8 32 L70 80 L132 32" stroke="{c}" stroke-width="9" fill="none" stroke-linejoin="round"/><circle cx="118" cy="30" r="18" fill="{c}"/><text x="118" y="37" text-anchor="middle" font-size="20" font-weight="800" fill="#fff" font-family="Helvetica, Arial, sans-serif">1</text>',
    "bag": '<path d="M16 44 H124 L114 140 H26Z" fill="#fff" fill-opacity=".95"/><path d="M46 56 V36 a24 24 0 0 1 48 0 V56" stroke="#fff" stroke-width="10" fill="none"/><path d="M60 78 v34 a12 12 0 1 1 -10 -12 M60 78 q10 12 22 12" stroke="{c}" stroke-width="8" fill="none" stroke-linecap="round"/>',
    "search": '<circle cx="58" cy="58" r="52" fill="#fff" fill-opacity=".95"/><circle cx="58" cy="58" r="30" fill="none" stroke="{c}" stroke-width="10"/><rect x="92" y="84" width="20" height="58" rx="8" transform="rotate(-45 102 113)" fill="#fff" fill-opacity=".95"/>',
    "magnet": '<circle cx="70" cy="70" r="70" fill="#fff" fill-opacity=".95"/><path d="M34 30 V74 a36 36 0 0 0 72 0 V30" stroke="{c}" stroke-width="22" fill="none"/><rect x="23" y="26" width="22" height="18" fill="#fff"/><rect x="95" y="26" width="22" height="18" fill="#fff"/><rect x="23" y="26" width="22" height="18" fill="{c}" opacity=".35"/><rect x="95" y="26" width="22" height="18" fill="{c}" opacity=".35"/>',
    "briefcase": '<rect x="0" y="34" width="140" height="96" rx="12" fill="#fff" fill-opacity=".95"/><path d="M48 34 V22 a8 8 0 0 1 8 -8 H84 a8 8 0 0 1 8 8 V34" stroke="#fff" stroke-width="9" fill="none"/><rect x="0" y="70" width="140" height="8" fill="{c}" opacity=".5"/><rect x="58" y="62" width="24" height="24" rx="4" fill="{c}"/>',
    "card": '<rect x="0" y="20" width="140" height="100" rx="12" fill="#fff" fill-opacity=".95"/><circle cx="38" cy="62" r="18" fill="{c}"/><path d="M14 104 a24 24 0 0 1 48 0Z" fill="{c}"/><g fill="{c}" opacity=".55"><rect x="72" y="46" width="52" height="8"/><rect x="72" y="64" width="40" height="7"/><rect x="72" y="80" width="46" height="7"/></g><path d="M100 4 l5 10 11 2 -8 8 2 11 -10 -5 -10 5 2 -11 -8 -8 11 -2Z" fill="#facc15"/>',
}

STYLE = {  # slug: (icon, color, audience)
    "marketing": ("megaphone", "#db2777", "Online income"),
    "life-insurance": ("shield", "#0d9488", "Insurance"),
    "realtor-income": ("key", "#2563eb", "Real estate"),
    "flipping": ("hammer", "#ea580c", "Real estate investing"),
    "rentals": ("house", "#4f46e5", "Real estate investing"),
    "multifamily": ("building", "#7c3aed", "Real estate investing"),
    "notary-signing": ("deed", "#0891b2", "Side income"),
    "short-term-rentals": ("palm", "#15803d", "Real estate investing"),
    "off-market-deals": ("handshake", "#b45309", "Real estate investing"),
    "online-presence": ("card", "#9333ea", "Marketing"),
    "affiliate-fundamentals": ("link", "#0284c7", "Affiliate income"),
    "affiliate-six-figures": ("chart", "#16a34a", "Affiliate income"),
    "instagram-monetization": ("camera", "#c026d3", "Creator income"),
    "first-blog": ("pen", "#0f766e", "Online income"),
    "content-that-converts": ("magnet", "#d97706", "Marketing"),
    "b2b-saas-affiliate": ("briefcase", "#1d4ed8", "Affiliate income"),
    "seo-affiliate": ("search", "#65a30d", "Affiliate income"),
    "tiktok-shop": ("bag", "#e11d48", "Creator income"),
    "email-list-building": ("mail", "#0369a1", "Online income"),
    "youtube-monetization": ("play", "#dc2626", "Creator income"),
}
DEFAULT_STYLE = ("chart", "#4f46e5", "Online income")


def wrap(text, width):
    lines, cur = [], ""
    for w in text.split():
        if len(cur) + len(w) + 1 > width and cur:
            lines.append(cur)
            cur = w
        else:
            cur = f"{cur} {w}".strip()
    return lines + ([cur] if cur else [])


def skyline():
    xs = [(0, 70, 60), (60, 50, 90), (150, 80, 50), (200, 60, 75), (275, 95, 45), (320, 55, 85), (405, 70, 60),
          (465, 85, 50), (515, 75, 70), (585, 60, 80), (665, 90, 55), (720, 65, 75), (795, 80, 50), (845, 55, 90),
          (935, 95, 55), (990, 60, 75), (1065, 75, 60), (1125, 85, 75)]
    base = H - 70
    return "".join(
        f'<rect x="{x}" y="{base - h}" width="{w}" height="{h + 70}" fill="#000" opacity=".18"/>'
        f'<path d="M{x} {base - h} l{w / 2} -{w / 3} l{w / 2} {w / 3}Z" fill="#000" opacity=".18"/>'
        for x, h, w in xs)


def svg(course):
    icon_name, c, audience = STYLE.get(course["slug"], DEFAULT_STYLE)
    e = html.escape
    title = wrap(course["title"], 22)
    size = 66 if len(title) <= 2 else 56
    ty = 300
    titles = "".join(
        f'<text x="80" y="{ty + i * (size + 10)}" font-size="{size}" font-weight="800" fill="#fff" '
        f'font-family="Georgia, \'Times New Roman\', serif">{e(t)}</text>' for i, t in enumerate(title))
    sy = ty + (len(title) - 1) * (size + 10) + 58
    subs = "".join(
        f'<text x="80" y="{sy + i * 36}" font-size="27" fill="#fff" fill-opacity=".88" '
        f'font-family="Helvetica, Arial, sans-serif">{e(t)}</text>'
        for i, t in enumerate(wrap(course["tagline"], 54)[:3]))
    pill = f"GODESI COURSE · {audience.upper()}"
    icon = ICONS[icon_name].replace("{c}", c)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
<defs><linearGradient id="g" x1="0" y1="0" x2=".7" y2="1"><stop offset="0" stop-color="{c}"/><stop offset="1" stop-color="#0f172a"/></linearGradient>
<radialGradient id="r" cx=".85" cy=".15" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
<rect width="{W}" height="{H}" fill="url(#g)"/><rect width="{W}" height="{H}" fill="url(#r)"/>
<circle cx="1000" cy="250" r="230" fill="#fff" opacity=".06"/><circle cx="140" cy="560" r="120" fill="#fff" opacity=".05"/>
{skyline()}
<rect x="0" y="0" width="26" height="{H}" fill="#000" opacity=".25"/>
<rect x="80" y="150" rx="19" width="{40 + 13.2 * len(pill)}" height="40" fill="#fff" fill-opacity=".18"/>
<text x="100" y="177" font-size="18" font-weight="700" letter-spacing="1.8" fill="#fff" font-family="Helvetica, Arial, sans-serif">{e(pill)}</text>
<g transform="translate(905 170) scale(1.55)">{icon}</g>
{titles}{subs}
<rect x="80" y="676" width="1040" height="2" fill="#fff" opacity=".4"/>
<text x="80" y="720" font-size="30" font-weight="700" fill="#fff" font-family="Helvetica, Arial, sans-serif">Anil Aggarwal</text>
<text x="80" y="752" font-size="20" fill="#fff" fill-opacity=".85" font-family="Helvetica, Arial, sans-serif">Realtor · Broker Manager, Vylla Home · NJ Lic #1753579</text>
<text x="1120" y="738" text-anchor="end" font-size="38" font-weight="800" fill="#fff" font-family="Helvetica, Arial, sans-serif">Go<tspan fill="#fde68a">Desi</tspan>.com</text>
</svg>
'''


def main():
    chrome = shutil.which("google-chrome") or shutil.which("chromium")
    with tempfile.TemporaryDirectory() as tmp:
        for course in COURSES:
            page = pathlib.Path(tmp) / f'{course["slug"]}.html'
            png = pathlib.Path(tmp) / f'{course["slug"]}.png'
            page.write_text(f'<html><body style="margin:0;overflow:hidden">{svg(course)}</body></html>')
            subprocess.run([chrome, "--headless=new", "--no-sandbox", "--hide-scrollbars", f"--window-size={W},{H + 300}",
                            f"--screenshot={png}", page.as_uri()], check=True, capture_output=True)
            out = ROOT / "public" / course["cover"].lstrip("/")
            subprocess.run(["convert", str(png), "-crop", f"{W}x{H}+0+0", "+repage", "-strip", "-quality", "86", str(out)], check=True)
            print(out.relative_to(ROOT))


if __name__ == "__main__":
    main()
