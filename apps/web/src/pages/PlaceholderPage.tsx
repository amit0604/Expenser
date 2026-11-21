type PlaceholderPageProps = {
  title: string
  milestone: string
  description: string
}

export function PlaceholderPage({
  title,
  milestone,
  description,
}: PlaceholderPageProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
        {milestone}
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
        {description}
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/20 px-6 py-14 text-center">
        <p className="text-sm font-medium text-slate-300">
          This screen arrives in {milestone}.
        </p>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-500">
          The shell and navigation are wired now so the product shape stays
          visible while the data modules are built.
        </p>
      </div>
    </div>
  )
}
