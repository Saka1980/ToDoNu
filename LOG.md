# Utvecklingslogg — Nu

Kronologisk logg över vad vi byggt och *varför*. Nyaste överst när nya rader läggs till.

---

## 2026-05-30 — Nionde sessionen (Klart-grupp + flytta inkorg→projekt)

Efter ett **rent snack-pass** (ingen kod) om modularisering vs. funktioner landade vi i två verkliga glapp i inkorgs-loopen, båda lösta genom att återanvända befintliga mönster — och avfärdade samtidigt kod-uppdelning nu (premature; spara till synk/Vite-tripwiren) samt deadline/påminnelse/taggar (krockar med lågpress-själen).

- **Glappet vi hittade:** det fanns **ingen väg att flytta en post från inkorgen in i ett projekt** efter skapande (enda `projectId`-mutationen var `removeProject`). Det bröt inkorgens kärnlöfte "dumpa nu, sortera sen".
- **Byggt (allt i `index.html`), två features:**
  1. **Klart-grupp (lättviktig arkivering):** avbockade uppgifter ligger inte längre genomstrukna kvar i listan utan samlas under en hopfällbar "Klart (N)"-rubrik efter ＋uppgift — exakt handlingslistans markerade-grupp-mönster återanvänt (`.donehead`/`.donegroup`). `doneCollapsed` (hopfälld som standard), `toggleDoneCollapse()`, `clearDoneTasks()` (scopar på aktuell vy via `s.cur`/inkorg — rör inte andra projekts klara). Endast uppgifter (idéer "blir inte klara"). Ren presentation → **rör inte Glöd**; avbockning firar som förut. Ägaren valde att ha "Rensa klart" (konsekvent med handlingslistan).
  2. **Flytta inkorg→projekt:** flytta-ikon (📁) **bara på inkorg-poster** (ägarens val — inte inne i projekt). Ny `openPicker(title,options,onPick)` återanvänder sheet-chromen (`.sheet-bg`/`.sheet`/`closeSheet`) men renderar mål-knappar (`.pickrow`) istället för textfält; `moveItem()` ändrar **bara `projectId`** (typ + delsteg följer med; skiljt från `promote`). Ingen datamodell-ändring, ingen export/import-ändring.
- **Verifierad i riktig Chrome (CDP, 21 assertions, alla gröna):** avbockning→Klart-grupp (hopfälld default, genomstruken vid expandering, ångra), Rensa-klart-scoping (tömmer bara aktuell vy, lämnar annat projekt orört), **Glöd firar fortf.** vid avbockning, flytta-knapp bara i inkorg (ej i projekt), väljare→flytt sätter `projectId`→posten lämnar inkorgen→överlever reload, + regression (handlingslista add, inline-edit). En första FAIL var testartefakt (delad `doneCollapsed` gjorde att ett extra rubrik-klick fällde ihop gruppen så Rensa-knappen var dold) — åtgärdat i testet, inte appen. `VER` 1.15→1.16, `sw.js` `todonu-v9`→`todonu-v10`. Engångsskriptet raderat.

---

## 2026-05-30 — Åttonde sessionen (Handlingslista — Keep-liknande checklista)

Ägaren ville ha en **super-simpel, Google Keep-liknande checklista** ("Handlingslista"), placerad under Inkorg på framsidan. Designen togs fram via intervju + en referensbild från ägaren (en Keep-inköpslista).

- **Bekräftade beslut (intervju):** EN enda lista (fast namn), bockbara punkter, **helt fristående** (rör inte Glöd/streak), kort under Inkorg som öppnar **egen vy**, kortet **alltid synligt** ("X kvar"/"Tom"), avbockning **exakt som Keep** (genomstruket + sjunker under hopfällbar "X markerade objekt"), **både** × per rad och "Rensa avbockade", **redigera (klick) + dra-ordna**.
- **Datamodell:** ny fristående array `s.actions=[]` med `{id,title,done,createdAt,completedAt?}`. Bakåtkompatibelt (saknat fält → `[]`). Persisterad på **fyra ställen**: `load`/`save`/`exportData`/`importData` (annars ingår den inte i säkerhetskopian). Ordningen ligger implicit i arrayen (som `s.projects`).
- **Byggt (allt i `index.html`), vertikalt i fem commits:**
  1. Datamodell + persistens.
  2. Kort på framsidan (mellan Inkorg-kort och "Projekt"-rubrik, alltid synligt) + bakåtknappen utökad för `view==="action"`.
  3. Vyn `s.view==="action"`: "＋ Post i listan", öppna rader (bockbara/redigerbara/raderbara), hopfällbar markerade-grupp, "Rensa avbockade". Funktioner `addAction/editAction/removeAction/clearDoneActions/toggleActionsCollapse` + **tyst** `toggleAction` (modellerad på `toggleStep`, *inte* `completeTask` — ingen `chime`/`bumpStreak`/`todayCount`). Ny CSS `.donehead`/`.donegroup`; genomstruket återanvänt från `.item.done .ititle`.
  4. **Drag generaliserat:** `setupProjectDrag`→`setupDrag` binder både `#projlist` och `#actionlist`; `onListPointerDown` fick selektor `.proj,.act` + `drag.listId` + `slotH` per lista (`.item` saknar `margin-bottom`, `.cardbtn` har 10px). `gripUp` grenar på `listId`: actionlist ordnar om bland de *öppna* posterna (de enda som renderas) och konkatenerar avbockade sist; projlist oförändrat. Ny CSS `.act`/`.act.dragging` (helkant, eftersom `.item` bara har border-bottom).
  5. `VER` 1.12→1.13, `sw.js`-cache `todonu-v6`→`todonu-v7`, dokumentation.
