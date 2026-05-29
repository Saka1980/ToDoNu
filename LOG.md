# Utvecklingslogg — Nu

Kronologisk logg över vad vi byggt och *varför*. Nyaste överst när nya rader läggs till.

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
- Verifierat: `node --check` på script-blocket utan fel (efter samtliga fix); de fyra morgon-textfallen genomgångna.

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
