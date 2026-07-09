import { useMemo, useState } from 'react'
import type { LogEntry } from '../types'
import { useStore } from '../app/store'
import { isToday } from '../lib/analytics'
import { scanEntryTexts } from '../lib/privacyGuard'
import { LogCard } from './LogCard'
import { Banner, Chip } from './ui'

const PATTERN_FILTERS: { code: string; label: string }[] = [
  { code: 'all', label: '개인정보 의심 전체' },
  { code: 'long_digits', label: '숫자 과다' },
  { code: 'email', label: '이메일 의심' },
  { code: 'phone', label: '전화번호 의심' },
  { code: 'passport', label: '여권번호 의심' },
  { code: 'org', label: '기관명 의심' },
  { code: 'address', label: '주소 의심' },
  { code: 'queue_seq', label: '번호표 순번 의심' },
]

export function PrivacyCleanup({ onEdit }: { onEdit: (l: LogEntry) => void }) {
  const store = useStore()
  const { logs, updateLog, deleteLog, deleteLogs, wipeAll } = store
  const [filter, setFilter] = useState('all')
  const [confirm, setConfirm] = useState<null | 'today' | 'wipe'>(null)

  const suspect = useMemo(
    () => logs.filter((l) => l.detectedPrivacyPatterns.length > 0),
    [logs],
  )
  const filtered = useMemo(
    () => (filter === 'all' ? suspect : suspect.filter((l) => l.detectedPrivacyPatterns.includes(filter))),
    [suspect, filter],
  )

  const clearMemo = (log: LogEntry) => {
    const patterns = scanEntryTexts('', log.nonIdentifyingKeywords).map((h) => h.pattern)
    updateLog({ ...log, memo: '', detectedPrivacyPatterns: patterns })
  }
  const markClean = (log: LogEntry) => updateLog({ ...log, detectedPrivacyPatterns: [] })

  const todayIds = logs.filter((l) => isToday(l.createdAt)).map((l) => l.id)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="section-title">개인정보 청소 모드</h2>
        <p className="text-sm text-gray-500">
          퇴근 전 리뷰와 내보내기 전에 개인정보 의심 로그를 정리하세요.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PATTERN_FILTERS.map((f) => (
          <Chip key={f.code} active={filter === f.code} onClick={() => setFilter(f.code)}>
            {f.label}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Banner tone="info">해당 조건의 개인정보 의심 로그가 없습니다.</Banner>
      ) : (
        <div className="space-y-3">
          {filtered.map((log) => (
            <LogCard key={log.id} log={log}>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                <button className="btn-ghost" onClick={() => clearMemo(log)}>
                  메모 비우기
                </button>
                <button className="btn-ghost" onClick={() => onEdit(log)}>
                  비식별 표현으로 수정
                </button>
                <button className="btn-ghost" onClick={() => markClean(log)}>
                  문제 없음으로 표시
                </button>
                <button className="btn-ghost text-risk-high" onClick={() => deleteLog(log.id)}>
                  로그 삭제
                </button>
              </div>
            </LogCard>
          ))}
        </div>
      )}

      {/* 긴급 삭제 */}
      <section className="space-y-3 rounded-2xl border border-risk-high/30 bg-risk-high/5 p-4">
        <h3 className="font-bold text-risk-high">긴급 삭제</h3>
        <p className="text-sm text-risk-high/90">
          실수로 개인정보를 입력했을 때 즉시 정리합니다. 삭제 후에는 되돌릴 수 없습니다.
        </p>
        {confirm === null && (
          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={() => setConfirm('today')} disabled={todayIds.length === 0}>
              오늘 작성한 로그 전체 삭제 ({todayIds.length})
            </button>
            <button className="btn-ghost text-risk-high" onClick={() => setConfirm('wipe')}>
              모든 로컬 데이터 초기화
            </button>
          </div>
        )}
        {confirm === 'today' && (
          <Banner tone="danger">
            <div className="space-y-2">
              <p>오늘 작성한 로그 {todayIds.length}건을 삭제합니다. 되돌릴 수 없습니다.</p>
              <div className="flex gap-2">
                <button
                  className="btn-primary"
                  onClick={() => {
                    deleteLogs(todayIds)
                    setConfirm(null)
                  }}
                >
                  삭제
                </button>
                <button className="btn-ghost" onClick={() => setConfirm(null)}>
                  취소
                </button>
              </div>
            </div>
          </Banner>
        )}
        {confirm === 'wipe' && (
          <Banner tone="danger">
            <div className="space-y-2">
              <p>모든 로컬 데이터(로그/이력/근무세션)를 초기화합니다. 되돌릴 수 없습니다.</p>
              <div className="flex gap-2">
                <button
                  className="btn-primary"
                  onClick={() => {
                    wipeAll()
                    setConfirm(null)
                  }}
                >
                  전체 초기화
                </button>
                <button className="btn-ghost" onClick={() => setConfirm(null)}>
                  취소
                </button>
              </div>
            </div>
          </Banner>
        )}
      </section>
    </div>
  )
}
