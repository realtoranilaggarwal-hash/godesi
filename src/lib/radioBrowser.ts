/**
 * Radio Browser is a free, open directory of public radio stream addresses. We
 * only read its index and hand the broadcaster's own stream URL to the visitor's
 * browser, so Godesi still never hosts or re-streams audio. Radio Garden, the
 * other free option, sends X-Frame-Options: SAMEORIGIN and cannot be embedded.
 */
const API = "https://de1.api.radio-browser.info/json/stations/search";

export type BrowsedStation = {
  id: string;
  name: string;
  place: string;
  tags: string;
  favicon: string | null;
  streamUrl: string;
};

type ApiStation = {
  stationuuid: string;
  name: string;
  url_resolved: string;
  country: string;
  state: string;
  tags: string;
  favicon: string;
  hls: number;
  lastcheckok: number;
  codec: string;
};

export async function searchStations({
  query,
  country,
  limit = 24,
}: {
  query?: string;
  country?: string;
  limit?: number;
}): Promise<BrowsedStation[]> {
  const params = new URLSearchParams({
    limit: String(Math.min(limit, 60)),
    hidebroken: "true",
    order: "clickcount",
    reverse: "true",
  });
  if (query) params.set("name", query);
  if (country) params.set("countrycode", country);
  if (!query && !country) params.set("tag", "indian");

  try {
    const response = await fetch(`${API}?${params.toString()}`, {
      headers: { "user-agent": "Godesi/1.0 (+https://godesi.com)" },
      next: { revalidate: 900 },
    });
    if (!response.ok) return [];
    const rows = (await response.json()) as ApiStation[];

    return rows
      // Plain MP3/AAC streams play in a browser audio element; HLS does not.
      .filter((row) => row.hls === 0 && row.lastcheckok === 1 && row.url_resolved)
      .map((row) => ({
        id: row.stationuuid,
        name: row.name.trim(),
        place: [row.state, row.country].filter(Boolean).join(", "),
        tags: row.tags,
        favicon: row.favicon || null,
        streamUrl: row.url_resolved,
      }));
  } catch {
    return [];
  }
}
