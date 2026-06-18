"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SparkasseLogo } from "@/components/sparkasse-logo";

const errorTranslations: Record<string, string> = {
  "Invalid username or password": "Name oder Passwort falsch",
  "Failed to create session": "Fehler beim Einloggen",
};

function translateError(err: any): string {
  if (!err) return "";
  const msg = err.message || (typeof err === "string" ? err : "");
  return errorTranslations[msg] || msg || "Etwas ist schiefgelaufen";
}

function LoginForm() {
  const router = useRouter();
  const [rawUsername, setRawUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const username = rawUsername.replace(/[^a-zA-Z0-9_.]/g, "").slice(0, 30);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authClient.signIn.username({ username, password });
      if (result?.data) {
        router.push("/matches");
        router.refresh();
      } else {
        setError(translateError(result?.error));
      }
    } catch (err: any) {
      setError(err.message || "Etwas ist schiefgelaufen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D40000]/3 via-transparent to-transparent dark:from-[#D40000]/10" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D40000] text-white text-3xl shadow-lg shadow-[#D40000]/25">
            ⚽
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">WM Tippspiel 2026</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Sparkasse Engen-Gottmadingen
            </p>
          </div>
        </div>

        {/* Registration closed notice */}
        <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-5 py-4 text-center">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
            Die Registrierung ist geschlossen
          </p>
        </div>

        {/* Card */}
        <Card className="border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.03] backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-center text-zinc-900 dark:text-white">
              Anmelden
            </CardTitle>
            <CardDescription className="text-center text-zinc-500 dark:text-zinc-400">
              Gib deinen Namen und dein Passwort ein
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Dein Name"
                  value={rawUsername}
                  onChange={(e) => setRawUsername(e.target.value)}
                  required
                  minLength={3}
                  spellCheck={false}
                  autoCapitalize="off"
                  className="h-11 bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-[#D40000] focus:ring-[#D40000]/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Passwort (min. 8 Zeichen)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-11 bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-[#D40000] focus:ring-[#D40000]/30"
                />
              </div>
              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-300">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-11 bg-[#D40000] hover:bg-[#B00000] text-white font-medium"
                disabled={loading}
              >
                {loading ? "Bitte warten..." : "Einloggen"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sparkasse branding */}
        <div className="flex flex-col items-center gap-2 pt-4">
          <SparkasseLogo className="h-5 w-auto opacity-40 dark:opacity-30" />
          <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center">
            Das interne Tippspiel der Sparkasse Engen-Gottmadingen
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-950" />
        <div className="relative z-10 flex items-center gap-3 text-zinc-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-600 dark:border-t-zinc-300" />
          Lade...
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
