import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        {/* Back link */}
        <Link href="/">
          <Button
            variant="ghost"
            className="mb-8 gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white -ml-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Button>
        </Link>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-2">
              Teilnahmebedingungen
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Stand: Juni 2026
            </p>
          </div>

          <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6 text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mt-10">
              1. Allgemeines
            </h2>
            <p>
              Dieses Tippspiel wird im privaten Kreis unter Kollegen und Bekannten der Sparkasse
              Engen-Gottmadingen veranstaltet. Die Teilnahme ist freiwillig und erfolgt ausschließlich
              zu Unterhaltungszwecken. Es handelt sich nicht um ein Glücksspiel im Sinne des
              Glücksspielstaatsvertrags (GlüStV). Es wird kein Einsatz in Form von Geld oder
              geldwerten Leistungen verlangt.
            </p>

            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mt-10">
              2. Teilnahmeberechtigung
            </h2>
            <p>
              Teilnahmeberechtigt ist, wer eine gültige Registrierung auf der Plattform
              vorgenommen hat. Die Registrierung erfolgt mit selbstgewähltem Benutzernamen und
              Passwort. Die Weitergabe des eigenen Accounts an Dritte ist nicht gestattet.
              Jeder Teilnehmer darf nur einen Account besitzen. Der Veranstalter behält sich vor,
              Teilnehmer bei Verstoß gegen diese Regeln auszuschließen.
            </p>

            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mt-10">
              3. Spielablauf
            </h2>
            <p>
              Die Teilnehmer sagen die Ergebnisse der Spiele der FIFA Fußball-Weltmeisterschaft 2026
              voraus. Getippt wird in folgenden Phasen:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Gruppenphase (Vorrunde)</li>
              <li>Sechzehntelfinale</li>
              <li>Achtelfinale</li>
              <li>Viertelfinale</li>
              <li>Halbfinale</li>
              <li>Spiel um Platz 3</li>
              <li>Finale</li>
            </ul>
            <p>
              Die Teilnahme an den Tipps für die K.O.-Runde ist erst möglich, nachdem die
              teilnehmenden Mannschaften feststehen. Tipps können bis zum Anpfiff des jeweiligen
              Spiels abgegeben oder geändert werden. Nach Anpfiff ist der Tipp für dieses Spiel
              gesperrt.
            </p>

            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mt-10">
              4. Punktevergabe
            </h2>
            <p>Die Punkte werden wie folgt vergeben:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>5 Punkte: Exaktes Ergebnis (Torverhältnis stimmt genau)</li>
              <li>3 Punkte: Richtige Tordifferenz bei richtigem Sieger</li>
              <li>2 Punkte: Richtiger Sieger (oder Unentschieden) bei falscher Differenz</li>
              <li>0 Punkte: Falscher Sieger oder falsche Tendenz</li>
            </ul>
            <p>
              Bei Spielen, die in der K.O.-Phase nach Verlängerung oder Elfmeterschießen
              entschieden werden, zählt für die Tippabgabe der Endstand nach Verlängerung
              (nicht das Elfmeterschießen). Ein Tipp auf Unentschieden in der K.O.-Phase gilt
              daher als der Tipp auf den Sieger nach Elfmeterschießen – dies wird gesondert
              gekennzeichnet.
            </p>

            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mt-10">
              5. Rangliste
            </h2>
            <p>
              Die Rangliste wird automatisch auf Basis der erzielten Punkte berechnet und ist
              für alle Teilnehmer einsehbar. Bei Punktgleichstand entscheidet die höhere Anzahl
              an exakt getippten Ergebnissen, danach die höhere Anzahl an richtigen Tordifferenzen.
              Der Veranstalter ist von der Teilnahme am Tippspiel ausgeschlossen, um
              Interessenkonflikte zu vermeiden.
            </p>

            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mt-10">
              6. Preise
            </h2>
            <p>
              Die Vergabe von Preisen wird zu gegebener Zeit durch den Veranstalter bekannt
              gegeben. Es besteht kein rechtlicher Anspruch auf einen Preis. Die Platzierungen
              werden nach Abschluss des Finales amtlich bekanntgegeben.
            </p>

            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mt-10">
              7. Haftungsausschluss
            </h2>
            <p>
              Der Veranstalter haftet nicht für technische Ausfälle, Datenverluste oder
              sonstige Störungen der Plattform. Die Teilnahme erfolgt auf eigene Gefahr.
              Eine Haftung für die Richtigkeit der Spieldaten und Ergebnisse wird nicht
              übernommen. Der Veranstalter behält sich das Recht vor, das Tippspiel jederzeit
              zu ändern, zu unterbrechen oder abzusagen.
            </p>

            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mt-10">
              8. Datenschutz
            </h2>
            <p>
              Für die Teilnahme ist die Angabe eines Benutzernamens und Passworts erforderlich.
              Die Angabe einer E-Mail-Adresse ist nicht notwendig, kann aber zur
              Account-Wiederherstellung genutzt werden. Die Daten werden ausschließlich für den
              Betrieb des Tippspiels verwendet und nicht an Dritte weitergegeben. Jeder
              Teilnehmer kann die Löschung seines Accounts und der zugehörigen Daten jederzeit
              per Nachricht an den Veranstalter beantragen. Die Verarbeitung erfolgt auf Basis
              des berechtigten Interesses gemäß Art. 6 Abs. 1 lit. f DSGVO.
            </p>

            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mt-10">
              9. Schlussbestimmungen
            </h2>
            <p>
              Sollte eine Bestimmung dieser Teilnahmebedingungen unwirksam sein, bleibt die
              Gültigkeit der übrigen Bestimmungen unberührt. Der Veranstalter behält sich das
              Recht vor, diese Bedingungen jederzeit mit Wirkung für die Zukunft zu ändern.
              Es gilt das Recht der Bundesrepublik Deutschland.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
