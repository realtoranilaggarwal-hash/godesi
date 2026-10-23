import { AI_MODEL, aiEnabled } from "@/lib/ai";

/**
 * Reads a photographed paper business card with Gemini vision and returns the
 * fields it could pick out. Missing/unreadable fields come back undefined so
 * the member only reviews what was actually found.
 */
export type ScannedCard = {
  name?: string;
  title?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
};

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

const PROMPT = `Read this photo of a paper business card and extract the contact details.
Return ONLY a JSON object with these keys when visible on the card:
{"name": "person or business name", "title": "job title or profession",
"phone": "main phone number with country code if shown",
"whatsapp": "a number only if the card marks it WhatsApp",
"email": "email address", "website": "website URL without scheme if not shown",
"address": "street address", "city": "city", "state": "state"}
Omit keys you cannot read. Do not invent anything.`;

export async function extractCardFields({
  data,
  mimeType,
}: {
  /** Base64-encoded image bytes (no data: prefix). */
  data: string;
  mimeType: string;
}): Promise<ScannedCard> {
  const key = process.env.GEMINI_API_KEY;
  if (!key || !aiEnabled()) throw new Error("Card scanning is not configured");

  const res = await fetch(
    `${ENDPOINT}/${AI_MODEL}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: PROMPT },
              { inline_data: { mime_type: mimeType, data } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 800,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Scanner unavailable (${res.status}): ${detail.slice(0, 160)}`);
  }

  const payload = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!text) throw new Error("Could not read that photo — try a clearer, flatter shot");

  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const pick = (key: keyof ScannedCard) => {
      const value = parsed[key];
      return typeof value === "string" && value.trim() ? value.trim() : undefined;
    };
    return {
      name: pick("name"),
      title: pick("title"),
      phone: pick("phone"),
      whatsapp: pick("whatsapp"),
      email: pick("email"),
      website: pick("website"),
      address: pick("address"),
      city: pick("city"),
      state: pick("state"),
    };
  } catch {
    throw new Error("Could not read that photo — try a clearer, flatter shot");
  }
}
