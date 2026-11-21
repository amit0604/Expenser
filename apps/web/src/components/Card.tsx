import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 shadow-xl shadow-slate-950/20 backdrop-blur ${className}`}
    >
      {children}
    </section>
  )
}
