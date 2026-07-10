import { useMemo, useState } from 'react'
import type { LogEntry } from '../types'
import { useStore } from '../app/store'
import { CASE_TYPES, QUEUE_TICKET_TYPES, RISK_LEVELS, VISA_STATUSES, queueLabel } from '../data/constants'
import { LogCard } from './LogCard'
import { Banner, Field } from './ui'

type TriState = 'any' | 'yes' | 'no'

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

function counterFilterLabel(log: LogEntry): string {
  const counter = log.counterReferral
  if (!counter || counter.mode === 'not_referred') return '창구 안내 없음'
  if (counter.mode === 'unknown') return '창구 기억 안 남'
  return counter.counterLabel ?? (counter.counterNumber ? `${counter.counterNumber}번 창구` : '창구 안내')
}

export function ReconstructionMode({ onEdit }: { onEdit: (l: LogEntry) => void }) {
  const { logs } = useStore()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [visa, setVisa] = useState('any')
  const [caseType, setCaseType] = useState('any')
  const [queue, setQueue] = useState('any')
  const [counter, setCounter] = useState('any')
  const [risk, setRisk] = useState('any')
  const [riskKeyword, setRiskKeyword] = useState<TriState>('any')
  const [riskCombo, setRiskCombo] = useState<TriState>('any')
  const [handoff, setHandoff] = useState('any')
  const [phrase, setPhrase] = useState<TriState>('any')

  const filtered = useMemo(() => {
    return logs
      .filter((l) => {
        const d = l.createdAt.slice(0, 10)
        if (from && d < from) return false
        if (to && d > to) return false
        if (visa !== 'any' && l.visaStatus !== visa) return false
        if (caseType !== 'any' && l.caseType !== caseType) return false
        if (queue !== 'any' && l.queueTicketType !== queue) return false
        if (counter !== 'any' && counterFilterLabel(l) !== counter) return false
        if (risk !== 'any' && l.riskLevel !== risk) return false
        if (handoff !== 'any' && l.handedOffToOfficer !== handoff) return false
        const hasKw = l.detectedRiskKeywords.length > 0
        if (riskKeyword === 'yes' && !hasKw) return false
        if (riskKeyword === 'no' && hasKw) return false
        const hasCombo = l.detectedRiskCombinations.length > 0
        if (riskCombo === 'yes' && !hasCombo) return false
        if (riskCombo === 'no' && hasCombo) return false
        const usedPhrase = l.safetyPhraseUsed.length > 0 && !l.safetyPhraseUsed.includes('미사용')
        if (phrase === 'yes' && !usedPhrase) return false
        if (phrase === 'no' && usedPhrase) return false
        return true
      })
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }, [logs, from, to, visa, caseType, queue, counter, risk, handoff, riskKeyword, riskCombo, phrase])

  const visaOptions = useMemo(() => unique([...VISA_STATUSES, ...logs.map((l) => l.visaStatus)]), [logs])
  const caseOptions = useMemo(() => unique([...CASE_TYPES, ...logs.map((l) => l.caseType)]), [logs])
  const queueOptions = useMemo(
    () => unique([...QUEUE_TICKET_TYPES.map((q) => q.value), ...logs.map((l) => l.queueTicketType)]),
    [logs],
  )
  const counterOptions = useMemo(() => unique(logs.map(counterFilterLabel)), [logs])

  const summary = useMemo(() => {
    const n = filtered.length
    if (n === 0) return null
    const scopeCount: Record<string, number> = {}
    filtered.forEach((l) => l.guidanceScope.forEach((s) => (scopeCount[s] = (scopeCount[s] ?? 0) + 1)))
    const topScope = Object.entries(scopeCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '안내범위 미기록'
    const phraseN = filtered.filter((l) => l.safetyPhraseUsed.length > 0 && !l.safetyPhraseUsed.includes('미사용')).length
    const kwN = filtered.filter((l) => l.detectedRiskKeywords.length > 0).length
    const handoffN = filtered.filter((l) => l.handedOffToOfficer === 'true').length
    return `해당 기간/조건에서 관련 안내 로그가 ${n}건 기록되어 있습니다. 주요 안내범위는 '${topScope}'였고, 안전문구가 ${phraseN}건에서 사용되었습니다. 위험 키워드가 감지된 로그는 ${kwN}건이며, 담당자 인계 기록은 ${handoffN}건입니다.`
  }, [filtered])

  const sel = 'rounded-xl border border-gray-300 px-3 py-2 text-sm w-full'

  return (
    <div className="space-y-4">
      <div>
        <h2 className="section-title">사건 재구성 모드</h2>
        <p className="text-sm text-gray-500">기억에만 의존하지 않도록 조건으로 업무 흐름을 재구성합니다. 민원인 식별정보는 출력하지 않습니다.</p>
      </div>

      <div className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="시작일"><input type="date" className={sel} value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
        <Field label="종료일"><input type="date" className={sel} value={to} onChange={(e) => setTo(e.target.value)} /></Field>
        <Field label="체류자격">
          <select className={sel} value={visa} onChange={(e) => setVisa(e.target.value)}>
            <option value="any">전체</option>
            {visaOptions.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </Field>
        <Field label="민원유형">
          <select className={sel} value={caseType} onChange={(e) => setCaseType(e.target.value)}>
            <option value="any">전체</option>
            {caseOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="번호표 유형">
          <select className={sel} value={queue} onChange={(e) => setQueue(e.target.value)}>
            <option value="any">전체</option>
            {queueOptions.map((q) => <option key={q} value={q}>{queueLabel(q)}</option>)}
          </select>
        </Field>
        <Field label="창구 안내">
          <select className={sel} value={counter} onChange={(e) => setCounter(e.target.value)}>
            <option value="any">전체</option>
            {counterOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="리스크 수준">
          <select className={sel} value={risk} onChange={(e) => setRisk(e.target.value)}>
            <option value="any">전체</option>
            {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="담당자 인계">
          <select className={sel} value={handoff} onChange={(e) => setHandoff(e.target.value)}>
            <option value="any">전체</option>
            <option value="true">인계함</option>
            <option value="false">인계 안 함</option>
            <option value="unknown">미기재</option>
          </select>
        </Field>
        <Field label="위험 키워드 포함">
          <select className={sel} value={riskKeyword} onChange={(e) => setRiskKeyword(e.target.value as TriState)}>
            <option value="any">전체</option><option value="yes">포함</option><option value="no">미포함</option>
          </select>
        </Field>
        <Field label="위험 조합 포함">
          <select className={sel} value={riskCombo} onChange={(e) => setRiskCombo(e.target.value as TriState)}>
            <option value="any">전체</option><option value="yes">포함</option><option value="no">미포함</option>
          </select>
        </Field>
        <Field label="안전문구 사용">
          <select className={sel} value={phrase} onChange={(e) => setPhrase(e.target.value as TriState)}>
            <option value="any">전체</option><option value="yes">사용</option><option value="no">미사용</option>
          </select>
        </Field>
      </div>

      {summary && (
        <div className="card">
          <div className="label mb-1">출력용 요약 (개인정보 미포함)</div>
          <p className="text-sm text-ink">{summary}</p>
        </div>
      )}
      <Banner tone="warn">특정인을 지목하는 서술을 만들지 마세요. 법적 책임 판단은 자동으로 하지 않습니다.</Banner>

      <div className="text-xs text-gray-400">{filtered.length}건 (시간순)</div>
      <div className="space-y-3">
        {filtered.map((l) => (
          <LogCard key={l.id} log={l} onEdit={onEdit} />
        ))}
      </div>
    </div>
  )
}
