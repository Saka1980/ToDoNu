# Nu — projektöversikt

> Den här filen läses automatiskt av Claude Code. Den beskriver vad projektet är, hur det är byggt och vad som är kvar att göra. Håll den uppdaterad.

## Vad det är

**Nu** är en lugn, röst-först app för att fånga *både uppgifter och idéer*, organiserat kring pågående projekt. Mobil-först. Låg deadline-press — mer "töm huvudet och plocka när det passar" än en sträng to-do-lista.

Det är medvetet **inte**: en kalender, en sträng deadline-app, eller en funktionspackad projektledare.

## Vem den är för

Ägaren själv. Använder den mest **på mobilen, i farten**, för lite av allt (studier, hem, jobb). Tre problem den ska lösa, hämtade direkt från ägaren:

1. Tråkiga appar → man slutar använda dem. → **Ska kännas belönande (gamification).**
2. Påminner inte i tid. → **Morgonsammanfattning.**
3. Saker faller mellan stolarna. → **Inkorg + allt syns, inget göms.**

## Kärnprinciper

- Minsta möjliga steg att fånga något.
- Röst först, text som alltid tillgänglig reserv.
- Belönande att checka av.
- Lågpress-ton i all copy (inga nag, ingen skam).

## Funktioner

**Projekt** är pågående samlingar (inte tidsbegränsade). Ordningen i projektlistan är **användarstyrd** — dra i greppikonen `≡` på ett projektkort för att flytta det upp/ned (touch via Pointer Events; ordningen ligger implicit i `s.projects`-arrayen, ingen separat sorteringsnyckel). Varje projekt har två separata spår:
- **Uppgifter** — sånt att bocka av.
- **Idéer** — tankar att återkomma till. En idé kan "promotas" till en uppgift ("Gör"-knappen).

**Inkorg** — snabb-dumpa utan att välja projekt, sortera senare. Man kan också lägga direkt i ett projekt vid fångst.

**Handlingslista** — *byggd 2026-05-30 (v1.13).* En super-simpel Google Keep-liknande checklista, **helt fristående** från projekt/uppgifter/idéer. EN enda lista (fast namn "Handlingslista"), nås via ett kort under Inkorg på framsidan (alltid synligt, undertext "X kvar"/"Tom"), öppnar en egen vy (`s.view==="action"`). Bockbara punkter; avbockade får genomstruken text och sjunker ner under en hopfällbar rubrik "X markerade objekt" (Keep-stil). "＋ Post i listan" öppnar ett **inline-fält direkt i listan** (markören redan i raden, Enter lägger till och håller fältet öppet för nästa post; tomt Enter/Escape/blur stänger — ingen modal), och **klick på text redigerar inline** på samma sätt. `≡` drar för att ordna om (samma drag-motor som projektlistan), × raderar en rad och "Rensa avbockade" tömmer alla klara. **Avbockning är tyst** — rör inte Glöd/streak/`todayCount`, ingen gnista/pling (matchar lågpress-tonen och deluppgifternas tysta avbockning). Lagras i `s.actions[]`.

**Fångst** — röst (håll-in-och-prata, sv-SE) eller text. Efter fångst väljer man typ (uppgift/idé) och destination (inkorg/projekt).

**Glöd (gamification)** — se nedan.

**Morgonsammanfattning** — i prototypen en hälsning + antal öppna uppgifter; ska bli en riktig morgonnotis (roadmap).

## Datamodell

Lagras i `localStorage` under nyckeln `nu-projekt-v1`.

```
project = { id, name, createdAt }
item    = { id, projectId,        // null = inkorg
            type,                  // 'task' | 'idea'
            title, done,
            steps?,                // [step] — bara på type:'task' (deluppgifter, valfritt)
            fromIdea?,             // true om idé → uppgift (ger större belöning)
            createdAt, completedAt? }
step    = { id, title, done }      // deluppgift i item.steps[]
action  = { id, title, done, createdAt, completedAt? }  // post i Handlingslistan (s.actions[], fristående)
stats   = { streak, lastActive, todayDate, todayCount, ideasRealized }
```

**Deluppgifter (`steps`)** — *byggd 2026-05-29.* Lättviktig checklista, frivillig och bakåtkompatibel (saknat fält = ingen checklista). Endast uppgifter, ej idéer. **Delsteg är frikopplade från uppgiftens klar-status** — alla delsteg klara gör *inte* uppgiften klar (progress blir grön vid x/x; man bockar själv av uppgiften när man tycker den är klar). Bockar man av huvuduppgiften markeras kvarvarande steg klara. Titlar (uppgift/idé/steg) redigeras genom att klicka på texten — för **uppgifter och idéer sker både tillägg (＋-knappen) och redigering inline** (Keep-stil, samma fält som handlingslistan, v1.15); **delsteg och projektnamn använder fortfarande rutan (`openSheet`)**. Delsteg belönas **tyst** (ingen gnista/pling/streak, tickar inte `todayCount`) — bara huvuduppgiften firar, för att hålla lågpress-tonen. Vald framför nästlade uppgifter av samma skäl.

