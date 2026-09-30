// ------------------------------------------------------------------
// Intro animation (~5 s): the myth of Sisyphus, minimal and a bit silly.
//   1. a hill draws itself; Sisyphus pushes his boulder up the slope
//   2. at the very top, the boulder wobbles… and rolls back down
//   3. he jumps over it, panics, spins his legs cartoon-style and chases
//      it off screen, and the website opens up
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

  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp(x); return x * x * (3 - 2 * x); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // Palette (matches the page)
  var PAPER = '#f4f2ec', HILL = '#ebe7dd', INK = '#2f302c', MUTED = '#86867c';
  var STONE = '#d4cfc3', DUST = 'rgba(190, 182, 164, ', ACCENT = '#5d7458';

  // Timeline (ms)
  var T = { push: 450, top: 2350, question: 2550, roll: 2750, jump: 500,
            spin: 3410, run: 3560, runDur: 750, open: 4310, end: 5310 };

  // --- Scene geometry ------------------------------------------------
  var run = W * .62;
  var riseH = Math.min(H * .42, run * .68);
  var A = [W * .12, H * .5 + riseH / 2 + H * .06];      // foot of the hill
  var P = [A[0] + run, A[1] - riseH];                  // summit
  var Ls = Math.hypot(P[0] - A[0], P[1] - A[1]);
  var U = [(P[0] - A[0]) / Ls, (P[1] - A[1]) / Ls];    // up-slope direction
  var N = [U[1], -U[0]];                                // surface normal (pointing up)

  var Rb = Math.max(16, Math.min(44, Math.min(W, H) * .055));   // boulder radius
  var h = Rb * 3.2;                                              // Sisyphus' height
  var LW = Math.max(2.2, h * .032);

  // ground position at distance d along the slope (negative d = flat ground to the left)
  function surf(d) { return d >= 0 ? [A[0] + U[0] * d, A[1] + U[1] * d] : [A[0] + d, A[1]]; }
  function normal(d) { return d >= 0 ? N : [0, -1]; }

  var dB0 = Ls * .14, dB1 = Ls * .9;
  var gap = Rb + h * .5;                     // feet stay this far behind the boulder
  var dStop = dB1 - gap;
  var acc = 2 * dB1 / .49;                    // boulder reaches the bottom in 0.7 s
  var vRun = (dStop + A[0] + h * 1.5) / (T.runDur / 1000);

  // hill outline for drawing
  var hillPts = [[-20, A[1]], A, P, [P[0] + W * .05, P[1]], [W + 20, P[1] + H * .35]];
  var hillLen = 0;
  for (var i = 1; i < hillPts.length; i++) hillLen += Math.hypot(hillPts[i][0] - hillPts[i - 1][0], hillPts[i][1] - hillPts[i - 1][1]);

  // --- Drawing helpers ------------------------------------------------
  function drawHill(t) {
    var p = ease(t / 500);
    ctx.globalAlpha = p;
    ctx.fillStyle = HILL;
    ctx.beginPath();
    ctx.moveTo(-20, H + 20);
    hillPts.forEach(function (q) { ctx.lineTo(q[0], q[1]); });
    ctx.lineTo(W + 20, H + 20);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.strokeStyle = INK;
    ctx.lineWidth = LW * .8;
    ctx.lineJoin = 'round';
    ctx.setLineDash([hillLen, hillLen]);
    ctx.lineDashOffset = hillLen * (1 - p);
    ctx.beginPath();
    hillPts.forEach(function (q, k) { k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); });
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawBoulder(d, alpha) {
    var s = surf(d), n = normal(d);
    var c = [s[0] + n[0] * Rb, s[1] + n[1] * Rb];
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(c[0], c[1]);
    ctx.rotate(d / Rb);
    ctx.fillStyle = STONE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = LW;
    ctx.beginPath(); ctx.arc(0, 0, Rb, 0, 7); ctx.fill(); ctx.stroke();
    ctx.lineWidth = LW * .7;                       // a couple of marks so you can see it roll
    ctx.beginPath(); ctx.arc(0, 0, Rb * .55, .3, 1.3); ctx.stroke();
    ctx.beginPath(); ctx.arc(-Rb * .35, -Rb * .3, LW * .7, 0, 7); ctx.fillStyle = INK; ctx.fill();
    ctx.restore();
    return c;
  }

  // o: facing (1 = uphill/right, -1 = left), lean, phase, swing, lift (jump height),
  //    hands (point to press on) or arms [angle, angle] measured from hanging down
  function drawFigure(foot, o) {
    var f = o.facing, L = h * .42, Tt = h * .36, hr = h * .1, Ar = h * .17;
    var hip = [foot[0], foot[1] - L * .96 - (o.lift || 0) - (o.bob || 0)];
    var sl = Math.sin(o.lean), cl = Math.cos(o.lean);
    var sh = [hip[0] + f * sl * Tt, hip[1] - cl * Tt];
    var head = [hip[0] + f * sl * (Tt + hr + LW), hip[1] - cl * (Tt + hr + LW)];

    ctx.save();
    ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineWidth = LW;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // legs (with knees)
    for (var leg = 0; leg < 2; leg++) {
      var ph = o.phase + leg * Math.PI;
      var a = o.swing * Math.sin(ph) + (o.tuck || 0);
      var bend = Math.max(0, -Math.cos(ph)) * o.swing * 1.3 + (o.tuck || 0) * 1.6;
      var knee = [hip[0] + f * Math.sin(a) * L * .5, hip[1] + Math.cos(a) * L * .5];
      var ft = [knee[0] + f * Math.sin(a - bend) * L * .5, knee[1] + Math.cos(a - bend) * L * .5];
      ctx.beginPath(); ctx.moveTo(hip[0], hip[1]); ctx.lineTo(knee[0], knee[1]); ctx.lineTo(ft[0], ft[1]); ctx.stroke();
    }
    // torso
    ctx.beginPath(); ctx.moveTo(hip[0], hip[1]); ctx.lineTo(sh[0], sh[1]); ctx.stroke();
    // arms
    if (o.hands) {
      [-1, 1].forEach(function (k) {
        var hx = o.hands[0], hy = o.hands[1] + k * LW;
        var mx = (sh[0] + hx) / 2, my = (sh[1] + hy) / 2 + h * .03;
        ctx.beginPath(); ctx.moveTo(sh[0], sh[1]); ctx.lineTo(mx, my); ctx.lineTo(hx, hy); ctx.stroke();
      });
    } else {
      o.arms.forEach(function (ang) {
        var el = [sh[0] + f * Math.sin(ang) * Ar, sh[1] + Math.cos(ang) * Ar];
        var ha = ang + .5;
        var hd = [el[0] + f * Math.sin(ha) * Ar, el[1] + Math.cos(ha) * Ar];
        ctx.beginPath(); ctx.moveTo(sh[0], sh[1]); ctx.lineTo(el[0], el[1]); ctx.lineTo(hd[0], hd[1]); ctx.stroke();
      });
    }
    // head
    ctx.beginPath(); ctx.arc(head[0], head[1], hr, 0, 7); ctx.fill();
    ctx.restore();
    return head;
  }

  function bubble(head, text, t0, t) {
    var p = clamp((t - t0) / 180);
    if (p <= 0) return;
    var s = h * .38 * (p < 1 ? .6 + .4 * p + Math.sin(p * Math.PI) * .25 : 1);
    ctx.fillStyle = text === '!' ? ACCENT : INK;
    ctx.font = 'italic 400 ' + s.toFixed(1) + 'px Fraunces, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, head[0], head[1] - h * .22);
  }

  var puffs = [], lastPuff = 0;
  function puff(x, y, big) { puffs.push({ x: x, y: y, r: big ? 5 : 2.5, vx: (Math.random() - .5) * .6, life: 1, big: big }); }
  function drawPuffs() {
    puffs.forEach(function (q) {
      q.r += q.big ? .9 : .45; q.x += q.vx; q.y -= .25; q.life -= .03;
      if (q.life <= 0) return;
      ctx.fillStyle = DUST + (q.life * .7).toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 7); ctx.fill();
    });
    puffs = puffs.filter(function (q) { return q.life > 0; });
  }

  // --- Render loop ---------------------------------------------------
  var start = performance.now(), finished = false, opened = false, bumped = false;

  function frame(now) {
    if (finished) return;
    var t = now - start;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);

    drawHill(t);

    // caption
    ctx.globalAlpha = ease((t - 300) / 600) * .9;
    ctx.fillStyle = MUTED;
    ctx.textAlign = 'center';
    ctx.font = 'italic 300 ' + Math.max(14, Math.min(20, W / 50)).toFixed(0) + 'px Fraunces, Georgia, serif';
    ctx.fillText('one must imagine Sisyphus happy', W / 2, Math.min(H - 36, A[1] + (H - A[1]) * .55));
    ctx.globalAlpha = 1;


    var appear = ease((t - 200) / 350);
    var dB, dF, head, pose;

    if (t < T.top) {
      // 1. the push: slow, straining, with a slight stutter in every step
      var p = clamp((t - T.push) / (T.top - T.push));
      var q = ease(p) + .012 * Math.sin(p * Math.PI * 12) * Math.sin(p * Math.PI);
      dB = lerp(dB0, dB1, q);
      dF = dB - gap;
      var c = drawBoulder(dB, appear);
      pose = { facing: 1, lean: .62, swing: .42, phase: dF / (h * .16), alpha: appear,
               hands: [c[0] - U[0] * Rb * .92, c[1] - U[1] * Rb * .92 - Rb * .1] };
      head = drawFigure(surf(dF), pose);
    } else if (t < T.roll) {
      // 2. the summit: he straightens up, proud… the boulder wobbles
      var w = (t - T.top) / (T.roll - T.top);
      dB = dB1 + Math.sin((t - T.top) * .035) * Rb * .06 * (.4 + w);
      var c2 = drawBoulder(dB, 1);
      pose = { facing: 1, lean: lerp(.62, .12, ease(w * 2)), swing: 0, phase: 0,
               hands: [c2[0] - U[0] * Rb * .95, c2[1] - U[1] * Rb * .95] };
      head = drawFigure(surf(dStop), pose);
      if (t > T.question) bubble(head, '?', T.question, t);
    } else {
      // 3. it rolls back down…
      var tr = (t - T.roll) / 1000;
      dB = dB1 - .5 * acc * tr * tr;
      if (dB < 0 && !bumped) { bumped = true; for (var k = 0; k < 6; k++) puff(A[0] + (Math.random() - .5) * Rb, A[1], true); }
      if (dB > -W) drawBoulder(dB, 1);

      if (t < T.roll + T.jump) {
        // …he hops over it in surprise
        var jp = (t - T.roll) / T.jump;
        pose = { facing: 1, lean: -.15, swing: .15, phase: 1, tuck: .5,
                 lift: 4 * h * .85 * jp * (1 - jp), arms: [2.6, 2.9] };
        head = drawFigure(surf(dStop), pose);
      } else if (t < T.run) {
        // lands, "!", turns around, legs spin in place
        var spinning = t > T.spin;
        pose = { facing: t > T.spin - 60 ? -1 : 1, lean: spinning ? .5 : 0,
                 swing: spinning ? 1.0 : 0, phase: t * .045, bob: spinning ? Math.abs(Math.sin(t * .045)) * h * .04 : 0,
                 arms: spinning ? [2.4 + Math.sin(t * .05) * .7, 2.4 - Math.sin(t * .05) * .7] : [.3, -.3] };
        head = drawFigure(surf(dStop), pose);
        bubble(head, '!', T.roll + T.jump, t);
        if (spinning && t - lastPuff > 45) { lastPuff = t; var sp = surf(dStop); puff(sp[0] + h * .15, sp[1]); }
      } else {
        // and off he runs after it
        dF = dStop - vRun * (t - T.run) / 1000;
        var foot = surf(dF);
        pose = { facing: -1, lean: .55, swing: 1.0, phase: t * .045, bob: Math.abs(Math.sin(t * .045)) * h * .05,
                 arms: [2.4 + Math.sin(t * .05) * .8, 2.4 - Math.sin(t * .05) * .8] };
        head = drawFigure(foot, pose);
        if (t - T.run < 220) bubble(head, '!', T.roll + T.jump, t);
        if (t - lastPuff > 40) { lastPuff = t; puff(foot[0] + h * .2, foot[1]); }
      }
    }

    drawPuffs();

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
