import type { LogEntry, RetentionDays } from '../types'

export const DEFAULT_RETENTION_DAYS = 90
export const RETENTION_OPTIONS: RetentionDays[] = [30, 60, 90, 180]

export function computeRetentionUntil(createdAtISO: string, days: number): string {
  const d = new Date(createdAtISO)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

// 자동 삭제 대상에서 제외되는 로그: 수동 보존 or 사건성 있음
export function isRetentionExempt(log: LogEntry): boolean {
  return (
    log.isPinnedForRetention ||
    log.reviewFlags.includes('수동 보존') ||
    log.reviewFlags.includes('사건성 있음')
  )
}

// "지금" 기준 삭제 예정(만료) 로그 — 자동 삭제는 사용자 확인 후에만 실행한다.
export function findExpiredLogs(logs: LogEntry[], nowISO = new Date().toISOString()): LogEntry[] {
  const now = new Date(nowISO).getTime()
  return logs.filter((l) => {
    if (isRetentionExempt(l)) return false
    if (!l.retentionUntil) return false
    return new Date(l.retentionUntil).getTime() <= now
  })
}
