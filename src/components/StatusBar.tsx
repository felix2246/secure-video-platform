type Props = {
  status: string
  error: string | null
}

export default function StatusBar({ status, error }: Props) {
  return (
    <div className="space-y-2">
      <p className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">
        {status}
      </p>
      {error && (
        <p className="rounded-lg border border-rose-900 bg-rose-950/60 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      )}
    </div>
  )
}
