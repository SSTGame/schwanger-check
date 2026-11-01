// Prüflogik für Zutatenlisten in der Schwangerschaft.
// Grundlage: Empfehlungen des BfR und des Netzwerks "Gesund ins Leben".
// Stufen (schwächste → stärkste): hinweis < massvoll < erhitzen < meiden
(function (root) {
  "use strict";

  // Text vereinheitlichen: klein, Umlaute ausschreiben, Akzente weg.
  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/\s+/g, " ");
  }

  function any(t, list) { return list.some(function (re) { return re.test(t); }); }
  function hits(t, list) {
    var out = [];
    list.forEach(function (re) { var m = t.match(re); if (m) out.push(m[0].trim()); });
    return out;
  }
  // Ausdrücke vor der Suche entfernen (z. B. "alkoholfrei", "weinessig")
  function strip(t, list) { list.forEach(function (re) { t = t.replace(re, " "); }); return t; }

  var FISCH = /(lachs|forelle|makrele|\baal\b|heilbutt|thunfisch|hering|sprotte|saibling|kabeljau|seelachs|fisch|scholle|dorade|wolfsbarsch|zander|karpfen)/;
  var LACHSSCHINKEN = /(lachsschinken|schweinelachs\w*|lachsbraten|kasseler ?lachs|lachskotelett|lachsfleisch)/g;

  var RULES = [
    {
      id: "alkohol", level: "meiden", heatFixes: false,
      label: "Alkohol",
      reason: "In der Schwangerschaft gibt es keine sichere Menge. Beim Kochen und Backen verdampft Alkohol nicht vollständig.",
      strip: [/alkoholfrei\w*/g, /ohne alkohol/g, /alkohol ?gehalt ?< ?0[,.]5/g, /weinessig/g, /weinsaeure/g, /weinstein/g, /weintraube\w*/g, /weinbeere\w*/g, /bierhefe/g, /rumpsteak/g, /malzbier/g, /ingwerbier/g, /ginger ?beer/g, /aroma\w*\s*\(?\s*(?:enthaelt|mit)\s*(?:ethyl)?alkohol\)?/g, /(?:ethyl)?alkohol als traeger\w*/g, /traeger(?:stoff)?:?\s*\(?(?:ethyl)?alkohol\)?/g, /enthaelt alkohol aus (?:dem )?aroma\w*/g],
      test: [/alkohol/, /ethanol/, /\bwein\b/, /rotwein/, /weisswein/, /portwein/, /dessertwein/, /kochwein/, /\bsekt\b/, /prosecco/, /champagner/, /\brum\b/, /weinbrand/, /brandy/, /likoer/, /whiske?y/, /wodka|vodka/, /\bgin\b/, /\w*bier\b/, /marsala/, /cognac/, /schnaps/, /kirschwasser/, /grappa/, /sherry/, /calvados/, /obstbrand/, /spirituose/, /amaretto(?!ini)/, /\bmirin\b/, /\bsake\b/, /reiswein/, /shaoxing/]
    },
    {
      id: "chinin", level: "meiden", heatFixes: false,
      label: "Chinin",
      reason: "Chinin (z. B. in Tonic Water und Bitter Lemon) wird in der Schwangerschaft nicht empfohlen.",
      test: [/chinin/, /tonic/, /bitter ?lemon/]
    },
    {
      id: "energy", level: "meiden", heatFixes: false,
      label: "Energydrink",
      reason: "Energydrinks enthalten viel Koffein und weitere Wirkstoffe wie Taurin. Besser ganz verzichten.",
      test: [/taurin/, /energy ?drink/, /energydrink/, /glucuronolacton/]
    },
    {
      id: "leber", level: "meiden", heatFixes: false,
      label: "Leber",
      reason: "Leber und Leberprodukte enthalten sehr viel Vitamin A. Das kann dem Kind schaden, vor allem in den ersten drei Monaten.",
      strip: [/leberkaese/g],
      test: [/leber/]
    },
    {
      id: "rohmilch", level: "erhitzen", heatFixes: true,
      label: "Rohmilch",
      reason: "Rohmilch und Rohmilchkäse können Listerien enthalten. Ausnahme: lange gereifter Hartkäse wie Parmesan gilt als unbedenklich, die Rinde aber entfernen.",
      strip: [/(?:nicht|kein\w*) (?:aus )?rohmilch/g],
      test: [/rohmilch/, /roher milch/, /vorzugsmilch/, /lait cru/, /latte crudo/, /raw milk/]
    },
    {
      id: "weichkaese", level: "erhitzen", heatFixes: true,
      label: "Weichkäse mit Rinde",
      reason: "Weichkäse mit Schimmel- oder Schmierrinde (z. B. Camembert, Brie, Gorgonzola) kann Listerien enthalten, auch aus pasteurisierter Milch. Nur durcherhitzt essen.",
      test: [/camembert/, /\bbrie\b/, /gorgonzola/, /roquefort/, /limburger/, /romadur/, /\bmunster\b/, /muenster ?kaese/, /taleggio/, /blauschimmel/, /weissschimmel/, /edelschimmel/, /rotschmiere/, /weichkaese/, /harzer/, /sauermilchkaese/]
    },
    {
      id: "fischroh", level: "erhitzen", heatFixes: true,
      label: "Roher oder geräucherter Fisch",
      reason: "Roher, geräucherter (heiß und kalt) und gebeizter Fisch kann Listerien enthalten. Nur gut durcherhitzt essen.",
      // eigene Prüfung: Räucher-/Roh-Merkmal UND Fischwort, oder eindeutige Begriffe
      custom: function (t) {
        var tt = t.replace(LACHSSCHINKEN, " ");
        var direct = hits(tt, [/raeucherlachs/, /raeucherfisch/, /stremellachs/, /graved ?lachs/, /gravad ?lachs/, /gebeizte?r? lachs/, /bueckling/, /schillerlocke/, /sushi/, /sashimi/, /ceviche/, /matjes/, /rollmops/, /bismarckhering/, /\baustern?\b/, /raeucheraal/, /raeuchermakrele/, /raeucherforelle/, /kaviar/, /lachskaviar/, /forellenkaviar/, /fischrogen/]);
        if (direct.length) return direct;
        var mark = "(?:kalt ?|heiss ?)?(?:geraeuchert\\w*|gebeizt\\w*|\\broh(?:e|er|en)?\\b)";
        var fish = FISCH.source;
        var near = new RegExp(fish + "[^;]{0,25}?" + mark + "|" + mark + "[^;]{0,25}?" + fish);
        if (FISCH.test(tt) && /(\brauch\b|holzrauch|kalt ?geraeuchert|heiss ?geraeuchert)/.test(tt)) {
          return [tt.match(FISCH)[0] + " (geräuchert)"];
        }
        var nm = tt.match(near);
        if (nm) {
          var fm = nm[0].match(FISCH);
          return [fm[0] + " (geräuchert/roh)"];
        }
        return [];
      }
    },
    {
      id: "rohwurst", level: "erhitzen", heatFixes: true,
      label: "Rohwurst oder roher Schinken",
      reason: "Rohwurst (z. B. Salami, Mettwurst) und roher Schinken sind nicht erhitzt und können Listerien oder Toxoplasmen enthalten. Nur durcherhitzt essen, z. B. auf der Pizza.",
      strip: [/prosciutto cotto/g, /\bcotto\b/g],
      test: [/salami/, /mettwurst/, /teewurst/, /zwiebelmett/, /\bmett\b/, /hackepeter/, /\btatar\b/, /carpaccio/, /cervelat/, /chorizo/, /rohschinken/, /roher schinken/, /parmaschinken/, /prosciutto/, /serrano/, /iberico/, /bresaola/, /coppa\b/, /\bspeck/, /schinkenspeck/, /bacon/, /pancetta/, /lachsschinken/, /katenschinken/, /knochenschinken/, /nussschinken/, /schwarzwaelder schinken/, /luftgetrocknet/, /landjaeger/, /rohwurst/, /pfefferbeisser/, /\bnduja/]
    },
    {
      id: "rohei", level: "erhitzen", heatFixes: true,
      label: "Rohes Ei",
      reason: "Rohe oder weiche Eier können Salmonellen enthalten. Eier nur fest gegart essen.",
      strip: [/(?:pasteurisiert\w*|erhitzt\w*) (?:vollei|eigelb|ei)/g],
      test: [/rohes? ei/, /roh(?:e|en)? eier/, /\brohei/, /weiche?s? ei\b/, /tiramisu/, /mousse au chocolat/, /zabaione/]
    },
    {
      id: "sprossen", level: "erhitzen", heatFixes: true,
      label: "Rohe Sprossen",
      reason: "Rohe Sprossen und Keimlinge können Keime wie Listerien oder EHEC enthalten. Nur gegart essen.",
      test: [/sprossen/, /keimling/]
    },
    {
      id: "restalkohol", level: "massvoll", heatFixes: false,
      label: "Kann Restalkohol enthalten",
      reason: "Durch Gärung oder als Trägerstoff für Aroma entstehen kleine Mengen Alkohol, bei Sojasoße zum Beispiel um 2 %. In üblichen Mengen und gekocht ist das sehr wenig. Wer ganz verzichten möchte, würzt sparsam oder wählt Varianten ohne Alkohol.",
      test: [/soja ?(?:sosse|sauce|sose|wuerze)/, /sojawuerzsauce/, /\bshoyu\b/, /\btamari\b/, /teriyaki/, /\bkefir/, /kombucha/, /ginger ?beer/, /ingwerbier/, /\bkwass\b/, /malzbier/, /malztrunk/, /vanille ?extrakt/, /bourbon ?vanille ?extrakt/, /aroma\w*\s*\(?\s*(?:enthaelt|mit)\s*(?:ethyl)?alkohol/, /alkohol als traeger/, /traeger(?:stoff)?:?\s*\(?(?:ethyl)?alkohol/, /enthaelt alkohol aus/]
    },
    {
      id: "koffein", level: "massvoll", heatFixes: false,
      label: "Koffein",
      reason: "Bis etwa 200 mg Koffein am Tag gelten als unbedenklich. Das entspricht 2 bis 3 Tassen Kaffee.",
      strip: [/koffeinfrei\w*/g, /coffeinfrei\w*/g, /entkoffeiniert\w*/g, /ohne koffein/g],
      test: [/koffein/, /coffein/, /kaffee/, /espresso/, /\bmate\b/, /guarana/, /\bcola\b/, /colagetraenk/, /schwarztee/, /schwarzer tee/, /gruentee/, /gruener tee/, /matcha/]
    },
    {
      id: "lakritz", level: "massvoll", heatFixes: false,
      label: "Süßholz / Lakritz",
      reason: "Süßholz (Glycyrrhizin) kann in größeren Mengen Blutdruck und Schwangerschaft beeinflussen. Nur gelegentlich und in kleinen Mengen.",
      test: [/lakritz/, /suessholz/, /glycyrrhiz/, /salmiak/]
    },
    {
      id: "raubfisch", level: "massvoll", heatFixes: false,
      label: "Großer Raubfisch",
      reason: "Große Raubfische wie Thunfisch oder Schwertfisch können mehr Quecksilber enthalten. Thunfisch nur gelegentlich, Schwertfisch und Hai meiden.",
      test: [/thunfisch/, /schwertfisch/, /haifisch/, /\bhai\b/, /marlin/, /butterfisch/, /koenigsmakrele/]
    },
    {
      id: "fisch", level: "hinweis", heatFixes: true,
      label: "Fisch",
      reason: "Fisch ist gesund. Er sollte aber vollständig durchgegart sein.",
      custom: function (t) {
        var tt = t.replace(LACHSSCHINKEN, " ");
        var m = tt.match(FISCH);
        return m ? [m[0]] : [];
      },
      unless: ["fischroh"]
    },
    {
      id: "schinken", level: "hinweis", heatFixes: true,
      label: "Schinken – gekocht oder roh?",
      reason: "Gekochter Schinken ist unbedenklich. Roher oder geräucherter Schinken nur durcherhitzt essen.",
      custom: function (t) {
        if (/kochschinken|gekochte?r? schinken|hinterschinken|schinken,? gekocht|prosciutto cotto|vorderschinken|formfleisch/.test(t)) return [];
        var m = t.match(/schinken/);
        return m ? ["schinken"] : [];
      },
      unless: ["rohwurst"]
    },
    {
      id: "ei", level: "hinweis", heatFixes: true,
      label: "Ei",
      reason: "In Fertigprodukten ist Ei meist pasteurisiert. Bei Selbstgemachtem (Mayonnaise, Tiramisu, Mousse) auf rohe Eier achten.",
      test: [/\bvollei\b/, /\beigelb\b/, /\beiweiss\b/, /\bhuehnerei/, /\beier?\b/, /\beipulver/, /\bvolleipulver/],
      unless: ["rohei"]
    },
    {
      id: "alkoholfrei", level: "hinweis", heatFixes: false,
      label: "Alkoholfrei",
      reason: "Als \"alkoholfrei\" verkaufte Getränke dürfen bis zu 0,5 % Alkohol enthalten. Besser Varianten mit 0,0 % wählen.",
      test: [/alkoholfrei/]
    }
  ];

  var ORDER = { ok: 0, hinweis: 1, massvoll: 2, erhitzen: 3, meiden: 4 };

  // text: Zutatenliste (+ Produktname). heated: wird vor dem Essen durcherhitzt?
  // Spurenhinweise ("Kann enthalten: Ei, Fisch …") sind keine Zutaten und werden vor der Prüfung entfernt.
  var TRACES = [
    /(?:kann|koennen) (?:auch )?(?:spuren (?:von|an) )?[^.;]*?enthalten\b[^.;]*/g,
    /(?:kann|koennen) (?:auch )?enthalten:?[^.;]*/g,
    /(?:kann |koennen )?spuren (?:von|an)[^.;]*/g,
    /enthaelt moeglicherweise[^.;]*/g,
    /(?:hergestellt|produziert|verarbeitet) (?:in einem betrieb|auf anlagen|in einem werk)[^.;]*/g,
    /may contain[^.;]*/g,
    /allergiehinweis:?[^.;]*/g
  ];
  function stripTraces(t) { TRACES.forEach(function (re) { t = t.replace(re, " "); }); return t; }

  function analyze(text, heated) {
    var t = " " + stripTraces(norm(text)) + " ";
    var found = [];
    var ids = {};
    RULES.forEach(function (r) {
      var tt = r.strip ? strip(t, r.strip) : t;
      var h = r.custom ? r.custom(tt) : hits(tt, r.test);
      if (h.length) { ids[r.id] = true; found.push({ rule: r, matches: dedupe(h) }); }
    });
    found = found.filter(function (f) {
      return !(f.rule.unless || []).some(function (u) { return ids[u]; });
    });

    var items = found.map(function (f) {
      var eff = f.rule.level;
      if (heated && f.rule.heatFixes && (eff === "erhitzen" || eff === "hinweis")) eff = "ok";
      return { id: f.rule.id, label: f.rule.label, reason: f.rule.reason, level: f.rule.level, effective: eff, matches: f.matches, heatFixes: f.rule.heatFixes };
    });
    items.sort(function (a, b) { return ORDER[b.effective] - ORDER[a.effective]; });

    var worst = items.reduce(function (w, i) { return ORDER[i.effective] > ORDER[w] ? i.effective : w; }, "ok");
    var neededHeat = items.some(function (i) { return i.heatFixes && (i.level === "erhitzen"); });
    return { verdict: worst, items: items, conditionalOnHeat: heated && neededHeat, empty: !norm(text).trim() };
  }

  function dedupe(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

  var VERDICTS = {
    ok: { key: "ok", title: "Unbedenklich", short: "Keine kritischen Zutaten gefunden." },
    hinweis: { key: "ok", title: "Unbedenklich", short: "Keine kritischen Zutaten, nur Hinweise." },
    massvoll: { key: "massvoll", title: "In Maßen", short: "Gelegentlich und in kleinen Mengen okay." },
    erhitzen: { key: "erhitzen", title: "Nur durcherhitzt", short: "Nicht roh oder kalt essen." },
    meiden: { key: "meiden", title: "Besser meiden", short: "Enthält etwas, das in der Schwangerschaft nicht empfohlen wird." }
  };

  function worse(a, b) { return ORDER[a] >= ORDER[b] ? a : b; }

  var api = { analyze: analyze, stripTraces: stripTraces, norm: norm, RULES: RULES, VERDICTS: VERDICTS, ORDER: ORDER, worse: worse };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SchwangerCheck = api;
})(this);
