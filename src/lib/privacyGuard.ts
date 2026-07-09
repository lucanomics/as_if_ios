// 개인정보 의심 패턴 감지. 저장/내보내기 전에 텍스트를 스캔한다.
// 목적: 민원인을 식별할 수 있는 정보가 로그에 들어가지 못하게 막는다.

export interface PrivacyHit {
  pattern: string // 분류 코드 (필터/통계용)
  label: string // 사용자 표시 설명
  sample?: string // 매칭된 문자열 일부 (원문 노출 최소화)
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
// 전화번호: 010-1234-5678, 01012345678, +82 10 ... 등
const PHONE_RE = /(\+?\d{1,3}[-\s.]?)?01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/
// 7자리 이상 연속 숫자
const LONG_DIGITS_RE = /\d{7,}/
// 외국인등록번호/주민등록번호 유사: 6자리-7자리
const RRN_LIKE_RE = /\d{6}[-\s]?\d{7}/
// 여권번호 유사: 영문 1~2 + 숫자 6~8
const PASSPORT_LIKE_RE = /\b[A-Za-z]{1,2}\d{6,8}\b/
// 번호표 순번 유사: A-103, B27, C-018, "8번 42번" 등
const QUEUE_SEQ_RE = /\b[A-Za-z]-?\d{1,4}\b|\d{1,4}\s*번\s*\d{1,4}\s*번/
// 주소 유사 표현
const ADDRESS_RE = /(시|도|구|군|읍|면|동|로|길)\s?\d+|아파트|번지|호수|\d+동\s?\d+호/
// 기관명 원문 가능성
const ORG_RE = /(주식회사|\(주\)|㈜|학교|학원|대학교|대학|회사|대표|원장|법인|사업장명)/

const CHECKS: { re: RegExp; pattern: string; label: string }[] = [
  { re: EMAIL_RE, pattern: 'email', label: '이메일 주소로 보이는 표현' },
  { re: PHONE_RE, pattern: 'phone', label: '전화번호로 보이는 표현' },
  { re: RRN_LIKE_RE, pattern: 'rrn', label: '등록번호/주민번호로 보이는 숫자 패턴' },
  { re: PASSPORT_LIKE_RE, pattern: 'passport', label: '여권번호로 보이는 영문+숫자 패턴' },
  { re: QUEUE_SEQ_RE, pattern: 'queue_seq', label: '실제 번호표 순번으로 보이는 표현' },
  { re: ADDRESS_RE, pattern: 'address', label: '주소로 보이는 표현' },
  { re: ORG_RE, pattern: 'org', label: '기관명 원문 가능성이 있는 표현' },
  { re: LONG_DIGITS_RE, pattern: 'long_digits', label: '7자리 이상 연속 숫자' },
]

export function scanPrivacy(text: string): PrivacyHit[] {
  if (!text) return []
  const hits: PrivacyHit[] = []
  const seen = new Set<string>()
  for (const c of CHECKS) {
    const m = text.match(c.re)
    if (m && !seen.has(c.pattern)) {
      seen.add(c.pattern)
      hits.push({ pattern: c.pattern, label: c.label, sample: m[0]?.slice(0, 24) })
    }
  }
  return hits
}

// 여러 필드를 한 번에 스캔 (키워드 + 메모)
export function scanEntryTexts(memo: string, keywords: string[]): PrivacyHit[] {
  const combined = [memo, ...keywords].join('\n')
  return scanPrivacy(combined)
}

export function hasPrivacyRisk(text: string): boolean {
  return scanPrivacy(text).length > 0
}
