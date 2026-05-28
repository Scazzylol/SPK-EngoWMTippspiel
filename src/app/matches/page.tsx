import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import MatchList from "@/components/match-list";

export default async function MatchesPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/get-session`,
    {
      headers: { Cookie: `better-auth.session_token=${sessionToken}` },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!data?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Spiele & Tipps</h1>
      <MatchList userId={data.user.id} />
    </div>
  );
}
