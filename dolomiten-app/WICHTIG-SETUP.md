# Dolomiten App — Setup nach dem Push

## ⚠️ WICHTIG: Environment Variable in Vercel

Die App nutzt jetzt eine SERVER-Funktion für geteilte Daten (sicherer).
Der Token muss OHNE VITE_ Prefix gesetzt sein:

Vercel → Projekt → Settings → Environment Variables:
- Key:   BLOB_READ_WRITE_TOKEN
- Value: vcp_8hrpDHYt7jvXEitAGq7VtdUJhM0mC9tsIfYkrojxz4qNZqRLKD1q88m5
- Environments: Production, Preview, Development (alle)

(Den alten VITE_VERCEL_BLOB_READ_WRITE_TOKEN kannst du löschen,
 wird nicht mehr gebraucht — der Token ist jetzt nur noch serverseitig.)

## Was ist neu

1. 📝 NOTIZEN pro Tag — editierbar, werden GETEILT gespeichert
   (du und deine Verlobte seht dieselben Notizen)
2. ✅ TODO + 🎒 PACKLISTE — Häkchen werden geteilt gespeichert
3. 📄 DOKUMENTE — PDF/Tickets pro Tag hochladen, für beide sichtbar
4. 🌤️ Wetter pro Tag, Outfit-Ideen, PDF-Export

## Wie es funktioniert

- /api/data.js   → speichert Notizen & Checklisten als JSON im Blob
- /api/upload.js → lädt Dateien hoch
- /api/files.js  → listet & löscht Dateien
- Token bleibt SERVERSEITIG geheim (steht nicht im Browser-Code)

## Push zu GitHub

git add .
git commit -m "Geteilte Daten, Notizen, Upload, Wetter, Packliste"
git push

Vercel deployed dann automatisch.
