import type {
  LogEntry,
  Phrase,
  ManualEntry,
  WorkSession,
  AuditHistory,
  Nationality,
} from '../types'
import { DEFAULT_PHRASES } from '../data/phraseTemplates'
import { computeRetentionUntil, DEFAULT_RETENTION_DAYS } from './retention'
import { idbAvailable, idbDriver } from './idb'

// ---------------------------------------------------------------------------
// Storage abstraction.
// Phase 2: 기본 구현체는 IndexedDB, 불가 시 localStorage 로 폴백한다.
// 인터페이스는 async(Promise) 이며, 어떤 경우에도 데이터는 브라우저 로컬에만
// 존재하고 네트워크로 나가지 않는다.
// ---------------------------------------------------------------------------

interface StorageDriver {
  read<T>(key: string, fallback: T): Promise<T>
  write<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
}

const localStorageDriver: StorageDriver = {
  async read<T>(key: string, fallback: T): Promise<T> {
    try {
      const raw = localStorage.getItem(key)
      if (raw == null) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  },
  async write<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value))
  },
  async remove(key: string): Promise<void> {
    localStorage.removeItem(key)
  },
}

const KEYS = {
  logs: 'deskshield.logs.v1',
  phrases: 'deskshield.phrases.v1',
  manuals: 'deskshield.manuals.v1',
  session: 'deskshield.session.v1',
  audits: 'deskshield.audits.v1',
  settings: 'deskshield.settings.v1',
} as const

const MIGRATION_FLAG = 'deskshield.migratedToIdb.v1'

// localStorage → IndexedDB 1회 마이그레이션.
// 각 키를 IDB로 옮긴 뒤에만 localStorage에서 제거해 데이터 손실을 막는다.
async function migrateFromLocalStorage(): Promise<void> {
  if (typeof localStorage === 'undefined') return
  if (localStorage.getItem(MIGRATION_FLAG)) return
  for (const key of Object.values(KEYS)) {
    const raw = localStorage.getItem(key)
    if (raw == null) continue
    try {
      await idbDriver.write(key, JSON.parse(raw))
      localStorage.removeItem(key) // 업무 데이터가 두 곳에 남지 않도록 정리
    } catch {
      // 이 키 마이그레이션 실패 시 localStorage에 남겨두고 다음 키 진행
    }
  }
  localStorage.setItem(MIGRATION_FLAG, '1')
}

// 드라이버 선택은 1회만 수행하고 캐시한다.
let driverPromise: Promise<StorageDriver> | null = null
async function selectDriver(): Promise<StorageDriver> {
  if (await idbAvailable()) {
    await migrateFromLocalStorage()
    return idbDriver
  }
  return localStorageDriver
}
function getDriver(): Promise<StorageDriver> {
  if (!driverPromise) driverPromise = selectDriver()
  return driverPromise
}

const driver: StorageDriver = {
  async read<T>(key: string, fallback: T): Promise<T> {
    return (await getDriver()).read(key, fallback)
  },
  async write<T>(key: string, value: T): Promise<void> {
    return (await getDriver()).write(key, value)
  },
  async remove(key: string): Promise<void> {
    return (await getDriver()).remove(key)
  },
}

export interface LockSettings {
  enabled: boolean
  salt: string // base64
  hash: string // base64 PBKDF2 파생값 (PIN 평문은 저장하지 않음)
  autoLockMinutes: number
}

export interface AppSettings {
  onboardingAcknowledged: boolean
  retentionDays: number
  recentCountryCodes: string[]
  recentPresetIds: string[]
  lock?: LockSettings
}

const DEFAULT_SETTINGS: AppSettings = {
  onboardingAcknowledged: false,
  retentionDays: DEFAULT_RETENTION_DAYS,
  recentCountryCodes: [],
  recentPresetIds: [],
}

// ---- ids / time (browser only; safe to use crypto/Date here) ----
export function newId(prefix = 'log'): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36)
  return `${prefix}_${rand}`
}

export function nowISO(): string {
  return new Date().toISOString()
}

// ---- factories ----
export function createEmptyLog(retentionDays = DEFAULT_RETENTION_DAYS): LogEntry {
  const created = nowISO()
  return {
    id: newId('log'),
    createdAt: created,
    updatedAt: created,
    visaStatus: '기타',
    nationality: { mode: 'not_recorded' },
    caseType: '기타',
    guidanceScope: [],
    queueTicketType: 'not_issued',
    counterReferral: { mode: 'not_referred' },
    handlingCounter: { mode: 'not_referred' },
    visitStatus: 'completed',
    reservationRef: { mode: 'none' },
    nonIdentifyingKeywords: [],
    safetyPhraseUsed: [],
    usedPhraseIds: [],
    usedPhraseSnapshots: [],
    handedOffToOfficer: 'unknown',
    riskLevel: null,
    confidenceLevel: null,
    reviewFlags: [],
    memo: '',
    privacyWarningAcknowledged: false,
    detectedRiskKeywords: [],
    detectedPrivacyPatterns: [],
    detectedRiskCombinations: [],
    retentionUntil: computeRetentionUntil(created, retentionDays),
    isPinnedForRetention: false,
    incomplete: false,
  }
}

