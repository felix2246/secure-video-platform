import { useRef, useState } from "react"

type Props = {
  onFileSelected: (file: File) => void
  busy: boolean
}

const ACCEPTED_TYPES =
  ".mp4,.webm,.mov,.avi,.mkv,.m4v,.ogg,.ogv,.enc,video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska"

export default function FileDropZone({ onFileSelected, busy }: Props) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function pickFile(fileList: FileList | null) {
    if (busy || !fileList || fileList.length === 0) {
      return
    }
    onFileSelected(fileList[0])
  }

  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        dragActive ? "border-emerald-500 bg-zinc-800" : "border-zinc-700 bg-zinc-900/80"
      }`}
      onDragOver={(event) => {
        event.preventDefault()
        setDragActive(true)
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragActive(false)
        pickFile(event.dataTransfer.files)
      }}
    >
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">Open a video file</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Drag and drop a video or encrypted `.enc` file.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-900"
          onClick={() => inputRef.current?.click()}
        >
          Browse Files
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={ACCEPTED_TYPES}
        onChange={(event) => pickFile(event.target.files)}
      />
    </div>
  )
}
