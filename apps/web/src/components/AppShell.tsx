import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import {
  ArrowLeftRight,
  LayoutDashboard,
  PieChart,
  Settings,
  ShieldCheck,
  Target,
  Upload,
  Wallet,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/accounts', label: 'Accounts', icon: Wallet, exact: false },
  {
    to: '/transactions',
    label: 'Transactions',
    icon: ArrowLeftRight,
    exact: false,
  },
  { to: '/imports', label: 'Imports', icon: Upload, exact: false },
  { to: '/budgets', label: 'Budgets', icon: PieChart, exact: false },
  { to: '/goals', label: 'Goals', icon: Target, exact: false },
  { to: '/settings', label: 'Settings', icon: Settings, exact: false },
] as const

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3 rounded-xl px-1 py-1">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400/10 text-sm font-bold text-emerald-300 ring-1 ring-emerald-400/20">
        E
      </span>
      <span>
        <span className="block text-sm font-semibold tracking-tight text-white">
          Expenser
        </span>
        <span className="block text-[11px] uppercase tracking-[0.18em] text-slate-500">
          Personal finance
        </span>
      </span>
    </Link>
  )
}

function NavLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <>
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.to
          : pathname.startsWith(item.to)
        const Icon = item.icon

        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={isActive ? 'page' : undefined}
            className={[
              'flex items-center gap-3 rounded-xl text-sm font-medium transition',
              mobile ? 'shrink-0 px-3 py-2' : 'px-3 py-2.5',
              isActive
                ? 'bg-slate-800/90 text-emerald-300'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100',
            ].join(' ')}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </>
  )
}

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-800/80 bg-slate-950/80 px-4 py-5 backdrop-blur lg:flex">
        <Brand />

        <nav className="mt-8 flex-1 space-y-1" aria-label="Primary">
          <NavLinks />
        </nav>

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Private by default
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
            Personal accounts stay owner-only until explicitly shared.
          </p>
        </div>

        <p className="mt-4 px-1 text-[11px] text-slate-600">
          M0 · walking skeleton
        </p>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/70 bg-slate-950/80 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="lg:hidden">
            <Brand />
          </div>

          <div className="hidden items-center gap-2 text-sm text-slate-400 lg:flex">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Private household workspace</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-500 sm:block">
              Plan v0.2
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-400/10 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
              S
            </span>
          </div>
        </header>

        <nav
          className="flex gap-1 overflow-x-auto border-b border-slate-800/70 bg-slate-950/60 px-3 py-2 lg:hidden"
          aria-label="Primary mobile"
        >
          <NavLinks mobile />
        </nav>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
