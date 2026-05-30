# IDÉER — ToDoNu

> Pending idéer och öppna frågor. Läs den här vid sessionsstart. Lägg till nya idéer direkt när de dyker upp. När en idé byggs → flytta till `LOG.md` och uppdatera `STATUS.md`.

**Senast uppdaterad:** 2026-05-30 (Klart-grupp + flytta inkorg→projekt, v1.16)

## Öppna frågor (kräver beslut)

- ~~**Räcker in-app morgonhälsningen?**~~ **Avgjort 2026-05-30: ja, den räcker.** Ägaren nöjd med in-app-kortet vid appöppning. Aktiv notis (Periodic Background Sync) byggs inte — roadmap-punkt 2 stängd.
- **Konto/synk — behövs det, eller räcker lokalt per enhet?** Utlöser i så fall arkitektur-tripwiren → Vite + ev. Supabase.
- ~~**Ska inline-panelen stanna öppen för flera tillägg?**~~ **Avgjort 2026-05-30 (v1.15): ja.** Hela add/edit-flödet för uppgifter/idéer (och handlingslistan) är nu inline (Keep-stil) — `＋ uppgift`/`＋ idé` öppnar ett fält direkt i listan som **håller sig öppet för nästa post** (Enter lägger till och fokuserar om), och klick på text redigerar inline. Den gamla "panel underifrån"/`openSheet`-vägen är borta för dessa. (Delsteg + projektnamn använder fortfarande rutan.)

## Roadmap-idéer (ej byggda)

- **Synk mellan enheter** (roadmap-punkt 5) — idag är allt lokalt per enhet.

## Avgjorda / lagda åt sidan

- ~~**Arkivering + flytta inkorg→projekt**~~ — **byggt 2026-05-30 (v1.16).** Diskuterades fram: arkivering = hopfällbar "Klart"-grupp i projekt/inkorg (återanvänt mönster, ingen ny vy); flytta-ikon på inkorg-poster sluter "sortera sen"-loopen. Samtidigt avfärdades **kod-modularisering nu** (premature — spara till synk/Vite-tripwiren) och **deadline/påminnelse/taggar/färgkodning** (krockar med lågpress-själen).
- ~~**Riktig morgonnotis** (roadmap-punkt 2, steg 2)~~ — **lagd åt sidan 2026-05-30.** In-app-hälsningen räcker enligt ägaren. (Om beslutet ändras: Periodic Background Sync + lokal notis i service worker — ingen backend, funkar på Pixel, men ungefärlig tid och kräver notis-permission. Web push + cron-backend ger exakt tid men väcker arkitektur-tripwiren.)

## Arkitektur-tripwire (bevaka, inte en idé att bygga nu)

Behåll vanilla tills någon tröskel slår till — då migrera till **Vite-SPA** (ej full Next.js):
- (a) synk / flera enheter,
- (b) UI > ~3–4 vyer med delat interaktivt tillstånd,
- (c) upprepad kamp mot vanilla-renderingen.

## Medvetet INTE

- En egen in-app mic-knapp (Web Speech) — borttagen, fungerade ej + låste micen på Android. Återinför endast med moln-STT.
- Kalender, sträng deadline-app, funktionspackad projektledare — strider mot lågpress-tonen.
