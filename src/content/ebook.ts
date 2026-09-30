/** Treść strony sprzedażowej — w całości oparta na e-booku „Faceless Cash-Cow 2026” (wyd. 1.1). */

export const book = {
  title: "Faceless Cash-Cow",
  edition: "Wydanie 2026 · wersja 1.1 · stan wiedzy: wrzesień 2026",
  headline: "Viralowe wideo bez pokazywania twarzy",
  lead: "Kompletny system krok po kroku: od pierwszego hooka do pierwszej prowizji. Bez kamery, bez drogiego sprzętu i zgodnie z polskim prawem.",
  platforms: "TikTok · Instagram Reels · YouTube Shorts",
  author: "Michał Florczak",
};

export const facts = [
  { value: "123", label: "strony praktycznej instrukcji" },
  { value: "13", label: "rozdziałów + 4 dodatki" },
  { value: "60", label: "gotowych hooków w 10 formułach" },
  { value: "10", label: "promptów na cały cykl pracy" },
];

export const marketStats = [
  { value: "51,5%", label: "polskich internautów korzysta z TikToka", source: "Gemius/PBI, 2026" },
  { value: "88 min", label: "dziennie spędza w nim przeciętny użytkownik", source: "Gemius/PBI, 2026" },
  { value: "+11,5%", label: "wzrost zasięgu reklamowego r/r", source: "DataReportal, 2026" },
];

export const pains = [
  "Blokuje Cię kamera, światło i strach przed komentarzem znajomego z liceum.",
  "Po ośmiu godzinach pracy nie masz siły codziennie wymyślać, nagrywać i montować.",
  "Kursy obiecują „pasywny dochód w tydzień”, a Ty nie wiesz, co z tego jest prawdą.",
  "Nie wiesz, jak zarabiać, skoro program wynagrodzeń TikToka nie działa w Polsce.",
];

export const benefits = [
  {
    title: "Skalowalność",
    text: "Nie masz jednej twarzy, która się męczy, choruje i jedzie na urlop. Masz proces — ten sam obsłuży trzy konta w trzech niszach.",
  },
  {
    title: "Aktywo, a nie etat",
    text: "Profil zbudowany wokół tematu, a nie osoby, możesz oddać komuś w zarządzanie albo wykorzystać jako kanał sprzedaży własnego produktu.",
  },
  {
    title: "Niski próg wejścia",
    text: "Telefon, darmowa aplikacja do montażu i generator głosu za kilka dolarów miesięcznie. Tyle kosztuje cała linia produkcyjna.",
  },
];

export const pipeline = [
  { step: "Nisza", ch: "rozdz. 3" },
  { step: "Skrypt", ch: "rozdz. 6", key: true },
  { step: "Głos", ch: "rozdz. 5" },
  { step: "Obraz", ch: "rozdz. 4" },
  { step: "Montaż", ch: "rozdz. 7" },
  { step: "Publikacja", ch: "rozdz. 8" },
  { step: "Analiza", ch: "rozdz. 9" },
];

export const honesty = [
  {
    title: "Virala nie da się zaplanować",
    text: "Planujesz jakość każdego strzału i liczbę strzałów. System dba o dwie rzeczy, na które masz wpływ: jakość i regularność.",
  },
  {
    title: "Anonimowy profil budzi mniej zaufania",
    text: "Nadrabiasz to spójnością, wartością treści i uczciwymi rekomendacjami. Zasięg bez zaufania nie sprzedaje.",
  },
  {
    title: "Platformy tępią bezmyślną masówkę",
    text: "YouTube wyłącza z monetyzacji treści „nieautentyczne”, Instagram odcina konta z cudzymi filmami. Tu nie ma kopiowania — jest taśmowa produkcja własnych treści.",
  },
  {
    title: "Wypłaty od platform to nie Twój model",
    text: "Pieniądze przyjdą z afiliacji i produktów cyfrowych. Wypłaty z platform traktujesz jako premię.",
  },
];

