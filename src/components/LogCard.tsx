import type { LogEntry } from '../types'
import { formatDuration, queueLabel, riskColorClass } from '../data/constants'
import { summarizeLog } from '../lib/storage'
import { nationalityLabel } from './NationalityPicker'

export function LogCard({
  log,
  onEdit,
  onDelete,
  children,
}: {
  log: LogEntry
  onEdit?: (l: LogEntry) => void
  onDelete?: (l: LogEntry) => void
  children?: React.ReactNode
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${riskColorClass(log.riskLevel)}`}>
              {log.riskLevel ?? '리스크 미선택'}
            </span>
            {log.incomplete && (
              <span className="rounded-md border border-risk-caution/30 bg-risk-caution/5 px-2 py-0.5 text-xs text-risk-caution">
                미완성
              </span>
            )}
            <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString('ko-KR')}</span>
            {log.handlingDurationMode !== 'not_recorded' && log.handlingDurationSeconds != null && (
              <span className="text-xs text-gray-400">
                응대 {formatDuration(log.handlingDurationSeconds)}
                {log.handlingDurationMode === 'auto' ? ' (자동)' : ' (수동)'}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm font-medium text-ink">
            {summarizeLog(log, { queue: queueLabel, nationality: nationalityLabel })}
          </p>
          {log.nonIdentifyingKeywords.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">키워드: {log.nonIdentifyingKeywords.join(', ')}</p>
          )}
          {log.detectedRiskKeywords.length > 0 && (
            <p className="mt-0.5 text-xs text-risk-caution">위험 키워드: {log.detectedRiskKeywords.join(', ')}</p>
          )}
          {log.detectedPrivacyPatterns.length > 0 && (
            <p className="mt-0.5 text-xs text-risk-high">개인정보 의심: {log.detectedPrivacyPatterns.join(', ')}</p>
          )}
          {log.memo && <p className="mt-1 truncate text-xs text-gray-400">메모: {log.memo}</p>}
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          {onEdit && (
            <button className="text-xs text-ink underline" onClick={() => onEdit(log)}>
              수정
            </button>
          )}
          {onDelete && (
            <button className="text-xs text-risk-high underline" onClick={() => onDelete(log)}>
              삭제
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}
