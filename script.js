// ------------------------------------------------------------------
// Intro animation (~4.5 s): boot log → scan-line reveal → photo is
// reconstructed from pixels → text decodes → static page.
// Click or press any key to skip. You shouldn't need to edit this file.
// ------------------------------------------------------------------
(function () {
  var root = document.documentElement;

  // ✏️ Optional: the lines shown during the intro
  var BOOT_LINES = [
    '> establishing uplink ........ ok',
    '> signal integrity ........... 37%',
    '> recovering archive ......... ok',
    '> reconstructing subject',
    '> identity resolved'
  ];

  // Footer year and live UTC clock
  document.getElementById('year').textContent = new Date().getFullYear();
  var clock = document.getElementById('clock');
  function tickClock() { clock.textContent = new Date().toISOString().slice(11, 19); }
  tickClock();
  setInterval(tickClock, 1000);

  if (!root.classList.contains('intro')) return;

  var boot = document.querySelector('.boot');
  var log = document.querySelector('.boot-log');
  var frame = document.querySelector('.frame');
  var img = document.getElementById('portrait');
  var canvas = document.querySelector('.portrait-canvas');
  var nameEl = document.querySelector('[data-name]');
  var seq = Array.prototype.slice.call(document.querySelectorAll('[data-seq]'));
  var lines = Array.prototype.slice.call(document.querySelectorAll('[data-line]'));
  var corners = Array.prototype.slice.call(document.querySelectorAll('.corner'));

  var timers = [];
  var finished = false;
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }

  // --- Text decoding effect ---------------------------------------
  var GLYPHS = '█▓▒░<>/\\|_-=+*#01ΛΞΣΨ';
  function scramble(el, dur) {
    var final = el.textContent;
    var n = final.length;
    var resolveAt = [];
    for (var i = 0; i < n; i++) resolveAt.push((i / n) * dur * 0.65 + Math.random() * dur * 0.35);
    var start = performance.now();
    el.classList.add('on', 'scrambling');
    (function step(now) {
      var t = now - start;
      if (finished || t >= dur) {
        el.textContent = final;
        el.classList.remove('scrambling');
        return;
      }
      var out = '';
      for (var i = 0; i < n; i++) {
        var c = final[i];
        out += (c === ' ' || t >= resolveAt[i]) ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      requestAnimationFrame(step);
    })(start);
  }

  function switchOn(el, dur) {
    if (el.hasAttribute('data-scramble')) scramble(el, dur || 700);
    else el.classList.add('on');
  }

  // --- Photo reconstruction from pixels ----------------------------
  function reconstruct(dur, done) {
    var w = frame.clientWidth, h = frame.clientHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = canvas.width = Math.round(w * dpr);
    var H = canvas.height = Math.round(h * dpr);
    var ctx = canvas.getContext('2d');
    var off = document.createElement('canvas');
    var octx = off.getContext('2d');

    // crop like object-fit: cover
    var iw = img.naturalWidth, ih = img.naturalHeight;
    if (!iw || !ih) { done(); return; }
    var fr = w / h, sx, sy, sw, sh;
    if (iw / ih > fr) { sh = ih; sw = ih * fr; sx = (iw - sw) / 2; sy = 0; }
    else { sw = iw; sh = iw / fr; sx = 0; sy = (ih - sh) / 2; }

    var RES = [3, 5, 8, 12, 18, 28, 44, 70, 110];
    var start = performance.now();
    (function step(now) {
      var p = (now - start) / dur;
      if (finished || p >= 1) { done(); return; }
      var cols = RES[Math.min(RES.length - 1, Math.floor(p * RES.length))];
      var rows = Math.max(1, Math.round(cols / fr));
      off.width = cols; off.height = rows;
      octx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(off, 0, 0, cols, rows, 0, 0, W, H);
      // horizontal glitch slices, fading out as the image resolves
      if (Math.random() < 0.6) {
        for (var k = 0; k < 3; k++) {
          var y = Math.random() * H, s = Math.random() * H * 0.07;
          var dx = (Math.random() - 0.5) * W * 0.18 * (1 - p);
          ctx.drawImage(canvas, 0, y, W, s, dx, y, W, s);
        }
      }
      requestAnimationFrame(step);
    })(start);
  }

  // --- Skip / finish -----------------------------------------------
  function finish() {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    root.classList.remove('intro');
    boot.remove();
    document.removeEventListener('keydown', finish);
  }
  boot.addEventListener('click', finish);
  document.addEventListener('keydown', finish);

  // --- Timeline (ms) -----------------------------------------------
  BOOT_LINES.forEach(function (text, i) {
    at(80 + i * 170, function () {
      var line = document.createElement('div');
      line.textContent = text;
      if (i === BOOT_LINES.length - 1) line.className = 'ok';
      log.appendChild(line);
      line.setAttribute('data-scramble', '');
      scramble(line, 300);
    });
  });

  at(1050, function () { boot.classList.add('lift'); });            // scan line sweeps, page revealed

  at(1250, function () {                                            // photo
    corners.forEach(function (c) { c.classList.add('on'); });
    var go = function () { reconstruct(1500, function () { frame.classList.add('done'); }); };
    if (img.complete) go(); else img.addEventListener('load', go);
  });

  at(1450, function () { switchOn(nameEl); scramble(nameEl, 1100); }); // name decodes

  lines.forEach(function (el, i) { at(1900 + i * 140, function () { el.classList.add('on'); }); });

  var step = Math.min(150, 1800 / Math.max(1, seq.length));        // keeps the intro under ~5 s
  seq.forEach(function (el, i) { at(1300 + i * step, function () { switchOn(el); }); });

  at(2700, function () { boot.classList.add('fade'); });
  at(4600, finish);
})();
