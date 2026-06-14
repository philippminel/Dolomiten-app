# Dolomiten App — Deploy-Anleitung

## Schnellster Weg (ohne Token):

1. Diese ZIP entpacken
2. Auf https://vercel.com/new gehen
3. Den entpackten Ordner per Drag & Drop hochladen (oder "Browse")
4. Vercel erkennt Vite automatisch → "Deploy" klicken
5. Fertig! Live in ~60 Sekunden

## Für die Datei-Uploads (Blob Storage):

Nach dem Deploy in den Project Settings → Environment Variables:
- Key:   VITE_VERCEL_BLOB_READ_WRITE_TOKEN
- Value: dein vcp_... Blob Token
Dann einmal neu deployen (Redeploy).

## Updates später machen:

Option A — Du schickst mir die Änderung im Chat, ich gebe dir eine neue ZIP.
Option B — Projekt mit GitHub verbinden, dann Auto-Deploy bei jedem Push.

## Features:
- 6 Tage mit Programm, Wetter, Fotospots, Tipps
- Wetter pro Tag (Stand 14. Juni)
- Outfit-Ideen je Tag (inkl. Shooting-Tipps)
- Packliste (abgestimmt aufs Wetter)
- Karte mit Google/Apple Maps Links
- PDF Export (Plan + Packliste)
- Dokument-Upload pro Tag (Tickets, Buchungen)
- Buchungs-Checkliste mit Budget
