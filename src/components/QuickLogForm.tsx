import { useEffect, useMemo, useRef, useState } from 'react'
import type { LogEntry, Phrase, SafetyPhraseTag, HandlingDurationMode } from '../types'
import { useStore } from '../app/store'
import {
  CASE_TYPES,
  CONFIDENCE_LEVELS,
  GUIDANCE_SCOPES,
  QUEUE_TICKET_TYPES,
  RISK_LEVELS,
  REVIEW_FLAGS,
  SAFETY_PHRASE_TAGS,
  SAFETY_PHRASE_RECOMMENDATION,
  VISA_STATUSES,
  MEMO_WARNING,
  HANDLING_DURATION_MODES,
  formatDuration,
  queueLabel,
} from '../data/constants'
import { PRESETS } from '../data/presets'
import { createEmptyLog, summarizeLog } from '../lib/storage'
import { detectRiskKeywords, RISK_WARNING } from '../lib/riskDetector'
import { detectRiskCombinations } from '../lib/riskCombinationDetector'
import { scanEntryTexts } from '../lib/privacyGuard'
import { suggestMemo } from '../lib/autoTemplate'
import { Banner, Chip, ChipGroup, Field, MultiChipGroup } from './ui'
import { NationalityPicker, nationalityLabel } from './NationalityPicker'

interface Props {
  initial?: LogEntry // 편집 모드
  prefill?: Partial<LogEntry> // 같은 유형 계속 / 프리셋 / 세션 기본값
  onClose: () => void
}

// prefill 로부터 초기 로그 생성.
// prefill 의 undefined 값이 빈 로그의 배열/기본값을 덮어써 깨지지 않도록 제거한다.
function seedLog(initial?: LogEntry, prefill?: Partial<LogEntry>, retentionDays = 90): LogEntry {
  if (initial) return { ...initial }
  const clean: Partial<LogEntry> = {}
  if (prefill) {
    for (const [k, v] of Object.entries(prefill)) {
      if (v !== undefined) (clean as Record<string, unknown>)[k] = v
    }
  }
  return { ...createEmptyLog(retentionDays), ...clean }
}

