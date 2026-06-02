import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { Trophy, Target, Users, ArrowRight } from "lucide-react";
import { ScoringInfo } from "@/components/scoring-info";

export default async function Home() {
  const session = await getSession();
  const user = session?.user ?? null;

  const features = [
    {
      icon: Target,
      title: "Spiele tippen",
      desc: "Sag alle Ergebnisse der WM 2026 voraus – von der Gruppenphase bis zum Finale.",
    },
    {
      icon: Trophy,
      title: "Punkte sammeln",
      desc: "3 Punkte für das exakte Ergebnis, 1 Punkt für die richtige Tendenz – so einfach ist das.",
    },
    {
      icon: Users,
      title: "Rangliste",
      desc: "Tritt gegen deine Kollegen an und verfolge live, wer die Nase vorn hat.",
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-background">
      {/* Red accent overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#D40000]/10 dark:from-[#D40000]/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#D40000]/5 dark:from-[#D40000]/10 via-transparent to-transparent" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px),
            linear-gradient(0deg, rgba(0,0,0,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 py-20">
        <div className="max-w-3xl text-center space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[#D40000] animate-pulse" />
            FIFA World Cup 2026
          </div>

          {/* Logo/Emblem */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="text-7xl sm:text-8xl">🏆</div>
              <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#D40000] text-xs sm:text-sm font-bold text-white shadow-lg">
                26
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground">
              WM Tippspiel{" "}
              <span className="bg-gradient-to-r from-red-400 via-[#D40000] to-red-700 bg-clip-text text-transparent">
                2026
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Das offizielle Tippspiel der Sparkasse Engen-Gottmadingen – tippe mit, sammle Punkte und werde
              Tippkönig!
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link href="/matches">
                <Button
                  size="lg"
                  className="h-12 px-8 text-base gap-2 bg-[#D40000] hover:bg-[#B00000] text-white shadow-lg shadow-[#D40000]/25"
                >
                  Zu den Spielen
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login?mode=register">
                  <Button
                    size="lg"
                    className="h-12 px-8 text-base gap-2 bg-[#D40000] hover:bg-[#B00000] text-white shadow-lg shadow-[#D40000]/25"
                  >
                    Jetzt registrieren
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-8 text-base"
                  >
                    Anmelden
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-4 max-w-md mx-auto">
            {[
              { label: "Teams", value: "48" },
              { label: "Spiele", value: "104" },
              { label: "Stadien", value: "16" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature cards */}
        <div className="w-full max-w-4xl mt-20 sm:mt-28 px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative rounded-xl border border-border bg-card p-6 backdrop-blur-sm transition-all hover:bg-accent hover:border-border"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#D40000]/10 text-[#D40000]">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scoring info */}
        <div className="mt-8 sm:mt-12 flex items-center justify-center">
          <ScoringInfo direction="up" />
        </div>

        {/* Footer */}
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-xs text-muted-foreground">
            Mit Nutzung erklärst du dich mit den{" "}
            <Link
              href="/terms"
              className="text-[#D40000] hover:text-[#B00000] underline underline-offset-2 transition-colors font-medium"
            >
              Teilnahmebedingungen
            </Link>{" "}
            einverstanden.
          </p>
        </div>
      </div>
    </div>
  );
}
