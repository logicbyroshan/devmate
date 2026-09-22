# Security Policy & Hardening Guidelines

## Supported Versions

We actively maintain and provide security updates for the following versions of DevMate Portfolio:

| Component | Version | Supported |
|---|---|---|
| React Client | 18.3.x | :white_check_mark: |
| Vite Toolchain | 5.4.x | :white_check_mark: |
| Nginx Alpine Runtime | 1.25+ / alpine | :white_check_mark: |
| Node.js Runtime (Build Only) | 18.x / 20.x | :white_check_mark: |

---

## Reporting a Vulnerability

If you discover a security vulnerability or suspect a security flaw, please **do not open a public GitHub issue**. Instead, follow responsible disclosure:

1. **Email**: Send vulnerability details to [mail@logicbyroshan.in](mailto:mail@logicbyroshan.in).
2. **Details to Include**:
   - Detailed description of the vulnerability and attack vector.
   - Proof of Concept (PoC) scripts, reproduction steps, or affected URLs.
   - Potential impact and severity assessment.
   - Any suggested remediations.
3. **Response SLA**:
   - Initial acknowledgement within **24 hours**.
   - Assessment and triage within **48 hours**.
   - Coordinated disclosure and patch delivery within **7 days**.

---

## Frontend Security Architecture & Threat Model

`DevMate` is a static Single Page Application (SPA). Its security architecture focuses on client-side safety, secure communications, and bundle integrity:

### 1. Zero Secrets in Client Bundles
- `VITE_*` environment variables are compiled directly into public client JavaScript bundles.
- **Never store**: Private keys, database credentials, staff passwords, JWT secrets, or administrative tokens in Vite variables or the repository.
- All administrative actions and credentials are exclusively handled by the centralized **DevAdmin** service.

### 2. Transport Security & Direct API Communications
- All production communications with DevAdmin execute over encrypted HTTPS (`https://devadmin-api.logicbyroshan.in/api`).
- Fetch clients enforce abort controller timeouts (`VITE_API_TIMEOUT_MS=7000`) to prevent hanging connections or denial-of-client-resources.

### 3. URL Sanitization & Protocol Filtering
- Dynamic URLs received from API payloads or user input are validated through `safeUrl()` before injection into `href` or `src` attributes.
- Only safe protocols (`https:`, `http:`, `mailto:`, `tel:`) are permitted; dangerous schemes (`javascript:`, `data:`, `vbscript:`) are neutralized to `#`.

### 4. DOM XSS Defense & Template Safety
- Text content is escaped using `escapeHtml()` during dynamic DOM hydration.
- Renderers for Markdown and LaTeX (KaTeX, Mermaid) execute in isolated scopes with sanitized syntax trees.

### 5. HTTP Response Headers (Nginx Runtime)
The production Nginx container enforces defensive HTTP security headers:
- `X-Frame-Options: DENY` (prevents clickjacking attacks)
- `X-Content-Type-Options: nosniff` (prevents MIME-type sniffing exploits)
- `Referrer-Policy: strict-origin-when-cross-origin` (protects referrer privacy)
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` (restricts browser APIs)
- Hidden file access (`.git`, `.env`, `.map`) is blocked with `deny all`.

---

## Deployment Hardening Checklist

- [ ] Confirm `VITE_API_BASE_URL` points to `https://devadmin-api.logicbyroshan.in/api` in production.
- [ ] Verify that no `.env` files with sensitive data are tracked by Git.
- [ ] Confirm Nginx security headers are active on production responses.
- [ ] Ensure Host Nginx and Cloudflare enforce HTTPS and HSTS across `logicbyroshan.in` and `www.logicbyroshan.in`.
- [ ] Confirm DevAdmin backend CORS allows only trusted frontend origins.
