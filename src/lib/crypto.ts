import { packEncryptedPayload, parseEncryptedPayload } from "./fileFormat"

const PBKDF2_ITERATIONS = 600_000
const SALT_BYTES = 16
const IV_BYTES = 12

async function importPassword(password: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  )
}

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  if (!password) {
    throw new Error("Password is required.")
  }

  const safeSalt = Uint8Array.from(salt)
  const baseKey = await importPassword(password)
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: safeSalt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
}

export async function encryptVideo(file: File, password: string): Promise<Uint8Array> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const key = await deriveKey(password, salt)
  const plainBytes = new Uint8Array(await file.arrayBuffer())

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: Uint8Array.from(iv) },
    key,
    plainBytes,
  )
  return packEncryptedPayload(salt, iv, new Uint8Array(encryptedBuffer))
}

export async function decryptVideo(
  encryptedBytes: Uint8Array,
  password: string,
  mimeType = "video/mp4",
): Promise<Blob> {
  const { salt, iv, ciphertext } = parseEncryptedPayload(encryptedBytes)
  const key = await deriveKey(password, salt)

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: Uint8Array.from(iv) },
      key,
      Uint8Array.from(ciphertext),
    )
    return new Blob([decryptedBuffer], { type: mimeType })
  } catch {
    throw new Error("Decryption failed. Wrong password or file tampering detected.")
  }
}
