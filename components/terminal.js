/**
 * ED-OPS Terminal Component
 * Implements a fully interactive browser-based terminal.
 * Attach to a container element via: new EDOpsTerminal(containerEl, options)
 */

class EDOpsTerminal {
  /**
   * @param {HTMLElement} container
   * @param {object} options
   * @param {string} options.rootPath  - Relative path to repo root (default './')
   */
  constructor(container, options = {}) {
    this.container = container;
    this.rootPath = options.rootPath || './';
    this.history = [];
    this.historyIndex = -1;
    this.startTime = Date.now();

    this._buildDOM();
    this._bindEvents();
    this._printWelcome();
  }

  /* ---------- DOM Setup ---------- */

  _buildDOM() {
    this.container.classList.add('edops-terminal');

    // Output area
    this.output = document.createElement('div');
    this.output.className = 'terminal-output';
    this.output.setAttribute('aria-live', 'polite');
    this.output.setAttribute('aria-label', 'Terminal output');

    // Input row
    const inputRow = document.createElement('div');
    inputRow.className = 'terminal-input-row';

    this.prompt = document.createElement('span');
    this.prompt.className = 'terminal-prompt';
    this.prompt.textContent = 'ops@ed-ops:~$ ';

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.className = 'terminal-input';
    this.input.setAttribute('autocomplete', 'off');
    this.input.setAttribute('autocorrect', 'off');
    this.input.setAttribute('autocapitalize', 'off');
    this.input.setAttribute('spellcheck', 'false');
    this.input.setAttribute('aria-label', 'Terminal input');

    inputRow.appendChild(this.prompt);
    inputRow.appendChild(this.input);

    this.container.appendChild(this.output);
    this.container.appendChild(inputRow);

    // Click anywhere in terminal focuses input
    this.container.addEventListener('click', () => this.input.focus());
    this.input.focus();
  }