## Glöd (belöningssystem)

- **streak**: +1 per aktiv dag; +1 om igår också var aktiv; **-1 (golv 1)** om man varit borta — nollställs *aldrig* (förlåtande, matchar lågpress-tänket).
- Vid avbockning: liten gnistexplosion + mjukt pling + `todayCount` tickar upp.
- **Större** explosion när en idé som blivit uppgift bockas av (`fromIdea`), och `ideasRealized` ökar — det belönar kärnloopen: fånga tanke → göra verklighet.

## Röst (speech-to-text)

- **Röst sker via enhetens egna tangentbords-diktering** (t.ex. Gboard-mic), inte via en egen knapp i appen. Alla textfält (fångst + inmatnings-sheet) autofokuseras så tangentbordets mic är redo direkt.
- **Web Speech API (`webkitSpeechRecognition`) är borttaget (2026-05-29, v1.3).** Det transkriberade inte på ägarens telefon och låste mikrofonen tills Chrome stängdes. Lägg **inte** tillbaka det. En egen mic-knapp som funkar på mobil skulle kräva en moln-baserad tal-till-text-tjänst (backend → arkitektur-tripwiren).
- Appen körs på https (GitHub Pages) — krävs ändå för tangentbordets diktering och PWA.

## Design

Mörkt "ember"-tema. Allt via CSS-variabler.

- Typsnitt: **Fraunces** (display/rubriker), **Space Mono** (brödtext/UI).
- Färger: ember `#ff6b35` (accent), amber `#f0a830` (uppgifter), idea-blå `#7db4c4` (idéer), grön `#7fa88f` (klart), bakgrund `#13100e`.
- UI-språk: **svenska**.

## Nuvarande implementation

- **`index.html`** — vanilla JS, ingen byggprocess. Huvudkällan.
- **PWA byggd:** `manifest.json`, service worker `sw.js` (network-first HTML, cache-first assets, versionerad cache), `icons/` (SVG + PNG 192/512/maskable + apple-touch), `fonts/` (self-hostade Fraunces + Space Mono — inga externa beroenden längre).
- Persistens: `localStorage` (per enhet/webbläsare) + `navigator.storage.persist()`.
- Tidigare React-prototyper finns i historiken, men `index.html` är den aktuella källan.

## Köra / deploya

GitHub Pages från `main` / root. Live-URL: `https://<användarnamn>.github.io/<repo>/`. Ändra filen → committa → Pages uppdateras automatiskt.

## Roadmap (att göra)

1. ~~**Riktig PWA**: `manifest.json` + service worker → installerbar, fungerar offline.~~ ✅ **KLAR 2026-05-29** — manifest, `sw.js`, PNG/maskable-ikoner, self-hostade typsnitt, iOS-hint, `storage.persist()`, namnbyte "Nu." → **ToDoNu**. Kvarstående risk: iOS kan ändå vakuumera `localStorage` efter ~7 dagars inaktivitet (riktig lösning = IndexedDB/synk).
2. ~~**Morgonnotis**: Notifications API via service worker.~~ **Steg 1 (in-app-hälsning) KLAR 2026-05-29. Steg 2 (aktiv notis) avgjort 2026-05-30: byggs inte — ägaren tycker in-app-hälsningen räcker.** (Om beslutet ändras: Periodic Background Sync + lokal notis, ingen backend, funkar på Pixel men ungefärlig tid; web push + cron-backend ger exakt tid men väcker arkitektur-tripwiren.)
3. ~~**Bryt ut röst-till-text** som återanvändbar modul.~~ **Överspelad 2026-05-29:** in-app Web Speech togs bort (fungerade ej på ägarens telefon). Röst sker nu via tangentbordets diktering. En egen återanvändbar röst-modul kräver moln-STT (backend) om den ska funka på mobil.
4. **Arkitekturbeslut** — *avgjort 2026-05-29: behåll vanilla nu + tripwire.* Migrera till **Vite-SPA** (ej full Next.js) först när någon tröskel slår till: (a) synk/flera enheter, (b) UI > ~3–4 vyer med delat interaktivt tillstånd, (c) upprepad kamp mot vanilla-renderingen. Tills dess: lös den enda svagheten (full `innerHTML`-omritning) med riktade DOM-uppdateringar, och bryt ut röst-modulen (punkt 3).
5. **Synk mellan enheter** (idag är allt lokalt per enhet).
6. ~~**Deluppgifter (checklista)**~~ ✅ **KLAR 2026-05-29** — frivillig checklista på uppgifter, alltid synlig, "＋ steg"-knapp, tyst avbockning via riktad DOM-uppdatering. Delsteg frikopplade från uppgiftens klar-status (ingen auto-klar). Redigerbara titlar via klick.

## Öppna frågor

- Behövs konto/synk, eller räcker lokalt per enhet? (Utlöser i så fall arkitektur-tripwiren → Vite + ev. Supabase.)
