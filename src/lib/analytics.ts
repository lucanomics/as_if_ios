import type { LogEntry } from '../types'

export function isToday(iso: string, today = new Date().toISOString().slice(0, 10)): boolean {
  return iso.slice(0, 10) === today
}

export function isThisWeek(iso: string, now = new Date()): boolean {
  const d = new Date(iso)
  const start = new Date(now)
  const day = (start.getDay() + 6) % 7 // 월요일 시작
  start.setDate(start.getDate() - day)
  start.setHours(0, 0, 0, 0)
  return d.getTime() >= start.getTime()
}

export function countBy<T extends string>(logs: LogEntry[], key: (l: LogEntry) => T | null): Record<string, number> {
  const out: Record<string, number> = {}
  for (const l of logs) {
    const k = key(l)
    if (k == null) continue
    out[k] = (out[k] ?? 0) + 1
  }
  return out
}

export interface ShiftReview {
  total: number
  incomplete: number
  riskKeyword: number
  riskCombo: number
  noSafetyPhrase: number
  privacySuspect: number
  handoffMissing: number
  nonReservation: number
}

export function computeShiftReview(logs: LogEntry[]): ShiftReview {
  const noPhrase = (l: LogEntry) =>
    l.safetyPhraseUsed.length === 0 || l.safetyPhraseUsed.includes('미사용')
  return {
    total: logs.length,
    incomplete: logs.filter((l) => l.incomplete).length,
    riskKeyword: logs.filter((l) => l.detectedRiskKeywords.length > 0).length,
    riskCombo: logs.filter((l) => l.detectedRiskCombinations.length > 0).length,
    noSafetyPhrase: logs.filter(noPhrase).length,
    privacySuspect: logs.filter((l) => l.detectedPrivacyPatterns.length > 0).length,
    handoffMissing: logs.filter((l) => l.handedOffToOfficer === 'unknown').length,
    nonReservation: logs.filter((l) => l.queueTicketType === 'non_reservation').length,
  }
}

// 소수 건수 비공개 임계값 (개인 식별 방지)
export const SMALL_COUNT_THRESHOLD = 3
export function maskSmallCount(n: number): string {
  return n > 0 && n < SMALL_COUNT_THRESHOLD ? '소수 건수 비공개' : String(n)
}

// Review Queue 자동 포함 조건
export function needsReview(l: LogEntry): boolean {
  if (l.incomplete) return true
  if (l.reviewFlags.some((f) => f !== '수동 보존')) return true
  if (l.detectedRiskKeywords.length > 0 && l.queueTicketType === 'not_issued') return true
  if (
    (l.caseType === '근무처 변경/추가' || l.caseType === '자격외활동/취업허가') &&
    l.handedOffToOfficer === 'unknown'
  )
    return true
  if (l.queueTicketType === 'non_reservation' && l.riskLevel == null) return true
  if (
    l.caseType === '사범/범칙금 가능성' &&
    (l.queueTicketType === 'not_issued' || l.handedOffToOfficer === 'unknown')
  )
    return true
  if (l.detectedPrivacyPatterns.length > 0) return true
  const noPhrase = l.safetyPhraseUsed.length === 0 || l.safetyPhraseUsed.includes('미사용')
  if (noPhrase && l.detectedRiskKeywords.length > 0) return true
  return false
}
