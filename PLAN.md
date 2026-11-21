# Expenser — Product & Technical Plan

**Status:** Draft v0.3 · 2026-11-21
**Owner:** shova
**Repo:** https://github.com/amit0604/Expenser
**Revision:** v0.3 — M1 identity spec, household country code, Evergreen Fortune palette

---

## 1. Vision

Expenser is a personal-finance cockpit: not just a ledger, but a dashboard that answers two questions at a glance:

1. **Where do I stand?** — accounts, spending, net worth, cash flow.
2. **What should I do next?** — budgets, savings goals, upcoming bills, and how much is safe to spend.

It starts as a private app for one family and is designed so it can later serve a wider audience without a rewrite.

---

## 2. Locked decisions

| Decision | Choice |
|---|---|
| Initial audience | Family (shared household), public release later |
| Stack | Rust API + React/TypeScript frontend |
| Data entry | Manual + CSV/TSV + bank aggregation — all required in the first release |
| Account privacy | Personal accounts private by default; sharing is explicit and audited |
| Hosting | Home server + Cloudflare Tunnel first; portable containers for cloud later |
| Region/currency | Chosen during setup; per-user locale/formatting, per-household base currency |
| Money storage | Integer minor units (cents), never floats |

---

## 3. Principles

- **Security by design.** Treat authentication, authorization, secrets, and backups as architecture, not polish.
- **Private by default.** A personal account is visible only to its owner until it is explicitly shared; household admins get no override.
- **One ingestion pipeline.** Manual entry, CSV/TSV, and bank sync all normalize into the same staging → dedupe → categorize → commit flow.
- **Household-scoped from day one.** Every financial row belongs to a household, even while there is only one.
- **Boring infrastructure.** PostgreSQL, Docker, static SPA, reverse proxy. Easy to run at home and easy to move.
- **Money is integers.** Store `BIGINT` minor units plus ISO-4217 currency. No floating point.
- **Derive, don't duplicate.** Account balances are computed from opening balance + transactions; snapshots exist only for historical charts.
- **Ship vertical slices.** Every milestone ends with something usable end-to-end.

---

## 4. Scope

### MVP (first release — M0 through M7)

- First-run setup wizard: owner account, household, country, base currency, locale, timezone.
- Authentication: email + password, secure sessions, optional TOTP 2FA.
- Household members: owner/admin/member roles.
- **Account privacy:** every account has an owner. Personal accounts are private by default; sharing with the household is an explicit, audited action. Admins cannot see another member's private accounts.
- Accounts: checking, savings, credit card, cash, loan; live balances.
- Categories: income/expense, optional subcategories, colors/icons.
- Transactions: create, edit, delete, transfers, notes, tags, search, filters, pagination.
- CSV/TSV import: upload, column mapping, saved profiles, preview, duplicate detection, categorization rules.
- **Bank synchronization:** aggregator-backed account linking, scheduled syncs, consent renewal, and encrypted provider tokens.
- Dashboard: net worth, monthly income vs. expenses, savings rate, spending by category, balance history.
- Budgets: monthly limit per category with progress.
- Savings goals: target amount, deadline, progress, suggested monthly contribution.
- Recurring payments: upcoming bills and subscriptions.
- "Safe to Spend" estimate.
- Self-hosted deployment with HTTPS, automated encrypted backups, and a tested restore process.

**Release scope note:** the first release includes every MVP item above. Milestones are sequenced for usability — we do not cut budgets, goals, or bank sync to go faster. New ideas land in the Later list so the release stays shippable.

### Later

- Additional bank providers and countries beyond the first supported region.
- Multi-currency accounts with FX conversion into the household base currency.
- PWA installation and offline-friendly shell.
- Receipt attachments, PDF statement parsing, investment tracking.
- Email invitations and password reset.
- Public signup, isolation hardening, legal/compliance work.

### Explicit non-goals for v1

- Tax filing or accounting-grade bookkeeping.
- Investment portfolio performance tracking.
- AI-generated financial advice.
- Native mobile apps.
- Billing/subscriptions for a public SaaS.

---

## 5. Architecture

```
┌──────────────────────────────┐
│  Browser — React SPA (Vite)  │
│  Tailwind · shadcn · Recharts│
└──────────────┬───────────────┘
               │ HTTPS (Cloudflare Tunnel or Caddy)
┌──────────────▼───────────────┐
│  Rust API — Axum + Tokio     │
│  auth · households · money   │
│  imports · reports · rules   │
└──────────────┬───────────────┘
               │ SQLx
┌──────────────▼───────────────┐
│  PostgreSQL                  │
└──────────────────────────────┘

Bank provider adapter → same ingestion pipeline
```

