import { useMemo, useState } from 'react'
import type { LogEntry } from '../types'
import { useStore } from '../app/store'
import { queueLabel } from '../data/constants'
import { nationalityLabel } from './NationalityPicker'
import { LogCard } from './LogCard'
import { Banner } from './ui'

function haystack(l: LogEntry): string {
  return [
    l.visaStatus,
    nationalityLabel(l.nationality),
    l.caseType,
    l.guidanceScope.join(' '),
    queueLabel(l.queueTicketType),
    l.nonIdentifyingKeywords.join(' '),
    l.memo,
    l.riskLevel ?? '',
    l.confidenceLevel ?? '',
    l.reviewFlags.join(' '),
  ]
    .join(' ')
    .toLowerCase()
}

export function SearchPanel({ onEdit, initialQuery = '' }: { onEdit: (l: LogEntry) => void; initialQuery?: string }) {
  const { logs } = useStore()
  const [q, setQ] = useState(initialQuery)

  const results = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return logs
    return logs.filter((l) => haystack(l).includes(query))
  }, [logs, q])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="section-title">검색</h2>
        <p className="text-sm text-gray-500">체류자격, 국적, 민원유형, 안내범위, 번호표 유형, 키워드, 메모, 리스크, 검토 플래그로 검색합니다.</p>
      </div>
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="검색어 입력 (예: E-2, 하이코리아, 비예약)"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
      />
      <Banner tone="warn">검색 결과에도 개인정보 입력 금지 원칙이 적용됩니다.</Banner>
      <div className="text-xs text-gray-400">{results.length}건</div>
      <div className="space-y-3">
        {results.map((l) => (
          <LogCard key={l.id} log={l} onEdit={onEdit} />
        ))}
      </div>
    </div>
  )
}
