/**
 * ED-OPS Navbar Component
 * Injects the shared navigation bar into any page.
 * Usage: <script src="assets/js/i18n.js"></script>
 *        <script src="components/navbar.js"></script>
 */
(function () {
  'use strict';

  var NAV_ITEMS = [
    { label: 'Index',     href: 'index.html',     i18n: 'nav.index' },
    { label: 'Terminal',  href: 'terminal.html',  i18n: 'nav.terminal' },
    { label: 'Lab',       href: 'lab.html',        i18n: 'nav.lab' },
    { label: 'Expertise', href: 'expertise.html',  i18n: 'nav.expertise' },
    { label: 'Projects',  href: 'projects.html',   i18n: 'nav.projects' },
    { label: 'Ops',       href: 'ops.html',        i18n: 'nav.ops' },
  ];

  /**
   * All pages live in the same flat directory.
   * Always use './' so links resolve correctly both locally
   * and on GitHub Pages project sites (e.g. /PortfolioV1/).
   */
  function getRootPath() {
    return './';
  }

  /** Determine which nav item matches the current page. */
  function getActivePage() {
    var page = window.location.pathname.split('/').pop() || 'index.html';
    return page === '' ? 'index.html' : page;
  }

  function buildNavbar() {
    var root = getRootPath();
    var activePage = getActivePage();
    var i18n = window.EDOpsI18n;

    var navbar = document.createElement('nav');
    navbar.id = 'navbar';
    navbar.setAttribute('role', 'navigation');
    navbar.setAttribute('aria-label', 'Main navigation');

    var inner = document.createElement('div');
    inner.className = 'nav-inner';

    // Brand
    var brand = document.createElement('a');
    brand.className = 'nav-brand';
    brand.href = root + 'index.html';
    brand.textContent = 'ED-OPS';
    inner.appendChild(brand);

    // Links
    var ul = document.createElement('ul');
    ul.className = 'nav-links';
    ul.setAttribute('role', 'list');

    NAV_ITEMS.forEach(function (item) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = root + item.href;
      a.setAttribute('data-i18n', item.i18n);
      a.textContent = (i18n ? i18n.t(item.i18n) : item.label);
      if (activePage === item.href) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
      li.appendChild(a);
      ul.appendChild(li);
    });

    inner.appendChild(ul);

    // Language toggle
    var langBtn = document.createElement('button');
    langBtn.id = 'lang-toggle';
    langBtn.className = 'nav-lang-toggle';
    langBtn.setAttribute('aria-label', 'Switch language');
    langBtn.setAttribute('type', 'button');
    langBtn.textContent = (i18n && i18n.getLang() === 'fr') ? 'EN' : 'FR';
    langBtn.addEventListener('click', function () {
      if (!window.EDOpsI18n) return;
      var next = window.EDOpsI18n.getLang() === 'en' ? 'fr' : 'en';
      window.EDOpsI18n.setLang(next);
      langBtn.textContent = next === 'fr' ? 'EN' : 'FR';
    });
    inner.appendChild(langBtn);

    // Toggle (mobile)
    var toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', i18n ? i18n.t('nav.toggle_aria') : 'Toggle navigation');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('data-i18n-aria', 'nav.toggle_aria');
    toggle.innerHTML = '&#9776;';
    inner.appendChild(toggle);

    navbar.appendChild(inner);

    // Insert at top of body
    document.body.insertBefore(navbar, document.body.firstChild);

    // Mobile toggle handler
    toggle.addEventListener('click', function () {
      var isOpen = ul.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!navbar.contains(e.target)) {
        ul.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Re-apply translations when language changes
    document.addEventListener('edops:langchange', function (e) {
      langBtn.textContent = e.detail.lang === 'fr' ? 'EN' : 'FR';
    });
  }

  // Auto-initialise
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildNavbar);
  } else {
    buildNavbar();
  }
})();