- **Verifiering (riktig Chrome, CDP — före push):** drev headless Chrome via DevTools-protokollet (Node 24:s inbyggda `WebSocket`/`fetch`, appen serverad över lokal http så `localStorage`/reload speglar verkligheten, riktiga muspekar-event för drag). **23 assertions, alla gröna:** kort syns/öppnar vy, tre tillägg via sheet, **tyst avbockning (stats bevisat oförändrade)**, regruppering till markerade + genomstruket, hopfälld-by-default + expandera, ångra, redigera, radera (×), "Rensa avbockade", dra-ned-omordning, **reload-persistens**, och **regression: projektdraget flyttar fortfarande**. Inga JS-exceptions/console-fel. Engångsskriptet raderat efteråt.
  - *Process-not:* en första "FAIL" på projektdrag-regressionen var ett **testartefakt** — med standard headless-viewport (800×600) hamnade projektgreppen utanför skärmen så `dispatchMouseEvent` träffade inget; löst genom hög mobil-viewport (412×2200) via `Emulation.setDeviceMetricsOverride`. Den delade rörelse-logiken var korrekt hela tiden. (Lärdom kvarstår: verifiera *beteende* i riktig browser före push — gjordes denna gång.)
- **Arkitektur-not:** detta blev appens 4:e vy → tangerar tripwire-tröskel (b). Action-vyn delar dock inte interaktivt tillstånd med övriga → medvetet kvar i vanilla. **Nästa vy-tillägg bör trigga omtag om Vite-SPA** (se STATUS.md).

**Uppföljning 3 samma dag (v1.15, remote control) — inline överallt:** ägaren gillade inline-tillägget så mycket ("skapa rad efter rad väldigt snabbt") att hen bad om (a) **inline-redigering** också, och (b) samma inline-sätt för **uppgifter och idéer** (inte bara handlingslistan). Allt annat oförändrat. Byggt: den action-specifika add-koden generaliserades till en återanvändbar inline-mekanik styrd av ett enda `inline`-state `{op:'add'|'edit', what, id?}`. Nya funktioner `startAdd/startEdit/inlineField/inlineKey/flushInline/commitAdd/commitEdit/cancelInline/focusInline/isAdd/isEdit/inlineTitle` ersatte `editItem`, `editAction`, `addHere` och de fyra `actionAdd*`-funktionerna. Render-mönstret: där en titel/`＋`-knapp förr stod renderas nu `inlineField()` när `isEdit(...)`/`isAdd(...)`. **add** håller fältet öppet för nästa post (snabb radmatning, Keep-stil), **edit** committar och stänger (tom text = ingen ändring, dvs ofarligt att råka tömma), **blur** sparar, **Escape** avbryter; `inlineFlushing`-vakten kvar mot dubbel-commit vid blur under re-render. `go()`/`openProj()` nollställer `inline`; `removeItem`/`removeAction` rensar `inline` om den raderade raden redigerades. **Medvetet oförändrat:** delsteg (`addStep`/`editStep`) och projektnamn (`addProject`) använder fortfarande `openSheet`. CSS: `.addinput`→`.inlinefield` (width:100% så edit-i-`.icontent` fyller raden), `.act.adding`→`.item.adding`. **Verifierad i riktig Chrome (CDP, 30 assertions, alla gröna):** drev tangentbordet på riktigt — add/edit för uppgift+idé+action, förifyllt edit-fält, tomt-edit utan ändring, blur-commit, Escape-avbryt, plus regression (avbockning, radera, promote, steg öppnar fortf. sheet, reload-persistens), inga JS-fel. `VER` 1.14→1.15, `sw.js` `todonu-v8`→`todonu-v9`. Engångsskriptet raderat.

