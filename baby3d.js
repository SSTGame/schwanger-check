/* Baby3D – eigenes, stilisiertes 3D-Modell des Babys in der Fruchtblase, passend zur SSW.
   Benötigt three.js (global THREE). Kein medizinisch exaktes Modell. */
(function (root) {
  "use strict";
  var T = root.THREE;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function V(x, y, z) { return new T.Vector3(x, y, z || 0); }

  function Baby3D(container) {
    this.el = container;
    this.week = 12;
    this.running = false;
    this.rotY = -0.5; this.rotX = 0.08; this.velY = 0; this.dragging = false;
    this.t0 = performance.now();
    this._init();
  }

  Baby3D.prototype._init = function () {
    var w = this.el.clientWidth || 320, h = this.el.clientHeight || w;
    var r = this.renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.setSize(w, h, false);
    r.outputEncoding = T.sRGBEncoding;
    r.toneMapping = T.ACESFilmicToneMapping;
    r.toneMappingExposure = 0.92;
    r.domElement.style.width = "100%"; r.domElement.style.height = "100%"; r.domElement.style.display = "block";
    r.domElement.setAttribute("aria-hidden", "true");
    this.el.appendChild(r.domElement);

    var s = this.scene = new T.Scene();
    var cam = this.camera = new T.PerspectiveCamera(32, w / h, 0.1, 50);
    cam.position.set(0, 0.02, 5.3);

    s.add(new T.HemisphereLight(0xffeee6, 0x6b3a6a, 0.7));
    var key = new T.DirectionalLight(0xffe2d0, 1.05); key.position.set(-2.5, 3, 3.5); s.add(key);
    var rim = new T.DirectionalLight(0xc6b5ff, 0.9); rim.position.set(2.5, 1.2, -3); s.add(rim);
    var fill = new T.PointLight(0xff9a7a, 0.5, 8); fill.position.set(0, -1.5, 1.5); s.add(fill);

    // Fruchtblase
    this.world = new T.Group(); s.add(this.world);
    var bubbleGeo = new T.SphereGeometry(1.3, 72, 54);
    this.bubbleGeo = bubbleGeo;
    this.bubbleBase = Float32Array.from(bubbleGeo.attributes.position.array);
    this.bubbleBack = new T.Mesh(bubbleGeo, new T.MeshPhongMaterial({ color: 0xffb7a3, emissive: 0x3a1420, transparent: true, opacity: 0.22, side: T.BackSide, depthWrite: false, shininess: 10 }));
    this.bubbleFront = new T.Mesh(bubbleGeo, new T.MeshPhongMaterial({ color: 0xffd9cc, specular: 0xffffff, shininess: 90, transparent: true, opacity: 0.08, depthWrite: false }));
    this.world.add(this.bubbleBack);
    this.world.add(this.bubbleFront);

    // Schwebeteilchen
    var pts = new T.BufferGeometry(), n = 70, arr = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var u = Math.random(), v = Math.random(), rr = 1.22 * Math.cbrt(Math.random());
      var th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1);
      arr[i * 3] = rr * Math.sin(ph) * Math.cos(th); arr[i * 3 + 1] = rr * Math.cos(ph); arr[i * 3 + 2] = rr * Math.sin(ph) * Math.sin(th);
    }
    pts.setAttribute("position", new T.BufferAttribute(arr, 3));
    this.dust = new T.Points(pts, new T.PointsMaterial({ color: 0xffffff, size: 0.018, transparent: true, opacity: 0.55, depthWrite: false }));
    this.world.add(this.dust);

    this.babyPivot = new T.Group(); this.world.add(this.babyPivot);
    this._bindInput();
    var self = this;
    if (root.ResizeObserver) { this.ro = new ResizeObserver(function () { self.resize(); }); this.ro.observe(this.el); }
    this.reduceMotion = root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  Baby3D.prototype.resize = function () {
    var w = this.el.clientWidth, h = this.el.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    if (!this.running) this.render();
  };

  Baby3D.prototype._bindInput = function () {
    var self = this, c = this.renderer.domElement, lastX = 0, lastY = 0, lastT = 0;
    c.style.touchAction = "pan-y";
    c.addEventListener("pointerdown", function (e) { self.dragging = true; lastX = e.clientX; lastY = e.clientY; lastT = performance.now(); self.velY = 0; try { c.setPointerCapture(e.pointerId); } catch (x) {} });
    c.addEventListener("pointermove", function (e) {
      if (!self.dragging) return;
      var dx = e.clientX - lastX, dy = e.clientY - lastY, now = performance.now();
      self.rotY += dx * 0.012; self.rotX = clamp(self.rotX + dy * 0.006, -0.6, 0.6);
      self.velY = dx * 0.012 / Math.max(16, now - lastT) * 16;
      lastX = e.clientX; lastY = e.clientY; lastT = now;
      if (!self.running) self.render();
    });
    function up() { self.dragging = false; }
    c.addEventListener("pointerup", up); c.addEventListener("pointercancel", up); c.addEventListener("pointerleave", up);
  };

  /* ---------- Material ---------- */
  function skinMat(p) {
    // früh: durchscheinend rötlich, später: warmer Hautton
    var c = new T.Color(0xdc6a68).lerp(new T.Color(0xe48c78), smooth((p - 0.1) / 0.7));
    return new T.MeshPhysicalMaterial({
      color: c, roughness: 0.55, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.5,
      sheen: 0.6, sheenColor: new T.Color(0xffc9b8), sheenRoughness: 0.7,
      transparent: p < 0.12, opacity: p < 0.12 ? 0.92 : 1
    });
  }

  /* ---------- Bausteine ---------- */
  function ball(mat, pos, r, scale) {
    var m = new T.Mesh(new T.SphereGeometry(r, 36, 28), mat);
    m.position.copy(pos); if (scale) m.scale.set(scale[0], scale[1], scale[2]);
    return m;
  }
  function limb(mat, a, b, ra, rb) {
    var g = new T.Group(), dir = new T.Vector3().subVectors(b, a), len = dir.length();
    var r = (ra + rb) / 2;
    var cap = new T.Mesh(new T.CapsuleGeometry(r, Math.max(0.001, len), 8, 20), mat);
    cap.position.copy(a).addScaledVector(dir, 0.5);
    cap.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.clone().normalize());
    // Verjüngung: Kapsel entlang der Achse leicht in Richtung rb skalieren
    g.add(cap);
    return g;
  }
  // Kette überlappender Kugeln entlang einer Kurve – ergibt weiche, organische Formen
  function chain(mat, curve, n, radiusFn, squash) {
    var g = new T.Group();
    for (var i = 0; i <= n; i++) {
      var t = i / n, p = curve.getPoint(t), r = radiusFn(t);
      if (r <= 0.0005) continue;
      g.add(ball(mat, p, r, squash ? [1, 1, squash] : null));
    }
    return g;
  }

  /* ---------- Embryo (SSW 4–8) ---------- */
  function buildEmbryo(week) {
    var g = new T.Group();
    var p = (week - 4) / 36;
    var mat = skinMat(p);
    var f = clamp((week - 4) / 4, 0, 1); // 0 = SSW 4, 1 = SSW 8
    var L = lerp(0.32, 0.8, f);

    if (week <= 4) {
      // Keimscheibe: kleine, leicht gebogene Scheibe
      var disc = ball(mat, V(0, 0, 0), 0.16, [1.4, 0.55, 1]);
      g.add(disc);
    } else {
      // C-förmiger Körper mit großem Kopf und Schwänzchen
      var curve = new T.CatmullRomCurve3([
        V(-0.05, 0.42, 0), V(0.22, 0.30, 0), V(0.30, 0.02, 0), V(0.18, -0.26, 0), V(-0.06, -0.36, 0), V(-0.20, -0.22, 0)
      ].map(function (v) { return v.multiplyScalar(L); }));
      var headR = lerp(0.20, 0.26, f) * L, bodyR = lerp(0.13, 0.17, f) * L;
      g.add(chain(mat, curve, 46, function (t) {
        if (t < 0.18) return lerp(headR, headR * 0.92, t / 0.18);
        if (t < 0.6) return lerp(headR * 0.85, bodyR, (t - 0.18) / 0.42);
        return lerp(bodyR, 0.012 * L, Math.pow((t - 0.6) / 0.4, 0.8));
      }, 0.9));
      // Kopf
      g.add(ball(mat, V(-0.08, 0.40, 0).multiplyScalar(L), headR * 1.25));
      // Herzwölbung
      if (week >= 5) g.add(ball(new T.MeshPhysicalMaterial({ color: 0xd8505a, roughness: 0.5, transparent: true, opacity: 0.85 }), V(-0.02, 0.08, 0).multiplyScalar(L), bodyR * 0.75));
      // Augenfleck
      if (week >= 6) {
        var eyeMat = new T.MeshStandardMaterial({ color: 0x2a1622, roughness: 0.6 });
        g.add(ball(eyeMat, V(-0.30, 0.44, 0.12).multiplyScalar(L), 0.025 * L * (week >= 7 ? 1.4 : 1)));
        g.add(ball(eyeMat, V(-0.30, 0.44, -0.12).multiplyScalar(L), 0.025 * L * (week >= 7 ? 1.4 : 1)));
      }
      // Arm- und Beinknospen
      if (week >= 6) {
        var bud = lerp(0.05, 0.11, clamp((week - 6) / 2, 0, 1)) * L;
        [1, -1].forEach(function (s) {
          g.add(ball(mat, V(-0.10, 0.12, s * 0.14).multiplyScalar(L), bud, [1.5, 0.7, 0.8]));
          g.add(ball(mat, V(-0.04, -0.20, s * 0.13).multiplyScalar(L), bud * 0.9, [1.5, 0.7, 0.8]));
        });
      }
    }
    // Dottersack mit Stiel
    var yolkMat = new T.MeshPhysicalMaterial({ color: 0xffd36e, roughness: 0.35, clearcoat: 0.6, transparent: true, opacity: 0.9 });
    var yolkPos = V(-0.55, -0.35, 0.2);
    g.add(ball(yolkMat, yolkPos, lerp(0.12, 0.09, f)));
    var stalk = new T.CatmullRomCurve3([V(-0.1, -0.05, 0), V(-0.3, -0.25, 0.1), yolkPos]);
    g.add(new T.Mesh(new T.TubeGeometry(stalk, 20, 0.018, 8, false), yolkMat));
    return g;
  }

  /* ---------- Fötus (ab SSW 9) ---------- */
  function buildFetus(week) {
    var g = new T.Group();
    var p = clamp((week - 9) / 31, 0, 1);       // 0 = SSW 9, 1 = SSW 40
    var mat = skinMat(0.15 + p * 0.85);
    var L = 1;                                    // Körpermaß, Gesamtgröße regelt die Szene
    var k = lerp(0.72, 1.18, smooth(p));          // Babyspeck
    var limbGrow = lerp(0.62, 1, smooth(p * 1.6));
    var headR = lerp(0.30, 0.205, smooth(p)) * L; // Kopf wird im Verhältnis kleiner

    // Wirbelsäule: gekrümmt, Rücken auf +x
    var spine = new T.CatmullRomCurve3([V(0.00, 0.30), V(0.12, 0.14), V(0.13, -0.06), V(0.04, -0.22), V(-0.06, -0.28)]);
    g.add(chain(mat, spine, 28, function (t) {
      var base = t < 0.35 ? lerp(0.12, 0.165, t / 0.35) : t < 0.75 ? lerp(0.165, 0.175, (t - 0.35) / 0.4) : lerp(0.175, 0.13, (t - 0.75) / 0.25);
      return base * k * L;
    }, 1.0));

    // Kopf: zur Brust geneigt, Gesicht zeigt nach -x
    var hc = V(-0.06, 0.30 + headR * 0.95, 0);
    var head = ball(mat, hc, headR, [1.0, 1.05, 0.92]);
    g.add(head);
    // Hinterkopf etwas ausladend
    g.add(ball(mat, hc.clone().add(V(headR * 0.25, headR * 0.1, 0)), headR * 0.92));
    // Nase, Kinn, Stirn
    g.add(ball(mat, hc.clone().add(V(-headR * 0.95, -headR * 0.12, 0)), headR * 0.13, [1, 0.8, 1]));
    g.add(ball(mat, hc.clone().add(V(-headR * 0.72, -headR * 0.62, 0)), headR * 0.28));
    g.add(ball(mat, hc.clone().add(V(-headR * 0.55, headR * 0.45, 0)), headR * 0.55));
    // geschlossene Augen: dunkle, flache Linien
    var lidMat = new T.MeshStandardMaterial({ color: 0x6a3b3f, roughness: 0.8 });
    [1, -1].forEach(function (s) {
      var e = ball(lidMat, hc.clone().add(V(-headR * 0.86, headR * 0.12, s * headR * 0.36)), headR * 0.12, [0.35, 0.28, 1]);
      e.rotation.y = s * 0.45; g.add(e);
      // Ohren (ab SSW 12 deutlicher)
      if (week >= 11) {
        var ear = ball(mat, hc.clone().add(V(headR * 0.1, -headR * 0.05, s * headR * 0.9)), headR * 0.2, [0.7, 1.15, 0.4]);
        g.add(ear);
      }
    });

    // Arme: zum Gesicht hin gefaltet
    [1, -1].forEach(function (s) {
      var sh = V(0.0, 0.22, s * 0.14 * k);
      var el = V(-0.17 * limbGrow, 0.06, s * 0.17 * k);
      var ha = V(-0.24 * limbGrow - 0.02, 0.18 + 0.12 * limbGrow, s * 0.07);
      var ar = 0.045 * k * L;
      g.add(limb(mat, sh, el, ar * 1.1, ar));
      g.add(limb(mat, el, ha, ar, ar * 0.85));
      g.add(ball(mat, ha, ar * 1.25, [1, 1.1, 0.7]));
      // Daumen in Richtung Mund bei einer Hand
      if (s === 1 && week >= 14) g.add(ball(mat, ha.clone().add(V(-0.02, 0.05, -0.02)), ar * 0.45));
    });

    // Beine: angezogen
    [1, -1].forEach(function (s) {
      var hip = V(0.02, -0.18, s * 0.11 * k);
      var knee = V(-0.26 * limbGrow, -0.02 + 0.04 * limbGrow, s * 0.14 * k);
      var ank = V(-0.12 * limbGrow, -0.28 * limbGrow - 0.02, s * 0.09);
      var lr = 0.065 * k * L;
      g.add(limb(mat, hip, knee, lr * 1.15, lr));
      g.add(limb(mat, knee, ank, lr * 0.9, lr * 0.7));
      var foot = ball(mat, ank.clone().add(V(-0.05, -0.01, 0)), lr * 0.85, [1.6, 0.6, 0.85]);
      g.add(foot);
    });

    // Ansatz der Nabelschnur am Bauch (die Schnur selbst wird nach dem Skalieren gebaut)
    g.userData.cordStart = V(-0.15 * k, -0.08, 0);
    g.userData.cordR = 0.028 * lerp(0.9, 1.2, p);
    return g;
  }

  function disposeTree(o) {
    o.traverse(function (n) {
      if (n.geometry) n.geometry.dispose();
      if (n.material) { (Array.isArray(n.material) ? n.material : [n.material]).forEach(function (m) { m.dispose(); }); }
    });
  }

  Baby3D.prototype.setWeek = function (week) {
    week = clamp(Math.round(week || 12), 4, 42);
    this.week = week;
    var old = this.baby;
    if (old) { this.babyPivot.remove(old); disposeTree(old); }
    var b = week <= 8 ? buildEmbryo(week) : buildFetus(week);
    // zentrieren und auf die Blase skalieren
    var box = new T.Box3().setFromObject(b), size = new T.Vector3(), center = new T.Vector3();
    box.getSize(size); box.getCenter(center);
    var maxDim = Math.max(size.x, size.y, size.z);
    var target;
    if (week <= 8) target = lerp(0.55, 1.25, clamp((week - 4) / 4, 0, 1));
    else target = lerp(1.35, 2.05, smooth((week - 9) / 31));
    var sc = target / maxDim;
    b.position.sub(center);
    var holder = new T.Group(), inner = new T.Group();
    inner.add(b); inner.scale.setScalar(sc); holder.add(inner);
    // Nabelschnur vom Bauch zur Blasenwand – in Szenengröße, damit sie innerhalb der Blase endet
    if (b.userData.cordStart) {
      var st = b.userData.cordStart.clone().sub(center).multiplyScalar(sc);
      var end = V(-0.55, -0.95, 0.45).normalize().multiplyScalar(1.24);
      var pts = [st];
      for (var i = 1; i <= 8; i++) {
        var t = i / 8, wob = Math.sin(t * Math.PI) * 0.08;
        pts.push(V(lerp(st.x, end.x, t) + Math.sin(t * 9) * wob, lerp(st.y, end.y, t) + Math.cos(t * 7) * wob, lerp(st.z, end.z, t) + Math.sin(t * 6) * wob));
      }
      var cordMat = new T.MeshPhysicalMaterial({ color: 0xeec2c8, roughness: 0.35, clearcoat: 0.7, sheen: 0.5, sheenColor: new T.Color(0xffffff) });
      holder.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 100, b.userData.cordR * sc, 10, false), cordMat));
      // Plazenta-Ansatz als flache Scheibe an der Wand
      var plac = new T.Mesh(new T.SphereGeometry(0.16, 32, 16), new T.MeshPhysicalMaterial({ color: 0xc8506a, roughness: 0.6, transparent: true, opacity: 0.8 }));
      plac.position.copy(end); plac.scale.set(1, 1, 0.35); plac.lookAt(0, 0, 0); holder.add(plac);
    }
    this.baby = holder;
    this.breathe = inner;
    this.babyPivot.add(holder);
    this.popT = performance.now();
    if (!this.running) this.render();
  };

  Baby3D.prototype.render = function () {
    var now = performance.now(), t = (now - this.t0) / 1000;
    if (!this.dragging) {
      this.velY *= 0.94;
      this.rotY += this.velY + (this.reduceMotion ? 0 : 0.0028);
    }
    this.world.rotation.y = this.rotY;
    this.world.rotation.x = this.rotX;
    if (!this.reduceMotion) {
      this.babyPivot.position.y = Math.sin(t * 0.9) * 0.025;
      this.babyPivot.rotation.z = Math.sin(t * 0.6) * 0.04;
      var br = 1 + Math.sin(t * 1.6) * 0.006;
      if (this.breathe) { var bs = this.breathe.userData.s || (this.breathe.userData.s = this.breathe.scale.x); this.breathe.scale.setScalar(bs * br); }
      this.dust.rotation.y = t * 0.03;
      this._wobble(t);
    }
    // sanftes Einblenden nach Wochenwechsel
    if (this.popT) {
      var a = clamp((now - this.popT) / 450, 0, 1), e = 1 - Math.pow(1 - a, 3);
      this.babyPivot.scale.setScalar(0.85 + 0.15 * e);
      if (a >= 1) this.popT = 0;
    }
    this.renderer.render(this.scene, this.camera);
  };

  // Fruchtblase wabert: weiche, langsam wandernde Wellen auf der Oberfläche
  Baby3D.prototype._wobble = function (t) {
    var pos = this.bubbleGeo.attributes.position, a = pos.array, b = this.bubbleBase, R = 1.3;
    for (var i = 0; i < a.length; i += 3) {
      var x = b[i] / R, y = b[i + 1] / R, z = b[i + 2] / R;
      var d = 0.012 * Math.sin(2.6 * x + 1.7 * y + t * 0.75)
            + 0.008 * Math.sin(3.1 * z - 2.2 * x + t * 1.05)
            + 0.006 * Math.sin(4.3 * y + 1.3 * z - t * 0.6);
      var f = 1 + d;
      a[i] = b[i] * f; a[i + 1] = b[i + 1] * f; a[i + 2] = b[i + 2] * f;
    }
    pos.needsUpdate = true;
    this.bubbleGeo.computeVertexNormals();
    // ganz leichtes Atmen der ganzen Blase
    var s = 1 + Math.sin(t * 0.55) * 0.012;
    this.bubbleBack.scale.setScalar(s); this.bubbleFront.scale.setScalar(s);
  };

  Baby3D.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    var self = this;
    (function loop() {
      if (!self.running) return;
      self.render();
      self.raf = requestAnimationFrame(loop);
    })();
  };
  Baby3D.prototype.stop = function () { this.running = false; if (this.raf) cancelAnimationFrame(this.raf); };

  Baby3D.supported = function () {
    if (!T) return false;
    try { var c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
  };

  root.Baby3D = Baby3D;
})(this);
