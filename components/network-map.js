/**
 * ED-OPS Network Map Component
 * Renders an interactive SVG network topology for the lab page.
 * Usage: new EDOpsNetworkMap(containerEl)
 */

class EDOpsNetworkMap {
  constructor(container) {
    this.container = container;
    this.activeNode = null;

    this.nodes = [
      {
        id: 'pfsense',
        label: 'pfSense',
        sublabel: 'Firewall / Router',
        x: 0.5, y: 0.08,
        color: '#ff6b35',
        title: 'pfSense Firewall',
        details: [
          'Role: Perimeter firewall, inter-VLAN router, DHCP server',
          'Version: pfSense CE 2.7',
          'Interfaces: WAN (DHCP), LAN trunk (802.1Q)',
          'Features: VLAN tagging, firewall rules per segment, IPsec VPN, DNS resolver',
          'Monitoring: SNMP → Prometheus SNMP exporter',
        ],
        tags: ['Firewall', 'Router', 'DHCP', 'DNS'],
      },
      {
        id: 'vlan10',
        label: 'VLAN 10',
        sublabel: 'ADMIN',
        x: 0.18, y: 0.38,
        color: '#00ff88',
        title: 'VLAN 10 — Administration',
        details: [
          'Subnet: 10.10.10.0/24',
          'Purpose: Management plane — infrastructure hosts, PAW stations',
          'Access: Restricted; only admin accounts allowed',
          'Hosts: PAW workstations, pfSense management interface',
          'GPO: Tier 0 logon restrictions enforced',
        ],
        tags: ['Mgmt', 'Tier 0', 'Restricted'],
      },
      {
        id: 'vlan20',
        label: 'VLAN 20',
        sublabel: 'USERS',
        x: 0.5, y: 0.38,
        color: '#00b4d8',
        title: 'VLAN 20 — Users',
        details: [
          'Subnet: 10.10.20.0/24',
          'Purpose: Standard user workstations and endpoints',
          'Access: Internet allowed; server access restricted by firewall rules',
          'Hosts: Windows 10/11 workstations, domain-joined',
          'GPO: CIS Benchmark Level 1 applied',
        ],
        tags: ['Users', 'Workstations', 'Domain'],
      },
      {
        id: 'vlan30',
        label: 'VLAN 30',
        sublabel: 'SERVERS',
        x: 0.82, y: 0.38,
        color: '#ffd32a',
        title: 'VLAN 30 — Servers',
        details: [
          'Subnet: 10.10.30.0/24',
          'Purpose: Infrastructure services — AD, DNS, monitoring, ticketing',
          'Access: Admin-only from VLAN 10; user services exposed via reverse proxy',
          'Hosts: Windows Server 2022 (AD DS), Ubuntu (GLPI, monitoring stack)',
          'Hardening: SMB signing, NTLMv2 only, audit policies enabled',
        ],
        tags: ['Servers', 'AD DS', 'Monitoring'],
      },
      {
        id: 'adds',
        label: 'AD DS',
        sublabel: 'Domain Controller',
        x: 0.72, y: 0.62,
        color: '#00b4d8',
        title: 'Active Directory Domain Services',
        details: [
          'OS: Windows Server 2022',
          'Domain: lab.edops.local',
          'Roles: AD DS, DNS Server, AD Certificate Services',
          'Forest/Domain Level: Windows Server 2016',
          'PKI: Two-tier (Offline Root CA + Enterprise Issuing CA)',
          'Tier Model: Tier 0/1/2 separation enforced via GPO',
        ],
        tags: ['AD DS', 'DNS', 'PKI', 'Tier Model'],
      },
      {
        id: 'glpi',
        label: 'GLPI',
        sublabel: 'Asset & Ticketing',
        x: 0.92, y: 0.62,
        color: '#00b4d8',
        title: 'GLPI — IT Asset Management',
        details: [
          'OS: Ubuntu Server 22.04',
          'Role: Asset inventory, incident ticketing, change management',
          'Agents: GLPI Agent deployed via GPO on all Windows hosts',
          'Auth: LDAP integration with AD DS',
          'Access: Internal only (VLAN 30), exposed read-only via reverse proxy',
        ],
        tags: ['ITSM', 'CMDB', 'Ticketing'],
      },
      {
        id: 'vpn',
        label: 'VPN IPsec',
        sublabel: 'Site-to-Site',
        x: 0.08, y: 0.62,
        color: '#ff6b35',
        title: 'IPsec Site-to-Site VPN',
        details: [
          'Protocol: IKEv2 / IPsec',
          'Tunnel: pfSense Site A ↔ pfSense Site B',
          'Encryption: AES-256-GCM, SHA-256 integrity',
          'Purpose: Simulate multi-site enterprise WAN connectivity',
          'Monitoring: Tunnel state via SNMP + pfSense dashboard',
          'Policy: Least-privilege inter-site traffic rules',
        ],
        tags: ['IPsec', 'IKEv2', 'WAN', 'Encryption'],
      },
      {
        id: 'proxy',
        label: 'Reverse Proxy',
        sublabel: 'Nginx',
        x: 0.28, y: 0.62,
        color: '#00ff88',
        title: 'Reverse Proxy — Nginx',
        details: [
          'OS: Ubuntu Server 22.04',
          'Software: Nginx',
          'Role: TLS termination, internal service exposure, access control',
          'Certificates: Issued by internal PKI (AD CS)',
          'Services proxied: GLPI, Grafana, custom internal portals',
          'Security: HSTS, TLS 1.2+ only, rate limiting',
        ],
        tags: ['Nginx', 'TLS', 'Proxy', 'PKI'],
      },
    ];

    // Edges: [source_id, target_id]
    this.edges = [
      ['pfsense', 'vlan10'],
      ['pfsense', 'vlan20'],
      ['pfsense', 'vlan30'],
      ['vlan30', 'adds'],
      ['vlan30', 'glpi'],
      ['pfsense', 'vpn'],
      ['vlan30', 'proxy'],
    ];

    this._render();
    this._buildDetailPanel();
  }

