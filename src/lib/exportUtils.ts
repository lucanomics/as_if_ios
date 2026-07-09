import type { LogEntry } from '../types'
import { scanEntryTexts, type PrivacyHit } from './privacyGuard'
import { queueLabel } from '../data/constants'

// 로컬 백업 전용 내보내기. 파일은 사용자의 기기에만 생성되며 어디로도 전송되지 않는다.

export const EXPORT_WARNING =
  '이 파일은 개인 업무기록입니다. 민원인 개인정보가 포함되어 있지 않은지 반드시 확인하세요. 외부 클라우드, 메신저, 공용 PC에 저장하지 마세요.'

export interface ExportScanResult {
  clean: boolean
  offending: { log: LogEntry; hits: PrivacyHit[] }[]
}

// 내보내기 전 전체 로그를 다시 스캔한다.
export function scanBeforeExport(logs: LogEntry[]): ExportScanResult {
  const offending: { log: LogEntry; hits: PrivacyHit[] }[] = []
  for (const log of logs) {
    const hits = scanEntryTexts(log.memo, log.nonIdentifyingKeywords)
    if (hits.length) offending.push({ log, hits })
  }
  return { clean: offending.length === 0, offending }
}

export function toJSON(logs: LogEntry[]): string {
  return JSON.stringify(
    { app: 'DeskShield', kind: 'log-backup', version: 1, exportedFields: 'non-identifying-only', logs },
    null,
    2,
  )
}

const CSV_HEADERS = [
  'id',
  'createdAt',
  'visaStatus',
  'nationalityMode',
  'countryCode',
  'caseType',
  'guidanceScope',
  'queueTicketType',
  'safetyPhraseUsed',
  'handedOffToOfficer',
  'riskLevel',
  'confidenceLevel',
  'reviewFlags',
  'incomplete',
  'keywords',
  'memo',
]

function csvCell(v: string): string {
  const s = (v ?? '').replace(/"/g, '""')
  return `"${s}"`
}

export function toCSV(logs: LogEntry[]): string {
  const rows = logs.map((l) =>
    [
      l.id,
      l.createdAt,
      l.visaStatus,
      l.nationality.mode,
      l.nationality.countryCode ?? '',
      l.caseType,
      l.guidanceScope.join('|'),
      queueLabel(l.queueTicketType),
      l.safetyPhraseUsed.join('|'),
      l.handedOffToOfficer,
      l.riskLevel ?? '',
      l.confidenceLevel ?? '',
      l.reviewFlags.join('|'),
      String(l.incomplete),
      l.nonIdentifyingKeywords.join('|'),
      l.memo,
    ]
      .map((c) => csvCell(String(c)))
      .join(','),
  )
  return [CSV_HEADERS.map(csvCell).join(','), ...rows].join('\n')
}

export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// JSON 가져오기 (로컬 파일에서 복원)
export function parseImportedJSON(text: string): LogEntry[] {
  const data = JSON.parse(text)
  if (Array.isArray(data)) return data as LogEntry[]
  if (data && Array.isArray(data.logs)) return data.logs as LogEntry[]
  throw new Error('DeskShield 백업 형식이 아닙니다.')
}
