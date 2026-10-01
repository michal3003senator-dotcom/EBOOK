# Faceless Cash-Cow — sklep z e-bookiem

Strona sprzedażowa e-booka „Faceless Cash-Cow 2026” z kasą, dostawą PDF, panelem administracyjnym, statystykami i programem partnerskim.

**Stack:** Next.js 16 (App Router, TypeScript strict), Prisma 7 + SQLite, Tailwind CSS 4. Bez zewnętrznych skryptów śledzących i bez cookies analitycznych.

## Co jest w środku

| Obszar | Funkcje |
| --- | --- |
| Strona sprzedażowa | Treść z e-booka, spis treści ze wszystkimi podrozdziałami, podgląd stron, próbka hooków, plan 30 dni, FAQ, SEO (schema.org Book + FAQ), wersja mobilna z przyciskiem zakupu przyklejonym u dołu ekranu |
| Lead magnet | Bezpłatny fragment (wstęp + rozdział 1) wycinany automatycznie z PDF, wysyłany e-mailem |
| Kasa | Kody rabatowe, rachunek/faktura (NIP), zgody wymagane prawem (regulamin, utrata prawa odstąpienia dla treści cyfrowych), limity prób |
| Płatności | Wspólny interfejs bramek (`src/lib/payments`): tryb testowy + **Stripe** (karta, BLIK, Przelewy24). Webhooki z weryfikacją podpisu i ochroną przed podwójnym przetworzeniem |
| Dostawa | Link z limitem pobrań i datą ważności, **PDF oznaczony e-mailem kupującego na każdej stronie**, e-mail z potwierdzeniem na trwałym nośniku |
| Panel `/admin` | Statystyki, zamówienia (szukanie, filtry, szczegóły ze ścieżką klienta, ponowna wysyłka, nowy link, zwrot, ręczne opłacenie, CSV), klienci (LTV, CSV), leady (CSV), produkt (cena, plik PDF, limity), kody rabatowe, partnerzy z wypłatami, log e-maili, ustawienia, zmiana hasła |
| Statystyki | Przychód, zamówienia, AOV, konwersja, przychód/odwiedzającego, skuteczność płatności, odwiedzający, sesje, odsłony, odrzucenia, czas zaangażowania, leady, porzucone koszyki, zwroty, pobrania, klienci powracający; wykresy dzienne; **lejek sprzedaży**; źródła ruchu i kampanie UTM z przychodem; partnerzy; urządzenia/przeglądarki (w tym in-app TikTok/Instagram)/systemy/kraje/języki; zasięg każdej sekcji strony; głębokość przewijania; kliknięcia CTA; najczęściej otwierane pytania FAQ i rozdziały; mapa ciepła dzień×godzina; Core Web Vitals; aktywność na żywo; porównanie z poprzednim okresem |
| Program partnerski | Link `?ref=KOD` (30 dni), prowizja %, publiczna strona statystyk partnera `/partner/[token]` |

## Uruchomienie lokalne

```bash
cp .env.example .env           # uzupełnij SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run setup                  # baza + konto admina + produkt (+ kopiuje PDF z katalogu projektu)
npm run dev                    # http://localhost:3000, panel: /admin
```

Plik e-booka możesz też wgrać w panelu: **Produkt → Wgraj PDF**. Pliki trzymane są poza `public/` (`storage/`), więc nie da się ich pobrać bez opłaconego linku.

## Podpięcie bramki płatności (Stripe)

1. Załóż konto na stripe.com i zweryfikuj firmę/działalność.
2. W **Settings → Payment methods** włącz BLIK, Przelewy24 i karty.
3. **Developers → API keys**: skopiuj *Secret key* do `STRIPE_SECRET_KEY`.
4. **Developers → Webhooks → Add endpoint**: URL `https://TWOJA-DOMENA/api/webhooks/stripe`, zdarzenia:
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`.
   Skopiuj *Signing secret* do `STRIPE_WEBHOOK_SECRET`.
5. Ustaw `PAYMENT_PROVIDER="stripe"` i zrestartuj aplikację. W panelu → Ustawienia zobaczysz zielone ✓.

Najpierw przetestuj na kluczach testowych (`sk_test_…`), potem podmień na produkcyjne.

**Inna bramka (Przelewy24 bezpośrednio, PayU, Tpay):** dodaj plik w `src/lib/payments/` implementujący interfejs `PaymentProvider` (`createPayment` + `parseWebhook`) i wpisz go w `payments/index.ts`. Reszta sklepu się nie zmienia.

Tryb testowy (`PAYMENT_PROVIDER="mock"`) jest **zablokowany na produkcji**, chyba że ustawisz `ALLOW_MOCK_PAYMENTS="true"`. Nigdy nie włączaj tego na publicznym serwerze.

## E-maile

Ustaw `SMTP_URL` (np. `smtps://user:haslo@smtp.twojadomena.pl:465`) i `MAIL_FROM`. Bez SMTP wiadomości trafiają tylko do logu serwera i do panelu (E-maile).

## Wdrożenie (VPS + Docker, HTTPS automatycznie)

```bash
# na serwerze z Dockerem; domena wskazuje na IP serwera
git clone … && cd EBOOK
cp .env.example .env   # APP_URL=https://sklep.domena.pl, DOMAIN=sklep.domena.pl, NODE_ENV nie ustawiaj
docker compose up -d --build
```

Dane są w katalogach `./data` (baza) i `./storage` (PDF). **Kopia zapasowa = te dwa katalogi** (np. codzienny `tar` + wysyłka poza serwer).

## Przed startem sprzedaży — checklista

- [ ] Panel → Ustawienia: dane sprzedawcy (adres, e-mail, forma działalności) — trafiają do regulaminu i e-maili.
- [ ] Panel → Produkt: cena, plik PDF.
- [ ] Regulamin i polityka prywatności przejrzane przez prawnika/księgowego (to solidny wzór, nie porada prawna).
- [ ] Stripe na kluczach produkcyjnych, webhook zielony.
- [ ] SMTP działa (zrób zamówienie z kodem 100% i sprawdź skrzynkę).
- [ ] Silne hasło admina (min. 12 znaków), losowy `SESSION_SECRET`.
- [ ] **Repozytorium prywatne** — PDF nie może leżeć w publicznym repo.

## Struktura

```
src/app/(shop)       strona sprzedażowa, kasa, status zamówienia, regulamin, panel partnera
src/app/admin        panel administracyjny
src/app/api          analityka, webhooki, eksport CSV, upload PDF, fragment
src/content/ebook.ts treść landing page'a (z e-booka)
src/lib              zamówienia, płatności, analityka, e-maile, PDF, auth
prisma/              schemat bazy i seed
```
