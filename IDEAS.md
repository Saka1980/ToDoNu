# IDÉER — ToDoNu

> Pending idéer och öppna frågor. Läs den här vid sessionsstart. Lägg till nya idéer direkt när de dyker upp. När en idé byggs → flytta till `LOG.md` och uppdatera `STATUS.md`.

**Senast uppdaterad:** 2026-05-30 (efter Handlingslistan, v1.13)

## Öppna frågor (kräver beslut)

- ~~**Räcker in-app morgonhälsningen?**~~ **Avgjort 2026-05-30: ja, den räcker.** Ägaren nöjd med in-app-kortet vid appöppning. Aktiv notis (Periodic Background Sync) byggs inte — roadmap-punkt 2 stängd.
- **Konto/synk — behövs det, eller räcker lokalt per enhet?** Utlöser i så fall arkitektur-tripwiren → Vite + ev. Supabase.
- **Ska inline-panelen stanna öppen för flera tillägg?** Idag (v1.8) stänger panelen efter varje `＋ uppgift`/`＋ idé` i projekt/inkorg (ägarens val "panel underifrån"). Om man ofta vill lägga flera i rad på samma ställe kan den hållas öppen och återfokusera. Avvakta ägarens upplevelse.

## Roadmap-idéer (ej byggda)

- **Synk mellan enheter** (roadmap-punkt 5) — idag är allt lokalt per enhet.

## Avgjorda / lagda åt sidan

- ~~**Riktig morgonnotis** (roadmap-punkt 2, steg 2)~~ — **lagd åt sidan 2026-05-30.** In-app-hälsningen räcker enligt ägaren. (Om beslutet ändras: Periodic Background Sync + lokal notis i service worker — ingen backend, funkar på Pixel, men ungefärlig tid och kräver notis-permission. Web push + cron-backend ger exakt tid men väcker arkitektur-tripwiren.)

## Arkitektur-tripwire (bevaka, inte en idé att bygga nu)

Behåll vanilla tills någon tröskel slår till — då migrera till **Vite-SPA** (ej full Next.js):
- (a) synk / flera enheter,
- (b) UI > ~3–4 vyer med delat interaktivt tillstånd,
- (c) upprepad kamp mot vanilla-renderingen.

## Medvetet INTE

- En egen in-app mic-knapp (Web Speech) — borttagen, fungerade ej + låste micen på Android. Återinför endast med moln-STT.
- Kalender, sträng deadline-app, funktionspackad projektledare — strider mot lågpress-tonen.
