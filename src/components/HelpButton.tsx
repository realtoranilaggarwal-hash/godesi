import Image from "next/image";
import { GODESI_HELP_AVATAR, GODESI_HELP_WHATSAPP } from "@/lib/help";

/** Side tab: the GoDesi help girl asking "Need help?", opening GoDesi's WhatsApp channel. */
export function HelpButton() {
  return (
    <a
      href={GODESI_HELP_WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Need help? Chat with GoDesi on WhatsApp"
      className="fixed right-0 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-1 rounded-l-2xl bg-gradient-to-b from-orange-500 to-pink-600 px-1.5 py-2 text-[11px] font-black leading-tight text-white shadow-lg hover:brightness-110 print:hidden"
    >
      <Image
        src={GODESI_HELP_AVATAR}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 rounded-full border-2 border-white object-cover"
      />
      <span className="text-center">
        Need
        <br />
        help?
      </span>
    </a>
  );
}
