/* Schwanger-Check – Werkzeuge
   Alles wird nur auf diesem Gerät gespeichert (localStorage, Fotos in IndexedDB). */
(function (root) {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var DAY = 864e5;

  /* ---------- Hilfen ---------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k === "html") n.innerHTML = v; // nur eigene SVG-Konstanten
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    });
    (kids || []).forEach(function (c) { if (c != null && c !== false) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function load(key, def) { try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? def : v; } catch (e) { return def; } }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { toast("Speichern nicht möglich – ist der Speicher voll?"); return false; } }
  function toast(m) { if (root.SCApp && root.SCApp.toast) root.SCApp.toast(m); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function today0() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function parseDate(iso) { var p = String(iso).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function isoDate(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function fmtDate(d, opt) { return d.toLocaleDateString("de-DE", opt || { day: "numeric", month: "short", year: "numeric" }); }
  function fmtDay(d) { return d.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" }); }
  function fmtTime(d) { return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }); }
  function mmss(ms) { var s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
  function settings() { return load("sc.settings", {}); }
  function dueDate() { var s = settings(); return s.due ? parseDate(s.due) : null; }
  // Datum zu einem Tag der Schwangerschaft (0 = erster Tag der letzten Periode, 280 = ET)
  function dateForDay(d) { var due = dueDate(); return due ? addDays(due, d - 280) : null; }
  function pregDay() { var due = dueDate(); return due ? 280 - Math.round((due - today0()) / DAY) : null; }

  // Bestätigung direkt im Knopf: erster Tipp fragt, zweiter führt aus
  function confirmBtn(label, confirmLabel, cls, action) {
    var armed = false, t;
    var b = el("button", { class: cls, text: label, onclick: function () {
      if (!armed) { armed = true; b.textContent = confirmLabel; b.classList.add("danger"); t = setTimeout(function () { armed = false; b.textContent = label; b.classList.remove("danger"); }, 3000); return; }
      clearTimeout(t); armed = false; b.textContent = label; b.classList.remove("danger"); action();
    } });
    return b;
  }

  var I = {
    kick: '<path d="M8 4c3 0 5 2 5 5v3l4 2c1.5.8 2 2.6 1 4l-.5.8c-.9 1.4-2.8 1.8-4.2.8L8 16c-1.8-1.2-3-3.2-3-5.4V7c0-1.7 1.3-3 3-3z"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M10 2h4M12 2v3"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.4-8 9-4.6-.6-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    scale: '<path d="M5 20h14l-1.5-12h-11z"/><circle cx="12" cy="5" r="2"/><path d="M10 13l2-2 2 2"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6"/>',
    food: '<path d="M7 3v8a2 2 0 0 0 2 2v8M7 3v5M11 3v5M7 8h4M17 3c-2 0-3 2-3 5s1 5 3 5v8"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>'
  };
  function icon(name, size) { return '<svg width="' + (size || 22) + '" height="' + (size || 22) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[name] + '</svg>'; }

  /* ---------- Werkzeug-Ebene ---------- */
  var current = null, tickers = [];
  function openTool(id) {
    var t = TOOLS[id]; if (!t) return;
    current = id;
    var layer = $("tool"), body = $("toolBody");
    $("toolTitle").textContent = t.title;
    body.innerHTML = "";
    stopTickers();
    t.render(body);
    layer.hidden = false; layer.scrollTop = 0;
    layer.classList.remove("anim"); void layer.offsetWidth; layer.classList.add("anim");
    document.body.style.overflow = "hidden";
    if (root.SCApp && root.SCApp.pause3d) root.SCApp.pause3d(true);
  }
  function closeTool() {
    stopTickers(); current = null;
    $("tool").hidden = true; document.body.style.overflow = "";
    if (root.SCApp && root.SCApp.pause3d) root.SCApp.pause3d(false);
    if (root.SCApp && root.SCApp.refreshHome) root.SCApp.refreshHome();
  }
  function rerender() { if (current) { var b = $("toolBody"), y = $("tool").scrollTop; stopTickers(); b.innerHTML = ""; TOOLS[current].render(b); $("tool").scrollTop = y; } }
  function ticker(fn, ms) { var h = setInterval(fn, ms); tickers.push(h); return h; }
  function stopTickers() { tickers.forEach(clearInterval); tickers = []; }

  function section(title, kids, cls) { return el("section", { class: "card" + (cls ? " " + cls : "") }, [title ? el("p", { class: "label", text: title }) : null].concat(kids)); }
  function note(text, cls) { return el("p", { class: "note" + (cls ? " " + cls : ""), text: text }); }
  function needDue(body) {
    body.appendChild(section(null, [el("p", { text: "Für dieses Werkzeug braucht die App deinen errechneten Termin (ET)." }),
      el("button", { class: "btn", text: "Termin eintragen", onclick: function () { closeTool(); root.SCApp.go("me"); } })]));
  }

  /* =========================================================
     1) Tritte zählen
     ========================================================= */
  function renderKicks(body) {
    var data = load("sc.kicks", { sessions: [], active: null });
    var GOAL = 10;
    var d = pregDay();
    if (d != null && d < 28 * 7) body.appendChild(note("Empfohlen ab SSW 28. Vorher bewegen sich Babys noch sehr unregelmäßig – zählen kannst du trotzdem.", "info"));

    var countEl = el("div", { class: "kick-count", "aria-live": "polite" });
    var timeEl = el("p", { class: "kick-time" });
    var ring = el("div", { class: "kick-ring" });
    function draw() {
      var a = data.active, n = a ? a.taps.length : 0;
      countEl.innerHTML = "";
      countEl.appendChild(el("b", { text: String(n) }));
      countEl.appendChild(el("span", { text: "von " + GOAL }));
      ring.style.setProperty("--p", Math.min(1, n / GOAL)); ring.classList.toggle("zero", !n);
      timeEl.textContent = a ? "Seit " + fmtTime(new Date(a.start)) + " · " + mmss(Date.now() - a.start) : "Tippe bei jeder Bewegung auf den Kreis.";
      stopBtn.hidden = !a; undoBtn.hidden = !a || !n;
    }
    function tap() {
      if (!data.active) data.active = { start: Date.now(), taps: [] };
      data.active.taps.push(Date.now());
      if (navigator.vibrate) navigator.vibrate(25);
      if (data.active.taps.length >= GOAL) finish();
      else { save("sc.kicks", data); draw(); }
    }
    function finish() {
      var a = data.active; if (!a) return;
      if (a.taps.length) data.sessions.unshift({ id: uid(), start: a.start, end: a.taps[a.taps.length - 1], count: a.taps.length });
      data.active = null; data.sessions = data.sessions.slice(0, 120);
      save("sc.kicks", data);
      if (a.taps.length >= GOAL) toast("10 Bewegungen in " + Math.max(1, Math.round((a.taps[a.taps.length - 1] - a.start) / 60000)) + " Minuten");
      rerender();
    }
    var tapBtn = el("button", { class: "kick-btn", "aria-label": "Bewegung zählen", onclick: tap }, [ring, countEl]);
    ring.innerHTML = '<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" class="trk"/><circle cx="60" cy="60" r="54" class="bar" pathLength="100"/></svg>';
    var stopBtn = el("button", { class: "btn soft", text: "Sitzung beenden", onclick: finish });
    var undoBtn = el("button", { class: "btn plain", text: "Letzten Tipp zurück", onclick: function () { if (data.active) { data.active.taps.pop(); save("sc.kicks", data); draw(); } } });
    body.appendChild(el("div", { class: "kick-stage" }, [tapBtn, timeEl, el("div", { class: "row center" }, [stopBtn, undoBtn])]));
    draw();
    ticker(function () { if (data.active) timeEl.textContent = "Seit " + fmtTime(new Date(data.active.start)) + " · " + mmss(Date.now() - data.active.start); }, 1000);

    // Verlauf mit Balken
    var ses = data.sessions.filter(function (s) { return s.count >= GOAL; }).slice(0, 14).reverse();
    if (ses.length) {
      var max = Math.max.apply(null, ses.map(function (s) { return (s.end - s.start) / 60000; }).concat([30]));
      var chart = el("div", { class: "bars", role: "img", "aria-label": "Minuten bis 10 Bewegungen, letzte Sitzungen" });
      ses.forEach(function (s) {
        var m = (s.end - s.start) / 60000;
        chart.appendChild(el("div", { class: "bar-col" }, [el("i", { style: "height:" + Math.max(4, m / max * 100) + "%" }), el("small", { text: new Date(s.start).toLocaleDateString("de-DE", { day: "numeric", month: "numeric" }) })]));
      });
      body.appendChild(section("Minuten bis 10 Bewegungen", [chart, note("Wichtig ist nicht eine bestimmte Zahl, sondern dein persönliches Muster. Zähle am besten jeden Tag zur ähnlichen Zeit.")]));
    }
    var list = el("ul", { class: "rows" });
    data.sessions.slice(0, 20).forEach(function (s) {
      list.appendChild(el("li", null, [el("span", { text: fmtDay(new Date(s.start)) + ", " + fmtTime(new Date(s.start)) }), el("b", { text: s.count + " in " + Math.max(1, Math.round((s.end - s.start) / 60000)) + " min" })]));
    });
    if (data.sessions.length) body.appendChild(section("Letzte Sitzungen", [list, confirmBtn("Alle löschen", "Wirklich alle löschen?", "btn plain", function () { save("sc.kicks", { sessions: [], active: null }); rerender(); })]));
    body.appendChild(section("So geht’s", [
      el("p", { text: "Leg dich auf die Seite oder setz dich bequem hin. Tippe bei jeder Bewegung – Treten, Drehen, Stupsen zählt, Schluckauf nicht. Die Zeit bis zur 10. Bewegung wird gespeichert." }),
      note("Bewegt sich dein Baby deutlich weniger oder anders als sonst, warte nicht bis morgen: ruf sofort deine Hebamme, Frauenarztpraxis oder den Kreißsaal an.", "warn")
    ]));
  }

  /* =========================================================
     2) Wehen-Timer
     ========================================================= */
  function renderContractions(body) {
    var data = load("sc.contractions", { list: [], active: null });
    var big = el("button", { class: "wehen-btn", "aria-live": "polite" });
    var sub = el("p", { class: "kick-time" });
    var summary = el("div", { class: "stat-row" });
    var alertBox = el("div");
    function stats() {
      var now = Date.now(), hour = data.list.filter(function (c) { return now - c.start <= 60 * 60000; });
      var durs = hour.map(function (c) { return (c.end - c.start) / 1000; });
      var gaps = [];
      for (var i = 0; i < hour.length - 1; i++) gaps.push((hour[i].start - hour[i + 1].start) / 60000);
      var avg = function (a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : 0; };
      return { n: hour.length, dur: avg(durs), gap: avg(gaps), span: hour.length ? (hour[0].start - hour[hour.length - 1].start) / 60000 : 0 };
    }
    function draw() {
      var a = data.active;
      big.innerHTML = "";
      big.classList.toggle("on", !!a);
      big.appendChild(el("b", { text: a ? mmss(Date.now() - a) : "Start" }));
      big.appendChild(el("span", { text: a ? "Tippen, wenn die Wehe vorbei ist" : "Tippen, wenn eine Wehe beginnt" }));
      var last = data.list[0];
      sub.textContent = a ? "Wehe läuft" : last ? "Letzte Wehe vor " + mmss(Date.now() - last.end) + " min" : "";
      var s = stats();
      summary.innerHTML = "";
      [["Wehen (1 Std.)", String(s.n)], ["Ø Dauer", s.dur ? Math.round(s.dur) + " s" : "–"], ["Ø Abstand", s.gap ? s.gap.toLocaleString("de-DE", { maximumFractionDigits: 1 }) + " min" : "–"]].forEach(function (x) {
        summary.appendChild(el("div", null, [el("small", { text: x[0] }), el("b", { text: x[1] })]));
      });
      alertBox.innerHTML = "";
      // Faustregel nach Klinik-Infos: Erstgebärende ca. alle 3–5 min, ~1 min lang, über etwa 2 Std.; weitere Kinder alle 5–7 min über etwa 1 Std.
      if (s.n >= 6 && s.gap && s.gap <= 6 && s.dur >= 40 && s.span >= 40) {
        alertBox.appendChild(note("Deine Wehen kommen regelmäßig etwa alle " + Math.round(s.gap) + " Minuten und dauern rund " + Math.round(s.dur) + " Sekunden. Ruf jetzt deinen Kreißsaal an und besprich, wann ihr losfahren sollt.", "warn"));
      }
    }
    big.addEventListener("click", function () {
      if (data.active) { data.list.unshift({ id: uid(), start: data.active, end: Date.now() }); data.active = null; }
      else data.active = Date.now();
      data.list = data.list.slice(0, 300);
      save("sc.contractions", data); draw(); drawList();
      if (navigator.vibrate) navigator.vibrate(30);
    });
    var listWrap = el("div");
    function drawList() {
      listWrap.innerHTML = "";
      if (!data.list.length) return;
      var ul = el("ul", { class: "rows" });
      data.list.slice(0, 30).forEach(function (c, i) {
        var nxt = data.list[i + 1];
        ul.appendChild(el("li", null, [el("span", { text: fmtTime(new Date(c.start)) }), el("span", { class: "muted", text: "Dauer " + mmss(c.end - c.start) }), el("b", { text: nxt ? "Abstand " + mmss(c.start - nxt.start) : "–" })]));
      });
      listWrap.appendChild(section("Protokoll", [ul, confirmBtn("Protokoll löschen", "Wirklich löschen?", "btn plain", function () { save("sc.contractions", { list: [], active: null }); rerender(); })]));
    }
    body.appendChild(el("div", { class: "kick-stage" }, [big, sub]));
    body.appendChild(section(null, [summary, alertBox]));
    body.appendChild(listWrap);
    body.appendChild(section("Wann in die Klinik?", [
      el("p", { text: "Als grobe Orientierung nennen Kliniken: beim ersten Kind, wenn die Wehen etwa 2 Stunden lang regelmäßig alle 3–5 Minuten kommen und rund 1 Minute dauern. Bei weiteren Kindern oft schon, wenn sie etwa 1 Stunde lang alle 5–7 Minuten kommen." }),
      note("Sofort losfahren oder anrufen bei Blasensprung, Blutung, Fieber, starken Dauerschmerzen, weniger Kindsbewegungen – oder wenn du dich unsicher fühlst. Besprich deine persönlichen Regeln mit Hebamme oder Klinik.", "warn")
    ]));
    draw(); drawList();
    ticker(draw, 1000);
  }

  /* =========================================================
     3) Termine & Vorsorge
     ========================================================= */
  // [ab Tag, bis Tag, Titel, Beschreibung, nur bei Bedarf]
  var VORSORGE = [
    [5 * 7, 8 * 7, "Erster Termin in der Frauenarztpraxis", "Bestätigung der Schwangerschaft, Mutterpass, Blutgruppe und erste Bluttests."],
    [9 * 7, 12 * 7 + 6, "1. Ultraschall-Screening", "Lage, Herzschlag und Größe; der ET wird überprüft."],
    [12 * 7, 14 * 7, "Ersttrimester-Screening (freiwillig)", "Nackenfaltenmessung und Bluttest – private Zusatzleistung, vorher beraten lassen.", true],
    [13 * 7, 14 * 7, "Grippeimpfung", "Empfohlen ab dem 2. Trimester, je nach Jahreszeit.", true],
    [19 * 7, 22 * 7 + 6, "2. Ultraschall-Screening", "Wachstum und Entwicklung, auf Wunsch erweitert mit Organen."],
    [24 * 7, 28 * 7 + 6, "Zuckertest (Glukose)", "Suchtest auf Schwangerschaftsdiabetes."],
    [24 * 7, 28 * 7 + 6, "Antikörper-Suchtest", "Zweite Blutkontrolle."],
    [28 * 7, 32 * 7, "Keuchhusten-Impfung", "Empfohlen zu Beginn des 3. Trimesters."],
    [28 * 7, 30 * 7 + 6, "Anti-D-Prophylaxe", "Nur bei Rhesus-negativer Blutgruppe.", true],
    [29 * 7, 32 * 7 + 6, "3. Ultraschall-Screening", "Wachstum, Lage des Babys und Plazenta."],
    [32 * 7, 40 * 7, "Hepatitis-B-Test", "Bluttest im letzten Drittel."],
    [32 * 7, 34 * 7, "Anmeldung in der Geburtsklinik", "Viele Kliniken laden zu einem Vorgespräch ein – früh anfragen."],
    [36 * 7, 40 * 7, "CTG-Kontrollen", "Herztöne und Wehen werden aufgezeichnet, gegen Ende häufiger."]
  ];
  function vorsorgeItems() {
    var done = load("sc.vorsorgeDone", {});
    return VORSORGE.map(function (v, i) {
      return { id: "v" + i, from: dateForDay(v[0]), to: dateForDay(v[1]), fromDay: v[0], toDay: v[1], title: v[2], text: v[3], optional: !!v[4], done: !!done["v" + i] };
    });
  }
  function upcomingAppointments(limit) {
    var now = today0(), list = [];
    load("sc.appts", []).forEach(function (a) { var d = parseDate(a.date); if (d >= now) list.push({ kind: "own", date: d, time: a.time, title: a.title }); });
    if (dueDate()) vorsorgeItems().forEach(function (v) { if (!v.done && !v.optional && v.to >= now) list.push({ kind: "vorsorge", date: v.from < now ? now : v.from, range: true, from: v.from, to: v.to, title: v.title }); });
    list.sort(function (a, b) { return a.date - b.date; });
    // Eigene Termine der nächsten 30 Tage zuerst, laufende Vorsorge-Zeiträume danach
    var soon = addDays(now, 30);
    var own = list.filter(function (x) { return x.kind === "own" && x.date <= soon; });
    var rest = list.filter(function (x) { return own.indexOf(x) === -1; });
    return own.concat(rest).slice(0, limit || 3);
  }
  function renderAppointments(body) {
    var appts = load("sc.appts", []);
    // eigener Termin
    var dIn = el("input", { class: "input", type: "date", id: "apDate", "aria-label": "Datum" });
    dIn.value = isoDate(today0());
    var tIn = el("input", { class: "input", type: "time", id: "apTime", "aria-label": "Uhrzeit" });
    var nIn = el("input", { class: "input", id: "apTitle", placeholder: "z. B. Vorsorge, Hebamme, Geburtsvorbereitung", "aria-label": "Termin" });
    body.appendChild(section("Eigener Termin", [nIn, el("div", { class: "row2" }, [dIn, tIn]),
      el("button", { class: "btn", html: icon("plus", 18) + "<span>Termin speichern</span>", onclick: function () {
        if (!nIn.value.trim()) { nIn.focus(); toast("Bitte einen Namen für den Termin eingeben"); return; }
        if (!dIn.value) { dIn.focus(); return; }
        appts.push({ id: uid(), date: dIn.value, time: tIn.value, title: nIn.value.trim().slice(0, 80) });
        appts.sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });
        save("sc.appts", appts); toast("Termin gespeichert"); rerender();
      } })]));
    var now = today0();
    var mine = appts.filter(function (a) { return parseDate(a.date) >= addDays(now, -30); });
    if (mine.length) {
      var ul = el("ul", { class: "rows" });
      mine.forEach(function (a) {
        var past = parseDate(a.date) < now;
        ul.appendChild(el("li", { class: past ? "past" : "" }, [
          el("span", { class: "date-chip", text: fmtDay(parseDate(a.date)) + (a.time ? " · " + a.time : "") }),
          el("b", { text: a.title }),
          el("button", { class: "icon-btn sm", "aria-label": "Termin löschen", html: icon("trash", 18), onclick: function () { save("sc.appts", appts.filter(function (x) { return x.id !== a.id; })); rerender(); } })
        ]));
      });
      body.appendChild(section("Deine Termine", [ul]));
    }
    if (!dueDate()) { needDue(body); return; }
    var d = pregDay(), done = load("sc.vorsorgeDone", {});
    var ul2 = el("ul", { class: "timeline" });
    vorsorgeItems().forEach(function (v) {
      var state = v.done ? "done" : d > v.toDay ? "past" : d >= v.fromDay ? "now" : "future";
      var cb = el("input", { type: "checkbox", id: "vs-" + v.id, "aria-label": v.title + " erledigt" });
      cb.checked = v.done;
      cb.addEventListener("change", function () { done[v.id] = cb.checked; if (!cb.checked) delete done[v.id]; save("sc.vorsorgeDone", done); rerender(); });
      ul2.appendChild(el("li", { class: "tl-" + state }, [
        el("label", { class: "tl-check", for: "vs-" + v.id }, [cb, el("span", { html: icon("check", 14) })]),
        el("div", { class: "tl-body" }, [
          el("small", { text: "SSW " + Math.floor(v.fromDay / 7) + "–" + Math.floor(v.toDay / 7) + " · " + fmtDate(v.from, { day: "numeric", month: "short" }) + " – " + fmtDate(v.to, { day: "numeric", month: "short" }) + (state === "now" ? " · jetzt" : "") }),
          el("b", { text: v.title + (v.optional ? " (bei Bedarf)" : "") }),
          el("p", { text: v.text })
        ])
      ]));
    });
    body.appendChild(section("Vorsorge nach Mutterpass", [
      note("Bis SSW 32 gibt es etwa alle 4 Wochen eine Vorsorge, danach alle 2 Wochen. Die Zeiträume sind aus deinem ET berechnet – deine Praxis plant die genauen Termine."),
      ul2
    ]));
  }

  /* =========================================================
     4) Checklisten
     ========================================================= */
  var LISTS = {
    tasche: { title: "Kliniktasche", hint: "Ab etwa SSW 34 gepackt bereitstellen.", groups: [
      ["Für dich", ["Mutterpass", "Krankenkassenkarte und Ausweis", "Familienstammbuch oder Geburts-/Heiratsurkunde", "Bequemes Nachthemd oder großes Shirt (2–3)", "Bademantel und warme Socken", "Still-BHs und Stilleinlagen", "Große Netzunterhosen und Wochenbett-Einlagen", "Kulturbeutel, Haargummi, Lippenpflege", "Handy-Ladekabel, langes Kabel", "Snacks und Getränke", "Bequeme Kleidung für die Heimfahrt"]],
      ["Fürs Baby", ["Body, Strampler, Mütze, Söckchen", "Jäckchen oder Overall je nach Wetter", "Babyschale fürs Auto (vorher einbauen üben)", "Spucktuch und Decke"]],
      ["Für die Begleitung", ["Bequeme Kleidung zum Wechseln", "Snacks, Wasser, Kleingeld fürs Parken", "Kamera oder Handy mit Platz für Fotos"]]
    ] },
    ausstattung: { title: "Erstausstattung", hint: "Kein Muss: vieles bekommt man geschenkt oder gebraucht.", groups: [
      ["Schlafen", ["Beistellbett oder Babybett", "Matratze und Spannbettlaken", "Babyschlafsäcke (2 Größen)"]],
      ["Unterwegs", ["Kinderwagen mit Wanne", "Babyschale (i-Size)", "Tragetuch oder Babytrage"]],
      ["Wickeln & Pflege", ["Wickelauflage", "Windeln Größe 1 und Feuchttücher", "Waschlappen und Kapuzenhandtücher", "Fieberthermometer", "Babybadewanne (optional)"]],
      ["Kleidung (Gr. 50–62)", ["6–8 Bodys", "4–6 Strampler oder Hosen", "2–3 Jäckchen", "Mützchen und Söckchen"]],
      ["Füttern", ["Stillkissen", "Spucktücher (10+)", "Bei Fläschchen: Flaschen, Sauger, Vaporisator"]]
    ] }
  };
  // Anträge & Behörden: [Tag relativ zum ET (Tage), Titel, Text, nach Geburt?]
  var PAPER = [
    [-245, "Arbeitgeber informieren", "Kopie der Schwangerschaftsbescheinigung abgeben – erst dann greift der Mutterschutz am Arbeitsplatz.", 0],
    [-210, "Hebamme suchen", "Für Vorsorge und Wochenbett – je früher, desto besser, gerade in Großstädten.", 0],
    [-140, "Geburtsvorbereitungskurs buchen", "Viele Kurse sind schnell ausgebucht; die Kasse zahlt für dich.", 0],
    [-120, "Kita-Platz vormerken", "In vielen Städten lange Wartelisten – oft schon vor der Geburt möglich.", 0],
    [-84, "Elterngeld & Elternzeit planen", "Mit dem Elterngeldrechner des Bundes aufteilen, wer wann zu Hause bleibt.", 0],
    [-63, "Vaterschaft & Sorgerecht (wenn nicht verheiratet)", "Beim Jugendamt oder Standesamt schon vor der Geburt möglich und kostenlos.", 0],
    [-49, "Mutterschaftsgeld beantragen", "Bei der Krankenkasse mit der Bescheinigung über den ET, frühestens 7 Wochen vor dem ET.", 0],
    [-42, "Mutterschutz beginnt", "Ab heute musst du nicht mehr arbeiten – außer du möchtest es ausdrücklich.", 0],
    [-49, "Elternzeit beim Arbeitgeber anmelden", "Spätestens 7 Wochen vor Beginn schriftlich – für den Partner ab Geburt also 7 Wochen vor dem ET.", 0],
    [-35, "Kindergeld-Antrag vorbereiten", "Formulare ausfüllen, nach der Geburt mit der Steuer-ID des Babys bei der Familienkasse einreichen.", 0],
    [7, "Geburt beim Standesamt anzeigen", "Innerhalb einer Woche – oft übernimmt die Klinik die Meldung. Danach gibt es die Geburtsurkunden.", 1],
    [14, "Baby bei der Krankenkasse anmelden", "Mit Geburtsurkunde; klären, bei wem das Baby mitversichert wird.", 1],
    [14, "Geburtsurkunde an Krankenkasse & Arbeitgeber", "Damit Mutterschaftsgeld und Mutterschutz richtig berechnet werden.", 1],
    [60, "Elterngeld beantragen", "Wird nur bis zu 3 Monate rückwirkend gezahlt – also möglichst bald nach der Geburt.", 1],
    [60, "Kindergeld beantragen", "Bei der Familienkasse, sobald die Steuer-ID des Babys da ist.", 1]
  ];
  function listState(id) { return load("sc.list." + id, { checked: {}, custom: [] }); }
  function listProgress(id) {
    var st = listState(id), total = 0, done = 0;
    if (id === "papiere") { PAPER.forEach(function (p, i) { total++; if (st.checked["p" + i]) done++; }); }
    else LISTS[id].groups.forEach(function (g, gi) { g[1].forEach(function (x, i) { total++; if (st.checked[gi + "-" + i]) done++; }); });
    st.custom.forEach(function (c) { total++; if (st.checked[c.id]) done++; });
    return { done: done, total: total };
  }
  function checkRow(st, key, label, sub, listId) {
    var id = "ck-" + listId + "-" + key;
    var cb = el("input", { type: "checkbox", id: id });
    cb.checked = !!st.checked[key];
    cb.addEventListener("change", function () { if (cb.checked) st.checked[key] = true; else delete st.checked[key]; save("sc.list." + listId, st); li.classList.toggle("on", cb.checked); updateHead(); });
    var li = el("li", { class: "ck" + (cb.checked ? " on" : "") }, [el("label", { for: id }, [cb, el("span", { class: "box", html: icon("check", 14) }), el("span", { class: "txt" }, [el("b", { text: label }), sub ? el("small", { text: sub }) : null])])]);
    return li;
  }
  var updateHead = function () {};
  function renderList(body, listId) {
    var st = listState(listId), isPaper = listId === "papiere";
    var head = el("div", { class: "list-head" });
    updateHead = function () { var p = listProgress(listId); head.innerHTML = ""; head.appendChild(el("b", { text: p.done + " von " + p.total + " erledigt" })); head.appendChild(el("div", { class: "progress" }, [el("i", { style: "width:" + (p.total ? p.done / p.total * 100 : 0) + "%" })])); };
    body.appendChild(head); updateHead();
    if (isPaper) {
      var due = dueDate();
      if (!due) body.appendChild(note("Mit eingetragenem ET siehst du hier die passenden Daten zu jeder Aufgabe.", "info"));
      var before = el("ul", { class: "cks" }), after = el("ul", { class: "cks" });
      PAPER.map(function (p, i) { return { p: p, i: i }; }).sort(function (a, b) { return a.p[0] - b.p[0]; }).forEach(function (o) {
        var p = o.p, when = due ? (p[3] ? "nach der Geburt, " + (p[0] <= 7 ? "innerhalb von " + p[0] + " Tagen" : "in den ersten Wochen") : "ab " + fmtDate(addDays(due, p[0]), { day: "numeric", month: "long" })) : (p[3] ? "nach der Geburt" : "vor der Geburt");
        (p[3] ? after : before).appendChild(checkRow(st, "p" + o.i, p[1], when + " · " + p[2], listId));
      });
      body.appendChild(section("Vor der Geburt", [before]));
      body.appendChild(section("Nach der Geburt", [after]));
      body.appendChild(note("Fristen ohne Gewähr – Details bei Krankenkasse, Arbeitgeber, Elterngeldstelle und Familienkasse prüfen."));
    } else {
      var L = LISTS[listId];
      if (L.hint) body.appendChild(note(L.hint, "info"));
      L.groups.forEach(function (g, gi) {
        var ul = el("ul", { class: "cks" });
        g[1].forEach(function (x, i) { ul.appendChild(checkRow(st, gi + "-" + i, x, null, listId)); });
        body.appendChild(section(g[0], [ul]));
      });
    }
    // eigene Punkte
    var ulc = el("ul", { class: "cks" });
    st.custom.forEach(function (c) {
      var row = checkRow(st, c.id, c.text, null, listId);
      row.appendChild(el("button", { class: "icon-btn sm", "aria-label": "Punkt löschen", html: icon("trash", 18), onclick: function () { st.custom = st.custom.filter(function (x) { return x.id !== c.id; }); delete st.checked[c.id]; save("sc.list." + listId, st); rerender(); } }));
      ulc.appendChild(row);
    });
    var inp = el("input", { class: "input", id: "ckNew-" + listId, placeholder: "Eigenen Punkt hinzufügen", "aria-label": "Eigenen Punkt hinzufügen" });
    function add() { var v = inp.value.trim(); if (!v) return; st.custom.push({ id: "c" + uid(), text: v.slice(0, 100) }); save("sc.list." + listId, st); rerender(); }
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") add(); });
    body.appendChild(section("Eigene Punkte", [ulc, el("div", { class: "row2 tight" }, [inp, el("button", { class: "btn", "aria-label": "Hinzufügen", html: icon("plus", 20), onclick: add })])]));
  }
  function renderLists(body) {
    [["tasche", "Kliniktasche", "Für dich, das Baby und die Begleitung"], ["papiere", "Anträge & Behörden", "Mutterschaftsgeld, Elternzeit, Elterngeld …"], ["ausstattung", "Erstausstattung", "Was ihr fürs Baby braucht"]].forEach(function (x) {
      var p = listProgress(x[0]);
      body.appendChild(el("button", { class: "card tool-row", onclick: function () { openSub(x[0], x[1]); } }, [
        el("span", { class: "txt" }, [el("b", { text: x[1] }), el("small", { text: x[2] })]),
        el("span", { class: "ring-sm", style: "--p:" + (p.total ? p.done / p.total : 0) }, [el("span", { text: p.done + "/" + p.total })])
      ]));
    });
  }
  function openSub(listId, title) {
    current = "list:" + listId;
    TOOLS[current] = { title: title, render: function (b) { renderList(b, listId); }, back: "lists" };
    $("toolTitle").textContent = title; $("toolBody").innerHTML = ""; renderList($("toolBody"), listId); $("tool").scrollTop = 0;
  }

  /* =========================================================
     5) Mutterschutz-Rechner
     ========================================================= */
  function renderMutterschutz(body) {
    var due = dueDate();
    if (!due) { needDue(body); return; }
    var st = load("sc.mutterschutz", { birth: "", extended: false });
    var bIn = el("input", { class: "input", type: "date", id: "msBirth", "aria-label": "Tatsächliches Geburtsdatum" }); bIn.value = st.birth || "";
    var exIn = el("input", { type: "checkbox", id: "msExt" }); exIn.checked = !!st.extended;
    var out = el("div");
    function calc() {
      st.birth = bIn.value; st.extended = exIn.checked; save("sc.mutterschutz", st);
      var start = addDays(due, -42), afterWeeks = st.extended ? 12 : 8, end, extra = 0;
      if (st.birth) {
        var b = parseDate(st.birth);
        if (b < due) extra = Math.round((due - b) / DAY); // ungenutzte Tage vor der Geburt werden angehängt
        end = addDays(b, afterWeeks * 7 + extra);
      } else end = addDays(due, afterWeeks * 7);
      var total = Math.round((end - start) / DAY) + 1;
      out.innerHTML = "";
      out.appendChild(el("div", { class: "ms-grid" }, [
        el("div", null, [el("small", { text: "Beginn" }), el("b", { text: fmtDate(start, { weekday: "short", day: "numeric", month: "long", year: "numeric" }) })]),
        el("div", null, [el("small", { text: "Ende" + (st.birth ? "" : " (voraussichtlich)") }), el("b", { text: fmtDate(end, { weekday: "short", day: "numeric", month: "long", year: "numeric" }) })]),
        el("div", null, [el("small", { text: "Dauer" }), el("b", { text: total + " Tage" })]),
        el("div", null, [el("small", { text: "Mutterschaftsgeld beantragen" }), el("b", { text: "ab " + fmtDate(addDays(due, -49), { day: "numeric", month: "long" }) })])
      ]));
      if (extra) out.appendChild(note("Weil das Baby " + extra + " Tage vor dem ET kam, verlängert sich die Schutzfrist nach der Geburt um diese Tage."));
    }
    bIn.addEventListener("change", calc); exIn.addEventListener("change", calc);
    body.appendChild(section("Deine Schutzfristen", [out]));
    body.appendChild(section("Angaben", [
      el("label", { class: "label", for: "msBirth", text: "Tatsächlicher Geburtstag (nach der Geburt eintragen)" }), bIn,
      el("label", { class: "switch-row", for: "msExt" }, [exIn, el("span", { text: "Frühgeburt, Mehrlinge oder Behinderung des Kindes (12 statt 8 Wochen nach der Geburt)" })])
    ]));
    body.appendChild(note("Grundlage: Mutterschutzgesetz – 6 Wochen vor dem ET und 8 Wochen nach der Geburt. Ohne Gewähr; dein Arbeitgeber und deine Krankenkasse berechnen die verbindlichen Daten."));
    calc();
  }

  /* =========================================================
     6) Bauch-Tagebuch (Fotos in IndexedDB)
     ========================================================= */
  var DB = null;
  function db() {
    if (DB) return DB;
    DB = new Promise(function (res, rej) {
      if (!root.indexedDB) { rej(new Error("no idb")); return; }
      var r = indexedDB.open("schwanger-check", 1);
      r.onupgradeneeded = function () { r.result.createObjectStore("photos", { keyPath: "id" }); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
    return DB;
  }
  function idb(mode, fn) { return db().then(function (d) { return new Promise(function (res, rej) { var tx = d.transaction("photos", mode), st = tx.objectStore("photos"), out = fn(st); tx.oncomplete = function () { res(out && out.result !== undefined ? out.result : out); }; tx.onerror = function () { rej(tx.error); }; }); }); }
  function downscale(file, max) {
    return new Promise(function (res, rej) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { b ? res(b) : rej(new Error("blob")); }, "image/jpeg", 0.82);
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error("img")); };
      img.src = url;
    });
  }
  function renderDiary(body) {
    var meta = load("sc.diary", []); // {id, week, date, note}
    var d = pregDay(), wk = d != null ? Math.max(4, Math.floor(d / 7)) : null;
    var fileIn = el("input", { type: "file", accept: "image/*", capture: "environment", hidden: true, id: "diaryFile" });
    var noteIn = el("input", { class: "input", id: "diaryNote", placeholder: "Notiz zu dieser Woche (optional)", maxlength: "140", "aria-label": "Notiz" });
    var addBtn = el("button", { class: "btn", html: icon("camera", 20) + "<span>" + (wk ? "Foto für Woche " + wk : "Foto hinzufügen") + "</span>", onclick: function () { fileIn.click(); } });
    fileIn.addEventListener("change", function () {
      var f = fileIn.files && fileIn.files[0]; fileIn.value = ""; if (!f) return;
      toast("Foto wird gespeichert …");
      downscale(f, 1400).then(function (blob) {
        var id = uid();
        return idb("readwrite", function (st) { return st.put({ id: id, blob: blob }); }).then(function () {
          meta.unshift({ id: id, week: wk, date: isoDate(today0()), note: noteIn.value.trim().slice(0, 140) });
          save("sc.diary", meta); toast("Gespeichert"); rerender();
        });
      }).catch(function () { toast("Das Foto konnte nicht gespeichert werden."); });
    });
    body.appendChild(section(null, [el("p", { text: "Halte jede Woche fest, wie dein Bauch wächst – am besten immer an derselben Stelle und im selben Licht." }), noteIn, addBtn, fileIn]));
    if (!meta.length) { body.appendChild(el("p", { class: "empty", text: "Noch keine Fotos. Dein erstes Bauchfoto erscheint hier." })); return; }
    var grid = el("div", { class: "photo-grid" });
    meta.forEach(function (m) {
      var img = el("img", { alt: "Bauchfoto " + (m.week ? "Woche " + m.week : m.date), loading: "lazy" });
      idb("readonly", function (st) { return st.get(m.id); }).then(function (rec) { if (rec && rec.blob) { var u = URL.createObjectURL(rec.blob); img.src = u; img.onload = function () { URL.revokeObjectURL(u); }; } }).catch(function () {});
      grid.appendChild(el("figure", null, [img, el("figcaption", null, [el("b", { text: m.week ? "Woche " + m.week : fmtDate(parseDate(m.date)) }), m.note ? el("span", { text: m.note }) : null]),
        confirmBtn("Löschen", "Sicher?", "chip-btn", function () { idb("readwrite", function (st) { return st.delete(m.id); }).catch(function () {}); save("sc.diary", meta.filter(function (x) { return x.id !== m.id; })); rerender(); })]));
    });
    body.appendChild(grid);
    body.appendChild(note("Die Fotos bleiben nur auf diesem Gerät. Wenn du die Browserdaten löschst, sind sie weg – sichere Lieblingsfotos zusätzlich in deiner Fotos-App."));
  }

  /* =========================================================
     7) Gewicht
     ========================================================= */
  function renderWeight(body) {
    var list = load("sc.weight", []); // {date, kg}
    var dIn = el("input", { class: "input", type: "date", id: "wDate", "aria-label": "Datum" }); dIn.value = isoDate(today0());
    var kIn = el("input", { class: "input", id: "wKg", inputmode: "decimal", placeholder: "kg", "aria-label": "Gewicht in kg" });
    body.appendChild(section("Neuer Eintrag", [el("div", { class: "row2" }, [kIn, dIn]), el("button", { class: "btn", text: "Speichern", onclick: function () {
      var kg = parseFloat(String(kIn.value).replace(",", "."));
      if (!(kg > 30 && kg < 250)) { kIn.focus(); toast("Bitte ein Gewicht in kg eingeben, z. B. 64,5"); return; }
      list = list.filter(function (x) { return x.date !== dIn.value; });
      list.push({ date: dIn.value, kg: Math.round(kg * 10) / 10 });
      list.sort(function (a, b) { return a.date.localeCompare(b.date); });
      save("sc.weight", list); rerender();
    } })]));
    if (!list.length) { body.appendChild(el("p", { class: "empty", text: "Trag dein Gewicht ein, dann siehst du hier den Verlauf." })); return; }
    var first = list[0], last = list[list.length - 1], diff = Math.round((last.kg - first.kg) * 10) / 10;
    body.appendChild(el("div", { class: "stat-row card" }, [
      el("div", null, [el("small", { text: "Aktuell" }), el("b", { text: last.kg.toLocaleString("de-DE") + " kg" })]),
      el("div", null, [el("small", { text: "Seit " + fmtDate(parseDate(first.date), { day: "numeric", month: "short" }) }), el("b", { text: (diff > 0 ? "+" : "") + diff.toLocaleString("de-DE") + " kg" })]),
      el("div", null, [el("small", { text: "Einträge" }), el("b", { text: String(list.length) })])
    ]));
    if (list.length > 1) {
      var W = 320, H = 150, P = 26;
      var t0 = parseDate(first.date).getTime(), t1 = parseDate(last.date).getTime(), span = Math.max(1, t1 - t0);
      var mn = Math.min.apply(null, list.map(function (x) { return x.kg; })) - 1, mx = Math.max.apply(null, list.map(function (x) { return x.kg; })) + 1;
      var xs = function (dt) { return P + (parseDate(dt).getTime() - t0) / span * (W - 2 * P); };
      var ys = function (kg) { return H - P + 6 - (kg - mn) / (mx - mn) * (H - 2 * P); };
      var pts = list.map(function (x) { return xs(x.date).toFixed(1) + "," + ys(x.kg).toFixed(1); });
      var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="chart" role="img" aria-label="Gewichtsverlauf">' +
        '<line x1="' + P + '" x2="' + (W - P) + '" y1="' + ys(mn + 1) + '" y2="' + ys(mn + 1) + '" class="grid"/>' +
        '<line x1="' + P + '" x2="' + (W - P) + '" y1="' + ys(mx - 1) + '" y2="' + ys(mx - 1) + '" class="grid"/>' +
        '<text x="2" y="' + (ys(mx - 1) + 4) + '" class="axis">' + (mx - 1).toFixed(0) + '</text><text x="2" y="' + (ys(mn + 1) + 4) + '" class="axis">' + (mn + 1).toFixed(0) + '</text>' +
        '<polyline points="' + pts.join(" ") + '" class="line"/>' +
        list.map(function (x, i) { return '<circle cx="' + xs(x.date).toFixed(1) + '" cy="' + ys(x.kg).toFixed(1) + '" r="' + (i === list.length - 1 ? 5 : 3) + '" class="dot' + (i === list.length - 1 ? " last" : "") + '"/>'; }).join("") + '</svg>';
      body.appendChild(section("Verlauf", [el("div", { html: svg })]));
    }
    var ul = el("ul", { class: "rows" });
    list.slice().reverse().forEach(function (x) {
      ul.appendChild(el("li", null, [el("span", { text: fmtDay(parseDate(x.date)) }), el("b", { text: x.kg.toLocaleString("de-DE") + " kg" }),
        el("button", { class: "icon-btn sm", "aria-label": "Eintrag löschen", html: icon("trash", 18), onclick: function () { save("sc.weight", list.filter(function (y) { return y.date !== x.date; })); rerender(); } })]));
    });
    body.appendChild(section("Einträge", [ul]));
    body.appendChild(note("Wie viel Zunahme für dich passt, hängt von deinem Ausgangsgewicht ab – besprich das mit Hebamme oder Ärztin."));
  }

  /* =========================================================
     8) Namen
     ========================================================= */
  var NAME_IDEAS = {
    m: ["Noah", "Matteo", "Leon", "Elias", "Finn", "Paul", "Luca", "Ben", "Theo", "Henry", "Emil", "Felix", "Anton", "Jonas", "Oskar", "Karl", "Mats", "Milo", "Ida"],
    w: ["Emilia", "Sophia", "Emma", "Hannah", "Mia", "Lina", "Ella", "Mila", "Clara", "Lea", "Marie", "Leni", "Frieda", "Mathilda", "Lia", "Nora", "Ida", "Luisa", "Romy"]
  };
  NAME_IDEAS.m = NAME_IDEAS.m.filter(function (n) { return n !== "Ida"; });
  function renderNames(body) {
    var st = load("sc.names", { list: [] }); // {id, name, g, fav}
    var nIn = el("input", { class: "input", id: "nmNew", placeholder: "Name eingeben", maxlength: "40", "aria-label": "Name" });
    var g = "n";
    var seg = el("div", { class: "seg three" });
    function drawSeg() { seg.innerHTML = ""; [["w", "Mädchen"], ["m", "Junge"], ["n", "Beides"]].forEach(function (x) { seg.appendChild(el("button", { "aria-pressed": g === x[0] ? "true" : "false", text: x[1], onclick: function () { g = x[0]; drawSeg(); } })); }); }
    drawSeg();
    function add(name, gg) {
      name = String(name).trim().slice(0, 40); if (!name) return;
      if (st.list.some(function (x) { return x.name.toLowerCase() === name.toLowerCase(); })) { toast(name + " steht schon auf der Liste"); return; }
      st.list.push({ id: uid(), name: name, g: gg || g, fav: false }); save("sc.names", st); rerender();
    }
    nIn.addEventListener("keydown", function (e) { if (e.key === "Enter") add(nIn.value); });
    body.appendChild(section("Name hinzufügen", [nIn, seg, el("button", { class: "btn", text: "Auf die Liste", onclick: function () { add(nIn.value); } })]));
    if (st.list.length) {
      var ul = el("ul", { class: "names" });
      st.list.slice().sort(function (a, b) { return (b.fav - a.fav) || a.name.localeCompare(b.name, "de"); }).forEach(function (x) {
        ul.appendChild(el("li", { class: "g-" + x.g }, [
          el("button", { class: "fav" + (x.fav ? " on" : ""), "aria-label": (x.fav ? "Favorit entfernen: " : "Als Favorit markieren: ") + x.name, "aria-pressed": x.fav ? "true" : "false", html: icon("heart", 20), onclick: function () { x.fav = !x.fav; save("sc.names", st); rerender(); } }),
          el("b", { text: x.name }),
          el("small", { text: x.g === "w" ? "Mädchen" : x.g === "m" ? "Junge" : "beides" }),
          el("button", { class: "icon-btn sm", "aria-label": x.name + " entfernen", html: icon("trash", 18), onclick: function () { st.list = st.list.filter(function (y) { return y.id !== x.id; }); save("sc.names", st); rerender(); } })
        ]));
      });
      body.appendChild(section("Eure Liste (" + st.list.length + ")", [ul]));
    }
    function ideas(key, label) {
      var wrap = el("div", { class: "idea-chips" });
      NAME_IDEAS[key].forEach(function (n) { wrap.appendChild(el("button", { class: "chip-btn", text: "+ " + n, onclick: function () { add(n, key); } })); });
      return section(label, [wrap]);
    }
    body.appendChild(ideas("w", "Ideen: beliebte Mädchennamen"));
    body.appendChild(ideas("m", "Ideen: beliebte Jungennamen"));
  }

  /* =========================================================
     9) Partner-Link
     ========================================================= */
  function b64(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function unb64(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return decodeURIComponent(escape(atob(s))); }
  function shareLink() {
    var s = settings();
    var payload = { v: 1, due: s.due || "", mom: s.role === "partner" ? (s.momName || "") : (s.name || ""), baby: s.babyName || "" };
    return location.origin + location.pathname + "?p=" + b64(JSON.stringify(payload));
  }
  function renderPartner(body) {
    var s = settings();
    if (!s.due) { needDue(body); return; }
    var link = shareLink();
    var box = el("input", { class: "input", id: "shareLink", readonly: true, value: link, "aria-label": "Partner-Link" });
    var msg = (s.name ? s.name + " teilt" : "Hier ist") + " den Schwanger-Check mit dir: " + link;
    var shareBtn = el("button", { class: "btn", html: icon("share", 20) + "<span>Link teilen</span>", onclick: function () {
      if (navigator.share) navigator.share({ title: "Schwanger-Check", text: msg }).catch(function () {});
      else copy();
    } });
    function copy() {
      var done = function () { toast("Link kopiert"); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(done, function () { box.select(); });
      else { box.select(); try { document.execCommand("copy"); done(); } catch (e) {} }
    }
    body.appendChild(section(null, [
      el("p", { text: "Schick den Link an deinen Partner, deine Mama oder beste Freundin. Wer ihn öffnet, bekommt die App mit eurem Termin" + (s.babyName ? " und dem Namen " + s.babyName : "") + " – und sieht jede Woche, wie sich das Baby entwickelt." }),
      box, el("div", { class: "row" }, [shareBtn, el("button", { class: "btn soft", text: "Kopieren", onclick: copy })])
    ]));
    body.appendChild(note("Im Link stehen nur ET und Vornamen – keine Fotos, Termine oder Listen. Es gibt keinen Server: ändert sich der ET, schick den Link einfach neu."));
  }
  // Einladung aus der Adresszeile übernehmen
  function readInvite() {
    var m = location.search.match(/[?&]p=([A-Za-z0-9_-]+)/);
    if (!m) return null;
    try { var d = JSON.parse(unb64(m[1])); if (d && /^\d{4}-\d{2}-\d{2}$/.test(d.due || "")) return d; } catch (e) {}
    return null;
  }

  /* ---------- Verzeichnis ---------- */
  var TOOLS = {
    kicks: { title: "Tritte zählen", icon: "kick", sub: "Kindsbewegungen", render: renderKicks },
    wehen: { title: "Wehen-Timer", icon: "timer", sub: "Dauer & Abstand", render: renderContractions },
    termine: { title: "Termine & Vorsorge", icon: "cal", sub: "Mutterpass-Plan", render: renderAppointments },
    lists: { title: "Checklisten", icon: "list", sub: "Tasche, Anträge, Ausstattung", render: renderLists },
    mutterschutz: { title: "Mutterschutz", icon: "shield", sub: "Fristen berechnen", render: renderMutterschutz },
    diary: { title: "Bauch-Tagebuch", icon: "camera", sub: "Ein Foto pro Woche", render: renderDiary },
    weight: { title: "Gewicht", icon: "scale", sub: "Verlauf", render: renderWeight },
    names: { title: "Namen", icon: "heart", sub: "Eure Favoriten", render: renderNames },
    partner: { title: "Partner-Link", icon: "share", sub: "App mit Termin teilen", render: renderPartner }
  };

  function renderToolGrid(container) {
    container.innerHTML = "";
    var grid = el("div", { class: "tool-grid" });
    grid.appendChild(el("button", { class: "tool-tile accent", onclick: function () { root.SCApp.go("lex"); } }, [el("span", { class: "ico", html: icon("food") }), el("span", null, [el("b", { text: "Lebensmittel-Check" }), el("small", { text: "Scannen, Lexikon & Verlauf" })])]));
    Object.keys(TOOLS).forEach(function (k) {
      var t = TOOLS[k]; if (!t.icon) return;
      var badge = null;
      if (k === "kicks") { var a = load("sc.kicks", {}).active; if (a) badge = el("span", { class: "live", text: "läuft" }); }
      if (k === "wehen") { var w = load("sc.contractions", {}).active; if (w) badge = el("span", { class: "live", text: "läuft" }); }
      if (k === "lists") { var p1 = listProgress("tasche"), p2 = listProgress("papiere"); badge = el("span", { class: "count", text: (p1.done + p2.done) + "/" + (p1.total + p2.total) }); }
      var wide = k === "partner";
      grid.appendChild(el("button", { class: "tool-tile" + (wide ? " wide" : ""), onclick: function () { openTool(k); } }, wide
        ? [el("span", { class: "ico", html: icon(t.icon) }), el("span", null, [el("b", { text: t.title }), el("small", { text: "Partner und Familie sehen euren Termin und jede Woche" })])]
        : [el("span", { class: "ico", html: icon(t.icon) }), el("b", { text: t.title }), el("small", { text: t.sub }), badge]));
    });
    container.appendChild(grid);
  }

  function init() {
    $("toolClose").addEventListener("click", function () {
      var t = TOOLS[current];
      if (t && t.back) openTool(t.back); else closeTool();
    });
  }

  root.SCTools = { open: openTool, close: closeTool, renderGrid: renderToolGrid, upcoming: upcomingAppointments, listProgress: listProgress, readInvite: readInvite, icon: icon, init: init, isOpen: function () { return !!current; }, _b64: b64, _unb64: unb64 };
})(this);
