const PAGE_MAP = {
  dashboard: { file: 'index.html', label: 'Dashboard', icon: '🏰', intro: 'Executive overview of orders, revenue, stock health, and tenant operations.' },
  orders: { file: 'orders.html', label: 'Orders', icon: '📦', intro: 'Manage inbound and outbound orders, create new sales orders, and watch SLAs.' },
  inventory: { file: 'inventory.html', label: 'Inventory', icon: '📚', intro: 'Track stock positions, replenishment thresholds, and warehouse readiness.' },
  analytics: { file: 'analytics.html', label: 'Analytics', icon: '📈', intro: 'See revenue velocity, channel contribution, and service-level performance.' },
  reports: { file: 'reports.html', label: 'Reports', icon: '🧾', intro: 'Save, run, and export operational reports for business reviews.' },
  integrations: { file: 'integrations.html', label: 'Integrations', icon: '🔌', intro: 'Connect marketplaces, ERPs, and accounting apps from one control center.' },
  billing: { file: 'billing.html', label: 'Billing', icon: '💳', intro: 'Review subscription, invoices, credits, and payment activity.' },
  shipping: { file: 'shipping.html', label: 'Shipping', icon: '🚚', intro: 'Quote rates, print labels, and monitor package milestones across carriers.' },
  support: { file: 'support.html', label: 'Support', icon: '🛟', intro: 'Resolve merchant tickets, triage incidents, and surface knowledge base guidance.' },
  bi: { file: 'bi.html', label: 'BI Portal', icon: '🐉', intro: 'Explore predictive signals, anomalies, and operational intelligence.' },
  settings: { file: 'settings.html', label: 'Settings', icon: '⚙️', intro: 'Configure tenant details, team access, alert rules, and security defaults.' },
};

