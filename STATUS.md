# STATUS — ToDoNu

> Snabb nulägesbild. Läs den här först vid sessionsstart. Detaljerad kronologi finns i `LOG.md`, projektöversikt i `CLAUDE.md`, pending idéer i `IDEAS.md`.

**Senast uppdaterad:** 2026-05-30

## Var vi är just nu

Körbar, installerad och verifierad PWA på GitHub Pages. Vanilla JS (`index.html`), ingen byggprocess. Persistens i `localStorage` (`nu-projekt-v1`).

- **Live:** https://saka1980.github.io/ToDoNu/
- **Repo:** https://github.com/Saka1980/ToDoNu (`main` / root → GitHub Pages)
- **Ägarens enhet:** Google Pixel (Android) — iOS-farhågor i roadmappen gäller alltså inte.

## Vad som är klart

- ✅ **Körbar app** — projekt, uppgifter, idéer, inkorg, Glöd (gamification).
- ✅ **Git + GitHub Pages** — live på https, deploy via commit till `main`.
- ✅ **PWA** — `manifest.json`, `sw.js` (network-first HTML, cache-first assets, versionerad cache), PNG/maskable-ikoner, apple-touch-icon, self-hostade typsnitt (Fraunces + Space Mono, ingen Google-länk), `navigator.storage.persist()`, Android install-knapp. Installerad och verifierad på Pixel.
- ✅ **Deluppgifter/checklista** — frivilligt `steps[]` på uppgifter, "＋ steg"-knapp, riktad DOM-uppdatering, tyst avbockning. Frikopplade från uppgiftens klar-status. Redigerbara titlar via klick.
- ✅ **Röst via tangentbordet** — in-app Web Speech borttaget (v1.3, fungerade ej + låste micen på Android). Alla fält autofokuseras → Gboard-mic. Lägg INTE tillbaka in-app-mic (kräver moln-STT/backend).
- ✅ **Namnbyte** "Nu." → **ToDoNu** överallt.
- ✅ **In-app morgonhälsning** (roadmap-punkt 2, steg 1) — morgonkort högst upp på list-vyn vid första öppning under morgontimmarna (04–11:59), en gång/dag. Hälsning + antal öppna uppgifter + osorterade i inkorgen, lågpress-ton, stängbart. Persisteras via `localStorage["nu-morning"]`. `morningDigest()`/`dismissMorning()` i `index.html`.
- ✅ **Tydlig bakåtknapp** — `‹ Tillbaka` som pill, hög kontrast, 44px träffyta (förut svårträffad mörk-på-mörk `‹`). VER 1.5. *(Obs: samma session lade till auto-tillbaka-till-list efter tillägg, men det ersattes i v1.8 av "stanna kvar i fångst" — se nedan.)*
- ✅ **Säkerhetskopia (export/import)** — `↓ Exportera säkerhetskopia` / `↑ Importera` längst ner på huvudmenyn. Laddar ner/läser in JSON av `{projects,items,stats}`, validerar + `confirm()` före överskrivning. Lokal backup utan backend. `exportData()`/`pickImport()`/`importData()`. VER 1.6.
- ✅ **`load()` härdad mot korrupt data** — vid oläsbar JSON skrivs inget över: råfilen sparas till `nu-projekt-v1-korrupt` och en varningsruta erbjuder `↓ Ladda ner råkopia` (`exportRaw()`) / `↑ Importera backup`. Löser tidigare flaggad teknisk skuld. VER 1.7.
- ✅ **Textvisning & rad-design omgjord** (VER 1.9) — gäller rakt igenom uppgifter, idéer, klara uppgifter och delsteg. (a) **Redigering flerradig**: `openSheet` använder `<textarea>` som auto-växer (`growField`), hela texten syns, Enter=Klar / Shift+Enter=ny rad. (b) **Lång text klamras till 3 rader + "visa mer"**: titlar/delsteg får `.clampable.clamp` (`-webkit-line-clamp:3`); "visa mer"-knappen visas bara när texten verkligen svämmar över (mäts i `applyClamps()` efter render), toggle utan omritning (`toggleMore()`). (c) **Ikon-kompakta åtgärder**: raden är nu `[☐][text full bredd via .icontent][→][🗑]` — "Gör" blev pil-ikon (38×38 träffyta, `title`-tooltip), papperskorg lika; texten stjäls inte längre av knapparna. Snabb-fångst-fältet på hemmet lämnat som `<input>` (autofokus för Gboard-mic). `sw.js`-cache bumpad → `todonu-v3`.
- ✅ **Fångst-flöde omdesignat** (princip: lägg till på plats, kastas aldrig ut). `＋ uppgift`/`＋ idé` per sektion i projekt/inkorg (`addHere()`, panel underifrån) — sektion avgör typ, vy avgör destination, inga väljare. Orange + (FAB) **bara på huvudsidan**. Huvudsidans fångst **stannar kvar** efter Enter (statusrad `✓ Tillagt — fånga nästa`), utgång via `‹ Tillbaka`. VER 1.8.
- ✅ **Dra-och-släpp-ordning på projekt** (VER 1.12) — varje projektkort har en greppikon `≡`; håll och dra i den för att flytta projektet upp/ned. Tryck på resten av kortet öppnar projektet som vanligt. Ingen datamodell-ändring (ordningen ligger i `s.projects`). Draget: `pointerdown` via delegering på `#projlist`, `pointermove`/`up` på **`document`** (inget pointer-capture-beroende — det var v1.10/1.11-buggen), sidan låses mot scroll (`body.draglock`), kortet följer fingret via `transform`, grannarna glider, arrayen sorteras om vid släpp. **Verifierad i riktig Chrome** (CDP-driven, dra-ned/dra-upp/tryck-öppnar — alla gröna). `onListPointerDown()`/`gripMove()`/`gripUp()`/`shiftNeighbors()` i `index.html`. `sw.js`-cache → `todonu-v6`.

## Nästa steg

Ingen funktion är i kö just nu. **Roadmap-punkt 2 (morgonnotis) är avgjord 2026-05-30: in-app-morgonhälsningen räcker — steg 2 (Periodic Background Sync + aktiv notis) byggs inte.** Kvarvarande kandidater, alla beroende av ägarens upplevelse (se `IDEAS.md`):

- **Synk mellan enheter** (roadmap-punkt 5) — utlöser arkitektur-tripwiren → Vite + ev. Supabase.
- **Inline-panelen kvar öppen** för flera tillägg i rad (liten UX-justering).

Fråga ägaren vid nästa sessionsstart vad hen vill ta härnäst.

## Känd teknisk skuld

- ~~`load()` skrev tyst över korrupt lagring~~ — **åtgärdat** (råkopia + varningsruta, se ovan).
- Huvudrenderingen ritar fortfarande om allt via `innerHTML` (riktade uppdateringar finns för steg/typval). Lös vidare vid behov; full migrering till Vite-SPA endast om arkitektur-tripwiren slår till.
- Kvarstående risk: `localStorage` per enhet, ingen synk. Manuell export/import (säkerhetskopia) mildrar dataförlust; riktig lösning på sikt = IndexedDB/synk.
