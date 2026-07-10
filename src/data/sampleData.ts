import type { LogEntry, ManualEntry } from '../types'
import { createEmptyLog } from '../lib/storage'
import { detectRiskKeywords } from '../lib/riskDetector'
import { detectRiskCombinations } from '../lib/riskCombinationDetector'

// 개인정보가 전혀 없는 샘플 로그. 첫 실행 시 사용자가 원하면 불러온다.
// 이름/기관명/등록번호/전화번호/주소/실제 번호표 순번을 절대 포함하지 않는다.
export function makeSampleLogs(): LogEntry[] {
  const base: Partial<LogEntry>[] = [
    {
      visaStatus: 'E-2',
      nationality: { mode: 'specified', countryCode: 'US', countryNameKo: '미국' },
      caseType: '전자민원/하이코리아 계정',
      guidanceScope: ['하이코리아 계정/예약 문제 안내'],
      queueTicketType: 'not_issued',
      counterReferral: { mode: 'not_referred' },
      nonIdentifyingKeywords: ['계정 분실'],
      safetyPhraseUsed: ['예약과 신고기한 별도 안내'],
      riskLevel: '낮음',
      confidenceLevel: '일반 안내 수준',
    },
    {
      visaStatus: 'E-2',
      nationality: { mode: 'not_recorded' },
      caseType: '체류기간 연장',
      guidanceScope: ['서류 일반 안내'],
      queueTicketType: 'reservation_confirmed',
      counterReferral: { mode: 'referred', counterNumber: '8', counterLabel: '8번 창구' },
      safetyPhraseUsed: ['담당자 확인 안내'],
      riskLevel: '주의',
      confidenceLevel: '일반 안내 수준',
    },
    {
      visaStatus: 'D-2',
      nationality: { mode: 'specified', countryCode: 'CN', countryNameKo: '중국' },
      caseType: '외국인등록',
      guidanceScope: ['단순 위치 안내', '번호표 부여'],
      queueTicketType: 'general_information',
      counterReferral: { mode: 'not_referred' },
      riskLevel: '낮음',
      confidenceLevel: '확실함',
    },
    {
      visaStatus: 'E-7',
      nationality: { mode: 'specified', countryCode: 'VN', countryNameKo: '베트남' },
      caseType: '근무처 변경/추가',
      guidanceScope: ['담당자에게 직접 인계'],
      queueTicketType: 'non_reservation',
      counterReferral: { mode: 'referred', counterLabel: '담당자 인계' },
      nonIdentifyingKeywords: ['근무처'],
      safetyPhraseUsed: ['담당자 확인 안내'],
      handedOffToOfficer: 'true',
      riskLevel: '높음',
      confidenceLevel: '담당자 확인 필요',
      reviewFlags: ['담당자 확인 필요'],
    },
  ]

  return base.map((patch) => {
    const log = { ...createEmptyLog(), ...patch } as LogEntry
    log.detectedRiskKeywords = detectRiskKeywords(log.memo, log.nonIdentifyingKeywords)
    log.detectedRiskCombinations = detectRiskCombinations(log).map((c) => c.code)
    return log
  })
}

export const SAMPLE_MANUALS: ManualEntry[] = [
  {
    id: 'man-e2-workplace',
    topic: 'E-2 근무처 변경/추가',
    summary:
      '근무처 변경/추가는 예약과 별개로 신고·허가 기한이 존재할 수 있음. 단순 예약 안내로 종결하지 말 것. 담당자 확인 유도.',
    legalBasis: '출입국관리법 및 관련 고시 (실제 조문은 담당자/공식 매뉴얼 확인)',
    source: '내부 업무 매뉴얼 요약',
    checkedDate: '2026-01-01',
    version: 'draft-1',
    notes: '법령 전문 저장 금지. 요약/출처만 관리.',
    tags: ['E-2', '근무처', '신고기한'],
  },
  {
    id: 'man-extend',
    topic: '체류기간 연장',
    summary:
      '연장은 방문예약 + 서류 확인 안내. 근무처 변경/자격외활동 등 별도 신고 사항 여부를 항상 함께 확인.',
    legalBasis: '공식 매뉴얼 확인 필요',
    source: '내부 업무 매뉴얼 요약',
    checkedDate: '2026-01-01',
    version: 'draft-1',
    notes: '',
    tags: ['연장', '서류'],
  },
  {
    id: 'man-hikorea',
    topic: '하이코리아 계정 분실 및 예약',
    summary:
      '계정 찾기/재가입 안내. 예약은 접수 편의 절차일 뿐 신고·허가 기한과 별도임을 반드시 안내.',
    legalBasis: '해당 없음(시스템 안내)',
    source: '하이코리아 이용 안내 요약',
    checkedDate: '2026-01-01',
    version: 'draft-1',
    notes: '외국인 인적사항을 앱에 기재하지 말 것.',
    tags: ['하이코리아', '예약', '계정'],
  },
  {
    id: 'man-activity',
    topic: '자격외활동/취업허가',
    summary: '허가 전 활동 시 불이익 가능. 예약일과 허가 가능일 혼동 주의. 담당자 확인 권장.',
    legalBasis: '공식 매뉴얼 확인 필요',
    source: '내부 업무 매뉴얼 요약',
    checkedDate: '2026-01-01',
    version: 'draft-1',
    notes: '',
    tags: ['자격외활동', '취업허가'],
  },
  {
    id: 'man-address',
    topic: '체류지 변경',
    summary: '변경일 기준 별도 신고기한 가능성 안내. 주소 원문 저장 금지.',
    legalBasis: '공식 매뉴얼 확인 필요',
    source: '내부 업무 매뉴얼 요약',
    checkedDate: '2026-01-01',
    version: 'draft-1',
    notes: '',
    tags: ['체류지', '신고'],
  },
  {
    id: 'man-queue',
    topic: '번호표 부여 기준 메모',
    summary:
      '번호표는 유형만 비식별로 기록. 실제 순번/호출번호 저장 금지. 담당자 확인 필요 건을 단순 안내 번호표로 끝내지 말 것.',
    legalBasis: '해당 없음(내부 운영 기준)',
    source: '창구 운영 메모',
    checkedDate: '2026-01-01',
    version: 'draft-1',
    notes: '',
    tags: ['번호표', '운영'],
  },
]
