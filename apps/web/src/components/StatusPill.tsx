import type { ReactNode } from 'react'

type Tone = 'ok' | 'warn' | 'error' | 'neutral'

const toneClasses: Record<Tone, { pill: string; dot: string }> = {
  ok: {
    pill: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    dot: 'bg-emerald-400',
  },
  warn: {
    pill: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
    dot: 'bg-amber-400',
  },
  error: {
    pill: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
    dot: 'bg-rose-400',
  },
  neutral: {
    pill: 'border-slate-600/40 bg-slate-800/40 text-slate-300',
    dot: 'bg-slate-400',
  },
}

type StatusPillProps = {
  tone: Tone
  children: ReactNode
}

export function StatusPill({ tone, children }: StatusPillProps) {
  const classes = toneClasses[tone]

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium ${classes.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${classes.dot}`} />
      {children}
    </span>
  )
}
