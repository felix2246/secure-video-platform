export const VENC_MAGIC = "VENC"
const VENC_MAGIC_BYTES = new TextEncoder().encode(VENC_MAGIC)
const VERSION = 1
const HEADER_LENGTH = 4 + 1 + 16 + 12

export type ParsedEncryptedPayload = {
  version: number
  salt: Uint8Array
  iv: Uint8Array
  ciphertext: Uint8Array
}

export function isEncryptedBytes(bytes: Uint8Array): boolean {
  if (bytes.length < 4) {
    return false
  }

  for (let index = 0; index < 4; index += 1) {
    if (bytes[index] !== VENC_MAGIC_BYTES[index]) {
      return false
    }
  }
  return true
}

export function packEncryptedPayload(
  salt: Uint8Array,
  iv: Uint8Array,
  ciphertext: Uint8Array,
): Uint8Array {
  const payload = new Uint8Array(HEADER_LENGTH + ciphertext.length)
  payload.set(VENC_MAGIC_BYTES, 0)
  payload[4] = VERSION
  payload.set(salt, 5)
  payload.set(iv, 21)
  payload.set(ciphertext, HEADER_LENGTH)
  return payload
}

export function parseEncryptedPayload(bytes: Uint8Array): ParsedEncryptedPayload {
  if (bytes.length < HEADER_LENGTH + 16) {
    throw new Error("Encrypted file is too short.")
  }

  if (!isEncryptedBytes(bytes)) {
    throw new Error("Invalid encrypted file header.")
  }

  const version = bytes[4]
  if (version !== VERSION) {
    throw new Error(`Unsupported encrypted file version: ${version}`)
  }

  return {
    version,
    salt: bytes.slice(5, 21),
    iv: bytes.slice(21, HEADER_LENGTH),
    ciphertext: bytes.slice(HEADER_LENGTH),
  }
}
