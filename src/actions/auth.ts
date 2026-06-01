"use server";

import { cookies } from "next/headers";

export async function logout() {
  const c = await cookies();
  const token = c.get("better-auth.session_token")?.value;

  if (token) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000";
    await fetch(`${baseUrl}/api/auth/sign-out`, {
      method: "POST",
      headers: { Cookie: `better-auth.session_token=${token}` },
    });
  }

  c.set("better-auth.session_token", "", { expires: new Date(0), path: "/" });
}
