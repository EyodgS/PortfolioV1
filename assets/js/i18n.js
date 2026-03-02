/**
 * ED-OPS i18n — Lightweight internationalisation module
 * Supports EN / FR with localStorage persistence.
 * Usage: include before navbar.js; use data-i18n="key" on elements.
 */
(function () {
  'use strict';

  /* ---- Translation strings ---- */
  var TRANSLATIONS = {
    en: {
      // Navbar
      'nav.index':       'Index',
      'nav.terminal':    'Terminal',
      'nav.lab':         'Lab',
      'nav.expertise':   'Expertise',
      'nav.projects':    'Projects',
      'nav.ops':         'Ops',
      'nav.toggle_aria': 'Toggle navigation',

      // Footer
      'footer.text': 'Elio Dages \u2014 Network & Infrastructure Engineer',

      // Hero (index)
      'hero.status': 'Systems Operational',
      'hero.noc':    'NOC Dashboard',
      'hero.role':   'Network & Infrastructure Engineer',
      'hero.bio':    'Network engineer specialized in infrastructure deployment, enterprise networking and automation. Focused on building resilient, observable and secure environments, bridging traditional system administration with modern DevOps practices. Operating personal lab environments to design, break and rebuild infrastructures continuously.',
      'hero.btn_terminal':  '$ terminal',
      'hero.btn_lab':       'Network Lab',
      'hero.btn_expertise': 'Expertise',
      'hero.btn_projects':  'Projects',
      'hero.btn_ops':       'NOC View',

      // Info grid (index)
      'info.focus_label':    'Focus',
      'info.focus_value':    'Enterprise Networking & Automation',
      'info.stack_label':    'Core Stack',
      'info.stack_value':    'pfSense \u00b7 AD DS \u00b7 Ansible \u00b7 Proxmox',
      'info.lab_label':      'Lab Status',
      'info.lab_value':      'Active \u2014 Continuous development',
      'info.approach_label': 'Approach',
      'info.approach_value': 'Infrastructure-first \u00b7 Automate everything',

      // Boot sequence (index)
      'boot.line1': 'Initializing ED-OPS...',
      'boot.line2': 'Loading network modules...',
      'boot.line3': 'Mounting infrastructure...',
      'boot.line4': 'Starting monitoring services...',
      'boot.line5': 'Verifying credentials...',
      'boot.line6': 'Access granted.',

      // Expertise page
      'expertise.tag':         '// Domains of Operation',
      'expertise.title':       'Technical Expertise',
      'expertise.desc':        'Engineered capability domains \u2014 each built through hands-on lab work, production-equivalent configurations and continuous iteration.',
      'expertise.tools_tag':   '// Tooling & Stack',
      'expertise.tools_title': 'Technologies & Tools',

      // Lab page
      'lab.tag':   '// Lab Environment',
      'lab.title': 'Homelab Network Topology',
      'lab.desc':  'Personal infrastructure lab \u2014 designed to mirror enterprise environments for testing hardening, automation and observability procedures. Click any node for technical details.',
      'lab.hint':  'Click or press Enter on any node to view configuration details',

      // Projects page
      'projects.tag':          '// Infrastructure Projects',
      'projects.title':        'Active Projects',
      'projects.desc':         'Engineering-level projects built in personal lab environments. Each represents a focused implementation problem solved end-to-end.',
      'projects.filter_all':   'All',
      'projects.view_details': '+ View details',
      'projects.hide_details': '\u2212 Hide details',

      // Ops / NOC page
      'ops.noc_title':    'NOC DASHBOARD \u2014 LIVE TELEMETRY (SIMULATED)',
      'ops.uptime':       'System Uptime',
      'ops.uptime_since': 'Since',
      'ops.cpu':          'CPU Utilisation',
      'ops.cpu_sub':      'pfSense (4 vCPU)',
      'ops.memory':       'Memory',
      'ops.memory_sub':   'AD-DC01 (8 GB)',
      'ops.traffic':      'Network Traffic (Mbps)',
      'ops.disk':         'Disk I/O',
      'ops.disk_sub':     'SRV-MON01 volume',
      'ops.sessions':     'Active Sessions',
      'ops.sessions_sub': 'Authenticated domain users',
      'ops.vpn':          'IPsec Tunnel',
      'ops.vpn_sub':      'Site-A \u2194 Site-B | IKEv2/AES-256',
      'ops.services':     'Service Health',
      'ops.syslog':       'Syslog Feed',
      'ops.syslog_sub':   'Live \u2014 most recent entries',

      // Terminal page
      'terminal.title': 'ED-OPS Terminal',
    },

    fr: {
      // Navbar
      'nav.index':       'Accueil',
      'nav.terminal':    'Terminal',
      'nav.lab':         'Labo',
      'nav.expertise':   'Expertise',
      'nav.projects':    'Projets',
      'nav.ops':         'Ops',
      'nav.toggle_aria': 'Basculer la navigation',

      // Footer
      'footer.text': 'Elio Dages \u2014 Ing\u00e9nieur R\u00e9seau & Infrastructure',

      // Hero (index)
      'hero.status': 'Syst\u00e8mes Op\u00e9rationnels',
      'hero.noc':    'Tableau de bord NOC',
      'hero.role':   'Ing\u00e9nieur R\u00e9seau & Infrastructure',
      'hero.bio':    'Ing\u00e9nieur r\u00e9seau sp\u00e9cialis\u00e9 dans le d\u00e9ploiement d\u2019infrastructure, les r\u00e9seaux d\u2019entreprise et l\u2019automatisation. Ax\u00e9 sur la construction d\u2019environnements r\u00e9silients, observables et s\u00e9curis\u00e9s, faisant le lien entre l\u2019administration syst\u00e8me traditionnelle et les pratiques DevOps modernes. Exploitation d\u2019environnements de labo personnels pour concevoir, tester et reconstruire des infrastructures en continu.',
      'hero.btn_terminal':  '$ terminal',
      'hero.btn_lab':       'Labo R\u00e9seau',
      'hero.btn_expertise': 'Expertise',
      'hero.btn_projects':  'Projets',
      'hero.btn_ops':       'Vue NOC',

      // Info grid (index)
      'info.focus_label':    'Focus',
      'info.focus_value':    'R\u00e9seaux Entreprise & Automatisation',
      'info.stack_label':    'Stack Principale',
      'info.stack_value':    'pfSense \u00b7 AD DS \u00b7 Ansible \u00b7 Proxmox',
      'info.lab_label':      '\u00c9tat du Labo',
      'info.lab_value':      'Actif \u2014 D\u00e9veloppement continu',
      'info.approach_label': 'Approche',
      'info.approach_value': 'Infrastructure d\u2019abord \u00b7 Tout automatiser',

      // Boot sequence (index)
      'boot.line1': 'Initialisation ED-OPS...',
      'boot.line2': 'Chargement des modules r\u00e9seau...',
      'boot.line3': 'Montage de l\u2019infrastructure...',
      'boot.line4': 'D\u00e9marrage des services de surveillance...',
      'boot.line5': 'V\u00e9rification des identifiants...',
      'boot.line6': 'Acc\u00e8s accord\u00e9.',

      // Expertise page
      'expertise.tag':         '// Domaines d\u2019op\u00e9ration',
      'expertise.title':       'Expertise Technique',
      'expertise.desc':        'Domaines de comp\u00e9tences ing\u00e9nieur\u00e9s \u2014 chacun construit \u00e0 travers un travail de labo pratique, des configurations \u00e9quivalentes \u00e0 la production et une it\u00e9ration continue.',
      'expertise.tools_tag':   '// Outils & Stack',
      'expertise.tools_title': 'Technologies & Outils',

      // Lab page
      'lab.tag':   '// Environnement Lab',
      'lab.title': 'Topologie R\u00e9seau du Homelab',
      'lab.desc':  'Labo d\u2019infrastructure personnel \u2014 con\u00e7u pour reproduire les environnements d\u2019entreprise afin de tester les proc\u00e9dures de durcissement, d\u2019automatisation et d\u2019observabilit\u00e9. Cliquez sur un n\u0153ud pour les d\u00e9tails techniques.',
      'lab.hint':  'Cliquez ou appuyez sur Entr\u00e9e sur un n\u0153ud pour voir les d\u00e9tails de configuration',

      // Projects page
      'projects.tag':          '// Projets Infrastructure',
      'projects.title':        'Projets Actifs',
      'projects.desc':         'Projets de niveau ing\u00e9nierie construits dans des environnements de labo personnels. Chacun repr\u00e9sente un probl\u00e8me d\u2019impl\u00e9mentation cibl\u00e9 r\u00e9solu de bout en bout.',
      'projects.filter_all':   'Tous',
      'projects.view_details': '+ Voir d\u00e9tails',
      'projects.hide_details': '\u2212 Masquer',

      // Ops / NOC page
      'ops.noc_title':    'TABLEAU DE BORD NOC \u2014 T\u00c9L\u00c9M\u00c9TRIE EN DIRECT (SIMUL\u00c9E)',
      'ops.uptime':       'Temps de fonctionnement',
      'ops.uptime_since': 'Depuis',
      'ops.cpu':          'Utilisation CPU',
      'ops.cpu_sub':      'pfSense (4 vCPU)',
      'ops.memory':       'M\u00e9moire',
      'ops.memory_sub':   'AD-DC01 (8 Go)',
      'ops.traffic':      'Trafic R\u00e9seau (Mbps)',
      'ops.disk':         'E/S Disque',
      'ops.disk_sub':     'Volume SRV-MON01',
      'ops.sessions':     'Sessions Actives',
      'ops.sessions_sub': 'Utilisateurs du domaine authentifi\u00e9s',
      'ops.vpn':          'Tunnel IPsec',
      'ops.vpn_sub':      'Site-A \u2194 Site-B | IKEv2/AES-256',
      'ops.services':     'Sant\u00e9 des Services',
      'ops.syslog':       'Flux Syslog',
      'ops.syslog_sub':   'En direct \u2014 entr\u00e9es les plus r\u00e9centes',

      // Terminal page
      'terminal.title': 'Terminal ED-OPS',
    },
  };

  var DEFAULT_LANG = 'en';
  var STORAGE_KEY  = 'edops-lang';

  var currentLang = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || DEFAULT_LANG;
  if (!TRANSLATIONS[currentLang]) currentLang = DEFAULT_LANG;

  function t(key) {
    return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) ||
           (TRANSLATIONS[DEFAULT_LANG] && TRANSLATIONS[DEFAULT_LANG][key]) ||
           key;
  }

  function applyTranslations() {
    document.documentElement.lang = currentLang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = t(key);
      if (val !== key) el.textContent = val;
    });
  }

  function setLang(lang) {
    if (!TRANSLATIONS[lang]) return;
    currentLang = lang;
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, lang);
    applyTranslations();
    document.dispatchEvent(new CustomEvent('edops:langchange', { detail: { lang: lang } }));
  }

  function getLang() { return currentLang; }

  window.EDOpsI18n = { t: t, setLang: setLang, getLang: getLang, applyTranslations: applyTranslations };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
  } else {
    applyTranslations();
  }
})();
