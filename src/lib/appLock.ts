import type { LockSettings } from './storage'

// 로컬 앱 잠금(PIN). PIN 평문은 절대 저장하지 않는다.
// Web Crypto의 PBKDF2로 salt와 함께 파생값만 저장하고, 검증 시 재파생해 비교한다.
// 모든 처리는 브라우저 안에서만 이뤄지며 네트워크로 나가지 않는다.

const PBKDF2_ITERATIONS = 150_000

function toBase64(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}
function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function derive(pin: string, salt: Uint8Array): Promise<string> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256,
  )
  return toBase64(new Uint8Array(bits))
}

export function lockSupported(): boolean {
  return typeof crypto !== 'undefined' && !!crypto.subtle
}

export async function createLock(pin: string, autoLockMinutes: number): Promise<LockSettings> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await derive(pin, salt)
  return { enabled: true, salt: toBase64(salt), hash, autoLockMinutes }
}

export async function verifyPin(pin: string, lock: LockSettings): Promise<boolean> {
  try {
    const candidate = await derive(pin, fromBase64(lock.salt))
    // 길이가 같으므로 단순 비교로 충분(로컬 전용, 타이밍 공격 표면 없음)
    return candidate === lock.hash
  } catch {
    return false
  }
}
