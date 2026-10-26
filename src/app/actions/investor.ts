"use server";

import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/actions";
import { INVESTOR_COOKIE, investorCookie } from "@/lib/investor";

export async function unlockInvestorAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const expected = process.env.INVESTOR_PASSWORD;
  const given = String(formData.get("password") ?? "");
  const ok =
    !!expected &&
    given.length === expected.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  if (!ok)
    return { error: "That password is not right — check it and try again." };
  cookies().set(INVESTOR_COOKIE, investorCookie(), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/investors");
}
