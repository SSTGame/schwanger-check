const E = require("./engine.js");
let pass = 0, fail = 0;
function t(name, text, heated, expectVerdict, mustHave = [], mustNot = []) {
  const r = E.analyze(text, heated);
  const ids = r.items.map(i => i.id);
  const errs = [];
  if (r.verdict !== expectVerdict) errs.push(`verdict ${r.verdict} ≠ ${expectVerdict}`);
  mustHave.forEach(id => { if (!ids.includes(id)) errs.push(`fehlt ${id}`); });
  mustNot.forEach(id => { if (ids.includes(id)) errs.push(`fälschlich ${id}`); });
  if (errs.length) { fail++; console.log("✗", name, "→", errs.join("; "), JSON.stringify(r.items.map(i => [i.id, i.effective, i.matches]))); }
  else { pass++; console.log("✓", name, "→", r.verdict, ids.join(",")); }
}

// Tiefkühlpizza mit Räucherlachs (Beispielliste)
const lachsPizza = "Weizenmehl, Tomaten, Wasser, Mozzarella (pasteurisierte Milch), Lachs geräuchert (8 %), Blattspinat, Frischkäsezubereitung (Frischkäse, Zitronensaft), rote Zwiebeln, Rapsöl, Hefe, Salz, Sauerteig";
t("Lachspizza gebacken", lachsPizza, true, "ok", ["fischroh"], ["fisch", "rohwurst"]);
t("Lachspizza kalt", lachsPizza, false, "erhitzen", ["fischroh"]);
t("Räucherlachs Packung", "Atlantischer Lachs (Salmo salar), Salz, Buchenholzrauch. Kalt geräuchert.", false, "erhitzen", ["fischroh"]);
t("Hähnchenpizza", "Weizenmehl, Tomaten, Mozzarella, Hähnchenbrustfilet gegart (12 %), Paprika, Spinat, Frischkäse, Zitronensaft, Rapsöl, Hefe, Salz", true, "ok", [], ["fischroh", "rohwurst", "fisch"]);
t("Salamipizza kalt", "Weizenmehl, Tomaten, Käse, Salami (Schweinefleisch, Speck, Salz, Gewürze), Hefe", false, "erhitzen", ["rohwurst"]);
t("Salamipizza gebacken", "Weizenmehl, Tomaten, Käse, Salami (Schweinefleisch, Speck, Salz), Hefe", true, "ok", ["rohwurst"]);
t("Lachsschinken ≠ Fisch", "Lachsschinken aus der Schweinelachs, Nitritpökelsalz, Rauch", false, "erhitzen", ["rohwurst"], ["fisch", "fischroh"]);
t("Kochschinken", "Schweinefleisch (Hinterschinken) gekocht, Nitritpökelsalz, Dextrose", false, "ok", [], ["schinken", "rohwurst"]);
t("Schinken unklar", "Toast, Schinken, Käse", false, "hinweis", ["schinken"]);
t("Parmaschinken", "Prosciutto di Parma, Meersalz", false, "erhitzen", ["rohwurst"]);
t("Prosciutto cotto", "Prosciutto cotto (Schweinefleisch gekocht), Salz", false, "ok", [], ["rohwurst"]);
t("Tiramisu Fertig", "Mascarpone, Löffelbiskuit (Weizenmehl, Zucker, Eier), Zucker, Kaffee, Marsala, Kakao, Eigelb pasteurisiert", false, "meiden", ["alkohol", "koffein"]);
t("Weinessig ≠ Alkohol", "Gurken, Wasser, Branntweinessig, Weinessig, Zucker, Salz", false, "ok", [], ["alkohol"]);
t("Alkoholfreies Bier", "Wasser, Gerstenmalz, Hopfen. Alkoholfrei", false, "hinweis", ["alkoholfrei"], ["alkohol"]);
t("Weißbier", "Wasser, Weizenmalz, Hefe; Weizenbier 5,1 % vol", false, "meiden", ["alkohol"]);
t("Tonic Water", "Wasser, Zucker, Kohlensäure, Säuerungsmittel Citronensäure, Aroma, Chinin", false, "meiden", ["chinin"]);
t("Cola", "Wasser, Zucker, Kohlensäure, Farbstoff E150d, Säuerungsmittel Phosphorsäure, Aroma, Koffein", false, "massvoll", ["koffein"]);
t("Cola koffeinfrei", "Wasser, Zucker, Kohlensäure, Aroma. Koffeinfrei", false, "ok", [], ["koffein"]);
t("Energydrink", "Wasser, Zucker, Säuerungsmittel, Taurin (0,4 %), Koffein (0,03 %)", false, "meiden", ["energy", "koffein"]);
t("Camembert", "Camembert aus pasteurisierter Kuhmilch, Salz, Edelschimmelkulturen", false, "erhitzen", ["weichkaese"]);
t("Ofen-Camembert", "Camembert, Preiselbeeren", true, "ok", ["weichkaese"]);
t("Rohmilchkäse", "Käse aus Rohmilch, Salz, Lab", false, "erhitzen", ["rohmilch"]);
t("Gouda pasteurisiert", "Pasteurisierte Kuhmilch, Salz, Milchsäurekulturen, Lab", false, "ok", [], ["rohmilch", "weichkaese"]);
t("Leberwurst", "Schweinefleisch, Schweineleber (25 %), Speck, Salz", true, "meiden", ["leber"]);
t("Leberkäse ≠ Leber", "Schweinefleisch, Speck, Trinkwasser, Nitritpökelsalz – Fleischkäse/Leberkäse", true, "ok", [], ["leber"]);
t("Thunfisch Dose", "Thunfisch (Katsuwonus pelamis), Sonnenblumenöl, Salz", false, "massvoll", ["raubfisch", "fisch"]);
t("Sushi", "Sushi-Reis, Lachs roh, Nori, Essig", false, "erhitzen", ["fischroh"]);
t("Lakritz", "Zucker, Weizenmehl, Süßholzsaft, Salmiak", false, "massvoll", ["lakritz"]);
t("Fischstäbchen", "Alaska-Seelachsfilet (65 %), Paniermehl, Rapsöl, Salz", true, "ok", [], ["fischroh"]);
t("Rohrzucker + Fisch", "Makrelenfilet, Tomatensoße, Rohrzucker, Salz", false, "hinweis", ["fisch"], ["fischroh"]);
t("Pizza Fisch + geräucherter Speck", "Thunfisch, Tomaten, Käse, Zwiebeln, Paprika, Oliven, Rapsöl, Hefe; Speck geräuchert", true, "massvoll", ["raubfisch", "rohwurst"], ["fischroh"]);
t("Mayonnaise", "Rapsöl, Wasser, Eigelb (6 %), Branntweinessig, Zucker, Salz", false, "hinweis", ["ei"], ["rohei"]);
t("Sprossen", "Mungobohnensprossen", false, "erhitzen", ["sprossen"]);
t("Gin-Gurke? Ingwer", "Ingwer, Zucker, Gingerol-Extrakt", false, "ok", [], ["alkohol"]);
t("Rum-Rosinen", "Rosinen, Rum (2 %), Zucker", false, "meiden", ["alkohol"]);
t("Amarettini", "Zucker, Aprikosenkerne, Eiweiß – Amarettini", false, "hinweis", ["ei"], ["alkohol"]);
t("Leer", "", false, "ok");
t("Umlaut-frei getippt", "kaese aus rohmilch, raeucherlachs", false, "erhitzen", ["rohmilch", "fischroh"]);

