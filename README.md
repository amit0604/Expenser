# Expenser

A private, household-aware personal-finance cockpit. The full product and architecture plan lives in [PLAN.md](./PLAN.md).

**Current status:** M0 complete (2026-11-21) — API, web shell, Postgres, and CI configuration. Next: M1, identity and households.

## Stack

- **API:** Rust, Axum, Tokio, SQLx, PostgreSQL
- **Web:** React, TypeScript, Vite, TanStack Router/Query, Tailwind CSS
- **Infra:** Docker Compose for local Postgres; Cloudflare Tunnel + Caddy for self-hosting later

## Repository layout

```
apps/
  api/        Rust API service
  web/        React single-page app
deploy/       Deployment assets (added in later milestones)
packages/     Shared generated types (added in later milestones)
compose.yaml  Local PostgreSQL
PLAN.md       Product and technical plan
```

## Prerequisites

- Rust stable (via [rustup](https://rustup.rs/))
- Node.js 24+ and pnpm
- Docker Desktop

## Local development

1. Copy the environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Start PostgreSQL:

   ```powershell
   docker compose up -d
   ```

3. Run the API (from the repository root):

   ```powershell
   cargo run -p expenser-api
   ```

   The API listens on <http://127.0.0.1:8081>. Check:
   - <http://127.0.0.1:8081/api/health> — liveness
   - <http://127.0.0.1:8081/api/ready> — database readiness

4. Install web dependencies and start the dev server:

   ```powershell
   pnpm install
   pnpm dev:web
   ```

   Open <http://localhost:5173>. Vite proxies `/api` to the Rust service.

## Checks

```powershell
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace

pnpm --filter @expenser/web lint
pnpm --filter @expenser/web build
```

## Milestones

M0 is the walking skeleton. The first release runs through M7; see [PLAN.md](./PLAN.md#12-milestones) for definitions of done.
