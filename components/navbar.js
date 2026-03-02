/**
 * ED-OPS Navbar Component
 * Injects the shared navigation bar into any page.
 * Usage: <script src="../components/navbar.js"></script>
 *        Call initNavbar() or it auto-initialises on DOMContentLoaded.
 */
(function () {
  'use strict';

  const NAV_ITEMS = [
    { label: 'Index',     href: 'index.html' },
    { label: 'Terminal',  href: 'terminal.html' },
    { label: 'Lab',       href: 'lab.html' },
    { label: 'Expertise', href: 'expertise.html' },
    { label: 'Projects',  href: 'projects.html' },
    { label: 'Ops',       href: 'ops.html' },
  ];

  /**
   * Resolve the correct relative path to the root from the current page.
   * Pages at root level use './', pages in subdirs need '../'.
   */
  function getRootPath() {
    const path = window.location.pathname;
    // If the page is at the root or served from root directory
    const depth = path.replace(/\/[^/]*$/, '').split('/').filter(Boolean).length;
    return depth > 0 ? '../'.repeat(depth) : './';
  }

  /**
   * Determine which nav item matches the current page.
   */
  function getActivePage() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    return page === '' ? 'index.html' : page;
  }

  function buildNavbar() {
    const root = getRootPath();
    const activePage = getActivePage();

    const navbar = document.createElement('nav');
    navbar.id = 'navbar';
    navbar.setAttribute('role', 'navigation');
    navbar.setAttribute('aria-label', 'Main navigation');

    const inner = document.createElement('div');
    inner.className = 'nav-inner';

    // Brand
    const brand = document.createElement('a');
    brand.className = 'nav-brand';
    brand.href = root + 'index.html';
    brand.textContent = 'ED-OPS';
    inner.appendChild(brand);

    // Toggle (mobile)
    const toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', 'Toggle navigation');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '&#9776;';
    inner.appendChild(toggle);

    // Links
    const ul = document.createElement('ul');
    ul.className = 'nav-links';
    ul.setAttribute('role', 'list');

    NAV_ITEMS.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = root + item.href;
      a.textContent = item.label;
      if (activePage === item.href) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
      li.appendChild(a);
      ul.appendChild(li);
    });

    inner.appendChild(ul);
    navbar.appendChild(inner);

    // Insert at top of body
    document.body.insertBefore(navbar, document.body.firstChild);

    // Mobile toggle handler
    toggle.addEventListener('click', () => {
      const isOpen = ul.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        ul.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Auto-initialise
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildNavbar);
  } else {
    buildNavbar();
  }
})();