### Monorepo layout

```
expenser/
├── apps/
│   ├── api/                 # Rust/Axum service
│   │   ├── migrations/
│   │   └── src/
│   │       ├── auth/
│   │       ├── households/
│   │       ├── accounts/
│   │       ├── transactions/
│   │       ├── imports/
│   │       ├── budgets/
│   │       ├── goals/
│   │       └── reports/
│   └── web/                 # React SPA
│       └── src/
│           ├── routes/
│           ├── components/
│           ├── features/
│           └── lib/
├── packages/
│   └── shared/              # generated TS types from Rust
├── deploy/
│   ├── docker-compose.yml
│   ├── Caddyfile
│   └── backup/
├── .github/workflows/
└── PLAN.md
```

The API serves `/api/*`. In production, Caddy (or another static server) serves the built SPA and proxies `/api` to the Rust service. The SPA and API share an origin, which keeps cookies and CSRF simple.

---

## 6. Technology choices

### Backend

| Concern | Choice | Why |
|---|---|---|
| HTTP | Axum + Tokio | Mature, ergonomic, tower ecosystem |
| Database | PostgreSQL + SQLx | Compile-time-checked SQL, migrations, no ORM magic |
| Passwords | Argon2id (`argon2`) | Current best practice |
| Sessions | Opaque server-side sessions (`tower-sessions` + SQLx store) | Revocable; no JWT footguns |
| 2FA | TOTP (`totp-rs`) | Standard authenticator apps |
| Validation | `validator` + domain checks | Reject bad input at the boundary |
| Errors | `thiserror` in domain, `anyhow` in binaries | Clear, typed errors |
| Logging | `tracing` + `tracing-subscriber` | Structured logs with request IDs |
| Rate limiting | `tower-governor` | Protect auth and import endpoints |
| CSV/TSV | `csv` | Handles quoting, delimiters, headers |
| Secret encryption | AES-256-GCM or XChaCha20-Poly1305, key outside DB | Protects bank tokens and TOTP seeds |
| Types to frontend | `ts-rs` | Rust structs generate TypeScript types |
| Migrations | `sqlx::migrate!` | Versioned, repeatable schema |

Start with SQLx runtime queries (`query_as`) while the schema is moving, then adopt compile-time-checked macros (`query!`) once it stabilizes.

### Frontend

- React + TypeScript + Vite.
- TanStack Router (type-safe routes) and TanStack Query (server state).
- Tailwind CSS + shadcn/ui components.
- Recharts (or Tremor, which builds on Recharts) for charts.
- react-hook-form + Zod for forms.
- `Intl.NumberFormat` / `Intl.DateTimeFormat` for locale-aware display.
- Vitest for unit tests; Playwright for a small set of end-to-end flows.

### Infrastructure

- Docker Compose: `api`, `web` (static build), `caddy`, `postgres`, `cloudflared`.
- GitHub Actions: format, clippy, tests, audit, frontend lint/test/build.
- `cargo audit` + `cargo deny`; `pnpm audit`; Renovate for updates.

---

## 7. Data model

All money columns are `BIGINT` minor units. All timestamps are `TIMESTAMPTZ` in UTC. Financial rows are household-scoped; account-linked rows inherit their account's household and visibility.

