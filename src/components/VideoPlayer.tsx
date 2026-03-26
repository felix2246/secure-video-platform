import { useEffect, useMemo } from "react"

type Props = {
  file: File | Blob
}

export default function VideoPlayer({ file }: Props) {
  const src = useMemo(() => URL.createObjectURL(file), [file])

  useEffect(() => {
    return () => URL.revokeObjectURL(src)
  }, [src])

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-sm">
      <video
        key={src}
        className="w-full bg-black"
        src={src}
        controls
        preload="metadata"
        playsInline
      />
    </div>
  )
}
