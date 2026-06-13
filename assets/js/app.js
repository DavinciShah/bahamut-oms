const PAGE_MAP = {
  dashboard: { file: 'index.html', label: 'Command Deck', icon: '🏰', intro: 'Executive overview of active builds, agent resources, project health, and operations.' },
  orders: { file: 'orders.html', label: 'Projects', icon: '📦', intro: 'Manage active software projects, track build pipelines, and monitor delivery SLAs.' },
  inventory: { file: 'inventory.html', label: 'Agent Pool', icon: '🤖', intro: 'Track agent utilization, model parameters, allocation, and readiness.' },
  analytics: { file: 'analytics.html', label: 'Performance Metrics', icon: '📈', intro: 'See agent velocity, code quality indices, and resource efficiency.' },
  reports: { file: 'reports.html', label: 'Build Logs', icon: '🧾', intro: 'Save, run, and export build logs and audit reports for system reviews.' },
  integrations: { file: 'integrations.html', label: 'Toolchains', icon: '🔌', intro: 'Connect code repos, deployment hosting, and alerting tools from one control center.' },
  billing: { file: 'billing.html', label: 'Resource Center', icon: '💳', intro: 'Review compute token allocations, agent plans, usage billing, and credits.' },
  shipping: { file: 'shipping.html', label: 'Deployment Hub', icon: '🚚', intro: 'Trigger deploys, watch live build outputs, and monitor package milestones across hostings.' },
  support: { file: 'support.html', label: 'Issue Tracker', icon: '🛟', intro: 'Triage project issues, track bugs, and coordinate agent task breakdowns.' },
  bi: { file: 'bi.html', label: 'AI Intelligence', icon: '🐉', intro: 'Explore predictive timelines, codebase anomalies, and intelligence signals.' },
  settings: { file: 'settings.html', label: 'Workspace Config', icon: '⚙️', intro: 'Configure agent settings, team access rights, alert rules, and security.' },
};

const STORAGE_KEY = 'vibe-agent-studio-v1';
const SEARCH_PLACEHOLDER = 'Search projects, agents, build logs, toolchains...';
const viewState = {
  notificationOpen: false,
  mobileNavOpen: false,
  billingTab: 'subscription',
  shippingTab: 'shipments',
  supportTab: 'tickets',
  biTab: 'overview',
  settingsTab: 'general',
  analyticsRange: '30d',
  reportResultId: null,
  orderSearch: '',
  orderStatus: 'all',
};

const defaultState = {
  company: { name: 'Vibe Agent Studio', tier: 'Autonomous Builder Deck', uptime: '99.99%' },
  orders: [ // Projects
    { id: 'PRJ-30101', customer: 'Idle Eco-Tycoon', channel: 'Web App', status: 'pending', value: 124500, createdAt: '2026-06-12T09:40:00Z', priority: 'High', warehouse: 'Dev Cluster A', items: 16 },
    { id: 'PRJ-30102', customer: 'Idle Miner', channel: 'Desktop', status: 'picking', value: 86200, createdAt: '2026-06-12T12:10:00Z', priority: 'Medium', warehouse: 'Dev Cluster B', items: 8 },
    { id: 'PRJ-30103', customer: 'Cleanup Crew', channel: 'Mobile App', status: 'packed', value: 54600, createdAt: '2026-06-12T14:05:00Z', priority: 'Low', warehouse: 'Dev Cluster A', items: 12 },
    { id: 'PRJ-30104', customer: 'De Vibe Idle Army', channel: 'Desktop', status: 'shipped', value: 244000, createdAt: '2026-06-11T16:20:00Z', priority: 'High', warehouse: 'Prod Cluster A', items: 32 },
    { id: 'PRJ-30105', customer: 'DigitalPlat FreeDomain', channel: 'Web App', status: 'delayed', value: 78800, createdAt: '2026-06-11T18:50:00Z', priority: 'High', warehouse: 'Dev Cluster B', items: 24 },
    { id: 'PRJ-30106', customer: 'Vibe Landing Page', channel: 'Web App', status: 'delivered', value: 36800, createdAt: '2026-06-10T08:10:00Z', priority: 'Low', warehouse: 'Prod Cluster A', items: 6 },
  ],
  inventory: [ // Agent Pool
    { sku: 'AGT-BLD-3.5', product: 'Vibe Builder (Claude 3.5 Sonnet)', warehouse: 'Dev Cluster A', onHand: 4, reorderPoint: 5, inbound: 1, status: 'healthy', category: 'Development' },
    { sku: 'AGT-TSR-1.5', product: 'Vibe Tester (Gemini 1.5 Pro)', warehouse: 'Dev Cluster B', onHand: 2, reorderPoint: 4, inbound: 2, status: 'low', category: 'QA/Testing' },
    { sku: 'AGT-DSN-4o', product: 'Vibe Designer (GPT-4o)', warehouse: 'Dev Cluster A', onHand: 1, reorderPoint: 3, inbound: 1, status: 'critical', category: 'UX/UI' },
    { sku: 'AGT-DOC-LLM', product: 'Vibe DocWriter (Llama 3 70B)', warehouse: 'Prod Cluster A', onHand: 6, reorderPoint: 5, inbound: 0, status: 'healthy', category: 'Documentation' },
    { sku: 'AGT-REF-03', product: 'Vibe Refactorer (Codestral)', warehouse: 'Dev Cluster A', onHand: 1, reorderPoint: 3, inbound: 2, status: 'critical', category: 'Refactoring' },
    { sku: 'AGT-OPS-K8S', product: 'Vibe SysOps (Claude 3 Haiku)', warehouse: 'Dev Cluster B', onHand: 3, reorderPoint: 4, inbound: 1, status: 'healthy', category: 'DevOps' },
  ],
  analytics: {
    revenue: [ // Builds Run per Month
      { label: 'Oct', value: 68 }, { label: 'Nov', value: 71 }, { label: 'Dec', value: 78 }, { label: 'Jan', value: 84 },
      { label: 'Feb', value: 89 }, { label: 'Mar', value: 95 }, { label: 'Apr', value: 102 }, { label: 'May', value: 108 },
    ],
    channels: [ // Platform mix
      { name: 'Web App', share: 34, revenue: 3850000 },
      { name: 'Desktop', share: 26, revenue: 2940000 },
      { name: 'Mobile App', share: 18, revenue: 2030000 },
      { name: 'API Services', share: 14, revenue: 1580000 },
      { name: 'Integrations', share: 8, revenue: 910000 },
    ],
  },
  reports: [
    { id: 'LOG-1001', name: 'Build SLA Summary', type: 'Operations', cadence: 'Weekly', lastRun: '2026-06-12T09:00:00Z' },
    { id: 'LOG-1002', name: 'Agent Utilization Pulse', type: 'Performance', cadence: 'Daily', lastRun: '2026-06-13T05:30:00Z' },
    { id: 'LOG-1003', name: 'Code Quality Risk Scan', type: 'Testing', cadence: 'Daily', lastRun: '2026-06-13T06:00:00Z' },
  ],
  integrations: [ // Toolchains
    { id: 'TL-11', name: 'GitHub Monorepo', type: 'Repository', provider: 'GitHub', status: 'active', lastSync: '2026-06-13T06:42:00Z', records: 412 },
    { id: 'TL-12', name: 'Vercel Deployment', type: 'Hosting', provider: 'Vercel', status: 'active', lastSync: '2026-06-13T06:37:00Z', records: 788 },
    { id: 'TL-13', name: 'Sentry Analytics', type: 'Logging', provider: 'Sentry', status: 'attention', lastSync: '2026-06-12T21:12:00Z', records: 121 },
    { id: 'TL-14', name: 'Slack Alerts Channel', type: 'Notifications', provider: 'Slack', status: 'draft', lastSync: null, records: 0 },
  ],
  integrationLog: [
    { stamp: '2026-06-13T06:42:00Z', detail: 'GitHub Monorepo synced 412 code commits.' },
    { stamp: '2026-06-13T06:37:00Z', detail: 'Vercel Deployment triggered 788 automatic builds.' },
    { stamp: '2026-06-12T21:12:00Z', detail: 'Sentry Analytics reported 3 recoverable production warnings.' },
  ],
  subscription: { plan: 'Enterprise Team', status: 'active', seats: 38, renewal: '2026-07-01', monthly: 148500, credits: 9 }, // credits = 9 Million tokens
  invoices: [
    { id: 'INV-5401', amount: 148500, dueDate: '2026-07-01', status: 'Upcoming' },
    { id: 'INV-5391', amount: 148500, dueDate: '2026-06-01', status: 'Paid' },
    { id: 'INV-5381', amount: 129900, dueDate: '2026-05-01', status: 'Paid' },
  ],
  payments: [
    { date: '2026-06-01T04:10:00Z', method: 'Corporate Visa', amount: 148500, status: 'Captured' },
    { date: '2026-05-01T04:08:00Z', method: 'Corporate Visa', amount: 129900, status: 'Captured' },
    { date: '2026-04-01T03:55:00Z', method: 'Bank Transfer', amount: 129900, status: 'Captured' },
  ],
  shipments: [ // Deployment pipelines
    { id: 'DEP-3012', orderId: 'PRJ-30104', carrier: 'GitHub Actions', status: 'in_transit', eta: '2026-06-14', tracking: 'commit-d39b417', origin: 'GitHub Main', destination: 'Vercel Prod' },
    { id: 'DEP-3013', orderId: 'PRJ-30103', carrier: 'App Store Connect', status: 'label_created', eta: '2026-06-15', tracking: 'commit-l918273', origin: 'Unity Build', destination: 'iOS Beta' },
    { id: 'DEP-3014', orderId: 'PRJ-30102', carrier: 'Electron Builder', status: 'ready_for_pickup', eta: '2026-06-14', tracking: 'commit-e138762', origin: 'Electron Main', destination: 'Win Installer' },
  ],
  tracking: { // Build steps
    'commit-d39b417': ['Commit push detected · 13 Jun, 09:12', 'Install dependencies complete · 13 Jun, 10:05', 'Vite build succeeded & assets bundled · 13 Jun, 15:40'],
    'commit-l918273': ['Commit push detected · 13 Jun, 11:22', 'Awaiting Unity build runner queue · 13 Jun, 14:10'],
    'commit-e138762': ['Code signing certificates loaded · 13 Jun, 10:20', 'Windows executable compiler running · 13 Jun, 11:15'],
  },
  tickets: [ // Bug Tracker / Backlog
    { id: 'BUG-901', subject: 'Heap memory leak in Idle Miner main loop', priority: 'Critical', status: 'Open', owner: 'Builder Agent', updatedAt: '2026-06-13T06:14:00Z', notes: 'Cycle count memory allocations spike when canvas redrawing is active.' },
    { id: 'BUG-902', subject: 'Docker container crash in Cleanup Crew API', priority: 'High', status: 'Investigating', owner: 'Tester Agent', updatedAt: '2026-06-13T04:52:00Z', notes: 'Database connections timing out on third retry pool; checking webhook logs.' },
    { id: 'BUG-903', subject: 'Asset compression failure in De Vibe Idle Army', priority: 'Medium', status: 'Pending Customer', owner: 'Designer Agent', updatedAt: '2026-06-12T19:05:00Z', notes: 'Need updated high-res texture formats from UX design assets.' },
  ],
  knowledgeBase: [
    { title: 'Optimizing token usage during multi-agent code generations', topic: 'Performance', readTime: '4 min' },
    { title: 'Tuning Llama 3 parameters for consistent documentation formats', topic: 'Agent Pool', readTime: '6 min' },
    { title: 'Setting up GitHub Actions pipeline hooks for dev branch deploys', topic: 'Deployment', readTime: '5 min' },
  ],
  notifications: [
    { id: 'NT-1', title: 'Critical memory leak detected', body: 'Idle Miner heap memory usage exceeded threshold in Dev Cluster A.', read: false, stamp: '2026-06-13T06:15:00Z' },
    { id: 'NT-2', title: 'Compute billing warning', body: 'Compute credits renewal in 18 days on 01 Jul 2026.', read: false, stamp: '2026-06-13T05:55:00Z' },
    { id: 'NT-3', title: 'Vercel deploy complete', body: '788 frontend bundle assets deployed successfully to production.', read: true, stamp: '2026-06-13T06:37:00Z' },
    { id: 'NT-4', title: 'Issue assigned to Builder Agent', body: 'BUG-901 assigned to Claude 3.5 Sonnet for automatic resolution.', read: true, stamp: '2026-06-13T06:20:00Z' },
  ],
  settings: {
    timezone: 'Asia/Kolkata',
    currency: 'USD',
    notificationEmail: 'operators@vibeagentstudio.com',
    supportPhone: '+91 22 5555 0101',
    domain: 'console.vibeagentstudio.com',
    mfa: true,
    alertDigest: 'twice-daily',
  },
  team: [
    { name: 'Akshay Kumar', role: 'Chief Operator', email: 'akshay@vibeagentstudio.com', status: 'Active' },
    { name: 'Aarya Shah', role: 'Human in the Loop', email: 'aarya@vibeagentstudio.com', status: 'Active' },
    { name: 'Kabir Nanda', role: 'Product Lead', email: 'kabir@vibeagentstudio.com', status: 'Invited' },
  ],
};

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const isRegistered = localStorage.getItem('devibe-oms-registered') === 'true';
    const profile = JSON.parse(localStorage.getItem('devibe-oms-current-user') || 'null');
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    
    let activeState;
    if (parsed && typeof parsed === 'object') {
      activeState = parsed;
    } else {
      activeState = deepClone(defaultState);
    }

    if (isRegistered && profile) {
      activeState.company.name = profile.company;
      activeState.company.tier = 'Autonomous Builder Deck (Active User)';
      activeState.userProfile = profile;
      
      const cleanMode = localStorage.getItem('devibe-oms-clean-mode') !== 'false';
      if (cleanMode) {
        activeState.orders = [];
        activeState.inventory = [];
        activeState.notifications = [
          { id: 'NT-WELCOME', title: 'Welcome to Vibe Agent Studio!', body: 'Your new clean workspace dashboard is active. You can register projects or allocate agents from the menu.', read: false, stamp: new Date().toISOString() }
        ];
        activeState.shipments = [];
        activeState.tickets = [];
        activeState.integrations = [];
        activeState.integrationLog = [];
      }
    }
    return activeState;
  } catch {
    return deepClone(defaultState);
  }
}