| Table | Purpose | Key columns |
|---|---|---|
| `users` | Login identity and preferences | `id`, `email`, `password_hash`, `display_name`, `locale`, `timezone`, `currency`, `totp_secret_enc`, `created_at` |
| `households` | Shared financial workspace | `id`, `name`, `base_currency`, `country_code`, `created_at` |
| `household_members` | Membership and roles | `household_id`, `user_id`, `role` (`owner`/`admin`/`member`), `joined_at` |
| `accounts` | Bank/cash/credit accounts | `id`, `household_id`, `owner_user_id` (NOT NULL), `visibility` (`private`/`household`), `name`, `type`, `currency`, `opening_balance_minor`, `institution`, `last4`, `is_archived` |
| `categories` | Income/expense taxonomy | `id`, `household_id`, `name`, `kind`, `parent_id`, `color`, `icon` |
| `transactions` | Ledger entries | `id`, `household_id`, `account_id`, `booked_at`, `amount_minor`, `currency`, `category_id`, `payee`, `notes`, `transfer_group_id`, `import_batch_id`, `external_id`, `dedupe_hash`, `created_by` |
| `budgets` | Monthly category limits | `id`, `household_id`, `owner_user_id` (NULL = shared), `category_id`, `period_month`, `limit_minor` |
| `goals` | Savings targets | `id`, `household_id`, `owner_user_id` (NULL = shared), `name`, `target_minor`, `target_date`, `account_id`, `status` |
| `recurring_rules` | Bills and subscriptions | `id`, `household_id`, `owner_user_id` (NULL = shared), `account_id`, `category_id`, `payee`, `amount_minor`, `frequency`, `next_due`, `end_date`, `auto_post` |
| `import_profiles` | Saved CSV/TSV mappings | `id`, `household_id`, `name`, `delimiter`, `date_format`, `decimal_separator`, `column_map` (`JSONB`) |
| `import_batches` | Import audit trail | `id`, `household_id`, `account_id`, `source`, `filename`, `profile_id`, `status`, `row_count`, `imported_count`, `created_by` |
| `categorization_rules` | Auto-categorization | `id`, `household_id`, `match_field`, `match_type`, `pattern`, `category_id`, `priority` |
| `bank_connections` | Aggregator links | `id`, `household_id`, `owner_user_id`, `provider`, `external_ref`, `token_enc`, `status`, `consent_expires_at`, `last_synced_at` |
| `sessions` | Revocable login sessions | `id`, `user_id`, `token_hash`, `expires_at`, `last_seen`, `ip`, `user_agent` |
| `audit_log` | Security-relevant events | `id`, `user_id`, `household_id`, `action`, `entity`, `entity_id`, `metadata` (`JSONB`), `created_at` |
| `account_balance_snapshots` | Per-account historical chart points | `id`, `account_id`, `as_of`, `balance_minor` |

### Rules and constraints

- **Visibility:** `visibility='private'` accounts are accessible only to `owner_user_id`; `visibility='household'` accounts are accessible to every household member. There is no admin override for private accounts. Transactions, import batches, balance snapshots, and other account-linked rows inherit the account's visibility. Budgets, goals, and recurring rules use `owner_user_id`: `NULL` means shared, a value means private to that user. Reports and dashboards aggregate only resources the viewer can access; shared views aggregate shared resources only.
- **Sharing changes** (private ↔ household) are owner-only, audited actions. Per-member sharing is a later extension; v1 is private or household-wide.
- **Budget and goal scoping:** shared budgets aggregate shared accounts only; personal budgets aggregate the owner's accessible accounts. Shared goals and recurring rules may reference shared accounts only; personal ones follow the owner's account access.
- **Balances** = `opening_balance_minor` + sum of non-archived transactions. Credit/loan accounts carry negative balances.
- **Transfers** are two linked rows sharing a `transfer_group_id` (one negative, one positive). Transfers are excluded from income/spending reports.
- **Dedupe:** unique `(account_id, dedupe_hash)`. The hash covers booked date, amount, normalized payee, and an occurrence index within the day, so genuine same-day duplicates still import.
- **Categories** are either `income` or `expense`; only expense categories can have budgets.
- **Deletion** is soft where history matters (`accounts.is_archived`, transaction `deleted_at` later if needed).
- **Indexes:** `transactions(household_id, booked_at DESC)`, `transactions(account_id, booked_at DESC)`, `transactions(transfer_group_id)`, `budgets(household_id, period_month)`.

### Currency and locale (v1)

- Each user has `locale`, `timezone`, and display `currency` preferences, set during onboarding.
- Each household has a `base_currency` for reporting.
- v1 enforces that all accounts in a household use the base currency. The schema already includes `currency` on accounts and transactions so multi-currency can be added without a migration crisis.
- Multi-currency with FX rates, conversion, and per-account currencies is a later feature.

---

## 8. Setup and onboarding

First-run wizard (self-hosted, first registered user becomes owner):

1. **Owner account** — display name, email, strong password (Argon2id).
2. **Household** — name; explain that new accounts default to private and sharing is explicit.
3. **Region** — country selection, used to offer the right bank-sync providers.
4. **Money format** — base currency, locale, timezone, first day of week; suggested from country but fully overridable.
5. **Optional demo data** — a small sample household so the dashboard is explorable before real data exists.
6. **Security** — prompt to enable TOTP 2FA and to record recovery codes.

All preferences remain editable in Settings later.

---

## 9. Ingestion pipeline

Every source follows the same path:

```
Source (manual | CSV/TSV | bank)
  → normalize (account, date, amount, payee, currency)
  → staging rows (import_batches)
  → apply categorization rules
  → compute dedupe hashes
  → preview + user review
  → atomic commit to transactions
```

