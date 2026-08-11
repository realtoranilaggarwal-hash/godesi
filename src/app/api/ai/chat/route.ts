import { NextResponse } from "next/server";
import { z } from "zod";
import { aiEnabled, askGemini, type ChatTurn } from "@/lib/ai";
import { ASSISTANT_SYSTEM_PROMPT, buildContext } from "@/lib/assistant";

export const dynamic = "force-dynamic";

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(1000),
      }),
    )
    .min(1)
    .max(12),
});

/** Cheap per-IP throttle so a stranger cannot burn the API quota. */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 30;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  if (!aiEnabled()) {
    return NextResponse.json({ error: "Assistant is not configured." }, { status: 503 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many questions for now — please try again later." },
      { status: 429 },
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const turns = parsed.data.messages as ChatTurn[];
  const question = [...turns].reverse().find((turn) => turn.role === "user")?.content ?? "";
  const { context, sources } = await buildContext(question);

  const grounded: ChatTurn[] = turns.map((turn, index) =>
    index === turns.length - 1 && turn.role === "user"
      ? { ...turn, content: `GODESI DATA:\n${context}\n\nVISITOR: ${turn.content}` }
      : turn,
  );

  try {
    const reply = await askGemini({ system: ASSISTANT_SYSTEM_PROMPT, turns: grounded });
    if (!reply) {
      return NextResponse.json(
        { error: "The assistant had nothing to say — try rephrasing." },
        { status: 502 },
      );
    }
    return NextResponse.json({ reply, sources });
  } catch (error) {
    console.error("assistant failed", error);
    // Gemini's own quota rejection reads as a wait, not a broken feature.
    if (error instanceof Error && error.message.startsWith("Gemini 429")) {
      return NextResponse.json(
        { error: "The assistant is busy right now — please try again in a few minutes." },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: "The assistant is unavailable right now." },
      { status: 502 },
    );
  }
}
