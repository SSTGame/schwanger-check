/* Schwanger-Check – App-Logik */
(function () {
  "use strict";
  var SC = window.SchwangerCheck;
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- Hilfen ---------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k === "html") n.innerHTML = v; // nur für eigene SVG-Konstanten
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    });
    (kids || []).forEach(function (c) { if (c != null && c !== false) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key) || "null");
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }
  var toastT;
  function toast(msg) {
    var t = $("toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 2600);
  }

  var ICON = {
    ok: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    massvoll: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M6 12h12"/></svg>',
    erhitzen: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3 4 4.5 4 9a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 0-8z"/></svg>',
    meiden: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    unklar: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M9 9a3 3 0 1 1 4 2.8c-.7.3-1 .8-1 1.5V14M12 18h.01"/></svg>',
    box: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/></svg>',
    flame: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3 4 4.5 4 9a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 0-8z"/></svg>'
  };
  var VERDICT = {
    ok: ["Unbedenklich", "Keine kritischen Zutaten gefunden."],
    massvoll: ["In Maßen", "Gelegentlich und in kleinen Mengen in Ordnung."],
    erhitzen: ["Nur durcherhitzt", "Nicht roh oder kalt essen. Gut durchgegart ist es in Ordnung."],
    meiden: ["Besser meiden", "Enthält etwas, das in der Schwangerschaft nicht empfohlen wird."],
    unklar: ["Zutaten fehlen", "Für dieses Produkt sind keine Zutaten hinterlegt."]
  };
  var CHIP = { ok: "Unbedenklich", hinweis: "Hinweis", massvoll: "In Maßen", erhitzen: "Nur erhitzt", meiden: "Meiden", unklar: "Unklar" };
  function vkey(v) { return v === "hinweis" ? "ok" : v; }
  function chip(level) { return el("span", { class: "chip v-" + level, text: CHIP[level] || level }); }

  /* ---------- Termin & Schwangerschaftswoche ---------- */
  var settings = store("sc.settings") || {};
  var DAY = 864e5;
  function today0() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function parseDate(iso) { var p = String(iso).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function isoDate(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  // Alte Speicherung (Woche + Datum) in einen Termin umrechnen
  if (!settings.due && settings.week && settings.setAt) {
    var s0 = new Date(settings.setAt); s0.setHours(0, 0, 0, 0);
    settings.due = isoDate(new Date(s0.getTime() + (40 - settings.week) * 7 * DAY));
    store("sc.settings", settings);
  }
  // Tag der Schwangerschaft (0 = erster Tag der letzten Periode, 280 = ET)
  function pregDay() {
    if (!settings.due) return null;
    return 280 - Math.round((parseDate(settings.due) - today0()) / DAY);
  }
  function currentWeek() {
    var d = pregDay();
    if (d == null) return null;
    return Math.max(1, Math.min(42, Math.floor(d / 7)));
  }
  function setDue(iso) {
    settings.due = iso || null; delete settings.week; delete settings.setAt;
    store("sc.settings", settings);
    viewWeek = null; renderWeek();
  }
  function shiftWeek(delta) {
    var base = settings.due ? parseDate(settings.due) : new Date(today0().getTime() + 28 * 7 * DAY);
    setDue(isoDate(new Date(base.getTime() - delta * 7 * DAY)));
  }
  function trimester(w) { return !w ? null : w <= 13 ? 1 : w <= 27 ? 2 : 3; }
  function sswText(d) { return "SSW " + Math.floor(d / 7) + "+" + (d % 7); }

  // Meilensteine: [ab SSW, Fähigkeit]
  var SKILLS = [
    [6, "Herz schlägt"], [8, "bewegt sich"], [10, "streckt sich"], [11, "gähnt"], [12, "schluckt"], [12, "beugt die Finger"],
    [14, "nuckelt am Daumen"], [14, "runzelt die Stirn"], [16, "greift"], [18, "hört Geräusche"], [20, "Tritte spürbar"],
    [22, "spürt Berührung"], [24, "erkennt deine Stimme"], [26, "öffnet die Augen"], [27, "hat Schluckauf"],
    [28, "blinzelt"], [28, "träumt"], [31, "dreht den Kopf zum Licht"], [32, "übt Atmen"], [34, "dreht sich in Geburtslage"], [37, "ist bereit für die Geburt"]
  ];

  // "Das Baby" in den Wochentexten durch den Namen ersetzen
  function personal(t) {
    var n = settings.babyName;
    if (!n) return t;
    return t.replace(/\b[Dd]as Baby\b/g, n).replace(/\bdem Baby\b/g, n).replace(/\bein Baby\b/g, n).replace(/\bdes Babys\b/g, "von " + n).replace(/\b(Viele|Wenige|Nur wenige) Babys\b/g, "$1 Babys");
  }

  var viewWeek = null, baby = null;
  function shownWeek() { return viewWeek || Math.max(4, currentWeek() || 12); }

  function renderWeek() {
    var w = currentWeek(), d = pregDay();
    var h = new Date().getHours();
    var hi = h < 11 ? "Guten Morgen" : h < 18 ? "Schönen Tag" : "Guten Abend";
    var partner = settings.role === "partner";
    $("greet").textContent = hi + (w ? (partner && settings.momName ? " · " + settings.momName + " ist im " + trimester(w) + ". Trimester" : " · " + trimester(w) + ". Trimester") : "");
    $("homeTitle").textContent = settings.name ? "Hallo " + settings.name : "Schwanger-Check";
    $("meName").value = settings.name || ""; $("meBaby").value = settings.babyName || "";
    $("weekPill").textContent = d != null ? sswText(Math.max(0, d)) : "Termin eintragen";
    $("meWeek").textContent = w || "–";
    $("meTri").textContent = d != null ? sswText(Math.max(0, d)) + " · " + trimester(w) + ". Trimester" : "Noch nicht eingetragen";
    $("meDue").value = settings.due || "";
    renderBaby();
    renderDue();
  }

  function renderBaby() {
    var cw = currentWeek(), sw = shownWeek(), info = window.SSW.get(sw);
    $("wkTitle").textContent = "Woche " + info.week;
    $("wkToday").hidden = !(viewWeek && cw && viewWeek !== Math.max(4, cw));
    $("wkPrev").disabled = info.week <= window.SSW.MIN;
    $("wkNext").disabled = info.week >= window.SSW.MAX;
    $("stLen").textContent = window.SSW.fmtLen(info.cm);
    $("stWeight").textContent = info.g < 1 ? "unter 1 g" : window.SSW.fmtWeight(info.g);
    $("stEmoji").textContent = info.emoji;
    $("stFruit").textContent = info.fruit;
    $("fbEmoji").textContent = info.emoji;
    $("devLabel").textContent = (viewWeek && viewWeek !== cw) ? "In Woche " + info.week : "Diese Woche";
    $("devText").textContent = personal(info.text);
    $("skillsLabel").textContent = "Das kann " + (settings.babyName || (settings.role === "partner" ? "euer Baby" : "dein Baby")) + " schon";
    $("dueLabel").textContent = settings.babyName ? "Bis " + settings.babyName + " kommt" : "Bis zum ET";
    $("stage").setAttribute("aria-label", "3D-Darstellung von " + (settings.babyName || "deinem Baby") + " in Woche " + info.week);
    var ul = $("skills"); ul.innerHTML = "";
    var have = SKILLS.filter(function (x) { return x[0] <= info.week; });
    if (!have.length) ul.appendChild(el("li", { text: "wächst und wächst" }));
    have.slice(-6).forEach(function (x) { ul.appendChild(el("li", null, [x[1], el("small", { text: "ab " + x[0] + ". W." })])); });
    var next = SKILLS.filter(function (x) { return x[0] > info.week; })[0];
    $("nextSkill").innerHTML = "";
    if (next) { $("nextSkill").append("Als Nächstes, etwa ab Woche " + next[0] + ": "); $("nextSkill").appendChild(el("b", { text: next[1] })); }
    if (baby) baby.setWeek(info.week);
  }

  function renderDue() {
    var d = pregDay();
    var tri = [[0, 13 * 7], [13 * 7, 27 * 7], [27 * 7, 280]];
    function setTri(day) { tri.forEach(function (r, i) { var f = day == null ? 0 : Math.max(0, Math.min(1, (day - r[0]) / (r[1] - r[0]))); $("tri" + (i + 1)).style.width = (f * 100) + "%"; }); }
    if (d == null) {
      $("dueLeft").textContent = "Termin eintragen";
      $("dueDate").textContent = "Unter „Ich“ den ET aus dem Mutterpass eintragen.";
      $("ringNum").textContent = "–"; $("ringUnit").textContent = "";
      $("dueFill").style.setProperty("--p", 0); $("dueBar").style.setProperty("--p", 0);
      $("dueSub").textContent = ""; setTri(null);
      return;
    }
    var left = 280 - d, due = parseDate(settings.due), txt, partner = settings.role === "partner";
    $("dueDate").textContent = "ET " + due.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
    if (left > 0) {
      var wk = Math.floor(left / 7), dd = left % 7;
      txt = (wk ? wk + (wk === 1 ? " Woche" : " Wochen") : "") + (wk && dd ? " und " : "") + (dd ? dd + (dd === 1 ? " Tag" : " Tage") : "");
      $("dueSub").textContent = settings.babyName ? "Noch " + left + (left === 1 ? " Tag" : " Tage") + ", bis " + (partner ? "ihr " : "du ") + settings.babyName + " im Arm " + (partner ? "haltet" : "hältst") + "." : "";
      $("ringNum").textContent = String(left); $("ringUnit").textContent = left === 1 ? "Tag" : "Tage";
    } else if (left === 0) {
      txt = "Heute ist der ET!"; $("dueSub").textContent = "Alles Gute für die Geburt."; $("ringNum").textContent = "0"; $("ringUnit").textContent = "Tage";
    } else {
      txt = (-left) + (left === -1 ? " Tag" : " Tage") + " über dem ET"; $("dueSub").textContent = "Ganz normal – nur wenige Babys kommen genau am Termin.";
      $("ringNum").textContent = "+" + (-left); $("ringUnit").textContent = "Tage";
    }
    $("dueLeft").textContent = txt;
    var p = Math.max(0, Math.min(1, d / 280));
    $("dueFill").style.setProperty("--p", p);
    $("dueBar").setAttribute("aria-valuenow", String(Math.max(0, Math.min(280, d))));
    $("dueBar").setAttribute("aria-valuetext", sswText(Math.max(0, d)));
    setTri(d);
  }

  // Nächster Termin und Schnellzugriff auf der Startseite
  function renderNext() {
    var T = window.SCTools; if (!T) return;
    var n = T.upcoming(1)[0], card = $("nextCard");
    if (!n) { card.hidden = true; return; }
    card.hidden = false;
    $("nextMon").textContent = n.date.toLocaleDateString("de-DE", { month: "short" }).replace(".", "");
    $("nextDay").textContent = String(n.date.getDate());
    var days = Math.round((n.date - today0()) / DAY);
    $("nextWhen").textContent = n.range ? (days <= 0 ? "Jetzt fällig" : "Ab " + n.from.toLocaleDateString("de-DE", { day: "numeric", month: "short" })) + " · bis " + n.to.toLocaleDateString("de-DE", { day: "numeric", month: "short" })
      : (days === 0 ? "Heute" : days === 1 ? "Morgen" : "In " + days + " Tagen") + (n.time ? " · " + n.time + " Uhr" : "");
    $("nextTitle").textContent = n.title;
  }
  function renderQuick() {
    var T = window.SCTools, box = $("quickTools"); if (!T) return;
    box.innerHTML = "";
    var d = pregDay(), late = d != null && d >= 28 * 7;
    var items = late ? [["kicks", "kick", "Tritte"], ["wehen", "timer", "Wehen"], ["meds", "pill", "Medikamente"], ["lists", "list", "Checklisten"]]
      : [["termine", "cal", "Termine"], ["meds", "pill", "Medikamente"], ["diary", "camera", "Tagebuch"], ["lists", "list", "Checklisten"]];
    items.forEach(function (x) { box.appendChild(el("button", { onclick: function () { T.open(x[0]); } }, [el("span", { class: "ico", html: T.icon(x[1]) }), x[2]])); });
  }
  function refreshHome() { renderWeek(); renderNext(); renderQuick(); renderRecent(); }

  // Woche-für-Woche-Liste
  function renderWeekList() {
    var box = $("weekList"); box.innerHTML = "";
    var cw = currentWeek();
    [[1, 4, 13], [2, 14, 27], [3, 28, 42]].forEach(function (t) {
      box.appendChild(el("h2", { class: "tri-head", text: t[0] + ". Trimester" }));
      var ul = el("ul", { class: "week-list" });
      for (var w = t[1]; w <= t[2]; w++) {
        var info = window.SSW.get(w);
        (function (w, info) {
          ul.appendChild(el("li", { class: w === cw ? "cur" : cw && w < cw ? "past" : "", id: "wk-" + w }, [el("button", { onclick: function () { viewWeek = w; renderBaby(); go("home"); } }, [
            el("span", { class: "wn" }, [String(w), el("small", { text: w === cw ? "JETZT" : "SSW" })]),
            el("span", { class: "wt" }, [el("b", { text: window.SSW.fmtLen(info.cm) + " · " + (info.g < 1 ? "unter 1 g" : window.SSW.fmtWeight(info.g)) + " · " + info.fruit }), el("span", { text: personal(info.text) })]),
            el("span", { class: "we", "aria-hidden": "true", text: info.emoji })
          ])]));
        })(w, info);
      }
      box.appendChild(ul);
    });
  }

  $("weekPill").addEventListener("click", function () { go("me"); });
  $("meMinus").addEventListener("click", function () { shiftWeek(-1); });
  $("mePlus").addEventListener("click", function () { shiftWeek(1); });
  function saveNames() {
    settings.name = $("meName").value.trim().slice(0, 30); settings.babyName = $("meBaby").value.trim().slice(0, 30); settings.namesAsked = true;
    store("sc.settings", settings); renderWeek();
  }
  $("meName").addEventListener("change", function () { saveNames(); toast("Gespeichert"); });
  $("meBaby").addEventListener("change", function () { saveNames(); toast("Gespeichert"); });
  $("meDue").addEventListener("change", function () { if (this.value) { setDue(this.value); toast("Termin gespeichert"); } });
  $("wkPrev").addEventListener("click", function () { viewWeek = Math.max(window.SSW.MIN, shownWeek() - 1); renderBaby(); });
  $("wkNext").addEventListener("click", function () { viewWeek = Math.min(window.SSW.MAX, shownWeek() + 1); renderBaby(); });
  $("wkToday").addEventListener("click", function () { viewWeek = null; renderBaby(); });

  function initBaby() {
    var stage = $("stage");
    if (!window.Baby3D || !window.Baby3D.supported()) { $("stageFallback").hidden = false; $("stageHint").hidden = true; return; }
    try {
      baby = new window.Baby3D(stage);
      baby.setWeek(shownWeek());
      if (!$("s-home").hidden && !document.hidden) baby.start();
      stage.addEventListener("pointerdown", function () { $("stageHint").style.opacity = "0"; }, { once: true });
    } catch (e) { baby = null; $("stageFallback").hidden = false; $("stageHint").hidden = true; }
  }
  function babyRun(on) { if (baby) { if (on) baby.start(); else baby.stop(); } }
  document.addEventListener("visibilitychange", function () { babyRun(!document.hidden && !$("s-home").hidden && sheet.hidden && $("scanner").hidden); });

  /* ---------- Tipps ---------- */
  var TIPS = [
    ["Pizza mit Salami oder Lachs?", "Kein Problem, wenn sie komplett durchgebacken ist. Die Mitte muss dampfen."],
    ["Käse mit Rinde", "Bei Schnittkäse die Rinde abschneiden. Camembert und Brie nur überbacken essen."],
    ["Kaffee", "Bis 200 mg Koffein am Tag gelten als unbedenklich, das sind etwa 2 bis 3 Tassen."],
    ["Salat aus der Tüte", "Geschnittener Fertigsalat kann Listerien enthalten. Lieber selbst frisch waschen und schneiden."],
    ["Reste", "Gekochtes schnell abkühlen, im Kühlschrank lagern und vor dem Essen wieder richtig heiß machen."],
    ["Tiefkühl-Beeren", "Vor dem Essen erhitzen, zum Beispiel als warmes Kompott."],
    ["Sojasoße", "Enthält durch die Gärung etwas Alkohol. Sparsam würzen, im heißen Wok verdampft ein Teil davon."],
    ["Obst und Gemüse", "Gründlich waschen, das schützt vor Toxoplasmose."]
  ];
  (function () {
    var t = TIPS[Math.floor(Date.now() / 864e5) % TIPS.length];
    if (!$("tipText")) return;
    $("tipText").innerHTML = "";
    $("tipText").appendChild(el("b", { text: t[0] }));
    $("tipText").appendChild(document.createTextNode(t[1]));
  })();

  /* ---------- Navigation ---------- */
  var SCREENS = ["home", "week", "tools", "me", "lex", "hist"];
  var TAB_OF = { lex: "tools", hist: "tools" };
  function go(s) {
    SCREENS.forEach(function (x) { $("s-" + x).hidden = x !== s; });
    var tab = TAB_OF[s] || s;
    document.querySelectorAll(".tab").forEach(function (t) {
      if (t.getAttribute("data-s") === tab) t.setAttribute("aria-current", "page"); else t.removeAttribute("aria-current");
    });
    if (s === "hist") renderHist();
    if (s === "home") refreshHome();
    if (s === "week") { renderWeekList(); setTimeout(function () { var c = $("wk-" + currentWeek()); if (c && c.scrollIntoView) c.scrollIntoView({ block: "center" }); }, 30); }
    if (s === "tools" && window.SCTools) window.SCTools.renderGrid($("toolGrid"));
    babyRun(s === "home");
    if (s !== "week") window.scrollTo(0, 0);
  }
  document.querySelectorAll(".tab").forEach(function (t) { t.addEventListener("click", function () { go(t.getAttribute("data-s")); }); });
  document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-go]"); if (b) go(b.getAttribute("data-go")); });

  /* ---------- Verlauf ---------- */
  function hist() { return store("sc.history") || []; }
  function saveEntry(e) {
    var h = hist().filter(function (x) { return !(e.code && x.code === e.code) && x.id !== e.id; });
    h.unshift(e);
    store("sc.history", h.slice(0, 60));
    renderRecent();
  }
  function rowFor(e) {
    var thumb = el("span", { class: "thumb" });
    if (e.img) { var im = el("img", { alt: "", loading: "lazy" }); im.src = e.img; im.onerror = function () { thumb.innerHTML = ICON.box; }; thumb.appendChild(im); }
    else thumb.innerHTML = ICON.box;
    var d = new Date(e.ts);
    return el("li", null, [el("button", { class: "prow", onclick: function () { openEntry(e); } }, [
      thumb,
      el("span", { class: "txt" }, [el("b", { text: e.name }), el("small", { text: (e.brand ? e.brand + " · " : "") + d.toLocaleDateString("de-DE", { day: "numeric", month: "short" }) })]),
      chip(vkey(e.verdict))
    ])]);
  }
  function renderRecent() {
    var ul = $("recent"); ul.innerHTML = "";
    var h = hist().slice(0, 4);
    if (!h.length) { ul.appendChild(el("li", null, [el("p", { class: "empty", text: "Noch nichts gescannt. Tippe auf „Barcode scannen“." })])); return; }
    h.forEach(function (e) { ul.appendChild(rowFor(e)); });
  }
  function renderHist() {
    var ul = $("hist"); ul.innerHTML = "";
    var h = hist();
    $("clearHist").hidden = !h.length;
    if (!h.length) { ul.appendChild(el("li", null, [el("p", { class: "empty", text: "Hier erscheinen alle Produkte, die du geprüft hast." })])); return; }
    h.forEach(function (e) { ul.appendChild(rowFor(e)); });
  }
  var clearArmed = false;
  $("clearHist").addEventListener("click", function () {
    if (!clearArmed) { clearArmed = true; $("clearHist").textContent = "Wirklich leeren?"; setTimeout(function () { clearArmed = false; $("clearHist").textContent = "Leeren"; }, 3000); return; }
    store("sc.history", []); clearArmed = false; $("clearHist").textContent = "Leeren"; renderHist(); renderRecent(); toast("Verlauf geleert");
  });

  /* ---------- Open Food Facts ---------- */
  var FIELDS = "code,product_name,product_name_de,generic_name_de,brands,ingredients_text_de,ingredients_text,lang,image_front_small_url,image_front_url,categories_tags,quantity";
  // Kategorien aus der Datenbank, die eindeutig auf ein Risiko hinweisen
  var CAT_HINTS = [
    [/^en:(non-alcoholic|alcohol-free|low-alcohol)-(beers?|wines?|sparkling-wines?|ciders?)$/, "alkoholfrei"],
    [/^en:(alcoholic-beverages|beers|lagers|wines|red-wines|white-wines|rose-wines|sparkling-wines|champagnes|spirits|liqueurs|ciders)$/, "alkohol"],
    [/^en:energy-drinks$/, "energydrink"],
    [/^en:tonic-waters?$/, "tonic"],
    [/^en:(smoked-salmons?|smoked-fishes|smoked-trouts?|smoked-mackerels?)$/, "räucherfisch"],
    [/^en:(gravlax|marinated-herrings|matjes)/, "graved lachs"],
    [/^en:sushi/, "sushi"],
    [/^en:(salamis?|dry-sausages|raw-sausages|fermented-sausages)$/, "salami"],
    [/^en:(dry-cured-hams?|raw-hams?|prosciutto|serrano-hams?|parma-hams?)$/, "rohschinken"],
    [/^en:raw-milk-cheeses$/, "rohmilch"],
    [/^en:(camemberts?|bries?|soft-cheeses-with-bloomy-rind|soft-cheeses-with-washed-rind|blue-cheeses|gorgonzolas?|roqueforts?)$/, "weichkäse"],
    [/^en:(liver-sausages|livers|liver-pates|pates-de-foie)/, "leber"],
    [/^en:(liquorices?|licorice-candies)/, "lakritz"],
    [/^en:(soy-sauces?|soya-sauces?|tamari)$/, "sojasauce"],
    [/^en:teriyaki-sauces?$/, "teriyaki"],
    [/^en:kefirs?$/, "kefir"],
    [/^en:kombuchas?$/, "kombucha"],
    [/^en:(malt-beverages|malt-drinks|malzbiere?)$/, "malzbier"],
    [/^en:ginger-beers?$/, "ginger beer"],
    [/^en:(canned-tunas?|tunas?)$/, "thunfisch"],
    [/^en:(coffees|ground-coffees|coffee-beans|instant-coffees|colas)$/, "koffein"]
  ];
  var HEAT_CATS = /^en:(pizzas|frozen-pizzas|pizzas-pies-and-quiches|frozen-ready-made-meals|frozen-foods|soups|lasagnas?|quiches|frozen-fish-fillets|fish-fingers|breaded-fish|raw-meats|fresh-sausages|frozen-vegetables)$/;
  var HEAT_NAME = /(pizza|tiefk[uü]hl|lasagne|auflauf|zum braten|zum backen|backofen|suppe|flammkuchen|quiche)/i;

  function catText(tags) {
    var words = [];
    (tags || []).forEach(function (t) { CAT_HINTS.forEach(function (c) { if (c[0].test(t) && words.indexOf(c[1]) === -1) words.push(c[1]); }); });
    if (words.indexOf("alkoholfrei") !== -1) words = words.filter(function (w) { return w !== "alkohol"; });
    return words.join(", ");
  }
  function guessHeated(p) {
    if ((p.categories_tags || []).some(function (t) { return HEAT_CATS.test(t); })) return true;
    return HEAT_NAME.test((p.product_name_de || "") + " " + (p.product_name || ""));
  }
  function fromOFF(code, p) {
    var ingDe = (p.ingredients_text_de || "").trim();
    var ing = ingDe || (p.ingredients_text || "").trim();
    return {
      id: code, code: code, source: "off",
      name: (p.product_name_de || p.product_name || p.generic_name_de || "").trim() || "Unbekanntes Produkt",
      brand: String(p.brands || "").split(",")[0].trim(),
      qty: p.quantity || "",
      img: p.image_front_small_url || p.image_front_url || "",
      ingredients: ing,
      foreignIng: !ingDe && !!ing && p.lang && p.lang !== "de" ? p.lang : "",
      cats: catText(p.categories_tags),
      heated: guessHeated(p),
      ts: Date.now()
    };
  }
  function evaluate(e) {
    var text = [e.name, e.ingredients, e.cats].filter(Boolean).join(". ");
    var r = SC.analyze(text, !!e.heated);
    var verdict = r.verdict;
    if (!e.ingredients.trim()) verdict = SC.ORDER[verdict] >= SC.ORDER.massvoll ? verdict : "unklar";
    return { verdict: verdict, items: r.items, conditional: r.conditionalOnHeat && verdict !== "unklar" };
  }

  /* ---------- Bogen (Ergebnis, Eingaben) ---------- */
  var sheet = $("sheet"), body = $("sheetBody");
  function openSheet() {
    babyRun(false);
    sheet.hidden = false; sheet.classList.remove("anim"); void sheet.offsetWidth; sheet.classList.add("anim");
    sheet.scrollTop = 0; document.body.style.overflow = "hidden";
  }
  function closeSheet() { sheet.hidden = true; document.body.style.overflow = ""; renderRecent(); babyRun(!$("s-home").hidden && $("scanner").hidden); }
  $("sheetClose").addEventListener("click", closeSheet);
  $("sheetScan").addEventListener("click", function () { closeSheet(); openScanner(); });

  function loading(code) {
    body.innerHTML = "";
    body.appendChild(el("div", { class: "center" }, [el("div", { class: "spinner", "aria-hidden": "true" }), el("p", { class: "lead", text: "Suche Produkt " + code + " …" })]));
  }

  function openEntry(e) { openSheet(); showResult(e); }

  function showResult(e) {
    var ev = evaluate(e);
    e.verdict = ev.verdict;
    var w = currentWeek(), tri = trimester(w);
    body.innerHTML = "";

    var img = el("div", { class: "prod-img" });
    if (e.img) { var im = el("img", { alt: "" }); im.src = e.img; im.onerror = function () { img.innerHTML = ICON.box; }; img.appendChild(im); } else img.innerHTML = ICON.box;
    body.appendChild(el("div", { class: "prod-head" }, [img, el("div", { class: "txt" }, [
      el("small", { text: [e.brand, e.qty].filter(Boolean).join(" · ") || (e.code ? "EAN " + e.code : "Eigene Eingabe") }),
      el("h1", { text: e.name })
    ])]));

    var v = vkey(ev.verdict);
    body.appendChild(el("div", { class: "verdict v-" + v, role: "status" }, [
      el("span", { class: "badge", html: ICON[v], "aria-hidden": "true" }),
      el("div", null, [el("h2", { text: VERDICT[v][0] }), el("p", { text: ev.conditional ? "Okay, weil es vor dem Essen durcherhitzt wird." : VERDICT[v][1] })])
    ]));

    var seg = el("div", { class: "seg", role: "group", "aria-label": "Wie wird es gegessen?" }, [
      el("button", { "aria-pressed": e.heated ? "true" : "false", text: "Gegart / erhitzt", onclick: function () { if (!e.heated) { e.heated = true; saveEntry(e); showResult(e); } } }),
      el("button", { "aria-pressed": e.heated ? "false" : "true", text: "Kalt / wie es ist", onclick: function () { if (e.heated) { e.heated = false; saveEntry(e); showResult(e); } } })
    ]);
    body.appendChild(el("div", { class: "field" }, [el("p", { class: "label", text: "So wird es gegessen" }), seg]));

    if (ev.conditional) {
      body.appendChild(el("div", { class: "cond" }, [el("span", { html: ICON.flame, "aria-hidden": "true" }),
        el("p", { text: "Nur sicher, wenn es komplett durcherhitzt wird: Packungsangabe einhalten, die Mitte muss dampfen. Reste nicht kalt essen." })]));
    }

    var card = el("div", { class: "card" });
    if (ev.verdict === "unklar") {
      card.appendChild(el("p", { text: "Tippe die Zutatenliste von der Packung ab, dann prüft die App sie sofort. Beim nächsten Scan ist sie gespeichert." }));
      card.appendChild(ingredientForm(e));
    } else if (ev.items.length) {
      card.appendChild(el("p", { class: "label", text: "Darum" }));
      var ul = el("ul", { class: "items" });
      ev.items.forEach(function (i) {
        var lvl = i.effective === "ok" ? (i.level === "hinweis" ? "hinweis" : "ok") : i.effective;
        var h3 = el("h3", null, [i.label]);
        i.matches.slice(0, 3).forEach(function (m) { h3.appendChild(el("span", { class: "found", text: m })); });
        var extra = null;
        if (i.id === "leber" && tri === 1) extra = el("p", { class: "tri", text: "Du bist im 1. Trimester – gerade jetzt besonders wichtig." });
        ul.appendChild(el("li", { class: "v-" + lvl }, [el("span", { class: "dot", "aria-hidden": "true" }), h3,
          el("p", { text: i.reason + (i.effective === "ok" && i.level === "erhitzen" ? " Wird hier durcherhitzt." : "") }), extra]));
      });
      card.appendChild(ul);
    } else {
      card.appendChild(el("p", { class: "label", text: "Darum" }));
      card.appendChild(el("p", { text: "Keine der bekannten Risiko-Zutaten gefunden: kein Alkohol, keine Rohmilch, kein roher oder geräucherter Fisch, keine Rohwurst, kein rohes Ei, keine Leber, kein Chinin." }));
    }
    if (e.foreignIng) card.appendChild(el("p", { class: "src", text: "Hinweis: Die Zutaten sind in der Datenbank nur in einer anderen Sprache (" + e.foreignIng + ") hinterlegt. Die Prüfung kann ungenauer sein." }));
    if (e.ingredients && ev.verdict !== "unklar") {
      card.appendChild(el("details", null, [el("summary", { text: "Zutaten anzeigen" }), el("p", { text: e.ingredients })]));
    }
    body.appendChild(card);

    if (e.source === "off") {
      body.appendChild(el("p", { class: "src" }, ["Produktdaten von ", el("a", { href: "https://de.openfoodfacts.org/produkt/" + e.code, target: "_blank", rel: "noopener", text: "Open Food Facts" }), " · EAN " + e.code + ". Stimmt etwas nicht? Dort kannst du den Eintrag korrigieren."]));
    } else if (e.code) {
      body.appendChild(el("p", { class: "src", text: "Von dir eingegeben · EAN " + e.code }));
    }
    if (ev.verdict !== "unklar") saveEntry(e);
  }

  function ingredientForm(e) {
    var ta = el("textarea", { id: "ingForm", "aria-label": "Zutatenliste", placeholder: "z. B. Weizenmehl, Tomaten, Mozzarella, Salami …" });
    ta.value = e.ingredients || "";
    var btn = el("button", { class: "btn", text: "Zutaten prüfen", onclick: function () {
      if (!ta.value.trim()) { ta.focus(); toast("Bitte zuerst Zutaten eingeben"); return; }
      e.ingredients = ta.value.trim(); e.source = e.source === "off" ? "off" : "custom"; e.ts = Date.now();
      if (e.code) { var c = store("sc.custom") || {}; c[e.code] = { name: e.name, ingredients: e.ingredients }; store("sc.custom", c); }
      showResult(e); sheet.scrollTop = 0;
    } });
    return el("div", { class: "field" }, [ta, btn]);
  }

  function notFound(code, offline) {
    var c = (store("sc.custom") || {})[code];
    if (c) { showResult({ id: code, code: code, source: "custom", name: c.name, brand: "", img: "", ingredients: c.ingredients, cats: "", heated: false, ts: Date.now() }); return; }
    body.innerHTML = "";
    var name = el("input", { class: "input", id: "nfName", placeholder: "Produktname (optional)", "aria-label": "Produktname" });
    var e = { id: code, code: code, source: "custom", name: "", brand: "", img: "", ingredients: "", cats: "", heated: false, ts: Date.now() };
    var ta = el("textarea", { id: "nfIng", "aria-label": "Zutatenliste", placeholder: "Zutaten von der Packung abtippen …" });
    var heated = false;
    var seg = el("div", { class: "seg", role: "group", "aria-label": "Wie wird es gegessen?" });
    function drawSeg() {
      seg.innerHTML = "";
      seg.appendChild(el("button", { "aria-pressed": heated ? "true" : "false", text: "Gegart / erhitzt", onclick: function () { heated = true; drawSeg(); } }));
      seg.appendChild(el("button", { "aria-pressed": heated ? "false" : "true", text: "Kalt / wie es ist", onclick: function () { heated = false; drawSeg(); } }));
    }
    drawSeg();
    body.appendChild(el("div", { class: "center", style: "padding:16px 0 4px" }, [
      el("div", { class: "prod-img", html: ICON.box }),
      el("h1", { class: "title", style: "font-size:1.6rem", text: offline ? "Keine Verbindung" : "Noch nicht in der Datenbank" }),
      el("p", { class: "lead", text: offline ? "Die Produktdaten konnten nicht geladen werden. Prüfe die Internetverbindung oder tippe die Zutaten ab." : "Das Produkt mit der Nummer " + code + " ist bei Open Food Facts noch nicht eingetragen. Neue Produkte fehlen dort oft noch." })
    ]));
    body.appendChild(el("div", { class: "card" }, [
      el("p", { class: "label", text: "Zutaten selbst prüfen" }), name, ta,
      el("p", { class: "label", text: "So wird es gegessen" }), seg,
      el("button", { class: "btn", text: "Prüfen", onclick: function () {
        if (!ta.value.trim()) { ta.focus(); toast("Bitte zuerst Zutaten eingeben"); return; }
        e.name = name.value.trim() || "Produkt " + code; e.ingredients = ta.value.trim(); e.heated = heated;
        var cs = store("sc.custom") || {}; cs[code] = { name: e.name, ingredients: e.ingredients }; store("sc.custom", cs);
        showResult(e); sheet.scrollTop = 0;
      } })
    ]));
    if (!offline) body.appendChild(el("p", { class: "src" }, ["Du kannst das Produkt auch ", el("a", { href: "https://de.openfoodfacts.org/produkt/" + code, target: "_blank", rel: "noopener", text: "bei Open Food Facts eintragen" }), ", dann finden es alle."]));
  }

  async function lookup(code) {
    openSheet(); loading(code);
    var cached = hist().filter(function (x) { return x.code === code; })[0];
    try {
      var ctl = new AbortController(); var to = setTimeout(function () { ctl.abort(); }, 12000);
      var r = await fetch("https://world.openfoodfacts.org/api/v2/product/" + encodeURIComponent(code) + ".json?fields=" + FIELDS, { signal: ctl.signal, headers: { Accept: "application/json" } });
      clearTimeout(to);
      var j = null; try { j = await r.json(); } catch (x) {}
      if (j && j.status === 1 && j.product) {
        var e = fromOFF(code, j.product);
        if (!e.ingredients) { var c = (store("sc.custom") || {})[code]; if (c) { e.ingredients = c.ingredients; e.source = "custom"; } }
        if (cached && typeof cached.heated === "boolean") e.heated = cached.heated;
        showResult(e);
      } else if (j && j.status === 0) notFound(code, false);
      else throw new Error("bad");
    } catch (err) {
      if (cached) { showResult(cached); toast("Offline – gespeichertes Ergebnis"); }
      else notFound(code, true);
    }
  }

  /* ---------- Barcode ---------- */
  function validEAN(code) {
    if (!/^\d{8}$|^\d{12,14}$/.test(code)) return false;
    var digits = code.split("").map(Number), check = digits.pop(), sum = 0;
    digits.reverse().forEach(function (d, i) { sum += d * (i % 2 === 0 ? 3 : 1); });
    return (10 - (sum % 10)) % 10 === check;
  }
  function normCode(raw) {
    var c = String(raw || "").replace(/\D/g, "");
    if (c.length === 12) c = "0" + c; // UPC-A → EAN-13
    return c;
  }
  var FORMATS_BD = ["ean_13", "ean_8", "upc_a", "upc_e"];
  function zxHints() {
    var Z = window.ZXing, hints = new Map();
    hints.set(Z.DecodeHintType.POSSIBLE_FORMATS, [Z.BarcodeFormat.EAN_13, Z.BarcodeFormat.EAN_8, Z.BarcodeFormat.UPC_A, Z.BarcodeFormat.UPC_E]);
    hints.set(Z.DecodeHintType.TRY_HARDER, true);
    return hints;
  }
  async function getDetector() {
    if (!("BarcodeDetector" in window)) return null;
    try {
      var sup = await window.BarcodeDetector.getSupportedFormats();
      var f = FORMATS_BD.filter(function (x) { return sup.indexOf(x) !== -1; });
      return f.length ? new window.BarcodeDetector({ formats: f }) : null;
    } catch (e) { return null; }
  }

  var scanner = $("scanner"), video = $("video"), stream = null, scanning = false, track = null, torchOn = false;
  function scanErr(msg) { $("scanErr").textContent = msg; $("scanErr").hidden = !msg; $("scanMsg").hidden = !!msg; }

  async function openScanner() {
    babyRun(false);
    scanner.hidden = false; document.body.style.overflow = "hidden";
    scanErr(""); $("frame").classList.remove("hit"); $("torch").hidden = true;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      scanErr("Die Kamera ist hier nicht verfügbar. Öffne die App über https oder tippe die Nummer ein."); return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } } });
    } catch (e) {
      scanErr(e && e.name === "NotAllowedError"
        ? "Kein Zugriff auf die Kamera. Erlaube ihn in den Einstellungen deines Browsers oder tippe die Nummer unter dem Barcode ein."
        : "Die Kamera konnte nicht gestartet werden. Tippe die Nummer ein oder wähle ein Foto.");
      return;
    }
    if (scanner.hidden) { stopStream(); return; }
    video.srcObject = stream;
    try { await video.play(); } catch (e) {}
    if (!stream || scanner.hidden) return; // Scanner wurde inzwischen geschlossen
    track = stream.getVideoTracks()[0];
    try { var caps = track.getCapabilities ? track.getCapabilities() : {}; $("torch").hidden = !caps.torch; } catch (e) {}
    scanning = true;
    var det = await getDetector();
    if (det) {
      (function loop() {
        if (!scanning) return;
        det.detect(video).then(function (codes) {
          for (var i = 0; i < codes.length; i++) { if (gotCode(codes[i].rawValue)) return; }
          setTimeout(loop, 120);
        }).catch(function () { setTimeout(loop, 250); });
      })();
    } else {
      if (!window.ZXing) { await new Promise(function (r) { var t = setInterval(function () { if (window.ZXing || !scanning) { clearInterval(t); r(); } }, 100); }); }
      if (!scanning) return;
      // Eigene Schleife: Bildausschnitt aus der Kamera in ein Canvas zeichnen und dekodieren
      var Z = window.ZXing, reader = new Z.MultiFormatReader(); reader.setHints(zxHints());
      var cv = document.createElement("canvas"), ctx = cv.getContext("2d", { willReadFrequently: true });
      (function zloop() {
        if (!scanning) return;
        var vw = video.videoWidth, vh = video.videoHeight;
        if (vw && vh) {
          var cw = vw * 0.9, ch = vh * 0.5, sx = (vw - cw) / 2, sy = (vh - ch) / 2;
          var sc = Math.min(1, 1000 / cw);
          cv.width = Math.round(cw * sc); cv.height = Math.round(ch * sc);
          ctx.drawImage(video, sx, sy, cw, ch, 0, 0, cv.width, cv.height);
          try {
            var res = reader.decode(new Z.BinaryBitmap(new Z.HybridBinarizer(new Z.HTMLCanvasElementLuminanceSource(cv))));
            if (res && gotCode(res.getText())) return;
          } catch (e) { /* kein Code in diesem Bild */ }
        }
        setTimeout(zloop, 140);
      })();
    }
  }
  function gotCode(raw) {
    var code = normCode(raw);
    if (!validEAN(code)) return false;
    scanning = false;
    $("frame").classList.add("hit");
    if (navigator.vibrate) navigator.vibrate(60);
    setTimeout(function () { closeScanner(); lookup(code); }, 180);
    return true;
  }
  function stopStream() {
    scanning = false;
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    video.srcObject = null; track = null; torchOn = false;
  }
  function closeScanner() { stopStream(); scanner.hidden = true; document.body.style.overflow = sheet.hidden ? "" : "hidden"; babyRun(sheet.hidden && !$("s-home").hidden); }
  $("scanClose").addEventListener("click", closeScanner);
  $("torch").addEventListener("click", function () {
    if (!track) return; torchOn = !torchOn;
    track.applyConstraints({ advanced: [{ torch: torchOn }] }).catch(function () { torchOn = false; });
  });
  document.addEventListener("visibilitychange", function () { if (document.hidden && !scanner.hidden) closeScanner(); });

  $("heroScan").addEventListener("click", openScanner);
  $("tabScan").addEventListener("click", openScanner);
  $("lexScan").addEventListener("click", openScanner);
  $("recentAll").addEventListener("click", function () { go("hist"); });

  // Barcode aus Foto
  function photoPick() { $("photoInput").click(); }
  $("qPhoto").addEventListener("click", photoPick);
  $("scanPhoto").addEventListener("click", function () { closeScanner(); photoPick(); });
  $("photoInput").addEventListener("change", async function () {
    var f = this.files && this.files[0]; this.value = "";
    if (!f) return;
    toast("Suche Barcode im Foto …");
    var code = await decodeImage(f);
    if (code) lookup(code);
    else toast("Kein Barcode erkannt. Foto näher und gerade aufnehmen oder Nummer eintippen.");
  });
  async function decodeImage(file) {
    var bmp = null;
    try { bmp = await createImageBitmap(file); } catch (e) {
      bmp = await new Promise(function (res) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = function () { res(null); }; i.src = URL.createObjectURL(file); });
    }
    if (!bmp) return null;
    var det = await getDetector();
    if (det) {
      try { var codes = await det.detect(bmp); for (var i = 0; i < codes.length; i++) { var c = normCode(codes[i].rawValue); if (validEAN(c)) return c; } } catch (e) {}
    }
    if (!window.ZXing) return null;
    // mehrere Größen und Drehungen probieren
    var sizes = [1600, 1000, 2400], rots = [0, 90];
    for (var s = 0; s < sizes.length; s++) for (var r = 0; r < rots.length; r++) {
      var c2 = zxDecodeCanvas(bmp, sizes[s], rots[r]);
      if (c2) return c2;
    }
    return null;
  }
  function zxDecodeCanvas(img, maxSide, rot) {
    var Z = window.ZXing;
    var w = img.width, h = img.height, sc = Math.min(1, maxSide / Math.max(w, h));
    var cw = Math.round(w * sc), ch = Math.round(h * sc);
    var cv = document.createElement("canvas");
    cv.width = rot ? ch : cw; cv.height = rot ? cw : ch;
    var ctx = cv.getContext("2d", { willReadFrequently: true });
    if (rot) { ctx.translate(cv.width / 2, cv.height / 2); ctx.rotate(rot * Math.PI / 180); ctx.drawImage(img, -cw / 2, -ch / 2, cw, ch); }
    else ctx.drawImage(img, 0, 0, cw, ch);
    try {
      var lum = new Z.HTMLCanvasElementLuminanceSource(cv);
      var bin = new Z.BinaryBitmap(new Z.HybridBinarizer(lum));
      var reader = new Z.MultiFormatReader(); reader.setHints(zxHints());
      var c = normCode(reader.decode(bin).getText());
      return validEAN(c) ? c : null;
    } catch (e) { return null; }
  }

  // Nummer eintippen
  function manualEntry() {
    openSheet(); body.innerHTML = "";
    var inp = el("input", { class: "input", id: "eanInput", inputmode: "numeric", autocomplete: "off", placeholder: "z. B. 4009233003464", "aria-label": "Barcode-Nummer", style: "font-size:1.3rem;letter-spacing:.06em;text-align:center" });
    var err = el("p", { class: "src", text: "" });
    function submit() {
      var c = normCode(inp.value);
      if (!validEAN(c)) { err.textContent = "Diese Nummer ist kein gültiger Barcode. Bitte alle Ziffern unter den Strichen eintippen (meist 13)."; inp.focus(); return; }
      lookup(c);
    }
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
    body.appendChild(el("h1", { class: "title", style: "font-size:1.7rem", text: "Nummer eintippen" }));
    body.appendChild(el("p", { class: "lead", text: "Die Ziffern stehen direkt unter dem Barcode." }));
    body.appendChild(el("div", { class: "card" }, [inp, err, el("button", { class: "btn", text: "Produkt suchen", onclick: submit })]));
    setTimeout(function () { inp.focus(); }, 300);
  }
  $("scanManual").addEventListener("click", function () { closeScanner(); manualEntry(); });

  // Zutaten frei prüfen
  function textCheck() {
    openSheet(); body.innerHTML = "";
    var e = { id: "t" + Date.now(), code: "", source: "text", name: "Eigene Zutatenliste", brand: "", img: "", ingredients: "", cats: "", heated: true, ts: Date.now() };
    body.appendChild(el("h1", { class: "title", style: "font-size:1.7rem", text: "Zutaten prüfen" }));
    body.appendChild(el("p", { class: "lead", text: "Zutatenliste abtippen oder einfügen. Funktioniert auch ohne Internet." }));
    var name = el("input", { class: "input", id: "tName", placeholder: "Produktname (optional)", "aria-label": "Produktname" });
    var ta = el("textarea", { id: "tIng", "aria-label": "Zutatenliste", placeholder: "z. B. Mascarpone, Löffelbiskuit, Kaffee, Marsala …" });
    body.appendChild(el("div", { class: "card" }, [name, ta, el("button", { class: "btn", text: "Prüfen", onclick: function () {
      if (!ta.value.trim()) { ta.focus(); toast("Bitte zuerst Zutaten eingeben"); return; }
      e.name = name.value.trim() || "Eigene Zutatenliste"; e.ingredients = ta.value.trim();
      e.heated = false; showResult(e); sheet.scrollTop = 0;
    } })]));
  }
  $("qText").addEventListener("click", textCheck);

  /* ---------- Lexikon ---------- */
  var LEX = [
    ["Räucherlachs", "erhitzen", "Kalt und heiß geräucherter Fisch kann Listerien enthalten. Auf Pizza oder in heißer Soße gut durchgegart ist er okay."],
    ["Sushi mit rohem Fisch", "meiden", "Roher Fisch. Vegetarisches Sushi oder Sushi mit gegartem Fisch ist okay."],
    ["Graved Lachs, Matjes, Rollmops", "meiden", "Gebeizter oder marinierter roher Fisch."],
    ["Austern, rohe Meeresfrüchte", "meiden", "Roh verzehrt ein hohes Risiko für Keime."],
    ["Thunfisch aus der Dose", "massvoll", "Kann mehr Quecksilber enthalten. Gelegentlich ist okay."],
    ["Schwertfisch, Hai", "meiden", "Große Raubfische mit hohem Quecksilbergehalt."],
    ["Lachs, Seelachs, Forelle (gegart)", "ok", "Gesund und empfohlen, wenn er vollständig durchgegart ist."],
    ["Fischstäbchen", "ok", "Vollständig durchbraten oder durchbacken."],
    ["Garnelen, gegart", "ok", "Gut durcherhitzt in Ordnung."],
    ["Salami, Mettwurst, Teewurst", "erhitzen", "Rohwurst. Auf der Pizza durchgebacken ist sie okay, kalt aufs Brot nicht."],
    ["Roher Schinken (Parma, Serrano, Schwarzwälder)", "erhitzen", "Nicht erhitzt. Nur durchgegart essen."],
    ["Kochschinken", "ok", "Frisch gekauft und zügig verbrauchen."],
    ["Wiener, Fleischwurst, Brühwurst", "ok", "Am sichersten heiß gegessen. Aufschnitt frisch kaufen und schnell verbrauchen."],
    ["Mett, Tatar, Carpaccio", "meiden", "Rohes Fleisch kann Toxoplasmen und Bakterien enthalten."],
    ["Steak rosa oder blutig", "erhitzen", "Fleisch nur vollständig durchgegart essen, ohne rosa Kern."],
    ["Leber, Leberwurst", "meiden", "Sehr viel Vitamin A, vor allem in den ersten drei Monaten meiden."],
    ["Parmesan, Grana Padano, Bergkäse", "ok", "Lange gereifter Hartkäse, auch aus Rohmilch. Rinde entfernen."],
    ["Gouda, Emmentaler, Butterkäse", "ok", "Aus pasteurisierter Milch okay. Rinde entfernen."],
    ["Mozzarella, Feta", "ok", "Aus pasteurisierter Milch okay. Frisch öffnen und zügig verbrauchen."],
    ["Frischkäse, Quark, Joghurt", "ok", "Aus pasteurisierter Milch in Ordnung."],
    ["Camembert, Brie", "erhitzen", "Weichkäse mit Schimmelrinde, auch pasteurisiert riskant. Überbacken ist okay."],
    ["Gorgonzola, Blauschimmelkäse", "erhitzen", "Nur durcherhitzt, z. B. in heißer Soße."],
    ["Rohmilchkäse (Weich- und Schnittkäse)", "erhitzen", "Kann Listerien enthalten. Nur durcherhitzt essen."],
    ["Rohmilch, Vorzugsmilch", "erhitzen", "Vor dem Trinken abkochen."],
    ["Weiches Ei, flüssiges Spiegelei", "erhitzen", "Eier nur fest gegart essen."],
    ["Tiramisu, Mousse (selbstgemacht)", "meiden", "Meist rohe Eier, oft auch Alkohol."],
    ["Mayonnaise aus dem Glas", "ok", "Industriell mit pasteurisiertem Ei hergestellt."],
    ["Mayonnaise selbstgemacht", "meiden", "Rohes Eigelb."],
    ["Abgepackter, geschnittener Salat", "meiden", "Kann Listerien enthalten. Besser selbst frisch waschen und schneiden."],
    ["Rohe Sprossen", "erhitzen", "Nur gegart essen."],
    ["Tiefkühl-Beeren und -Gemüse", "erhitzen", "Vor dem Essen erhitzen, nicht roh in Smoothies oder Müsli."],
    ["Obst, Gemüse, Salat (frisch)", "ok", "Gründlich waschen, wegen Toxoplasmose."],
    ["Tiefkühlpizza", "ok", "Komplett nach Packung durchbacken, die Mitte muss heiß sein."],
    ["Kaffee", "massvoll", "Bis 200 mg Koffein am Tag, das sind etwa 2 bis 3 Tassen."],
    ["Schwarzer und grüner Tee", "massvoll", "Enthält Koffein. Mit dem Kaffee zusammenrechnen."],
    ["Cola", "massvoll", "Enthält Koffein und viel Zucker."],
    ["Energydrinks", "meiden", "Viel Koffein und weitere Wirkstoffe."],
    ["Wein, Bier, Sekt, Spirituosen", "meiden", "Keine sichere Menge in der Schwangerschaft."],
    ["Alkoholfreies Bier", "massvoll", "Darf bis 0,5 % Alkohol enthalten. Besser 0,0 % wählen."],
    ["Tonic Water, Bitter Lemon", "meiden", "Enthält Chinin."],
    ["Lakritz", "massvoll", "Süßholz kann den Blutdruck beeinflussen. Nur gelegentlich."],
    ["Sojasoße", "massvoll", "Enthält durch die Gärung um 2 % Alkohol. Ein Schuss zum Würzen ist sehr wenig, trotzdem sparsam verwenden."],
    ["Teriyaki-Soße", "massvoll", "Meist mit Sojasoße, oft auch mit Mirin oder Sake. Zutaten prüfen."],
    ["Mirin, Sake, Reiswein", "meiden", "Reiswein enthält viel Alkohol, auch als Zutat in Soßen."],
    ["Kefir", "massvoll", "Kann durch Gärung Spuren von Alkohol enthalten. Aus pasteurisierter Milch sonst unbedenklich."],
    ["Kombucha", "massvoll", "Gärgetränk mit Restalkohol und Koffein. Besser nur selten."],
    ["Malzbier, Ginger Beer", "massvoll", "Kann geringe Mengen Restalkohol enthalten."],
    ["Desserts mit Aroma (enthält Alkohol)", "massvoll", "Alkohol als Trägerstoff für Aromen, die Menge ist sehr gering."],
    ["Pralinen mit Likör, Schwarzwälder Kirschtorte", "meiden", "Enthalten echten Alkohol, der nicht erhitzt wird."],
    ["Kräutertee", "massvoll", "Sorten abwechseln, nicht große Mengen derselben Sorte."],
    ["Honig", "ok", "Für Schwangere unbedenklich. Tabu ist er nur für Babys unter einem Jahr."],
    ["Nüsse", "ok", "Unbedenklich, außer bei Allergie."]
  ];
  var lexF = "alle";
  function renderLex() {
    var q = SC.norm($("q").value).trim();
    var ul = $("lex"); ul.innerHTML = "";
    var list = LEX.filter(function (x) { return (lexF === "alle" || x[1] === lexF) && (!q || SC.norm(x[0] + " " + x[2]).indexOf(q) !== -1); });
    if (!list.length) { ul.appendChild(el("li", null, [el("p", { class: "empty", text: "Nichts gefunden. Scanne das Produkt oder prüfe die Zutaten direkt." })])); return; }
    list.forEach(function (x) { ul.appendChild(el("li", null, [el("h3", { text: x[0] }), chip(x[1]), el("p", { text: x[2] })])); });
  }
  $("q").addEventListener("input", renderLex);
  $("filters").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    lexF = b.getAttribute("data-f");
    $("filters").querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    renderLex();
  });

  /* ---------- Onboarding ---------- */
  function onboarding(only, invite) {
    // Schritte: welcome, names, due, scan. "only" zeigt nur die angegebenen Schritte (z. B. nach einem Update).
    var STEPS = only || ["welcome", "names", "due", "scan"];
    var idx = 0, step;
    var layer = $("onb"), ob = $("onbBody");
    layer.hidden = false; document.body.style.overflow = "hidden";
    var ARTS = {
      invite: '<svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><circle cx="44" cy="44" r="16"/><circle cx="80" cy="50" r="12"/><path d="M16 96c4-18 16-28 28-28s24 10 28 28M70 96c2-12 8-20 18-20s16 8 18 20"/></svg>',
      welcome: '<svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><circle cx="60" cy="60" r="42"/><path d="M40 61l14 14 27-29"/></svg>',
      names: '<svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M60 96S20 72 20 44a20 20 0 0 1 40-6 20 20 0 0 1 40 6c0 28-40 52-40 52z"/></svg>',
      due: '<svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><rect x="24" y="28" width="72" height="68" rx="12"/><path d="M24 48h72M44 20v16M76 20v16"/><path d="M48 70l8 8 16-16"/></svg>',
      scan: '<svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"><path d="M22 40V28a6 6 0 0 1 6-6h12M80 22h12a6 6 0 0 1 6 6v12M98 80v12a6 6 0 0 1-6 6H80M40 98H28a6 6 0 0 1-6-6V80"/><path d="M40 44v32M50 44v32M62 44v32M72 44v32M82 44v32"/></svg>'
    };
    function dots() { return STEPS.length < 2 ? null : el("div", { class: "dots", "aria-hidden": "true" }, STEPS.map(function (x, i) { return el("i", { class: i === idx ? "on" : "" }); })); }
    function next() { idx++; if (idx >= STEPS.length) finish(); else draw(); }
    function finish() {
      settings = store("sc.settings") || settings; settings.onboarded = true; settings.namesAsked = true; store("sc.settings", settings);
      layer.hidden = true; document.body.style.overflow = ""; renderWeek();
    }
    function draw() {
      step = STEPS[idx];
      ob.innerHTML = "";
      var art = el("div", { class: "onb-art" }, [el("div", { class: "blob", html: ARTS[step], "aria-hidden": "true" })]);
      var content, actions;
      if (step === "welcome") {
        content = el("div", { class: "screen", style: "gap:10px" }, [el("h1", { text: "Willkommen!" }), el("p", { text: "Begleite dein Baby Woche für Woche in 3D – und scanne Lebensmittel, um sofort zu sehen, ob sie in der Schwangerschaft unbedenklich sind." })]);
        actions = [el("button", { class: "btn", text: "Los geht’s", onclick: next })];
      } else if (step === "invite") {
        var mom = invite.mom || "", bn = invite.baby || "";
        var me = el("input", { class: "input", id: "invName", autocomplete: "given-name", placeholder: "Dein Vorname", "aria-label": "Dein Vorname", style: "font-size:1.15rem" });
        me.value = settings.role === "partner" ? (settings.name || "") : "";
        var dd2 = 280 - Math.round((parseDate(invite.due) - today0()) / DAY);
        content = el("div", { class: "screen", style: "gap:12px" }, [
          el("h1", { text: (mom ? mom + " hat dich eingeladen" : "Du wurdest eingeladen") }),
          el("p", { text: "Ab jetzt siehst du hier jede Woche, wie sich " + (bn || "das Baby") + " entwickelt" + (dd2 >= 0 && dd2 <= 300 ? " – gerade " + sswText(dd2) + "." : ".") + " Wie heißt du?" }),
          me
        ]);
        actions = [el("button", { class: "btn", text: "Übernehmen", onclick: function () {
            settings.role = "partner"; settings.momName = mom.slice(0, 30); settings.babyName = bn.slice(0, 30);
            settings.name = me.value.trim().slice(0, 30); settings.namesAsked = true;
            store("sc.settings", settings); setDue(invite.due); next();
          } }),
          el("button", { class: "btn plain", text: "Nicht übernehmen", onclick: function () { layer.hidden = true; document.body.style.overflow = ""; if (!settings.onboarded) onboarding(); } })];
      } else if (step === "names") {
        var nIn = el("input", { class: "input", id: "onbName", autocomplete: "given-name", placeholder: "z. B. Lina", "aria-label": "Dein Vorname", style: "font-size:1.15rem" });
        var bIn = el("input", { class: "input", id: "onbBaby", autocomplete: "off", placeholder: "z. B. Krümel (optional)", "aria-label": "Name oder Spitzname fürs Baby", style: "font-size:1.15rem" });
        nIn.value = settings.name || ""; bIn.value = settings.babyName || "";
        content = el("div", { class: "screen", style: "gap:12px" }, [
          el("h1", { text: "Wie heißt du?" }),
          el("p", { text: "Dann begrüßt dich die App persönlich. Wenn ihr schon einen Namen oder Spitznamen fürs Baby habt, trag ihn gern mit ein." }),
          el("label", { class: "label", for: "onbName", text: "Dein Vorname" }), nIn,
          el("label", { class: "label", for: "onbBaby", text: "Name fürs Baby" }), bIn
        ]);
        actions = [el("button", { class: "btn", text: "Weiter", onclick: function () {
            settings.name = nIn.value.trim().slice(0, 30); settings.babyName = bIn.value.trim().slice(0, 30);
            store("sc.settings", settings); renderWeek(); next();
          } }),
          el("button", { class: "btn plain", text: "Überspringen", onclick: next })];
        setTimeout(function () { try { nIn.focus(); } catch (e) {} }, 300);
      } else if (step === "due") {
        var defDue = isoDate(new Date(today0().getTime() + 28 * 7 * DAY));
        var dateIn = el("input", { class: "input", type: "date", id: "onbDue", "aria-label": "Errechneter Geburtstermin", style: "font-size:1.15rem;text-align:center" });
        dateIn.value = settings.due || defDue;
        var sub = el("p", { class: "week-sub" });
        function upd() {
          if (!dateIn.value) { sub.textContent = ""; return; }
          var dd = 280 - Math.round((parseDate(dateIn.value) - today0()) / DAY);
          sub.textContent = dd < 0 || dd > 300 ? "Bitte ein Datum in den nächsten 40 Wochen wählen." : "Das ist " + sswText(dd) + " · " + trimester(Math.max(1, Math.floor(dd / 7))) + ". Trimester";
        }
        dateIn.addEventListener("input", upd); dateIn.addEventListener("change", upd); upd();
        content = el("div", { class: "screen", style: "gap:14px" }, [
          el("h1", { text: settings.name ? "Wann ist dein Termin, " + settings.name + "?" : "Wann ist dein Termin?" }),
          el("p", { text: "Trag den errechneten Termin aus dem Mutterpass ein. Daraus berechnet die App jeden Tag die Woche, die Entwicklung deines Babys und den Countdown." }),
          dateIn, sub
        ]);
        actions = [el("button", { class: "btn", text: "Weiter", onclick: function () {
            if (dateIn.value) { var dd = 280 - Math.round((parseDate(dateIn.value) - today0()) / DAY); if (dd >= 0 && dd <= 300) setDue(dateIn.value); }
            next();
          } }),
          el("button", { class: "btn plain", text: "Später eintragen", onclick: next })];
      } else {
        content = el("div", { class: "screen", style: "gap:10px" }, [el("h1", { text: "So scannst du" }),
          el("p", { text: "Halte den Barcode in den Rahmen, die App erkennt ihn von selbst. Beim ersten Scan fragt dein Handy nach der Kamera – bitte erlauben." }),
          el("p", { text: "Unter „Werkzeuge“ findest du Tritte zählen, Wehen-Timer, Termine, Checklisten, Bauch-Tagebuch und mehr." }),
          el("p", { text: "Tipp: Über „Teilen → Zum Home-Bildschirm“ startest du die App wie jede andere." })]);
        actions = [el("button", { class: "btn", text: "Fertig", onclick: next })];
      }
      ob.appendChild(el("div", { class: "screen" }, [art, dots(), content].filter(Boolean)));
      ob.appendChild(el("div", { class: "screen", style: "gap:6px" }, actions));
    }
    draw();
  }

  /* ---------- Start ---------- */
  renderWeek(); renderRecent(); renderLex();
  initBaby();
  // nach Mitternacht neu rechnen
  setInterval(function () { var w = pregDay(); if (w !== lastDay) { lastDay = w; renderWeek(); } }, 60000);
  var lastDay = pregDay();
  window.SCApp = { go: go, toast: toast, refreshHome: refreshHome, pause3d: function (p) { babyRun(!p && !$("s-home").hidden && sheet.hidden && $("scanner").hidden); } };
  if (window.SCTools) {
    window.SCTools.init();
    $("openPartner").addEventListener("click", function () { window.SCTools.open("partner"); });
    $("nextCard").addEventListener("click", function () { window.SCTools.open("termine"); });
  }
  renderNext(); renderQuick();
  var invite = window.SCTools && window.SCTools.readInvite();
  if (invite) {
    try { history.replaceState(null, "", location.pathname); } catch (e) {}
    onboarding(["invite", "scan"], invite);
  }
  else if (!settings.onboarded) onboarding();
  else if (!settings.namesAsked) onboarding(["names"]);
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
  // Für Tests
  window.__sc = { go: go, refreshHome: refreshHome, pregDay: pregDay, currentWeek: currentWeek, setDue: setDue, baby: function () { return baby; }, lookup: lookup, validEAN: validEAN, normCode: normCode, fromOFF: fromOFF, evaluate: evaluate, decodeImage: decodeImage, gotCode: gotCode };
})();
