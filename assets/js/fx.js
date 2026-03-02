/**
 * ED-OPS FX — Effects Engine
 * Network canvas · Cursor trail · Magnetic buttons · Card glow · Page transitions
 *
 * Z-index map:
 *   bg-canvas   : -1   (behind all content, above html background)
 *   page content: auto (normal flow, above bg-canvas)
 *   cursor trail: 9997 (above everything except overlays)
 *   page-trans  : 9990
 *   boot-overlay: 9999 (index.html only)
 */
(function () {
  'use strict';

  var mobile    = ('ontouchstart' in window) || window.innerWidth < 640;
  var motionOK  = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tabAlive  = !document.hidden;
  document.addEventListener('visibilitychange', function () { tabAlive = !document.hidden; });

  /* ================================================================
     1. ANIMATED NETWORK BACKGROUND CANVAS
     ================================================================ */
  var C = document.createElement('canvas');
  C.id = 'bg-canvas';
  C.setAttribute('aria-hidden', 'true');
  C.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;' +
    'z-index:-1;pointer-events:none;';
  document.body.insertBefore(C, document.body.firstChild);
  /* Allow canvas to show through body */
  document.body.classList.add('fx-ready');

  var ctx = C.getContext('2d');
  var W = 0, H = 0;
  var nodes   = [];
  var mx = -9999, my = -9999;
  var scrollY = 0;
  var docScrollH = 1; /* cached document scroll height, updated on resize */

  var N_COUNT = mobile ? 18 : 36;
  var LINK_D  = mobile ? 105 : 148;
  var SPD     = 0.22;

  function bgResize() {
    W = C.width  = window.innerWidth;
    H = C.height = window.innerHeight;
    /* Re-cache after resize since content height may change */
    docScrollH = Math.max(document.documentElement.scrollHeight - H, 1);
  }

  function mkNode() {
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * SPD,
      vy: (Math.random() - 0.5) * SPD,
      r:  1.2 + Math.random() * 1.4,
      ph: Math.random() * Math.PI * 2,
    };
  }

  function initNodes() {
    nodes = [];
    for (var i = 0; i < N_COUNT; i++) nodes.push(mkNode());
  }

  var lastFrame = 0;
  function bgTick(ts) {
    if (motionOK) requestAnimationFrame(bgTick);
    if (!tabAlive || !motionOK) return;
    if (ts - lastFrame < 33) return; /* ~30 fps cap */
    lastFrame = ts;

    /* Fill dark background */
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, W, H);

    var t  = ts * 0.001;
    var sr = Math.min(scrollY / docScrollH, 1);
    var ba = 0.17 + sr * 0.20; /* base alpha increases with scroll depth */

    /* --- connections --- */
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var dx = nodes[j].x - nodes[i].x;
        var dy = nodes[j].y - nodes[i].y;
        var d  = Math.sqrt(dx * dx + dy * dy);
        if (d > LINK_D) continue;
        var la = (1 - d / LINK_D) * ba;
        /* mouse proximity glow on midpoint */
        if (!mobile) {
          var mdx = (nodes[i].x + nodes[j].x) * 0.5 - mx;
          var mdy = (nodes[i].y + nodes[j].y) * 0.5 - my;
          var md  = Math.sqrt(mdx * mdx + mdy * mdy);
          if (md < 170) la += (1 - md / 170) * 0.28;
        }
        ctx.globalAlpha = Math.min(la, 0.78);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth   = 0.35 + (1 - d / LINK_D) * 0.55;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }

    /* --- nodes --- */
    ctx.globalAlpha = 1;
    for (var i = 0; i < nodes.length; i++) {
      var n  = nodes[i];
      var p  = 0.5 + 0.5 * Math.sin(t * 1.3 + n.ph);
      var bx = n.x - mx;
      var by = n.y - my;
      var bd = Math.sqrt(bx * bx + by * by);
      var mb = (!mobile && bd < 88) ? (1 - bd / 88) : 0;
      var a  = 0.22 + 0.28 * p + mb * 0.5;

      ctx.fillStyle = 'rgba(0,255,136,' + Math.min(a, 0.92) + ')';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * (0.8 + 0.4 * p), 0, 6.2832);
      ctx.fill();

      /* mouse halo */
      if (mb > 0.2) {
        ctx.strokeStyle = 'rgba(0,255,136,' + (mb * 0.2) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 4 + mb * 8, 0, 6.2832);
        ctx.stroke();
      }

      /* physics */
      n.x += n.vx;
      n.y += n.vy;

      /* mouse repulsion */
      if (!mobile && bd < 72) {
        var ang = Math.atan2(by, bx);
        var f   = (1 - bd / 72) * 0.07;
        n.vx += Math.cos(ang) * f;
        n.vy += Math.sin(ang) * f;
      }

      /* dampen + drift */
      n.vx = n.vx * 0.987 + (Math.random() - 0.5) * 0.016;
      n.vy = n.vy * 0.987 + (Math.random() - 0.5) * 0.016;

      /* clamp speed */
      var sp = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (sp > SPD * 2.8) { n.vx *= SPD * 2.8 / sp; n.vy *= SPD * 2.8 / sp; }

      /* wrap edges */
      if (n.x < -10) n.x = W + 10;
      if (n.x > W + 10) n.x = -10;
      if (n.y < -10) n.y = H + 10;
      if (n.y > H + 10) n.y = -10;
    }
  }

  if (!mobile) {
    document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });
  }
  window.addEventListener('scroll', function () { scrollY = window.scrollY; }, { passive: true });
  window.addEventListener('resize', function () { bgResize(); initNodes(); });
  /* Also re-cache scroll height after DOMContentLoaded when all content is rendered */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      docScrollH = Math.max(document.documentElement.scrollHeight - H, 1);
    });
  } else {
    docScrollH = Math.max(document.documentElement.scrollHeight - H, 1);
  }

  bgResize();
  initNodes();
  requestAnimationFrame(bgTick);

  /* ================================================================
     2. CURSOR TRAIL
     ================================================================ */
  if (!mobile && motionOK) {
    var TC = document.createElement('canvas');
    TC.setAttribute('aria-hidden', 'true');
    TC.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;' +
      'z-index:9997;pointer-events:none;';
    document.body.appendChild(TC);

    var tctx  = TC.getContext('2d');
    var trail = [];

    function trResize() { TC.width = window.innerWidth; TC.height = window.innerHeight; }
    trResize();
    window.addEventListener('resize', trResize);

    document.addEventListener('mousemove', function (e) {
      trail.push({ x: e.clientX, y: e.clientY });
      if (trail.length > 16) trail.shift();
    });

    (function drawTrail() {
      requestAnimationFrame(drawTrail);
      if (!tabAlive) return;
      tctx.clearRect(0, 0, TC.width, TC.height);
      for (var i = 1; i < trail.length; i++) {
        var r = i / trail.length;
        tctx.globalAlpha = r * 0.24;
        tctx.fillStyle   = '#00ff88';
        tctx.beginPath();
        tctx.arc(trail[i].x, trail[i].y, 1.6 * r, 0, 6.2832);
        tctx.fill();
      }
      tctx.globalAlpha = 1;
    })();
  }

  /* ================================================================
     3. MAGNETIC BUTTON EFFECT
     ================================================================ */
  if (!mobile && motionOK) {
    function initMagnetic() {
      document.querySelectorAll('.btn, .btn-social, .nav-brand, .filter-btn').forEach(function (el) {
        el.addEventListener('mousemove', function (e) {
          var r  = el.getBoundingClientRect();
          var dx = (e.clientX - (r.left + r.width  * 0.5)) * 0.15;
          var dy = (e.clientY - (r.top  + r.height * 0.5)) * 0.15;
          el.style.transform  = 'translate(' + dx + 'px,' + dy + 'px) scale(1.02)';
          el.style.transition = 'transform 0.08s ease';
        });
        el.addEventListener('mouseleave', function () {
          el.style.transform  = '';
          el.style.transition = 'transform 0.5s cubic-bezier(.23,1,.32,1)';
        });
      });
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initMagnetic);
    } else {
      initMagnetic();
    }
  }

  /* ================================================================
     4. CARD GLOW PROXIMITY
     ================================================================ */
  if (!mobile && motionOK) {
    var GLOW_SEL =
      '.info-card,.domain-card,.phil-card,.timeline-item,' +
      '.cert-card,.project-card,.veille-section,.tool-group,.noc-widget';

    document.addEventListener('mousemove', function (e) {
      var cards = document.querySelectorAll(GLOW_SEL);
      for (var k = 0; k < cards.length; k++) {
        var el = cards[k];
        var r  = el.getBoundingClientRect();
        /* skip cards far from viewport */
        if (e.clientY < r.top - 250 || e.clientY > r.bottom + 250) continue;
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top)  + 'px');
        var cx = r.left + r.width  * 0.5;
        var cy = r.top  + r.height * 0.5;
        var d  = Math.sqrt(Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2));
        var m  = Math.sqrt(Math.pow(r.width * 0.75, 2) + Math.pow(r.height * 0.75, 2));
        var ga = d < m ? ((1 - d / m) * 0.08).toFixed(3) : '0';
        el.style.setProperty('--glow-a', ga);
      }
    }, { passive: true });
  }

  /* ================================================================
     5. PAGE TRANSITIONS
     ================================================================ */
  var ptOv = document.createElement('div');
  ptOv.id = 'page-trans';
  ptOv.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ptOv);

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href');
    if (!h || h[0] === '#' || h.indexOf('://') !== -1 ||
        a.target === '_blank' || a.hasAttribute('download')) return;
    e.preventDefault();
    ptOv.classList.add('pt-active');
    setTimeout(function () { window.location.href = h; }, 240);
  });

  window.addEventListener('pageshow', function () {
    ptOv.classList.remove('pt-active');
    document.body.classList.add('pt-fadein');
    setTimeout(function () { document.body.classList.remove('pt-fadein'); }, 500);
  });

})();
