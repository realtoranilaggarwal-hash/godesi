/** Anil's Temu affiliate picks for people setting up a radio, podcast or streaming station. */
const GEAR = [
  {
    name: "PUPGSIS XLR/USB podcast microphone with boom arm, mute button and reverb",
    price: "35.91",
    href: "https://temu.to/k/pw3th8vym12",
  },
  {
    name: "RGB USB condenser microphone for PC and Mac with tap-to-mute and gain knob",
    price: "21.61",
    href: "https://temu.to/k/pcwcfkhrho9",
  },
  {
    name: "Podcast equipment bundle for 2: audio interface, voice changer and condenser mics",
    price: "16.44",
    href: "https://temu.to/k/pk42qorz18k",
  },
  {
    name: "Professional XLR dynamic handheld microphone for live shows and podcasts",
    price: "15.51",
    href: "https://temu.to/k/p7be90thdrx",
  },
  {
    name: "Magnetic wireless lavalier mic with AI noise reduction and charging case",
    price: "15.41",
    href: "https://temu.to/k/pi31vk1wcv3",
  },
  {
    name: "10-pack colored self-adhesive soundproof panels (5.91 in, 9 mm)",
    price: "13.13",
    href: "https://temu.to/k/pkp1uqklet3",
  },
  {
    name: "Completely wireless magnetic lapel mic with noise cancellation",
    price: "8.92",
    href: "https://temu.to/k/pv4brrxxxae",
  },
  {
    name: "Wireless lapel microphone with AI noise reduction for interviews and vlogs",
    price: "7.47",
    href: "https://temu.to/k/p39eadygwhp",
  },
];

export function TemuStudioGear() {
  return (
    <section className="space-y-3 rounded-2xl border border-orange-300 bg-orange-50 p-4">
      <p className="flex items-center justify-between gap-2">
        <span className="font-bold text-orange-900">
          🎙️ Microphones and studio gear on Temu
        </span>
        <span className="shrink-0 text-[10px] uppercase tracking-wide text-slate-500">
          Ad · paid links
        </span>
      </p>
      <p className="text-sm text-slate-700">
        Starting a station, podcast or live show? Mics and sound panels to get
        you on air.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {GEAR.map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer sponsored nofollow"
            className="flex items-center justify-between gap-3 rounded-xl border border-orange-200 bg-white p-3 text-sm hover:border-orange-400"
          >
            <span className="min-w-0 text-slate-800">{item.name}</span>
            <span className="shrink-0 text-right">
              <span className="block font-black text-orange-700">
                ${item.price}
              </span>
              <span className="block text-[10px] text-slate-500">
                coupon price
              </span>
            </span>
          </a>
        ))}
      </div>
      <p className="text-[11px] text-slate-500">
        Prices were the Temu coupon prices when posted and may change. GoDesi
        may earn a commission when you buy through these links, at no extra
        cost to you. T&amp;Cs apply.
      </p>
    </section>
  );
}
