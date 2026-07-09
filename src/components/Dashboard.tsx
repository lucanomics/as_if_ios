import { useMemo } from 'react'
import { useStore } from '../app/store'
import { queueLabel, CASE_TYPES, QUEUE_TICKET_TYPES } from '../data/constants'
import {
  computeShiftReview,
  countBy,
  isThisWeek,
  isToday,
  maskSmallCount,
  needsReview,
} from '../lib/analytics'
import { findExpiredLogs } from '../lib/retention'
import { StatCard } from './ui'

export function Dashboard({ onOpenReview, onOpenSession }: { onOpenReview: () => void; onOpenSession: () => void }) {
  const { logs } = useStore()

  const todayLogs = useMemo(() => logs.filter((l) => isToday(l.createdAt)), [logs])
  const weekLogs = useMemo(() => logs.filter((l) => isThisWeek(l.createdAt)), [logs])
  const review = useMemo(() => computeShiftReview(todayLogs), [todayLogs])
  const reviewQueueCount = useMemo(() => logs.filter(needsReview).length, [logs])
  const privacyCount = useMemo(() => logs.filter((l) => l.detectedPrivacyPatterns.length > 0).length, [logs])
  const expiring = useMemo(() => findExpiredLogs(logs).length, [logs])

  const caseCounts = useMemo(() => countBy(todayLogs, (l) => l.caseType), [todayLogs])
  const queueCounts = useMemo(() => countBy(todayLogs, (l) => l.queueTicketType), [todayLogs])
  const handoffRate = todayLogs.length
    ? Math.round((todayLogs.filter((l) => l.handedOffToOfficer === 'true').length / todayLogs.length) * 100)
    : 0
  const phraseRate = todayLogs.length
    ? Math.round(
        (todayLogs.filter((l) => l.safetyPhraseUsed.length > 0 && !l.safetyPhraseUsed.includes('미사용')).length /
          todayLogs.length) *
          100,
      )
    : 0

  return (
    <div className="space-y-6">
      {/* 오늘 처리해야 할 것 (숫자보다 먼저) */}
      <section className="space-y-3">
        <h2 className="section-title">오늘 처리해야 할 것</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button className="card text-left" onClick={onOpenReview}>
            <div className="label">Review Queue</div>
            <div className="mt-1 text-2xl font-bold text-risk-caution">{reviewQueueCount}</div>
            <div className="text-xs text-gray-400">보완/확인 필요 로그</div>
          </button>
          <button className="card text-left" onClick={onOpenReview}>
            <div className="label">미완성 로그 (오늘)</div>
            <div className="mt-1 text-2xl font-bold text-risk-caution">{review.incomplete}</div>
          </button>
          <div className="card">
            <div className="label">개인정보 의심 로그</div>
            <div className={`mt-1 text-2xl font-bold ${privacyCount ? 'text-risk-high' : 'text-ink'}`}>
              {privacyCount}
            </div>
          </div>
          <button className="card text-left" onClick={onOpenSession}>
            <div className="label">삭제 예정(보존기간 만료)</div>
            <div className="mt-1 text-2xl font-bold text-ink">{expiring}</div>
            <div className="text-xs text-gray-400">근무 세션 → 정리</div>
          </button>
        </div>
      </section>

      {/* 통계 */}
      <section className="space-y-3">
        <h2 className="section-title">통계</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="오늘 총 안내" value={review.total} />
          <StatCard label="이번 주 총 안내" value={weekLogs.length} />
          <StatCard label="담당자 인계 비율(오늘)" value={`${handoffRate}%`} />
          <StatCard label="안전문구 사용률(오늘)" value={`${phraseRate}%`} />
          <StatCard label="위험 키워드 감지(오늘)" value={review.riskKeyword} tone={review.riskKeyword ? 'warn' : undefined} />
          <StatCard label="위험 조합 감지(오늘)" value={review.riskCombo} tone={review.riskCombo ? 'warn' : undefined} />
          <StatCard label="비예약 처리(오늘)" value={review.nonReservation} />
          <StatCard label="Review Queue 남은 건수" value={reviewQueueCount} tone={reviewQueueCount ? 'warn' : undefined} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-2 font-semibold">민원유형별 건수 (오늘)</h3>
          <ul className="space-y-1 text-sm">
            {CASE_TYPES.map((c) => (
              <li key={c} className="flex justify-between">
                <span className="text-gray-600">{c}</span>
                <span className="font-medium">{maskSmallCount(caseCounts[c] ?? 0)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3 className="mb-2 font-semibold">번호표 유형별 건수 (오늘)</h3>
          <ul className="space-y-1 text-sm">
            {QUEUE_TICKET_TYPES.map((q) => (
              <li key={q.value} className="flex justify-between">
                <span className="text-gray-600">{queueLabel(q.value)}</span>
                <span className="font-medium">{maskSmallCount(queueCounts[q.value] ?? 0)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <p className="text-xs text-gray-400">
        ※ 통계는 개인 식별이 불가능한 수준으로만 표시됩니다. 특정 조합의 건수가 너무 적으면 "소수 건수
        비공개"로 표시됩니다.
      </p>
    </div>
  )
}
