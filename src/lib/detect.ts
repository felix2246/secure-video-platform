import { isEncryptedBytes } from "./fileFormat"

export async function isEncryptedFile(file: File): Promise<boolean> {
  const headerBuffer = await file.slice(0, 4).arrayBuffer()
  return isEncryptedBytes(new Uint8Array(headerBuffer))
}
