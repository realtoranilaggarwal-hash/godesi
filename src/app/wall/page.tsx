import { permanentRedirect } from "next/navigation";

/** The wall moved to its forever home at /walloffame. */
export default function WallRedirect() {
  permanentRedirect("/walloffame");
}