### CSV/TSV specifics

- Auto-detect delimiter (comma, semicolon, tab) with manual override.
- Encoding: UTF-8 first; fall back to Windows-1252 with a warning.
- Date formats: configurable, with preview; handle day-first and month-first ambiguity explicitly.
- Decimal separator: comma or dot, per profile.
- Map columns: date, amount, payee/description, category, notes, debit/credit split, balance.
- Saved import profiles per account/bank, reusable each month.
- Rules: "payee contains X → category Y", priority-ordered; applied live in the preview.
- Duplicate detection on re-import; show skipped rows and why.
- Commit is a single database transaction; failures roll back the whole batch.
- Apple Numbers: prefer CSV/TSV export in UTF-8. PDF exports are out of scope for v1 because parsing them reliably is brittle.

### Bank sync (first release)

- A `BankProvider` trait with `link`, `sync`, and `revoke` operations; the provider is selected by the owner's country.
- Only aggregator tokens are stored (encrypted); never bank credentials.
- OAuth/consent flow per provider; track `consent_expires_at` and notify the owner before renewal is required.
- Scheduled syncs (daily) plus a manual "sync now"; handle pending vs. posted transactions and provider cursors.
- First sync always goes through staging and review. Later syncs auto-commit with duplicate detection, audit logging, and a visible sync history.
- `external_id` provides idempotency; re-syncs must never create duplicates.
- Only the account owner can link or unlink a private account. Shared accounts require owner authorization.
- Start aggregator onboarding and production approval during M2, because contracts and review can take weeks.

---

## 10. Security model

### Authentication

- Argon2id password hashing with per-user salts.
- Optional TOTP 2FA plus single-use recovery codes.
- Server-side sessions with opaque tokens; token hashes at rest; rotation on login; idle and absolute expiry; "sign out everywhere".
- Rate limiting and progressive backoff on login; generic error messages.
- Audit log for login, logout, password changes, 2FA changes, invites, and imports.

### Authorization

- Every query is scoped by `household_id` through a repository layer; never trust a client-supplied household ID without membership verification.
- **Private by default:** `visibility='private'` accounts are visible only to `owner_user_id`. Household admins have no override. Sharing (`visibility='household'`) is an explicit, audited owner action.
- Transactions and account-linked records inherit the account's visibility. Budgets, goals, and recurring rules are shared when `owner_user_id` is `NULL` and private to that user otherwise.
- **Reporting isolation:** personal dashboards aggregate only accounts the viewer can access; household dashboards and shared reports aggregate shared accounts only. Private balances never leak into a shared aggregate.
- Ownership transfer and account deletion require owner confirmation; all visibility changes are audit-logged.
- v1 supports private vs. household-wide sharing. Per-member sharing is a later extension.
- Public-release hardening will add PostgreSQL row-level security as defense in depth.

### Application security

- Parameterized queries only (SQLx).
- Strict CORS (same origin), `SameSite=Lax` cookies, Origin checks, and CSRF tokens on mutations.
- CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, and frame denial.
- Validation and size limits on all uploads; import files parsed in a bounded worker.
- No secrets or sensitive values in logs; request IDs for correlation.

### Data protection

- Encrypt bank tokens and TOTP seeds at rest with a key held outside PostgreSQL.
- Full-disk encryption on the host (LUKS or BitLocker).
- Nightly encrypted `pg_dump` backups to offsite object storage (age/GPG), with retention and tested restores.
- Minimize retained data: no bank credentials, masked account numbers.

### Operations

- Automatic OS security updates on the host.
- Dependency scanning and prompt upgrades.
- Uptime and error monitoring with alerting.
- Documented incident response and key-rotation procedure.

### Public-launch note

Serving other people's financial data adds legal and operational obligations (privacy law, breach notification, terms of service, data export/deletion). That work belongs to the public-readiness milestone, not v1.

---

## 11. Deployment

### Home server (family phase)

```
Internet
  → Cloudflare (TLS, DDoS protection)
  → Cloudflare Tunnel (no open ports)
  → Caddy (static SPA + /api reverse proxy)
  → Rust API
  → PostgreSQL (internal Docker network, no host port)
```

- Cloudflare Tunnel + optional Cloudflare Access as an outer gate; the app still enforces its own login.
- Docker Compose with health checks and restart policies.
- Nightly backup job: `pg_dump` → age encryption → Backblaze B2/S3; 7 daily, 4 weekly, 12 monthly.
- Restore drill documented and performed at least once before relying on it.
- Home-server reality: power loss, disk failure, fire/theft. Offsite backups are non-negotiable.