let state = loadState();
const pageKey = document.body.dataset.page || 'dashboard';
const pageMeta = PAGE_MAP[pageKey] || PAGE_MAP.dashboard;

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetState() {
  localStorage.setItem('devibe-oms-clean-mode', 'false');
  state = deepClone(defaultState);
  persist();
  renderCurrentPage();
  showToast('Standard pre-seeded workspace loaded.');
}

window.logoutStaticUser = function() {
  localStorage.removeItem('devibe-oms-registered');
  localStorage.removeItem('devibe-oms-current-user');
  localStorage.removeItem('devibe-oms-clean-mode');
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function formatCurrency(value) {
  const curr = state.settings.currency || 'USD';
  const locale = curr === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatDate(value, withTime = false) {
  if (!value) return '—';
  const options = withTime
    ? { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' };
  return new Intl.DateTimeFormat('en-IN', options).format(new Date(value));
}

function statusTone(status) {
  const lookup = {
    active: 'success', healthy: 'success', delivered: 'success', paid: 'success', captured: 'success', invited: 'warning', open: 'danger', critical: 'danger', delayed: 'danger', attention: 'warning', low: 'warning', upcoming: 'warning', pending: 'warning', pending_customer: 'warning', picking: 'info', packed: 'info', shipped: 'info', investigating: 'info', draft: 'info', label_created: 'info', ready_for_pickup: 'warning', in_transit: 'info', success: 'success'
  };
  return lookup[String(status || '').toLowerCase().replace(/\s+/g, '_')] || 'info';
}

function countUnread() {
  return state.notifications.filter((item) => !item.read).length;
}

function computeStats() {
  const totalRevenue = state.orders.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const delayedOrders = state.orders.filter((item) => item.status === 'delayed').length;
  const lowStock = state.inventory.filter((item) => item.status !== 'healthy').length;
  const activeIntegrations = state.integrations.filter((item) => item.status === 'active').length;
  return { totalRevenue, delayedOrders, lowStock, activeIntegrations };
}

// Visual status display mappings for the AI Agent Studio concept
function displayProjectStatus(status) {
  const mapping = {
    pending: 'Queued',
    picking: 'Generating',
    packed: 'Testing',
    shipped: 'Deploying',
    delayed: 'Error',
    delivered: 'Stable'
  };
  return mapping[status] || status;
}

function displayAgentStatus(status) {
  const mapping = {
    healthy: 'Optimal',
    low: 'Idle',
    critical: 'Overloaded'
  };
  return mapping[status] || status;
}

function displayToolStatus(status) {
  const mapping = {
    active: 'Connected',
    attention: 'Error',
    draft: 'Inactive'
  };
  return mapping[status] || status;
}

function displayDeployStatus(status) {
  const mapping = {
    in_transit: 'Deploying',
    label_created: 'Queued',
    ready_for_pickup: 'Verifying',
    delivered: 'Active'
  };
  return mapping[status] || status;
}

function displayBugStatus(status) {
  const mapping = {
    'Open': 'Open',
    'Investigating': 'Analyzing',
    'Pending Customer': 'Blocked'
  };
  return mapping[status] || status;
}

function notificationMarkup() {
  const unread = countUnread();
  return `
    <div class="panel-header">
      <div>
        <h3 class="panel-title">Workspace Alerts</h3>
        <div class="tiny">${unread} unread updates across the builder deck.</div>
      </div>
      <button class="ghost-button" id="mark-all-read">Mark all read</button>
    </div>
    <div class="activity-list">
      ${state.notifications.map((item) => `
        <div class="activity-item">
          <div class="item-row">
            <strong>${escapeHtml(item.title)}</strong>
            <span class="status-pill ${item.read ? 'info' : 'danger'}">${item.read ? 'Seen' : 'New'}</span>
          </div>
          <p class="subtle">${escapeHtml(item.body)}</p>
          <div class="tiny">${formatDate(item.stamp, true)}</div>
        </div>`).join('')}
    </div>`;
}

function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.innerHTML = `
    <div class="sidebar-header">
      <svg class="brand-logo" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="shield" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#1e293b" />
          </linearGradient>
          <linearGradient id="flame" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#3b82f6" />
            <stop offset="100%" stop-color="#1d4ed8" />
          </linearGradient>
        </defs>
        <path d="M64 8 108 28v31c0 29-18 49-44 61C38 108 20 88 20 59V28L64 8Z" fill="url(#shield)" stroke="#3b82f6" stroke-width="4"/>
        <path d="M77 28c-8 0-16 5-21 13 5-2 10-2 14 0-12 4-22 18-22 32 0 10 6 18 16 23-5-7-5-13-2-18 3 7 9 11 18 12-5-5-7-10-7-15 0-10 8-14 15-19 8-6 12-13 11-28-2 4-5 6-8 7 0-4-6-7-14-7Z" fill="url(#flame)"/>
        <circle cx="76" cy="43" r="3" fill="#fff1f2"/>
      </svg>
      <div class="brand-copy">
        <strong>Vibe Agent Studio</strong>
        <span>Autonomous Builder Deck</span>
      </div>
    </div>
    <div class="sidebar-section-title">Navigation Panel</div>
    <nav class="nav-links">
      ${Object.entries(PAGE_MAP).map(([key, page]) => `
        <a class="nav-link ${key === pageKey ? 'active' : ''}" href="${page.file}">
          <span class="nav-icon">${page.icon}</span>
          <span>${page.label}</span>
        </a>`).join('')}
    </nav>
    <div class="sidebar-footer">
      <div class="mini-card">
        ${state.userProfile ? `
          <div class="tiny" style="color: var(--primary); font-weight: 600;">OPERATOR SESSION</div>
          <div class="value" style="font-size: 1.1rem; margin: 6px 0 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 700; color: var(--text-base);">${escapeHtml(state.userProfile.name)}</div>
          <div class="subtle" style="font-size: 0.75rem; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(state.userProfile.email)}</div>
          <button class="danger-button" style="margin-top: 4px; width: 100%; font-size: 0.75rem; padding: 6px 12px; border-radius: 6px;" onclick="logoutStaticUser()">Logout</button>
        ` : `
          <div class="tiny">Builder Uptime</div>
          <div class="value" style="font-size: 1.2rem; margin: 4px 0;">${escapeHtml(state.company.uptime)}</div>
          <a class="primary-button" href="signup.html" style="margin-top: 8px; width: 100%; font-size: 0.75rem; padding: 8px 12px; text-align: center; text-decoration: none; display: block; border-radius: 6px; box-sizing: border-box;">Create Workspace</a>
        `}
      </div>
    </div>`;
}

function renderHeader() {
  const header = document.getElementById('topbar');
  header.innerHTML = `
    <div class="topbar-left">
      <button class="mobile-menu" id="mobile-menu" aria-label="Toggle navigation">☰</button>
      <div class="topbar-copy">
        <h1>${escapeHtml(pageMeta.label)}</h1>
        <p>${escapeHtml(pageMeta.intro)}</p>
      </div>
    </div>
    <div class="topbar-right">
      <label class="search-shell" aria-label="Global search">
        <span>⌕</span>
        <input id="global-search" type="search" placeholder="${SEARCH_PLACEHOLDER}" />
      </label>
      <button class="icon-button" id="notifications-button" aria-label="Open notifications">🔔${countUnread() ? `<span class="badge-count">${countUnread()}</span>` : ''}</button>
      <button class="primary-button" id="reset-demo">Reset Deck</button>
    </div>`;

  const drawer = document.getElementById('notification-drawer');
  drawer.className = `notification-drawer ${viewState.notificationOpen ? 'open' : ''}`;
  drawer.innerHTML = notificationMarkup();
}

function statCard(label, value, note, tone = 'info') {
  return `<div class="stat-card"><span class="status-pill ${tone}">${label}</span><div class="value">${value}</div><div class="subtle">${note}</div></div>`;
}

function miniProjectRows(limit = 5) {
  return state.orders.slice(0, limit).map((order) => `
    <div class="list-item">
      <div class="item-row">
        <strong>${escapeHtml(order.customer)}</strong>
        <span class="status-pill ${statusTone(order.status)}">${escapeHtml(displayProjectStatus(order.status))}</span>
      </div>
      <div class="subtle">${escapeHtml(order.id)} · ${escapeHtml(order.channel)} · ${formatCurrency(order.value)} token budget</div>
    </div>`).join('');
}

function agentAlertRows() {
  return state.inventory.filter((item) => item.status !== 'healthy').map((item) => `
    <div class="activity-item">
      <div class="item-row">
        <strong>${escapeHtml(item.product)}</strong>
        <span class="status-pill ${statusTone(item.status)}">${escapeHtml(displayAgentStatus(item.status))}</span>
      </div>
      <div class="subtle">${escapeHtml(item.sku)} · Running on ${escapeHtml(item.warehouse)} · limit capacity at ${item.reorderPoint}</div>
    </div>`).join('') || '<div class="empty-state center">All agent nodes are running optimally.</div>';
}

function renderDashboard() {
  const stats = computeStats();
  return `
    <section class="page-intro">
      <div>
        <h2>Autonomous Agent Control Deck</h2>
        <p>Keep codebase repositories, deployment pipelines, resource billing, and bug trackers synchronized from a single deck.</p>
      </div>
      <div class="page-actions">
        <a class="secondary-button" href="reports.html">Build Logs</a>
        <a class="primary-button" href="orders.html">Register Project</a>
      </div>
    </section>
    <section class="kpi-grid">
      ${statCard('Active Projects', state.orders.length, 'Live project codebases under development.', 'info')}
      ${statCard('Tokens Consumed', formatCurrency(stats.totalRevenue), 'Equivalent compute credit value used.', 'success')}
      ${statCard('Build Errors', stats.delayedOrders, 'Unresolved compile/test errors in queue.', 'danger')}
      ${statCard('Idle Agents', stats.lowStock, `${stats.activeIntegrations} deployment tools active.`, 'warning')}
    </section>
    <section class="content-grid" style="margin-top:16px;">
      <div class="panel">
        <div class="panel-header">
          <div>
            <h3 class="panel-title">Builder Modules</h3>
            <div class="tiny">Jump directly to agentic workflows.</div>
          </div>
        </div>
        <div class="triple-grid">
          ${['orders', 'inventory', 'shipping', 'billing', 'support', 'settings'].map((key) => `
            <a class="mini-card" href="${PAGE_MAP[key].file}">
              <div class="item-row"><strong>${PAGE_MAP[key].label}</strong><span>${PAGE_MAP[key].icon}</span></div>
              <p class="subtle">${PAGE_MAP[key].intro}</p>
            </a>`).join('')}
        </div>
      </div>
      <div class="panel">
        <div class="panel-header"><h3 class="panel-title">System Alerts</h3><span class="tiny">Tap bell for full list</span></div>
        <div class="activity-list">${state.notifications.slice(0, 3).map((item) => `<div class="activity-item"><strong>${escapeHtml(item.title)}</strong><div class="subtle">${escapeHtml(item.body)}</div></div>`).join('')}</div>
      </div>
    </section>
    <section class="dual-grid" style="margin-top:16px;">
      <div class="panel">
        <div class="panel-header"><h3 class="panel-title">Active projects</h3><a class="ghost-button" href="orders.html">View all</a></div>
        <div class="list">${miniProjectRows()}</div>
      </div>
      <div class="panel">
        <div class="panel-header"><h3 class="panel-title">Agent utilization warning</h3><a class="ghost-button" href="inventory.html">Open pool</a></div>
        <div class="activity-list">${agentAlertRows()}</div>
      </div>
    </section>
    <section class="dual-grid" style="margin-top:16px;">
      <div class="chart-panel">
        <div class="panel-header"><h3 class="panel-title">Build output momentum</h3><span class="status-pill success">+12.4% builds</span></div>
        <div class="spark-grid">${state.analytics.revenue.map((point) => `<div class="spark-bar" style="height:${point.value * 1.3}px"><span>${escapeHtml(point.label)}</span></div>`).join('')}</div>
      </div>
      <div class="panel">
        <div class="panel-header"><h3 class="panel-title">Scheduled Agent Queue</h3><span class="tiny">Automated studio workflow</span></div>
        <div class="timeline">
          <div class="timeline-item"><strong>10:00 AM</strong><div class="subtle">Run automated test suite for Idle Miner</div></div>
          <div class="timeline-item"><strong>11:30 AM</strong><div class="subtle">Triage build failure in Cleanup Crew</div></div>
          <div class="timeline-item"><strong>02:00 PM</strong><div class="subtle">Deploy new release of De Vibe Idle Army</div></div>
          <div class="timeline-item"><strong>04:15 PM</strong><div class="subtle">Sync codebase documentation for Idle Eco-Tycoon</div></div>
        </div>
      </div>
    </section>`;
}

function renderOrders() {
  const filtered = state.orders.filter((order) => {
    const matchesSearch = !viewState.orderSearch || [order.id, order.customer, order.channel, order.warehouse].join(' ').toLowerCase().includes(viewState.orderSearch.toLowerCase());
    const matchesStatus = viewState.orderStatus === 'all' || order.status === viewState.orderStatus;
    return matchesSearch && matchesStatus;
  });
  return `
    <section class="page-intro">
      <div><h2>Project Cockpit</h2><p>Search, filter, and register new codebases inside your local agent workspace.</p></div>
      <div class="page-actions"><button class="primary-button" id="open-order-modal">+ Register Project</button></div>
    </section>
    <section class="toolbar panel">
      <div class="form-grid">
        <div class="form-field"><label for="orders-search">Search Project</label><input id="orders-search" type="search" value="${escapeHtml(viewState.orderSearch)}" placeholder="Project ID, name, channel platform" /></div>
        <div class="form-field"><label for="orders-status">Build Status</label><select id="orders-status"><option value="all">All statuses</option>${['pending','picking','packed','shipped','delayed','delivered'].map((item) => `<option value="${item}" ${viewState.orderStatus === item ? 'selected' : ''}>${displayProjectStatus(item)}</option>`).join('')}</select></div>
      </div>
    </section>
    <section class="table-shell" style="margin-top:16px;">
      <div class="panel-header"><div><h3 class="panel-title">Active Project List</h3><div class="tiny">${filtered.length} projects registered</div></div></div>
      <table>
        <thead><tr><th>Project</th><th>Branding & Platform</th><th>Build Status</th><th>Cluster Node</th><th>Compute Cost</th><th>Actions</th></tr></thead>
        <tbody>
          ${filtered.map((order) => `
            <tr>
              <td><strong>${escapeHtml(order.id)}</strong><div class="tiny">Added ${formatDate(order.createdAt, true)}</div></td>
              <td>${escapeHtml(order.customer)}<div class="tiny">${escapeHtml(order.channel)} · ${order.items} files changed</div></td>
              <td><span class="status-pill ${statusTone(order.status)}">${escapeHtml(displayProjectStatus(order.status))}</span></td>
              <td>${escapeHtml(order.warehouse)}<div class="tiny">Priority ${escapeHtml(order.priority)}</div></td>
              <td>${formatCurrency(order.value)}</td>
              <td><div class="table-actions"><button class="ghost-button" data-action="advance-order" data-id="${order.id}">Advance Build</button><button class="secondary-button" data-action="view-order" data-id="${order.id}">Logs</button></div></td>
            </tr>`).join('') || '<tr><td colspan="6" class="center subtle">No projects match this filter.</td></tr>'}
        </tbody>
      </table>
    </section>
    <section class="dual-grid" style="margin-top:16px;">
      <div class="panel"><div class="panel-header"><h3 class="panel-title">Build Phase Readiness</h3></div><div class="chart">${['Awaiting Prompts','Generating Code','Testing Builds','Deployed'].map((label, index) => `<div class="chart-row"><strong>${label}</strong><div class="chart-track"><div class="chart-bar" style="width:${[62,74,58,18][index]}%"></div></div><span>${[62,74,58,18][index]}%</span></div>`).join('')}</div></div>
      <div class="panel"><div class="panel-header"><h3 class="panel-title">High-Priority Builds</h3></div><div class="list">${state.orders.filter((order) => order.priority === 'High').map((order) => `<div class="list-item"><div class="item-row"><strong>${escapeHtml(order.customer)}</strong><span class="status-pill ${statusTone(order.status)}">${escapeHtml(displayProjectStatus(order.status))}</span></div><div class="subtle">${escapeHtml(order.id)} · compute cost ${formatCurrency(order.value)}</div></div>`).join('')}</div></div>
    </section>`;
}

function renderInventory() {
  const inventory = state.inventory;
  return `
    <section class="page-intro"><div><h2>Agent Pool Command</h2><p>Allocate compute allocation and model parameters across development, QA, designer, and DevOps agents.</p></div><div class="page-actions"><button class="primary-button" id="open-restock-modal">Allocate Agent</button></div></section>
    <section class="kpi-grid">
      ${statCard('Total Agents', inventory.length, 'Compute model nodes configured.', 'info')}
      ${statCard('Idle Nodes', inventory.filter((item) => item.status === 'low').length, 'Awaiting task allocation.', 'warning')}
      ${statCard('Overloaded Nodes', inventory.filter((item) => item.status === 'critical').length, 'Compute capacity limit reached.', 'danger')}
      ${statCard('Queued Tasks', inventory.reduce((sum, item) => sum + item.inbound, 0), 'Tasks allocated in pipeline.', 'success')}
    </section>
    <section class="table-shell" style="margin-top:16px;">
      <div class="panel-header"><div><h3 class="panel-title">Agent Node Positions</h3><div class="tiny">Agent status overview</div></div></div>
      <table>
        <thead><tr><th>Agent Model SKU</th><th>Agent Class / Node</th><th>Cluster Node</th><th>Active Tasks</th><th>Max capacity</th><th>Queued Tasks</th><th>Allocation Status</th></tr></thead>
        <tbody>
          ${inventory.map((item) => `
            <tr>
              <td><strong>${escapeHtml(item.sku)}</strong><div class="tiny">${escapeHtml(item.category)}</div></td>
              <td>${escapeHtml(item.product)}</td>
              <td>${escapeHtml(item.warehouse)}</td>
              <td>${item.onHand}</td>
              <td>${item.reorderPoint}</td>
              <td>${item.inbound}</td>
              <td><span class="status-pill ${statusTone(item.status)}">${escapeHtml(displayAgentStatus(item.status))}</span></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </section>
    <section class="dual-grid" style="margin-top:16px;">
      <div class="panel"><div class="panel-header"><h3 class="panel-title">Under-allocated Agents</h3></div><div class="activity-list">${agentAlertRows()}</div></div>
      <div class="panel"><div class="panel-header"><h3 class="panel-title">Cluster Load Rate</h3></div><div class="chart">${['Dev Cluster A','Dev Cluster B','Prod Cluster A','Global Orchestrator'].map((warehouse, idx) => `<div class="chart-row"><strong>${warehouse}</strong><div class="chart-track"><div class="chart-bar" style="width:${[82,68,57,74][idx]}%"></div></div><span>${[82,68,57,74][idx]}%</span></div>`).join('')}</div></div>
    </section>`;
}

function renderAnalytics() {
  const revenue = state.analytics.revenue;
  const channels = state.analytics.channels;
  return `
    <section class="page-intro"><div><h2>Agent Performance Metrics</h2><p>Translate code commits, tokens consumed, and build success ratios into operational insights.</p></div><div class="page-actions"><div class="tab-row">${['7d','30d','90d'].map((range) => `<button class="tab-button ${viewState.analyticsRange === range ? 'active' : ''}" data-range="${range}">${range.toUpperCase()}</button>`).join('')}</div></div></section>
    <section class="metric-grid">
      ${statCard('Total Codebase Cost', formatCurrency(11310000), 'Credits spent on agent code generations.', 'success')}
      ${statCard('Average Build Cost', formatCurrency(82240), 'Blended cost across D2C and B2B systems.', 'info')}
      ${statCard('Build Pass Rate', '96.1%', 'Commits that successfully built and passed tests.', 'success')}
      ${statCard('Error Containment', '2.8%', 'Unstable builds caught by QA Tester agents.', 'warning')}
    </section>
    <section class="dual-grid" style="margin-top:16px;">
      <div class="chart-panel"><div class="panel-header"><h3 class="panel-title">Commit Velocity</h3><span class="tiny">in hundreds</span></div><div class="spark-grid">${revenue.map((point) => `<div class="spark-bar" style="height:${point.value * 1.3}px"><span>${escapeHtml(point.label)}</span></div>`).join('')}</div></div>
      <div class="panel"><div class="panel-header"><h3 class="panel-title">Platform Mix</h3></div><div class="chart">${channels.map((channel) => `<div class="chart-row"><strong>${escapeHtml(channel.name)}</strong><div class="chart-track"><div class="chart-bar" style="width:${channel.share}%"></div></div><span>${channel.share}%</span></div>`).join('')}</div></div>
    </section>
    <section class="table-shell" style="margin-top:16px;">
      <div class="panel-header"><div><h3 class="panel-title">Platform Compute Cost Breakdown</h3><div class="tiny">Details by build channel</div></div></div>
      <table><thead><tr><th>Platform Channel</th><th>Build Volume</th><th>Compute Costs</th><th>Performance status</th></tr></thead><tbody>${channels.map((channel) => `<tr><td>${escapeHtml(channel.name)}</td><td>${channel.share}%</td><td>${formatCurrency(channel.revenue)}</td><td>${channel.share > 25 ? 'High throughput' : channel.share > 15 ? 'Stable throughput' : 'Low throughput'}</td></tr>`).join('')}</tbody></table>
    </section>`;
}

function renderReports() {
  const result = state.reports.find((report) => report.id === viewState.reportResultId);
  return `
    <section class="page-intro"><div><h2>Build Log Analyzer</h2><p>Configure and run analysis reports on codebase commits, agent performance, and compilation outputs.</p></div></section>
    <section class="dual-grid">
      <form class="panel" id="report-form">
        <div class="panel-header"><h3 class="panel-title">Generate Report</h3></div>
        <div class="form-grid">
          <div class="form-field"><label for="report-name">Report Name</label><input id="report-name" name="name" required placeholder="Weekly deployment scan" /></div>
          <div class="form-field"><label for="report-type">Report Type</label><select id="report-type" name="type"><option>Operations</option><option>Performance</option><option>Testing</option><option>Support</option></select></div>
          <div class="form-field"><label for="report-cadence">Cadence</label><select id="report-cadence" name="cadence"><option>Daily</option><option>Weekly</option><option>Monthly</option></select></div>
          <div class="form-field"><label for="report-owner">Owner Node</label><input id="report-owner" name="owner" placeholder="Orchestrator Node" /></div>
        </div>
        <div class="form-actions"><button class="primary-button" type="submit">Configure Report</button></div>
      </form>
      <div class="panel">
        <div class="panel-header"><h3 class="panel-title">Analysis Output</h3></div>
        ${result ? `<div class="callout"><strong>${escapeHtml(result.name)}</strong><p class="subtle">Last analyzed ${formatDate(result.lastRun, true)}</p><pre style="white-space:pre-wrap; margin:0; color:var(--text-soft);">projects_monitored: ${state.orders.length}
failed_builds: ${computeStats().delayedOrders}
overloaded_agents: ${computeStats().lowStock}
compute_costs_observed: ${formatCurrency(computeStats().totalRevenue)}</pre></div>` : '<div class="empty-state center">Execute a log analyzer to preview metrics.</div>'}
      </div>
    </section>
    <section class="table-shell" style="margin-top:16px;">
      <div class="panel-header"><div><h3 class="panel-title">Configured Log Analyzers</h3><div class="tiny">${state.reports.length} report templates active</div></div></div>
      <table><thead><tr><th>Log Analyzer</th><th>Report Type</th><th>Cadence</th><th>Last Analyzed</th><th>Actions</th></tr></thead><tbody>${state.reports.map((report) => `<tr><td><strong>${escapeHtml(report.name)}</strong><div class="tiny">${escapeHtml(report.id)}</div></td><td>${escapeHtml(report.type)}</td><td>${escapeHtml(report.cadence)}</td><td>${formatDate(report.lastRun, true)}</td><td><div class="table-actions"><button class="ghost-button" data-action="run-report" data-id="${report.id}">Run Scan</button></div></td></tr>`).join('')}</tbody></table>
    </section>`;
}

function renderIntegrations() {
  return `
    <section class="page-intro"><div><h2>Toolchain Control Center</h2><p>Connect repositories, hosting platforms, database providers, and alert monitors.</p></div><div class="page-actions"><button class="primary-button" id="open-integration-modal">+ Add Toolchain</button></div></section>
    <section class="kpi-grid">
      ${statCard('Configured Tools', state.integrations.length, 'Third-party developer integrations.', 'info')}
      ${statCard('Active Connections', state.integrations.filter((item) => item.status === 'active').length, 'Healthy APIs actively sync status.', 'success')}
      ${statCard('Errors detected', state.integrations.filter((item) => item.status === 'attention').length, 'Connection credentials needing update.', 'warning')}
      ${statCard('Total sync requests', state.integrations.reduce((sum, item) => sum + item.records, 0), 'Repository commits tracked.', 'success')}
    </section>
    <section class="triple-grid" style="margin-top:16px;">${state.integrations.map((item) => `
      <div class="panel">
        <div class="panel-header"><strong>${escapeHtml(item.name)}</strong><span class="status-pill ${statusTone(item.status)}">${escapeHtml(displayToolStatus(item.status))}</span></div>
        <div class="subtle">${escapeHtml(item.provider)} · ${escapeHtml(item.type)}</div>
        <div class="value" style="font-size:1.5rem; margin:14px 0 6px;">${item.records}</div>
        <div class="tiny">Sync records · ${item.lastSync ? formatDate(item.lastSync, true) : 'Not yet synced'}</div>
        <div class="form-actions" style="justify-content:flex-start;"><button class="ghost-button" data-action="test-integration" data-id="${item.id}">Test Link</button><button class="secondary-button" data-action="sync-integration" data-id="${item.id}">Sync</button><button class="danger-button" data-action="remove-integration" data-id="${item.id}">Disconnect</button></div>
      </div>`).join('')}</section>
    <section class="panel" style="margin-top:16px;"><div class="panel-header"><h3 class="panel-title">Toolchain Activity Logs</h3></div><div class="activity-list">${state.integrationLog.map((item) => `<div class="activity-item"><strong>${formatDate(item.stamp, true)}</strong><div class="subtle">${escapeHtml(item.detail)}</div></div>`).join('')}</div></section>`;
}

function renderBilling() {
  const sub = state.subscription;
  return `
    <section class="page-intro"><div><h2>Resource Center & Compute Plan</h2><p>Coordinate compute credit costs, API tokens, and subscription invoices.</p></div></section>
    <section class="kpi-grid">
      ${statCard('Subscription Tier', escapeHtml(sub.plan), `Renews ${escapeHtml(sub.renewal)}`, 'success')}
      ${statCard('Compute Costs', formatCurrency(sub.monthly), `${sub.seats} allocated agent slots`, 'info')}
      ${statCard('Compute Credits', `${sub.credits}M tokens`, 'Tokens available for agent code gens.', 'warning')}
      ${statCard('Billing Status', escapeHtml(sub.status), 'Payment account is in good standing.', 'success')}
    </section>
    <section class="panel" style="margin-top:16px;">
      <div class="tab-row">${['subscription','invoices','history'].map((tab) => `<button class="tab-button ${viewState.billingTab === tab ? 'active' : ''}" data-billing-tab="${tab}">${tab === 'history' ? 'Payment history' : tab}</button>`).join('')}</div>
      ${viewState.billingTab === 'subscription' ? `
        <div class="dual-grid">
          <div class="callout"><strong>${escapeHtml(sub.plan)}</strong><p class="subtle">Enterprise multi-model workspace with advanced orchestration and custom agent profiles.</p><div class="progress-shell"><div class="tiny">Agent slots allocated</div><div class="progress-track"><span style="width:${Math.min(100, Math.round((sub.seats / 50) * 100))}%"></span></div></div></div>
          <div class="callout"><strong>Need more credits?</strong><p class="subtle">Purchase blocks of compute tokens or register additional agent slots.</p><button class="primary-button" id="billing-upgrade">Request Compute Upgrade</button></div>
        </div>` : ''}
      ${viewState.billingTab === 'invoices' ? `<div class="table-shell"><table><thead><tr><th>Invoices</th><th>Compute Costs</th><th>Due date</th><th>Status</th></tr></thead><tbody>${state.invoices.map((item) => `<tr><td>${escapeHtml(item.id)}</td><td>${formatCurrency(item.amount)}</td><td>${formatDate(item.dueDate)}</td><td><span class="status-pill ${statusTone(item.status)}">${escapeHtml(item.status)}</span></td></tr>`).join('')}</tbody></table></div>` : ''}
      ${viewState.billingTab === 'history' ? `<div class="table-shell"><table><thead><tr><th>Billing Date</th><th>Payment Method</th><th>Amount</th><th>Status</th></tr></thead><tbody>${state.payments.map((item) => `<tr><td>${formatDate(item.date, true)}</td><td>${escapeHtml(item.method)}</td><td>${formatCurrency(item.amount)}</td><td><span class="status-pill ${statusTone(item.status)}">${escapeHtml(item.status)}</span></td></tr>`).join('')}</tbody></table></div>` : ''}
    </section>`;
}

function renderShipping() {
  const trackingOptions = Object.keys(state.tracking).map((item) => `<option value="${item}">${item}</option>`).join('');
  return `
    <section class="page-intro"><div><h2>Deployment Hub</h2><p>Configure hosting platforms and trigger pipelines without external shell dependencies.</p></div></section>
    <section class="panel">
      <div class="tab-row">${['shipments','rates','tracking'].map((tab) => `<button class="tab-button ${viewState.shippingTab === tab ? 'active' : ''}" data-shipping-tab="${tab}">${tab === 'rates' ? 'Build Cost Estimator' : tab}</button>`).join('')}</div>
      ${viewState.shippingTab === 'shipments' ? `<div class="table-shell"><table><thead><tr><th>Deployment</th><th>Carrier Release</th><th>Build Status</th><th>ETA Release</th><th>Commit SHA</th></tr></thead><tbody>${state.shipments.map((item) => `<tr><td><strong>${escapeHtml(item.id)}</strong><div class="tiny">${escapeHtml(item.orderId)} · ${escapeHtml(item.origin)} → ${escapeHtml(item.destination)}</div></td><td>${escapeHtml(item.carrier)}</td><td><span class="status-pill ${statusTone(item.status)}">${escapeHtml(displayDeployStatus(item.status))}</span></td><td>${formatDate(item.eta)}</td><td><code>${escapeHtml(item.tracking)}</code></td></tr>`).join('')}</tbody></table></div>` : ''}
      ${viewState.shippingTab === 'rates' ? `<form class="dual-grid" id="quote-form"><div class="form-field"><label>Server Region (pincode equivalent)</label><input name="pincode" required placeholder="us-east-1" /></div><div class="form-field"><label>Est. Build Time (Minutes)</label><input name="weight" required type="number" min="0.1" step="0.1" placeholder="5" /></div><div class="form-actions" style="grid-column:1/-1; justify-content:flex-start;"><button class="primary-button" type="submit">Estimate Cost</button></div><div id="quote-results" class="triple-grid" style="grid-column:1/-1;"></div></form>` : ''}
      ${viewState.shippingTab === 'tracking' ? `<div class="dual-grid"><form class="panel" id="tracking-form"><div class="form-field"><label for="tracking-code">Commit SHA</label><select id="tracking-code" name="tracking"><option value="">Select Commit SHA</option>${trackingOptions}</select></div><div class="form-actions" style="justify-content:flex-start;"><button class="primary-button" type="submit">Check Build Steps</button></div></form><div id="tracking-results" class="panel"><div class="empty-state center">Choose a commit SHA to view build milestones.</div></div></div>` : ''}
    </section>`;
}

function renderSupport() {
  return `
    <section class="page-intro"><div><h2>Project Issue Tracker</h2><p>Triage compile warnings, server crashes, and asset errors reported in codebases.</p></div><div class="page-actions"><button class="primary-button" id="open-ticket-modal">+ Create Bug Ticket</button></div></section>
    <section class="panel">
      <div class="tab-row">${['tickets','kb'].map((tab) => `<button class="tab-button ${viewState.supportTab === tab ? 'active' : ''}" data-support-tab="${tab}">${tab === 'kb' ? 'Documentation' : 'Bug Tickets'}</button>`).join('')}</div>
      ${viewState.supportTab === 'tickets' ? `<div class="table-shell"><table><thead><tr><th>Bug Ticket ID / Description</th><th>Severity</th><th>Tracker Status</th><th>Assigned Agent</th><th>Last Updated</th></tr></thead><tbody>${state.tickets.map((ticket) => `<tr><td><strong>${escapeHtml(ticket.id)}</strong><div>${escapeHtml(ticket.subject)}</div><div class="tiny">${escapeHtml(ticket.notes)}</div></td><td><span class="status-pill ${statusTone(ticket.priority)}">${escapeHtml(ticket.priority)}</span></td><td><span class="status-pill ${statusTone(ticket.status)}">${escapeHtml(displayBugStatus(ticket.status))}</span></td><td>${escapeHtml(ticket.owner)}</td><td>${formatDate(ticket.updatedAt, true)}</td></tr>`).join('')}</tbody></table></div>` : ''}
      ${viewState.supportTab === 'kb' ? `<div class="article-list">${state.knowledgeBase.map((article) => `<div class="article-card"><div class="item-row"><strong>${escapeHtml(article.title)}</strong><span class="muted-tag">${escapeHtml(article.topic)}</span></div><div class="tiny">${escapeHtml(article.readTime)} read</div></div>`).join('')}</div>` : ''}
    </section>`;
}

function renderBI() {
  return `
    <section class="page-intro"><div><h2>AI Intelligence & Predictive Analytics</h2><p>Retrieve forecast project schedules, codebase complexity indices, and model latency reports.</p></div></section>
    <section class="kpi-grid">
      ${statCard('High Complexity Files', 7, 'Modules needing proactive refactoring.', 'warning')}
      ${statCard('Build Anomalies', 3, 'Compiler warnings outside normal limits.', 'danger')}
      ${statCard('Forecast Next-Month Commits', '12,400', 'Calculated by agent productivity models.', 'success')}
      ${statCard('Data Latency', '< 15m', 'Sync time from agent repositories.', 'info')}
    </section>
    <section class="panel" style="margin-top:16px;">
      <div class="tab-row">${['overview','data','predictions','anomalies','trends'].map((tab) => `<button class="tab-button ${viewState.biTab === tab ? 'active' : ''}" data-bi-tab="${tab}">${tab}</button>`).join('')}</div>
      ${viewState.biTab === 'overview' ? `<div class="dual-grid"><div class="chart-panel"><div class="panel-header"><h3 class="panel-title">Commits Curve Forecast</h3></div><div class="spark-grid">${[8.8, 9.4, 10.1, 10.8, 11.6, 12.4].map((value, index) => `<div class="spark-bar" style="height:${value * 12}px"><span>M${index + 1}</span></div>`).join('')}</div></div><div class="panel"><div class="panel-header"><h3 class="panel-title">Operator Insights</h3></div><div class="activity-list"><div class="activity-item"><strong>Build Error anomaly</strong><div class="subtle">Dev Cluster B exceeded normal build failure rates by 1.7x.</div></div><div class="activity-item"><strong>Developer throughput</strong><div class="subtle">Idle Miner codebase is stable; Builder Agent can be reallocated.</div></div></div></div></div>` : ''}
      ${viewState.biTab === 'data' ? `<div class="table-shell"><table><thead><tr><th>Dataset</th><th>Sync Age</th><th>Total Rows</th><th>Owner Node</th></tr></thead><tbody><tr><td>commits_fact</td><td>4 min</td><td>1.2M</td><td>Orchestrator</td></tr><tr><td>agent_utilization_snapshot</td><td>9 min</td><td>182K</td><td>Scheduler</td></tr><tr><td>token_logs_fact</td><td>13 min</td><td>97K</td><td>Resource Center</td></tr></tbody></table></div>` : ''}
      ${viewState.biTab === 'predictions' ? `<div class="triple-grid"><div class="callout"><strong>Commit Spike</strong><p class="subtle">Idle Eco-Tycoon repo projected +18% commits next week.</p></div><div class="callout"><strong>Model Cost drift</strong><p class="subtle">Claude 3.5 API calls show 6% cost savings due to cache tuning.</p></div><div class="callout"><strong>Depletion risk</strong><p class="subtle">Compute credits could run low in 5 days without top-up.</p></div></div>` : ''}
      ${viewState.biTab === 'anomalies' ? `<div class="activity-list"><div class="activity-item"><strong>Resource anomaly</strong><div class="subtle">Claude 3.5 Sonnet tokens spike 42% above rolling average.</div></div><div class="activity-item"><strong>Deploy anomaly</strong><div class="subtle">Vercel timeouts rose 24% on Mumbai server region.</div></div><div class="activity-item"><strong>Toolchain anomaly</strong><div class="subtle">GitHub Webhook connection failure crossed 2.1% retry rate.</div></div></div>` : ''}
      ${viewState.biTab === 'trends' ? `<div class="chart">${['Token Efficiency','Build Speed','Test Coverage','Error Rate'].map((label, index) => `<div class="chart-row"><strong>${label}</strong><div class="chart-track"><div class="chart-bar" style="width:${[86, 79, 92, 31][index]}%"></div></div><span>${[86, 79, 92, 31][index]}%</span></div>`).join('')}</div>` : ''}
    </section>`;
}

function renderSettings() {
  const settings = state.settings;
  return `
    <section class="page-intro"><div><h2>Workspace & General Configuration</h2><p>Edit platform defaults, team operator accounts, and API access rules.</p></div></section>
    <section class="panel">
      <div class="tab-row">${['general','team','security'].map((tab) => `<button class="tab-button ${viewState.settingsTab === tab ? 'active' : ''}" data-settings-tab="${tab}">${tab}</button>`).join('')}</div>
      ${viewState.settingsTab === 'general' ? `<form id="settings-form"><div class="form-grid"><div class="form-field"><label>Timezone</label><select name="timezone"><option ${settings.timezone === 'Asia/Kolkata' ? 'selected' : ''}>Asia/Kolkata</option><option ${settings.timezone === 'UTC' ? 'selected' : ''}>UTC</option><option ${settings.timezone === 'Europe/London' ? 'selected' : ''}>Europe/London</option></select></div><div class="form-field"><label>Billing Currency</label><select name="currency"><option ${settings.currency === 'INR' ? 'selected' : ''}>INR</option><option ${settings.currency === 'USD' ? 'selected' : ''}>USD</option><option ${settings.currency === 'EUR' ? 'selected' : ''}>EUR</option></select></div><div class="form-field"><label>Workspace Email</label><input name="notificationEmail" type="email" value="${escapeHtml(settings.notificationEmail)}" /></div><div class="form-field"><label>Workspace Phone</label><input name="supportPhone" value="${escapeHtml(settings.supportPhone)}" /></div><div class="form-field" style="grid-column:1/-1;"><label>Primary Domain URL</label><input name="domain" value="${escapeHtml(settings.domain)}" /></div></div><div class="form-actions"><button class="primary-button" type="submit">Save Workspace Config</button></div></form>` : ''}
      ${viewState.settingsTab === 'team' ? `<div class="table-shell"><table><thead><tr><th>Operator Name</th><th>System Role</th><th>Operator Email</th><th>Status</th></tr></thead><tbody>${state.team.map((member) => `<tr><td>${escapeHtml(member.name)}</td><td>${escapeHtml(member.role)}</td><td>${escapeHtml(member.email)}</td><td><span class="status-pill ${statusTone(member.status)}">${escapeHtml(member.status)}</span></td></tr>`).join('')}</tbody></table></div>` : ''}
      ${viewState.settingsTab === 'security' ? `<form id="security-form" class="form-grid"><div class="form-field"><label>MFA Enforcement</label><select name="mfa"><option value="true" ${settings.mfa ? 'selected' : ''}>Required</option><option value="false" ${!settings.mfa ? 'selected' : ''}>Optional</option></select></div><div class="form-field"><label>Digest Alerts</label><select name="alertDigest"><option value="realtime" ${settings.alertDigest === 'realtime' ? 'selected' : ''}>Realtime</option><option value="twice-daily" ${settings.alertDigest === 'twice-daily' ? 'selected' : ''}>Twice daily</option><option value="daily" ${settings.alertDigest === 'daily' ? 'selected' : ''}>Daily</option></select></div><div class="form-actions" style="grid-column:1/-1;"><button class="primary-button" type="submit">Save Security Settings</button></div></form>` : ''}
    </section>`;
}

function renderPageBody() {
  const renderers = {
    dashboard: renderDashboard,
    orders: renderOrders,
    inventory: renderInventory,
    analytics: renderAnalytics,
    reports: renderReports,
    integrations: renderIntegrations,
    billing: renderBilling,
    shipping: renderShipping,
    support: renderSupport,
    bi: renderBI,
    settings: renderSettings,
  };
  return (renderers[pageKey] || renderDashboard)();
}

function mountModals() {
  const modal = document.getElementById('modal');
  const panel = document.getElementById('modal-panel');
  modal.classList.remove('open');
  panel.innerHTML = '';
}

function openModal(title, body) {
  document.getElementById('modal').classList.add('open');
  document.getElementById('modal-panel').innerHTML = `<div class="modal-panel"><div class="panel-header"><h3 class="panel-title">${escapeHtml(title)}</h3><button class="icon-button" id="close-modal">✕</button></div>${body}</div>`;
}

function renderCurrentPage() {
  renderSidebar();
  renderHeader();
  document.getElementById('page').innerHTML = renderPageBody();
  document.getElementById('overlay').classList.toggle('open', viewState.mobileNavOpen);
  document.getElementById('sidebar').classList.toggle('open', viewState.mobileNavOpen);
  bindEvents();
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function bindEvents() {
  document.getElementById('mobile-menu')?.addEventListener('click', () => {
    viewState.mobileNavOpen = !viewState.mobileNavOpen;
    renderCurrentPage();
  });

  document.getElementById('overlay').onclick = () => {
    viewState.mobileNavOpen = false;
    viewState.notificationOpen = false;
    renderCurrentPage();
  };

  document.getElementById('notifications-button')?.addEventListener('click', () => {
    viewState.notificationOpen = !viewState.notificationOpen;
    document.getElementById('notification-drawer').classList.toggle('open', viewState.notificationOpen);
  });

  document.getElementById('mark-all-read')?.addEventListener('click', () => {
    state.notifications = state.notifications.map((item) => ({ ...item, read: true }));
    persist();
    renderCurrentPage();
    showToast('All alerts marked read.');
  });

  document.getElementById('reset-demo')?.addEventListener('click', resetState);
  document.getElementById('close-modal')?.addEventListener('click', mountModals);
  document.getElementById('modal')?.addEventListener('click', (event) => {
    if (event.target.id === 'modal') mountModals();
  });

  document.querySelectorAll('[data-range]').forEach((button) => button.addEventListener('click', () => {
    viewState.analyticsRange = button.dataset.range;
    renderCurrentPage();
  }));
  document.querySelectorAll('[data-billing-tab]').forEach((button) => button.addEventListener('click', () => {
    viewState.billingTab = button.dataset.billingTab;
    renderCurrentPage();
  }));
  document.querySelectorAll('[data-shipping-tab]').forEach((button) => button.addEventListener('click', () => {
    viewState.shippingTab = button.dataset.shippingTab;
    renderCurrentPage();
  }));
  document.querySelectorAll('[data-support-tab]').forEach((button) => button.addEventListener('click', () => {
    viewState.supportTab = button.dataset.supportTab;
    renderCurrentPage();
  }));
  document.querySelectorAll('[data-bi-tab]').forEach((button) => button.addEventListener('click', () => {
    viewState.biTab = button.dataset.biTab;
    renderCurrentPage();
  }));
  document.querySelectorAll('[data-settings-tab]').forEach((button) => button.addEventListener('click', () => {
    viewState.settingsTab = button.dataset.settingsTab;
    renderCurrentPage();
  }));

  document.getElementById('open-order-modal')?.addEventListener('click', () => {
    openModal('Register New Project', `
      <form id="order-form">
        <div class="form-grid three">
          <div class="form-field"><label>Project Name</label><input name="customer" required placeholder="e.g. Idle Eco-Tycoon" /></div>
          <div class="form-field"><label>Platform</label><select name="channel"><option>Web App</option><option>Desktop</option><option>Mobile App</option><option>API Services</option></select></div>
          <div class="form-field"><label>Cluster Node</label><select name="warehouse"><option>Dev Cluster A</option><option>Dev Cluster B</option><option>Prod Cluster A</option></select></div>
          <div class="form-field"><label>Compute Budget</label><input name="value" type="number" required min="1" placeholder="Token value in USD" /></div>
          <div class="form-field"><label>Orchestration Priority</label><select name="priority"><option>High</option><option>Medium</option><option>Low</option></select></div>
          <div class="form-field"><label>Files count</label><input name="items" type="number" required min="1" value="1" /></div>
        </div>
        <div class="form-actions"><button type="button" class="ghost-button" id="close-modal-inline">Cancel</button><button class="primary-button" type="submit">Add Project</button></div>
      </form>`);
    bindEvents();
    document.getElementById('close-modal-inline')?.addEventListener('click', mountModals);
    document.getElementById('order-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const order = {
        id: `PRJ-${Math.floor(Math.random() * 90000) + 10000}`,
        customer: data.get('customer'),
        channel: data.get('channel'),
        warehouse: data.get('warehouse'),
        value: Number(data.get('value')),
        priority: data.get('priority'),
        items: Number(data.get('items')),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      state.orders.unshift(order);
      state.notifications.unshift({ id: `NT-${Date.now()}`, title: 'Project Registered', body: `${order.customer} loaded in the queue under ${order.id}.`, read: false, stamp: new Date().toISOString() });
      persist();
      mountModals();
      renderCurrentPage();
      showToast(`Project ${order.customer} registered.`);
    });
  });

  document.querySelectorAll('[data-action="advance-order"]').forEach((button) => button.addEventListener('click', () => {
    const order = state.orders.find((item) => item.id === button.dataset.id);
    const flow = ['pending', 'picking', 'packed', 'shipped', 'delivered'];
    const next = flow[Math.min(flow.indexOf(order.status) + 1, flow.length - 1)] || order.status;
    order.status = next;
    persist();
    renderCurrentPage();
    showToast(`Build for ${order.customer} advanced to ${displayProjectStatus(next)}.`);
  }));

  document.querySelectorAll('[data-action="view-order"]').forEach((button) => button.addEventListener('click', () => {
    const order = state.orders.find((item) => item.id === button.dataset.id);
    openModal(`Build Logs - ${order.id}`, `<div class="dual-grid"><div class="callout"><strong>${escapeHtml(order.customer)}</strong><p class="subtle">${escapeHtml(order.channel)} codebase allocated to cluster ${escapeHtml(order.warehouse)}.</p><div class="tiny">Registered ${formatDate(order.createdAt, true)}</div></div><div class="callout"><strong>${formatCurrency(order.value)} budget</strong><p class="subtle">${order.items} code files · Build priority ${escapeHtml(order.priority)}</p><span class="status-pill ${statusTone(order.status)}">${escapeHtml(displayProjectStatus(order.status))}</span></div></div>`);
    bindEvents();
  }));

  document.getElementById('orders-search')?.addEventListener('input', (event) => {
    viewState.orderSearch = event.target.value;
    renderCurrentPage();
  });
  document.getElementById('orders-status')?.addEventListener('change', (event) => {
    viewState.orderStatus = event.target.value;
    renderCurrentPage();
  });

  document.getElementById('open-restock-modal')?.addEventListener('click', () => {
    openModal('Allocate Agent Compute', `
      <form id="restock-form"><div class="form-grid"><div class="form-field"><label>Agent Model</label><select name="sku">${state.inventory.map((item) => `<option value="${item.sku}">${item.sku} · ${escapeHtml(item.product)}</option>`).join('')}</select></div><div class="form-field"><label>Additional tasks slot allocation</label><input name="inbound" type="number" min="1" required placeholder="Number of task slots" /></div></div><div class="form-actions"><button type="button" class="ghost-button" id="close-modal-inline">Cancel</button><button class="primary-button" type="submit">Allocate Capacity</button></div></form>`);
    bindEvents();
    document.getElementById('close-modal-inline')?.addEventListener('click', mountModals);
    document.getElementById('restock-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const sku = data.get('sku');
      const item = state.inventory.find((entry) => entry.sku === sku);
      item.inbound += Number(data.get('inbound'));
      item.status = item.onHand > item.reorderPoint ? 'healthy' : 'low';
      persist();
      mountModals();
      renderCurrentPage();
      showToast(`Agent node capacity updated for ${sku}.`);
    });
  });

  document.getElementById('report-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.reports.unshift({
      id: `LOG-${Math.floor(Math.random() * 9000) + 1000}`,
      name: data.get('name'),
      type: data.get('type'),
      cadence: data.get('cadence'),
      owner: data.get('owner'),
      lastRun: new Date().toISOString(),
    });
    persist();
    renderCurrentPage();
    showToast('Log scan template saved.');
  });

  document.querySelectorAll('[data-action="run-report"]').forEach((button) => button.addEventListener('click', () => {
    viewState.reportResultId = button.dataset.id;
    const report = state.reports.find((entry) => entry.id === button.dataset.id);
    if (report) report.lastRun = new Date().toISOString();
    persist();
    renderCurrentPage();
    showToast('Log scan executed.');
  }));

  document.getElementById('open-integration-modal')?.addEventListener('click', () => {
    openModal('Connect Toolchain Integration', `
      <form id="integration-form"><div class="form-grid"><div class="form-field"><label>Toolchain Name</label><input name="name" required placeholder="Supabase Backend" /></div><div class="form-field"><label>Provider</label><select name="provider"><option>GitHub</option><option>Vercel</option><option>Sentry</option><option>Slack</option><option>Supabase</option></select></div></div><div class="form-actions"><button type="button" class="ghost-button" id="close-modal-inline">Cancel</button><button class="primary-button" type="submit">Connect Tool</button></div></form>`);
    bindEvents();
    document.getElementById('close-modal-inline')?.addEventListener('click', mountModals);
    document.getElementById('integration-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      state.integrations.unshift({ id: `TL-${Date.now().toString().slice(-4)}`, name: data.get('name'), type: ['Sentry', 'Slack'].includes(data.get('provider')) ? 'Logging/Alert' : 'Infrastructure', provider: data.get('provider'), status: 'active', lastSync: new Date().toISOString(), records: 0 });
      state.integrationLog.unshift({ stamp: new Date().toISOString(), detail: `${data.get('name')} connected successfully.` });
      persist();
      mountModals();
      renderCurrentPage();
      showToast('Toolchain linked.');
    });
  });

  document.querySelectorAll('[data-action="test-integration"]').forEach((button) => button.addEventListener('click', () => {
    const item = state.integrations.find((entry) => entry.id === button.dataset.id);
    state.integrationLog.unshift({ stamp: new Date().toISOString(), detail: `${item.name} API credentials validated successfully.` });
    persist();
    renderCurrentPage();
    showToast(`${item.name} ping verified.`);
  }));

  document.querySelectorAll('[data-action="sync-integration"]').forEach((button) => button.addEventListener('click', () => {
    const item = state.integrations.find((entry) => entry.id === button.dataset.id);
    item.records += Math.floor(Math.random() * 120) + 20;
    item.lastSync = new Date().toISOString();
    item.status = 'active';
    state.integrationLog.unshift({ stamp: item.lastSync, detail: `${item.name} synced code updates/commits.` });
    persist();
    renderCurrentPage();
    showToast(`${item.name} sync triggered.`);
  }));

  document.querySelectorAll('[data-action="remove-integration"]').forEach((button) => button.addEventListener('click', () => {
    const item = state.integrations.find((entry) => entry.id === button.dataset.id);
    state.integrations = state.integrations.filter((entry) => entry.id !== button.dataset.id);
    state.integrationLog.unshift({ stamp: new Date().toISOString(), detail: `${item.name} disconnected from workspace.` });
    persist();
    renderCurrentPage();
    showToast(`${item.name} disconnected.`);
  }));

  document.getElementById('billing-upgrade')?.addEventListener('click', () => {
    showToast('Upgrade request queued for support approval.');
  });

  document.getElementById('quote-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const weight = Number(data.get('weight')) || 1;
    const results = [
      { carrier: 'AWS Lambda', price: 0.02 * weight, sla: 'Realtime' },
      { carrier: 'GitHub Actions', price: 0.08 * weight, sla: 'Build pipeline' },
      { carrier: 'Vercel Builder', price: 0.05 * weight, sla: 'Build pipeline' },
    ];
    document.getElementById('quote-results').innerHTML = results.map((item) => `<div class="callout"><strong>${item.carrier}</strong><div class="value" style="font-size:1.4rem; margin:10px 0;">${formatCurrency(item.price)}</div><div class="tiny">ETA ${item.sla}</div></div>`).join('');
  });

  document.getElementById('tracking-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const trackingCode = data.get('tracking');
    const events = state.tracking[trackingCode];
    document.getElementById('tracking-results').innerHTML = events ? `<div class="panel-header"><h3 class="panel-title">Commit: ${escapeHtml(trackingCode)}</h3></div><div class="timeline">${events.map((item) => `<div class="timeline-item">${escapeHtml(item)}</div>`).join('')}</div>` : '<div class="empty-state center">Choose a commit SHA to view milestones.</div>';
  });

  document.getElementById('open-ticket-modal')?.addEventListener('click', () => {
    openModal('Create Bug Ticket', `
      <form id="ticket-form"><div class="form-grid"><div class="form-field"><label>Bug Title / Subject</label><input name="subject" required placeholder="e.g. Memory leak in Idle Miner main loop" /></div><div class="form-field"><label>Severity</label><select name="priority"><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></div><div class="form-field" style="grid-column:1/-1;"><label>Notes & Steps to reproduce</label><textarea name="notes" required placeholder="Describe the bug details and expected behavior..."></textarea></div></div><div class="form-actions"><button type="button" class="ghost-button" id="close-modal-inline">Cancel</button><button class="primary-button" type="submit">Open Bug Ticket</button></div></form>`);
    bindEvents();
    document.getElementById('close-modal-inline')?.addEventListener('click', mountModals);
    document.getElementById('ticket-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      state.tickets.unshift({ id: `BUG-${Math.floor(Math.random() * 900) + 100}`, subject: data.get('subject'), priority: data.get('priority'), status: 'Open', owner: 'Builder Agent', updatedAt: new Date().toISOString(), notes: data.get('notes') });
      state.notifications.unshift({ id: `NT-${Date.now()}`, title: 'Bug Ticket Opened', body: `${data.get('subject')} logged in tracker.`, read: false, stamp: new Date().toISOString() });
      persist();
      mountModals();
      renderCurrentPage();
      showToast('Bug ticket created.');
    });
  });

  document.getElementById('settings-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.settings = { ...state.settings, timezone: data.get('timezone'), currency: data.get('currency'), notificationEmail: data.get('notificationEmail'), supportPhone: data.get('supportPhone'), domain: data.get('domain') };
    persist();
    renderCurrentPage();
    showToast('Workspace settings saved.');
  });

  document.getElementById('security-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.settings = { ...state.settings, mfa: data.get('mfa') === 'true', alertDigest: data.get('alertDigest') };
    persist();
    renderCurrentPage();
    showToast('Security settings saved.');
  });

  document.getElementById('global-search')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      showToast('Global search is a demo interaction in this build.');
    }
  });
}

renderCurrentPage();
