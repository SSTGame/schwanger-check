/* Baby3D – eigenes, stilisiertes 3D-Modell des Babys in der Fruchtblase, passend zur SSW.
   Der Körper wird als ein glattes Ganzes aus einem Distanzfeld (weich verschmolzene Grundformen)
   berechnet und mit „Surface Nets“ in ein Netz umgewandelt. Benötigt three.js (global THREE).
   Kein medizinisch exaktes Modell. */
(function (root) {
  "use strict";
  var T = root.THREE;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }

  /* ---------- Distanzfunktionen (je Punkt x,y,z) ---------- */
  function sdSphere(x, y, z, c, r) { var dx = x - c[0], dy = y - c[1], dz = z - c[2]; return Math.sqrt(dx * dx + dy * dy + dz * dz) - r; }
  function sdEllipsoid(x, y, z, c, r) {
    var px = (x - c[0]) / r[0], py = (y - c[1]) / r[1], pz = (z - c[2]) / r[2];
    var k0 = Math.sqrt(px * px + py * py + pz * pz);
    var qx = px / r[0], qy = py / r[1], qz = pz / r[2];
    var k1 = Math.sqrt(qx * qx + qy * qy + qz * qz);
    return k1 > 1e-9 ? k0 * (k0 - 1) / k1 : -Math.min(r[0], r[1], r[2]);
  }
  // „Round cone“: Kapsel mit zwei Radien zwischen a und b
  function sdRoundCone(x, y, z, a, b, r1, r2) {
    var bax = b[0] - a[0], bay = b[1] - a[1], baz = b[2] - a[2];
    var l2 = bax * bax + bay * bay + baz * baz, rr = r1 - r2, a2 = l2 - rr * rr, il2 = 1 / l2;
    var pax = x - a[0], pay = y - a[1], paz = z - a[2];
    var yy = pax * bax + pay * bay + paz * baz, zz = yy - l2;
    var wx = pax * l2 - bax * yy, wy = pay * l2 - bay * yy, wz = paz * l2 - baz * yy;
    var x2 = wx * wx + wy * wy + wz * wz, y2 = yy * yy * l2, z2 = zz * zz * l2;
    var k = Math.sign(rr) * rr * rr * x2;
    if (Math.sign(zz) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
    if (Math.sign(yy) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
    return (Math.sqrt(x2 * a2 * il2) + yy * rr) * il2 - r1;
  }
  function smin(a, b, k) { if (k <= 0) return Math.min(a, b); var h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; }
  function smax(a, b, k) { return -smin(-a, -b, k); }

  // Ein Teil: {t:"s"|"e"|"c", ...Parameter, k: Weichheit beim Verschmelzen, cut: true = abziehen}
  function evalParts(parts, x, y, z) {
    var d = 1e9;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i], v;
      if (p.t === "s") v = sdSphere(x, y, z, p.c, p.r);
      else if (p.t === "e") v = sdEllipsoid(x, y, z, p.c, p.r);
      else v = sdRoundCone(x, y, z, p.a, p.b, p.r1, p.r2);
      d = p.cut ? smax(d, -v, p.k) : smin(d, v, p.k);
    }
    return d;
  }
  function partBox(p) {
    if (p.t === "s") return [p.c[0] - p.r, p.c[1] - p.r, p.c[2] - p.r, p.c[0] + p.r, p.c[1] + p.r, p.c[2] + p.r];
    if (p.t === "e") return [p.c[0] - p.r[0], p.c[1] - p.r[1], p.c[2] - p.r[2], p.c[0] + p.r[0], p.c[1] + p.r[1], p.c[2] + p.r[2]];
    var r = Math.max(p.r1, p.r2);
    return [Math.min(p.a[0], p.b[0]) - r, Math.min(p.a[1], p.b[1]) - r, Math.min(p.a[2], p.b[2]) - r, Math.max(p.a[0], p.b[0]) + r, Math.max(p.a[1], p.b[1]) + r, Math.max(p.a[2], p.b[2]) + r];
  }

  /* ---------- Surface Nets: Distanzfeld → glattes Dreiecksnetz ---------- */
  function mesh(parts, res) {
    var bb = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9];
    parts.forEach(function (p) { if (p.cut) return; var b = partBox(p); for (var i = 0; i < 3; i++) { bb[i] = Math.min(bb[i], b[i]); bb[i + 3] = Math.max(bb[i + 3], b[i + 3]); } });
    var pad = 0.06; for (var i0 = 0; i0 < 3; i0++) { bb[i0] -= pad; bb[i0 + 3] += pad; }
    var size = Math.max(bb[3] - bb[0], bb[4] - bb[1], bb[5] - bb[2]), h = size / res;
    var nx = Math.ceil((bb[3] - bb[0]) / h) + 1, ny = Math.ceil((bb[4] - bb[1]) / h) + 1, nz = Math.ceil((bb[5] - bb[2]) / h) + 1;
    var F = new Float32Array(nx * ny * nz);
    var x, y, z, idx = 0;
    for (z = 0; z < nz; z++) for (y = 0; y < ny; y++) for (x = 0; x < nx; x++) F[idx++] = evalParts(parts, bb[0] + x * h, bb[1] + y * h, bb[2] + z * h);
    var I = function (x, y, z) { return x + nx * (y + ny * z); };
    var vid = new Int32Array(nx * ny * nz).fill(-1), pos = [];
    var cx = [0, 1, 0, 1, 0, 1, 0, 1], cy = [0, 0, 1, 1, 0, 0, 1, 1], cz = [0, 0, 0, 0, 1, 1, 1, 1];
    var E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
    var v = new Float32Array(8);
    for (z = 0; z < nz - 1; z++) for (y = 0; y < ny - 1; y++) for (x = 0; x < nx - 1; x++) {
      var mask = 0;
      for (var c = 0; c < 8; c++) { v[c] = F[I(x + cx[c], y + cy[c], z + cz[c])]; if (v[c] < 0) mask |= 1 << c; }
      if (mask === 0 || mask === 255) continue;
      var sx = 0, sy = 0, sz = 0, n = 0;
      for (var e = 0; e < 12; e++) {
        var a = E[e][0], b = E[e][1];
        if ((v[a] < 0) === (v[b] < 0)) continue;
        var t = v[a] / (v[a] - v[b]);
        sx += cx[a] + (cx[b] - cx[a]) * t; sy += cy[a] + (cy[b] - cy[a]) * t; sz += cz[a] + (cz[b] - cz[a]) * t; n++;
      }
      vid[I(x, y, z)] = pos.length / 3;
      pos.push(bb[0] + (x + sx / n) * h, bb[1] + (y + sy / n) * h, bb[2] + (z + sz / n) * h);
    }
    var ind = [];
    function quad(a, b, c, d, flip) { if (a < 0 || b < 0 || c < 0 || d < 0) return; if (flip) ind.push(a, c, b, a, d, c); else ind.push(a, b, c, a, c, d); }
    for (z = 1; z < nz - 1; z++) for (y = 1; y < ny - 1; y++) for (x = 1; x < nx - 1; x++) {
      var inside = F[I(x, y, z)] < 0;
      if ((F[I(x + 1, y, z)] < 0) !== inside) quad(vid[I(x, y - 1, z - 1)], vid[I(x, y, z - 1)], vid[I(x, y, z)], vid[I(x, y - 1, z)], !inside);
      if ((F[I(x, y + 1, z)] < 0) !== inside) quad(vid[I(x - 1, y, z - 1)], vid[I(x - 1, y, z)], vid[I(x, y, z)], vid[I(x, y, z - 1)], !inside);
      if ((F[I(x, y, z + 1)] < 0) !== inside) quad(vid[I(x - 1, y - 1, z)], vid[I(x, y - 1, z)], vid[I(x, y, z)], vid[I(x - 1, y, z)], !inside);
    }
    // Normalen aus dem Gradienten des Distanzfelds – dadurch wirkt die Haut weich
    var nrm = new Float32Array(pos.length), eps = h * 0.5;
    for (var p = 0; p < pos.length; p += 3) {
      var X = pos[p], Y = pos[p + 1], Z = pos[p + 2];
      var gx = evalParts(parts, X + eps, Y, Z) - evalParts(parts, X - eps, Y, Z);
      var gy = evalParts(parts, X, Y + eps, Z) - evalParts(parts, X, Y - eps, Z);
      var gz = evalParts(parts, X, Y, Z + eps) - evalParts(parts, X, Y, Z - eps);
      var l = Math.sqrt(gx * gx + gy * gy + gz * gz) || 1;
      nrm[p] = gx / l; nrm[p + 1] = gy / l; nrm[p + 2] = gz / l;
    }
    // weiche Schatten in Falten und Beugen: wie weit ist die Umgebung entlang der Normalen frei?
    var col = new Float32Array(pos.length), span = size * 0.035;
    for (var q = 0; q < pos.length; q += 3) {
      var occ = 0, wsum = 0;
      for (var st = 1; st <= 4; st++) {
        var dd = span * st, w = 1 / st;
        var sd = evalParts(parts, pos[q] + nrm[q] * dd, pos[q + 1] + nrm[q + 1] * dd, pos[q + 2] + nrm[q + 2] * dd);
        occ += w * Math.max(0, (dd - sd) / dd); wsum += w;
      }
      var ao = 1 - clamp(occ / wsum, 0, 1) * 0.85;
      ao = 0.55 + 0.45 * ao;
      col[q] = ao; col[q + 1] = ao * 0.97 + 0.02; col[q + 2] = ao * 0.97 + 0.02;
    }
    var g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new T.BufferAttribute(nrm, 3));
    g.setAttribute("color", new T.BufferAttribute(col, 3));
    g.setIndex(ind);
    return g;
  }

  /* ---------- Körperbau je Woche ---------- */
  function S(c, r, k) { return { t: "s", c: c, r: r, k: k || 0 }; }
  function Ell(c, r, k, cut) { return { t: "e", c: c, r: r, k: k || 0, cut: !!cut }; }
  function C(a, b, r1, r2, k) { return { t: "c", a: a, b: b, r1: r1, r2: r2, k: k || 0 }; }

  function fetusParts(week) {
    var p = clamp((week - 9) / 31, 0, 1);
    var k = lerp(0.74, 1.2, smooth(p));            // Babyspeck
    var lg = lerp(0.62, 1, smooth(p * 1.6));        // Gliedmaßen wachsen
    var hR = lerp(0.30, 0.205, smooth(p));          // Kopf wird relativ kleiner
    var hc = [-0.06, 0.30 + hR * 0.95, 0];
    var P = [];
    // Rumpf entlang der gekrümmten Wirbelsäule (Rücken auf +x)
    var sp = [[0.0, 0.30, 0], [0.12, 0.13, 0], [0.135, -0.06, 0], [0.05, -0.22, 0], [-0.05, -0.28, 0]];
    var sr = [0.115, 0.16, 0.175, 0.155, 0.11];
    for (var i = 0; i < sp.length - 1; i++) P.push(C(sp[i], sp[i + 1], sr[i] * k, sr[i + 1] * k, 0.07));
    P.push(S([-0.03, -0.05, 0], 0.15 * k, 0.1));                    // Bauch
    P.push(S([0.04, -0.2, 0.06 * k], 0.1 * k, 0.06), S([0.04, -0.2, -0.06 * k], 0.1 * k, 0.06)); // Po
    // Kopf
    P.push(Ell(hc, [hR, hR * 1.04, hR * 0.9], 0.09));
    P.push(S([hc[0] + hR * 0.22, hc[1] + hR * 0.12, 0], hR * 0.9, 0.1));            // Hinterkopf
    P.push(Ell([hc[0] - hR * 0.62, hc[1] - hR * 0.32, 0], [hR * 0.42, hR * 0.5, hR * 0.62], 0.12)); // Gesicht/Wangen
    P.push(S([hc[0] - hR * 0.72, hc[1] - hR * 0.66, 0], hR * 0.26, 0.08));          // Kinn
    P.push(Ell([hc[0] - hR * 1.0, hc[1] - hR * 0.12, 0], [hR * 0.14, hR * 0.15, hR * 0.13], 0.05)); // Nase
    P.push(Ell([hc[0] - hR * 0.86, hc[1] + hR * 0.24, 0], [hR * 0.12, hR * 0.1, hR * 0.6], 0.06));   // Brauenbogen
    P.push(Ell([hc[0] - hR * 0.92, hc[1] - hR * 0.42, 0], [hR * 0.1, hR * 0.07, hR * 0.2], 0.04));   // Lippen
    P.push(Ell([hc[0] - hR * 0.6, hc[1] + hR * 0.42, 0], [hR * 0.5, hR * 0.45, hR * 0.7], 0.12)); // Stirn
    P.push(Ell([hc[0] - hR * 1.0, hc[1] - hR * 0.48, 0], [hR * 0.05, hR * 0.02, hR * 0.15], 0.02, true)); // Mundlinie
    // geschlossene Augen als feine Lidfalte
    [1, -1].forEach(function (s) {
      P.push(Ell([hc[0] - hR * 0.9, hc[1] + hR * 0.08, s * hR * 0.36], [hR * 0.09, hR * 0.045, hR * 0.17], 0.03, true)); // Lidfalte
      P.push(Ell([hc[0] - hR * 0.8, hc[1] + hR * 0.09, s * hR * 0.36], [hR * 0.09, hR * 0.09, hR * 0.16], 0.05));        // Augenwölbung
      if (week >= 11) {
        P.push(Ell([hc[0] + hR * 0.08, hc[1] - hR * 0.04, s * hR * 0.9], [hR * 0.15, hR * 0.24, hR * 0.1], 0.03));       // Ohren
        P.push(Ell([hc[0] + hR * 0.06, hc[1] - hR * 0.02, s * hR * 0.99], [hR * 0.07, hR * 0.13, hR * 0.05], 0.02, true)); // Ohrmuschel
      }
    });
    // Arme: zum Gesicht gefaltet
    [1, -1].forEach(function (s) {
      var sh = [0.0, 0.22, s * 0.13 * k], el = [-0.16 * lg, 0.05, s * 0.17 * k], wr = [-0.22 * lg - 0.01, 0.16 + 0.11 * lg, s * 0.08];
      var ar = 0.05 * k;
      P.push(C(sh, el, ar * 1.1, ar * 0.9, 0.05));
      P.push(C(el, wr, ar * 0.9, ar * 0.7, 0.03));
      P.push(Ell([wr[0] - 0.01, wr[1] + 0.035, wr[2]], [ar * 0.85, ar * 1.25, ar * 0.6], 0.03));             // Hand
      if (s === 1 && week >= 14) P.push(C([wr[0], wr[1] + 0.03, wr[2] - 0.02], [wr[0] - 0.03, wr[1] + 0.08, wr[2] - 0.03], ar * 0.3, ar * 0.25, 0.02)); // Daumen
    });
    // Beine: angezogen
    [1, -1].forEach(function (s) {
      var hip = [0.02, -0.17, s * 0.1 * k], kn = [-0.25 * lg, 0.0 + 0.04 * lg, s * 0.14 * k], an = [-0.12 * lg, -0.27 * lg - 0.02, s * 0.085];
      var lr = 0.07 * k;
      P.push(C(hip, kn, lr * 1.2, lr * 0.85, 0.06));
      P.push(C(kn, an, lr * 0.85, lr * 0.6, 0.03));
      P.push(C(an, [an[0] - 0.09 * lg, an[1] - 0.005, an[2]], lr * 0.6, lr * 0.5, 0.03));                    // Fuß
    });
    // Ausschnitte (Lidfalten, Mund, Ohrmuschel) zuletzt anwenden, damit nichts sie wieder füllt
    var cuts = P.filter(function (q) { return q.cut; }), adds = P.filter(function (q) { return !q.cut; });
    return { parts: adds.concat(cuts), cord: [-0.15 * k, -0.07, 0], hR: hR };
  }

  function embryoParts(week) {
    var f = clamp((week - 4) / 4, 0, 1), L = lerp(0.32, 0.8, f), P = [];
    if (week <= 4) { P.push(Ell([0, 0, 0], [0.22, 0.08, 0.16], 0)); return { parts: P }; }
    var curve = new T.CatmullRomCurve3([[-0.05, 0.42], [0.22, 0.30], [0.30, 0.02], [0.18, -0.26], [-0.06, -0.36], [-0.20, -0.22]].map(function (q) { return new T.Vector3(q[0] * L, q[1] * L, 0); }));
    var headR = lerp(0.2, 0.26, f) * L, bodyR = lerp(0.13, 0.17, f) * L;
    var N = 10, pts = curve.getPoints(N);
    function rad(t) { return t < 0.18 ? headR * 0.95 : t < 0.6 ? lerp(headR * 0.85, bodyR, (t - 0.18) / 0.42) : lerp(bodyR, 0.012 * L, Math.pow((t - 0.6) / 0.4, 0.8)); }
    for (var i = 0; i < N; i++) P.push(C(pts[i].toArray(), pts[i + 1].toArray(), rad(i / N), rad((i + 1) / N), 0.04 * L));
    P.push(S([-0.08 * L, 0.4 * L, 0], headR * 1.25, 0.08 * L));
    P.push(S([-0.04 * L, 0.08 * L, 0], bodyR * 0.8, 0.05 * L));        // Herzwölbung
    if (week >= 6) {
      var bud = lerp(0.05, 0.11, clamp((week - 6) / 2, 0, 1)) * L;
      [1, -1].forEach(function (s) {
        P.push(Ell([-0.1 * L, 0.12 * L, s * 0.14 * L], [bud * 1.5, bud * 0.7, bud * 0.8], 0.03 * L));
        P.push(Ell([-0.04 * L, -0.2 * L, s * 0.13 * L], [bud * 1.4, bud * 0.7, bud * 0.8], 0.03 * L));
      });
    }
    return { parts: P, L: L, eyes: week >= 6 };
  }

  /* ---------- Materialien ---------- */
  function skinMaterial(p) {
    var c = new T.Color(0xcf4f56).lerp(new T.Color(0xe08a76), smooth((p - 0.08) / 0.6));
    var m = new T.MeshPhysicalMaterial({
      color: c, vertexColors: true, roughness: 0.5, metalness: 0, clearcoat: 0.22, clearcoatRoughness: 0.55,
      sheen: 0.8, sheenColor: new T.Color(0xffb8a6), sheenRoughness: 0.5,
      emissive: new T.Color(0x2c0808), transparent: p < 0.1, opacity: p < 0.1 ? 0.93 : 1
    });
    // weiches, rötliches Durchscheinen an den Rändern (wirkt wie Haut)
    m.onBeforeCompile = function (sh) {
      sh.fragmentShader = sh.fragmentShader.replace("#include <output_fragment>",
        "float sssF = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 2.2);\n" +
        "outgoingLight += vec3(1.0, 0.42, 0.36) * sssF * 0.28;\n#include <output_fragment>");
    };
    return m;
  }
  function bubbleMaterial(back) {
    return new T.ShaderMaterial({
      transparent: true, depthWrite: false, side: back ? T.BackSide : T.FrontSide,
      uniforms: { uTime: { value: 0 }, uColor: { value: new T.Color(back ? 0xff9e94 : 0xffe4dc) }, uBack: { value: back ? 1 : 0 }, uAmp: { value: 1 } },
      vertexShader: [
        "uniform float uTime; uniform float uAmp; varying vec3 vN; varying vec3 vV; varying vec3 vP;",
        "void main(){",
        "  vec3 p = position; vec3 n = normalize(position);",
        "  float d = 0.012*sin(2.6*n.x+1.7*n.y+uTime*0.75) + 0.008*sin(3.1*n.z-2.2*n.x+uTime*1.05) + 0.006*sin(4.3*n.y+1.3*n.z-uTime*0.6);",
        "  p *= 1.0 + d*uAmp + sin(uTime*0.55)*0.01*uAmp;",
        "  vec4 mv = modelViewMatrix * vec4(p,1.0); vV = -mv.xyz; vN = normalize(normalMatrix*n); vP = n;",
        "  gl_Position = projectionMatrix * mv; }"
      ].join("\n"),
      fragmentShader: [
        "uniform vec3 uColor; uniform float uBack; varying vec3 vN; varying vec3 vV; varying vec3 vP;",
        "void main(){",
        "  vec3 n = normalize(vN); if (uBack > 0.5) n = -n;",
        "  float f = pow(1.0 - abs(dot(n, normalize(vV))), 2.6);",
        "  float a = uBack > 0.5 ? 0.10 + 0.25*f : 0.02 + 0.55*f;",
        "  float hi = uBack > 0.5 ? 0.0 : pow(max(dot(reflect(-normalize(vV), n), normalize(vec3(-0.5,0.8,0.6))),0.0), 40.0)*0.6;",
        "  vec3 col = uColor * (0.85 + 0.3*vP.y) + hi;",
        "  gl_FragColor = vec4(col, clamp(a + hi, 0.0, 1.0)); }"
      ].join("\n")
    });
  }
  function glowTexture() {
    var c = document.createElement("canvas"); c.width = c.height = 128;
    var g = c.getContext("2d"), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,214,200,0.9)"); gr.addColorStop(0.45, "rgba(255,160,150,0.35)"); gr.addColorStop(1, "rgba(255,140,140,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t;
  }

  /* ---------- Szene ---------- */
  function Baby3D(container) {
    this.el = container; this.week = 12; this.running = false;
    this.rotY = 0.55; this.rotX = 0.05; this.velY = 0; this.dragging = false;
    this.t0 = performance.now(); this.cache = {};
    this._init();
  }

  Baby3D.prototype._init = function () {
    var w = this.el.clientWidth || 320, h = this.el.clientHeight || w;
    var r = this.renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    r.setPixelRatio(Math.min(root.devicePixelRatio || 1, 2));
    r.setSize(w, h, false);
    r.outputEncoding = T.sRGBEncoding; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 0.95;
    r.domElement.style.width = "100%"; r.domElement.style.height = "100%"; r.domElement.style.display = "block";
    r.domElement.setAttribute("aria-hidden", "true");
    this.el.appendChild(r.domElement);

    var s = this.scene = new T.Scene();
    var cam = this.camera = new T.PerspectiveCamera(30, w / h, 0.1, 50);
    cam.position.set(0, 0.02, 5.6);

    s.add(new T.HemisphereLight(0xffeee6, 0x6e3550, 0.62));
    var key = new T.DirectionalLight(0xffe3d4, 1.0); key.position.set(-2.4, 2.8, 3.2); s.add(key);
    var rim = new T.DirectionalLight(0xffb3c2, 1.6); rim.position.set(2.6, 1.0, -3.0); s.add(rim);
    var rim2 = new T.DirectionalLight(0xc9b8ff, 0.6); rim2.position.set(-2.8, -0.6, -2.4); s.add(rim2);
    var fill = new T.PointLight(0xff8f7a, 0.45, 9); fill.position.set(0.5, -1.6, 2); s.add(fill);

    this.world = new T.Group(); s.add(this.world);
    // Leuchten hinter dem Baby
    this.glow = new T.Sprite(new T.SpriteMaterial({ map: glowTexture(), transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.55 }));
    this.glow.scale.set(2.6, 2.6, 1); this.glow.position.set(0, 0, -0.6); s.add(this.glow);
    // Fruchtblase (wabert im Shader)
    var bg = new T.SphereGeometry(1.3, 96, 72);
    this.bubbleBack = new T.Mesh(bg, bubbleMaterial(true)); this.bubbleFront = new T.Mesh(bg, bubbleMaterial(false));
    this.bubbleBack.renderOrder = 0; this.bubbleFront.renderOrder = 3;
    this.world.add(this.bubbleBack); this.world.add(this.bubbleFront);
    // Schwebeteilchen
    var pts = new T.BufferGeometry(), n = 90, arr = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var u = Math.random(), v = Math.random(), rr = 1.2 * Math.cbrt(Math.random()), th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1);
      arr[i * 3] = rr * Math.sin(ph) * Math.cos(th); arr[i * 3 + 1] = rr * Math.cos(ph); arr[i * 3 + 2] = rr * Math.sin(ph) * Math.sin(th);
    }
    pts.setAttribute("position", new T.BufferAttribute(arr, 3));
    this.dust = new T.Points(pts, new T.PointsMaterial({ color: 0xfff1ea, size: 0.016, transparent: true, opacity: 0.6, depthWrite: false }));
    this.world.add(this.dust);

    this.babyPivot = new T.Group(); this.world.add(this.babyPivot);
    this._bindInput();
    var self = this;
    if (root.ResizeObserver) { this.ro = new ResizeObserver(function () { self.resize(); }); this.ro.observe(this.el); }
    this.reduceMotion = root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (this.reduceMotion) { this.bubbleBack.material.uniforms.uAmp.value = 0; this.bubbleFront.material.uniforms.uAmp.value = 0; }
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

  function disposeTree(o) {
    o.traverse(function (n) {
      if (n.userData && n.userData.cached) return;
      if (n.geometry) n.geometry.dispose();
      if (n.material) (Array.isArray(n.material) ? n.material : [n.material]).forEach(function (m) { m.dispose(); });
    });
  }

  Baby3D.prototype._build = function (week) {
    var g = new T.Group(), RES = 72;
    if (week <= 8) {
      var em = embryoParts(week), mat = skinMaterial((week - 4) / 36);
      var key = "e" + week, geo = this.cache[key] || (this.cache[key] = mesh(em.parts, RES));
      var body = new T.Mesh(geo, mat); body.userData.cached = true; g.add(body);
      if (em.eyes) {
        var eyeMat = new T.MeshStandardMaterial({ color: 0x2a1622, roughness: 0.5 });
        [1, -1].forEach(function (s) { var e = new T.Mesh(new T.SphereGeometry(0.03 * em.L * (week >= 7 ? 1.3 : 1), 16, 12), eyeMat); e.position.set(-0.3 * em.L, 0.44 * em.L, s * 0.12 * em.L); g.add(e); });
      }
      // Dottersack mit Stiel
      var yolkMat = new T.MeshPhysicalMaterial({ color: 0xffcf6a, roughness: 0.3, clearcoat: 0.7, sheen: 0.5, sheenColor: new T.Color(0xfff2c0), transparent: true, opacity: 0.92 });
      var yp = new T.Vector3(-0.55, -0.35, 0.2);
      var yolk = new T.Mesh(new T.SphereGeometry(lerp(0.12, 0.09, clamp((week - 4) / 4, 0, 1)), 40, 30), yolkMat); yolk.position.copy(yp); g.add(yolk);
      g.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(-0.1, -0.05, 0), new T.Vector3(-0.3, -0.25, 0.1), yp]), 24, 0.016, 10, false), yolkMat));
    } else {
      var fe = fetusParts(week), mat2 = skinMaterial(0.15 + clamp((week - 9) / 31, 0, 1) * 0.85);
      var key2 = "f" + week, geo2 = this.cache[key2] || (this.cache[key2] = mesh(fe.parts, RES));
      var b2 = new T.Mesh(geo2, mat2); b2.userData.cached = true; g.add(b2);
      g.userData.cordStart = new T.Vector3(fe.cord[0], fe.cord[1], fe.cord[2]);
    }
    return g;
  };

  Baby3D.prototype.setWeek = function (week) {
    week = clamp(Math.round(week || 12), 4, 42);
    this.week = week;
    var old = this.baby;
    if (old) { this.babyPivot.remove(old); disposeTree(old); }
    var b = this._build(week);
    var box = new T.Box3().setFromObject(b), size = new T.Vector3(), center = new T.Vector3();
    box.getSize(size); box.getCenter(center);
    var maxDim = Math.max(size.x, size.y, size.z);
    var target = week <= 8 ? lerp(0.55, 1.25, clamp((week - 4) / 4, 0, 1)) : lerp(1.4, 2.08, smooth((week - 9) / 31));
    var sc = target / maxDim;
    b.position.sub(center);
    var holder = new T.Group(), inner = new T.Group();
    inner.add(b); inner.scale.setScalar(sc); inner.userData.s = sc; holder.add(inner);
    if (b.userData.cordStart) {
      // Nabelschnur: zwei leicht verdrillte Stränge bis zur Plazenta an der Blasenwand
      var st = b.userData.cordStart.clone().sub(center).multiplyScalar(sc);
      var end = new T.Vector3(-0.55, -0.95, 0.45).normalize().multiplyScalar(1.2);
      var path = [];
      for (var i = 0; i <= 10; i++) {
        var t = i / 10, wob = Math.sin(t * Math.PI) * 0.1;
        path.push(new T.Vector3(lerp(st.x, end.x, t) + Math.sin(t * 8) * wob, lerp(st.y, end.y, t) + Math.cos(t * 6) * wob, lerp(st.z, end.z, t) + Math.sin(t * 5 + 1) * wob));
      }
      var curve = new T.CatmullRomCurve3(path);
      var cordMat = new T.MeshPhysicalMaterial({ color: 0xf1c7cc, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.3, sheen: 0.6, sheenColor: new T.Color(0xffffff), emissive: new T.Color(0x2a0a10) });
      var rC = 0.03 * clamp(sc / 2.2, 0.75, 1.15);
      holder.add(new T.Mesh(new T.TubeGeometry(curve, 160, rC, 14, false), cordMat));
      // feine Gefäßspirale
      var helix = [], frames = curve.computeFrenetFrames(160, false);
      for (var j = 0; j <= 160; j++) {
        var u = j / 160, pnt = curve.getPointAt(u), ang = u * 26;
        helix.push(pnt.clone().addScaledVector(frames.normals[j], Math.cos(ang) * rC * 0.75).addScaledVector(frames.binormals[j], Math.sin(ang) * rC * 0.75));
      }
      holder.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(helix), 320, rC * 0.38, 8, false), new T.MeshPhysicalMaterial({ color: 0xc9506a, roughness: 0.4, clearcoat: 0.5 })));
      var plac = new T.Mesh(new T.SphereGeometry(0.2, 40, 20), new T.MeshPhysicalMaterial({ color: 0xb8405c, roughness: 0.55, sheen: 0.6, sheenColor: new T.Color(0xff9aa8), transparent: true, opacity: 0.85 }));
      plac.position.copy(end); plac.scale.set(1, 1, 0.28); plac.lookAt(0, 0, 0); holder.add(plac);
    }
    this.baby = holder; this.breathe = inner;
    this.babyPivot.add(holder);
    this.popT = performance.now();
    if (!this.running) this.render();
  };

  Baby3D.prototype.render = function () {
    var now = performance.now(), t = (now - this.t0) / 1000;
    if (!this.dragging) { this.velY *= 0.94; this.rotY += this.velY + (this.reduceMotion ? 0 : 0.0026); }
    this.world.rotation.y = this.rotY; this.world.rotation.x = this.rotX;
    this.bubbleBack.material.uniforms.uTime.value = t; this.bubbleFront.material.uniforms.uTime.value = t;
    if (!this.reduceMotion) {
      this.babyPivot.position.y = Math.sin(t * 0.9) * 0.025;
      this.babyPivot.rotation.z = Math.sin(t * 0.6) * 0.04;
      if (this.breathe) this.breathe.scale.setScalar(this.breathe.userData.s * (1 + Math.sin(t * 1.6) * 0.006));
      this.dust.rotation.y = t * 0.03;
      this.glow.material.opacity = 0.5 + Math.sin(t * 0.8) * 0.06;
    }
    if (this.popT) {
      var a = clamp((now - this.popT) / 450, 0, 1), e = 1 - Math.pow(1 - a, 3);
      this.babyPivot.scale.setScalar(0.85 + 0.15 * e);
      if (a >= 1) this.popT = 0;
    }
    this.renderer.render(this.scene, this.camera);
  };

  Baby3D.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    var self = this;
    (function loop() { if (!self.running) return; self.render(); self.raf = requestAnimationFrame(loop); })();
  };
  Baby3D.prototype.stop = function () { this.running = false; if (this.raf) cancelAnimationFrame(this.raf); };

  Baby3D.supported = function () {
    if (!T) return false;
    try { var c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
  };
  Baby3D._mesh = mesh; Baby3D._fetusParts = fetusParts; Baby3D._embryoParts = embryoParts;
  root.Baby3D = Baby3D;
})(this);
