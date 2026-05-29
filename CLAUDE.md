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

**Projekt** är pågående samlingar (inte tidsbegränsade). Varje projekt har två separata spår:
- **Uppgifter** — sånt att bocka av.
- **Idéer** — tankar att återkomma till. En idé kan "promotas" till en uppgift ("Gör"-knappen).

**Inkorg** — snabb-dumpa utan att välja projekt, sortera senare. Man kan också lägga direkt i ett projekt vid fångst.

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
stats   = { streak, lastActive, todayDate, todayCount, ideasRealized }
```

**Deluppgifter (`steps`)** — *byggd 2026-05-29.* Lättviktig checklista, frivillig och bakåtkompatibel (saknat fält = ingen checklista). Endast uppgifter, ej idéer. **Delsteg är frikopplade från uppgiftens klar-status** — alla delsteg klara gör *inte* uppgiften klar (progress blir grön vid x/x; man bockar själv av uppgiften när man tycker den är klar). Bockar man av huvuduppgiften markeras kvarvarande steg klara. Titlar (uppgift/idé/steg) redigeras genom att klicka på texten. Delsteg belönas **tyst** (ingen gnista/pling/streak, tickar inte `todayCount`) — bara huvuduppgiften firar, för att hålla lågpress-tonen. Vald framför nästlade uppgifter av samma skäl.

## Glöd (belöningssystem)

- **streak**: +1 per aktiv dag; +1 om igår också var aktiv; **-1 (golv 1)** om man varit borta — nollställs *aldrig* (förlåtande, matchar lågpress-tänket).
- Vid avbockning: liten gnistexplosion + mjukt pling + `todayCount` tickar upp.
- **Större** explosion när en idé som blivit uppgift bockas av (`fromIdea`), och `ideasRealized` ökar — det belönar kärnloopen: fånga tanke → göra verklighet.

## Röst (speech-to-text)

- Web Speech API (`window.SpeechRecognition` / `webkitSpeechRecognition`), språk `sv-SE`.
- `continuous = true` + auto-omstart i `onend` tills användaren släpper (push-to-talk via pointer-events).
- Engångs-aktivering via `getUserMedia` (håller strömmen vid liv) för att slippa upprepade tillståndsrutor.
- **Kräver https.** På `file://` glömmer/blockerar webbläsaren mikrofontillstånd; på mobil blockeras det ofta helt. Därför körs appen på GitHub Pages.

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
2. **Morgonnotis**: Notifications API via service worker. OBS: på iOS krävs installerad PWA och web push är begränsat — undersök lösning.
3. **Bryt ut röst-till-text** som en återanvändbar modul (ägaren vill kunna testa den i andra projekt).
4. **Arkitekturbeslut** — *avgjort 2026-05-29: behåll vanilla nu + tripwire.* Migrera till **Vite-SPA** (ej full Next.js) först när någon tröskel slår till: (a) synk/flera enheter, (b) UI > ~3–4 vyer med delat interaktivt tillstånd, (c) upprepad kamp mot vanilla-renderingen. Tills dess: lös den enda svagheten (full `innerHTML`-omritning) med riktade DOM-uppdateringar, och bryt ut röst-modulen (punkt 3).
5. **Synk mellan enheter** (idag är allt lokalt per enhet).
6. ~~**Deluppgifter (checklista)**~~ ✅ **KLAR 2026-05-29** — frivillig checklista på uppgifter, alltid synlig, "＋ steg"-knapp, tyst avbockning via riktad DOM-uppdatering. Delsteg frikopplade från uppgiftens klar-status (ingen auto-klar). Redigerbara titlar via klick.

## Öppna frågor

- Hur lösa pålitlig morgonnotis, särskilt på iOS?
- Behövs konto/synk, eller räcker lokalt per enhet? (Utlöser i så fall arkitektur-tripwiren → Vite + ev. Supabase.)