export function QuickLogForm({ initial, prefill, onClose }: Props) {
  const store = useStore()
  const [log, setLog] = useState<LogEntry>(() =>
    seedLog(initial, prefill, store.settings.retentionDays),
  )
  const [step, setStep] = useState<'edit' | 'confirm'>('edit')
  const [keywordInput, setKeywordInput] = useState('')
  const [memoOpen, setMemoOpen] = useState<boolean>(Boolean(initial?.memo))
  const [acknowledgePrivacy, setAcknowledgePrivacy] = useState(false)
  const [savedToast, setSavedToast] = useState<LogEntry | null>(null)
  const [justContinued, setJustContinued] = useState(false)

  const set = (patch: Partial<LogEntry>) => {
    if (justContinued) setJustContinued(false)
    setLog((l) => ({ ...l, ...patch }))
  }

  // ---- 응대 시간 자동/수동 기재 ----
  // 새 로그는 폼이 열린 시점부터 자동 측정 가능. 과거 로그 편집 시에는 되돌아가
  // 재측정할 수 없으므로 자동 옵션을 숨기고 수동 입력/기록 안 함만 허용한다.
  const [durationMode, setDurationMode] = useState<HandlingDurationMode>(() => {
    if (!initial) return 'not_recorded'
    // 과거 로그의 '자동 측정' 값은 재측정할 수 없으므로, 편집 시에는 그 값을 수동
    // 입력값으로 취급해 계속 보거나 조정할 수 있게 한다.
    return initial.handlingDurationMode === 'auto' ? 'manual' : initial.handlingDurationMode
  })
  const [manualMinutes, setManualMinutes] = useState(() =>
    initial?.handlingDurationSeconds != null ? Math.floor(initial.handlingDurationSeconds / 60) : 0,
  )
  const [manualSeconds, setManualSeconds] = useState(() =>
    initial?.handlingDurationSeconds != null ? initial.handlingDurationSeconds % 60 : 0,
  )
  const startedAtRef = useRef<number>(Date.now())
  const [elapsedTick, setElapsedTick] = useState(0)
  const durationOptions = initial
    ? HANDLING_DURATION_MODES.filter((m) => m.value !== 'auto')
    : HANDLING_DURATION_MODES

  useEffect(() => {
    if (durationMode !== 'auto') return
    const id = window.setInterval(() => setElapsedTick((t) => t + 1), 1000)
    return () => window.clearInterval(id)
  }, [durationMode])

  const liveElapsedSeconds = Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000))
  void elapsedTick // 위 setInterval이 리렌더를 트리거해 liveElapsedSeconds를 갱신시키는 용도

  // ---- live detection ----
  const detectedKeywords = useMemo(
    () => detectRiskKeywords(log.memo, log.nonIdentifyingKeywords),
    [log.memo, log.nonIdentifyingKeywords],
  )
  const privacyHits = useMemo(
    () => scanEntryTexts(log.memo, log.nonIdentifyingKeywords),
    [log.memo, log.nonIdentifyingKeywords],
  )
  const combos = useMemo(
    () =>
      detectRiskCombinations({
        ...log,
        detectedRiskKeywords: detectedKeywords,
      }),
    [log, detectedKeywords],
  )
  const riskKeywordButNoHandoff =
    detectedKeywords.length > 0 && log.handedOffToOfficer === 'unknown'

  // ---- recommended safety phrases from library ----
  const recommendedTag = SAFETY_PHRASE_RECOMMENDATION[log.caseType]
  const recommendedPhrases: Phrase[] = useMemo(
    () =>
      recommendedTag
        ? store.phrases.filter((p) => p.isActive && p.category === recommendedTag)
        : [],
    [recommendedTag, store.phrases],
  )

  const memoSuggestion = useMemo(
    () => suggestMemo(log.caseType, log.nonIdentifyingKeywords),
    [log.caseType, log.nonIdentifyingKeywords],
  )

  const summary = summarizeLog(log, {
    queue: queueLabel,
    nationality: nationalityLabel,
  })

  // ---- required fields complete? ----
  const requiredComplete =
    log.guidanceScope.length > 0 // 5개 중 나머지는 기본값이 있으므로 안내범위만 명시적 필요

  // ---- keyword chips ----
  const addKeyword = () => {
    const v = keywordInput.trim()
    if (!v) return
    if (!log.nonIdentifyingKeywords.includes(v)) {
      set({ nonIdentifyingKeywords: [...log.nonIdentifyingKeywords, v] })
    }
    setKeywordInput('')
  }
  const removeKeyword = (k: string) =>
    set({ nonIdentifyingKeywords: log.nonIdentifyingKeywords.filter((x) => x !== k) })

  const toggleScope = (s: (typeof GUIDANCE_SCOPES)[number]) =>
    set({
      guidanceScope: log.guidanceScope.includes(s)
        ? log.guidanceScope.filter((x) => x !== s)
        : [...log.guidanceScope, s],
    })

  const toggleSafety = (t: SafetyPhraseTag) => {
    // "미사용" 은 배타적
    if (t === '미사용') {
      set({ safetyPhraseUsed: log.safetyPhraseUsed.includes('미사용') ? [] : ['미사용'] })
      return
    }
    const withoutUnused = log.safetyPhraseUsed.filter((x) => x !== '미사용')
    set({
      safetyPhraseUsed: withoutUnused.includes(t)
        ? withoutUnused.filter((x) => x !== t)
        : [...withoutUnused, t],
    })
  }

  const toggleFlag = (f: (typeof REVIEW_FLAGS)[number]) =>
    set({
      reviewFlags: log.reviewFlags.includes(f)
        ? log.reviewFlags.filter((x) => x !== f)
        : [...log.reviewFlags, f],
    })

  const applyPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id)
    if (!p) return
    set(p.patch as Partial<LogEntry>)
    store.pushRecentPreset(id)
  }

  const applyRecommendedPhrase = (p: Phrase) => {
    if (log.usedPhraseIds.includes(p.id)) return
    const tag: SafetyPhraseTag = recommendedTag ?? '담당자 확인 안내'
    const base: SafetyPhraseTag[] = log.safetyPhraseUsed.filter((x) => x !== '미사용')
    set({
      usedPhraseIds: [...log.usedPhraseIds, p.id],
      usedPhraseSnapshots: [
        ...log.usedPhraseSnapshots,
        { phraseId: p.id, version: p.version, title: p.title, text: p.text },
      ],
      safetyPhraseUsed: base.includes(tag) ? base : [...base, tag],
    })
  }

  // ---- finalize & persist ----
  function finalize(mode: 'save' | 'continue' | 'later') {
    const handlingDurationSeconds =
      durationMode === 'auto'
        ? Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000))
        : durationMode === 'manual'
          ? manualMinutes * 60 + manualSeconds
          : undefined

    const stamped: LogEntry = {
      ...log,
      handlingDurationMode: durationMode,
      handlingDurationSeconds,
      detectedRiskKeywords: detectedKeywords,
      detectedPrivacyPatterns: privacyHits.map((h) => h.pattern),
      detectedRiskCombinations: combos.map((c) => c.code),
      privacyWarningAcknowledged: privacyHits.length ? acknowledgePrivacy : false,
      incomplete: mode === 'later',
      reviewFlags:
        mode === 'later' && !log.reviewFlags.includes('나중에 보완')
          ? [...log.reviewFlags, '나중에 보완']
          : log.reviewFlags,
      updatedAt: new Date().toISOString(),
    }

    if (initial) store.updateLog(stamped)
    else store.addLog(stamped)

    if (mode === 'continue') {
      // 직전 로그의 5개 핵심값을 유지한 채 곧바로 새 로그 입력을 시작한다.
      const kept = seedLog(undefined, {
        visaStatus: stamped.visaStatus,
        nationality: stamped.nationality,
        caseType: stamped.caseType,
        guidanceScope: stamped.guidanceScope,
        queueTicketType: stamped.queueTicketType,
      }, store.settings.retentionDays)
      setLog(kept)
      setStep('edit')
      setAcknowledgePrivacy(false)
      setKeywordInput('')
      setMemoOpen(false)
      setJustContinued(true)
      // 다음 로그를 위해 응대 시간 타이머를 리셋한다(기재 방식 선호는 유지).
      startedAtRef.current = Date.now()
      setElapsedTick(0)
      setManualMinutes(0)
      setManualSeconds(0)
      return
    }
    setSavedToast(stamped)
    setStep('edit')
  }

  const privacyBlocks = privacyHits.length > 0 && !acknowledgePrivacy

  // ---- keyboard: Cmd/Ctrl+Enter 저장, +Shift 같은유형계속 ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      if (e.key.toLowerCase() !== 'enter') return
      e.preventDefault()
      if (privacyBlocks) {
        setStep('confirm')
        return
      }
      finalize(e.shiftKey ? 'continue' : 'save')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log, detectedKeywords, privacyHits, combos, acknowledgePrivacy])

  // ---------------- Toast after save ----------------
  if (savedToast) {
    return (
      <div className="space-y-4">
        <Banner tone="info">저장됨 — 방금 저장한 로그를 바로 고칠 수 있습니다.</Banner>
        <div className="card">
          <div className="text-sm text-gray-600">{summarizeLog(savedToast, { queue: queueLabel, nationality: nationalityLabel })}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-ghost"
            onClick={() => {
              setLog({ ...savedToast })
              setSavedToast(null)
            }}
          >
            수정
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              setLog(
                seedLog(undefined, {
                  visaStatus: savedToast.visaStatus,
                  nationality: savedToast.nationality,
                  caseType: savedToast.caseType,
                  guidanceScope: savedToast.guidanceScope,
                  queueTicketType: savedToast.queueTicketType,
                  memo: savedToast.memo,
                  nonIdentifyingKeywords: savedToast.nonIdentifyingKeywords,
                }, store.settings.retentionDays),
              )
              setSavedToast(null)
            }}
          >
            복제
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              setLog(
                seedLog(undefined, {
                  visaStatus: savedToast.visaStatus,
                  nationality: savedToast.nationality,
                  caseType: savedToast.caseType,
                  guidanceScope: savedToast.guidanceScope,
                  queueTicketType: savedToast.queueTicketType,
                }, store.settings.retentionDays),
              )
              setSavedToast(null)
            }}
          >
            같은 유형 계속
          </button>
          <button className="btn-primary" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    )
  }

  // ---------------- Confirm step (한 줄 요약) ----------------
  if (step === 'confirm') {
    return (
      <div className="space-y-4">
        <Field label="저장 전 한 줄 요약 (개인정보 미포함)">
          <div className="card text-sm font-medium text-ink">{summary}</div>
        </Field>

        {detectedKeywords.length > 0 && <Banner tone="warn">{RISK_WARNING} (감지: {detectedKeywords.join(', ')})</Banner>}
        {combos.map((c) => (
          <Banner key={c.code} tone="warn">
            {c.message}
          </Banner>
        ))}
        {riskKeywordButNoHandoff && (
          <Banner tone="danger">
            위험 키워드가 있는데 담당자 인계 여부가 비어 있습니다. 인계 여부를 기록하세요.
          </Banner>
        )}
        {privacyHits.length > 0 && (
          <div className="space-y-2">
            <Banner tone="danger">
              개인정보 의심 패턴이 감지되었습니다: {privacyHits.map((h) => h.label).join(', ')}. 비식별
              표현으로 바꾸는 것을 강력히 권장합니다.
            </Banner>
            <label className="flex items-center gap-2 text-sm text-risk-high">
              <input
                type="checkbox"
                checked={acknowledgePrivacy}
                onChange={(e) => setAcknowledgePrivacy(e.target.checked)}
              />
              경고를 확인했으며, 개인정보가 포함되지 않았음을 확인합니다.
            </label>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={() => setStep('edit')}>
            수정
          </button>
          <button className="btn-primary" disabled={privacyBlocks} onClick={() => finalize('save')}>
            확정 저장
          </button>
          <button
            className="btn-ghost"
            disabled={privacyBlocks}
            onClick={() => finalize('continue')}
          >
            저장 + 같은 유형 계속
          </button>
          <button className="btn-ghost" disabled={privacyBlocks} onClick={() => finalize('later')}>
            저장 + 나중에 보완
          </button>
        </div>
      </div>
    )
  }

  // ---------------- Edit step ----------------
  return (
    <div className="space-y-5">
      {justContinued && (
        <Banner tone="info">저장됨 — 같은 유형 값을 유지한 채 새 로그를 입력합니다.</Banner>
      )}
      {!initial && (
        <Field label="프리셋 (선택 후 필요한 항목만 변경)">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Chip key={p.id} active={false} onClick={() => applyPreset(p.id)}>
                {p.label}
              </Chip>
            ))}
          </div>
        </Field>
      )}

      <Field label="① 체류자격 *">
        <ChipGroup options={VISA_STATUSES} value={log.visaStatus} onChange={(v) => set({ visaStatus: v })} />
      </Field>

      <Field label="② 국적 *">
        <NationalityPicker value={log.nationality} onChange={(n) => set({ nationality: n })} />
      </Field>

      <Field label="③ 민원유형 *">
        <ChipGroup options={CASE_TYPES} value={log.caseType} onChange={(v) => set({ caseType: v })} />
      </Field>

      <Field label="④ 안내범위 * (복수 선택)">
        <MultiChipGroup options={GUIDANCE_SCOPES} values={log.guidanceScope} onToggle={toggleScope} />
      </Field>

      <Field label="⑤ 번호표 부여 유형 *" hint="실제 순번은 저장하지 않습니다">
        <ChipGroup
          options={QUEUE_TICKET_TYPES.map((q) => q.value)}
          value={log.queueTicketType}
          onChange={(v) => set({ queueTicketType: v })}
          render={(v) => queueLabel(v)}
        />
      </Field>

      <hr className="border-gray-100" />
      <p className="label">이하 선택 입력</p>

      <Field label="비식별 키워드" hint="개인 식별 정보 금지">
        <div className="flex gap-2">
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
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm"
          />
          <button className="btn-ghost" onClick={addKeyword}>
            추가
          </button>
        </div>
        {log.nonIdentifyingKeywords.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {log.nonIdentifyingKeywords.map((k) => (
              <span key={k} className="chip chip-off">
                {k}
                <button className="ml-1 text-gray-400" onClick={() => removeKeyword(k)}>
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </Field>

      {detectedKeywords.length > 0 && <Banner tone="warn">{RISK_WARNING}</Banner>}
      {combos.map((c) => (
        <Banner key={c.code} tone="warn">
          {c.message}
        </Banner>
      ))}
      {privacyHits.length > 0 && (
        <Banner tone="danger">
          개인정보 의심 패턴 감지: {privacyHits.map((h) => h.label).join(', ')}. 비식별 표현으로 바꿔주세요.
        </Banner>
      )}

      <Field label="안전문구 사용 여부">
        <MultiChipGroup options={SAFETY_PHRASE_TAGS} values={log.safetyPhraseUsed} onToggle={toggleSafety} />
      </Field>

      {recommendedPhrases.length > 0 && (
        <Field label={`추천 안전문구 (${recommendedTag})`}>
          <div className="space-y-2">
            {recommendedPhrases.map((p) => {
              const used = log.usedPhraseIds.includes(p.id)
              return (
                <button
                  key={p.id}
                  onClick={() => applyRecommendedPhrase(p)}
                  className={`w-full rounded-xl border p-3 text-left text-sm ${
                    used ? 'border-risk-low bg-risk-low/5' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold">
                    {used ? '✓ 사용됨 · ' : ''}
                    {p.title}
                  </div>
                  <div className="mt-1 text-gray-500">{p.text}</div>
                </button>
              )
            })}
          </div>
        </Field>
      )}

      <Field label="담당자 인계 여부">
        <ChipGroup
          options={['true', 'false', 'unknown'] as const}
          value={log.handedOffToOfficer}
          onChange={(v) => set({ handedOffToOfficer: v })}
          render={(v) => (v === 'true' ? '인계함' : v === 'false' ? '인계 안 함' : '미기재')}
        />
      </Field>

      <Field label="응대 시간" hint="실제 사건 시각이 아닌 소요 시간(분/초)만 기록합니다">
        <ChipGroup
          options={durationOptions.map((m) => m.value)}
          value={durationMode}
          onChange={(v) => setDurationMode(v)}
          render={(v) => durationOptions.find((m) => m.value === v)?.label ?? v}
        />
        {durationMode === 'auto' && (
          <p className="mt-2 text-sm text-gray-500">
            경과 시간: <span className="font-semibold text-ink">{formatDuration(liveElapsedSeconds)}</span>
            {' '}(저장 시 자동 기록됩니다)
          </p>
        )}
        {durationMode === 'manual' && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <input
              type="number"
              min={0}
              max={180}
              value={manualMinutes}
              onChange={(e) => setManualMinutes(Math.max(0, Math.min(180, Number(e.target.value) || 0)))}
              className="w-16 rounded-xl border border-gray-300 px-2 py-1.5 text-center"
            />
            <span className="text-gray-500">분</span>
            <input
              type="number"
              min={0}
              max={59}
              value={manualSeconds}
              onChange={(e) => setManualSeconds(Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
              className="w-16 rounded-xl border border-gray-300 px-2 py-1.5 text-center"
            />
            <span className="text-gray-500">초</span>
          </div>
        )}
        {initial?.handlingDurationMode === 'auto' && initial.handlingDurationSeconds != null && (
          <p className="mt-1 text-xs text-gray-400">
            최초 자동 측정값: {formatDuration(initial.handlingDurationSeconds)} (수정 시 수동 입력으로 전환됩니다)
          </p>
        )}
      </Field>

      <Field label="리스크 수준">
        <ChipGroup options={RISK_LEVELS} value={log.riskLevel} onChange={(v) => set({ riskLevel: v })} />
      </Field>

      <Field label="확신도">
        <ChipGroup
          options={CONFIDENCE_LEVELS}
          value={log.confidenceLevel}
          onChange={(v) => set({ confidenceLevel: v })}
        />
      </Field>

      <Field label="검토 플래그">
        <MultiChipGroup options={REVIEW_FLAGS} values={log.reviewFlags} onToggle={toggleFlag} />
      </Field>

      <Field label="메모 (선택)">
        {!memoOpen ? (
          <button className="btn-ghost" onClick={() => setMemoOpen(true)}>
            메모 펼치기
          </button>
        ) : (
          <div className="space-y-2">
            <Banner tone="warn">{MEMO_WARNING}</Banner>
            {memoSuggestion && (
              <button
                className="w-full rounded-xl border border-gray-200 p-2 text-left text-xs text-gray-500 hover:border-gray-400"
                onClick={() => set({ memo: memoSuggestion })}
              >
                자동 메모 제안 적용: {memoSuggestion}
              </button>
            )}
            <textarea
              value={log.memo}
              onChange={(e) => set({ memo: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              placeholder="비식별 요약만 작성"
            />
          </div>
        )}
      </Field>

      <div className="sticky bottom-0 -mx-4 border-t border-gray-100 bg-white px-4 py-3">
        {!requiredComplete && (
          <p className="mb-2 text-xs text-risk-caution">안내범위를 1개 이상 선택하세요.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => setStep('confirm')}>
            저장 (요약 확인)
          </button>
          <button
            className="btn-ghost"
            onClick={() => (privacyBlocks ? setStep('confirm') : finalize('continue'))}
          >
            저장 + 같은 유형 계속
          </button>
          <button
            className="btn-ghost"
            onClick={() => (privacyBlocks ? setStep('confirm') : finalize('later'))}
          >
            저장 + 나중에 보완
          </button>
          <button className="btn-ghost" onClick={onClose}>
            취소
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">단축키: 저장 ⌘/Ctrl+Enter · 같은 유형 계속 ⌘/Ctrl+Shift+Enter</p>
      </div>
    </div>
  )
}
