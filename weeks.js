/* Ungefähre Durchschnittswerte je Schwangerschaftswoche (SSW).
   Bis SSW 19 Scheitel-Steiß-Länge, ab SSW 20 Scheitel-Fersen-Länge. Jedes Baby wächst anders. */
(function (root) {
  "use strict";
  // [SSW, Länge cm, Gewicht g, Vergleich, Emoji, Entwicklung]
  var W = [
    [4, 0.1, 0, "ein Mohnsamen", "🌱", "Der Keim hat sich eingenistet. Die Fruchtblase und der Dottersack entstehen und versorgen ihn in den ersten Wochen."],
    [5, 0.2, 0, "ein Sesamkorn", "🌱", "Das Neuralrohr bildet sich, daraus werden Gehirn und Rückenmark. Ein winziges Herz beginnt sich anzulegen."],
    [6, 0.5, 0, "eine Linse", "🫘", "Das Herz schlägt – im Ultraschall oft schon als Flackern zu sehen. Arme und Beine zeigen sich als kleine Knospen."],
    [7, 1.0, 1, "eine Heidelbeere", "🫐", "Das Gehirn wächst schnell. Augen, Nase und Mund legen sich an, Hände und Füße sehen noch aus wie kleine Paddel."],
    [8, 1.6, 1, "eine Weintraube", "🍇", "Finger und Zehen beginnen sich zu trennen. Das Baby bewegt sich schon, auch wenn man es noch lange nicht spürt."],
    [9, 2.3, 2, "eine Kirsche", "🍒", "Alle wichtigen Organe sind angelegt. Der Schwanz des Embryos ist verschwunden, das Gesicht wird erkennbar."],
    [10, 3.1, 4, "eine Erdbeere", "🍓", "Ab jetzt heißt es Fötus. Die Organe reifen weiter, die ersten Zahnknospen entstehen im Kiefer."],
    [11, 4.1, 7, "eine kleine Kiwi", "🥝", "Der Kopf ist noch fast halb so groß wie der ganze Körper. Fingernägel beginnen zu wachsen."],
    [12, 5.4, 14, "eine Limette", "🍋", "Das Baby kann schon die Finger beugen und schlucken. Das Risiko einer Fehlgeburt sinkt jetzt deutlich."],
    [13, 7.4, 23, "eine Erbsenschote", "🫛", "Die Stimmbänder entstehen. Der Körper holt beim Wachstum gegenüber dem Kopf langsam auf."],
    [14, 8.7, 43, "eine Zitrone", "🍋", "Das Baby kann die Stirn runzeln und am Daumen nuckeln. Feiner Flaum (Lanugo) beginnt zu wachsen."],
    [15, 10.1, 70, "ein Apfel", "🍎", "Die Knochen werden fester. Das Baby nimmt Licht durch die geschlossenen Lider schon wahr."],
    [16, 11.6, 100, "eine Avocado", "🥑", "Die Muskeln werden kräftiger, die Bewegungen koordinierter. Manche spüren jetzt die ersten Bewegungen."],
    [17, 13.0, 140, "eine Zwiebel", "🧅", "Unter der Haut bildet sich das erste Fett. Das Skelett wandelt sich von Knorpel zu Knochen."],
    [18, 14.2, 190, "eine Paprika", "🫑", "Die Ohren sind an ihrem Platz, das Baby kann erste Geräusche hören – auch deine Stimme."],
    [19, 15.3, 240, "eine Mango", "🥭", "Eine schützende Schicht, die Käseschmiere, legt sich auf die Haut."],
    [20, 25.6, 300, "eine Banane", "🍌", "Halbzeit! Ab jetzt wird von Kopf bis Fuß gemessen. Tritte sind oft schon deutlich zu spüren."],
    [21, 26.7, 360, "eine Karotte", "🥕", "Das Baby schluckt Fruchtwasser und übt so die Verdauung. Schlaf- und Wachphasen werden regelmäßiger."],
    [22, 27.8, 430, "eine Salatgurke", "🥒", "Augenbrauen und Wimpern sind sichtbar. Der Tastsinn entwickelt sich, das Baby greift nach der Nabelschnur."],
    [23, 28.9, 500, "eine Grapefruit", "🍊", "Die Haut ist noch faltig und rötlich, weil das Fettpolster fehlt. Das Gehör wird immer besser."],
    [24, 30.0, 600, "ein Maiskolben", "🌽", "Die Lunge bildet Surfactant, einen Stoff, der später beim Atmen hilft. Das Gesicht ist fast fertig ausgebildet."],
    [25, 34.6, 660, "ein Blumenkohl", "🥦", "Das Baby reagiert auf vertraute Stimmen. Die Haare bekommen ihre Farbe."],
    [26, 35.6, 760, "ein Salatkopf", "🥬", "Die Augen öffnen sich zum ersten Mal. Das Baby übt Atembewegungen."],
    [27, 36.6, 875, "ein Brokkoli", "🥦", "Das Gehirn ist sehr aktiv. Das Baby hat vielleicht schon Schluckauf – als rhythmisches Zucken spürbar."],
    [28, 37.6, 1000, "eine Aubergine", "🍆", "Das 3. Trimester beginnt. Das Baby kann blinzeln und träumt vermutlich schon."],
    [29, 38.6, 1150, "ein Butternusskürbis", "🎃", "Muskeln und Lunge reifen weiter. Die Tritte werden kräftiger und manchmal auch unbequem."],
    [30, 39.9, 1300, "ein Weißkohl", "🥬", "Das Baby legt jetzt jede Woche etwa 200 Gramm zu. Der Flaum auf der Haut geht langsam zurück."],
    [31, 41.1, 1500, "eine Kokosnuss", "🥥", "Alle fünf Sinne funktionieren. Das Baby dreht den Kopf zu Geräuschen und Licht."],
    [32, 42.4, 1700, "eine Ananas", "🍍", "Fingernägel reichen bis an die Fingerspitzen. Viele Babys drehen sich jetzt mit dem Kopf nach unten."],
    [33, 43.7, 1900, "eine Ananas", "🍍", "Die Knochen werden härter, nur die Schädelplatten bleiben für die Geburt beweglich."],
    [34, 45.0, 2100, "eine Honigmelone", "🍈", "Das zentrale Nervensystem und die Lunge reifen weiter. Es wird enger im Bauch."],
    [35, 46.2, 2400, "eine Honigmelone", "🍈", "Die Nieren sind fertig entwickelt. Das Baby sammelt weiter Fettreserven für die Zeit nach der Geburt."],
    [36, 47.4, 2600, "ein Römersalat", "🥬", "Das Baby rutscht oft schon tiefer ins Becken. Das Atmen fällt der Mutter dann leichter."],
    [37, 48.6, 2900, "ein Mangold", "🥬", "Ab jetzt gilt das Baby als reif geboren. Es übt Saugen, Greifen und Blinzeln."],
    [38, 49.8, 3100, "ein Lauch", "🥬", "Die Organe sind bereit für das Leben draußen. Die Käseschmiere löst sich nach und nach."],
    [39, 50.7, 3300, "eine kleine Wassermelone", "🍉", "Das Baby legt noch etwas Fett zu und wartet auf seinen Startschuss."],
    [40, 51.2, 3500, "ein Kürbis", "🎃", "Der errechnete Termin! Nur wenige Babys kommen genau heute – zwei Wochen früher oder später sind normal."],
    [41, 51.5, 3600, "ein Kürbis", "🎃", "Das Baby ist bereit. Die Ärztin oder Hebamme kontrolliert jetzt engmaschig, wie es euch beiden geht."],
    [42, 51.7, 3700, "ein Kürbis", "🎃", "Spätestens jetzt wird meist über eine Einleitung der Geburt gesprochen."]
  ];
  var byWeek = {};
  W.forEach(function (r) { byWeek[r[0]] = { week: r[0], cm: r[1], g: r[2], fruit: r[3], emoji: r[4], text: r[5] }; });

  function get(w) {
    w = Math.max(4, Math.min(42, Math.round(w || 4)));
    return byWeek[w];
  }
  function fmtLen(cm) {
    if (cm < 1) return (cm * 10).toLocaleString("de-DE", { maximumFractionDigits: 0 }) + " mm";
    return cm.toLocaleString("de-DE", { maximumFractionDigits: 1 }) + " cm";
  }
  function fmtWeight(g) {
    if (g < 1) return "unter 1 g";
    if (g < 1000) return g.toLocaleString("de-DE") + " g";
    return (g / 1000).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " kg";
  }
  var api = { get: get, fmtLen: fmtLen, fmtWeight: fmtWeight, MIN: 4, MAX: 42 };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SSW = api;
})(this);
