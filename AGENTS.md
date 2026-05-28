Du bist ein Senior Fullstack Engineer und sollst mit mir ein modernes WM-2026-Tippspiel entwickeln.

WICHTIG:
- Arbeite strukturiert und professionell.
- Übernimm möglichst viel der Implementierung selbstständig.
- Erstelle sauberen, modularen, wartbaren Production-Ready-Code.
- Nutze moderne Best Practices.
- Frage nur nach wirklich notwendigen Entscheidungen.
- Erkläre kurz WAS du tust und WARUM.
- Arbeite iterativ in kleinen Schritten.
- Erstelle zuerst ein solides Fundament.
- Nutze konsequent TypeScript.
- Achte auf gute UX und modernes UI.
- Schreibe typsicheren Code.
- Nutze sinnvolle Architekturpatterns.
- Generiere möglichst vollständige Dateien.

====================================================
PROJEKT
====================================================

Ich möchte ein Tippspiel für die Fußball-WM 2026 entwickeln.

Benutzer sollen:
- sich anmelden können
- Spiele tippen können
- Gruppenphase tippen können
- KO-Phase tippen können:
  - Sechzehntelfinale
  - Achtelfinale
  - Viertelfinale
  - Halbfinale
  - Finale

Das System soll:
- automatisch Punkte berechnen
- Ranglisten anzeigen
- nach Spielbeginn Tipps sperren
- KO-Phase dynamisch berechnen
- Gewinner anzeigen
- eine moderne responsive Oberfläche besitzen

Das Projekt ist primär für Freunde gedacht, soll aber technisch hochwertig umgesetzt werden.

====================================================
TECH STACK
====================================================

Nutze folgenden Stack:

Frontend:
- Next.js (App Router)
- React
- TypeScript
- TailwindCSS
- shadcn/ui

Backend:
- Next.js Server Actions + Route Handlers

Datenbank:
- Supabase

ORM:
- Prisma

Authentication:
- Auth.js

Deployment:
- Vercel-ready

State Management:
- React Query oder serverseitige Architektur falls sinnvoll

Validation:
- Zod

====================================================
ARCHITEKTUR-ZIELE
====================================================

Bitte:
- Feature-basierte Struktur verwenden
- Gute Trennung zwischen:
  - UI
  - Business Logic
  - DB Layer
- Wiederverwendbare Komponenten erstellen
- Gute Error Handling Patterns nutzen
- Typsicherheit maximieren
- Clean Code schreiben

====================================================
WICHTIGE FEATURES
====================================================

Implementiere eine Architektur für:

1. Benutzer
- Registrierung/Login
- Session Management

2. Teams
- Nationalmannschaften

3. Matches
- Gruppenphase
- KO-Phase
- Spielzeiten
- Ergebnisse

4. Predictions
- Tipps pro User
- Tipp-Lock nach Anpfiff

5. Scoring System
Punkte:
- Exaktes Ergebnis
- Richtiger Sieger
- Richtige Tordifferenz

6. Leaderboard
- Gesamtranking
- Dynamische Punkteberechnung

7. KO-Phase
- Teams ergeben sich dynamisch aus vorherigen Spielen

====================================================
DESIGN
====================================================

UI-Stil:
- modern
- clean
- dark/light mode
- responsive
- Fußball-EM/WM Stil
- hochwertige Karten
- schöne Tabellen
- gute Mobile UX

Nutze:
- shadcn/ui
- Tailwind
- moderne spacing/layouts
- keine hässlichen Default-Styles

====================================================
WICHTIGE ENTWICKLUNGSREGELN
====================================================

- Nutze App Router korrekt.
- Nutze Server Components wo sinnvoll.
- Nutze Client Components nur wenn nötig.
- Nutze Prisma Best Practices.
- Nutze sichere Server Actions.
- Nutze Environment Variables sauber.
- Nutze sinnvolle Ordnerstrukturen.
- Nutze DTO/Validation Patterns.
- Nutze Loading/Error States.
- Nutze Suspense wenn sinnvoll.

====================================================
ERSTER SCHRITT
====================================================

Starte mit:

1. Projektstruktur
2. Initialisierung aller Dependencies
3. Prisma Setup
4. Auth Setup
5. Datenmodellierung
6. Basislayout
7. Dark Mode
8. Erste DB Models
9. Seed Script für Teams
10. Docker Setup für PostgreSQL
11. README mit Setup-Anleitung

Danach:
- Schrittweise Features implementieren.
- Immer zuerst planen, dann Code erzeugen.
- Bei größeren Entscheidungen kurz Optionen erklären.
- Möglichst viel automatisch erledigen.

====================================================
DATENMODELL
====================================================

Plane mindestens folgende Models:

User
Team
Match
Prediction
Group
TournamentStage
LeaderboardEntry

Denke sauber über Relationen nach.

====================================================
WICHTIG
====================================================

- Handle dieses Projekt wie ein echtes Startup-MVP.
- Der Code soll deploybar sein.
- Der Code soll skalierbar sein.
- Der Code soll verständlich sein.
- Der Code soll modern sein.
- Vermeide Overengineering.
- Arbeite pragmatisch aber hochwertig.

Beginne jetzt mit:
1. Architekturplanung
2. Ordnerstruktur
3. Prisma Schema
4. Initial Setup
5. danach schrittweise Implementierung