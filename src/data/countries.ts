// 국적 선택지. 내부 저장값은 ISO 3166-1 alpha-2 countryCode.
// UI에는 한국어 국가명을 표시한다.

export interface CountryOption {
  code: string // alpha-2, 또는 특수 모드 코드
  nameKo: string
}

// 특수(비국가) 옵션 — Nationality.mode 로 매핑됨
export const SPECIAL_NATIONALITY = {
  not_recorded: { code: 'NOT_RECORDED', nameKo: '미기재' },
  unknown: { code: 'UNKNOWN', nameKo: '국적 미확인' },
  other: { code: 'OTHER', nameKo: '기타' },
  multiple_possible: { code: 'MULTIPLE', nameKo: '복수국적 가능성' },
  stateless_or_refugee_related: { code: 'STATELESS', nameKo: '무국적/난민 관련' },
} as const

export const COUNTRIES: CountryOption[] = [
  { code: 'US', nameKo: '미국' },
  { code: 'CN', nameKo: '중국' },
  { code: 'VN', nameKo: '베트남' },
  { code: 'MN', nameKo: '몽골' },
  { code: 'UZ', nameKo: '우즈베키스탄' },
  { code: 'RU', nameKo: '러시아' },
  { code: 'PH', nameKo: '필리핀' },
  { code: 'TH', nameKo: '태국' },
  { code: 'JP', nameKo: '일본' },
  { code: 'KZ', nameKo: '카자흐스탄' },
  { code: 'ID', nameKo: '인도네시아' },
  { code: 'NP', nameKo: '네팔' },
  { code: 'KH', nameKo: '캄보디아' },
  { code: 'MM', nameKo: '미얀마' },
  { code: 'IN', nameKo: '인도' },
  { code: 'PK', nameKo: '파키스탄' },
  { code: 'BD', nameKo: '방글라데시' },
  { code: 'LK', nameKo: '스리랑카' },
  { code: 'CA', nameKo: '캐나다' },
  { code: 'GB', nameKo: '영국' },
  { code: 'FR', nameKo: '프랑스' },
  { code: 'DE', nameKo: '독일' },
  { code: 'AU', nameKo: '호주' },
]

export function countryNameByCode(code?: string): string | undefined {
  if (!code) return undefined
  return COUNTRIES.find((c) => c.code === code)?.nameKo
}
