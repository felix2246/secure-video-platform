import { useMemo, useState } from "react"
import FileDropZone from "./components/FileDropZone"
import VideoPlayer from "./components/VideoPlayer"
import { decryptVideo, encryptVideo } from "./lib/crypto"
import { isEncryptedFile } from "./lib/detect"

type Mode = "none" | "plain" | "encrypted"

function inferMimeTypeFromName(fileName: string): string {
  const normalized = fileName.toLowerCase()
  const withoutEnc = normalized.endsWith(".enc") ? normalized.slice(0, -4) : normalized

  if (withoutEnc.endsWith(".webm")) return "video/webm"
  if (withoutEnc.endsWith(".mov")) return "video/quicktime"
  if (withoutEnc.endsWith(".avi")) return "video/x-msvideo"
  if (withoutEnc.endsWith(".mkv")) return "video/x-matroska"
  if (withoutEnc.endsWith(".ogv") || withoutEnc.endsWith(".ogg")) return "video/ogg"
  if (withoutEnc.endsWith(".m4v")) return "video/mp4"
  return "video/mp4"
}

function downloadEncryptedFile(payload: Uint8Array, originalName: string) {
  const blob = new Blob([Uint8Array.from(payload)], { type: "application/octet-stream" })
  const link = document.createElement("a")
  const fileName = originalName.endsWith(".enc") ? originalName : `${originalName}.enc`
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  link.click()
  URL.revokeObjectURL(link.href)
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [decryptedBlob, setDecryptedBlob] = useState<Blob | null>(null)
  const [mode, setMode] = useState<Mode>("none")
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState("Select a video or encrypted file to get started.")
  const [error, setError] = useState<string | null>(null)
  const [encryptPassword, setEncryptPassword] = useState("")
  const [encryptConfirmPassword, setEncryptConfirmPassword] = useState("")
  const [decryptPassword, setDecryptPassword] = useState("")

  const playable = useMemo(() => {
    if (mode === "plain" && selectedFile) {
      return selectedFile
    }
    if (mode === "encrypted" && decryptedBlob) {
      return decryptedBlob
    }
    return null
  }, [decryptedBlob, mode, selectedFile])

  const overlayDecryptError = mode === "encrypted" && !decryptedBlob ? error : null
  const encryptMismatch =
    encryptConfirmPassword.length > 0 && encryptPassword !== encryptConfirmPassword

  async function handleFileSelected(file: File) {
    setBusy(true)
    setError(null)
    setDecryptedBlob(null)
    setSelectedFile(file)
    setEncryptPassword("")
    setEncryptConfirmPassword("")
    setDecryptPassword("")

    try {
      const encrypted = await isEncryptedFile(file)
      if (encrypted) {
        setMode("encrypted")
        setStatus(`Encrypted file loaded: ${file.name}. Enter password to decrypt.`)
      } else {
        setMode("plain")
        setStatus(`Unencrypted video loaded: ${file.name}. Playing immediately.`)
      }
    } catch (err) {
      setMode("none")
      setError(err instanceof Error ? err.message : "Failed to inspect file.")
      setStatus("Unable to load file.")
    } finally {
      setBusy(false)
    }
  }

  async function handleEncrypt(password: string) {
    if (!selectedFile || mode !== "plain") {
      return
    }

    setBusy(true)
    setError(null)
    setStatus("Encrypting file...")
    try {
      const payload = await encryptVideo(selectedFile, password)
      downloadEncryptedFile(payload, selectedFile.name)
      setStatus("Encryption complete. Encrypted file downloaded.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Encryption failed.")
      setStatus("Encryption failed.")
    } finally {
      setBusy(false)
    }
  }

  async function handleDecrypt(password: string) {
    if (!selectedFile || mode !== "encrypted") {
      return
    }

    setBusy(true)
    setError(null)
    setStatus("Decrypting in memory...")
    try {
      const bytes = new Uint8Array(await selectedFile.arrayBuffer())
      const mimeType = inferMimeTypeFromName(selectedFile.name)
      const decrypted = await decryptVideo(bytes, password, mimeType)
      setDecryptedBlob(decrypted)
      setStatus("Decryption successful. Playing decrypted video from memory.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Decryption failed.")
      setStatus("Decryption failed.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-5 p-4 md:p-8">
      <header className="px-1 py-2">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100 md:text-2xl">
          Video Encryption Platform
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Open, protect, and unlock videos locally in your browser.
        </p>
      </header>

      <FileDropZone onFileSelected={handleFileSelected} busy={busy} />
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
      {(selectedFile || playable) && (
        <section className="overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-700 px-4 py-3 text-sm text-zinc-400">
            {selectedFile ? selectedFile.name : status}
          </div>

          <div className="p-4">
            {playable && <VideoPlayer file={playable} />}
            {mode === "encrypted" && !decryptedBlob && (
              <div className="relative">
                <div className="aspect-video w-full rounded-xl border border-zinc-700 bg-linear-to-br from-zinc-900 to-zinc-800" />
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/55 backdrop-blur-sm">
                  <div className="w-[92%] max-w-lg rounded-xl border border-zinc-600 bg-zinc-900/95 p-5 shadow-lg">
                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-emerald-500/50 bg-emerald-950/50">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5 text-emerald-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="5" y="11" width="14" height="10" rx="2" />
                        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                      </svg>
                    </div>
                    <h3 className="text-center text-lg font-semibold text-zinc-100">
                      Encrypted Video
                    </h3>
                    <p className="mt-1 text-center text-sm text-zinc-400">
                      Enter password to decrypt in memory and play.
                    </p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <input
                        type="password"
                        placeholder="Decryption password"
                        value={decryptPassword}
                        onChange={(event) => setDecryptPassword(event.target.value)}
                        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
                      />
                      <button
                        type="button"
                        disabled={busy || !decryptPassword}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-900"
                        onClick={() => handleDecrypt(decryptPassword)}
                      >
                        Decrypt
                      </button>
                    </div>
                    {overlayDecryptError && (
                      <p className="mt-3 rounded-lg border border-rose-700/60 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">
                        {overlayDecryptError}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {mode === "plain" && (
            <div className="border-t border-zinc-700 px-4 py-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
                Protect this video
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                Encrypt and download a secured `.enc` copy.
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <input
                  type="password"
                  placeholder="Encryption password"
                  value={encryptPassword}
                  onChange={(event) => setEncryptPassword(event.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
                />
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={encryptConfirmPassword}
                  onChange={(event) => setEncryptConfirmPassword(event.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
                />
                <button
                  type="button"
                  disabled={busy || !encryptPassword || encryptMismatch}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-900"
                  onClick={() => handleEncrypt(encryptPassword)}
                >
                  Encrypt & Save
                </button>
              </div>
              {encryptMismatch && (
                <p className="mt-2 text-sm text-rose-400">Passwords do not match.</p>
              )}
            </div>
          )}
        </section>
      )}
    </main>
  )
}

export default App