### Cloud (public phase)

- Same containers on a VPS (Hetzner, Fly.io) or Google Cloud Run + Cloud SQL.
- Managed PostgreSQL, object storage for backups, external uptime monitoring.
- **Firebase is not recommended** for the core app: NoSQL, vendor lock-in, and a client-centric security model do not fit relational financial data. If Google is preferred, use Cloud Run + Cloud SQL with the existing Postgres schema.

---

## 12. Milestones

| # | Milestone | Definition of done |
|---|---|---|
| M0 | Walking skeleton | Monorepo, Docker Postgres, Axum `/health`, React shell, CI green |
| M1 | Identity & households | Setup wizard, login/logout, sessions, household roles, audit events |
| M2 | Accounts & transactions | Account and transaction CRUD, transfers, filters, balances correct to the cent; privacy-matrix tests (owner/member/admin) pass |
| M3 | CSV/TSV import | Mapping UI, saved profiles, preview, dedupe, categorization rules, atomic commit |
| M4 | Dashboard | KPIs and charts reconcile with ledger; net worth history; date-range filters; shared vs. personal aggregates respect visibility |
| M5 | Steering | Budgets, recurring payments, savings goals, Safe to Spend |
| M6 | Bank sync | Provider abstraction and one production provider for the first supported country; consent renewal, encrypted tokens, scheduled sync, idempotent re-syncs |
| M7 | Self-host release | Tunnel, 2FA, encrypted backups, restore drill, monitoring |
| M8 | Public readiness | Signup, email verification/reset, RLS, legal pages, load/security review |

**First release = M0–M7.** M8 is public readiness after the family release. Aggregator onboarding starts during M2 because approval timelines are outside our control.

### Safe to Spend (definition)

```
projected income
  − recurring bills due before next income
  − planned savings contributions
  − remaining budget commitments
  = safe to spend
```

Shown as a range with assumptions visible, never as a guarantee.

---

## 13. Rust onboarding plan (new to Rust)

Because this is a first Rust project, the build is structured to teach while shipping:

- **Before/alongside M0:** Rust Book chapters 1–10 and Rustlings exercises (ownership, borrowing, structs, enums, `Result`/`Option`, traits, modules).
- **Concepts used here:** async/await with Tokio, `serde` for JSON, SQLx for database access, `thiserror` for domain errors, `tracing` for logs, Axum extractors and middleware.
- **Approach:** each milestone starts with a short walkthrough of the Rust involved, then a small vertical slice, then review. I write the initial scaffold with explanatory comments; you type and modify parts as confidence grows.
- **Keep it simple:** concrete handler functions, one module per domain, no premature generics, macros, or trait-object architecture. Introduce patterns only when the code demands them.
- **Tooling:** rust-analyzer, `cargo fmt`, `cargo clippy`, `cargo watch`, `sqlx-cli`, Docker Desktop.
- **Expectation:** Rust's compiler is strict and will slow the first weeks. That strictness is the point; compile errors are the pair-programmer.

---

## 14. Open decisions

1. **Project location** — settled: `C:\Users\shova\Documents\Expenser` (local Documents, outside OneDrive). Initialize git during M0.
2. **Git remote** — settled: <https://github.com/amit0604/Expenser>.
3. **Email** — admin-created family accounts in v1; SMTP/provider needed for invitations and password reset later.
4. **Bank country and aggregator** — the first supported country determines the provider. Needed before M6, with onboarding started during M2. Candidates: Plaid (US/Canada), GoCardless/TrueLayer/Tink (EU/UK), others by region.
5. **Aggregator cost** — production access may involve monthly fees or per-connection charges; budget for it before M6.
6. **Design direction** — settled for v1: “Evergreen Fortune” — deep forest, growth emerald, champagne gold, warm ivory, sage, terracotta. See `docs/design/PALETTE.md`.
7. **Multi-currency timing** — after family release, before or alongside public launch.

---

## 15. Revision history

- **v0.3 — 2026-11-21:** M1 identity/household spec added; `households.country_code` added for region-aware setup and bank provider selection; Evergreen Fortune palette adopted; GitHub remote recorded.
- **v0.2 — 2026-11-20:** Personal accounts private by default with explicit sharing; bank sync moved into the first release; first-release scope confirmed as M0–M7.
- **v0.1 — 2026-11-20:** Initial plan.
