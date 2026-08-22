import { headers } from "next/headers";

/** Phones, not tablets: a phone never has room for the desktop-only side rails. */
const PHONE = /iphone|ipod|android.*mobile|windows phone|mobile safari|opera mini/i;

/**
 * True when the request comes from a phone. The side rails are hidden by CSS
 * below lg, but hidden markup still ships, mounts and polls — on a phone that
 * meant a live map, a chat poll, banner impressions and ad iframes nobody could
 * see. Skipping the render server-side keeps phones light.
 */
export function isPhoneRequest() {
  try {
    return PHONE.test(headers().get("user-agent") ?? "");
  } catch {
    return false;
  }
}