// ---- Logs ----
export async function loadLogs(): Promise<LogEntry[]> {
  return driver.read<LogEntry[]>(KEYS.logs, [])
}
export async function saveLogs(logs: LogEntry[]): Promise<void> {
  await driver.write(KEYS.logs, logs)
}

// ---- Phrases (seed defaults on first load) ----
export async function loadPhrases(): Promise<Phrase[]> {
  const existing = await driver.read<Phrase[] | null>(KEYS.phrases, null)
  if (existing && existing.length) return existing
  await driver.write(KEYS.phrases, DEFAULT_PHRASES)
  return DEFAULT_PHRASES
}
export async function savePhrases(phrases: Phrase[]): Promise<void> {
  await driver.write(KEYS.phrases, phrases)
}

// ---- Manuals ----
export async function loadManuals(): Promise<ManualEntry[] | null> {
  return driver.read<ManualEntry[] | null>(KEYS.manuals, null)
}
export async function saveManuals(m: ManualEntry[]): Promise<void> {
  await driver.write(KEYS.manuals, m)
}

// ---- Work session ----
export async function loadSession(): Promise<WorkSession | null> {
  return driver.read<WorkSession | null>(KEYS.session, null)
}
export async function saveSession(s: WorkSession | null): Promise<void> {
  await driver.write(KEYS.session, s)
}

// ---- Audits ----
export async function loadAudits(): Promise<AuditHistory[]> {
  return driver.read<AuditHistory[]>(KEYS.audits, [])
}
export async function saveAudits(a: AuditHistory[]): Promise<void> {
  await driver.write(KEYS.audits, a)
}

// ---- Settings ----
export async function loadSettings(): Promise<AppSettings> {
  const s = await driver.read<Partial<AppSettings>>(KEYS.settings, {})
  return { ...DEFAULT_SETTINGS, ...s }
}
export async function saveSettings(s: AppSettings): Promise<void> {
  await driver.write(KEYS.settings, s)
}

// ---- Danger: wipe everything (긴급 삭제 / 초기화) ----
export async function wipeAllData(): Promise<void> {
  // 활성 드라이버(IDB 또는 localStorage)와 잔여 localStorage 사본을 모두 제거한다.
  await Promise.all(Object.values(KEYS).map((k) => driver.remove(k).catch(() => {})))
  if (typeof localStorage !== 'undefined') {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
  }
}

// ---- One-line summary (개인정보 미포함) ----
export function summarizeLog(
  log: LogEntry,
  labels: { queue: (v: LogEntry['queueTicketType']) => string; nationality: (n: Nationality) => string },
): string {
  const counter = log.counterReferral ?? { mode: 'not_referred' as const }
  const counterPart =
    counter.mode === 'referred'
      ? counter.counterLabel ?? (counter.counterNumber ? `${counter.counterNumber}번 창구` : '창구 안내')
      : counter.mode === 'unknown'
        ? '창구 기억 안 남'
        : '창구 안내 없음'
  const handled = log.handlingCounter ?? { mode: 'not_referred' as const }
  const handledPart =
    handled.mode === 'referred'
      ? `응대 ${handled.counterLabel ?? (handled.counterNumber ? `${handled.counterNumber}번 창구` : '창구')}`
      : handled.mode === 'unknown'
        ? '응대 창구 기억 안 남'
        : ''
  const reservationPart =
    log.reservationRef?.value && log.reservationRef.mode !== 'none'
      ? `예약 ${log.reservationRef.value}`
      : ''
  const parts = [
    log.visaStatus,
    labels.nationality(log.nationality),
    log.caseType,
    reservationPart,
    labels.queue(log.queueTicketType) + ' 번호표',
    counterPart,
    handledPart,
    log.guidanceScope[0] ?? '안내범위 미선택',
    log.safetyPhraseUsed.length && !log.safetyPhraseUsed.includes('미사용')
      ? '안전문구 사용'
      : '안전문구 미사용',
    log.riskLevel ? `리스크 ${log.riskLevel}` : '리스크 미선택',
  ].filter(Boolean)
  return parts.join(' / ')
}
