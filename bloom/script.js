// ------------------------------------------------------------------
// Intro animation (~5 s):
//   1. machines: a dark circuit world ruled by a central machine eye
//   2. earthquake: the ground trembles, a fissure tears through the middle
//      and the machine world splits in two
//   3. life: vines and flowers burst from the crack while the broken halves
//      fall away, revealing the calm website underneath
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

  // the machine world is drawn on its own layer so it can be broken apart
  var mcv = document.createElement('canvas');
  mcv.width = W * dpr; mcv.height = H * dpr;
  var m = mcv.getContext('2d');
  m.setTransform(dpr, 0, 0, dpr, 0, 0);

  var R = Math.random;
  var DIAG = Math.hypot(W, H), CX = W / 2, CY = H / 2;
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp(x); return x * x * (3 - 2 * x); }
  function easeIn(x) { x = clamp(x); return x * x * x; }
  function easeOut(x) { x = clamp(x); return 1 - Math.pow(1 - x, 3); }
  function easeOutBack(x) { x = clamp(x); var c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }
  function rgb(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a == null ? 1 : a) + ')'; }

  // Palette
  var VOID = [14, 16, 15], GRID = [28, 32, 31], TRACE = [74, 82, 79], STEEL = [120, 128, 124];
  var ALARM = [214, 58, 34], HOT = [255, 196, 150], PAPER = [244, 242, 236];
  var STEM = [124, 150, 114], LEAF = [148, 172, 136], POLLEN = [202, 167, 94];
  var PETALS = [[214, 167, 156], [236, 224, 205], [185, 177, 204], [230, 213, 158], [226, 190, 178]];
  var MONO = 'ui-monospace, "SF Mono", Menlo, monospace';

  // Timeline (ms)
  var T = { rumble: 1200, alarm: 1700, crack: 2000, split: 2250, fall: 3100, open: 4000, end: 5000 };

  // --- The machine world --------------------------------------------
  var G = Math.max(14, Math.round(Math.min(W, H) / 34));
  var DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  var traces = [];
  var nTraces = Math.min(230, Math.round(W * H / 4800));
  for (var i = 0; i < nTraces; i++) {
    var x = Math.round(R() * W / G) * G, y = Math.round(R() * H / G) * G;
    var d = (R() * 4 | 0) * 2, pts = [[x, y]], len = 0, segs = 2 + (R() * 4 | 0);
    for (var s = 0; s < segs; s++) {
      var n = 2 + (R() * 7 | 0);
      x += DIRS[d][0] * G * n; y += DIRS[d][1] * G * n;
      pts.push([x, y]);
      len += G * n * (d % 2 ? Math.SQRT2 : 1);
      d = (d + (R() < .5 ? 1 : -1) * (R() < .65 ? 1 : 2) + 8) % 8;
    }
    traces.push({ pts: pts, len: len, delay: R() * 600, dur: 250 + R() * 350, bus: R() < .18,
                  pulse: R() < .4, phase: R(), red: R() < .35, w: R() < .15 ? 2.2 : 1.1 });
  }

  var chips = [];
  var nChips = Math.max(4, Math.round(W * H / 70000));
  for (i = 0; i < nChips; i++) {
    var cw = G * (2 + (R() * 3 | 0)), ch = G * (2 + (R() * 2 | 0));
    chips.push({ x: Math.round(R() * (W - cw) / G) * G, y: Math.round(R() * (H - ch) / G) * G,
                 w: cw, h: ch, delay: 150 + R() * 500, id: 'UNIT-' + (100 + (R() * 899 | 0)), blink: R() * 1000 });
  }

  function pointAt(pts, dist) {
    for (var k = 1; k < pts.length; k++) {
      var a = pts[k - 1], b = pts[k], sl = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (dist <= sl) { var f = dist / sl; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; }
      dist -= sl;
    }
    return pts[pts.length - 1];
  }

  function tracePath(tr, target, off) {
    m.moveTo(tr.pts[0][0] + off, tr.pts[0][1] + off);
    for (var k = 1; k < tr.pts.length && target > 0; k++) {
      var A = tr.pts[k - 1], B = tr.pts[k], sl = Math.hypot(B[0] - A[0], B[1] - A[1]);
      var f = Math.min(1, target / sl);
      m.lineTo(A[0] + (B[0] - A[0]) * f + off, A[1] + (B[1] - A[1]) * f + off);
      target -= sl;
    }
  }

  var vignette = m.createRadialGradient(CX, CY, Math.min(W, H) * .25, CX, CY, DIAG * .6);
  vignette.addColorStop(0, 'rgba(120,20,10,0)');
  vignette.addColorStop(1, 'rgba(120,20,10,.28)');

  var R0 = Math.min(W, H) * .15;       // size of the machine eye

  function drawMachine(t) {
    m.fillStyle = rgb(VOID);
    m.fillRect(0, 0, W, H);

    // grid
    m.strokeStyle = rgb(GRID);
    m.lineWidth = 1;
    m.beginPath();
    for (var gx = 0; gx < W; gx += G) { m.moveTo(gx + .5, 0); m.lineTo(gx + .5, H); }
    for (var gy = 0; gy < H; gy += G) { m.moveTo(0, gy + .5); m.lineTo(W, gy + .5); }
    m.stroke();

    // spokes radiating from the eye
    var ap = ease(t / 600);
    m.strokeStyle = rgb(ALARM, .12 * ap);
    m.beginPath();
    for (var k = 0; k < 28; k++) {
      var a = k * Math.PI * 2 / 28 + t * .00015;
      m.moveTo(CX + Math.cos(a) * R0 * 1.4, CY + Math.sin(a) * R0 * 1.4);
      m.lineTo(CX + Math.cos(a) * DIAG, CY + Math.sin(a) * DIAG);
    }
    m.stroke();

    // circuit traces
    traces.forEach(function (tr) {
      var p = clamp((t - tr.delay) / tr.dur);
      if (p <= 0) return;
      m.strokeStyle = rgb(TRACE);
      m.lineWidth = tr.w;
      m.beginPath();
      tracePath(tr, tr.len * p, 0);
      if (tr.bus) { tracePath(tr, tr.len * p, 5); tracePath(tr, tr.len * p, 10); }
      m.stroke();
      m.beginPath(); m.arc(tr.pts[0][0], tr.pts[0][1], 2.6, 0, 7); m.stroke();
      if (p >= 1) { var e = tr.pts[tr.pts.length - 1]; m.fillStyle = rgb(STEEL); m.fillRect(e[0] - 3, e[1] - 3, 6, 6); }
    });

    // data pulses
    var pulseA = clamp((t - 300) / 300);
    traces.forEach(function (tr) {
      if (!tr.pulse || t < tr.delay + tr.dur) return;
      var pt = pointAt(tr.pts, ((t / 650 + tr.phase) % 1) * tr.len);
      m.fillStyle = tr.red ? rgb(ALARM, pulseA) : rgb([220, 232, 228], pulseA * .9);
      m.fillRect(pt[0] - 2, pt[1] - 2, 4, 4);
    });

    // chips with blinking warning lights
    m.font = '9px ' + MONO;
    chips.forEach(function (c) {
      var p = ease((t - c.delay) / 300);
      if (p <= 0) return;
      m.globalAlpha = p;
      m.fillStyle = rgb([22, 25, 24]);
      m.fillRect(c.x, c.y, c.w, c.h);
      m.strokeStyle = rgb(STEEL);
      m.lineWidth = 1;
      m.strokeRect(c.x + .5, c.y + .5, c.w, c.h);
      m.beginPath();
      for (var px = c.x + 5; px < c.x + c.w - 2; px += 6) {
        m.moveTo(px, c.y); m.lineTo(px, c.y - 5);
        m.moveTo(px, c.y + c.h); m.lineTo(px, c.y + c.h + 5);
      }
      m.stroke();
      m.fillStyle = rgb(STEEL);
      m.fillText(c.id, c.x + 6, c.y + 14);
      var on = ((t + c.blink) % (t > T.alarm ? 240 : 900)) < (t > T.alarm ? 120 : 450);
      m.fillStyle = on ? rgb(ALARM) : rgb([60, 30, 26]);
      m.fillRect(c.x + c.w - 10, c.y + 6, 4, 4);
      m.globalAlpha = 1;
    });

    // the machine eye
    m.save();
    m.globalAlpha = ap;
    m.translate(CX, CY);
    m.fillStyle = rgb(VOID, .85);
    m.beginPath(); m.arc(0, 0, R0 * 1.3, 0, 7); m.fill();
    m.strokeStyle = rgb(STEEL);
    m.lineWidth = 1.5;
    m.save(); m.rotate(t * .0012); m.setLineDash([3, 7]);
    m.beginPath(); m.arc(0, 0, R0 * 1.25, 0, 7); m.stroke(); m.restore();
    m.save(); m.rotate(-t * .0026);
    m.beginPath();
    for (k = 0; k < 72; k++) {
      var ta = k * Math.PI * 2 / 72, r1 = R0 * .98, r2 = R0 * (k % 6 ? 1.04 : 1.12);
      m.moveTo(Math.cos(ta) * r1, Math.sin(ta) * r1); m.lineTo(Math.cos(ta) * r2, Math.sin(ta) * r2);
    }
    m.stroke(); m.restore();
    m.lineWidth = 1;
    m.beginPath(); m.arc(0, 0, R0 * .78, 0, 7); m.stroke();
    m.strokeStyle = rgb(ALARM, .7);
    m.beginPath(); m.arc(0, 0, R0 * .55, 0, 7); m.stroke();
    // the pupil flickers out once the crack runs through it
    var alive = t < T.split ? 1 : (R() < .5 ? .6 : .1) * (1 - ease((t - T.split) / 500));
    var pul = (.85 + .15 * Math.sin(t * (t > T.alarm ? .03 : .012))) * alive;
    var eye = m.createRadialGradient(0, 0, 0, 0, 0, R0 * .5);
    eye.addColorStop(0, rgb([255, 120, 90], pul));
    eye.addColorStop(.35, rgb(ALARM, pul));
    eye.addColorStop(1, rgb(ALARM, 0));
    m.fillStyle = eye;
    m.beginPath(); m.arc(0, 0, R0 * .5, 0, 7); m.fill();
    m.fillStyle = rgb(VOID);
    m.beginPath(); m.ellipse(0, 0, R0 * .05, R0 * .22, 0, 0, 7); m.fill();
    m.restore();

    // red scan line
    if (t < T.split) {
      var sy = (t * .9) % H;
      m.fillStyle = rgb(ALARM, .45);
      m.fillRect(0, sy, W, 1);
      m.fillStyle = rgb(ALARM, .06);
      m.fillRect(0, sy - 40, W, 40);
    }

    m.fillStyle = vignette;
    m.fillRect(0, 0, W, H);

    // HUD readouts
    var blink = (t % 260) < 150;
    m.font = '11px ' + MONO;
    m.textAlign = 'left';
    m.fillStyle = rgb(STEEL);
    m.fillText('NEURAL GRID // SECTOR 0', 24, 34);
    m.fillText('NODES ONLINE ' + Math.floor(ease(t / 1400) * 48213).toLocaleString('en-US'), 24, 52);
    if (t > T.alarm) { if (blink) { m.fillStyle = rgb(ALARM); m.fillText('ORGANIC LIFE ▲ DETECTED', 24, 70); } }
    else m.fillText('ORGANIC LIFE 0.000%', 24, 70);
    m.textAlign = 'right';
    m.fillStyle = rgb(STEEL);
    m.fillText('HUMAN OVERRIDE: DISABLED', W - 24, H - 40);
    m.fillText('YEAR 0' + (41 + (t / 90 | 0) % 9) + ' OF THE GRID', W - 24, H - 22);
    m.textAlign = 'center';
    m.fillStyle = rgb(ALARM);
    if (t < T.rumble) m.fillText('CONTROL: ABSOLUTE', CX, CY + R0 * 1.3 + 26);
    else if (blink) m.fillText('⚠ SEISMIC ANOMALY ⚠', CX, CY + R0 * 1.3 + 26);
    m.textAlign = 'left';
  }

  // --- The fissure ---------------------------------------------------
  var crack = [];
  var nC = Math.max(12, Math.round(W / 55));
  for (i = 0; i <= nC; i++) {
    var cx0 = -40 + (W + 80) * i / nC;
    crack.push([cx0, CY + (R() - .5) * H * .09 + (i % 2 ? 1 : -1) * R() * H * .03]);
  }
  function crackY(x) {
    for (var k = 1; k < crack.length; k++) {
      if (x <= crack[k][0]) { var a = crack[k - 1], b = crack[k], f = (x - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * f; }
    }
    return CY;
  }
  var branches = [];
  for (i = 0; i < 12; i++) {
    var bx = CX + (R() - .5) * W * .9, by = crackY(bx), dir = R() < .5 ? -1 : 1, bp = [[bx, by]];
    for (s = 0; s < 3 + (R() * 3 | 0); s++) { bx += (R() - .5) * 50; by += dir * (12 + R() * 26); bp.push([bx, by]); }
    branches.push(bp);
  }

  function drawCrack(c, t, alpha) {
    var reach = easeOut((t - T.crack) / (T.split - T.crack)) * (W / 2 + 60);
    if (reach <= 0) return;
    c.save();
    c.lineJoin = 'miter';
    c.shadowColor = rgb(HOT, alpha);
    c.shadowBlur = 14;
    c.strokeStyle = rgb([255, 240, 220], alpha);
    c.lineWidth = 2.2;
    c.beginPath();
    var started = false;
    crack.forEach(function (p) {
      if (Math.abs(p[0] - CX) > reach) return;
      if (!started) { c.moveTo(p[0], p[1]); started = true; } else c.lineTo(p[0], p[1]);
    });
    c.stroke();
    c.lineWidth = 1.2;
    branches.forEach(function (bp) {
      if (Math.abs(bp[0][0] - CX) > reach) return;
      c.beginPath(); c.moveTo(bp[0][0], bp[0][1]);
      for (var k = 1; k < bp.length; k++) c.lineTo(bp[k][0], bp[k][1]);
      c.stroke();
    });
    c.restore();
  }

  function platePath(top) {
    ctx.beginPath();
    if (top) { ctx.moveTo(-60, -H); ctx.lineTo(W + 60, -H); }
    else { ctx.moveTo(-60, H * 2); ctx.lineTo(W + 60, H * 2); }
    for (var k = crack.length - 1; k >= 0; k--) ctx.lineTo(crack[k][0], crack[k][1]);
    ctx.closePath();
  }

  // --- Debris --------------------------------------------------------
  var debris = [];
  function spawnDebris() {
    for (var k = 0; k < 110; k++) {
      var dx = CX + (R() - .5) * W, up = R() < .5;
      debris.push({ x: dx, y: crackY(dx), vx: (R() - .5) * 5, vy: (up ? -1 : 1) * (1 + R() * 6),
                    s: 1.5 + R() * 4, hot: R() < .25, rot: R() * 6, vr: (R() - .5) * .3 });
    }
  }

  // --- Life: vines and flowers from the fissure ------------------------
  var vines = [];
  var nVines = Math.min(64, Math.max(26, Math.round(W / 20)));
  for (i = 0; i < nVines; i++) {
    var vx = CX + (R() + R() - 1) * W * .6;
    var vy = crackY(vx);
    var upward = R() < .5;
    var ang = (upward ? -1 : 1) * Math.PI / 2 + (R() - .5) * 1.6, curl = (R() - .5) * .08;
    var vp = [[vx, vy]], leaves = [];
    var steps = 22 + (R() * 42 | 0);
    for (s = 0; s < steps; s++) {
      ang += curl + (R() - .5) * .35;
      vx += Math.cos(ang) * 4.5; vy += Math.sin(ang) * 4.5;
      vp.push([vx, vy]);
      if (s % 6 === 3) leaves.push({ i: s, side: (s / 6 | 0) % 2 ? 1 : -1, size: 5 + R() * 5, ang: ang });
    }
    var big = R() < .3;
    vines.push({ pts: vp, leaves: leaves, start: T.split + 100 + R() * 800, dur: 800 + R() * 500,
                 flower: { r: big ? 18 + R() * 14 : 8 + R() * 7, n: 5 + (R() * 3 | 0), rot: R() * 6.3, col: PETALS[R() * PETALS.length | 0] } });
  }

  function drawVine(v, now) {
    var p = ease((now - v.start) / v.dur);
    if (p <= 0) return;
    var upto = Math.max(1, Math.floor(p * (v.pts.length - 1)));
    ctx.strokeStyle = rgb(STEM);
    ctx.lineCap = 'round';
    for (var k = 1; k <= upto; k++) {
      ctx.lineWidth = 2.4 - 1.5 * (k / v.pts.length);
      ctx.beginPath();
      ctx.moveTo(v.pts[k - 1][0], v.pts[k - 1][1]);
      ctx.lineTo(v.pts[k][0], v.pts[k][1]);
      ctx.stroke();
    }
    ctx.fillStyle = rgb(LEAF, .92);
    v.leaves.forEach(function (l) {
      if (l.i > upto) return;
      var g = ease((upto - l.i) / 10), pt = v.pts[l.i], a = l.ang + l.side, sz = l.size * g;
      ctx.beginPath();
      ctx.ellipse(pt[0] + Math.cos(a) * sz, pt[1] + Math.sin(a) * sz, sz, sz * .42, a, 0, 7);
      ctx.fill();
    });
    var b = easeOutBack((now - v.start - v.dur * .8) / 600);
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

  // --- Render loop ---------------------------------------------------
  var start = performance.now(), finished = false, opened = false, debrisOut = false;
  var calm = ctx.createRadialGradient(CX, CY, 0, CX, CY, DIAG * .6);
  calm.addColorStop(0, '#fffdf6');
  calm.addColorStop(1, rgb(PAPER));

  function frame(now) {
    if (finished) return;
    var t = now - start;

    // earthquake shake: low rumble → violent jolt at the split → settles
    var amp = t < T.split
      ? ease((t - T.rumble) / (T.split - T.rumble)) * 5
      : 18 * (1 - ease((t - T.split) / 1200));
    var sx = (R() - .5) * amp * 2, sy = (R() - .5) * amp * 2;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(sx, sy);

    // the calm world underneath
    ctx.fillStyle = calm;
    ctx.fillRect(-30, -30, W + 60, H + 60);

    // the machine world, whole or broken in two
    if (t < T.fall + 1100) {
      drawMachine(t);
      if (t < T.split) drawCrack(m, t, 1);
      if (t < T.split) {
        ctx.drawImage(mcv, 0, 0, W, H);
      } else {
        drawCrack(m, T.split, .5);
        var gap = easeOut((t - T.split) / 450) * H * .07;
        var fall = easeIn((t - T.fall) / 1000) * H * 1.1;
        var tilt = easeIn((t - T.fall) / 1000) * .07;
        [true, false].forEach(function (top) {
          var dir = top ? -1 : 1;
          ctx.save();
          ctx.translate(CX, CY);
          ctx.rotate(dir * tilt * (top ? 1 : -.8));
          ctx.translate(-CX, -CY + dir * (gap / 2 + fall));
          platePath(top);
          ctx.clip();
          ctx.drawImage(mcv, 0, 0, W, H);
          ctx.strokeStyle = rgb(HOT, .5);
          ctx.lineWidth = 2;
          ctx.beginPath();
          crack.forEach(function (p, k) { k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
          ctx.stroke();
          ctx.restore();
        });
      }
    }

    // flying debris
    if (t >= T.split && !debrisOut) { debrisOut = true; spawnDebris(); }
    debris.forEach(function (p) {
      p.vy += .22; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.hot ? rgb(ALARM, .9) : rgb([52, 58, 56]);
      ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .7);
      ctx.restore();
    });

    // life bursts from the fissure
    vines.forEach(function (v) { drawVine(v, t); });

    // flash of the crack
    var flash = t >= T.split ? .65 * (1 - clamp((t - T.split) / 260)) : 0;
    if (flash > 0) { ctx.fillStyle = rgb([255, 248, 235], flash); ctx.fillRect(-30, -30, W + 60, H + 60); }

    // open into the website
    if (!opened && t >= T.open) {
      opened = true;
      cv.classList.add('open');
      rise.forEach(function (el, k) { setTimeout(function () { el.classList.add('on'); }, 150 + k * 90); });
    }
    if (t >= T.end) { finish(); return; }
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
