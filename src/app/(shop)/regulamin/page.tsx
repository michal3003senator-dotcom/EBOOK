import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { env } from "@/lib/env";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Regulamin sprzedaży" };

export default async function Terms() {
  const s = await getSettings();
  return (
    <LegalPage title="Regulamin sprzedaży" s={s}>
      <h2>§1. Sprzedawca</h2>
      <p>
        Sprzedawcą jest {s.sellerName}, {s.sellerAddress}
        {s.sellerTaxId && `, NIP ${s.sellerTaxId}`}, prowadzący {s.sellerRegistry}. Kontakt: {s.sellerEmail}. Sklep działa pod adresem {env.APP_URL}.
      </p>
      <h2>§2. Przedmiot sprzedaży</h2>
      <p>
        Przedmiotem sprzedaży są treści cyfrowe w formacie PDF (e-booki) niezapisane na nośniku materialnym. Do korzystania potrzebne jest
        urządzenie z oprogramowaniem do odczytu plików PDF i dostęp do poczty e-mail.
      </p>
      <h2>§3. Zamówienie i płatność</h2>
      <ol>
        <li>Zamówienie składa się przez formularz na stronie, podając adres e-mail i akceptując regulamin.</li>
        <li>Ceny są cenami brutto w złotych polskich. Wiążąca jest cena widoczna w chwili złożenia zamówienia.</li>
        <li>Płatności obsługuje zewnętrzny operator płatności. Umowa zostaje zawarta z chwilą zaksięgowania płatności.</li>
      </ol>
      <h2>§4. Dostarczenie</h2>
      <p>
        Link do pobrania pliku pojawia się na stronie potwierdzenia i jest wysyłany na podany e-mail niezwłocznie po zaksięgowaniu płatności.
        Link ma ograniczony czas ważności i liczbę pobrań; na prośbę wysyłamy nowy. Plik zawiera oznaczenie licencyjne z adresem e-mail
        kupującego. Kupujący otrzymuje bezpłatnie zaktualizowane wydania na adres e-mail podany przy zakupie.
      </p>
      <h2>§5. Licencja</h2>
      <p>
        Kupujący otrzymuje niewyłączną licencję na użytek osobisty. Zabronione jest udostępnianie, odsprzedawanie i publikowanie pliku w
        całości lub w części bez pisemnej zgody autora. Karty oznaczone jako „do screena” można publikować w mediach społecznościowych z
        oznaczeniem źródła.
      </p>
      <h2>§6. Prawo odstąpienia od umowy</h2>
      <p>
        Konsumentowi (oraz przedsiębiorcy na prawach konsumenta) przysługuje prawo odstąpienia od umowy w terminie 14 dni bez podania
        przyczyny. Zgodnie z art. 38 ust. 1 pkt 13 ustawy o prawach konsumenta prawo to nie przysługuje w odniesieniu do treści cyfrowych,
        jeżeli spełnianie świadczenia rozpoczęło się za wyraźną zgodą konsumenta przed upływem terminu do odstąpienia od umowy i po
        poinformowaniu go o utracie prawa odstąpienia. Zgodę tę kupujący wyraża w formularzu zamówienia, a sprzedawca potwierdza ją w
        wiadomości e-mail.
      </p>
      <h2>§7. Reklamacje</h2>
      <p>
        Reklamacje dotyczące zgodności treści cyfrowej z umową (np. uszkodzony plik, brak dostępu) można składać na adres {s.sellerEmail}.
        Odpowiadamy w ciągu 14 dni. W razie uznania reklamacji dostarczymy poprawny plik, a gdy to niemożliwe — zwrócimy płatność.
      </p>
      <h2>§8. Charakter treści</h2>
      <p>
        Publikacja ma charakter edukacyjny. Nie jest poradą prawną, podatkową ani inwestycyjną. Scenariusze modelowe są przykładami
        obliczeniowymi, a nie obietnicą zarobku.
      </p>
      <h2>§9. Pozasądowe rozwiązywanie sporów</h2>
      <p>
        Konsument może skorzystać z pozasądowych sposobów rozpatrywania reklamacji, m.in. za pośrednictwem miejskiego lub powiatowego
        rzecznika konsumentów albo wojewódzkiego inspektoratu Inspekcji Handlowej.
      </p>
      <h2>§10. Program partnerski</h2>
      <p>
        Zasady programu partnerskiego (prowizje za polecenia) opisuje strona /program-partnerski. Udział jest dobrowolny i nie wpływa na
        warunki zakupu.
      </p>
      <h2>§11. Postanowienia końcowe</h2>
      <p>
        W sprawach nieuregulowanych stosuje się przepisy prawa polskiego, w szczególności Kodeksu cywilnego i ustawy o prawach konsumenta.
        Zasady przetwarzania danych opisuje polityka prywatności.
      </p>
    </LegalPage>
  );
}
