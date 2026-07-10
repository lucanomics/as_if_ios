import { useMemo, useState, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, ClipboardCheck, RotateCcw } from 'lucide-react'
import type {
  CaseType,
  GuidanceScope,
  LogEntry,
  QueueTicketType,
  RiskLevel,
  SafetyPhraseTag,
  VisitStatus,
  VisaStatus,
} from '../types'
import { useStore } from '../app/store'
import {
  COUNTER_SUGGESTIONS,
  COMMON_VISA_STATUSES,
  RISK_LEVELS,
  SAFETY_PHRASE_RECOMMENDATION,
  SAFETY_PHRASE_TAGS,
  MEMO_WARNING,
  queueLabel,
  visitStatusLabel,
} from '../data/constants'
import { COUNTRIES } from '../data/countries'
import { PRESETS } from '../data/presets'
import { detectRiskKeywords, RISK_WARNING } from '../lib/riskDetector'
import { detectRiskCombinations } from '../lib/riskCombinationDetector'
import { scanEntryTexts } from '../lib/privacyGuard'
import { createEmptyLog, summarizeLog } from '../lib/storage'
import { Chip, ChipGroup, Field, MultiChipGroup } from './ui'
import { CounterReferralControl, DirectValueInput, NationalityDirectInput, ReservationRefControl } from './LogFieldControls'
import { nationalityLabel } from './NationalityPicker'

const QUICK_COUNTRIES = ['CN', 'IN', 'PH', 'ID', 'VN', 'US', 'MN', 'UZ', 'RU', 'TH']
const QUICK_CASE_TYPES: CaseType[] = [
  '사증발급(E-10 제외)',
  '주소지 이전',
  '사증발급(E-10)',
  '정보공개청구',
  '출입국사실증명',
  '등록증 교부',
  '지문 등록',
  '여권 정보 변경 신고',
  '전자민원 승인 스티커 부착',
  '방문예약/예약 문제',
  '외국인등록',
]
const QUICK_GUIDANCE: GuidanceScope[] = [
  '예약번호 확인',
  '방문예약 방법 안내',
  '서류 일반 안내',
  '번호표 부여',
  '번호표 없이 돌려보냄',
  '예약 필요 안내 후 돌려보냄',
  '담당 창구로 안내',
  '전자민원 승인 스티커 담당자 요청',
  '담당자에게 직접 인계',
]
const QUICK_QUEUE: QueueTicketType[] = [
  'reservation_confirmed',
  'non_reservation',
  'not_issued',
  'visa',
  'visa_e10',
  'certificate',
  'card_pickup',
  'fingerprint',
  'address_change',
  'info_disclosure',
  'passport_change',
  'sticker',
]
const QUICK_VISIT_STATUSES: VisitStatus[] = ['waiting', 'in_consultation', 'sent_to_counter', 'completed', 'returned']

function quickSeed(retentionDays: number, prefill?: Partial<LogEntry>): LogEntry {
  const common = PRESETS.find((p) => p.id === 'preset-e2-hikorea')?.patch ?? {}
  return {
    ...createEmptyLog(retentionDays),
    ...common,
    ...prefill,
  }
}

