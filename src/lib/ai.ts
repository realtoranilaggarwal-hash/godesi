/**
 * Thin Gemini client. Uses the REST endpoint directly so the app keeps zero
 * extra dependencies, and stays disabled (no chat UI) until GEMINI_API_KEY is set.
 */
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

export const AI_MODEL = process.env.GEMINI_MODEL ?? "gemini-flash-latest";

export function aiEnabled() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export type ChatTurn = { role: "user" | "assistant"; content: string };

export async function askGemini({
  system,
  turns,
}: {
  system: string;
  turns: ChatTurn[];
}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");

  const res = await fetch(
    `${ENDPOINT}/${AI_MODEL}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: turns.map((turn) => ({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.content }],
        })),
        generationConfig: { temperature: 0.3, maxOutputTokens: 700 },
      }),
    },
  );

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Gemini ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    candidates?: {
      content?: { parts?: { text?: string; thought?: boolean }[] };
    }[];
  };
  const text = data.candidates?.[0]?.content?.parts
    ?.filter((part) => !part.thought)
    .map((part) => part.text ?? "")
    .join("")
    .trim();
  return text || "";
}