export type Chapter = { n: string; part: string; title: string; desc: string; sections: string[] };

export const chapters: Chapter[] = [
  {
    n: "1",
    part: "Fundament",
    title: "Anatomia virala",
    desc: "Psychologia kciuka i inżynieria uwagi. Co dzieje się w głowie widza w pierwszych sekundach, co naprawdę mierzy algorytm i jak zbudować film, który ogląda się dwa razy.",
    sections: [
      "Neurobiologia scrollowania: pierwsze trzy sekundy",
      "Co naprawdę mierzy algorytm",
      "Pętla: film, który ogląda się dwa razy",
      "Trzy emocje, które zatrzymują kciuk",
      "Anatomia 15-sekundowego filmu",
      "Diagnostyka: jak czytać krzywą retencji",
      "Scenariusz modelowy: ten sam temat, dwa filmy",
      "Checklista przed publikacją każdego filmu",
    ],
  },
  {
    n: "2",
    part: "Fundament",
    title: "Ekonomia modelu",
    desc: "Skąd naprawdę biorą się pieniądze. Lejek od wyświetlenia do przelewu, pięć źródeł przychodu i kalkulator, który policzysz na serwetce, zanim nagrasz pierwszy film.",
    sections: [
      "Pięć źródeł przychodu i ich realna dostępność w Polsce",
      "Lejek: od wyświetlenia do przelewu",
      "Kalkulator przychodu",
      "Co polecać: dopasuj ofertę do widza",
      "Koszty linii produkcyjnej",
      "Scenariusz modelowy: dwa konta, ten sam zasięg",
    ],
  },
  {
    n: "3",
    part: "Fundament",
    title: "Wybór niszy",
    desc: "Psychologia odbiorcy i test, który robisz przed produkcją. Mapa nisz, profil widza, polski czy angielski rynek i procedura sprawdzenia niszy w 7 dni.",
    sections: [
      "Trzy kryteria dobrej niszy",
      "Profile nisz",
      "Profil widza: jedna osoba, a nie „wszyscy”",
      "Polski czy angielski rynek?",
      "Sprawdź niszę w 7 dni, zanim wyprodukujesz serię",
      "Nazwa i tożsamość profilu",
    ],
  },
  {
    n: "4",
    part: "Produkcja",
    title: "Obraz, który zatrzymuje",
    desc: "Legalne źródła materiałów, spójna estetyka i własne ujęcia. Licencje bez prawniczego żargonu, 60 fraz do wyszukiwania i strategia unikalności, która działa, bo jest prawdziwa.",
    sections: [
      "Zasada numer jeden: tylko materiały, do których masz prawo",
      "Legalne źródła wideo",
      "Wybór ujęć: sześć kryteriów",
      "60 fraz do wyszukiwania",
      "Własne ujęcia: Twoja największa przewaga",
      "Spójna estetyka: przewodnik stylu na jedną stronę",
      "Unikalność: czym naprawdę jest i dlaczego nie da się jej podrobić",
      "Biblioteka ujęć: porządek, który oszczędza godziny",
    ],
  },
  {
    n: "5",
    part: "Produkcja",
    title: "Głos AI, który nie brzmi jak nawigacja",
    desc: "Fabryka głosu w ElevenLabs. Wybór modelu i lektora, ustawienia, tagi emocji, poprawki polskiej wymowy i procedura, która daje czysty plik za pierwszym albo drugim podejściem.",
    sections: [
      "ElevenLabs: modele i plany w 2026 r.",
      "Wybór lektora: test trzech głosów",
      "Ustawienia głosu",
      "Reżyseria tekstem: interpunkcja, pauzy i tagi",
      "Polska wymowa: słownik poprawek",
      "Procedura generowania pliku",
      "Scenariusz modelowy: jedna zmiana, inna krzywa",
    ],
  },
  {
    n: "6",
    part: "Produkcja",
    title: "Fabryka skryptów",
    desc: "Prompty i korekta, która odróżnia Cię od spamu. 10 formuł hooków, prompt produkcyjny, korekta w 7 krokach, 10 gotowych skryptów i uczciwe testy A/B.",
    sections: [
      "Pięć bloków każdego skryptu",
      "Dziesięć formuł hooka",
      "Prompt produkcyjny",
      "Korekta: siedem kroków, które robią różnicę",
      "Dziesięć skryptów gotowych do produkcji",
      "Testy A/B: jak robić je uczciwie",
      "Scenariusz modelowy: od nudnego zdania do skryptu",
    ],
  },
  {
    n: "7",
    part: "Produkcja",
    title: "Montaż taśmowy w CapCut",
    desc: "Od pliku MP3 do gotowego MP4 według jednej procedury. Projekt-matka, montaż pod głos, napisy w strefie bezpiecznej, dźwięk, eksport i legalna muzyka.",
    sections: [
      "Narzędzie: CapCut i alternatywy",
      "Projekt-matka: ustawiasz raz, kopiujesz zawsze",
      "Montaż pod głos: krok po kroku",
      "Napisy, które czyta się bez wysiłku",
      "Dźwięk: głos, muzyka, efekty",
      "Eksport",
      "Seria 10 filmów w 70 minut",
    ],
  },
  {
    n: "8",
    part: "Dystrybucja",
    title: "Publikacja bez mitów",
    desc: "Konta, opisy, oznaczenia i harmonogram. Co mówią platformy, co mówią plotki i jak publikować na trzech platformach z jednego pliku, nie ryzykując konta.",
    sections: [
      "Mity kontra fakty",
      "Przygotowanie kont",
      "Opis, słowa kluczowe, hasztagi",
      "Jeden plik, trzy platformy",
      "Oznaczenia: AI i treści reklamowe",
      "Pierwsza godzina po publikacji",
      "Gdy coś idzie nie tak: procedura przy spadku zasięgów",
    ],
  },
  {
    n: "9",
    part: "Dystrybucja",
    title: "Analityka, która podnosi średnią",
    desc: "Arkusz, przegląd tygodniowy i drzewo decyzji. Które liczby czytać, jak nie dać się oszukać przypadkowi i jak zamienić dane w następną serię skryptów.",
    sections: [
      "Gdzie są liczby",
      "Arkusz: 12 kolumn, które wystarczą",
      "Przegląd tygodniowy w 30 minut",
      "Drzewo decyzji dla każdego filmu",
      "Jak nie dać się oszukać przypadkowi",
      "Sygnały, na które reagujesz od razu",
    ],
  },
  {
    n: "10",
    part: "Skala i pieniądze",
    title: "Model taśmowy",
    desc: "Produkcja seriami, porządek w plikach i skalowanie na kolejne konta. Harmonogram weekendu, struktura folderów, instrukcje stanowiskowe i moment, w którym warto oddać część pracy.",
    sections: [
      "Zasada serii",
      "Weekend produkcyjny",
      "Struktura folderów i nazwy plików",
      "Instrukcje stanowiskowe",
      "Kiedy otworzyć drugie konto",
      "Oddawanie pracy: od czego zacząć",
    ],
  },
  {
    n: "11",
    part: "Skala i pieniądze",
    title: "Monetyzacja",
    desc: "Afiliacja, własny produkt i współprace — w tej kolejności. Jak wybrać program, zbudować stronę docelową, oznaczać reklamy zgodnie z zaleceniami UOKiK i czego nie promować nigdy.",
    sections: [
      "Jak działa afiliacja",
      "Gdzie szukać programów",
      "Strona docelowa zamiast gołego linku",
      "Własny produkt cyfrowy",
      "Oznaczanie reklam według UOKiK",
      "Czego nie promujesz nigdy",
      "Współprace reklamowe",
    ],
  },
  {
    n: "12",
    part: "Skala i pieniądze",
    title: "Prawo i podatki w Polsce",
    desc: "Działalność nierejestrowana w 2026 r., pułapki VAT, AI Act i prawo autorskie. Wszystko, co musisz wiedzieć, zanim pierwszy przelew wpłynie na konto.",
    sections: [
      "Działalność nierejestrowana w 2026 r.",
      "Afiliacja i platformy: jak kwalifikuje się ten przychód",
      "VAT: dwie pułapki, o których poradniki milczą",
      "Kiedy założyć firmę",
      "AI Act: co się zmieniło 2 sierpnia 2026 r.",
      "Prawo autorskie i wizerunek",
      "Sprzedaż własnego e-booka albo szablonu",
    ],
  },
  {
    n: "13",
    part: "Skala i pieniądze",
    title: "Plan pierwszych 30 dni",
    desc: "Cały system na jednej osi czasu. Co robisz dzień po dniu, ile filmów produkujesz w każdym tygodniu i po czym poznasz, że czas skalować — albo zmienić kierunek.",
    sections: [
      "Tydzień 1: fundament",
      "Tydzień 2: pierwsze publikacje",
      "Tydzień 3: pierwsze pieniądze",
      "Tydzień 4: decyzja",
      "Codzienna lista kontrolna (10–15 minut)",
      "Na koniec",
    ],
  },
];