// Spurenhinweise dürfen nicht als Zutat zählen
const haehnchen = "Weizenmehl, zerkleinerte Schältomaten (16%), Käse (12%) (schnittfester Mozzarella, Edamer), mariniertes Hähnchenfleisch, gegart (9,5%) (Hähnchenfleisch [9%], Rapsöl, Salz, Gewürze, Dextrose, Knoblauch), Wasser, Spinat (5%), Paprika (4%), Sauerteig (Wasser, Weizenmehl, Roggenmehl), Vollmilch, Frischkäse Doppelrahmstufe (1%), natives Olivenöl extra (1%), Salz, Zwiebeln (0,5%), Hefe, Weizenquellmehl, Rapsöl, Zucker, Stärke, Malzmehl (Gerste, Weizen), Kräuter, Gewürze, Knoblauch, Stabilisator: Guarkernmehl, Maltodextrin, Weizenstärke, Gewürzextrakt. Kann enthalten: Ei, Fisch, Lupine, Sellerie, Senf und Soja.";
t("Wagner Hähnchen (echte Daten)", haehnchen, true, "ok", [], ["fisch", "ei", "fischroh"]);
t("Spuren von …", "Zucker, Kakaobutter, Milchpulver. Kann Spuren von Ei, Fisch und Nüssen enthalten.", false, "ok", [], ["fisch", "ei"]);
t("Spuren ohne kann", "Zucker, Haselnüsse. Spuren von Erdnüssen, Ei und Fisch.", false, "ok", [], ["fisch", "ei"]);
t("Enthält möglicherweise", "Reis, Wasser, Salz. Enthält möglicherweise Fisch.", false, "ok", [], ["fisch"]);
t("Betrieb-Hinweis", "Mehl, Salz. Hergestellt in einem Betrieb, der auch Fisch und Ei verarbeitet.", false, "ok", [], ["fisch", "ei"]);
t("Echter Fisch + Spurenhinweis", "Lachs geräuchert, Salz. Kann Spuren von Senf enthalten.", false, "erhitzen", ["fischroh"]);
t("Echtes Ei + Spurenhinweis", "Nudeln (Hartweizengrieß, Eier 20%), Wasser. Kann Spuren von Soja enthalten.", true, "ok", ["ei"]);

console.log(`\n${pass} bestanden, ${fail} fehlgeschlagen`);
process.exit(fail ? 1 : 0);
