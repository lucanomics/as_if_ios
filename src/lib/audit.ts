import type { AuditHistory, LogEntry } from '../types'
import { newId, nowISO } from './storage'

// 수정 이력은 "어떤 필드가 바뀌었는지"만 기록한다.
// 이전/새 값을 저장하지 않는다 — 개인정보가 이력에 남는 위험을 피하기 위함.

const TRACKED_FIELDS: (keyof LogEntry)[] = [
  'visaStatus',
  'nationality',
  'caseType',
  'guidanceScope',
  'queueTicketType',
  'nonIdentifyingKeywords',
  'safetyPhraseUsed',
  'handedOffToOfficer',
  'riskLevel',
  'confidenceLevel',
  'reviewFlags',
  'memo',
]

export function diffChangedFields(prev: LogEntry, next: LogEntry): string[] {
  const changed: string[] = []
  for (const f of TRACKED_FIELDS) {
    if (JSON.stringify(prev[f]) !== JSON.stringify(next[f])) changed.push(f)
  }
  return changed
}

export function makeAuditRecord(logId: string, changedFields: string[], reason?: string): AuditHistory {
  return {
    id: newId('audit'),
    logId,
    changedAt: nowISO(),
    changedFields,
    reason,
  }
}