**Uppföljning samma dag (v1.14, remote control) — inline-tillägg:** ägaren ville att "＋ Post i listan" skulle kännas som Keep — skapa en tom rad *direkt i listan med markören redan i*, skriva inline, istället för att en separat ruta (sheet) öppnas. Byggt: `addAction()` (öppnade `openSheet`) ersatt av `startActionAdd()` → renderar en inline-`<input id="actionadd">` där `+`-knappen satt, autofokuserad. `actionAddKey()` hanterar Enter (commit + håll fältet öppet för nästa post, Keep-stil) / Escape (stäng) / tomt-Enter (stäng); `flushActionAdd(keepOpen)` committar fältets text och re-renderar. **Fallgrop löst:** Enter→re-render byter ut fältet vilket triggar `blur` på det gamla → en `actionFlushing`-vakt (~60 ms) hindrar dubbel-commit. Blur med text committar (bra för mobil "klar"-tangent). `go()` nollställer `actionAdding`. Edit-via-klick lämnades som `openSheet` (ägaren bad bara om add-flödet). **Verifierad i riktig Chrome (CDP, 21 assertions, alla gröna):** drev tangentbordet på riktigt (`Input.insertText` + `Enter`/`Escape`-key-events) — fält visas+fokuserat, ingen sheet, Enter committar+håller öppet+tomt fält+återfokus, kontinuerligt tillägg i ordning, tomt-Enter/Escape/blur-beteende, reload-persistens, inga JS-fel. `VER` 1.13→1.14, `sw.js` `todonu-v7`→`todonu-v8`. Engångsskriptet raderat.

---

## 2026-05-30 — Sjunde sessionen (dra-och-släpp-ordning på projekt)

Ägaren ville kunna **hålla i och flytta projekt upp/ned** — dra-och-släpp för att ändra ordningen i projektlistan.

- **Designbeslut (med ägaren):** webbläsarens inbyggda HTML5-`draggable` funkar i praktiken inte på touch, och appen används mest på Pixel. Två modeller övervägdes: greppikon (≡) vs. håll-inne (long-press). Ägaren valde **greppikon (≡)** — mest pålitligt på mobil, ingen krock mellan tryck (öppna), scroll och dra.
- **Ingen datamodell-ändring:** ordningen ligger redan implicit i `s.projects`-arrayen. Att flytta i arrayen + `save()` räcker; `load()` bevarar ordningen.
- **Byggt (allt i `index.html`):**
  - **Markup:** projektkorten wrappas i `<div id="projlist">`; varje kort blev `<div class="cardbtn proj" data-pid=…>` (knapp-i-knapp är ogiltig HTML när greppet är en egen knapp). Greppikon `≡` med `onclick="event.stopPropagation()"` → tryck på greppet öppnar aldrig projektet. Inkorgskortet och "Nytt projekt" ligger utanför containern (ej flyttbara).
  - **Touch-drag (Pointer Events, vanilla):** `setupProjectDrag()` binder `pointerdown` på varje grepp efter varje render. `setPointerCapture` på greppet, kortet får `.dragging` (lyft-look). 4px-tröskel skiljer dra från statiskt tryck. `suppressOpen`-flagga (~80 ms) hindrar att släppet av misstag öppnar ett projekt. Fungerar även med mus (snabbtest på dator).
- **`VER` bumpad 1.9 → 1.10**, `sw.js`-cache `todonu-v3` → `todonu-v4`.

**Buggfix samma session (v1.11, ofullständig):** v1.10 markerade kortet men gick inte att flytta. Första försöket bytte till `transform` istället för `insertBefore`, men band fortfarande `pointermove`/`pointerup` på **greppelementet via `setPointerCapture`** — och den capturen levererade inte move-eventen på ägarens setup (touch lät scroll-gesten stjäla pointern; desktop fick aldrig eventen). Draget gjorde alltså fortfarande inget, och sidan scrollade.

**Riktig fix (v1.12) — verifierad i riktig Chrome:** roten var beroendet av pointer-capture/per-element-event.
- **Lösning:** `pointerdown` fångas via **delegering på `#projlist`** (`onListPointerDown`). `pointermove`/`pointerup`/`pointercancel` registreras på **`document`** — mus och touch levererar alltid move-event dit, inget capture-beroende. Sidan låses mot scroll under draget (`body.draglock{overflow:hidden;touch-action:none;overscroll-behavior:none}`) plus `touch-action:none` på greppet och `preventDefault()` i `pointermove`. Kortet följer fingret via `transform`, grannarna glider (`shiftNeighbors()`), och `s.projects` sorteras om **en gång vid släpp** (`splice` index→target, mål = `index + round(dy/slotH)`). Greppet förstorat till 46×46 med tydligare hover.
- **Verifiering:** drev riktig Chrome headless via DevTools-protokollet (Node 24:s inbyggda `WebSocket`/`fetch`, inga npm-installationer) och dispatchade riktiga muspekar-event. Testade tre fall — dra ned (Alpha→botten), dra upp (sista→toppen) och vanligt tryck (öppnar projektet). **Alla tre gröna, inga JS-fel.** Engångs-testskriptet togs bort efteråt.
- **`VER` bumpad 1.10 → 1.12**, `sw.js`-cache `todonu-v4` → `todonu-v6`.

