# Development Pipeline

Every milestone is delivered through the same five-role pipeline. The point is
independent verification: the person who writes the code does not get to sign it
off, and the person who finds a problem does not silently patch it.

```
Implementer
    │
    ▼
Verifier ──────► fix loop
    │
    ├──────────────┐
    ▼              ▼
Code reviewer   Security reviewer
    │              │
    └──────┬───────┘
           ▼
     Review writer
           │
           ▼
   Main agent: final checks, screenshots, commit, push
```

## Roles

| Role | Responsibility | May edit code? | Output |
|---|---|---|---|
| **Implementer** | Builds the milestone from the spec, writes tests, runs the local checks | Yes | Working tree + implementation report |
| **Verifier** | Independently runs format, lint, build, tests, and API smoke checks; probes the acceptance criteria | Only mechanical fixes if the main agent asks | `docs/reviews/<milestone>-verification.md` |
| **Code reviewer** | Reviews design, correctness, maintainability, error handling, and fit with `PLAN.md` | No | `docs/reviews/<milestone>-code-review.md` |
| **Security reviewer** | Reviews authn/authz, sessions, CSRF, input validation, secrets, logging, rate limits, and privacy boundaries | No | `docs/reviews/<milestone>-security-review.md` |
| **Review writer** | Reads all reports, checks that findings were addressed, and issues a final verdict | No | `docs/reviews/<milestone>-final-review.md` |

The main agent orchestrates the pipeline, resolves disagreements, applies the
palette and product decisions, captures README screenshots, and makes the commit.

## Gates

A milestone is not done until all of these are true:

1. The implementer's local checks pass.
2. The verifier independently reproduces those checks and reports no unresolved
   failures.
3. The code review has no unresolved **blocking** findings.
4. The security review has no unresolved **critical** or **high** findings.
5. The review writer issues a **ship** verdict.
6. The main agent confirms the working tree, the screenshots, and the final
   commit.

Findings are classified as `critical`, `high`, `medium`, `low`, or `nit`.
Critical/high findings route back to the implementer for a fix and then back
through the relevant reviewer. Medium findings need an explicit decision:
fix now or schedule into a named later milestone. Low/nit findings may ship.

## Commands the verifier runs

```powershell
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace

pnpm --filter @expenser/web lint
pnpm --filter @expenser/web build
```

Plus live API smoke checks against a running Postgres container. The verifier
must not rely only on the implementer's summary.

## Review artifacts

Reports live under `docs/reviews/`. Each report names the milestone, the role,
the exact commands or probes performed, the findings with severity, and a clear
verdict. The review writer links the three reports and records the final
decision.

## Security review checklist

- Password hashing parameters and upgrade path.
- Session token entropy, hashing at rest, cookie flags, expiry, rotation,
  revocation, and fixation.
- CSRF and Origin enforcement on every state-changing route.
- Login rate limiting and generic error messages.
- Input validation, length limits, and normalization.
- SQL injection surface (parameterized queries only).
- Authorization: household scoping, role checks, and no trusted client IDs.
- Secrets in environment, logs, error bodies, and the repository.
- Audit-log coverage for security-relevant actions.
- Security headers and cache behavior.
- Privacy boundaries from `PLAN.md` (private accounts, no admin override).

## Rules

- No force pushes, no history rewrites, no secrets in git.
- The implementer does not commit; the main agent commits after the final review.
- Reviewers read the code and run their own probes; they do not trust summaries.
- A review report is not a substitute for a failing test. Reproduce first.
- If a finding is deferred, name the milestone that owns it.