function NumberedRow({
  number,
  label,
  children,
}: {
  number: number
  label: string
  children: ReactNode
}) {
  return (
    <div className="quick-row">
      <div className="quick-row-heading">
        <span className="quick-row-number">{number}</span>
        <span>{label}</span>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

export function QuickCapturePanel() {
  const store = useStore()
  const sessionDefaults = store.session?.defaults
  const [log, setLog] = useState<LogEntry>(() => quickSeed(store.settings.retentionDays, sessionDefaults ?? {}))
  const [keywordInput, setKeywordInput] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [ackPrivacy, setAckPrivacy] = useState(false)
  const [saved, setSaved] = useState<LogEntry | null>(null)

  const set = (patch: Partial<LogEntry>) => {
    setSaved(null)
    setConfirming(false)
    setLog((l) => ({ ...l, ...patch }))
  }

  const detectedKeywords = useMemo(
    () => detectRiskKeywords(log.memo, log.nonIdentifyingKeywords),
    [log.memo, log.nonIdentifyingKeywords],
  )
  const privacyHits = useMemo(
    () => scanEntryTexts(log.memo, log.nonIdentifyingKeywords, [log.reservationRef?.value ?? '']),
    [log.memo, log.nonIdentifyingKeywords, log.reservationRef?.value],
  )
  const combos = useMemo(
    () => detectRiskCombinations({ ...log, detectedRiskKeywords: detectedKeywords }),
    [detectedKeywords, log],
  )
  const recommendedTag = SAFETY_PHRASE_RECOMMENDATION[log.caseType]
  const summary = summarizeLog(log, { queue: queueLabel, nationality: nationalityLabel })
  const privacyBlocks = privacyHits.length > 0 && !ackPrivacy
  const canSave = log.guidanceScope.length > 0

  const addKeyword = () => {
    const value = keywordInput.trim()
    if (!value) return
    if (!log.nonIdentifyingKeywords.includes(value)) {
      set({ nonIdentifyingKeywords: [...log.nonIdentifyingKeywords, value] })
    }
    setKeywordInput('')
  }

  const toggleScope = (scope: GuidanceScope) => {
    set({
      guidanceScope: log.guidanceScope.includes(scope)
        ? log.guidanceScope.filter((x) => x !== scope)
        : [...log.guidanceScope, scope],
    })
  }

  const selectCaseType = (caseType: CaseType) => {
    if (caseType === '전자민원 승인 스티커 부착') {
      set({
        caseType,
        guidanceScope: ['전자민원 승인 스티커 담당자 요청'],
        queueTicketType: 'sticker',
        counterReferral: { mode: 'referred', counterLabel: '전자민원 스티커 한슬 반장' },
        handlingCounter: { mode: 'referred', counterLabel: '전자민원 스티커 한슬 반장' },
        visitStatus: 'sent_to_counter',
        riskLevel: '낮음',
      })
      return
    }
    set({ caseType })
  }

  const toggleSafety = (tag: SafetyPhraseTag) => {
    if (tag === '미사용') {
      set({ safetyPhraseUsed: log.safetyPhraseUsed.includes(tag) ? [] : [tag] })
      return
    }
    const withoutUnused = log.safetyPhraseUsed.filter((x) => x !== '미사용')
    set({
      safetyPhraseUsed: withoutUnused.includes(tag)
        ? withoutUnused.filter((x) => x !== tag)
        : [...withoutUnused, tag],
    })
  }

  const save = (mode: 'save' | 'continue' | 'later') => {
    if (!canSave) return
    if (privacyBlocks) {
      setConfirming(true)
      return
    }

    const stamped: LogEntry = {
      ...log,
      detectedRiskKeywords: detectedKeywords,
      detectedPrivacyPatterns: privacyHits.map((h) => h.pattern),
      detectedRiskCombinations: combos.map((c) => c.code),
      privacyWarningAcknowledged: privacyHits.length ? ackPrivacy : false,
      incomplete: mode === 'later',
      reviewFlags:
        mode === 'later' && !log.reviewFlags.includes('나중에 보완')
          ? [...log.reviewFlags, '나중에 보완']
          : log.reviewFlags,
      updatedAt: new Date().toISOString(),
    }
    store.addLog(stamped)
    setSaved(stamped)
    setConfirming(false)
    setAckPrivacy(false)

    const keep: Partial<LogEntry> =
      mode === 'continue'
        ? {
            visaStatus: stamped.visaStatus,
            nationality: stamped.nationality,
            caseType: stamped.caseType,
            guidanceScope: stamped.guidanceScope,
            queueTicketType: stamped.queueTicketType,
            counterReferral: stamped.counterReferral,
            handlingCounter: stamped.handlingCounter,
            visitStatus: stamped.visitStatus,
            safetyPhraseUsed: stamped.safetyPhraseUsed,
          }
      : (sessionDefaults ?? {})
    setLog(quickSeed(store.settings.retentionDays, keep))
    setKeywordInput('')
  }

  return (
    <section className="capture-panel" aria-labelledby="quick-capture-title">
      <div className="capture-panel-header">
        <div>
          <p className="eyebrow">10초 기록</p>
          <h2 id="quick-capture-title">빠른 기록</h2>
          <p>민원 사유와 현황을 빠르게 찍고 요약을 확인하세요. 메모는 필요할 때만 엽니다.</p>
        </div>
        <button
          className="btn-ghost shrink-0"
          type="button"
          onClick={() => {
            setLog(quickSeed(store.settings.retentionDays, sessionDefaults ?? {}))
            setSaved(null)
            setConfirming(false)
            setAckPrivacy(false)
          }}
        >
          <RotateCcw size={16} aria-hidden="true" />
          초기화
        </button>
      </div>

      <div className="quick-stack">
        <NumberedRow number={1} label="체류자격">
          <div className="space-y-2">
            <ChipGroup
              options={COMMON_VISA_STATUSES}
              value={log.visaStatus}
              onChange={(v: VisaStatus) => set({ visaStatus: v })}
            />
            <DirectValueInput
              placeholder="직접 입력 예: G-1, D-10"
              buttonLabel="체류자격 입력"
              transform={(v) => v.toUpperCase()}
              onSubmit={(visaStatus) => set({ visaStatus })}
            />
          </div>
        </NumberedRow>

        <NumberedRow number={2} label="국적">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Chip active={log.nationality.mode === 'not_recorded'} onClick={() => set({ nationality: { mode: 'not_recorded' } })}>
                미기재
              </Chip>
              <Chip active={log.nationality.mode === 'unknown'} onClick={() => set({ nationality: { mode: 'unknown' } })}>
                미확인
              </Chip>
              {COUNTRIES.filter((c) => QUICK_COUNTRIES.includes(c.code)).map((country) => (
                <Chip
                  key={country.code}
                  active={log.nationality.mode === 'specified' && log.nationality.countryCode === country.code}
                  onClick={() =>
                    set({
                      nationality: {
                        mode: 'specified',
                        countryCode: country.code,
                        countryNameKo: country.nameKo,
                      },
                    })
                  }
                >
                  {country.nameKo}
                </Chip>
              ))}
            </div>
            <NationalityDirectInput onSubmit={(nationality) => set({ nationality })} />
          </div>
        </NumberedRow>

        <NumberedRow number={3} label="민원유형">
          <div className="space-y-2">
            <ChipGroup
              options={QUICK_CASE_TYPES}
              value={log.caseType}
              onChange={selectCaseType}
            />
            <DirectValueInput
              placeholder="민원유형 직접 입력 예: 사증발급인정서"
              buttonLabel="유형 입력"
              maxLength={40}
              onSubmit={(caseType) => set({ caseType })}
            />
          </div>
        </NumberedRow>

        <NumberedRow number={4} label="안내범위">
          <div className="space-y-2">
            <MultiChipGroup options={QUICK_GUIDANCE} values={log.guidanceScope} onToggle={toggleScope} />
            <DirectValueInput
              placeholder="안내범위 직접 입력 예: 서류 보완 안내 후 재방문"
              buttonLabel="안내 추가"
              maxLength={48}
              onSubmit={(scope) => toggleScope(scope)}
            />
          </div>
        </NumberedRow>

        <NumberedRow number={5} label="번호표/창구">
          <div className="space-y-4">
            <div className="space-y-2">
              <ChipGroup
                options={QUICK_QUEUE}
                value={log.queueTicketType}
                onChange={(v: QueueTicketType) => set({ queueTicketType: v })}
                render={queueLabel}
              />
              <DirectValueInput
                placeholder="번호표 유형 직접 입력 예: 국적, 사증"
                buttonLabel="번호표 입력"
                maxLength={32}
                onSubmit={(queueTicketType) => set({ queueTicketType })}
              />
            </div>
            <CounterReferralControl
              value={log.counterReferral}
              onChange={(counterReferral) => set({ counterReferral })}
            />
          </div>
        </NumberedRow>

        <NumberedRow number={6} label="현황/예약/응대">
          <div className="space-y-4">
            <ChipGroup
              options={QUICK_VISIT_STATUSES}
              value={log.visitStatus}
              onChange={(visitStatus) => set({ visitStatus })}
              render={visitStatusLabel}
            />
            <ReservationRefControl
              value={log.reservationRef}
              onChange={(reservationRef) => set({ reservationRef })}
            />
            <CounterReferralControl
              value={log.handlingCounter}
              onChange={(handlingCounter) => set({ handlingCounter })}
              suggestions={COUNTER_SUGGESTIONS}
              modeLabels={{
                not_referred: '응대 미기재',
                referred: '응대/부탁 기록',
                unknown: '기억 안 남',
              }}
              placeholder="응대한 창구/담당자 예: 7, 한슬 반장"
              buttonLabel="응대 입력"
            />
          </div>
        </NumberedRow>
      </div>

      {(detectedKeywords.length > 0 || combos.length > 0 || privacyHits.length > 0) && (
        <div className="capture-alerts">
          {detectedKeywords.length > 0 && (
            <div className="capture-alert capture-alert-warn">
              <AlertTriangle size={18} aria-hidden="true" />
              <span>{RISK_WARNING}</span>
            </div>
          )}
          {combos.map((combo) => (
            <div key={combo.code} className="capture-alert capture-alert-warn">
              <AlertTriangle size={18} aria-hidden="true" />
              <span>{combo.message}</span>
            </div>
          ))}
          {privacyHits.length > 0 && (
            <div className="capture-alert capture-alert-danger">
              <AlertTriangle size={18} aria-hidden="true" />
              <span>개인정보 의심 패턴: {privacyHits.map((h) => h.label).join(', ')}. 비식별 표현으로 바꿔주세요.</span>
            </div>
          )}
        </div>
      )}

      <details className="advanced-panel" open={showAdvanced} onToggle={(e) => setShowAdvanced(e.currentTarget.open)}>
        <summary>선택 항목 추가</summary>
        <div className="advanced-grid">
          <Field label="비식별 키워드">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addKeyword()
                  }
                }}
                placeholder="예: 계정 분실, 근무처"
                className="input flex-1"
              />
              <button type="button" className="btn-ghost" onClick={addKeyword}>
                추가
              </button>
            </div>
            {log.nonIdentifyingKeywords.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {log.nonIdentifyingKeywords.map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    className="mini-chip"
                    onClick={() =>
                      set({
                        nonIdentifyingKeywords: log.nonIdentifyingKeywords.filter((x) => x !== keyword),
                      })
                    }
                  >
                    {keyword} 지우기
                  </button>
                ))}
              </div>
            )}
          </Field>
          <Field label="안전문구">
            {recommendedTag && <p className="mb-2 text-xs text-accent-strong">권장: {recommendedTag}</p>}
            <MultiChipGroup options={SAFETY_PHRASE_TAGS} values={log.safetyPhraseUsed} onToggle={toggleSafety} />
          </Field>
          <Field label="담당자 인계">
            <ChipGroup
              options={['true', 'false', 'unknown'] as const}
              value={log.handedOffToOfficer}
              onChange={(v) => set({ handedOffToOfficer: v })}
              render={(v) => (v === 'true' ? '인계함' : v === 'false' ? '인계 안 함' : '미기재')}
            />
          </Field>
          <Field label="리스크">
            <ChipGroup
              options={RISK_LEVELS}
              value={log.riskLevel}
              onChange={(v: RiskLevel) => set({ riskLevel: v })}
            />
          </Field>
          <Field label="메모">
            <p className="mb-2 text-xs text-risk-caution">{MEMO_WARNING}</p>
            <textarea
              value={log.memo}
              onChange={(e) => set({ memo: e.target.value })}
              rows={3}
              className="input min-h-[96px] w-full"
              placeholder="비식별 요약만 작성"
            />
          </Field>
        </div>
      </details>

      {(confirming || saved) && (
        <div className={saved ? 'save-summary save-summary-done' : 'save-summary'}>
          <div className="flex items-start gap-2">
            {saved ? <CheckCircle2 size={18} aria-hidden="true" /> : <ClipboardCheck size={18} aria-hidden="true" />}
            <div>
              <strong>{saved ? '저장됨' : '저장 전 요약'}</strong>
              <p>{saved ? summarizeLog(saved, { queue: queueLabel, nationality: nationalityLabel }) : summary}</p>
            </div>
          </div>
          {privacyHits.length > 0 && !saved && (
            <label className="mt-3 flex items-start gap-2 text-sm text-risk-high">
              <input
                type="checkbox"
                checked={ackPrivacy}
                onChange={(e) => setAckPrivacy(e.target.checked)}
              />
              개인정보가 포함되지 않았음을 확인했습니다.
            </label>
          )}
        </div>
      )}

      <div className="capture-savebar">
        {!canSave && <span className="save-hint">안내범위를 1개 이상 선택하세요.</span>}
        <button type="button" className="btn-primary" disabled={!canSave} onClick={() => (confirming ? save('save') : setConfirming(true))}>
          요약 확인
        </button>
        <button type="button" className="btn-ghost" disabled={!canSave} onClick={() => save('continue')}>
          같은 유형 계속
        </button>
        <button type="button" className="btn-ghost" disabled={!canSave} onClick={() => save('later')}>
          나중에 보완
        </button>
      </div>
    </section>
  )
}
