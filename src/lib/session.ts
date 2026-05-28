import { cookies } from "next/headers";
import { auth } from "@/lib/auth";

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;

  if (!sessionToken) return null;

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/get-session`, {
    headers: {
      Cookie: `better-auth.session_token=${sessionToken}`,
    },
    cache: "no-store",
  });

  return response.json();
}
