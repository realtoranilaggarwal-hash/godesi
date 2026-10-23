/** Builds a vCard 3.0 file for the digital business card's "Save contact" button. */

const esc = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\r?\n/g, "\\n");

export function vCard({
  name,
  phone,
  email,
  website,
  cardUrl,
  address,
  note,
}: {
  name: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  /** The public GoDesi card page, saved as a second URL on the contact. */
  cardUrl: string;
  address?: string | null;
  note?: string | null;
}) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${esc(name)}`,
    `N:${esc(name)};;;;`,
  ];
  if (phone) lines.push(`TEL;TYPE=CELL,VOICE:${esc(phone)}`);
  if (email) lines.push(`EMAIL;TYPE=INTERNET:${esc(email)}`);
  if (website) lines.push(`URL:${esc(website)}`);
  lines.push(`URL;type=GoDesi:${esc(cardUrl)}`);
  if (address) lines.push(`ADR;TYPE=WORK:;;${esc(address)};;;;`);
  if (note) lines.push(`NOTE:${esc(note)}`);
  lines.push("END:VCARD");
  return `${lines.join("\r\n")}\r\n`;
}
