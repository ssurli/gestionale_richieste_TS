/**
 * Dichiarazione di accessibilità (obbligo L. 4/2004 per la PA).
 *
 * ATTENZIONE: bozza tecnica da completare e validare con il referente
 * accessibilità dell'AUSL prima della pubblicazione. La dichiarazione
 * ufficiale va redatta e pubblicata tramite il modello AgID
 * (form.agid.gov.it) e collegata qui e dal footer.
 */

export const metadata = {
  title: 'Dichiarazione di accessibilità',
};

export default function AccessibilitaPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 prose prose-sm">
      <h1 className="text-2xl font-bold mb-4">Dichiarazione di accessibilità</h1>

      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
        Bozza tecnica. La dichiarazione ufficiale deve essere generata con il
        modello AgID e validata dal referente accessibilità dell&apos;Azienda
        prima della pubblicazione.
      </p>

      <h2 className="text-lg font-semibold mt-6">Stato di conformità</h2>
      <p>
        L&apos;applicazione &quot;Gestionale Tecnologie Sanitarie&quot; è in
        corso di adeguamento alle Linee guida sull&apos;accessibilità degli
        strumenti informatici (WCAG 2.1 livello AA, ex L. 4/2004 e
        D.Lgs. 106/2018). Al momento la conformità è <strong>parziale</strong>.
      </p>

      <h2 className="text-lg font-semibold mt-6">Contenuti non accessibili</h2>
      <ul>
        <li>
          Alcuni campi dei moduli di richiesta non hanno ancora
          l&apos;etichetta associata a livello programmatico: adeguamento in
          corso.
        </li>
        <li>
          La verifica del contrasto colore su tutti gli stati/track è in corso.
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6">
        Modalità di invio delle segnalazioni
      </h2>
      <p>
        Per segnalare casi di mancata accessibilità è possibile contattare il
        referente aziendale (recapito da inserire). In caso di risposta
        insoddisfacente è possibile rivolgersi al Difensore civico per il
        digitale presso AgID.
      </p>

      <p className="text-xs text-gray-500 mt-8">
        Ultimo aggiornamento: bozza tecnica generata durante l&apos;adeguamento.
      </p>
    </main>
  );
}
