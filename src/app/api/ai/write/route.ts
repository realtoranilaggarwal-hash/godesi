import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { aiEnabled, askGemini } from "@/lib/ai";
import { WRITE_KINDS, writeBrief, type WriteKind } from "@/lib/writeHelper";

/** Drafts a description (or photo brief) for whatever the member is posting. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (!aiEnabled()) {
    return NextResponse.json({ error: "AI drafting is off." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as {
    kind?: string;
    context?: Record<string, string>;
  } | null;
  const kind = (body?.kind ?? "business") as WriteKind;
  if (!WRITE_KINDS.includes(kind)) {
    return NextResponse.json({ error: "Unknown draft type." }, { status: 400 });
  }

  const brief = writeBrief(kind, body?.context ?? {});

  try {
    const text = await askGemini({
      system:
        "You write short, warm, concrete marketing copy for a South Asian community " +
        "marketplace. Plain English, no emojis, no headings, no markdown, no invented " +
        "awards, prices, years in business or certifications. Never promise results.",
      turns: [{ role: "user", content: brief }],
    });
    return NextResponse.json({ text: text.trim() });
  } catch {
    return NextResponse.json(
      { error: "Could not draft that right now — please try again." },
      { status: 502 },
    );
  }
}