export const appendices = [
  { n: "A", title: "Biblioteka promptów", desc: "10 promptów: od banku tematów z komentarzy, przez skrypty i korektę, po analizę i własny produkt." },
  { n: "B", title: "Bank 60 hooków", desc: "Sześćdziesiąt otwarć ułożonych według dziesięciu formuł z rozdziału 6." },
  { n: "C", title: "Arkusz analityczny i słownik", desc: "Szablon 12 kolumn i wszystkie pojęcia w jednym miejscu." },
  { n: "D", title: "Źródła", desc: "Każda liczba z datą i źródłem — sprawdzisz ją, zanim wydasz pieniądze." },
];

export const hooks = [
  { formula: "Ukryty koszt", text: "Kawa za piętnaście złotych kosztuje Cię prawie cztery tysiące rocznie." },
  { formula: "Wróg systemowy", text: "Bank zarabia na tym, że nie sprawdzasz tej jednej opłaty." },
  { formula: "Test", text: "Zrób ten test na swoim wyciągu z konta." },
  { formula: "Odwrócenie", text: "„Odkładaj, co zostanie” to najgorsza rada finansowa." },
  { formula: "Wróg systemowy", text: "Twój pracodawca liczy, że nie zapytasz o widełki." },
  { formula: "Ukryty koszt", text: "Godzina scrollowania dziennie to piętnaście pełnych dni w roku." },
];

