import { useState } from "react"

type Props = {
  disabled: boolean
  onEncrypt: (password: string) => Promise<void>
}

export default function EncryptPanel({ disabled, onEncrypt }: Props) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-zinc-100">Encrypt & Save</h3>
      <p className="mt-1 text-sm text-zinc-400">
        Set a strong password. The output will be saved as a `.enc` file.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          type="password"
          placeholder="Encryption password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
        />
      </div>
      {mismatch && (
        <p className="mt-2 text-sm text-rose-400">Passwords do not match.</p>
      )}
      <button
        type="button"
        disabled={disabled || !password || mismatch}
        className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-900"
        onClick={() => onEncrypt(password)}
      >
        Encrypt & Save
      </button>
    </div>
  )
}
