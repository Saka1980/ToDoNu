# ToDoNu

> En lugn, röst-först app för att fånga **både uppgifter och idéer**, organiserat kring pågående projekt. Mobil-först, lågpress — mer "töm huvudet och plocka när det passar" än en sträng to-do-lista.

## 🔗 Öppna appen

**→ https://saka1980.github.io/ToDoNu/**

Installerbar PWA — på mobilen: öppna länken och välj *Lägg till på hemskärmen* / *Installera*. Funkar offline efter första besöket.

## Vad den gör

- **Projekt** — pågående samlingar, med två separata spår: **uppgifter** (bocka av) och **idéer** (tankar att återkomma till; en idé kan promotas till uppgift med `→`).
- **Inkorg** — snabb-dumpa utan att välja projekt, sortera senare.
- **Fångst** — röst via tangentbordets diktering (sv-SE) eller text. Alla fält autofokuseras så micen är redo direkt.
- **Glöd** — lågpress-gamification: streak som aldrig nollställs, gnistor + pling när man bockar av, större firande när en idé blivit verklighet.
- **Morgonhälsning** — lugnt morgonkort med dagens öppna uppgifter.
- **Deluppgifter** — frivillig checklista på uppgifter.
- **Säkerhetskopia** — export/import av all data som JSON (lokalt, ingen backend).

## Teknik

Vanilla JS i en enda `index.html` — ingen byggprocess, inga ramverk. PWA via `manifest.json` + `sw.js` (network-first HTML, cache-first assets). Self-hostade typsnitt (Fraunces + Space Mono). Data sparas i `localStorage` per enhet.

## Köra / deploya

GitHub Pages från `main` / root. Ändra filer → committa till `main` → Pages bygger om automatiskt. Lokalt: öppna `index.html` direkt i webbläsaren.

## Dokumentation

- `CLAUDE.md` — projektöversikt, datamodell, designprinciper
- `STATUS.md` — nuläge (läs först)
- `IDEAS.md` — pending idéer och öppna frågor
- `LOG.md` — kronologisk utvecklingslogg
