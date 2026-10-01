import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Polityka prywatności" };

export default async function Privacy() {
  const s = await getSettings();
  return (
    <LegalPage title="Polityka prywatności" s={s}>
      <h2>1. Administrator danych</h2>
      <p>
        Administratorem danych osobowych jest {s.sellerName}, {s.sellerAddress}. Kontakt w sprawach danych: {s.sellerEmail}.
      </p>
      <h2>2. Jakie dane i po co</h2>
      <ol>
        <li>
          Zamówienie: e-mail, imię, dane do rachunku/faktury — w celu zawarcia i wykonania umowy (art. 6 ust. 1 lit. b RODO) oraz
          wypełnienia obowiązków księgowych (art. 6 ust. 1 lit. c RODO).
        </li>
        <li>Bezpłatny fragment: e-mail — w celu wysłania fragmentu na Twoje żądanie (art. 6 ust. 1 lit. b RODO).</li>
        <li>Informacje o aktualizacjach i nowych poradnikach: e-mail — wyłącznie za Twoją zgodą (art. 6 ust. 1 lit. a RODO).</li>
        <li>Obsługa reklamacji i dochodzenie roszczeń — prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO).</li>
      </ol>
      <h2>3. Statystyki bez cookies</h2>
      <p>
        Do statystyk odwiedzin używamy własnego, anonimowego mechanizmu. Nie zapisujemy na Twoim urządzeniu plików cookies analitycznych ani
        nie korzystamy z zewnętrznych narzędzi śledzących. Odwiedzającego rozpoznajemy przez jednokierunkowy skrót adresu IP i przeglądarki,
        który zmienia się codziennie i nie pozwala ustalić tożsamości ani odtworzyć adresu IP.
      </p>
      <h2>4. Pliki cookies</h2>
      <p>
        Używamy wyłącznie cookies niezbędnych: <b>ref</b> (30 dni) — zapamiętuje, z czyjego polecenia trafiłeś na stronę, aby rozliczyć
        prowizję partnera; <b>admin_session</b> — sesja panelu administracyjnego.
      </p>
      <h2>5. Odbiorcy danych</h2>
      <p>
        Operator płatności, dostawca poczty e-mail, dostawca hostingu oraz biuro rachunkowe — wyłącznie w zakresie niezbędnym do realizacji
        usług.
      </p>
      <h2>6. Okres przechowywania</h2>
      <p>
        Dane zamówień — przez okres wymagany przepisami podatkowymi (5 lat od końca roku podatkowego). Dane marketingowe — do wycofania zgody.
      </p>
      <h2>7. Twoje prawa</h2>
      <p>
        Masz prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia, sprzeciwu oraz wycofania zgody w
        dowolnym momencie. Przysługuje Ci skarga do Prezesa UODO.
      </p>
    </LegalPage>
  );
}
