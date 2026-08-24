# Security Policy & Hardening Guidelines

## Supported Versions

We actively maintain and provide security updates for the following versions of DevMate Portfolio:

| Component | Version | Supported |
|---|---|---|
| Django Backend | 5.2.x | :white_check_mark: |
| React Client | 18.3.x | :white_check_mark: |
| Python Runtime | 3.11+ / 3.12+ | :white_check_mark: |
| Node.js Runtime | 18.x / 20.x | :white_check_mark: |

---

## Reporting a Vulnerability

If you discover a security vulnerability or suspect an authorization flaw, please **do not open a public GitHub issue**. Instead, follow responsible disclosure:

1. **Email**: Send vulnerability details to [mail@logicbyroshan.in](mailto:mail@logicbyroshan.in).
2. **Details to Include**:
   - Detailed description of the vulnerability and attack vector.
   - Proof of Concept (PoC) scripts, cURL commands, or reproduction steps.
   - Potential impact and severity assessment.
   - Any suggested remediations.
3. **Response SLA**:
   - Initial acknowledgement within **24 hours**.
   - Assessment and triage within **48 hours**.
   - Coordinated disclosure and patch delivery within **7 days**.

---

## Security Architecture & Threat Model

### 1. Authentication & Authorization
- **Staff Admin Access**: Protected via Django Session Authentication and `@staff_member_required` decorators with CSRF enforcement.
- **API Key Verification**: Optional `X-API-Key` validation using `secrets.compare_digest` constant-time comparison to prevent timing side-channel attacks.
- **Localhost Bypass Restriction**: Localhost bypass in `SecurityService.verify_api_key` is strictly enforced only when `settings.DEBUG is True`.

### 2. Multi-Layer Spam & Abuse Mitigation
- **Sliding-Window IP Throttling**: Limits contact form submissions to 5 requests per hour per IP.
- **Sender Email Rate Limiting**: Caps submissions to 3 messages per hour per email address.
- **Anti-Spam Heuristics**: Automatic regex filtering for high-risk spam keywords, excessive URL links, duplicate messages, and payload size bounds.

### 3. Database & Query Safety
- **Atomic Database Operations**: Like and view counter increments execute using Django `F()` expressions (`F('views_count') + 1`) to guarantee race-condition safety under concurrent traffic.
- **ORM Parameterization**: All SQL queries utilize Django ORM parameterized queries to eliminate SQL injection vulnerabilities.

### 4. HTTP Headers & Transport Security (Production Mode)
When `DJANGO_DEBUG=False`, the backend enforces:
- `SECURE_SSL_REDIRECT=True`
- `SESSION_COOKIE_SECURE=True` & `SESSION_COOKIE_SAMESITE=Lax`
- `CSRF_COOKIE_SECURE=True` & `CSRF_COOKIE_SAMESITE=Lax`
- `SECURE_HSTS_SECONDS=31536000` (1 Year)
- `SECURE_HSTS_INCLUDE_SUBDOMAINS=True` & `SECURE_HSTS_PRELOAD=True`
- `X_FRAME_OPTIONS=DENY`
- `SECURE_REFERRER_POLICY=strict-origin-when-cross-origin`
- `SECURE_CROSS_ORIGIN_OPENER_POLICY=same-origin`
- `SECURE_CROSS_ORIGIN_RESOURCE_POLICY=same-origin`

---

## Deployment Hardening Checklist

- [ ] Ensure `DJANGO_DEBUG=False` in production `.env`.
- [ ] Generate a cryptographically strong `DJANGO_SECRET_KEY` (minimum 50 characters).
- [ ] Explicitly configure `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS`.
- [ ] Set `DISALLOW_SQLITE_IN_PRODUCTION=True` and connect to PostgreSQL.
- [ ] Verify reverse proxy (Nginx) correctly forwards `X-Forwarded-Proto` and `X-Forwarded-For`.
- [ ] Run `python manage.py check --deploy` before starting production services.