export const screenCards = [
  "Pętla wzmacnia dobry film. Słabego nie uratuje.",
  "Tekst prosto z AI to szkic. Publikowanie szkicu to spam.",
  "Kreatywność zostawiasz w skrypcie. Montaż to procedura.",
  "Viral to przypadek. Rosnąca średnia to Twoja praca.",
  "Konto możesz stracić w jeden dzień. Listy mailowej — nie.",
  "Nie masz gorszych narzędzi. Masz mniej przejść przez pętlę. Na razie.",
];

export const plan30 = [
  { week: "Tydzień 1", title: "Fundament", text: "Nisza, konta na 3 platformach, arkusz, bank 60 tematów, test trzech głosów i projekt-matka. Pierwsza seria: 10 skryptów." },
  { week: "Tydzień 2", title: "Pierwsze publikacje", text: "1–2 filmy dziennie na trzech platformach. Seria 15 filmów i pierwsza analiza hooków." },
  { week: "Tydzień 3", title: "Pierwsze pieniądze", text: "Link w bio, oznaczenia reklam, strona docelowa. Seria 20 filmów i przegląd tygodniowy." },
  { week: "Tydzień 4", title: "Decyzja", text: "Przegląd lejka po 30–45 filmach. Decyzja oparta na danych: skalujesz albo zmieniasz kierunek." },
];

