import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..', '..');
const frontendDir = path.resolve(rootDir, 'frontend');
const docsDir = path.resolve(rootDir, 'docs', 'qa-evidence');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const runDir = path.join(docsDir, `windows-launch-${timestamp}`);
const shotsDir = path.join(runDir, 'screenshots');

fs.mkdirSync(shotsDir, { recursive: true });

const API_PREFIXES = ['/api', '/socket.io'];

const records = [];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sanitizeName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function relDocPath(absPath) {
  return path.relative(rootDir, absPath).replace(/\\/g, '/');
}

function addRecord(action, status, shotPath, note = '') {
  records.push({ action, status, shotPath: shotPath ? relDocPath(shotPath) : '', note });
}

async function saveShot(page, fileName) {
  const target = path.join(shotsDir, `${fileName}.png`);
  await page.screenshot({ path: target, fullPage: true });
  return target;
}

async function clickByAccessibleName(page, label) {
  const regex = new RegExp(`^${escapeRegex(label)}$`, 'i');
  const button = page.getByRole('button', { name: regex });
  if (await button.count()) {
    await button.first().click({ timeout: 4000 });
    return 'button';
  }

  const link = page.getByRole('link', { name: regex });
  if (await link.count()) {
    await link.first().click({ timeout: 4000 });
    return 'link';
  }

  return null;
}

function mockApiBody(url) {
  if (url.includes('/payments/subscription')) {
    return { plan: 'starter', plan_name: 'Starter', status: 'active', current_period_end: '2026-12-31T00:00:00.000Z' };
  }

  if (url.includes('/payments/invoices')) {
    return [];
  }

  if (url.includes('/payments/history')) {
    return [];
  }

  if (url.includes('/orders')) {
    return { orders: [], total: 0 };
  }

  if (url.includes('/products')) {
    return { products: [], total: 0 };
  }

  if (url.includes('/admin/stats')) {
    return { total_orders: 0, total_revenue: 0, total_products: 0, total_users: 0 };
  }

  if (url.includes('/notifications')) {
    return { notifications: [], unreadCount: 0 };
  }

  if (url.includes('/analytics') || url.includes('/bi')) {
    return { data: [], metrics: {}, forecast: [] };
  }

  return {};
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });

  await context.route('**/*', async (route) => {
    const requestUrl = new URL(route.request().url());
    if (API_PREFIXES.some((prefix) => requestUrl.pathname.startsWith(prefix))) {
      const body = JSON.stringify(mockApiBody(requestUrl.pathname));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body,
      });
      return;
    }

    await route.continue();
  });

  await context.addInitScript(() => {
    localStorage.setItem('token', 'qa-token');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      email: 'qa.admin@bahamut.local',
      name: 'QA Admin',
      role: 'admin',
    }));
  });

  const page = await context.newPage();
  const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';

  const routeChecks = [
    '/dashboard',
    '/orders',
    '/inventory',
    '/analytics',
    '/reports',
    '/integrations',
    '/billing',
    '/shipping',
    '/support',
    '/bi',
    '/settings/tenant',
  ];

  for (const route of routeChecks) {
    const action = `Open ${route}`;
    try {
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
      const shotPath = await saveShot(page, sanitizeName(`route-${route}`));
      addRecord(action, 'PASS', shotPath, 'Page opened and rendered.');
    } catch (err) {
      addRecord(action, 'FAIL', '', err.message);
    }
  }

  const buttonChecks = [
    { route: '/dashboard', label: 'Orders' },
    { route: '/dashboard', label: 'Inventory' },
    { route: '/dashboard', label: 'Analytics' },
    { route: '/dashboard', label: 'Reports' },
    { route: '/dashboard', label: 'Integrations' },
    { route: '/dashboard', label: 'Billing' },
    { route: '/dashboard', label: 'Shipping' },
    { route: '/dashboard', label: 'Support' },
    { route: '/dashboard', label: 'BI' },
    { route: '/dashboard', label: 'Settings' },
    { route: '/dashboard', label: 'Notifications' },
    { route: '/billing', label: 'Invoices' },
    { route: '/billing', label: 'Payment History' },
    { route: '/billing', label: 'Subscription' },
    { route: '/orders', label: '+ New Order' },
    { route: '/settings/tenant', label: 'General' },
    { route: '/dashboard', label: 'Logout' },
  ];

  for (const item of buttonChecks) {
    const action = `Click ${item.label} on ${item.route}`;
    try {
      await page.goto(`${baseUrl}${item.route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const kind = await clickByAccessibleName(page, item.label);
      if (!kind) {
        addRecord(action, 'FAIL', '', 'Button or link not found.');
        continue;
      }

      await page.waitForTimeout(700);
      const shotPath = await saveShot(page, sanitizeName(`click-${item.route}-${item.label}`));
      addRecord(action, 'PASS', shotPath, `Clicked ${kind}.`);
    } catch (err) {
      addRecord(action, 'FAIL', '', err.message);
    }
  }

  await browser.close();

  const checklistPath = path.join(runDir, 'checklist.md');
  const lines = [
    '# Windows UI Button Verification',
    '',
    `- Timestamp: ${new Date().toISOString()}`,
    `- Base URL: ${baseUrl}`,
    '- Authentication: LocalStorage seeded with admin test user',
    '- API mode: Mocked responses for /api and /socket.io endpoints',
    '',
    '| Action | Status | Screenshot | Notes |',
    '|---|---|---|---|',
  ];

  for (const record of records) {
    const shot = record.shotPath ? `[image](${record.shotPath.replace(/ /g, '%20')})` : '-';
    lines.push(`| ${record.action} | ${record.status} | ${shot} | ${record.note || '-'} |`);
  }

  fs.writeFileSync(checklistPath, `${lines.join('\n')}\n`, 'utf8');

  console.log(`[qa] Evidence generated in ${runDir}`);
  console.log(`[qa] Checklist: ${checklistPath}`);
}

run().catch((err) => {
  console.error('[qa] Failed to capture UI evidence:', err.message);
  process.exit(1);
});
