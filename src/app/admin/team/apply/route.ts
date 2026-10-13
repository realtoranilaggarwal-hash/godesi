import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ALL_PERMISSIONS, isStaffPermission } from "@/lib/permissions";

/**
 * Team changes go through a plain form POST rather than a server action: a tab
 * left open across a deploy keeps working instead of silently doing nothing.
 */
export async function POST(request: NextRequest) {
  const back = (query: Record<string, string>) => {
    const url = new URL("/admin/team", request.nextUrl.origin);
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
    return NextResponse.redirect(url, 303);
  };

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(
      new URL("/login?next=/admin/team", request.nextUrl.origin),
      303,
    );
  }
  if (user.role !== "ADMIN") {
    return NextResponse.redirect(
      new URL("/dashboard", request.nextUrl.origin),
      303,
    );
  }

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const id = String(form.get("id") ?? "");
  const permissions = form
    .getAll("permissions")
    .map((value) => String(value))
    .filter(isStaffPermission);

  const member = await db.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!member) {
    return back({ error: "That account no longer exists — search again." });
  }
  const who = member.name ?? member.email ?? "That member";

  if (intent === "revoke") {
    if (member.role !== "MODERATOR") {
      return back({ error: `${who} is not a moderator.` });
    }
    await db.user.update({
      where: { id: member.id },
      data: { role: "BUSINESS", staffPermissions: [] },
    });
    revalidatePath("/admin");
    revalidatePath("/admin/team");
    return back({ done: `${who} no longer has staff access.` });
  }

  if (intent === "permissions") {
    if (member.role !== "MODERATOR") {
      return back({ error: `${who} is not a moderator yet.` });
    }
    await db.user.update({
      where: { id: member.id },
      data: { staffPermissions: permissions },
    });
    revalidatePath("/admin");
    revalidatePath("/admin/team");
    return back({
      done: permissions.length
        ? `Saved — ${who} can manage ${permissions.length} area(s).`
        : `Saved — ${who} has a moderator login but nothing to manage yet.`,
    });
  }

  if (member.role === "ADMIN") {
    return back({ error: `${who} is an admin, which is more than a moderator.` });
  }

  await db.user.update({
    where: { id: member.id },
    data: {
      role: "MODERATOR",
      staffPermissions: permissions.length ? permissions : [...ALL_PERMISSIONS],
    },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/team");
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${member.id}`);
  return back({
    done: `${who} is a moderator now — send her godesi.com/admin/content.`,
  });
}
