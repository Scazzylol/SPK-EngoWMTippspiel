# WM Tippspiel 2026

Ein modernes Tippspiel für die FIFA Fußball-Weltmeisterschaft 2026 – entwickelt mit Next.js, Better-Auth, Prisma und Supabase.

## Features

- **Login/Registrierung** per Username + Passwort (Better-Auth)
- **Gruppenphase tippen** – 12 Gruppen (A–L), 48 Teams, 72 Spiele
- **KO-Phase tippen** – Sechzehntelfinale bis Finale (32 Spiele)
- **Dynamische KO-Berechnung** – inkl. offizieller FIFA-Annex-C-Matrix für die besten Gruppendritten
- **Automatische Punktevergabe** – exaktes Ergebnis (3), Tendenz (1), Advancement-Bonus, Weltmeister-Bonus (+15)
- **Rangliste** – live berechnet, mit Podium und voller Tabelle
- **Tippsperre** – nach Anpfiff automatisch gesperrt (Client + Server)
- **Admin-Panel** – Ergebnisse eintragen, Spiele sperren, KO-Advancement, Weltmeister setzen
- **Dark/Light Mode** – Dark Mode als Default
- **Responsive Design** – optimiert für Desktop und Mobile

## Tech Stack

| Bereich             | Technologie                                          |
| ------------------- | ---------------------------------------------------- |
| Framework           | Next.js 16.2.6 (App Router)                          |
| Sprache             | TypeScript                                           |
| CSS                 | TailwindCSS v4 + shadcn/ui (base-nova)               |
| Authentication      | Better-Auth mit username-Plugin                      |
| ORM (Auth)          | Drizzle ORM (better_auth\_\* Tabellen)               |
| ORM (Game)          | Prisma 7 (Team, Group, Match, Prediction)            |
| Datenbank           | Supabase PostgreSQL (Session Pooler, Port 6543)      |
| Validation          | Zod v4                                               |
| Icons               | lucide-react                                         |
| Theme               | next-themes (dark default)                           |
| Hosting             | Vercel (Hobby) + Supabase Free                       |

## Erste Schritte

### Voraussetzungen

- Node.js 20+
- Supabase Projekt (kostenlos)

### Umgebungsvariablen

`.env.local` anlegen:

```env
DATABASE_URL="postgresql://postgres.<project>:<password>@aws-0-eu-west-1.pooler.supabase.com:6543/postgres"
BETTER_AUTH_SECRET="<geheimer Schlüssel>"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Installation

```bash
npm install
npx prisma generate
npm run db:seed          # 48 Teams + 104 Spiele in die DB laden
npm run dev              # http://localhost:3000
```

### Skripte

| Befehl                               | Beschreibung                     |
| ------------------------------------ | -------------------------------- |
| `npm run dev`                        | Dev-Server starten               |
| `npm run build`                      | Production-Build                 |
| `npm run db:seed`                    | DB mit Teams + Spielen seeden    |
| `node scripts/set-admin.mjs <user>`  | Admin-Rechte vergeben            |
| `node scripts/check-admin.mjs <user>`| Admin-Status prüfen              |
| `node scripts/reset-admin-pw.mjs`    | Admin-Passwort zurücksetzen      |

## Projektstruktur

```
prisma/
├── schema.prisma          # 4 Models + Stage Enum
├── seed.ts                # Seed-Daten (48 Teams, 104 Spiele)
└── migrations/

src/
├── actions/               # Server Actions
│   ├── admin.ts           # Admin-Funktionen
│   ├── auth.ts            # Logout
│   ├── knockout.ts        # KO-Wrapper
│   ├── predictions.ts     # Tipp speichern (Zod-validiert)
│   └── world-champion.ts  # Weltmeister-Tipp
├── app/                   # Next.js App Router
│   ├── layout.tsx         # Root-Layout (Theme, Navbar)
│   ├── page.tsx           # Landing Page
│   ├── admin/             # Admin-Panel
│   ├── api/               # API-Routen
│   ├── leaderboard/       # Rangliste
│   ├── login/             # Login/Register
│   ├── matches/           # Tipp-Seite
│   └── terms/             # AGB
├── components/            # Wiederverwendbare Komponenten
│   ├── ui/                # shadcn/ui Komponenten
│   ├── match-list.tsx     # Tipp-Formular
│   ├── navbar.tsx         # Navigation
│   ├── world-champion-picker.tsx
│   └── ...
├── data/
│   └── fifa-2026-third-place-matrix.json
└── lib/                   # Hilfsfunktionen & Konfiguration
    ├── auth.ts            # Better-Auth Server Instance
    ├── auth-client.ts     # Better-Auth Client
    ├── db-singleton.ts    # SQL Singleton
    ├── knockout.ts        # KO-Berechnungslogik
    ├── scoring.ts         # Punkteberechnung
    ├── session.ts         # Session-Wrapper
    └── ...
```

## API Endpunkte

| Endpoint                   | Beschreibung                     |
| -------------------------- | -------------------------------- |
| `GET /api/matches`         | Alle Spiele mit Team-Infos       |
| `GET /api/predictions`     | Eigene Tipps (oder fremde nach Lock) |
| `GET /api/leaderboard`     | Rangliste (live berechnet)       |
| `GET /api/world-champion`  | WM-Tipp inkl. Sperrstatus        |
| `GET /api/health`          | Health-Check                     |

## Punktesystem

| Ergebnis                          | Punkte |
| --------------------------------- | ------ |
| Exaktes Ergebnis                  | 3      |
| Richtige Tendenz (Sieg/UE/Niederlage) | 1  |
| KO: Advancement richtig getippt   | +1     |
| KO: Advancement + exaktes Ergebnis| +1+2=3 |
| Weltmeister richtig getippt       | +15    |

## Deployment

1. Repository auf Vercel importieren
2. Umgebungsvariablen setzen
3. `npm run db:seed` in der Vercel Shell ausführen (oder via lokalen Seed nach dem ersten Deploy)
4. Admin setzen: `node scripts/set-admin.mjs <username>`

Health-Check: `https://<deine-domain>.vercel.app/api/health`

## Hinweise

- **Datenbank**: Supabase erlaubt nur IPv6 auf der Direct-Connection. Der Session Pooler (Port 6543) zwingend erforderlich.
- **Auth**: Login nur mit Username + Passwort. E-Mail ist ein Platzhalter (`username@wmtippspiel.app`).
- **KO-Berechnung**: Verwendet die offizielle FIFA-Annex-C-Matrix mit 495 möglichen Drittplatzierenden-Kombinationen.
- **Keine Middleware**: Auth-Checks erfolgen in den Komponenten/Server Actions.
- **Testing**: Noch nicht implementiert (manuelle Tests erfolgreich).
