import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import MatchList from "@/components/match-list";

export default async function MatchesPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Spiele & Tipps</h1>
      <MatchList userId={session.user.id} />
    </div>
  );
}