### Lärdomar (varför det krävdes tre försök — undvik framöver)

Två fel, ett tekniskt och ett i arbetssättet:

1. **Tekniskt — fel grundval för pekar-drag.** Jag byggde draget på `setPointerCapture` + händelser bundna på det dragna elementet. Det är skört: (a) flyttar man elementet i DOM under draget (`insertBefore`) avbryter Chrome capturen → `pointercancel`; (b) även utan DOM-flytt levererades inte move-eventen pålitligt (touch lät scroll-gesten ta pointern, desktop fick dem aldrig). **Regel:** bygg drag/swipe på **`document`-lyssnare** för `pointermove`/`pointerup` (capture-oberoende, fungerar mus+touch), lås scroll explicit (`touch-action:none` på handtaget + `body`-lås under draget), och undvik DOM-mutation mitt i en pågående pekargest — använd `transform` och commit:a en gång vid släpp.
2. **Process — jag pushade utan att verifiera beteendet.** De två första gångerna körde jag bara `node --check` (syntax) och antog att det funkade. Syntaxkontroll fångar **aldrig** event-/capture-/scroll-buggar. Jag hade dessutom verktyget hela tiden (headless Chrome via CDP, noll installationer) men använde det först på tredje försöket. **Regel:** för allt som är interaktivt beteende (drag, pekare, fokus, scroll, animationer) räknas *bara* en körning i en riktig webbläsare som verifiering — kör den **före** commit/push, inte efter att ägaren rapporterat fel. Syntax-OK ≠ "funkar".

(UX-not: ägaren antog först att hela projektkortet skulle gå att dra, inte bara `≡`. Det visade sig funka perfekt med greppet när man förstod det — men *upptäckbarheten* av handtaget kan vara värd att höja om frågan dyker upp igen, t.ex. tydligare ikon/hint.)

### Kvar / nästa steg
Oförändrat: morgonnotis väg 2 (Periodic Background Sync) om in-app-hälsningen inte räcker. Teknisk skuld oförändrad (helrendering via `innerHTML`, lokal lagring utan synk) — se `STATUS.md`.

---

## 2026-05-30 — Sjätte sessionen (textvisning & rad-design + README)

Ägartest på mobil (skärmdump av projektet "Clara Via app") visade tre konkreta svagheter i hur text och rader renderas: (1) "Gör"- och papperskorgsknappen stal textens bredd → långa idéer wrappade till 6–7 rader, få kort fick plats; (2) långa texter gick inte att överblicka; (3) tryck på text öppnade redigering i ett **enradigt** `<input>` → lång text scrollade bara i sidled. Ägaren ville ha en fix **rakt igenom** (uppgifter, idéer, klara uppgifter *och* delsteg), inte bara idéer.

- **Designbeslut (med ägaren):** lång text → *klampa till 3 rader + "visa mer"* (fler kort syns) framför "visa alltid allt". Åtgärdsknappar → *ikon-kompakt på samma rad* (`→` och liten `🗑`) framför egen rad / "…"-meny.
- **Byggt (allt i `index.html`):**
  - **Flerradig redigering:** `openSheet` använder nu `<textarea>` som auto-växer (`growField`, tak 40vh sen scroll). Hela texten syns, ingen sidledsscroll. Enter=Klar, **Shift+Enter**=ny rad. Gäller all redigering (uppgift/idé/delsteg/projektnamn/addHere) eftersom de delar samma sheet.
  - **Klamp + "visa mer":** titlar och delstegs-titlar får `.clampable.clamp` (`-webkit-line-clamp:3`). "visa mer" renderas `hidden` och avslöjas bara när texten faktiskt svämmar över — mäts i `applyClamps()` (`scrollHeight>clientHeight`) efter varje render. `toggleMore()` fäller ut/ihop via klass-toggle, **ingen omritning** (inget hopp). Tryck på själva texten = redigera, som förut.
  - **Rad-struktur:** texten ligger nu i ett eget `.icontent`-block (`flex:1`, full bredd); knapparna är `.promote`/`.del` som kompakta 38×38-ikoner (`→` med `title="Gör till uppgift"`). `align-items:flex-start` + linjerade checkboxar/punkter mot första textraden. Snabb-fångst-fältet på hemmet lämnat som `<input>` (autofokus för Gboard-mic, ej redigering av lång befintlig text).