const STORAGE_KEY = 'bahamut-oms-static-v1';
const SEARCH_PLACEHOLDER = 'Search orders, tickets, SKUs, carriers...';
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
  company: { name: 'Bahamut OMS', tier: 'Enterprise Control Plane', uptime: '99.96%' },
  orders: [
    { id: 'ORD-24071', customer: 'Dragon Retail Pvt Ltd', channel: 'Shopify', status: 'pending', value: 124500, createdAt: '2026-05-12T09:40:00Z', priority: 'High', warehouse: 'Mumbai FC', items: 6 },
    { id: 'ORD-24072', customer: 'Ember Mart', channel: 'Amazon', status: 'picking', value: 86200, createdAt: '2026-05-12T12:10:00Z', priority: 'Medium', warehouse: 'Delhi FC', items: 4 },
    { id: 'ORD-24073', customer: 'Navy Cart', channel: 'Website', status: 'packed', value: 54600, createdAt: '2026-05-12T14:05:00Z', priority: 'Low', warehouse: 'Mumbai FC', items: 2 },
    { id: 'ORD-24074', customer: 'Crimson Supply Co', channel: 'B2B Portal', status: 'shipped', value: 244000, createdAt: '2026-05-11T16:20:00Z', priority: 'High', warehouse: 'Bengaluru FC', items: 11 },
    { id: 'ORD-24075', customer: 'Zenith Lifestyle', channel: 'Flipkart', status: 'delayed', value: 78800, createdAt: '2026-05-11T18:50:00Z', priority: 'High', warehouse: 'Delhi FC', items: 5 },
    { id: 'ORD-24076', customer: 'Atlas Home', channel: 'Website', status: 'delivered', value: 36800, createdAt: '2026-05-10T08:10:00Z', priority: 'Low', warehouse: 'Kolkata FC', items: 3 },
  ],
  inventory: [
    { sku: 'BHM-AX12', product: 'Bahamut Steel Rack', warehouse: 'Mumbai FC', onHand: 28, reorderPoint: 22, inbound: 16, status: 'healthy', category: 'Storage' },
    { sku: 'BHM-LT09', product: 'Lotus Tote Pack', warehouse: 'Delhi FC', onHand: 12, reorderPoint: 18, inbound: 24, status: 'low', category: 'Apparel' },
    { sku: 'BHM-RD44', product: 'Redline Dock Crate', warehouse: 'Bengaluru FC', onHand: 8, reorderPoint: 14, inbound: 30, status: 'critical', category: 'Industrial' },
    { sku: 'BHM-OP11', product: 'Onyx Packing Tape', warehouse: 'Kolkata FC', onHand: 65, reorderPoint: 30, inbound: 0, status: 'healthy', category: 'Consumables' },
    { sku: 'BHM-AV03', product: 'Aviator Label Printer', warehouse: 'Mumbai FC', onHand: 5, reorderPoint: 6, inbound: 10, status: 'critical', category: 'Hardware' },
    { sku: 'BHM-CR27', product: 'Crimson Return Kit', warehouse: 'Delhi FC', onHand: 22, reorderPoint: 20, inbound: 8, status: 'healthy', category: 'Reverse Logistics' },
  ],
  analytics: {
    revenue: [
      { label: 'Oct', value: 6.8 }, { label: 'Nov', value: 7.1 }, { label: 'Dec', value: 7.8 }, { label: 'Jan', value: 8.4 },
      { label: 'Feb', value: 8.9 }, { label: 'Mar', value: 9.5 }, { label: 'Apr', value: 10.2 }, { label: 'May', value: 10.8 },
    ],
    channels: [
      { name: 'Amazon', share: 34, revenue: 3850000 },
      { name: 'Shopify', share: 26, revenue: 2940000 },
      { name: 'Website', share: 18, revenue: 2030000 },
      { name: 'Flipkart', share: 14, revenue: 1580000 },
      { name: 'B2B', share: 8, revenue: 910000 },
    ],
  },
  reports: [
    { id: 'RPT-1001', name: 'Order SLA Summary', type: 'Operations', cadence: 'Weekly', lastRun: '2026-05-12T09:00:00Z' },
    { id: 'RPT-1002', name: 'Channel Revenue Pulse', type: 'Revenue', cadence: 'Daily', lastRun: '2026-05-13T05:30:00Z' },
    { id: 'RPT-1003', name: 'Stock at Risk', type: 'Inventory', cadence: 'Daily', lastRun: '2026-05-13T06:00:00Z' },
  ],
  integrations: [
    { id: 'INT-11', name: 'Shopify Flagship', type: 'Marketplace', provider: 'Shopify', status: 'active', lastSync: '2026-05-13T06:42:00Z', records: 412 },
    { id: 'INT-12', name: 'Amazon Seller Central', type: 'Marketplace', provider: 'Amazon', status: 'active', lastSync: '2026-05-13T06:37:00Z', records: 788 },
    { id: 'INT-13', name: 'QuickBooks India', type: 'Accounting', provider: 'QuickBooks', status: 'attention', lastSync: '2026-05-12T21:12:00Z', records: 121 },
    { id: 'INT-14', name: 'Zoho Books', type: 'Accounting', provider: 'Zoho', status: 'draft', lastSync: null, records: 0 },
  ],
  integrationLog: [
    { stamp: '2026-05-13T06:42:00Z', detail: 'Shopify Flagship synced 412 product deltas.' },
    { stamp: '2026-05-13T06:37:00Z', detail: 'Amazon Seller Central synced 788 orders.' },
    { stamp: '2026-05-12T21:12:00Z', detail: 'QuickBooks India returned 3 recoverable posting warnings.' },
  ],
  subscription: { plan: 'Scale+', status: 'active', seats: 38, renewal: '2026-06-01', monthly: 148500, credits: 9 },
  invoices: [
    { id: 'INV-5401', amount: 148500, dueDate: '2026-06-01', status: 'Upcoming' },
    { id: 'INV-5391', amount: 148500, dueDate: '2026-05-01', status: 'Paid' },
    { id: 'INV-5381', amount: 129900, dueDate: '2026-04-01', status: 'Paid' },
  ],
  payments: [
    { date: '2026-05-01T04:10:00Z', method: 'Corporate Visa', amount: 148500, status: 'Captured' },
    { date: '2026-04-01T04:08:00Z', method: 'Corporate Visa', amount: 129900, status: 'Captured' },
    { date: '2026-03-01T03:55:00Z', method: 'Bank Transfer', amount: 129900, status: 'Captured' },
  ],
  shipments: [
    { id: 'SHP-3012', orderId: 'ORD-24074', carrier: 'BlueDart', status: 'in_transit', eta: '2026-05-14', tracking: 'BD2398417', origin: 'Bengaluru', destination: 'Pune' },
    { id: 'SHP-3013', orderId: 'ORD-24073', carrier: 'Delhivery', status: 'label_created', eta: '2026-05-15', tracking: 'DL9182736', origin: 'Mumbai', destination: 'Chennai' },
    { id: 'SHP-3014', orderId: 'ORD-24072', carrier: 'Ecom Express', status: 'ready_for_pickup', eta: '2026-05-14', tracking: 'EC1387621', origin: 'Delhi', destination: 'Jaipur' },
  ],
  tracking: {
    BD2398417: ['Label generated · 13 May, 09:12', 'Picked up from Bengaluru FC · 13 May, 10:05', 'Departed sort center · 13 May, 15:40'],
    DL9182736: ['Label generated · 13 May, 11:22', 'Awaiting pickup window · 13 May, 14:10'],
    EC1387621: ['Scheduled for pickup · 13 May, 10:20', 'Driver assigned · 13 May, 11:15'],
  },
  tickets: [
    { id: 'TKT-901', subject: 'Warehouse stock mismatch for BHM-RD44', priority: 'Critical', status: 'Open', owner: 'Ops Control', updatedAt: '2026-05-13T06:14:00Z', notes: 'Cycle count variance observed in Bengaluru FC.' },
    { id: 'TKT-902', subject: 'QuickBooks posting timeout for B2B invoice', priority: 'High', status: 'Investigating', owner: 'Finance Ops', updatedAt: '2026-05-13T04:52:00Z', notes: 'Retry succeeding on second pass; monitor webhook retries.' },
    { id: 'TKT-903', subject: 'Need custom branding for storefront emails', priority: 'Medium', status: 'Pending Customer', owner: 'CSM', updatedAt: '2026-05-12T19:05:00Z', notes: 'Awaiting logo pack from merchant team.' },
  ],
  knowledgeBase: [
    { title: 'How to configure marketplace sync schedules', topic: 'Integrations', readTime: '4 min' },
    { title: 'Resolving low stock alerts before peak sale windows', topic: 'Inventory', readTime: '6 min' },
    { title: 'Finance close checklist for OMS-led invoicing', topic: 'Billing', readTime: '5 min' },
  ],
  notifications: [
    { id: 'NT-1', title: 'Critical stock alert', body: 'BHM-RD44 dropped below safety stock in Bengaluru FC.', read: false, stamp: '2026-05-13T06:15:00Z' },
    { id: 'NT-2', title: 'Billing renewal in 19 days', body: 'Scale+ subscription renews on 01 Jun 2026.', read: false, stamp: '2026-05-13T05:55:00Z' },
    { id: 'NT-3', title: 'Amazon sync complete', body: '788 orders pulled successfully into control plane.', read: true, stamp: '2026-05-13T06:37:00Z' },
    { id: 'NT-4', title: 'Ticket escalated', body: 'TKT-901 assigned to Ops Control for same-day resolution.', read: true, stamp: '2026-05-13T06:20:00Z' },
  ],
  settings: {
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    notificationEmail: 'ops@bahamutoms.com',
    supportPhone: '+91 22 5555 0101',
    domain: 'control.bahamutoms.com',
    mfa: true,
    alertDigest: 'twice-daily',
  },
  team: [
    { name: 'Aarya Shah', role: 'Tenant Admin', email: 'aarya@bahamutoms.com', status: 'Active' },
    { name: 'Meera Rao', role: 'Finance Ops', email: 'meera@bahamutoms.com', status: 'Active' },
    { name: 'Kabir Nanda', role: 'Warehouse Lead', email: 'kabir@bahamutoms.com', status: 'Invited' },
  ],
};

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : deepClone(defaultState);
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
  state = deepClone(defaultState);
  persist();
  renderCurrentPage();
  showToast('Demo data reset.');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: state.settings.currency || 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
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
function notificationMarkup() {
  const unread = countUnread();
  return `
    <div class="panel-header">
      <div>
        <h3 class="panel-title">Notifications</h3>
        <div class="tiny">${unread} unread updates across the control plane.</div>
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
      <img class="brand-logo" src="assets/img/logo.svg" alt="Bahamut dragon logo" />
      <div class="brand-copy">
        <strong>Bahamut OMS</strong>
        <span>Dragon-grade order control</span>
      </div>
    </div>
    <div class="sidebar-section-title">Core navigation</div>
    <nav class="nav-links">
      ${Object.entries(PAGE_MAP).map(([key, page]) => `
        <a class="nav-link ${key === pageKey ? 'active' : ''}" href="${page.file}">
          <span class="nav-icon">${page.icon}</span>
          <span>${page.label}</span>
        </a>`).join('')}
    </nav>
    <div class="sidebar-footer">
      <div class="mini-card">
        <div class="tiny">Tenant uptime</div>
        <div class="value" style="font-size: 1.4rem; margin: 10px 0 4px;">${escapeHtml(state.company.uptime)}</div>
        <div class="subtle">Everything from order ingest to finance sync is visible from this static control plane demo.</div>
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
      <button class="primary-button" id="reset-demo">Reset Demo</button>
    </div>`;

  const drawer = document.getElementById('notification-drawer');
  drawer.className = `notification-drawer ${viewState.notificationOpen ? 'open' : ''}`;
  drawer.innerHTML = notificationMarkup();
}

function statCard(label, value, note, tone = 'info') {
  return `<div class="stat-card"><span class="status-pill ${tone}">${label}</span><div class="value">${value}</div><div class="subtle">${note}</div></div>`;
}

