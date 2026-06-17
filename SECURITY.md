# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | ✅ Yes    |

Older pre-release builds are not supported. Please upgrade to the latest `1.0.x` release.

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Please report security issues privately via one of the following channels:

1. **GitHub Private Security Advisory** (preferred):  
   <https://github.com/devibe/devibe-oms/security/advisories/new>

2. **Email**: security@devibe-oms.example.com  
   *(Replace with your real security contact before going public.)*

### What to include

- A clear description of the vulnerability.
- Steps to reproduce or proof-of-concept code.
- The version(s) affected.
- Any potential mitigations you are aware of.

### Response timeline

| Stage | Target |
|-------|--------|
| Initial acknowledgement | Within 3 business days |
| Triage and severity assessment | Within 7 business days |
| Patch or mitigation | Within 30 days for critical/high; 90 days for medium/low |
| Public disclosure | Coordinated with reporter after fix is available |

We follow a **coordinated disclosure** policy. We will credit reporters in the release notes unless they prefer to remain anonymous.

## Scope

In-scope vulnerabilities include:

- Authentication/authorisation bypass (JWT, tenant isolation).
- Remote code execution or command injection in the Electron desktop shell or Node.js backend.
- SQL injection or data-exfiltration bugs in database queries.
- Sensitive-data exposure (secrets, PII, payment card data) in logs, error responses, or storage.
- Cross-site scripting (XSS) or prototype-pollution affecting the React frontend.
- Dependency vulnerabilities in direct or transitive npm packages.

Out-of-scope:

- Issues in unsupported or end-of-life versions.
- Theoretical attacks with no practical exploitation path.
- Rate-limiting / DoS without a demonstrated critical-path impact.
- Social-engineering attacks against users.

## Security best practices for operators

- Store all secrets (`JWT_SECRET`, `STRIPE_SECRET_KEY`, `DB_PASSWORD`) in environment variables; never commit them.
- Rotate `JWT_SECRET` and `JWT_REFRESH_SECRET` after any suspected credential leak.
- Keep the PostgreSQL instance on a private network; never expose port 5432 publicly.
- Upgrade to the latest patch release promptly when security advisories are published.