- **`VER` bumpad 1.8 → 1.9**, `sw.js`-cache `todonu-v2` → `todonu-v3` (tvingar färsk hämtning på installerad PWA).
- **Städning:** referens-skärmdumpen som råkade committas togs bort ur repot.
- **README.md** skapad — snabblänk till live-appen (https://saka1980.github.io/ToDoNu/) + kort beskrivning, så man enkelt når sidan från GitHub.

### Kvar / nästa steg
Oförändrat sedan förra sessionen: morgonnotis väg 2 (Periodic Background Sync) om in-app-hälsningen inte räcker. Teknisk skuld oförändrad (helrendering via `innerHTML`, lokal lagring utan synk) — se `STATUS.md`.

---

## 2026-05-29 — Femte sessionen (in-app morgonhälsning + STATUS/IDEAS)

Skapade `STATUS.md` + `IDEAS.md` (saknades; globala standarden läser dem vid sessionsstart) och byggde första steget av **morgonsammanfattning** (roadmap-punkt 2).

- **Designbeslut (med ägaren):** morgonnotis har tre vägar — (1) in-app morgonhälsning utan infra, (2) Periodic Background Sync + lokal notis (riktig notis, ingen backend, funkar på Pixel men ungefärlig tid), (3) web push + cron-backend (exakt, men slår i arkitektur-tripwiren). Ägaren valde **väg 1** — lägst risk, noll infrastruktur, rätt stegsten.
- **Byggt:** `morningDigest()` + `dismissMorning()`. Ett lugnt morgonkort högst upp på list-vyn som **ersätter** den vanliga hero/digest-raden vid **första öppning under morgontimmarna (04–11:59)**, en gång per dag. Innehåll: "God morgon." + antal öppna uppgifter + antal osorterade i inkorgen; tom dag → "Rent bord. Fånga en tanke när den kommer." Stängbart ×, lågpress-ton, ingen skam.
- **Persistens:** `localStorage["nu-morning"] = dagens datum` sätts när kortet visas (samma dismissal-mönster som `nu-ios-hint`/`nu-install-hint`). Ingen ändring i `stats`-modellen, ingen ändring i `sw.js`, inga nya beroenden.
- **`VER` bumpad 1.3 → 1.4** (cache-diagnos).

**UX-fix efter ägartest (bild):** efter att ha lagt till en uppgift (Enter / "＋ Lägg till") blev appen kvar på fångst-vyn med tomt fält — såg ut som att inget hände, och enda vägen tillbaka var en mörk-på-mörk `‹` uppe i hörnet, svår att se/träffa.
- **Fix 1:** `addItem()` sätter nu `s.view="list"` → fånga + tillbaka till huvudmenyn i ett steg; man ser uppgiften landa (räknaren uppdateras).
- **Fix 2:** bakåtknappen gjord till en tydlig pill (`‹ Tillbaka`, hög kontrast, 44px träffyta) för fallet "öppna fångst men ångra utan att lägga till".
- **`VER` bumpad 1.4 → 1.5.**

**Säkerhetskopia (export/import) byggd:** ägaren frågade var datan sparas → klargjorde att allt ligger i `localStorage` per enhet/webbläsare, ingen synk, och att en avinstallation av PWA:n *kan* (men inte garanterat) rensa lagringen. Beslut: bygg lokal backup utan backend.
- `exportData()` — laddar ner `{projects,items,stats}` som `todonu-backup-<datum>.json` (Blob + nedladdningslänk, metadata: app/ver/exportedAt).
- `pickImport()` + `importData(file)` — filväljare on demand, parsar + **validerar** (kräver `projects`-array), `confirm()` innan överskrivning (ersätter all data på enheten), `stats` mergas mot default-formen. Vänligt felmeddelande vid ogiltig fil.
- Diskret rad längst ner på huvudmenyn: `↓ Exportera säkerhetskopia` / `↑ Importera` (dämpad färg).
- Bara `index.html`, inga beroenden, ingen ändring i `sw.js`/datamodellen. **`VER` bumpad 1.5 → 1.6.**

**`load()` härdad mot korrupt data** (flaggad teknisk skuld sedan andra sessionen): förut körde `catch` → `seedIfEmpty()`, så oläsbar lagring ersattes tyst av demo-data och nästa `save()` skrev över den (kanske räddningsbara) råfilen.
- Nytt: läs råsträngen först (tom/saknad = första körning → seed). Vid **parse-fel** → sätt `loadError`, spara råsträngen till `nu-projekt-v1-korrupt` (skriver aldrig över en redan sparad råkopia), **seeda inte** och **spara inte** → inget skrivs över.
- Lugn varningsruta överst på huvudmenyn med `↓ Ladda ner råkopia` (ny `exportRaw()`) + `↑ Importera backup` (befintlig). Import rensar `loadError`.
- **`VER` bumpad 1.6 → 1.7.**
- Verifierat: `node --check` utan fel + simulering av fyra load-fall (null/giltig/korrupt/korrupt-igen) gav rätt beteende. Morgon-textfallen genomgångna.

**Fångst-flöde omdesignat efter ägarfeedback** — princip: *att lägga till sker på plats där man redan är och kastar aldrig ut en.* (Ersätter dagens tidigare "Fix 1" där `addItem()` hoppade till list-vyn — den övertolkade; den synliga `‹ Tillbaka` räcker som utgång.)
- **Tillägg på plats** i projekt/inkorg: `＋ uppgift` under Uppgifter och `＋ idé` under Idéer (`addHere(kind)` → glidande panel, ägarens val "panel underifrån"). Sektionen avgör typ, vyn avgör destination → **inga väljare, ingen redundans**. Man stannar kvar på sidan.
- **Orange + (FAB) bara på huvudsidan** (`s.view==="list"`) — borttagen inifrån projekt/inkorg, där tillägg nu sker via sektionsknapparna.
- **Huvudsidans fångst stannar kvar** efter Enter (revert av `s.view="list"`): fältet töms, autofokuseras igen, och statusraden visar `✓ Tillagt — fånga nästa` (`capMsg`, nollställs av `go()`). Man går ut själv via `‹ Tillbaka`. Samma "stanna tills jag väljer att gå ut"-logik överallt.
- **`VER` bumpad 1.7 → 1.8.** Verifierat: `node --check` utan fel; div-strukturen i projektvyn balanserad.

### Kvar / nästa steg
Morgonsammanfattningen är nu in-app. **Nästa naturliga steg om timingen inte räcker:** uppgradera till väg 2 (Periodic Background Sync → riktig lokal notis utan backend). Väg 3 (web push) väcker arkitektur-tripwiren. Övrig teknisk skuld oförändrad (se `STATUS.md`).

---

## 2026-05-29 — Fjärde sessionen (deluppgifter byggda)

Byggde **deluppgifter/checklista** (roadmap-punkt 6) — designen från andra sessionen, nu i kod.

- Datamodell: `steps[]` på `task` (`step={id,title,done}`), bakåtkompatibelt (saknat fält = ingen lista).
- `addStep`/`removeStep` via "＋ steg"-knapp på varje öppen uppgift (prompt-input, konsekvent med `addProject`); alltid synlig, indragen checklista + progress `x/y`.
- `toggleStep` med **riktad DOM-uppdatering** (per arkitekturbeslutet) — avbockning av steg är **tyst** (ingen gnista/pling/streak, tickar inte `todayCount`).
- Kaskad: huvuduppgiften klar → kvarvarande steg markeras klara.
- **Justering efter ägartest:** delsteg är **frikopplade** från uppgiftens klar-status — alla delsteg klara gör *inte* uppgiften klar (ägaren: "deluppgifterna klara innebär inte att uppgiften e klar"). Progress blir grön vid x/x i stället. Titlar (uppgift/idé/steg) gjordes redigerbara via klick eftersom redigering helt saknades.
- **Röst överallt:** ägaren saknade röst när man la till deluppgift (`prompt()` är bara text och bryter röst-först-idén). Beslut (med ägaren): ersätt **alla** `prompt()` med en återanvändbar **inmatnings-sheet** som glider upp underifrån. Gäller: lägg till deluppgift, redigera titel, nytt projekt.
- **Stora micen borttagen (v1.3):** efter att rutans mic skrotats visade det sig att även huvud-fångstens stora Web Speech-mic (a) inte transkriberar på ägarens telefon och (b) låser mikrofonen tills Chrome stängs ("hela poängen faller"). Beslut (med ägaren): ta bort den helt + all Web Speech-kod (`Recog`, `enableMic`, `startListen`…). Fångsten är nu bara ett autofokuserat textfält → tangentbordets diktering. Röst-först lever via tangentbordets mic. En egen mic-knapp på mobil skulle kräva moln-STT (backend).
- **Röst-saga på mobil (v0.8–v1.1):** den egna håll-mic-knappen i sheeten funkade inte på ägarens Pixel. Felsökning visade: (1) `getUserMedia`-warming **låste mikrofonen** ("funkar en gång sen aldrig", blockerade även tangentbordets mic) → tog bort + släpper mic vid stängning; (2) webbläsarens `webkitSpeechRecognition` är **opålitligt på Android** (funkar på desktop, tyst på mobil) och **släpper inte mic** vid push-to-talk → fastnar "på". **Slutsats (v1.1): ta bort in-app-micen ur sheeten helt** — fältet autofokuseras och **tangentbordets egen diktering** (Gboard) är pålitlig. Huvud-fångstens mic orörd. Lade till diskret versionsetikett (`VER`) vid loggan för cache-diagnos. Se minnesnot [[voice-input-mobile-keyboard]].
- UI-val av ägaren: alltid synlig (matchar "allt syns, inget göms") + "＋ steg"-knapp på uppgiften.
- Verifierat: `node --check` på script-blocket utan fel.

### Kvar / nästa steg
Kvar på roadmappen: **morgonnotis** (punkt 2 — nu vet vi att ägaren kör Android/Pixel, så web push via service worker är fullt möjligt; kräver dock backend/cron för schemalagd notis → väcker arkitektur-tripwiren). Röst-punkten (3) är överspelad — röst sker via tangentbordets diktering. **Nästa session: börja troligen med morgonnotis.**

---

## 2026-05-29 — Tredje sessionen (git + Pages + PWA byggd)

Avblockerade förra sessionens hängande punkt **och** byggde hela PWA-roadmappen.

### Git + GitHub Pages
- `git init` + första commit, gren `main`. Remote: **https://github.com/Saka1980/ToDoNu**.
- **GitHub Pages aktiverat** (Deploy from branch, `main`/root) av ägaren manuellt.
- Live-URL verifierad: **https://saka1980.github.io/ToDoNu/** — körs på **https**, så röst funkar på mobil.
- La till `.gitignore` för Windows. Sidospår: testade Actions-deploy men tog bort den — branch-deploy räcker.

### Buggfix — textfältet hoppade till typval
Vid skrift kallade `oninput` en full `render()` som förstörde `<input>` → fokus/markör försvann och typval-panelen hoppade fram. Fix: `#extra` renderas alltid och visas/döljs via `toggleExtra()` utan att röra fältet (riktad DOM-uppdatering, i linje med arkitekturbeslutet). Röstens `onresult` togglar likadant.

### PWA (roadmap-punkt 1) — KLAR, byggd i 5 steg
1. `manifest.json` (standalone, sv, relativa paths) + namnbyte **"Nu." → ToDoNu** (title, logotyp `ToDo`+ember-`Nu`, iOS-titel) + `icons/icon.svg`.
2. PNG-ikoner genererade med .NET System.Drawing (inga nya paket): 192/512/maskable-512 (full-bleed bg, motiv i säker zon) + apple-touch-icon 180. Inkopplade i manifest.
3. Service worker `sw.js`: **network-first för HTML** (deploys fastnar aldrig), **cache-first för assets**, versionerad cache. Registreras på load.
4. **Self-hostade typsnitt**: 6 `.woff2` (Fraunces variabel + Space Mono, latin + latin-ext; vietnamesiska hoppad) → `fonts/fonts.css`, Google Fonts-länken borttagen (GDPR + offline). SW bumpad v1→v2 och förcachar typsnitten.
5. `navigator.storage.persist()` + lågmäld iOS-hint för "Lägg till på hemskärmen" (bara iOS Safari, ej standalone, minns avvisning).
6. **Android install-knapp** via `beforeinstallprompt` — egen banderoll med Installera-knapp som öppnar Chromes install-ruta i ett tryck. Tillkom när det visade sig att ägaren kör **Google Pixel (Android), inte iPhone** → iOS-hinten är död kod för ägaren; mycket i roadmappens iOS-farhågor gäller inte. **Verifierat: installerad och fungerar på Pixel.**

### Kvar / nästa steg
PWA klar och verifierad på Android. Kvar på roadmappen: **morgonnotis** (punkt 2, klurig på iOS), **bryta ut röst-modulen** (punkt 3), **deluppgifter/checklista** (punkt 6, designad men ej byggd — bygg med riktad omritning). **Kvarstående risk:** iOS kan ändå rensa `localStorage` efter ~7 dagar; `persist()` mildrar men riktig lösning = IndexedDB/synk.

---

## 2026-05-29 — Andra sessionen (planering: PWA, deluppgifter, arkitektur)

Ren planeringssession — **inga kodändringar**. Tre beslut fattade och dokumenterade.

### Namnbyte
Appen döps om från "Nu." till **ToDoNu** överallt (manifest, `<title>`, synlig logotyp). Genomförs i PWA-steget.

### PWA (roadmap-punkt 1) — planerad, ej byggd
Detaljplan för installerbar PWA + offline:
- `manifest.json` (relativa paths för GitHub Pages-subpath, `display: standalone`, namn ToDoNu).
- `sw.js` — versionerad cache, network-first för HTML (deploys blir inte gamla), cache-first för assets.
- Genererade PNG-ikoner (192/512/maskable + apple-touch-icon) — itereras fram tillsammans.
- **Self-hostade typsnitt** (Fraunces + Space Mono) — tryggast offline + undviker IP-läckage till Google (linje med GDPR).
- iOS-hint för "Lägg till på hemskärmen" (ingen auto-prompt på iOS).
- **Största risk:** iOS kan vakuumera `localStorage` efter ~7 dagars inaktivitet → all data ligger där. Mildra med `navigator.storage.persist()`; riktig lösning = IndexedDB + synk på sikt.

### Deluppgifter (checklista) — designad, ej byggd
Nytt frivilligt `steps`-fält på uppgifter (`step = {id, title, done}`), bakåtkompatibelt utan migrering. Endast uppgifter (ej idéer). Avbocka sista steget → huvuduppgiften auto-klar; avbocka huvuduppgiften → kvarvarande steg markeras klara. **Glöd:** delsteg belönas tyst (ingen gnista/pling/streak), bara huvuduppgiften firar. Vald framför nästlade uppgifter för att hålla lågpress-tonen.

### Arkitektur — öppen fråga avgjord
"React+Vite vs vanilla" → **behåll vanilla nu + tripwire.** Migrera till Vite-SPA (ej full Next.js) först när: synk/flera enheter, UI > ~3–4 vyer med delat tillstånd, eller upprepad render-strul. Enda nuvarande svagheten (full `innerHTML`-omritning) löses i vanilla med riktade DOM-uppdateringar när deluppgifter byggs; röst bryts ut till egen ES-modul (roadmap-punkt 3) samtidigt.

### Kodgenomgång
Hela `index.html` (194 rader) läst. Sunt upplägg för en personlig app. Flaggat: (1) full `innerHTML`-omritning är enda svagheten (se arkitekturbeslut), (2) `load()` faller tillbaka på demo-data vid JSON-parse-fel → kan tyst skriva över korrupt lagring; värt att hantera när persistensen rörs i PWA-steget. Bra: titlar escapas (`esc`) före `innerHTML` → XSS-säkert.

### Kvar / blockering
Ultraplan-fjärrförfining kräver git-repo — `git init` ej körd, så överlämningen blockerades (föll fyra gånger). **Nästa steg: sätta upp git/GitHub, sedan bygga enligt plan.**

---

## 2026-05-29 — Första sessionen (idé → körbar app)

### Utgångspunkt
Ägaren ville bygga en egen to-do-webapp, anpassad efter sina behov. Första kraven: prioritering & deadlines, kategorier/projekt, återkommande uppgifter, anteckningar per uppgift, synk mellan enheter, minimalistisk känsla.

### Iteration 1 — klassisk to-do
Byggde en ren, varm (ljust papper) React-todo med alla fyra funktionerna och kontolagring (Claudes `window.storage`).
- **Lärdom:** `window.storage` funkar bara inuti Claude. För en fristående app krävs `localStorage`.

### Iteration 2 — "tänk vilt"
Ägaren bad om något nyskapande med fokus på minsta möjliga steg. Byggde **"Nu"**: ingen lista, utan ett kort i taget ("det viktigaste nu") + en-rads naturlig-språk-fångst (`!!! #tagg imorgon kl 14`).
- **Feedback:** för krångligt — syntaxen kräver att man *tänker*. "Kompakt" är inte samma som "enkelt".

### Iteration 3 — röst-först
Omtänk efter feedback: bort med all syntax. **Röst-först**, med datum och prioritet som *frivilliga tryck* efteråt. Textfält som reserv.
- Byggde fristående `nu.html` (vanilla + `localStorage`) för att kunna testa röst i egen webbläsare.

### Felsökning av röst (viktiga lärdomar)
- Mikrofonen är blockerad i Claudes förhandsruta (isolerad iframe) → röst kan inte testas där.
- Röstigenkänning stängde av vid första paus → satte `continuous = true` + auto-omstart tills användaren själv stoppar.
- Ändrade till **push-to-talk** (håll inne / släpp) på ägarens önskemål.
- **Stor lärdom:** mikrofontillstånd kräver `https`. På `file://` (lokalt öppnad fil) glömmer Chrome tillståndet och frågar varje gång; på mobil blockeras det ofta helt. → Slutsats: appen måste ligga på en riktig webbadress.
- La till engångs-aktivering via `getUserMedia` för att minska upprepade tillståndsrutor.

### Iteration 4 — det stora omtänket (efter intervju)
Detaljerad intervju med ägaren gav den avgörande insikten: det här är **inte en ren to-do-lista**. Det är ett ställe att fånga *både uppgifter och idéer*, samlat per **pågående projekt**, som betas av när man hinner.

Fastslaget från intervjun:
- Använder mest mobilen, i farten; lite av allt.
- Vill ha kul nog att fortsätta (→ gamification), påminnas i tid (→ morgonsammanfattning), inget ska falla mellan stolarna (→ inkorg).
- Projekt = pågående samlingar. Skilj på uppgifter och idéer. Kunna både snabb-dumpa i inkorg och lägga direkt i projekt.
- Belöningssystemet fick fria händer → konceptet **"Glöd"**: förlåtande streak som dämpas men aldrig nollställs, gnista + pling vid avbockning, extra fest när en idé blir verklighet.

Byggde React-prototyp med projekt/idéer/inkorg/Glöd. Bekräftade upplägget.

### Beslut: kör på riktigt
- Byggde produktionsklar **`index.html`** (vanilla, `localStorage`, röst med engångs-aktivering, grund-PWA-meta) avsedd för **GitHub Pages**.
- Nästa steg: migrera projektet till **Claude Code** och fortsätta där. Skapade `CLAUDE.md` + denna logg.

### Status vid sessionens slut
- `index.html` redo att deployas på GitHub Pages.
- Kvar: riktig PWA (manifest + service worker), morgonnotiser, utbruten röst-modul, arkitekturbeslut (React+Vite vs vanilla), ev. synk mellan enheter.
