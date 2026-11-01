# Schwanger-Check

Lebensmittel per Barcode scannen und sofort sehen, ob sie in der Schwangerschaft unbedenklich sind.

- Live-Barcode-Scan mit der Handykamera (oder Foto / Nummer eintippen)
- Produktdaten und Zutaten aus [Open Food Facts](https://de.openfoodfacts.org)
- Prüfung nach den Empfehlungen von BfR und Netzwerk „Gesund ins Leben“
- Schwangerschaftswoche, Verlauf, Lexikon – alles bleibt auf dem Gerät
- Als App auf den Home-Bildschirm legbar (PWA), funktioniert teilweise offline

## Online stellen (GitHub Pages)
Repository → Settings → Pages → Source „Deploy from a branch“ → Branch `main`, Ordner `/ (root)` → Save.
Nach ca. 1 Minute läuft die App unter `https://<benutzername>.github.io/schwanger-check/`.

## Tests
`node test.js` prüft die Regeln mit 38 Beispielen.

Ersetzt keine Beratung durch Ärztin, Arzt oder Hebamme.
Barcode-Erkennung: ZXing (Apache-2.0). Produktdaten: Open Food Facts (ODbL).
