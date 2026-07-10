import { useMemo, useState } from 'react'
import type { WorkSession } from '../types'
import { useStore } from '../app/store'
import {
  CASE_TYPES,
  COUNTER_SUGGESTIONS,
  COMMON_VISA_STATUSES,
  GUIDANCE_SCOPES,
  QUEUE_TICKET_TYPES,
  SAFETY_PHRASE_TAGS,
  VISA_STATUSES,
  VISIT_STATUSES,
  queueLabel,
  visitStatusLabel,
} from '../data/constants'
import { computeShiftReview, isToday } from '../lib/analytics'
import { RETENTION_OPTIONS, findExpiredLogs } from '../lib/retention'
import { Banner, Chip, ChipGroup, Field, StatCard } from './ui'
import { CounterReferralControl, DirectValueInput, NationalityDirectInput } from './LogFieldControls'
import { NationalityPicker } from './NationalityPicker'

const today = () => new Date().toISOString().slice(0, 10)

export function WorkSessionPanel() {
  const store = useStore()
  const { logs, session, setSession, settings, updateSettings, deleteLogs } = store
  const [draft, setDraft] = useState<WorkSession>(
    session ?? { date: today(), defaults: {} },
  )
  const [confirmDelete, setConfirmDelete] = useState(false)

  const todayLogs = useMemo(() => logs.filter((l) => isToday(l.createdAt)), [logs])
  const review = useMemo(() => computeShiftReview(todayLogs), [todayLogs])
  const expiring = useMemo(() => findExpiredLogs(logs), [logs])

  const setDefault = (patch: Partial<WorkSession['defaults']>) =>
    setDraft((d) => ({ ...d, date: today(), defaults: { ...d.defaults, ...patch } }))

  const save = () => setSession({ date: today(), defaults: draft.defaults })
  const reset = () => {
    setDraft({ date: today(), defaults: {} })
    setSession(null)
  }

  return (
    <div className="space-y-6">
      {/* 오늘 근무 세션 */}
      <section className="space-y-3">
        <h2 className="section-title">오늘 근무 세션</h2>
        <p className="text-sm text-gray-500">
          오늘 자주 쓰는 기본값을 설정하면 빠른 기록 모드에 자동으로 채워집니다. 다음 날에는 자동
          초기화됩니다.
        </p>
        <div className="card space-y-4">
          <Field label="오늘 기본 체류자격">
            <div className="space-y-2">
              <ChipGroup
                options={COMMON_VISA_STATUSES}
                value={draft.defaults.visaStatus ?? null}
                onChange={(v) => setDefault({ visaStatus: v })}
              />
              <details>
                <summary className="cursor-pointer text-xs font-bold text-accent-strong">전체 체류자격 보기</summary>
                <div className="mt-2">
                  <ChipGroup
                    options={VISA_STATUSES}
                    value={draft.defaults.visaStatus ?? null}
                    onChange={(v) => setDefault({ visaStatus: v })}
                  />
                </div>
              </details>
              <DirectValueInput
                placeholder="기본 체류자격 직접 입력"
                buttonLabel="체류자격 입력"
                transform={(v) => v.toUpperCase()}
                onSubmit={(visaStatus) => setDefault({ visaStatus })}
              />
            </div>
          </Field>
          <Field label="오늘 기본 국적">
            <div className="space-y-2">
              <NationalityPicker
                value={draft.defaults.nationality ?? { mode: 'not_recorded' }}
                onChange={(n) => setDefault({ nationality: n })}
              />
              <NationalityDirectInput onSubmit={(nationality) => setDefault({ nationality })} />
            </div>
          </Field>
          <Field label="오늘 기본 민원유형">
            <div className="space-y-2">
              <ChipGroup
                options={CASE_TYPES}
                value={draft.defaults.caseType ?? null}
                onChange={(v) => setDefault({ caseType: v })}
              />
              <DirectValueInput
                placeholder="기본 민원유형 직접 입력"
                buttonLabel="유형 입력"
                maxLength={40}
                onSubmit={(caseType) => setDefault({ caseType })}
              />
            </div>
          </Field>
          <Field label="오늘 기본 번호표 유형">
            <div className="space-y-2">
              <ChipGroup
                options={QUEUE_TICKET_TYPES.map((q) => q.value)}
                value={draft.defaults.queueTicketType ?? null}
                onChange={(v) => setDefault({ queueTicketType: v })}
                render={queueLabel}
              />
              <DirectValueInput
                placeholder="기본 번호표 유형 직접 입력"
                buttonLabel="번호표 입력"
                maxLength={32}
                onSubmit={(queueTicketType) => setDefault({ queueTicketType })}
              />
            </div>
          </Field>
          <Field label="오늘 기본 창구 안내">
            <CounterReferralControl
              value={draft.defaults.counterReferral}
              onChange={(counterReferral) => setDefault({ counterReferral })}
            />
          </Field>
          <Field label="오늘 기본 응대 창구/담당자">
            <CounterReferralControl
              value={draft.defaults.handlingCounter}
              onChange={(handlingCounter) => setDefault({ handlingCounter })}
              suggestions={COUNTER_SUGGESTIONS}
              modeLabels={{
                not_referred: '응대 미기재',
                referred: '응대/부탁 기록',
                unknown: '기억 안 남',
              }}
              placeholder="기본 응대 창구/담당자"
              buttonLabel="응대 입력"
            />
          </Field>
          <Field label="오늘 기본 현황">
            <ChipGroup
              options={VISIT_STATUSES.map((status) => status.value)}
              value={draft.defaults.visitStatus ?? null}
              onChange={(visitStatus) => setDefault({ visitStatus })}
              render={visitStatusLabel}
            />
          </Field>
          <Field label="오늘 기본 안내범위 (첫 항목만 기본 적용)">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {GUIDANCE_SCOPES.map((s) => (
                  <Chip
                    key={s}
                    active={(draft.defaults.guidanceScope ?? [])[0] === s}
                    onClick={() => setDefault({ guidanceScope: [s] })}
                  >
                    {s}
                  </Chip>
                ))}
              </div>
              <DirectValueInput
                placeholder="기본 안내범위 직접 입력"
                buttonLabel="안내 입력"
                maxLength={48}
                onSubmit={(scope) => setDefault({ guidanceScope: [scope] })}
              />
            </div>
          </Field>
          <Field label="오늘 기본 안전문구">
            <div className="flex flex-wrap gap-2">
              {SAFETY_PHRASE_TAGS.map((t) => (
                <Chip
                  key={t}
                  active={(draft.defaults.safetyPhraseUsed ?? [])[0] === t}
                  onClick={() => setDefault({ safetyPhraseUsed: [t] })}
                >
                  {t}
                </Chip>
              ))}
            </div>
          </Field>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={save}>
              오늘 기본값 저장
            </button>
            <button className="btn-ghost" onClick={reset}>
              초기화
            </button>
          </div>
          {session && <Banner tone="info">오늘 기본값이 적용 중입니다. (앱을 재시작해도 당일 유지)</Banner>}
        </div>
      </section>

      {/* 퇴근 전 3분 리뷰 */}
      <section className="space-y-3">
        <h2 className="section-title">퇴근 전 3분 리뷰</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="오늘 총 로그" value={review.total} />
          <StatCard label="미완성 로그" value={review.incomplete} tone={review.incomplete ? 'warn' : undefined} />
          <StatCard label="위험 키워드 감지" value={review.riskKeyword} tone={review.riskKeyword ? 'warn' : undefined} />
          <StatCard label="위험 조합 감지" value={review.riskCombo} tone={review.riskCombo ? 'warn' : undefined} />
          <StatCard label="안전문구 미사용" value={review.noSafetyPhrase} tone={review.noSafetyPhrase ? 'warn' : undefined} />
          <StatCard label="개인정보 의심" value={review.privacySuspect} tone={review.privacySuspect ? 'danger' : undefined} />
          <StatCard label="담당자 인계 미기재" value={review.handoffMissing} tone={review.handoffMissing ? 'warn' : undefined} />
          <StatCard label="비예약 번호표" value={review.nonReservation} />
        </div>
      </section>

      {/* 보존 기간 관리 */}
      <section className="space-y-3">
        <h2 className="section-title">보존 기간 관리</h2>
        <div className="card space-y-3">
          <Field label="기본 보존 기간 (신규 로그에 적용)">
            <ChipGroup
              options={RETENTION_OPTIONS.map((d) => String(d) as `${number}`)}
              value={String(settings.retentionDays) as `${number}`}
              onChange={(v) => updateSettings({ retentionDays: Number(v) })}
              render={(v) => `${v}일`}
            />
          </Field>
          <p className="text-sm text-gray-500">
            삭제 예정(보존기간 만료) 로그: <strong>{expiring.length}</strong>건. "사건성 있음" 또는 "수동
            보존" 플래그가 있는 로그는 자동 삭제 대상에서 제외됩니다. 자동 삭제는 하지 않으며, 아래
            버튼으로 확인 후에만 삭제됩니다.
          </p>
          {expiring.length > 0 &&
            (confirmDelete ? (
              <Banner tone="danger">
                <div className="space-y-2">
                  <p>만료된 {expiring.length}건을 삭제합니다. 되돌릴 수 없습니다.</p>
                  <div className="flex gap-2">
                    <button
                      className="btn-primary"
                      onClick={() => {
                        deleteLogs(expiring.map((l) => l.id))
                        setConfirmDelete(false)
                      }}
                    >
                      영구 삭제
                    </button>
                    <button className="btn-ghost" onClick={() => setConfirmDelete(false)}>
                      취소
                    </button>
                  </div>
                </div>
              </Banner>
            ) : (
              <button className="btn-ghost" onClick={() => setConfirmDelete(true)}>
                만료 로그 정리
              </button>
            ))}
        </div>
      </section>
    </div>
  )
}
