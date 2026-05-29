import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { Trophy, Target, Users, ArrowRight } from "lucide-react";

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
      desc: "Für jedes richtige Ergebnis, die richtige Tordifferenz oder den richtigen Sieger gibt's Punkte.",
    },
    {
      icon: Users,
      title: "Rangliste",
      desc: "Tritt gegen deine Kollegen an und verfolge live, wer die Nase vorn hat.",
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#D40000]/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#D40000]/10 via-transparent to-transparent" />

      {/* Football pitch pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(0deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 py-20">
        <div className="max-w-3xl text-center space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-400 backdrop-blur-sm">
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
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white">
              WM Tippspiel{" "}
              <span className="bg-gradient-to-r from-red-300 via-[#D40000] to-red-700 bg-clip-text text-transparent">
                2026
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-400 max-w-xl mx-auto leading-relaxed">
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
                <Link href="/login">
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
                    className="h-12 px-8 text-base border-white/20 text-zinc-300 hover:bg-white/5 hover:text-white"
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
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-xs sm:text-sm text-zinc-500 mt-1">{stat.label}</div>
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
                className="group relative rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-all hover:bg-white/[0.06] hover:border-white/20"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#D40000]/10 text-[#D40000]">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 sm:mt-28 text-center">
          <p className="text-xs text-zinc-600">
            Mit Nutzung erklärst du dich mit den{" "}
            <span className="underline underline-offset-2 cursor-pointer hover:text-zinc-400 transition-colors">
              Teilnahmebedingungen
            </span>{" "}
            einverstanden.
          </p>
        </div>
      </div>
    </div>
  );
}
