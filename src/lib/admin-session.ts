import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

/**
 * Session check for every /api/admin/* handler. src/middleware.ts gates these routes too, but
 * Next's docs say middleware must not be the only line of defence, so each handler re-checks
 * close to the data. Usage, as the first line of a handler:
 *
 *   const denied = await requireAdminSession();
 *   if (denied) return denied;
 *
 * Every signed-in user is an admin today: the `Role` column exists but is not used yet.
 */
export async function requireAdminSession(): Promise<NextResponse | null> {
  let signedIn = false;
  try {
    const session = await getServerSession(authOptions);
    signedIn = Boolean(session?.user);
  } catch (err) {
    console.error("[admin-session] session lookup failed:", err);
  }
  return signedIn ? null : NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
}
