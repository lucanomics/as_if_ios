import { useMemo } from 'react'
import { ClipboardCheck, Clock3, Eraser, FilePlus2, RotateCw } from 'lucide-react'
import { useStore } from '../app/store'
import { CASE_TYPES, QUEUE_TICKET_TYPES, queueLabel } from '../data/constants'
import { computeShiftReview, countBy, isThisWeek, isToday, maskSmallCount, needsReview } from '../lib/analytics'
import { findExpiredLogs } from '../lib/retention'
import { QuickCapturePanel } from './QuickCapturePanel'

interface DashboardProps {
  onOpenQuickLog: () => void
  onOpenReview: () => void
  onOpenSession: () => void
  onOpenPrivacy: () => void
}

function ActionTile({
  label,
  detail,
  count,
  icon: Icon,
  onClick,
  tone = 'default',
}: {
  label: string
  detail: string
  count?: number
  icon: typeof FilePlus2
  onClick: () => void
  tone?: 'default' | 'warn' | 'danger'
}) {
  return (
    <button type="button" className={`action-tile ${tone}`} onClick={onClick}>
      <Icon size={24} strokeWidth={2.1} aria-hidden="true" />
      <span>
        <strong>{label}</strong>
        <small>{detail}</small>
      </span>
      {typeof count === 'number' && <em>{count}</em>}
    </button>
  )
}

function MetricLine({ label, value, warn }: { label: string; value: string | number; warn?: boolean }) {
  return (
    <div className="metric-line">
      <span>{label}</span>
      <strong className={warn ? 'text-risk-caution' : undefined}>{value}</strong>
    </div>
  )
}

