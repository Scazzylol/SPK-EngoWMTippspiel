import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cookies } from "next/headers";

export default async function Navbar() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;
  let user = null;

  if (sessionToken) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/get-session`,
        {
          headers: { Cookie: `better-auth.session_token=${sessionToken}` },
          cache: "no-store",
        }
      );
      const data = await response.json();
      if (response.ok && data?.user) {
        user = data.user;
      }
    } catch {
      // ignore fetch errors, treat as logged out
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800 dark:bg-black/95">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          ⚽ WM Tippspiel 2026
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/matches"
                className="text-sm font-medium transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
              >
                Spiele
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {user.name}
              </span>
              <form
                action={async () => {
                  "use server";
                  const c = await cookies();
                  const token = c.get("better-auth.session_token")?.value;
                  if (token) {
                    await fetch(
                      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/sign-out`,
                      {
                        method: "POST",
                        headers: {
                          Cookie: `better-auth.session_token=${token}`,
                        },
                      }
                    );
                  }
                  // Delete cookie on client by setting expired date
                  c.set("better-auth.session_token", "", {
                    expires: new Date(0),
                    path: "/",
                  });
                  const { redirect } = await import("next/navigation");
                  redirect("/login");
                }}
              >
                <Button variant="outline" size="sm" type="submit">
                  Ausloggen
                </Button>
              </form>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Einloggen</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
