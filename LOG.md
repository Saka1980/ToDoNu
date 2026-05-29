# Utvecklingslogg — Nu

Kronologisk logg över vad vi byggt och *varför*. Nyaste överst när nya rader läggs till.

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

### Kvar / nästa steg
PWA klar. Verifiera installation på riktig mobil (särskilt iOS). Kvar på roadmappen: **morgonnotis** (punkt 2, klurig på iOS), **bryta ut röst-modulen** (punkt 3), **deluppgifter/checklista** (punkt 6, designad men ej byggd — bygg med riktad omritning). **Kvarstående risk:** iOS kan ändå rensa `localStorage` efter ~7 dagar; `persist()` mildrar men riktig lösning = IndexedDB/synk.

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
