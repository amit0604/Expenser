import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { AppShell } from './components/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

const rootRoute = createRootRoute({
  component: AppShell,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
})

const accountsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/accounts',
  component: () => (
    <PlaceholderPage
      title="Accounts"
      milestone="M2"
      description="Checking, savings, credit, cash, and loan accounts with live balances and private-by-default sharing."
    />
  ),
})

const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions',
  component: () => (
    <PlaceholderPage
      title="Transactions"
      milestone="M2"
      description="The ledger: manual entry, transfers, categorization, notes, search, and filters."
    />
  ),
})

const importsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/imports',
  component: () => (
    <PlaceholderPage
      title="Imports"
      milestone="M3"
      description="Upload CSV/TSV exports, map columns, save bank profiles, preview rows, and reject duplicates."
    />
  ),
})

const budgetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/budgets',
  component: () => (
    <PlaceholderPage
      title="Budgets"
      milestone="M5"
      description="Monthly category limits with progress, shared or personal to the account owner."
    />
  ),
})

const goalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/goals',
  component: () => (
    <PlaceholderPage
      title="Goals"
      milestone="M5"
      description="Savings targets, deadlines, progress, and the monthly contribution you need to get there."
    />
  ),
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => (
    <PlaceholderPage
      title="Settings"
      milestone="M1"
      description="Household members, base currency, locale, timezone, security, and account privacy."
    />
  ),
})

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  accountsRoute,
  transactionsRoute,
  importsRoute,
  budgetsRoute,
  goalsRoute,
  settingsRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
