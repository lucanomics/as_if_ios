import type { LogEntry } from '../types'
import { hasE2WorkplaceKeyword } from './riskDetector'

// 필드 조합 기반 위험 경고. 단순 키워드보다 강한 신호.
export interface RiskCombination {
  code: string
  message: string
}

// LogEntry 의 부분값으로 평가할 수 있도록 Partial 을 받는다.
type LogLike = Pick<
  LogEntry,
  | 'caseType'
  | 'guidanceScope'
  | 'safetyPhraseUsed'
  | 'handedOffToOfficer'
  | 'queueTicketType'
  | 'riskLevel'
  | 'visaStatus'
  | 'memo'
  | 'nonIdentifyingKeywords'
  | 'detectedRiskKeywords'
>

export function detectRiskCombinations(log: LogLike): RiskCombination[] {
  const out: RiskCombination[] = []
  const scopes = log.guidanceScope ?? []
  const phrases = log.safetyPhraseUsed ?? []
  const onlyReservationScope =
    scopes.length > 0 &&
    scopes.every(
      (s) => s === '방문예약 방법 안내' || s === '하이코리아 계정/예약 문제 안내',
    )
  const hasRiskKeyword = (log.detectedRiskKeywords ?? []).length > 0
  const phraseUnused = phrases.length === 0 || phrases.includes('미사용')

  // 1. 근무처 변경/추가 + 예약 안내만
  if (log.caseType === '근무처 변경/추가' && onlyReservationScope) {
    out.push({
      code: 'workplace_reservation_only',
      message:
        '근무처 변경/추가 가능성이 있는 건은 단순 예약 안내로 종결하면 위험할 수 있습니다. 담당자 확인 또는 인계 여부를 기록하세요.',
    })
  }

  // 2. 자격외활동/취업허가 + 안전문구 미사용
  if (log.caseType === '자격외활동/취업허가' && phraseUnused) {
    out.push({
      code: 'activity_no_phrase',
      message:
        '자격외활동/취업허가 관련 건은 허가 전 활동 금지 또는 담당자 확인 안내 문구 사용을 권장합니다.',
    })
  }

  // 3. 사범/범칙금 + 담당자 인계 false/unknown
  if (
    log.caseType === '사범/범칙금 가능성' &&
    (log.handedOffToOfficer === 'false' || log.handedOffToOfficer === 'unknown')
  ) {
    out.push({
      code: 'penalty_no_handoff',
      message:
        '사범/범칙금 가능성 건은 담당자 확인 또는 인계 여부를 반드시 기록해야 합니다.',
    })
  }

  // 4. 비예약 번호표 + 리스크 비어있거나 낮음
  if (
    log.queueTicketType === 'non_reservation' &&
    (log.riskLevel === null || log.riskLevel === undefined || log.riskLevel === '낮음')
  ) {
    out.push({
      code: 'nonreservation_low_risk',
      message:
        '비예약 처리 건은 기한 임박 또는 예외 상황일 수 있습니다. 리스크 수준과 담당자 확인 여부를 점검하세요.',
    })
  }

  // 5. E-2 + 근무처 관련 키워드
  if (
    log.visaStatus === 'E-2' &&
    hasE2WorkplaceKeyword(log.memo ?? '', log.nonIdentifyingKeywords ?? [])
  ) {
    out.push({
      code: 'e2_workplace_keyword',
      message:
        'E-2 근무처 변경/추가 가능성이 있습니다. 예약 안내와 신고·허가 기한은 별도일 수 있으므로 담당자 확인을 권장합니다.',
    })
  }

  // 6. 안전문구 미사용 + 위험 키워드 감지
  if (phraseUnused && hasRiskKeyword) {
    out.push({
      code: 'keyword_no_phrase',
      message: '위험 키워드가 감지되었는데 안전문구가 사용되지 않았습니다.',
    })
  }

  return out
}
