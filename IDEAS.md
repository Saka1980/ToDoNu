# IDÉER — ToDoNu

> Pending idéer och öppna frågor. Läs den här vid sessionsstart. Lägg till nya idéer direkt när de dyker upp. När en idé byggs → flytta till `LOG.md` och uppdatera `STATUS.md`.

**Senast uppdaterad:** 2026-05-29

## Öppna frågor (kräver beslut)

- **Räcker in-app morgonhälsningen?** Steg 1 (in-app kort vid appöppning) är byggt. Det *påminner* inte aktivt — man måste öppna appen. Om det inte räcker: gå vidare till Periodic Background Sync (se nedan). Avvakta ägarens upplevelse.
- **Konto/synk — behövs det, eller räcker lokalt per enhet?** Utlöser i så fall arkitektur-tripwiren → Vite + ev. Supabase.

## Roadmap-idéer (ej byggda)

- **Riktig morgonnotis** (roadmap-punkt 2, steg 2) — **Periodic Background Sync** + lokal notis via service worker. Ingen backend, funkar på installerad PWA på Android/Pixel. Nackdel: tidpunkt ungefärlig (Chrome bestämmer, min ~12h), kräver notis-permission. Steg 3 = web push + cron-backend för exakt tid (väcker arkitektur-tripwiren).
- **Synk mellan enheter** (roadmap-punkt 5) — idag är allt lokalt per enhet.

## Arkitektur-tripwire (bevaka, inte en idé att bygga nu)

Behåll vanilla tills någon tröskel slår till — då migrera till **Vite-SPA** (ej full Next.js):
- (a) synk / flera enheter,
- (b) UI > ~3–4 vyer med delat interaktivt tillstånd,
- (c) upprepad kamp mot vanilla-renderingen.

## Medvetet INTE

- En egen in-app mic-knapp (Web Speech) — borttagen, fungerade ej + låste micen på Android. Återinför endast med moln-STT.
- Kalender, sträng deadline-app, funktionspackad projektledare — strider mot lågpress-tonen.
