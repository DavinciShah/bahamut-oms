# Windows UI Functional Verification

- Timestamp: 2026-05-17T12:11:45.642Z
- Base URL: http://127.0.0.1:4173
- Authentication: LocalStorage seeded with admin test user (protected routes)
- API mode: Mocked responses for /api and /socket.io endpoints
- Go/No-Go gate coverage: login, register, profile, orders, order detail, inventory, billing, BI, support, ticket detail, settings

| Action | Status | Screenshot | Notes |
|---|---|---|---|
| Open /login | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/route-login.png) | Page opened and rendered. |
| Open /register | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/route-register.png) | Page opened and rendered. |
| Open /dashboard | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/route-dashboard.png) | Page opened and rendered. |
| Open /profile | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/route-profile.png) | Page opened and rendered. |
| Open /orders | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/route-orders.png) | Page opened and rendered. |
| Open /orders/1 | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/route-orders-1.png) | Page opened and rendered. |
| Open /inventory | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/route-inventory.png) | Page opened and rendered. |
| Open /analytics | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/route-analytics.png) | Page opened and rendered. |
| Open /reports | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/route-reports.png) | Page opened and rendered. |
| Open /integrations | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/route-integrations.png) | Page opened and rendered. |
| Open /billing | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/route-billing.png) | Page opened and rendered. |
| Open /shipping | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/route-shipping.png) | Page opened and rendered. |
| Open /support | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/route-support.png) | Page opened and rendered. |
| Open /support/tickets/1 | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/route-support-tickets-1.png) | Page opened and rendered. |
| Open /bi | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/route-bi.png) | Page opened and rendered. |
| Open /settings/tenant | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/route-settings-tenant.png) | Page opened and rendered. |
| Click Orders on /dashboard | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-dashboard-orders.png) | Clicked link. |
| Click Inventory on /dashboard | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-dashboard-inventory.png) | Clicked link. |
| Click Analytics on /dashboard | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-dashboard-analytics.png) | Clicked link. |
| Click Reports on /dashboard | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-dashboard-reports.png) | Clicked link. |
| Click Billing on /dashboard | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-dashboard-billing.png) | Clicked link. |
| Click Shipping on /dashboard | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-dashboard-shipping.png) | Clicked link. |
| Click Support on /dashboard | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-dashboard-support.png) | Clicked link. |
| Click BI on /dashboard | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-dashboard-bi.png) | Clicked link. |
| Click Settings on /dashboard | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-dashboard-settings.png) | Clicked link. |
| Click Notifications on /dashboard | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-dashboard-notifications.png) | Clicked button. |
| Click Invoices on /billing | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-billing-invoices.png) | Clicked button. |
| Click Payment History on /billing | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-billing-payment-history.png) | Clicked button. |
| Click Subscription on /billing | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-billing-subscription.png) | Clicked button. |
| Click + New Order on /orders | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-orders-new-order.png) | Clicked link. |
| Click + New Ticket on /support | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-support-new-ticket.png) | Clicked button. |
| Click Tickets on /support | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-support-tickets.png) | Clicked button. |
| Click Knowledge Base on /support | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-support-knowledge-base.png) | Clicked button. |
| Click General on /settings/tenant | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-settings-tenant-general.png) | Clicked button. |
| Click Branding on /settings/tenant | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-settings-tenant-branding.png) | Clicked button. |
| Click Domains on /settings/tenant | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-settings-tenant-domains.png) | Clicked button. |
| Click Save Settings on /settings/tenant | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-settings-tenant-save-settings.png) | Clicked button. |
| Click Logout on /dashboard | PASS | [image](docs/qa-evidence/windows-launch-2026-05-17T12-10-23-898Z/screenshots/click-dashboard-logout.png) | Clicked button. |