  /* ---------- Render ---------- */

  _render() {
    this.container.classList.add('network-map-container');

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('viewBox', '0 0 1000 700');
    this.svg.setAttribute('role', 'img');
    this.svg.setAttribute('aria-label', 'Lab network topology diagram');
    this.svg.style.cssText = 'width:100%;height:auto;display:block;';

    // Defs (gradient, filter)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill="#30363d"/>
      </marker>
    `;
    this.svg.appendChild(defs);

    const W = 1000, H = 700;

    // Draw edges first (behind nodes)
    const edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    edgeGroup.setAttribute('class', 'edges');
    this.edges.forEach(([srcId, dstId]) => {
      const src = this.nodes.find(n => n.id === srcId);
      const dst = this.nodes.find(n => n.id === dstId);
      if (!src || !dst) return;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', src.x * W);
      line.setAttribute('y1', src.y * H);
      line.setAttribute('x2', dst.x * W);
      line.setAttribute('y2', dst.y * H);
      line.setAttribute('stroke', '#21262d');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('stroke-dasharray', '6 3');
      edgeGroup.appendChild(line);
    });
    this.svg.appendChild(edgeGroup);

    // Draw nodes
    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodeGroup.setAttribute('class', 'nodes');

    this.nodes.forEach(node => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'node');
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', node.title);
      g.style.cursor = 'pointer';

      const cx = node.x * W;
      const cy = node.y * H;

      // Outer ring (glow when active)
      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('cx', cx);
      ring.setAttribute('cy', cy);
      ring.setAttribute('r', 34);
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', node.color);
      ring.setAttribute('stroke-width', '1');
      ring.setAttribute('opacity', '0.25');
      ring.classList.add('node-ring');
      g.appendChild(ring);

      // Main circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);
      circle.setAttribute('r', 28);
      circle.setAttribute('fill', '#0d1117');
      circle.setAttribute('stroke', node.color);
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('filter', 'url(#glow)');
      g.appendChild(circle);

      // Label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', cx);
      label.setAttribute('y', cy - 2);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('fill', node.color);
      label.setAttribute('font-size', '11');
      label.setAttribute('font-family', "'JetBrains Mono', monospace");
      label.setAttribute('font-weight', '700');
      label.textContent = node.label;
      g.appendChild(label);

      const sublabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      sublabel.setAttribute('x', cx);
      sublabel.setAttribute('y', cy + 12);
      sublabel.setAttribute('text-anchor', 'middle');
      sublabel.setAttribute('fill', '#8b949e');
      sublabel.setAttribute('font-size', '8.5');
      sublabel.setAttribute('font-family', "'JetBrains Mono', monospace");
      sublabel.textContent = node.sublabel;
      g.appendChild(sublabel);

      // Hover / click
      g.addEventListener('click', () => this._selectNode(node, g));
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._selectNode(node, g); }
      });

      g.style.transition = 'opacity 0.2s';
      nodeGroup.appendChild(g);
      node._el = g;
    });

    this.svg.appendChild(nodeGroup);
    this.container.appendChild(this.svg);
  }

  /* ---------- Detail Panel ---------- */

  _buildDetailPanel() {
    this.panel = document.createElement('div');
    this.panel.className = 'network-detail-panel';
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-modal', 'false');
    this.panel.setAttribute('aria-label', 'Node details');
    this.panel.hidden = true;
    this.panel.innerHTML = `
      <div class="ndp-header">
        <span class="ndp-title">Node Details</span>
        <button class="ndp-close" aria-label="Close details">&times;</button>
      </div>
      <div class="ndp-body">
        <h3 class="ndp-node-title"></h3>
        <div class="ndp-tags"></div>
        <ul class="ndp-details"></ul>
      </div>
    `;
    this.panel.querySelector('.ndp-close').addEventListener('click', () => this._deselectNode());
    this.container.appendChild(this.panel);
  }

  _selectNode(node, el) {
    // Deselect previous
    this.nodes.forEach(n => {
      if (n._el) {
        n._el.querySelector('.node-ring').setAttribute('opacity', '0.25');
        n._el.querySelector('circle:nth-child(2)').setAttribute('stroke-width', '2');
      }
    });

    this.activeNode = node;

    // Highlight active
    el.querySelector('.node-ring').setAttribute('opacity', '0.7');
    el.querySelector('circle:nth-child(2)').setAttribute('stroke-width', '3');

    // Populate panel
    this.panel.querySelector('.ndp-node-title').textContent = node.title;
    const tagsEl = this.panel.querySelector('.ndp-tags');
    tagsEl.innerHTML = node.tags.map(t => `<span class="tag cyan">${t}</span>`).join(' ');

    const detailsEl = this.panel.querySelector('.ndp-details');
    detailsEl.innerHTML = node.details.map(d => `<li>${d}</li>`).join('');

    this.panel.hidden = false;
  }

  _deselectNode() {
    this.activeNode = null;
    this.nodes.forEach(n => {
      if (n._el) {
        n._el.querySelector('.node-ring').setAttribute('opacity', '0.25');
        n._el.querySelector('circle:nth-child(2)').setAttribute('stroke-width', '2');
      }
    });
    this.panel.hidden = true;
  }
}

if (typeof module !== 'undefined') module.exports = EDOpsNetworkMap;