function miniOrderRows(limit = 5) {
  return state.orders.slice(0, limit).map((order) => `
    <div class="list-item">
      <div class="item-row">
        <strong>${escapeHtml(order.id)}</strong>
        <span class="status-pill ${statusTone(order.status)}">${escapeHtml(order.status)}</span>
      </div>
      <div class="subtle">${escapeHtml(order.customer)} · ${escapeHtml(order.channel)} · ${formatCurrency(order.value)}</div>
    </div>`).join('');
}

function inventoryAlertRows() {
  return state.inventory.filter((item) => item.status !== 'healthy').map((item) => `
    <div class="activity-item">
      <div class="item-row">
        <strong>${escapeHtml(item.product)}</strong>
        <span class="status-pill ${statusTone(item.status)}">${escapeHtml(item.status)}</span>
      </div>
      <div class="subtle">${escapeHtml(item.sku)} · ${escapeHtml(item.warehouse)} · reorder at ${item.reorderPoint}</div>
    </div>`).join('') || '<div class="empty-state center">All inventory positions are healthy.</div>';
}

function renderDashboard() {
  const stats = computeStats();
  return `
    <section class="page-intro">
      <div>
        <h2>Dragon command deck</h2>
        <p>Keep ops, shipping, billing, and merchant support synchronized from a single executive view.</p>
      </div>
      <div class="page-actions">
        <a class="secondary-button" href="reports.html">Open Reports</a>
        <a class="primary-button" href="orders.html">Create Order</a>
      </div>
    </section>
    <section class="kpi-grid">
      ${statCard('Orders today', state.orders.length, 'Live order queue across marketplaces.', 'info')}
      ${statCard('Revenue tracked', formatCurrency(stats.totalRevenue), 'Gross booked revenue in this demo dataset.', 'success')}
      ${statCard('Delayed orders', stats.delayedOrders, 'Orders requiring intervention before SLA breach.', 'danger')}
      ${statCard('Low stock SKUs', stats.lowStock, `${stats.activeIntegrations} integrations active and syncing.`, 'warning')}
    </section>
    <section class="content-grid" style="margin-top:16px;">
      <div class="panel">
        <div class="panel-header">
          <div>
            <h3 class="panel-title">Quick modules</h3>
            <div class="tiny">Jump directly into the next OMS workflow.</div>
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
        <div class="panel-header"><h3 class="panel-title">Notifications</h3><span class="tiny">Tap bell for full list</span></div>
        <div class="activity-list">${state.notifications.slice(0, 3).map((item) => `<div class="activity-item"><strong>${escapeHtml(item.title)}</strong><div class="subtle">${escapeHtml(item.body)}</div></div>`).join('')}</div>
      </div>
    </section>
    <section class="dual-grid" style="margin-top:16px;">
      <div class="panel">
        <div class="panel-header"><h3 class="panel-title">Recent orders</h3><a class="ghost-button" href="orders.html">View all</a></div>
        <div class="list">${miniOrderRows()}</div>
      </div>
      <div class="panel">
        <div class="panel-header"><h3 class="panel-title">Inventory risk radar</h3><a class="ghost-button" href="inventory.html">Open inventory</a></div>
        <div class="activity-list">${inventoryAlertRows()}</div>
      </div>
    </section>
    <section class="dual-grid" style="margin-top:16px;">
      <div class="chart-panel">
        <div class="panel-header"><h3 class="panel-title">Revenue momentum</h3><span class="status-pill success">+12.4% MoM</span></div>
        <div class="spark-grid">${state.analytics.revenue.map((point) => `<div class="spark-bar" style="height:${point.value * 11}px"><span>${escapeHtml(point.label)}</span></div>`).join('')}</div>
      </div>
      <div class="panel">
        <div class="panel-header"><h3 class="panel-title">Today's command queue</h3><span class="tiny">Static demo workflow</span></div>
        <div class="timeline">
          <div class="timeline-item"><strong>10:00 AM</strong><div class="subtle">Run order ingestion audit</div></div>
          <div class="timeline-item"><strong>11:30 AM</strong><div class="subtle">Approve QuickBooks exception retries</div></div>
          <div class="timeline-item"><strong>02:00 PM</strong><div class="subtle">Confirm safety stock replenishment transfers</div></div>
          <div class="timeline-item"><strong>04:15 PM</strong><div class="subtle">Review support escalations before carrier cutoff</div></div>
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
      <div><h2>Order cockpit</h2><p>Search, filter, and create orders without leaving the static GitHub Pages deployment.</p></div>
      <div class="page-actions"><button class="primary-button" id="open-order-modal">+ New order</button></div>
    </section>
    <section class="toolbar panel">
      <div class="form-grid">
        <div class="form-field"><label for="orders-search">Search</label><input id="orders-search" type="search" value="${escapeHtml(viewState.orderSearch)}" placeholder="Order ID, customer, marketplace" /></div>
        <div class="form-field"><label for="orders-status">Status</label><select id="orders-status"><option value="all">All statuses</option>${['pending','picking','packed','shipped','delayed','delivered'].map((item) => `<option value="${item}" ${viewState.orderStatus === item ? 'selected' : ''}>${item}</option>`).join('')}</select></div>
      </div>
    </section>
    <section class="table-shell" style="margin-top:16px;">
      <div class="panel-header"><div><h3 class="panel-title">Live order queue</h3><div class="tiny">${filtered.length} visible orders</div></div></div>
      <table>
        <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Warehouse</th><th>Value</th><th>Actions</th></tr></thead>
        <tbody>
          ${filtered.map((order) => `
            <tr>
              <td><strong>${escapeHtml(order.id)}</strong><div class="tiny">${formatDate(order.createdAt, true)}</div></td>
              <td>${escapeHtml(order.customer)}<div class="tiny">${escapeHtml(order.channel)} · ${order.items} items</div></td>
              <td><span class="status-pill ${statusTone(order.status)}">${escapeHtml(order.status)}</span></td>
              <td>${escapeHtml(order.warehouse)}<div class="tiny">Priority ${escapeHtml(order.priority)}</div></td>
              <td>${formatCurrency(order.value)}</td>
              <td><div class="table-actions"><button class="ghost-button" data-action="advance-order" data-id="${order.id}">Advance</button><button class="secondary-button" data-action="view-order" data-id="${order.id}">Details</button></div></td>
            </tr>`).join('') || '<tr><td colspan="6" class="center subtle">No orders match this filter.</td></tr>'}
        </tbody>
      </table>
    </section>
    <section class="dual-grid" style="margin-top:16px;">
      <div class="panel"><div class="panel-header"><h3 class="panel-title">Order readiness</h3></div><div class="chart">${['Pending verification','Ready to pick','Packed today','SLA risk'].map((label, index) => `<div class="chart-row"><strong>${label}</strong><div class="chart-track"><div class="chart-bar" style="width:${[62,74,58,18][index]}%"></div></div><span>${[62,74,58,18][index]}%</span></div>`).join('')}</div></div>
      <div class="panel"><div class="panel-header"><h3 class="panel-title">High-priority orders</h3></div><div class="list">${state.orders.filter((order) => order.priority === 'High').map((order) => `<div class="list-item"><div class="item-row"><strong>${escapeHtml(order.id)}</strong><span class="status-pill ${statusTone(order.status)}">${escapeHtml(order.status)}</span></div><div class="subtle">${escapeHtml(order.customer)} · ${formatCurrency(order.value)}</div></div>`).join('')}</div></div>
    </section>`;
}
function renderInventory() {
  const inventory = state.inventory;
  return `
    <section class="page-intro"><div><h2>Inventory command</h2><p>Maintain healthy stock levels with immediate visibility into replenishment risk and inbound coverage.</p></div><div class="page-actions"><button class="primary-button" id="open-restock-modal">Restock SKU</button></div></section>
    <section class="kpi-grid">
      ${statCard('Tracked SKUs', inventory.length, 'Across fulfilment, returns, and supplies.', 'info')}
      ${statCard('Low stock', inventory.filter((item) => item.status === 'low').length, 'Needs replenishment within current cycle.', 'warning')}
      ${statCard('Critical stock', inventory.filter((item) => item.status === 'critical').length, 'Below safety stock and at risk of stockout.', 'danger')}
      ${statCard('Inbound units', inventory.reduce((sum, item) => sum + item.inbound, 0), 'Already on PO or transfer requests.', 'success')}
    </section>
    <section class="table-shell" style="margin-top:16px;">
      <div class="panel-header"><div><h3 class="panel-title">Warehouse stock positions</h3><div class="tiny">Static demo inventory table</div></div></div>
      <table>
        <thead><tr><th>SKU</th><th>Product</th><th>Warehouse</th><th>On hand</th><th>Reorder</th><th>Inbound</th><th>Status</th></tr></thead>
        <tbody>
          ${inventory.map((item) => `
            <tr>
              <td><strong>${escapeHtml(item.sku)}</strong><div class="tiny">${escapeHtml(item.category)}</div></td>
              <td>${escapeHtml(item.product)}</td>
              <td>${escapeHtml(item.warehouse)}</td>
              <td>${item.onHand}</td>
              <td>${item.reorderPoint}</td>
              <td>${item.inbound}</td>
              <td><span class="status-pill ${statusTone(item.status)}">${escapeHtml(item.status)}</span></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </section>
    <section class="dual-grid" style="margin-top:16px;">
      <div class="panel"><div class="panel-header"><h3 class="panel-title">Low stock alerts</h3></div><div class="activity-list">${inventoryAlertRows()}</div></div>
      <div class="panel"><div class="panel-header"><h3 class="panel-title">Warehouse fill rate</h3></div><div class="chart">${['Mumbai FC','Delhi FC','Bengaluru FC','Kolkata FC'].map((warehouse, idx) => `<div class="chart-row"><strong>${warehouse}</strong><div class="chart-track"><div class="chart-bar" style="width:${[82,68,57,74][idx]}%"></div></div><span>${[82,68,57,74][idx]}%</span></div>`).join('')}</div></div>
    </section>`;
}

function renderAnalytics() {
  const revenue = state.analytics.revenue;
  const channels = state.analytics.channels;
  return `
    <section class="page-intro"><div><h2>Analytics bridge</h2><p>Translate operational data into revenue, conversion, and service insights for your leadership team.</p></div><div class="page-actions"><div class="tab-row">${['7d','30d','90d'].map((range) => `<button class="tab-button ${viewState.analyticsRange === range ? 'active' : ''}" data-range="${range}">${range.toUpperCase()}</button>`).join('')}</div></div></section>
    <section class="metric-grid">
      ${statCard('Gross revenue', formatCurrency(11310000), 'Across all live channels this quarter.', 'success')}
      ${statCard('Avg order value', formatCurrency(82240), 'Blended across D2C and B2B demand.', 'info')}
      ${statCard('Perfect order rate', '96.1%', 'Orders shipped on time with no exceptions.', 'success')}
      ${statCard('Return rate', '2.8%', 'Contained by proactive support and packaging controls.', 'warning')}
    </section>
    <section class="dual-grid" style="margin-top:16px;">
      <div class="chart-panel"><div class="panel-header"><h3 class="panel-title">Revenue momentum</h3><span class="tiny">in millions</span></div><div class="spark-grid">${revenue.map((point) => `<div class="spark-bar" style="height:${point.value * 12}px"><span>${escapeHtml(point.label)}</span></div>`).join('')}</div></div>
      <div class="panel"><div class="panel-header"><h3 class="panel-title">Channel mix</h3></div><div class="chart">${channels.map((channel) => `<div class="chart-row"><strong>${escapeHtml(channel.name)}</strong><div class="chart-track"><div class="chart-bar" style="width:${channel.share}%"></div></div><span>${channel.share}%</span></div>`).join('')}</div></div>
    </section>
    <section class="table-shell" style="margin-top:16px;">
      <div class="panel-header"><div><h3 class="panel-title">Channel revenue detail</h3><div class="tiny">Aligned with the executive dashboard cards</div></div></div>
      <table><thead><tr><th>Channel</th><th>Contribution</th><th>Revenue</th><th>Insight</th></tr></thead><tbody>${channels.map((channel) => `<tr><td>${escapeHtml(channel.name)}</td><td>${channel.share}%</td><td>${formatCurrency(channel.revenue)}</td><td>${channel.share > 25 ? 'Primary growth engine' : channel.share > 15 ? 'Reliable scale contributor' : 'Emerging channel'}</td></tr>`).join('')}</tbody></table>
    </section>`;
}

function renderReports() {
  const result = state.reports.find((report) => report.id === viewState.reportResultId);
  return `
    <section class="page-intro"><div><h2>Report builder</h2><p>Save reusable reports and run them instantly in this static demo experience.</p></div></section>
    <section class="dual-grid">
      <form class="panel" id="report-form">
        <div class="panel-header"><h3 class="panel-title">Create report</h3></div>
        <div class="form-grid">
          <div class="form-field"><label for="report-name">Report name</label><input id="report-name" name="name" required placeholder="Weekend dispatch summary" /></div>
          <div class="form-field"><label for="report-type">Type</label><select id="report-type" name="type"><option>Operations</option><option>Revenue</option><option>Inventory</option><option>Support</option></select></div>
          <div class="form-field"><label for="report-cadence">Cadence</label><select id="report-cadence" name="cadence"><option>Daily</option><option>Weekly</option><option>Monthly</option></select></div>
          <div class="form-field"><label for="report-owner">Owner</label><input id="report-owner" name="owner" placeholder="Ops Control" /></div>
        </div>
        <div class="form-actions"><button class="primary-button" type="submit">Save report</button></div>
      </form>
      <div class="panel">
        <div class="panel-header"><h3 class="panel-title">Generated output</h3></div>
        ${result ? `<div class="callout"><strong>${escapeHtml(result.name)}</strong><p class="subtle">Last run ${formatDate(result.lastRun, true)}</p><pre style="white-space:pre-wrap; margin:0; color:var(--text-soft);">orders_processed: ${state.orders.length}
delayed_orders: ${computeStats().delayedOrders}
low_stock_skus: ${computeStats().lowStock}
revenue_observed: ${formatCurrency(computeStats().totalRevenue)}</pre></div>` : '<div class="empty-state center">Run a saved report to preview output.</div>'}
      </div>
    </section>
    <section class="table-shell" style="margin-top:16px;">
      <div class="panel-header"><div><h3 class="panel-title">Saved reports</h3><div class="tiny">${state.reports.length} reusable report templates</div></div></div>
      <table><thead><tr><th>Report</th><th>Type</th><th>Cadence</th><th>Last run</th><th>Actions</th></tr></thead><tbody>${state.reports.map((report) => `<tr><td><strong>${escapeHtml(report.name)}</strong><div class="tiny">${escapeHtml(report.id)}</div></td><td>${escapeHtml(report.type)}</td><td>${escapeHtml(report.cadence)}</td><td>${formatDate(report.lastRun, true)}</td><td><div class="table-actions"><button class="ghost-button" data-action="run-report" data-id="${report.id}">Run</button></div></td></tr>`).join('')}</tbody></table>
    </section>`;
}

function renderIntegrations() {
  return `
    <section class="page-intro"><div><h2>Integration hub</h2><p>Connect and monitor commerce, ERP, and accounting systems from one place.</p></div><div class="page-actions"><button class="primary-button" id="open-integration-modal">+ Add integration</button></div></section>
    <section class="kpi-grid">
      ${statCard('Configured', state.integrations.length, 'Marketplace and finance connectors.', 'info')}
      ${statCard('Active', state.integrations.filter((item) => item.status === 'active').length, 'Healthy syncs running on schedule.', 'success')}
      ${statCard('Attention needed', state.integrations.filter((item) => item.status === 'attention').length, 'Recoverable exceptions surfaced to operators.', 'warning')}
      ${statCard('Records synced', state.integrations.reduce((sum, item) => sum + item.records, 0), 'Latest sync totals across connectors.', 'success')}
    </section>
    <section class="triple-grid" style="margin-top:16px;">${state.integrations.map((item) => `
      <div class="panel">
        <div class="panel-header"><strong>${escapeHtml(item.name)}</strong><span class="status-pill ${statusTone(item.status)}">${escapeHtml(item.status)}</span></div>
        <div class="subtle">${escapeHtml(item.provider)} · ${escapeHtml(item.type)}</div>
        <div class="value" style="font-size:1.5rem; margin:14px 0 6px;">${item.records}</div>
        <div class="tiny">Records synced · ${item.lastSync ? formatDate(item.lastSync, true) : 'Not yet synced'}</div>
        <div class="form-actions" style="justify-content:flex-start;"><button class="ghost-button" data-action="test-integration" data-id="${item.id}">Test</button><button class="secondary-button" data-action="sync-integration" data-id="${item.id}">Sync</button><button class="danger-button" data-action="remove-integration" data-id="${item.id}">Disconnect</button></div>
      </div>`).join('')}</section>
    <section class="panel" style="margin-top:16px;"><div class="panel-header"><h3 class="panel-title">Sync activity</h3></div><div class="activity-list">${state.integrationLog.map((item) => `<div class="activity-item"><strong>${formatDate(item.stamp, true)}</strong><div class="subtle">${escapeHtml(item.detail)}</div></div>`).join('')}</div></section>`;
}
function renderBilling() {
  const sub = state.subscription;
  return `
    <section class="page-intro"><div><h2>Billing & subscription</h2><p>Keep finance, procurement, and platform ownership aligned with subscription health and invoice history.</p></div></section>
    <section class="kpi-grid">
      ${statCard('Current plan', escapeHtml(sub.plan), `Renews ${escapeHtml(sub.renewal)}`, 'success')}
      ${statCard('Monthly run-rate', formatCurrency(sub.monthly), `${sub.seats} active seats`, 'info')}
      ${statCard('Service credits', sub.credits, 'Credits available for future adjustments.', 'warning')}
      ${statCard('Status', escapeHtml(sub.status), 'Account is in good standing.', 'success')}
    </section>
    <section class="panel" style="margin-top:16px;">
      <div class="tab-row">${['subscription','invoices','history'].map((tab) => `<button class="tab-button ${viewState.billingTab === tab ? 'active' : ''}" data-billing-tab="${tab}">${tab === 'history' ? 'Payment history' : tab}</button>`).join('')}</div>
      ${viewState.billingTab === 'subscription' ? `
        <div class="dual-grid">
          <div class="callout"><strong>${escapeHtml(sub.plan)}</strong><p class="subtle">Enterprise orchestration plan with premium support and BI portal included.</p><div class="progress-shell"><div class="tiny">Seat usage</div><div class="progress-track"><span style="width:${Math.min(100, Math.round((sub.seats / 50) * 100))}%"></span></div></div></div>
          <div class="callout"><strong>Need more capacity?</strong><p class="subtle">Upgrade seat blocks or add dedicated integration lanes for peak events.</p><button class="primary-button" id="billing-upgrade">Request upgrade</button></div>
        </div>` : ''}
      ${viewState.billingTab === 'invoices' ? `<div class="table-shell"><table><thead><tr><th>Invoice</th><th>Amount</th><th>Due date</th><th>Status</th></tr></thead><tbody>${state.invoices.map((item) => `<tr><td>${escapeHtml(item.id)}</td><td>${formatCurrency(item.amount)}</td><td>${formatDate(item.dueDate)}</td><td><span class="status-pill ${statusTone(item.status)}">${escapeHtml(item.status)}</span></td></tr>`).join('')}</tbody></table></div>` : ''}
      ${viewState.billingTab === 'history' ? `<div class="table-shell"><table><thead><tr><th>Date</th><th>Method</th><th>Amount</th><th>Status</th></tr></thead><tbody>${state.payments.map((item) => `<tr><td>${formatDate(item.date, true)}</td><td>${escapeHtml(item.method)}</td><td>${formatCurrency(item.amount)}</td><td><span class="status-pill ${statusTone(item.status)}">${escapeHtml(item.status)}</span></td></tr>`).join('')}</tbody></table></div>` : ''}
    </section>`;
}

function renderShipping() {
  const trackingOptions = Object.keys(state.tracking).map((item) => `<option value="${item}">${item}</option>`).join('');
  return `
    <section class="page-intro"><div><h2>Shipping bridge</h2><p>Quote, label, and track fulfilment activity without a backend dependency.</p></div></section>
    <section class="panel">
      <div class="tab-row">${['shipments','rates','tracking'].map((tab) => `<button class="tab-button ${viewState.shippingTab === tab ? 'active' : ''}" data-shipping-tab="${tab}">${tab === 'rates' ? 'Rate quoter' : tab}</button>`).join('')}</div>
      ${viewState.shippingTab === 'shipments' ? `<div class="table-shell"><table><thead><tr><th>Shipment</th><th>Carrier</th><th>Status</th><th>ETA</th><th>Tracking</th></tr></thead><tbody>${state.shipments.map((item) => `<tr><td><strong>${escapeHtml(item.id)}</strong><div class="tiny">${escapeHtml(item.orderId)} · ${escapeHtml(item.origin)} → ${escapeHtml(item.destination)}</div></td><td>${escapeHtml(item.carrier)}</td><td><span class="status-pill ${statusTone(item.status)}">${escapeHtml(item.status.replaceAll('_', ' '))}</span></td><td>${formatDate(item.eta)}</td><td>${escapeHtml(item.tracking)}</td></tr>`).join('')}</tbody></table></div>` : ''}
      ${viewState.shippingTab === 'rates' ? `<form class="dual-grid" id="quote-form"><div class="form-field"><label>Destination pincode</label><input name="pincode" required placeholder="400001" /></div><div class="form-field"><label>Parcel weight (kg)</label><input name="weight" required type="number" min="0.1" step="0.1" placeholder="2.5" /></div><div class="form-actions" style="grid-column:1/-1; justify-content:flex-start;"><button class="primary-button" type="submit">Get quotes</button></div><div id="quote-results" class="triple-grid" style="grid-column:1/-1;"></div></form>` : ''}
      ${viewState.shippingTab === 'tracking' ? `<div class="dual-grid"><form class="panel" id="tracking-form"><div class="form-field"><label for="tracking-code">Tracking number</label><select id="tracking-code" name="tracking"><option value="">Select tracking ID</option>${trackingOptions}</select></div><div class="form-actions" style="justify-content:flex-start;"><button class="primary-button" type="submit">Track parcel</button></div></form><div id="tracking-results" class="panel"><div class="empty-state center">Choose a tracking number to view milestones.</div></div></div>` : ''}
    </section>`;
}

function renderSupport() {
  return `
    <section class="page-intro"><div><h2>Support control center</h2><p>Triaging merchant tickets and surfacing self-service answers keeps the ops floor quiet.</p></div><div class="page-actions"><button class="primary-button" id="open-ticket-modal">+ New ticket</button></div></section>
    <section class="panel">
      <div class="tab-row">${['tickets','kb'].map((tab) => `<button class="tab-button ${viewState.supportTab === tab ? 'active' : ''}" data-support-tab="${tab}">${tab === 'kb' ? 'Knowledge base' : 'Tickets'}</button>`).join('')}</div>
      ${viewState.supportTab === 'tickets' ? `<div class="table-shell"><table><thead><tr><th>Ticket</th><th>Priority</th><th>Status</th><th>Owner</th><th>Updated</th></tr></thead><tbody>${state.tickets.map((ticket) => `<tr><td><strong>${escapeHtml(ticket.id)}</strong><div>${escapeHtml(ticket.subject)}</div><div class="tiny">${escapeHtml(ticket.notes)}</div></td><td><span class="status-pill ${statusTone(ticket.priority)}">${escapeHtml(ticket.priority)}</span></td><td><span class="status-pill ${statusTone(ticket.status)}">${escapeHtml(ticket.status)}</span></td><td>${escapeHtml(ticket.owner)}</td><td>${formatDate(ticket.updatedAt, true)}</td></tr>`).join('')}</tbody></table></div>` : ''}
      ${viewState.supportTab === 'kb' ? `<div class="article-list">${state.knowledgeBase.map((article) => `<div class="article-card"><div class="item-row"><strong>${escapeHtml(article.title)}</strong><span class="muted-tag">${escapeHtml(article.topic)}</span></div><div class="tiny">${escapeHtml(article.readTime)} read</div></div>`).join('')}</div>` : ''}
    </section>`;
}

function renderBI() {
  return `
    <section class="page-intro"><div><h2>Bahamut BI portal</h2><p>Operational intelligence for leaders who want anomaly alerts and revenue predictions in one dragon-themed cockpit.</p></div></section>
    <section class="kpi-grid">
      ${statCard('Churn risk accounts', 7, 'Merchants needing proactive success outreach.', 'warning')}
      ${statCard('Anomaly alerts', 3, 'Shipment and stock patterns outside control limits.', 'danger')}
      ${statCard('Forecasted next-month revenue', formatCurrency(12400000), 'Model based on recent channel trajectory.', 'success')}
      ${statCard('BI freshness', '< 15m', 'Latest sync latency across warehouse marts.', 'info')}
    </section>
    <section class="panel" style="margin-top:16px;">
      <div class="tab-row">${['overview','data','predictions','anomalies','trends'].map((tab) => `<button class="tab-button ${viewState.biTab === tab ? 'active' : ''}" data-bi-tab="${tab}">${tab}</button>`).join('')}</div>
      ${viewState.biTab === 'overview' ? `<div class="dual-grid"><div class="chart-panel"><div class="panel-header"><h3 class="panel-title">Forecast curve</h3></div><div class="spark-grid">${[8.8, 9.4, 10.1, 10.8, 11.6, 12.4].map((value, index) => `<div class="spark-bar" style="height:${value * 12}px"><span>M${index + 1}</span></div>`).join('')}</div></div><div class="panel"><div class="panel-header"><h3 class="panel-title">Executive notes</h3></div><div class="activity-list"><div class="activity-item"><strong>Returns anomaly</strong><div class="subtle">Delhi FC exceeded rolling 14-day returns threshold by 1.7x.</div></div><div class="activity-item"><strong>Revenue headroom</strong><div class="subtle">B2B channel can sustain a 12% promotional uplift without breaching pick-pack capacity.</div></div></div></div></div>` : ''}
      ${viewState.biTab === 'data' ? `<div class="table-shell"><table><thead><tr><th>Dataset</th><th>Freshness</th><th>Rows</th><th>Owner</th></tr></thead><tbody><tr><td>orders_fact</td><td>4 min</td><td>1.2M</td><td>Ops BI</td></tr><tr><td>inventory_snapshot</td><td>9 min</td><td>182K</td><td>Warehouse BI</td></tr><tr><td>finance_postings</td><td>13 min</td><td>97K</td><td>Finance Systems</td></tr></tbody></table></div>` : ''}
      ${viewState.biTab === 'predictions' ? `<div class="triple-grid"><div class="callout"><strong>Demand spike</strong><p class="subtle">Shopify flagship projected +18% over the next 2 weeks.</p></div><div class="callout"><strong>Carrier cost drift</strong><p class="subtle">BlueDart air lanes show 6% upward pressure next month.</p></div><div class="callout"><strong>Stockout risk</strong><p class="subtle">BHM-AV03 could stock out in 5 days without transfer or PO.</p></div></div>` : ''}
      ${viewState.biTab === 'anomalies' ? `<div class="activity-list"><div class="activity-item"><strong>Inventory anomaly</strong><div class="subtle">BHM-RD44 variance is 42% above normal cycle count drift.</div></div><div class="activity-item"><strong>Shipping anomaly</strong><div class="subtle">Late scan events rose 24% on Delhi outbound volume.</div></div><div class="activity-item"><strong>Finance anomaly</strong><div class="subtle">QuickBooks exception rate crossed 2.1% for B2B invoices.</div></div></div>` : ''}
      ${viewState.biTab === 'trends' ? `<div class="chart">${['Revenue per order','Pick efficiency','On-time dispatch','Return rate'].map((label, index) => `<div class="chart-row"><strong>${label}</strong><div class="chart-track"><div class="chart-bar" style="width:${[86, 79, 92, 31][index]}%"></div></div><span>${[86, 79, 92, 31][index]}%</span></div>`).join('')}</div>` : ''}
    </section>`;
}

function renderSettings() {
  const settings = state.settings;
  return `
    <section class="page-intro"><div><h2>Tenant settings</h2><p>Save platform defaults, access rules, and comms preferences directly in-browser.</p></div></section>
    <section class="panel">
      <div class="tab-row">${['general','team','security'].map((tab) => `<button class="tab-button ${viewState.settingsTab === tab ? 'active' : ''}" data-settings-tab="${tab}">${tab}</button>`).join('')}</div>
      ${viewState.settingsTab === 'general' ? `<form id="settings-form"><div class="form-grid"><div class="form-field"><label>Timezone</label><select name="timezone"><option ${settings.timezone === 'Asia/Kolkata' ? 'selected' : ''}>Asia/Kolkata</option><option ${settings.timezone === 'UTC' ? 'selected' : ''}>UTC</option><option ${settings.timezone === 'Europe/London' ? 'selected' : ''}>Europe/London</option></select></div><div class="form-field"><label>Currency</label><select name="currency"><option ${settings.currency === 'INR' ? 'selected' : ''}>INR</option><option ${settings.currency === 'USD' ? 'selected' : ''}>USD</option><option ${settings.currency === 'EUR' ? 'selected' : ''}>EUR</option></select></div><div class="form-field"><label>Notification email</label><input name="notificationEmail" type="email" value="${escapeHtml(settings.notificationEmail)}" /></div><div class="form-field"><label>Support phone</label><input name="supportPhone" value="${escapeHtml(settings.supportPhone)}" /></div><div class="form-field" style="grid-column:1/-1;"><label>Primary domain</label><input name="domain" value="${escapeHtml(settings.domain)}" /></div></div><div class="form-actions"><button class="primary-button" type="submit">Save settings</button></div></form>` : ''}
      ${viewState.settingsTab === 'team' ? `<div class="table-shell"><table><thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Status</th></tr></thead><tbody>${state.team.map((member) => `<tr><td>${escapeHtml(member.name)}</td><td>${escapeHtml(member.role)}</td><td>${escapeHtml(member.email)}</td><td><span class="status-pill ${statusTone(member.status)}">${escapeHtml(member.status)}</span></td></tr>`).join('')}</tbody></table></div>` : ''}
      ${viewState.settingsTab === 'security' ? `<form id="security-form" class="form-grid"><div class="form-field"><label>MFA enforcement</label><select name="mfa"><option value="true" ${settings.mfa ? 'selected' : ''}>Required</option><option value="false" ${!settings.mfa ? 'selected' : ''}>Optional</option></select></div><div class="form-field"><label>Alert digest</label><select name="alertDigest"><option value="realtime" ${settings.alertDigest === 'realtime' ? 'selected' : ''}>Realtime</option><option value="twice-daily" ${settings.alertDigest === 'twice-daily' ? 'selected' : ''}>Twice daily</option><option value="daily" ${settings.alertDigest === 'daily' ? 'selected' : ''}>Daily</option></select></div><div class="form-actions" style="grid-column:1/-1;"><button class="primary-button" type="submit">Save security</button></div></form>` : ''}
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
    showToast('Notifications marked as read.');
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
    openModal('Create new order', `
      <form id="order-form">
        <div class="form-grid three">
          <div class="form-field"><label>Customer</label><input name="customer" required /></div>
          <div class="form-field"><label>Channel</label><select name="channel"><option>Shopify</option><option>Amazon</option><option>Website</option><option>B2B Portal</option></select></div>
          <div class="form-field"><label>Warehouse</label><select name="warehouse"><option>Mumbai FC</option><option>Delhi FC</option><option>Bengaluru FC</option><option>Kolkata FC</option></select></div>
          <div class="form-field"><label>Order value</label><input name="value" type="number" required min="1" /></div>
          <div class="form-field"><label>Priority</label><select name="priority"><option>High</option><option>Medium</option><option>Low</option></select></div>
          <div class="form-field"><label>Items</label><input name="items" type="number" required min="1" value="1" /></div>
        </div>
        <div class="form-actions"><button type="button" class="ghost-button" id="close-modal-inline">Cancel</button><button class="primary-button" type="submit">Create order</button></div>
      </form>`);
    bindEvents();
    document.getElementById('close-modal-inline')?.addEventListener('click', mountModals);
    document.getElementById('order-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const order = {
        id: `ORD-${Math.floor(Math.random() * 90000) + 10000}`,
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
      state.notifications.unshift({ id: `NT-${Date.now()}`, title: 'New order created', body: `${order.id} for ${order.customer} entered the queue.`, read: false, stamp: new Date().toISOString() });
      persist();
      mountModals();
      renderCurrentPage();
      showToast(`Order ${order.id} created.`);
    });
  });

  document.querySelectorAll('[data-action="advance-order"]').forEach((button) => button.addEventListener('click', () => {
    const order = state.orders.find((item) => item.id === button.dataset.id);
    const flow = ['pending', 'picking', 'packed', 'shipped', 'delivered'];
    const next = flow[Math.min(flow.indexOf(order.status) + 1, flow.length - 1)] || order.status;
    order.status = next;
    persist();
    renderCurrentPage();
    showToast(`${order.id} advanced to ${next}.`);
  }));

  document.querySelectorAll('[data-action="view-order"]').forEach((button) => button.addEventListener('click', () => {
    const order = state.orders.find((item) => item.id === button.dataset.id);
    openModal(order.id, `<div class="dual-grid"><div class="callout"><strong>${escapeHtml(order.customer)}</strong><p class="subtle">${escapeHtml(order.channel)} order routed to ${escapeHtml(order.warehouse)}.</p><div class="tiny">Created ${formatDate(order.createdAt, true)}</div></div><div class="callout"><strong>${formatCurrency(order.value)}</strong><p class="subtle">${order.items} line items · Priority ${escapeHtml(order.priority)}</p><span class="status-pill ${statusTone(order.status)}">${escapeHtml(order.status)}</span></div></div>`);
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
    openModal('Restock SKU', `
      <form id="restock-form"><div class="form-grid"><div class="form-field"><label>SKU</label><select name="sku">${state.inventory.map((item) => `<option value="${item.sku}">${item.sku} · ${escapeHtml(item.product)}</option>`).join('')}</select></div><div class="form-field"><label>Units incoming</label><input name="inbound" type="number" min="1" required /></div></div><div class="form-actions"><button type="button" class="ghost-button" id="close-modal-inline">Cancel</button><button class="primary-button" type="submit">Update inventory</button></div></form>`);
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
      showToast(`Inbound stock updated for ${sku}.`);
    });
  });

  document.getElementById('report-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.reports.unshift({
      id: `RPT-${Math.floor(Math.random() * 9000) + 1000}`,
      name: data.get('name'),
      type: data.get('type'),
      cadence: data.get('cadence'),
      owner: data.get('owner'),
      lastRun: new Date().toISOString(),
    });
    persist();
    renderCurrentPage();
    showToast('Report template saved.');
  });

  document.querySelectorAll('[data-action="run-report"]').forEach((button) => button.addEventListener('click', () => {
    viewState.reportResultId = button.dataset.id;
    const report = state.reports.find((entry) => entry.id === button.dataset.id);
    if (report) report.lastRun = new Date().toISOString();
    persist();
    renderCurrentPage();
    showToast('Report executed.');
  }));

  document.getElementById('open-integration-modal')?.addEventListener('click', () => {
    openModal('Add integration', `
      <form id="integration-form"><div class="form-grid"><div class="form-field"><label>Name</label><input name="name" required placeholder="WooCommerce SEA" /></div><div class="form-field"><label>Provider</label><select name="provider"><option>WooCommerce</option><option>Shopify</option><option>Amazon</option><option>QuickBooks</option><option>Zoho</option></select></div></div><div class="form-actions"><button type="button" class="ghost-button" id="close-modal-inline">Cancel</button><button class="primary-button" type="submit">Connect</button></div></form>`);
    bindEvents();
    document.getElementById('close-modal-inline')?.addEventListener('click', mountModals);
    document.getElementById('integration-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      state.integrations.unshift({ id: `INT-${Date.now().toString().slice(-4)}`, name: data.get('name'), type: ['QuickBooks', 'Zoho'].includes(data.get('provider')) ? 'Accounting' : 'Marketplace', provider: data.get('provider'), status: 'active', lastSync: new Date().toISOString(), records: 0 });
      state.integrationLog.unshift({ stamp: new Date().toISOString(), detail: `${data.get('name')} connected successfully.` });
      persist();
      mountModals();
      renderCurrentPage();
      showToast('Integration connected.');
    });
  });

  document.querySelectorAll('[data-action="test-integration"]').forEach((button) => button.addEventListener('click', () => {
    const item = state.integrations.find((entry) => entry.id === button.dataset.id);
    state.integrationLog.unshift({ stamp: new Date().toISOString(), detail: `${item.name} connection test passed.` });
    persist();
    renderCurrentPage();
    showToast(`${item.name} test passed.`);
  }));

  document.querySelectorAll('[data-action="sync-integration"]').forEach((button) => button.addEventListener('click', () => {
    const item = state.integrations.find((entry) => entry.id === button.dataset.id);
    item.records += Math.floor(Math.random() * 120) + 20;
    item.lastSync = new Date().toISOString();
    item.status = 'active';
    state.integrationLog.unshift({ stamp: item.lastSync, detail: `${item.name} synced ${item.records} cumulative records.` });
    persist();
    renderCurrentPage();
    showToast(`${item.name} sync started.`);
  }));

  document.querySelectorAll('[data-action="remove-integration"]').forEach((button) => button.addEventListener('click', () => {
    const item = state.integrations.find((entry) => entry.id === button.dataset.id);
    state.integrations = state.integrations.filter((entry) => entry.id !== button.dataset.id);
    state.integrationLog.unshift({ stamp: new Date().toISOString(), detail: `${item.name} disconnected from tenant workspace.` });
    persist();
    renderCurrentPage();
    showToast(`${item.name} disconnected.`);
  }));

  document.getElementById('billing-upgrade')?.addEventListener('click', () => {
    showToast('Upgrade request queued for customer success.');
  });

  document.getElementById('quote-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const weight = Number(data.get('weight')) || 1;
    const results = [
      { carrier: 'BlueDart', price: 190 + weight * 34, sla: '2 days' },
      { carrier: 'Delhivery', price: 172 + weight * 28, sla: '3 days' },
      { carrier: 'Ecom Express', price: 165 + weight * 26, sla: '3 days' },
    ];
    document.getElementById('quote-results').innerHTML = results.map((item) => `<div class="callout"><strong>${item.carrier}</strong><div class="value" style="font-size:1.4rem; margin:10px 0;">${formatCurrency(item.price)}</div><div class="tiny">ETA ${item.sla}</div></div>`).join('');
  });

  document.getElementById('tracking-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const trackingCode = data.get('tracking');
    const events = state.tracking[trackingCode];
    document.getElementById('tracking-results').innerHTML = events ? `<div class="panel-header"><h3 class="panel-title">${escapeHtml(trackingCode)}</h3></div><div class="timeline">${events.map((item) => `<div class="timeline-item">${escapeHtml(item)}</div>`).join('')}</div>` : '<div class="empty-state center">No milestones available for that tracking ID.</div>';
  });

  document.getElementById('open-ticket-modal')?.addEventListener('click', () => {
    openModal('Create support ticket', `
      <form id="ticket-form"><div class="form-grid"><div class="form-field"><label>Subject</label><input name="subject" required /></div><div class="form-field"><label>Priority</label><select name="priority"><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></div><div class="form-field" style="grid-column:1/-1;"><label>Notes</label><textarea name="notes" required placeholder="Describe the issue and expected action."></textarea></div></div><div class="form-actions"><button type="button" class="ghost-button" id="close-modal-inline">Cancel</button><button class="primary-button" type="submit">Open ticket</button></div></form>`);
    bindEvents();
    document.getElementById('close-modal-inline')?.addEventListener('click', mountModals);
    document.getElementById('ticket-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      state.tickets.unshift({ id: `TKT-${Math.floor(Math.random() * 900) + 100}`, subject: data.get('subject'), priority: data.get('priority'), status: 'Open', owner: 'Ops Control', updatedAt: new Date().toISOString(), notes: data.get('notes') });
      state.notifications.unshift({ id: `NT-${Date.now()}`, title: 'Support ticket opened', body: `${data.get('subject')} is now in the support queue.`, read: false, stamp: new Date().toISOString() });
      persist();
      mountModals();
      renderCurrentPage();
      showToast('Ticket opened.');
    });
  });

  document.getElementById('settings-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.settings = { ...state.settings, timezone: data.get('timezone'), currency: data.get('currency'), notificationEmail: data.get('notificationEmail'), supportPhone: data.get('supportPhone'), domain: data.get('domain') };
    persist();
    renderCurrentPage();
    showToast('General settings saved.');
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
      showToast('Global search is a demo interaction in this static build.');
    }
  });
}

renderCurrentPage();
