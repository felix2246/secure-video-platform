import { useState } from "react"

type Props = {
  disabled: boolean
  error: string | null
  onDecrypt: (password: string) => Promise<void>
}

export default function DecryptPanel({ disabled, error, onDecrypt }: Props) {
  const [password, setPassword] = useState("")

  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/55 backdrop-blur-sm">
      <div className="w-[92%] max-w-lg rounded-xl border border-zinc-600 bg-zinc-900/95 p-5 shadow-lg">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-emerald-500/50 bg-emerald-950/50">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
        <h3 className="text-center text-lg font-semibold text-zinc-100">Encrypted Video</h3>
        <p className="mt-1 text-center text-sm text-zinc-400">
          Enter password to decrypt in memory and play.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="password"
            placeholder="Decryption password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
          />
          <button
            type="button"
            disabled={disabled || !password}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-900"
            onClick={() => onDecrypt(password)}
          >
            Decrypt
          </button>
        </div>
        {error && (
          <p className="mt-3 rounded-lg border border-rose-700/60 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