export const forWho = {
  yes: [
    "Chcesz tworzyć zasięgi, ale nie chcesz pokazywać twarzy.",
    "Masz etat i 10–15 minut dziennie plus jeden weekend produkcyjny.",
    "Wolisz system i liczby od motywacyjnych obietnic.",
    "Chcesz zarabiać na afiliacji i własnym produkcie — legalnie, w Polsce.",
  ],
  no: [
    "Szukasz „pasywnego dochodu w tydzień” bez pracy.",
    "Chcesz kopiować cudze filmy i liczyć, że algorytm nie zauważy.",
    "Nie zamierzasz czytać statystyk ani poprawiać skryptów.",
  ],
};

export const faq = [
  {
    q: "W jakiej formie dostanę e-book?",
    a: "Plik PDF (123 strony) do pobrania od razu po zaksięgowaniu płatności. Link przychodzi też na e-mail. Czytasz na telefonie, tablecie, czytniku z obsługą PDF i komputerze.",
  },
  {
    q: "Czy dostanę aktualizacje?",
    a: "Tak. Platformy zmieniają zasady co kilka miesięcy, dlatego kupujący dostają zaktualizowane wydania bez dodatkowych opłat, na adres e-mail podany przy zakupie.",
  },
  {
    q: "Czy potrzebuję drogiego sprzętu albo programów?",
    a: "Nie. Telefon, darmowa aplikacja do montażu (CapCut lub alternatywy) i generator głosu za kilka dolarów miesięcznie. Rozdział 2.5 rozpisuje koszty całej linii produkcyjnej.",
  },
  {
    q: "Czy to zadziała, skoro program wynagrodzeń TikToka nie działa w Polsce?",
    a: "Tak — właśnie dlatego model opiera się na afiliacji i produktach cyfrowych (rozdział 11), a wypłaty z platform traktuje jako premię. Rozdział 2 pokazuje realną dostępność pięciu źródeł przychodu w Polsce.",
  },
  {
    q: "Czy gwarantujesz zarobki?",
    a: "Nie i nikt uczciwy tego nie zrobi. Scenariusze w książce to przykłady obliczeniowe, nie obietnica zarobku. Wyniki zależą od niszy, jakości wykonania, konsekwencji i zmian algorytmów. Książka daje system i uczy czytać statystyki Twojego konta.",
  },
  {
    q: "Czy to legalne? Co z podatkami i AI Act?",
    a: "Rozdział 12 omawia działalność nierejestrowaną w 2026 r., kwalifikację przychodów z afiliacji, pułapki VAT, AI Act (zmiany z 2 sierpnia 2026 r.), prawo autorskie i oznaczanie reklam według UOKiK. To wiedza edukacyjna, nie porada prawna.",
  },
  {
    q: "Czy nadaje się dla początkujących?",
    a: "Tak. Każdy rozdział to jeden etap linii produkcyjnej, a rozdział 13 rozpisuje pierwsze 30 dni dzień po dniu. Masz mało czasu? Zacznij od rozdziałów 1, 6 i 9.",
  },
  {
    q: "Czy mogę odstąpić od umowy?",
    a: "Przy treściach cyfrowych prawo odstąpienia wygasa, jeśli przed pobraniem wyraźnie zgodzisz się na natychmiastowe dostarczenie. Dlatego zanim kupisz, możesz bezpłatnie pobrać wstęp i cały rozdział 1.",
  },
  {
    q: "Czy dostanę rachunek lub fakturę?",
    a: "Tak — zaznacz odpowiednią opcję w formularzu zamówienia i podaj dane firmy. Dokument wyślemy na e-mail.",
  },
];
