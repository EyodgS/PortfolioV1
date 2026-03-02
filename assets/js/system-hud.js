/**
 * ED-OPS System HUD
 * Navbar status (ONLINE / STABLE / SECURE) · Uptime · Activity bars
 * Toast NOC notifications · PING Easter egg
 */
(function () {
  'use strict';

  /* Portfolio launch date — drives the uptime counter */
  var LAUNCH = new Date('2024-09-01T00:00:00Z');

  function pad(n) { return String(n).padStart(2, '0'); }

  function calcUptime() {
    var sec = Math.floor((Date.now() - LAUNCH) / 1000);
    var d   = Math.floor(sec / 86400);
    var h   = Math.floor(sec / 3600) % 24;
    return pad(d) + 'd ' + pad(h) + 'h';
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ================================================================
     1. NAVBAR HUD — status chips + uptime + activity bars
     ================================================================ */
  function injectHUD() {
    var inner = document.querySelector('#navbar .nav-inner');
    if (!inner) return;

    var hud = document.createElement('div');
    hud.id = 'sys-hud';
    hud.setAttribute('aria-label', 'System status');
    hud.innerHTML =
      '<div class="hud-chips">' +
        '<span class="hud-chip hud-online">' +
          '<span class="hud-dot" aria-hidden="true"></span>ONLINE' +
        '</span>' +
        '<span class="hud-chip hud-stable">STABLE</span>' +
        '<span class="hud-chip hud-secure">SECURE</span>' +
      '</div>' +
      '<span class="hud-uptime" id="hud-uptime" ' +
        'title="Uptime since ' + LAUNCH.toISOString().slice(0, 10) + '">' +
        'UP: ' + calcUptime() +
      '</span>' +
      '<div class="hud-activity" aria-hidden="true">' +
        '<span></span><span></span><span></span>' +
      '</div>';

    /* Insert before lang toggle */
    var langBtn = inner.querySelector('.nav-lang-toggle');
    langBtn ? inner.insertBefore(hud, langBtn) : inner.appendChild(hud);

    setInterval(function () {
      var el = document.getElementById('hud-uptime');
      if (el) el.textContent = 'UP: ' + calcUptime();
    }, 60000);
  }

  /* ================================================================
     2. TOAST NOTIFICATION SYSTEM
     ================================================================ */
  var toastBox = document.createElement('div');
  toastBox.id = 'toast-container';
  toastBox.setAttribute('aria-live', 'polite');
  toastBox.setAttribute('aria-atomic', 'false');
  document.body.appendChild(toastBox);

  function toast(msg, lvl) {
    var t    = document.createElement('div');
    t.className = 'sys-toast sys-toast-' + (lvl || 'info');
    var icon = lvl === 'warn' ? '⚠' : lvl === 'error' ? '✖' : '◈';
    t.innerHTML =
      '<span class="toast-icon">' + icon + '</span>' +
      '<span class="toast-msg">' + esc(msg) + '</span>';
    toastBox.appendChild(t);
    /* double-rAF to ensure transition fires */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { t.classList.add('visible'); });
    });
    setTimeout(function () {
      t.classList.remove('visible');
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 380);
    }, 4600);
  }

  var T_INFO = [
    'IPsec SA rekeyed — Site-A\u2194Site-B',
    'Prometheus scrape OK \u2014 128 metrics',
    'DHCP lease renewed \u2014 10.10.20.47',
    'NTP synchronized \u2014 offset 0.002s',
    'GPO applied \u2014 3 policies enforced',
    'Backup completed \u2014 2847 objects',
    'Certificate renewed \u2014 lab.edops.local',
    'Ansible playbook OK \u2014 0 errors',
    'DNS cache flush \u2014 512 entries',
    'VLAN10\u2192VLAN30 forwarded OK',
    'Grafana dashboard refreshed',
    'LAPS password rotated \u2014 AD-WS-01',
  ];

  var T_WARN = [
    'CPU spike: pfSense 82% \u2014 transient',
    'Disk 80% on /var/log \u2014 monitor',
    'Cert expiry in 14 days: *.edops.local',
    'SNMP: high memory on AD-DC01',
  ];

  function scheduleToast() {
    setTimeout(function () {
      if (Math.random() < 0.78) {
        toast('SYS \u203a ' + T_INFO[Math.floor(Math.random() * T_INFO.length)], 'info');
      } else {
        toast('WARN \u203a ' + T_WARN[Math.floor(Math.random() * T_WARN.length)], 'warn');
      }
      scheduleToast();
    }, 11000 + Math.random() * 19000);
  }

  /* ================================================================
     3. PING EASTER EGG — type "ping" anywhere
     ================================================================ */
  var kbBuf = '';
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' ||
        e.metaKey || e.ctrlKey) return;
    kbBuf = (kbBuf + e.key.toLowerCase()).slice(-6);
    if (kbBuf.endsWith('ping')) { kbBuf = ''; pingEgg(); }
  });

  function pingEgg() {
    if (document.getElementById('ping-egg')) return; /* already open */

    var ov = document.createElement('div');
    ov.id  = 'ping-egg';
    ov.setAttribute('role',       'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'PING terminal');
    ov.innerHTML =
      '<div class="egg-window">' +
        '<div class="egg-title">' +
          '<span class="egg-icon" aria-hidden="true">\u25C8</span>' +
          'EDOPS-TERMINAL \u2014 ping 10.10.10.1' +
          '<button class="egg-close" aria-label="Close">\u2715</button>' +
        '</div>' +
        '<div class="egg-body" id="egg-body"></div>' +
        '<div class="egg-footer">' +
          'Press <kbd>ESC</kbd> or click \u2715 to close' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { ov.classList.add('visible'); });
    });

    /* populate ping lines */
    var body = document.getElementById('egg-body');
    var hdr  = document.createElement('div');
    hdr.className   = 'egg-line egg-dim';
    hdr.textContent = 'PING 10.10.10.1 (pfSense-FW01) 56(84) bytes of data.';
    body.appendChild(hdr);

    var seq = 0;
    function addLine() {
      if (seq >= 5) {
        var s1 = document.createElement('div');
        s1.className   = 'egg-stat';
        s1.textContent = '--- 10.10.10.1 ping statistics ---';
        var s2 = document.createElement('div');
        s2.className   = 'egg-ok';
        s2.textContent = '5 packets transmitted, 5 received, 0% packet loss, time 4002ms';
        var s3 = document.createElement('div');
        s3.className   = 'egg-dim';
        s3.textContent = 'rtt min/avg/max/mdev = 0.231/0.448/0.701/0.182 ms';
        body.appendChild(s1);
        body.appendChild(s2);
        body.appendChild(s3);
        body.scrollTop = body.scrollHeight;
        return;
      }
      seq++;
      var rtt = (0.2 + Math.random() * 0.55).toFixed(3);
      var ln  = document.createElement('div');
      ln.className = 'egg-line';
      ln.innerHTML =
        '64 bytes from 10.10.10.1: icmp_seq=' + seq + ' ttl=64 ' +
        '<span class="egg-ok">time=' + rtt + ' ms</span>';
      body.appendChild(ln);
      body.scrollTop = body.scrollHeight;
      setTimeout(addLine, 700 + Math.random() * 350);
    }
    setTimeout(addLine, 250);

    /* close handlers */
    function closeEgg() {
      ov.classList.remove('visible');
      setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 280);
    }
    ov.querySelector('.egg-close').addEventListener('click', closeEgg);
    ov.addEventListener('click', function (e) { if (e.target === ov) closeEgg(); });
    function onEsc(e) {
      if (e.key === 'Escape') { closeEgg(); document.removeEventListener('keydown', onEsc); }
    }
    document.addEventListener('keydown', onEsc);
  }

  /* ================================================================
     INIT
     ================================================================ */
  function init() {
    injectHUD();
    setTimeout(scheduleToast, 9000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
