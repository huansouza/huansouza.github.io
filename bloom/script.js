// ------------------------------------------------------------------
// Intro animation (~4.8 s):
//   1. machines: circuit traces and chips wire themselves across a dark screen
//   2. life: vines sprout from the circuitry, flowers bloom, the machines corrode
//      and the light floods in
//   3. the scene opens up into the website
// Click or press any key to skip. You shouldn't need to edit this file.
// ------------------------------------------------------------------
(function () {
  var root = document.documentElement;
  document.getElementById('year').textContent = new Date().getFullYear();
  if (!root.classList.contains('intro')) return;

  var cv = document.querySelector('.genesis');
  var ctx = cv.getContext('2d');
  var rise = Array.prototype.slice.call(document.querySelectorAll('[data-rise]'));

  var W = window.innerWidth, H = window.innerHeight;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  var R = Math.random;
  var DIAG = Math.hypot(W, H);
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp(x); return x * x * (3 - 2 * x); }
  function easeOutBack(x) { x = clamp(x); var c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function rgb(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a == null ? 1 : a) + ')'; }

  // Palette
  var DARK = [26, 28, 27], PAPER = [244, 242, 236];
  var TRACE = [84, 94, 91], PULSE = [214, 235, 228];
  var STEM = [124, 150, 114], LEAF = [148, 172, 136];
  var PETALS = [[214, 167, 156], [236, 224, 205], [185, 177, 204], [230, 213, 158], [226, 190, 178]];
  var POLLEN = [202, 167, 94];

  // --- 1. Machines: circuit traces + chips -------------------------
  var G = Math.max(16, Math.round(Math.min(W, H) / 30));
  var DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  var traces = [];
  var nTraces = Math.min(150, Math.round(W * H / 7000));
  for (var i = 0; i < nTraces; i++) {
    var x = Math.round(R() * W / G) * G, y = Math.round(R() * H / G) * G;
    var d = (R() * 4 | 0) * 2, pts = [[x, y]], len = 0, segs = 2 + (R() * 4 | 0);
    for (var s = 0; s < segs; s++) {
      var n = 2 + (R() * 6 | 0);
      x += DIRS[d][0] * G * n; y += DIRS[d][1] * G * n;
      pts.push([x, y]);
      len += G * n * (d % 2 ? Math.SQRT2 : 1);
      d = (d + (R() < .5 ? 1 : -1) * (R() < .65 ? 1 : 2) + 8) % 8;
    }
    traces.push({ pts: pts, len: len, delay: R() * 700, dur: 450 + R() * 500, pulse: R() < .35, phase: R() });
  }

  var chips = [];
  var nChips = Math.max(3, Math.round(W * H / 110000));
  for (i = 0; i < nChips; i++) {
    var cw = G * (2 + (R() * 3 | 0)), ch = G * (2 + (R() * 3 | 0));
    chips.push({
      x: Math.round(R() * (W - cw) / G) * G, y: Math.round(R() * (H - ch) / G) * G,
      w: cw, h: ch, delay: 200 + R() * 600, id: 'UNIT-' + (10 + (R() * 89 | 0))
    });
  }

  function pointAt(pts, dist) {
    for (var k = 1; k < pts.length; k++) {
      var a = pts[k - 1], b = pts[k];
      var sl = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (dist <= sl) { var f = dist / sl; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; }
      dist -= sl;
    }
    return pts[pts.length - 1];
  }

  function drawTrace(t, a) {
    var p = clamp((a.now - t.delay) / t.dur);
    if (p <= 0) return;
    var target = t.len * p;
    ctx.beginPath();
    ctx.moveTo(t.pts[0][0], t.pts[0][1]);
    for (var k = 1; k < t.pts.length && target > 0; k++) {
      var A = t.pts[k - 1], B = t.pts[k];
      var sl = Math.hypot(B[0] - A[0], B[1] - A[1]);
      var f = Math.min(1, target / sl);
      ctx.lineTo(A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f);
      target -= sl;
    }
    ctx.stroke();
    // solder pads at both ends
    ctx.beginPath(); ctx.arc(t.pts[0][0], t.pts[0][1], 2.6, 0, 7); ctx.stroke();
    if (p >= 1) {
      var e = t.pts[t.pts.length - 1];
      ctx.beginPath(); ctx.arc(e[0], e[1], 3.4, 0, 7); ctx.stroke();
    }
  }

  function drawChip(c, now, alpha) {
    var p = ease((now - c.delay) / 400);
    if (p <= 0) return;
    ctx.globalAlpha = p * alpha;
    ctx.fillStyle = rgb([34, 37, 36]);
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeRect(c.x + .5, c.y + .5, c.w, c.h);
    ctx.beginPath();
    for (var px = c.x + 6; px < c.x + c.w - 3; px += 7) {
      ctx.moveTo(px, c.y); ctx.lineTo(px, c.y - 5);
      ctx.moveTo(px, c.y + c.h); ctx.lineTo(px, c.y + c.h + 5);
    }
    ctx.stroke();
    ctx.fillStyle = rgb(TRACE);
    ctx.font = '9px ui-monospace, Menlo, monospace';
    ctx.fillText(c.id, c.x + 6, c.y + 14);
    ctx.globalAlpha = 1;
  }

  // --- 2. Life: vines, leaves and flowers --------------------------
  var seeds = [];
  traces.forEach(function (t) { seeds.push(t.pts[t.pts.length - 1]); });
  chips.forEach(function (c) { seeds.push([c.x, c.y + c.h], [c.x + c.w, c.y]); });
  seeds = seeds.filter(function (p) { return p[0] > 0 && p[0] < W && p[1] > 0 && p[1] < H; });

  var vines = [];
  var nVines = Math.min(64, Math.max(22, Math.round(W * H / 16000)));
  for (i = 0; i < nVines && seeds.length; i++) {
    var sd = seeds.splice(R() * seeds.length | 0, 1)[0];
    var ang = -Math.PI / 2 + (R() - .5) * 2.6, curl = (R() - .5) * .09;
    var vx = sd[0], vy = sd[1], vp = [[vx, vy]], leaves = [];
    var steps = 26 + (R() * 46 | 0);
    for (s = 0; s < steps; s++) {
      ang += curl + (R() - .5) * .35;
      vx += Math.cos(ang) * 4; vy += Math.sin(ang) * 4;
      vp.push([vx, vy]);
      if (s % 7 === 4) leaves.push({ i: s, side: (s / 7 | 0) % 2 ? 1 : -1, size: 5 + R() * 5, ang: ang });
    }
    var big = R() < .3;
    vines.push({
      pts: vp, leaves: leaves, start: 1000 + R() * 900, dur: 900 + R() * 500,
      flower: { r: big ? 20 + R() * 14 : 9 + R() * 7, n: 5 + (R() * 3 | 0), rot: R() * 6.3, col: PETALS[R() * PETALS.length | 0] }
    });
  }

  function drawVine(v, now) {
    var p = ease((now - v.start) / v.dur);
    if (p <= 0) return;
    var upto = Math.max(1, Math.floor(p * (v.pts.length - 1)));
    ctx.strokeStyle = rgb(STEM);
    ctx.lineCap = 'round';
    for (var k = 1; k <= upto; k++) {
      ctx.lineWidth = 2.2 - 1.4 * (k / v.pts.length);
      ctx.beginPath();
      ctx.moveTo(v.pts[k - 1][0], v.pts[k - 1][1]);
      ctx.lineTo(v.pts[k][0], v.pts[k][1]);
      ctx.stroke();
    }
    ctx.fillStyle = rgb(LEAF, .92);
    v.leaves.forEach(function (l) {
      if (l.i > upto) return;
      var g = ease((upto - l.i) / 10), pt = v.pts[l.i], a = l.ang + l.side * 1.0, sz = l.size * g;
      ctx.beginPath();
      ctx.ellipse(pt[0] + Math.cos(a) * sz, pt[1] + Math.sin(a) * sz, sz, sz * .42, a, 0, 7);
      ctx.fill();
    });
    // flower opens as the vine finishes growing
    var b = easeOutBack((now - v.start - v.dur * .8) / 650);
    if (b > 0) {
      var f = v.flower, tip = v.pts[upto], r = f.r * b;
      ctx.fillStyle = rgb(f.col, .95);
      for (var q = 0; q < f.n; q++) {
        var pa = f.rot + q * Math.PI * 2 / f.n + b * .4;
        ctx.beginPath();
        ctx.ellipse(tip[0] + Math.cos(pa) * r * .55, tip[1] + Math.sin(pa) * r * .55, r * .58, r * .32, pa, 0, 7);
        ctx.fill();
      }
      ctx.fillStyle = rgb(POLLEN);
      ctx.beginPath(); ctx.arc(tip[0], tip[1], Math.max(1.5, r * .2), 0, 7); ctx.fill();
    }
  }

  // --- Render loop --------------------------------------------------
  var start = performance.now(), finished = false, opened = false;
  var OPEN_AT = 3700, END_AT = 4900;

  function frame(now) {
    if (finished) return;
    var t = now - start;

    // background: dark machine world…
    var light = ease((t - 2600) / 800);
    ctx.fillStyle = rgb(mix(DARK, PAPER, light));
    ctx.fillRect(0, 0, W, H);

    // …pierced by light spreading out from every flower that blooms
    vines.forEach(function (v) {
      var g = clamp((t - v.start - v.dur * .8) / 1500);
      if (g <= 0) return;
      var tip = v.pts[v.pts.length - 1], r = 4 + g * g * DIAG * .6;
      var glow = ctx.createRadialGradient(tip[0], tip[1], 0, tip[0], tip[1], r);
      glow.addColorStop(0, rgb(PAPER));
      glow.addColorStop(.7, rgb(PAPER, .95));
      glow.addColorStop(1, rgb(PAPER, 0));
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(tip[0], tip[1], r, 0, 7); ctx.fill();
    });

    // machines, corroding away as life takes over
    var machine = 1 - ease((t - 2200) / 1300);
    if (machine > 0) {
      var a = { now: t };
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = rgb(TRACE, machine);
      traces.forEach(function (tr) { drawTrace(tr, a); });
      ctx.strokeStyle = rgb(TRACE);
      chips.forEach(function (c) { drawChip(c, t, 1 - ease((t - 1800) / 600)); });

      // data pulses racing along the wires (machine phase only)
      var pulseA = clamp((t - 400) / 300) * (1 - ease((t - 1500) / 500));
      if (pulseA > 0) {
        ctx.fillStyle = rgb(PULSE, pulseA);
        traces.forEach(function (tr) {
          if (!tr.pulse || t < tr.delay + tr.dur) return;
          var pt = pointAt(tr.pts, ((t / 900 + tr.phase) % 1) * tr.len);
          ctx.beginPath(); ctx.arc(pt[0], pt[1], 1.8, 0, 7); ctx.fill();
        });
      }
    }

    vines.forEach(function (v) { drawVine(v, t); });

    // open into the website
    if (!opened && t >= OPEN_AT - 300) {
      opened = true;
      rise.forEach(function (el, k) { setTimeout(function () { el.classList.add('on'); }, 250 + k * 90); });
      setTimeout(function () { cv.classList.add('open'); }, 300);
    }
    if (t >= END_AT) { finish(); return; }
    requestAnimationFrame(frame);
  }

  function finish() {
    if (finished) return;
    finished = true;
    rise.forEach(function (el) { el.classList.add('on'); });
    root.classList.remove('intro');
    cv.remove();
    document.removeEventListener('keydown', finish);
  }
  cv.addEventListener('click', finish);
  document.addEventListener('keydown', finish);

  requestAnimationFrame(frame);
})();
