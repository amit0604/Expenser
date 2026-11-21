import {
  Activity,
  Database,
  LineChart,
  PieChart,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Card } from '../components/Card'
import { StatusPill } from '../components/StatusPill'
import { useHealth, useReadiness } from '../lib/api'

const kpis = [
  {
    label: 'Net worth',
    value: '—',
    hint: 'Accounts and balances arrive in M2',
  },
  {
    label: 'Income this month',
    value: '—',
    hint: 'Ledger and imports arrive in M2–M3',
  },
  {
    label: 'Expenses this month',
    value: '—',
    hint: 'Ledger and imports arrive in M2–M3',
  },
  {
    label: 'Savings rate',
    value: '—',
    hint: 'Budgets and goals arrive in M5',
  },
]

const todayLabel = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'long',
}).format(new Date())

function ChartPlaceholder({
  title,
  description,
  kind,
  className = '',
}: {
  title: string
  description: string
  kind: 'line' | 'pie'
  className?: string
}) {
  const Icon = kind === 'line' ? LineChart : PieChart

  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>
        <Icon className="h-4 w-4 shrink-0 text-slate-500" />
      </div>

      <div className="mt-6 flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-slate-950/30 px-6 text-center">
        <Icon className="h-6 w-6 text-slate-600" />
        <p className="mt-3 text-sm font-medium text-slate-300">
          Waiting for the ledger
        </p>
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
          This chart fills in once transactions and account balances exist. The
          data model is already planned.
        </p>
      </div>
    </Card>
  )
}

export function DashboardPage() {
  const health = useHealth()
  const readiness = useReadiness()

  const apiTone = health.isPending
    ? 'neutral'
    : health.isError
      ? 'error'
      : 'ok'
  const apiLabel = health.isPending
    ? 'Checking…'
    : health.isError
      ? 'Offline'
      : 'Online'
  const apiDetail = health.data
    ? `${health.data.service} v${health.data.version}`
    : 'Waiting for response'

  const databaseUp = readiness.data?.database === 'up'
  const databaseTone = readiness.isPending
    ? 'neutral'
    : readiness.isError
      ? 'error'
      : databaseUp
        ? 'ok'
        : 'warn'
  const databaseLabel = readiness.isPending
    ? 'Checking…'
    : readiness.isError
      ? 'Unreachable'
      : databaseUp
        ? 'Connected'
        : 'Unavailable'
  const databaseDetail = readiness.data
    ? `status: ${readiness.data.status}`
    : 'Waiting for response'

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
            Overview
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            Your money, in one place.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            {todayLabel} · The cockpit is live. Financial modules arrive
            milestone by milestone.
          </p>
        </div>

        <StatusPill tone="ok">
          <ShieldCheck className="h-3.5 w-3.5" />
          Private workspace
        </StatusPill>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              {kpi.label}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
              {kpi.value}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              {kpi.hint}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <ChartPlaceholder
          title="Cash flow"
          description="Income vs. expenses over time"
          kind="line"
          className="lg:col-span-3"
        />
        <ChartPlaceholder
          title="Spending by category"
          description="Where the money actually goes"
          kind="pie"
          className="lg:col-span-2"
        />
      </div>

      <Card className="mt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Service health</h2>
            <p className="mt-1 text-xs text-slate-400">
              Live checks against the Rust API and PostgreSQL.
            </p>
          </div>
          <Activity className="h-4 w-4 shrink-0 text-slate-500" />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-400">API</span>
              <StatusPill tone={apiTone}>{apiLabel}</StatusPill>
            </div>
            <p className="mt-3 text-xs text-slate-500">{apiDetail}</p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-400">
                Database
              </span>
              <StatusPill tone={databaseTone}>{databaseLabel}</StatusPill>
            </div>
            <p className="mt-3 text-xs text-slate-500">{databaseDetail}</p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-400">Mode</span>
              <StatusPill tone="neutral">Development</StatusPill>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Local data · no external analytics
            </p>
          </div>
        </div>
      </Card>

      <Card className="mt-6 border-emerald-400/10 bg-emerald-400/[0.03]">
        <div className="flex gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Next: M1 — identity &amp; households
            </h2>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-400">
              The setup wizard, secure sessions, household roles, and privacy
              model come next. M0 already proves the browser, Rust API, and
              PostgreSQL can talk to each other.
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-6 flex items-center gap-2 text-[11px] text-slate-600">
        <Database className="h-3.5 w-3.5" />
        <span>
          M0 walking skeleton · API, web shell, Postgres, and CI
        </span>
      </div>
    </div>
  )
}
