import { requestGeo } from "@/lib/geo";

/** Open-Meteo WMO codes, grouped into the states worth an icon. */
function weatherIcon(code: number) {
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 85 && code <= 86) return "🌨️";
  if (code >= 95) return "⛈️";
  return "🌡️";
}

type Reading = { temperature: number; code: number };

async function readWeather(
  latitude: number,
  longitude: number,
  fahrenheit: boolean,
): Promise<Reading | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(2)}` +
    `&longitude=${longitude.toFixed(2)}&current=temperature_2m,weather_code` +
    `&temperature_unit=${fahrenheit ? "fahrenheit" : "celsius"}`;

  try {
    const response = await fetch(url, { next: { revalidate: 1800 } });
    if (!response.ok) return null;

    const body: unknown = await response.json();
    if (typeof body !== "object" || body === null) return null;

    const current = (body as { current?: unknown }).current;
    if (typeof current !== "object" || current === null) return null;

    const temperature = (current as { temperature_2m?: unknown })
      .temperature_2m;
    const code = (current as { weather_code?: unknown }).weather_code;
    if (typeof temperature !== "number" || typeof code !== "number") return null;

    return { temperature, code };
  } catch {
    // The weather is decoration: never let it break the header.
    return null;
  }
}

/**
 * Live temperature for wherever the visitor is, from the edge's own geo
 * headers — no browser permission prompt, and nothing shown if we can't tell.
 */
export async function LocalWeather({ className = "" }: { className?: string }) {
  const geo = requestGeo();
  if (geo.latitude === null || geo.longitude === null) return null;

  const fahrenheit = geo.country === "US";
  const reading = await readWeather(geo.latitude, geo.longitude, fahrenheit);
  if (!reading) return null;

  return (
    <span
      className={`flex items-center gap-1 text-xs font-semibold text-white/85 ${className}`}
      title={`Current weather${geo.city ? ` in ${geo.city}` : ""}`}
    >
      <span aria-hidden>{weatherIcon(reading.code)}</span>
      {Math.round(reading.temperature)}°{fahrenheit ? "F" : "C"}
      {geo.city ? <span className="hidden sm:inline">· {geo.city}</span> : null}
    </span>
  );
}
