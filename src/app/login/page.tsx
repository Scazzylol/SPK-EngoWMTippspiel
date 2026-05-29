"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function sanitizeUsername(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_.]/g, "").slice(0, 30);
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
          const err = result?.error as any;
          setError(err?.message || err || "Name oder Passwort falsch");
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
          const err = result?.error as any;
          setError(err?.message || "Registrierung fehlgeschlagen");
        }
      }
    } catch (err: any) {
      setError(err.message || "Etwas ist schiefgelaufen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {isLogin ? "Einloggen" : "Registrieren"}
        </CardTitle>
        <CardDescription className="text-center">
          {isLogin
            ? "Gib deinen Namen und dein Passwort ein"
            : "Erstelle einen neuen Account für das Tippspiel"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Name</Label>
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
            />
            {!isLogin && rawUsername !== username && (
              <p className="text-xs text-zinc-500">
                Wird als &quot;{username}&quot; registriert
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Passwort (min. 8 Zeichen)</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Bitte warten..." : isLogin ? "Einloggen" : "Registrieren"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              const next = !isLogin;
              setIsLogin(next);
              router.replace(next ? "/login" : "/login?mode=register");
            }}
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-4"
          >
            {isLogin
              ? "Noch keinen Account? Registrieren"
              : "Bereits einen Account? Einloggen"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <Suspense fallback={<div className="text-zinc-500">Lade...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
