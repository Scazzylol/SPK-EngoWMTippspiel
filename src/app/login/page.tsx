"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SparkasseLogo } from "@/components/sparkasse-logo";

function sanitizeUsername(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_.]/g, "").slice(0, 30);
}

const errorTranslations: Record<string, string> = {
  "Invalid username or password": "Name oder Passwort falsch",
  "Username is already taken. Please try another.": "Name bereits vergeben",
  "Username is already taken": "Name bereits vergeben",
  "Username is too short": "Name zu kurz (mind. 3 Zeichen)",
  "Username is too long": "Name zu lang (max. 30 Zeichen)",
  "Username is invalid": "Ungültiger Name (nur Buchstaben, Zahlen, _ und .)",
  "Password too short": "Passwort zu kurz (mind. 8 Zeichen)",
  "Password too long": "Passwort zu lang",
  "User already exists. Use another email.": "Benutzer existiert bereits",
  "Failed to create user": "Fehler bei der Registrierung",
  "Failed to create session": "Fehler beim Einloggen",
  "Invalid email": "Ungültige Email",
};

function translateError(err: any): string {
  if (!err) return "";
  const msg = err.message || (typeof err === "string" ? err : "");
  const detail = err.code || err.status || "";
  const translated = errorTranslations[msg];
  if (translated) return translated;
  if (msg) return msg;
  return `Fehler ${detail ? `(${detail})` : ""}`.trim() || "Etwas ist schiefgelaufen";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "register");
  const [rawUsername, setRawUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const username = sanitizeUsername(rawUsername);

  useEffect(() => {
    setIsLogin(searchParams.get("mode") !== "register");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isLogin && username.length < 3) {
      setError("Der Name muss mindestens 3 Zeichen lang sein");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const result = await authClient.signIn.username({ username, password });
        if (result?.data) {
          router.push("/matches");
          router.refresh();
        } else {
          setError(result?.error ? JSON.stringify(result.error).slice(0, 200) : "Unbekannter Fehler");
        }
      } else {
        const placeholderEmail = `${username}@wmtippspiel.app`;
        const result = await authClient.signUp.email({
          email: placeholderEmail,
          password,
          name: username,
          username,
          callbackURL: "/matches",
        });
        if (result?.data) {
          router.push("/matches");
          router.refresh();
        } else {
          setError(result?.error ? JSON.stringify(result.error).slice(0, 200) : "Unbekannter Fehler");
        }
      }
    } catch (err: any) {
      setError(err?.message || JSON.stringify(err).slice(0, 200) || "Unbekannter Fehler");
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

        {/* Card */}
        <Card className="border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.03] backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-center text-zinc-900 dark:text-white">
              {isLogin ? "Anmelden" : "Registrieren"}
            </CardTitle>
            <CardDescription className="text-center text-zinc-500 dark:text-zinc-400">
              {isLogin
                ? "Gib deinen Namen und dein Passwort ein"
                : "Erstelle einen neuen Account für das Tippspiel"}
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
                {!isLogin && rawUsername !== username && (
                  <p className="text-xs text-zinc-500">
                    Wird als &quot;{username}&quot; registriert
                  </p>
                )}
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
                {loading ? "Bitte warten..." : isLogin ? "Einloggen" : "Registrieren"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  const next = !isLogin;
                  setIsLogin(next);
                  router.replace(next ? "/login" : "/login?mode=register");
                }}
                className="text-sm text-zinc-500 hover:text-[#D40000] transition-colors"
              >
                {isLogin
                  ? "Noch keinen Account? "
                  : "Bereits einen Account? "}
                <span className="font-medium underline underline-offset-4">
                  {isLogin ? "Registrieren" : "Einloggen"}
                </span>
              </button>
            </div>
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
