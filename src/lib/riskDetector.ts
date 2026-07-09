// 위험 키워드 감지. 비식별 키워드 또는 메모에서 아래 단어가 발견되면 경고.

export const RISK_KEYWORDS = [
  '근무처',
  '사업장',
  '고용주',
  '새 학원',
  '새 학교',
  '계약 종료',
  '퇴사',
  '해고',
  '이미 근무',
  '자격외활동',
  '알바',
  '취업허가',
  '기한 지남',
  '만료',
  '범칙금',
  '사범',
]

export const RISK_WARNING =
  '이 건은 단순 예약 안내로 끝내면 위험할 수 있습니다. 예약일과 신고·허가 기한은 별도일 수 있으므로 담당자 확인 또는 인계 기록을 남기세요.'

export function detectRiskKeywords(memo: string, keywords: string[]): string[] {
  const haystack = [memo, ...keywords].join(' ')
  return RISK_KEYWORDS.filter((k) => haystack.includes(k))
}

// E-2 근무처 관련 특정 키워드 (조합 감지에서 사용)
export const E2_WORKPLACE_KEYWORDS = [
  '새 학원',
  '새 학교',
  '근무처',
  '고용주',
  '계약 종료',
  '퇴사',
  '이미 근무',
]

export function hasE2WorkplaceKeyword(memo: string, keywords: string[]): boolean {
  const haystack = [memo, ...keywords].join(' ')
  return E2_WORKPLACE_KEYWORDS.some((k) => haystack.includes(k))
}
