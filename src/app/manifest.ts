import type { MetadataRoute } from "next";

/** Lets members install Godesi (and their card) to a phone's home screen — the "app" without the App Store. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GoDesi",
    short_name: "GoDesi",
    description:
      "Desi community directory — digital business cards, events, deals and news.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#e11d48",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