export function Dashboard({ onOpenQuickLog, onOpenReview, onOpenSession, onOpenPrivacy }: DashboardProps) {
  const { logs } = useStore()

  const todayLogs = useMemo(() => logs.filter((log) => isToday(log.createdAt)), [logs])
  const weekLogs = useMemo(() => logs.filter((log) => isThisWeek(log.createdAt)), [logs])
  const review = useMemo(() => computeShiftReview(todayLogs), [todayLogs])
  const reviewQueueCount = useMemo(() => logs.filter(needsReview).length, [logs])
  const privacyCount = useMemo(() => logs.filter((log) => log.detectedPrivacyPatterns.length > 0).length, [logs])
  const expiring = useMemo(() => findExpiredLogs(logs).length, [logs])
  const caseCounts = useMemo(() => countBy(todayLogs, (log) => log.caseType), [todayLogs])
  const queueCounts = useMemo(() => countBy(todayLogs, (log) => log.queueTicketType), [todayLogs])
  const handoffRate = todayLogs.length
    ? Math.round((todayLogs.filter((log) => log.handedOffToOfficer === 'true').length / todayLogs.length) * 100)
    : 0
  const phraseRate = todayLogs.length
    ? Math.round(
        (todayLogs.filter((log) => log.safetyPhraseUsed.length > 0 && !log.safetyPhraseUsed.includes('미사용')).length /
          todayLogs.length) *
          100,
      )
    : 0

  return (
    <div className="dashboard-grid">
      <section className="dashboard-main" aria-labelledby="dashboard-title">
        <div className="page-heading">
          <div>
            <p className="eyebrow">오늘</p>
            <h1 id="dashboard-title">지금 할 일</h1>
            <p>기록은 빠르게, 위험 신호는 놓치지 않게. 오늘의 기본 화면은 이 흐름 하나면 됩니다.</p>
          </div>
          <button className="btn-primary w-full sm:w-auto" type="button" onClick={onOpenQuickLog}>
            <FilePlus2 size={18} aria-hidden="true" />
            전체 기록 열기
          </button>
        </div>

        <QuickCapturePanel />

        <div className="action-grid" aria-label="주요 작업">
          <ActionTile
            label="새 로그 작성"
            detail="전체 입력 화면 열기"
            icon={FilePlus2}
            onClick={onOpenQuickLog}
          />
          <ActionTile
            label="Review Queue"
            detail="보완/확인 필요"
            count={reviewQueueCount}
            icon={ClipboardCheck}
            onClick={onOpenReview}
            tone={reviewQueueCount ? 'warn' : 'default'}
          />
          <ActionTile
            label="퇴근 전 3분 리뷰"
            detail="오늘 로그 정리"
            count={review.incomplete + review.riskKeyword + review.noSafetyPhrase}
            icon={Clock3}
            onClick={onOpenSession}
            tone={review.incomplete || review.riskKeyword || review.noSafetyPhrase ? 'warn' : 'default'}
          />
          <ActionTile
            label="개인정보 청소"
            detail="의심 패턴 정리"
            count={privacyCount}
            icon={Eraser}
            onClick={onOpenPrivacy}
            tone={privacyCount ? 'danger' : 'default'}
          />
        </div>

        <section className="insight-panel" aria-labelledby="today-case-counts">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">오늘 흐름</p>
              <h2 id="today-case-counts">민원유형과 번호표</h2>
            </div>
            <p>소수 조합은 비공개 처리됩니다.</p>
          </div>
          <div className="summary-columns">
            <div>
              <h3>민원유형별 건수</h3>
              <ul className="compact-list">
                {CASE_TYPES.map((caseType) => (
                  <li key={caseType}>
                    <span>{caseType}</span>
                    <strong>{maskSmallCount(caseCounts[caseType] ?? 0)}</strong>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>번호표 유형별 건수</h3>
              <ul className="compact-list">
                {QUEUE_TICKET_TYPES.map((ticket) => (
                  <li key={ticket.value}>
                    <span>{queueLabel(ticket.value)}</span>
                    <strong>{maskSmallCount(queueCounts[ticket.value] ?? 0)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </section>

      <aside className="dashboard-side" aria-label="오늘 요약">
        <section className="side-card">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">상태</p>
              <h2>오늘 요약</h2>
            </div>
            <RotateCw size={17} aria-hidden="true" />
          </div>
          <MetricLine label="작성한 로그" value={`${review.total}건`} />
          <MetricLine label="이번 주 총 안내" value={`${weekLogs.length}건`} />
          <MetricLine label="Review Queue" value={`${reviewQueueCount}건`} warn={reviewQueueCount > 0} />
          <MetricLine label="높은 위험 신호" value={`${review.riskKeyword + review.riskCombo}건`} warn={review.riskKeyword + review.riskCombo > 0} />
          <MetricLine label="삭제 예정" value={`${expiring}건`} warn={expiring > 0} />
        </section>

        <section className={review.riskKeyword || review.riskCombo || privacyCount ? 'side-card alert' : 'side-card'}>
          <h2>위험 알림</h2>
          {review.riskKeyword || review.riskCombo || privacyCount ? (
            <p>
              오늘 기록 중 위험 키워드, 위험 조합, 개인정보 의심 패턴이 있습니다. Review Queue 또는
              개인정보 청소에서 정리하세요.
            </p>
          ) : (
            <p>현재까지 오늘 기록에서 즉시 정리할 위험 알림은 없습니다.</p>
          )}
          <button className="btn-ghost mt-3 w-full" type="button" onClick={reviewQueueCount ? onOpenReview : onOpenPrivacy}>
            항목 검토하기
          </button>
        </section>

        <section className="side-card phrase">
          <h2>권장 안내 멘트</h2>
          <p>
            "개인정보는 입력하지 않아도 됩니다. 업무에 필요한 범위만 안내드리겠습니다."
          </p>
          <button className="btn-ghost mt-3" type="button" onClick={() => navigator.clipboard?.writeText('개인정보는 입력하지 않아도 됩니다. 업무에 필요한 범위만 안내드리겠습니다.')}>
            복사하기
          </button>
        </section>

        <section className="side-card">
          <div className="panel-title-row">
            <h2>퇴근 전 3분 체크</h2>
            <span>{review.incomplete + review.riskKeyword + review.privacySuspect + review.noSafetyPhrase}/4</span>
          </div>
          <ul className="check-preview">
            <li className={review.riskKeyword || review.riskCombo ? 'is-warn' : ''}>위험 알림 확인 및 조치</li>
            <li className={reviewQueueCount ? 'is-warn' : ''}>Review Queue 검토</li>
            <li className={privacyCount ? 'is-warn' : ''}>개인정보 입력 여부 점검</li>
            <li className={review.noSafetyPhrase ? 'is-warn' : ''}>안전문구 미사용 확인</li>
          </ul>
        </section>

        <section className="side-card">
          <h2>품질 지표</h2>
          <MetricLine label="담당자 인계율" value={`${handoffRate}%`} />
          <MetricLine label="안전문구 사용률" value={`${phraseRate}%`} />
          <MetricLine label="비예약 처리" value={`${review.nonReservation}건`} warn={review.nonReservation > 0} />
        </section>
      </aside>
    </div>
  )
}