  _bindEvents() {
    this.input.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Enter':
          this._handleEnter();
          break;
        case 'ArrowUp':
          e.preventDefault();
          this._navigateHistory(1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          this._navigateHistory(-1);
          break;
        case 'Tab':
          e.preventDefault();
          this._autocomplete();
          break;
        case 'c':
          if (e.ctrlKey) { e.preventDefault(); this._ctrlC(); }
          break;
        case 'l':
          if (e.ctrlKey) { e.preventDefault(); this._runCommand('clear'); }
          break;
      }
    });
  }

  /* ---------- Interaction ---------- */

  _handleEnter() {
    const raw = this.input.value.trim();
    this.input.value = '';

    if (raw) {
      this.history.unshift(raw);
      if (this.history.length > 100) this.history.pop();
    }
    this.historyIndex = -1;

    this._printLine(`<span class="t-prompt">ops@ed-ops:~$</span> <span class="t-cmd">${this._escape(raw)}</span>`);

    if (raw) this._runCommand(raw);
  }

  _navigateHistory(dir) {
    const newIndex = this.historyIndex + dir;
    if (newIndex < -1 || newIndex >= this.history.length) return;
    this.historyIndex = newIndex;
    this.input.value = newIndex === -1 ? '' : this.history[newIndex];
    // Move cursor to end
    const len = this.input.value.length;
    this.input.setSelectionRange(len, len);
  }

  _autocomplete() {
    const partial = this.input.value.trim().toLowerCase();
    if (!partial) return;
    const match = Object.keys(this.COMMANDS).find(c => c.startsWith(partial));
    if (match) this.input.value = match;
  }

  _ctrlC() {
    this._printLine(`<span class="t-prompt">ops@ed-ops:~$</span> <span class="t-cmd">${this._escape(this.input.value)}</span>^C`);
    this.input.value = '';
    this.historyIndex = -1;
  }

  /* ---------- Command execution ---------- */

  _runCommand(raw) {
    const [cmd, ...args] = raw.split(/\s+/);
    const handler = this.COMMANDS[cmd.toLowerCase()];
    if (handler) {
      handler.call(this, args);
    } else {
      this._printLine(`<span class="t-error">command not found: ${this._escape(cmd)}</span> — type <span class="t-accent">help</span> for available commands`);
    }
  }

  /* ---------- Output helpers ---------- */

  _printLine(html, delay = 0) {
    return new Promise(resolve => {
      setTimeout(() => {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = html;
        this.output.appendChild(line);
        this.output.scrollTop = this.output.scrollHeight;
        resolve();
      }, delay);
    });
  }

  _printLines(lines, baseDelay = 0, step = 40) {
    const promises = lines.map((html, i) => this._printLine(html, baseDelay + i * step));
    return Promise.all(promises);
  }

  _printBlank() {
    return this._printLine('&nbsp;');
  }

  _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Translate a key via EDOpsI18n, falling back to fb if not loaded yet. */
  _t(key, fb) {
    return (window.EDOpsI18n ? window.EDOpsI18n.t(key) : null) || fb;
  }

  /* ---------- Welcome banner ---------- */

  _printWelcome() {
    const banner = [
      `<span class="t-green">  _____  ____        ____  ____  _____</span>`,
      `<span class="t-green"> | ____||  _ \\      / __ \\|  _ \\/ ____|</span>`,
      `<span class="t-green"> |  _|  | | | |____| |  | | |_) \\___ \\</span>`,
      `<span class="t-green"> | |___ | |_| |____| |__| |  __/ ____)</span>`,
      `<span class="t-green"> |_____||____/      \\____/|_|  |_____/</span>`,
      `&nbsp;`,
      `<span class="t-dim">ED-OPS // Network Operations Portfolio</span>`,
      `<span class="t-dim">────────────────────────────────────────────────</span>`,
      `Type <span class="t-accent">help</span> for available commands.`,
      `&nbsp;`,
    ];
    this._printLines(banner, 0, 30);
  }

  /* ---------- Built-in Commands ---------- */

  get COMMANDS() {
    return {
      help:       this._cmd_help,
      about:      this._cmd_about,
      skills:     this._cmd_skills,
      expertise:  this._cmd_expertise,
      projects:   this._cmd_projects,
      lab:        this._cmd_lab,
      contact:    this._cmd_contact,
      whoami:     this._cmd_whoami,
      career:     this._cmd_career,
      experience: this._cmd_experience,
      veille:     this._cmd_veille,
      uptime:     this._cmd_uptime,
      clear:      this._cmd_clear,
    };
  }

  _cmd_help() {
    const lines = [
      `&nbsp;`,
      `<span class="t-accent">Available commands:</span>`,
      `  <span class="t-cmd">help</span>       — show this help`,
      `  <span class="t-cmd">about</span>      — about Elio Dages`,
      `  <span class="t-cmd">whoami</span>     — current operator info`,
      `  <span class="t-cmd">career</span>     — career & professional journey`,
      `  <span class="t-cmd">experience</span> — professional experience`,
      `  <span class="t-cmd">expertise</span>  — technical domains of operation`,
      `  <span class="t-cmd">skills</span>     — list technical domains`,
      `  <span class="t-cmd">projects</span>   — list active projects`,
      `  <span class="t-cmd">lab</span>        — homelab topology info`,
      `  <span class="t-cmd">veille</span>     — technology watch`,
      `  <span class="t-cmd">contact</span>    — contact information`,
      `  <span class="t-cmd">uptime</span>     — session uptime`,
      `  <span class="t-cmd">clear</span>      — clear terminal`,
      `&nbsp;`,
      `<span class="t-dim">Keyboard: ↑↓ history • Tab autocomplete • Ctrl+L clear • Ctrl+C interrupt</span>`,
      `&nbsp;`,
    ];
    this._printLines(lines, 0, 25);
  }

  _cmd_about() {
    const lines = [
      `&nbsp;`,
      `<span class="t-accent">// ABOUT</span>`,
      `&nbsp;`,
      `  Name     : <span class="t-green">Elio Dages</span>`,
      `  Role     : Network &amp; Infrastructure Engineer`,
      `  Focus    : Enterprise networking, automation, secure infrastructure`,
      `&nbsp;`,
      `  Network engineer specialized in infrastructure deployment,`,
      `  enterprise networking and automation. Focused on building`,
      `  resilient, observable and secure environments, bridging`,
      `  traditional system administration with modern DevOps practices.`,
      `&nbsp;`,
      `  Operating personal lab environments to design, break and`,
      `  rebuild infrastructures continuously.`,
      `&nbsp;`,
    ];
    this._printLines(lines, 0, 25);
  }

  _cmd_whoami() {
    const lines = [
      `&nbsp;`,
      `<span class="t-green">Elio Dages</span>`,
      `uid=1000(ed) gid=1000(netops) groups=netops,sysadmin,automation`,
      `<span class="t-dim">// Network &amp; Infrastructure Engineer</span>`,
      `&nbsp;`,
    ];
    this._printLines(lines, 0, 30);
  }

  _cmd_career() {
    const root = this.rootPath;
    const lines = [
      `&nbsp;`,
      `<span class="t-accent">${this._t('terminal.cmd.career.header', '// CAREER & PROFESSIONAL JOURNEY')}</span>`,
      `&nbsp;`,
      `  Name   : <span class="t-green">${this._t('terminal.cmd.career.name', 'Elio Dages')}</span>`,
      `  Role   : ${this._t('terminal.cmd.career.role', 'Network & Infrastructure Engineer')}`,
      `  Edu    : ${this._t('terminal.cmd.career.edu', 'BTS SIO SISR → Bachelor BAIS (work-study)')}`,
      `  Exp    : ${this._t('terminal.cmd.career.exp', 'CPAGE — IT Infrastructure (work-study)')}`,
      `  Focus  : ${this._t('terminal.cmd.career.focus', 'Deployment automation, AD administration, GPO hardening')}`,
      `&nbsp;`,
      `  <span class="t-dim">${this._t('terminal.cmd.career.link', '→ Full profile at')} <a href="${root}career.html" class="t-accent">career</a></span>`,
      `&nbsp;`,
    ];
    this._printLines(lines, 0, 25);
  }

  _cmd_experience() {
    const root = this.rootPath;
    const lines = [
      `&nbsp;`,
      `<span class="t-accent">${this._t('terminal.cmd.experience.header', '// PROFESSIONAL EXPERIENCE')}</span>`,
      `&nbsp;`,
      `  <span class="t-green">[${this._t('terminal.cmd.experience.company', 'CPAGE')}]</span> — ${this._t('terminal.cmd.experience.role', 'IT Infrastructure Engineer (work-study)')}`,
      `&nbsp;`,
      `    ${this._t('terminal.cmd.experience.task1', '→ Workstation deployment automation (MDT / task sequences)')}`,
      `    ${this._t('terminal.cmd.experience.task2', '→ Windows 11 engineering, Active Directory administration')}`,
      `    ${this._t('terminal.cmd.experience.task3', '→ GPO hardening, user lifecycle management')}`,
      `    ${this._t('terminal.cmd.experience.task4', '→ Enterprise troubleshooting & documentation')}`,
      `&nbsp;`,
      `  <span class="t-dim">→ Full profile at <a href="${root}career.html" class="t-accent">career</a></span>`,
      `&nbsp;`,
    ];
    this._printLines(lines, 0, 25);
  }

  _cmd_expertise() {
    const root = this.rootPath;
    fetch(root + 'data/skills.json')
      .then(r => r.json())
      .then(data => {
        const lines = [`&nbsp;`, `<span class="t-accent">${this._t('terminal.cmd.expertise.header', '// DOMAINS OF OPERATION')}</span>`, `&nbsp;`];
        data.domains.forEach(d => {
          lines.push(`  <span class="t-green">[${d.name}]</span>`);
          d.items.forEach(item => lines.push(`    · ${item}`));
          lines.push(`&nbsp;`);
        });
        lines.push(`  <span class="t-dim">→ Details at <a href="${root}expertise.html" class="t-accent">expertise</a></span>`);
        lines.push(`&nbsp;`);
        this._printLines(lines, 0, 20);
      })
      .catch(() => {
        this._printLine(`<span class="t-error">Error: could not load skills data</span>`);
      });
  }

  _cmd_veille() {
    const root = this.rootPath;
    const lines = [
      `&nbsp;`,
      `<span class="t-accent">${this._t('terminal.cmd.veille.header', '// TECHNOLOGY WATCH')}</span>`,
      `&nbsp;`,
      `  · ${this._t('terminal.cmd.veille.topic1', 'Enterprise Infrastructure Evolution')}`,
      `  · ${this._t('terminal.cmd.veille.topic2', 'Cybersecurity & European Regulations (NIS2)')}`,
      `  · ${this._t('terminal.cmd.veille.topic3', 'Cloud & DevOps Transformation')}`,
      `  · ${this._t('terminal.cmd.veille.topic4', 'Personal Learning Methodology')}`,
      `&nbsp;`,
      `  <span class="t-dim">${this._t('terminal.cmd.veille.link', '→ Full research at')} <a href="${root}veille.html" class="t-accent">veille</a></span>`,
      `&nbsp;`,
    ];
    this._printLines(lines, 0, 25);
  }

  _cmd_skills() {
    const root = this.rootPath;
    fetch(root + 'data/skills.json')
      .then(r => r.json())
      .then(data => {
        const lines = [`&nbsp;`, `<span class="t-accent">// DOMAINS OF OPERATION</span>`, `&nbsp;`];
        data.domains.forEach(d => {
          lines.push(`  <span class="t-green">[${d.name}]</span>`);
          d.items.forEach(item => lines.push(`    · ${item}`));
          lines.push(`&nbsp;`);
        });
        this._printLines(lines, 0, 20);
      })
      .catch(() => {
        this._printLine(`<span class="t-error">Error: could not load skills data</span>`);
      });
  }

  _cmd_projects() {
    const root = this.rootPath;
    fetch(root + 'data/projects.json')
      .then(r => r.json())
      .then(data => {
        const lines = [`&nbsp;`, `<span class="t-accent">// ACTIVE PROJECTS</span>`, `&nbsp;`];
        data.forEach((p, i) => {
          lines.push(`  <span class="t-green">[${String(i + 1).padStart(2, '0')}]</span> <span class="t-cmd">${p.title}</span>`);
          lines.push(`       ${p.short}`);
          lines.push(`       Tags: <span class="t-dim">${p.tags.join(', ')}</span>`);
          lines.push(`&nbsp;`);
        });
        lines.push(`  <span class="t-dim">→ See full details at <a href="${root}projects.html" class="t-accent">projects</a></span>`);
        lines.push(`&nbsp;`);
        this._printLines(lines, 0, 20);
      })
      .catch(() => {
        this._printLine(`<span class="t-error">Error: could not load projects data</span>`);
      });
  }

  _cmd_lab() {
    const root = this.rootPath;
    const lines = [
      `&nbsp;`,
      `<span class="t-accent">// HOMELAB TOPOLOGY</span>`,
      `&nbsp;`,
      `  pfSense (firewall/router)`,
      `    ├─ VLAN 10 ADMIN    — management &amp; infrastructure services`,
      `    ├─ VLAN 20 USERS    — user workstations &amp; endpoints`,
      `    └─ VLAN 30 SERVERS  — Windows Server / Linux services`,
      `&nbsp;`,
      `  Services:`,
      `    · AD DS (Windows Server 2022)`,
      `    · GLPI (asset &amp; ticketing)`,
      `    · IPsec VPN (site-to-site)`,
      `    · Reverse Proxy (Nginx)`,
      `    · Prometheus / Grafana / Loki`,
      `&nbsp;`,
      `  <span class="t-dim">→ Interactive map at <a href="${root}lab.html" class="t-accent">lab</a></span>`,
      `&nbsp;`,
    ];
    this._printLines(lines, 0, 25);
  }

  _cmd_contact() {
    const lines = [
      `&nbsp;`,
      `<span class="t-accent">// CONTACT</span>`,
      `&nbsp;`,
      `  No direct contact form exposed.`,
      `&nbsp;`,
      `  This portfolio is a live infrastructure showcase.`,
      `  For professional inquiries, reach out via LinkedIn`,
      `  or GitHub (links visible in portfolio header).`,
      `&nbsp;`,
    ];
    this._printLines(lines, 0, 25);
  }

  _cmd_uptime() {
    const elapsed = Date.now() - this.startTime;
    const s = Math.floor(elapsed / 1000) % 60;
    const m = Math.floor(elapsed / 60000) % 60;
    const h = Math.floor(elapsed / 3600000);
    const upStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    this._printLines([
      `&nbsp;`,
      `  Session uptime: <span class="t-green">${upStr}</span>`,
      `  <span class="t-dim">${new Date().toISOString()}</span>`,
      `&nbsp;`,
    ], 0, 20);
  }

  _cmd_clear() {
    this.output.innerHTML = '';
  }
}

// Export for module environments (optional)
if (typeof module !== 'undefined') module.exports = EDOpsTerminal;
