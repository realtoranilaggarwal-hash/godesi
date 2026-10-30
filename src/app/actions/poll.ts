"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { uniqueViolation } from "@/lib/actions";
import { awardPoints } from "@/lib/rewardsQueries";
import { pollState, type PollState } from "@/lib/poll";

export type VoteResult =
  | { ok: true; state: PollState; awarded: number }
  | { ok: false; error: string };

export async function votePollAction(
  questionId: string,
  choice: number,
): Promise<VoteResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to vote" };

  const question = await db.pollQuestion.findUnique({
    where: { id: questionId },
  });
  if (!question || choice < 0 || choice >= question.options.length) {
    return { ok: false, error: "That option is gone" };
  }

  try {
    await db.pollVote.create({
      data: { questionId, userId: user.id, choice },
    });
  } catch (error) {
    if (!uniqueViolation(error)) throw error;
  }

  await awardPoints({
    userId: user.id,
    reason: "DAILY_POLL",
    points: 5,
    note: "Voted in today's question",
    key: `poll:${questionId}`,
  });

  return { ok: true, state: await pollState(user.id), awarded: 5 };
}
