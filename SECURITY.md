# Life OS — Security Policy & Technical Posture

## Security Philosophy
Life OS stores sensitive personal management data including tasks, financial transactions, personal goals, calendar events, focus metrics, and custom preferences. Security and privacy are primary design requirements.

---

## 1. Authentication & Session Architecture
- **Access Tokens**: Short-lived JSON Web Tokens (JWT) signed using HMAC-SHA256 (`HS256`). Expires in 15 minutes. Stored exclusively in volatile client memory (JS heap) and transmitted via `Authorization: Bearer <token>` header. Never written to `localStorage` or `sessionStorage`. Includes unique `jti` (random UUID), `iss` (issuer), and `aud` (audience) claims.
- **Refresh Tokens**: Long-lived cryptographic tokens (7-day duration) issued inside secure `HTTP-Only`, `SameSite=Lax` cookies scoped strictly to `path: "/api/v1/auth"`. Raw refresh tokens are never stored in MongoDB — only SHA-256 hashes are persisted.
- **Rotation Chain & Reuse Detection**: Upon refreshing, the previous refresh token is revoked, stamped with `lastUsedAt`, and linked to the new token ID via `replacedBy`. If an already-revoked refresh token is re-submitted (token theft/replay attack), Life OS revokes all tokens in that session family, records a `REFRESH_TOKEN_REUSE_DETECTED` audit alert, and rejects the request with `401 Unauthorized`.
- **Concurrency-Safe Frontend Refresh**: The frontend API client implements a `refreshPromise` queue pattern. When multiple parallel requests fail with 401 simultaneously on page load, only a single `/auth/refresh` HTTP call is executed, preventing race conditions and false-positive reuse alerts.
- **Login Consistency**: Generic `"Invalid email or password"` responses are returned for both unknown accounts and incorrect passwords to prevent user enumeration attacks.
- **Registration Security**: Input parsing explicitly strips and ignores privilege escalation parameters (e.g., `role`, `isAdmin`).
- **Passwords**: Hashed with Argon2 using secure salt parameters. Raw passwords and password hashes are explicitly omitted from API responses and Pino log output.

---

## 2. CSRF Architecture & Defense Strategy
- **Refresh Cookies**: Scoped exclusively to `/api/v1/auth` endpoints with `SameSite=Lax` and `HTTP-Only` flags.
- **Data APIs**: Require an `Authorization: Bearer <accessToken>` header stored in JS memory.
- **Defense Rationale**: Cross-site requests cannot read client JS memory or inject custom `Authorization` headers without passing CORS preflight checks. CORS strictly validates origin against `env.CLIENT_URL` allowlists. Therefore, data endpoints are immune to traditional CSRF attacks without requiring redundant token mechanisms.

---

## 3. Authorization & Data Isolation (IDOR Protection)
- **Strict Scoping**: Every database query and mutation is explicitly scoped to the authenticated user's `userId` (retrieved strictly from verified JWT claims).
- **Ownership Verification**: Resource lookups enforce `_id: resourceId, userId: authenticatedUserId`. Attempting to access another user's entity returns `404 Not Found` without disclosing resource existence.
- **Cross-Entity Relationship Security**: Users cannot attach another user's tasks, goals, or milestones to their own calendar events or focus sessions.

---

## 4. Input Validation & Mass Assignment Safety
- **Zod Validation**: All external request bodies, parameters, and query options are validated against strict Zod DTO schemas before execution.
- **Strict Mass Assignment Protection**: Service update methods pick explicit updatable fields from validated DTOs. Protected fields like `userId`, `_id`, `createdAt`, and `updatedAt` are immutable.
- **MongoDB Query Injection Prevention**: All regex search queries escape special characters using `escapeRegex()`. Operators such as `$where` or arbitrary evaluation functions are rejected.

---

## 5. Rate Limiting & Protection Against Abuse
- **Auth Endpoint Protection**: `/api/v1/auth/login`, `/api/v1/auth/register`, and `/api/v1/auth/refresh` are restricted to 10 requests per 15 minutes per IP address.
- **General API Limiter**: Restricted to 300 requests per 15 minutes per IP.
- **Resource-Intensive Queries**: Global search (`/api/v1/search`) and analytics computations (`/api/v1/analytics/*`) are limited to 30 requests per minute per IP.

---

## 6. Security Headers & CORS
- **Helmet**: Configured with production Content Security Policy (CSP), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security`.
- **CORS Allowlist**: Credentialed requests require explicit matching against `env.CLIENT_URL`. Wildcard (`*`) origins with credentials are strictly prohibited.

---

## 7. Security Audit Logging & Health Monitoring
- **Audit Logs**: Events (`REGISTER`, `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `REFRESH_SUCCESS`, `REFRESH_FAILURE`, `REFRESH_TOKEN_REUSE_DETECTED`, `LOGOUT`) are recorded in the `AuditLog` collection with non-sensitive session metadata (`ipAddress`, `userAgent`).
- **Health Probes**:
  - `/api/v1/health` — Liveness check.
  - `/api/v1/health/ready` — Readiness check (verifies database & Redis connectivity).

---

## 8. OpenAPI Specification
- API documentation is served at `/api/v1/docs` via Swagger UI.

---

## 9. Reporting Security Vulnerabilities
If you discover a potential security vulnerability in Life OS, please do not open a public issue. Email security reports directly to the maintainers for coordinated disclosure.
