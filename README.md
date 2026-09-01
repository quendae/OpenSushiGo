# Puchate Café

Oryginalna, przeglądarkowa gra karciana o prowadzeniu kawiarni dla zwierzaków. Mechanicznie korzysta z jednoczesnego draftu i kolekcjonowania zestawów, ale ma własne nazwy, ilustracje, interfejs i oprawę.

## Co działa

- pełna talia 108 kart i trzy rundy dla 2–5 graczy,
- lokalna gra z botami na poziomie łatwym lub normalnym,
- jednoczesny wybór kart, przekazywanie rąk i automatyczna punktacja,
- wszystkie typy kart: zestawy, napoje, goście, polewa, adopcje i dodatkowe łapki,
- prywatny multiplayer host-authoritative przez WebRTC DataChannel,
- osobny Cloudflare Worker do sygnalizacji pokoi,
- responsywny stół, obsługa dotyku, ograniczenie animacji i czytelność bez polegania wyłącznie na kolorze,
- 12 oryginalnych ilustracji kart w miękkim, trójwymiarowym stylu — bez cudzych grafik.

## Uruchomienie lokalne

Wymagany jest Node.js 20 lub nowszy. Projekt nie ma zależności produkcyjnych.

```bash
npm run dev
```

Następnie otwórz `http://localhost:4173`.

```bash
npm test
npm run check
npm run build
```

## Multiplayer

Gra działa offline bez serwera. Sieć jest inicjalizowana dopiero po otwarciu trybu multiplayer.

1. Wdróż katalog `worker/` jako Cloudflare Worker z Durable Object.
2. Skopiuj adres `wss://…` Workera do pola „Adres serwera pokoju”.
3. Host tworzy sześcioliterowy kod, a pozostali gracze dołączają nim do pokoju.
4. Po zestawieniu WebRTC cała rozgrywka płynie bezpośrednio między przeglądarkami.

Host posiada jedyny pełny stan gry. Goście wysyłają wyłącznie intencje, a każdy otrzymuje osobny widok bez cudzych rąk, zakrytych wyborów, kolejności talii ani ziarna losowania. Jest to model do prywatnych gier znajomych; host technicznie może podejrzeć stan w narzędziach deweloperskich.

Do połączeń przez restrykcyjny NAT należy dodać własny serwer TURN w konfiguracji klienta. Publiczny STUN nie gwarantuje połączenia każdej pary urządzeń.

## Architektura

```text
src/core.js         czysty, deterministyczny silnik zasad
src/bots.js         decyzje botów przez ten sam interfejs akcji
src/app.js          kontroler ekranów i sesji
src/ui.js           bezpieczne renderowanie komponentów DOM
src/art.js          mapa oryginalnych ilustracji rastrowych kart
assets/cards/       zoptymalizowane ilustracje WebP
src/multiplayer.js  WebRTC, protokół i autorytet hosta
worker/             signaling WebSocket / Durable Object
tests/              testy reguł, prywatności i protokołu
```

Najważniejsza zasada sieciowa: **jedna autorytatywna symulacja, wiele prywatnych widoków**.

## Zasady w skrócie

W każdej turze wszyscy wybierają kartę zakrytą. Po zatwierdzeniu przez cały stół karty są odkrywane jednocześnie, a pozostałe ręce przechodzą w lewo. Po rundzie punktowane są pary ciasteczek, trójki zestawów, kolekcje bułeczek, goście i popularność napojów. Zwierzaki do adopcji punktują dopiero po trzeciej rundzie.

### Mechaniczne odpowiedniki kart

| Puchate Café | Liczba | Punktacja / działanie |
|---|---:|---|
| Ciasteczka | 14 | każde 2 = 5 pkt |
| Podwieczorek | 14 | każde 3 = 10 pkt |
| Bułeczki | 14 | 1/2/3/4/5+ kart = 1/3/6/10/15 pkt |
| Kakao ×1 / ×2 / ×3 | 6 / 12 / 8 | najwięcej kubków = 6 pkt, drugie miejsce = 3 pkt |
| Króliczek / Kotek / Piesek | 5 / 10 / 5 | odpowiednio 1 / 2 / 3 pkt |
| Adopcja | 10 | na końcu: najwięcej +6, najmniej −6; rozstrzyga remis |
| Kremowa polewa | 6 | następny gość ma wartość ×3 |
| Dodatkowe łapki | 4 | w późniejszej turze wybierz 2 karty |

## Licencja i grafiki

Kod jest dostępny na licencji MIT. Nazwa „Puchate Café”, teksty i ilustracje w tym repozytorium są oryginalne i nie są oficjalnie związane z *Sushi Go!* ani jego wydawcą.
