import type {
  VisaStatus,
  CaseType,
  GuidanceScope,
  QueueTicketType,
  SafetyPhraseTag,
  RiskLevel,
  ConfidenceLevel,
  ReviewFlag,
  VisitStatus,
} from '../types'

export const APP_NAME = 'Desksht'
export const APP_SUBTITLE = '비식별 창구 안내 품질관리 도구'

export const FIXED_NOTICE =
  '이 도구는 개인용 비식별 안내 품질관리 도구이며, 공식 행정처리 기록이 아닙니다. 민원인 개인정보와 내부 전산정보를 입력하지 마세요.'

export const DEPLOY_NOTICE =
  '이 앱은 웹에 배포되어 있을 수 있지만, 입력한 업무기록은 서버가 아니라 현재 브라우저에만 저장됩니다. 공용 PC나 타인이 접근할 수 있는 기기에서는 사용하지 마세요. 민원인 개인정보, 내부 전산정보, 실제 번호표 순번은 절대 입력하지 마세요.'

export const MEMO_WARNING =
  '이름, 등록번호, 여권번호, 전화번호, 주소, 학교명, 회사명, 학원명, 접수번호, 실제 번호표 순번을 입력하지 마세요.'

export const COMMON_VISA_STATUSES: VisaStatus[] = [
  'E-2',
  'E-7',
  'D-2',
  'D-4',
  'F-4',
  'F-6',
  'H-2',
  'C-3',
  'E-9',
  '기타',
]

export const VISA_STATUSES: VisaStatus[] = [
  'A-1',
  'A-2',
  'A-3',
  'B-1',
  'B-2',
  'C-1',
  'C-3',
  'C-4',
  'D-1',
  'D-2',
  'D-3',
  'D-4',
  'D-5',
  'D-6',
  'D-7',
  'D-8',
  'D-9',
  'D-10',
  'E-1',
  'E-2',
  'E-3',
  'E-4',
  'E-5',
  'E-6',
  'E-7',
  'E-8',
  'E-9',
  'E-10',
  'F-1',
  'F-2',
  'F-3',
  'F-4',
  'F-5',
  'F-6',
  'G-1',
  'H-1',
  'H-2',
  '기타',
]

export const CASE_TYPES: CaseType[] = [
  '사증발급(E-10 제외)',
  '사증발급(E-10)',
  '주소지 이전',
  '정보공개청구',
  '출입국사실증명',
  '등록증 교부',
  '지문 등록',
  '여권 정보 변경 신고',
  '전자민원 승인 스티커 부착',
  '방문예약/예약 문제',
  '통합신청서/서식 안내',
  '외국인등록',
  '외국인등록(비예약)',
  '등록증 재발급',
  '체류기간 연장',
  '체류자격 변경',
  '체류자격 부여',
  '근무처 변경/추가',
  '자격외활동/취업허가',
  '체류지 변경',
  '재입국허가',
  '출국기한 유예',
  '외국인등록사실증명',
  '국내거소신고 사실증명',
  '사증발급인정서/사증',
  '단기체류/입국',
  '영주(F-5)',
  '결혼이민(F-6)',
  '재외동포(F-4)',
  '국적/귀화/국적회복',
  '난민',
  '사범/범칙금 가능성',
  '보호/출국명령/강제퇴거 관련',
  '전자민원/하이코리아 계정',
  '기타',
]

export const GUIDANCE_SCOPES: GuidanceScope[] = [
  '단순 위치 안내',
  '방문예약 방법 안내',
  '하이코리아 계정/예약 문제 안내',
  '서류 일반 안내',
  '통합신청서/신고서 작성 안내',
  '예약번호 확인',
  '번호표 부여',
  '번호표 없이 돌려보냄',
  '예약 필요 안내 후 돌려보냄',
  '서류 보완 안내 후 재방문',
  '담당 창구로 안내',
  '응대 창구 기록',
  '전자민원 승인 스티커 담당자 요청',
  '담당자에게 직접 인계',
  '접수 가능 여부 담당자 확인 안내',
  '법적 판단은 담당자 확인 안내',
  '체류기간 만료 관련 일반 안내',
  '신고·허가 기한 관련 일반 주의 안내',
  '1345 안내',
  '민원인이 주장한 내용만 청취',
  '기타',
]

// 번호표 유형: 저장값(코드) <-> UI 표시명
export const QUEUE_TICKET_TYPES: { value: QueueTicketType; label: string }[] = [
  { value: 'not_issued', label: '미부여' },
  { value: 'unknown', label: '기억 안 남' },
  { value: 'non_reservation', label: '비예약' },
  { value: 'reservation_confirmed', label: '예약 확인' },
  { value: 'stay', label: '체류' },
  { value: 'visa', label: '사증' },
  { value: 'visa_e10', label: '사증 E-10' },
  { value: 'certificate', label: '증명' },
  { value: 'card_pickup', label: '등록증 교부' },
  { value: 'fingerprint', label: '지문' },
  { value: 'address_change', label: '주소지' },
  { value: 'info_disclosure', label: '정보공개' },
  { value: 'passport_change', label: '여권변경' },
  { value: 'sticker', label: '스티커' },
  { value: 'nationality', label: '국적' },
  { value: 'refugee', label: '난민' },
  { value: 'investigation', label: '사범/조사' },
  { value: 'counter_8', label: '8번' },
  { value: 'counter_7', label: '7번' },
  { value: 'general_information', label: '일반 안내' },
  { value: 'officer_handoff', label: '담당자 인계' },
  { value: 'other', label: '기타' },
]

export function queueLabel(value: QueueTicketType): string {
  return QUEUE_TICKET_TYPES.find((q) => q.value === value)?.label ?? value
}

export const COUNTER_ASSIGNMENTS = [
  { counterNumber: '1', staffName: '수민 반장', label: '1 수민 반장' },
  { counterNumber: '2', staffName: '소윤 반장', label: '2 소윤 반장' },
  { counterNumber: '3', staffName: '민경 반장', label: '3 민경 반장' },
  { counterNumber: '4', staffName: '형주 반장', label: '4 형주 반장' },
  { counterNumber: '5', staffName: '연아 계장', label: '5 사증 연아 계장' },
  { counterNumber: '6', staffName: '은경 계장', label: '6 국적 은경 계장' },
  { counterNumber: '7', staffName: '하나 반장', label: '7 증명발급 하나 반장' },
  { counterNumber: '8', staffName: '관순 반장', label: '8 등록증 교부 관순 반장' },
  { staffName: '한슬 반장', label: '전자민원 스티커 한슬 반장' },
]

export const COUNTER_SUGGESTIONS = [
  ...COUNTER_ASSIGNMENTS.map((counter) => counter.label),
  '국적',
  '사증',
  '조사',
  '상담',
]

export const VISIT_STATUSES: { value: VisitStatus; label: string }[] = [
  { value: 'waiting', label: '대기중' },
  { value: 'in_consultation', label: '상담중' },
  { value: 'sent_to_counter', label: '창구 보냄' },
  { value: 'completed', label: '완료' },
  { value: 'returned', label: '돌려보냄' },
  { value: 'needs_followup', label: '추가 확인' },
]

export const ACTIVE_VISIT_STATUSES: VisitStatus[] = ['waiting', 'in_consultation', 'sent_to_counter', 'needs_followup']

export function visitStatusLabel(value: VisitStatus): string {
  return VISIT_STATUSES.find((status) => status.value === value)?.label ?? value
}

export const SAFETY_PHRASE_TAGS: SafetyPhraseTag[] = [
  '예약과 신고기한 별도 안내',
  '허가 전 활동 금지 안내',
  '담당자 확인 안내',
  '1345 안내',
  '미사용',
]

export const RISK_LEVELS: RiskLevel[] = ['낮음', '주의', '높음', '담당자 확인 필요']

export const CONFIDENCE_LEVELS: ConfidenceLevel[] = [
  '확실함',
  '일반 안내 수준',
  '헷갈림',
  '담당자 확인 필요',
  '내가 판단하면 안 되는 영역',
]

export const REVIEW_FLAGS: ReviewFlag[] = [
  '나중에 보완',
  '헷갈림',
  '담당자 확인 필요',
  '매뉴얼 업데이트 필요',
  '사건성 있음',
  '수동 보존',
]

// 안전문구 자동 추천 (민원유형 -> SafetyPhraseTag)
export const SAFETY_PHRASE_RECOMMENDATION: Partial<Record<CaseType, SafetyPhraseTag>> = {
  '방문예약/예약 문제': '예약과 신고기한 별도 안내',
  '전자민원/하이코리아 계정': '예약과 신고기한 별도 안내',
  '전자민원 승인 스티커 부착': '담당자 확인 안내',
  '체류기간 연장': '담당자 확인 안내',
  '근무처 변경/추가': '담당자 확인 안내',
  '자격외활동/취업허가': '허가 전 활동 금지 안내',
  '사범/범칙금 가능성': '담당자 확인 안내',
  '체류지 변경': '예약과 신고기한 별도 안내',
}

export function riskColorClass(level: RiskLevel | null): string {
  switch (level) {
    case '낮음':
      return 'bg-risk-low/10 text-risk-low border-risk-low/30'
    case '주의':
      return 'bg-risk-caution/10 text-risk-caution border-risk-caution/30'
    case '높음':
      return 'bg-risk-high/10 text-risk-high border-risk-high/30'
    case '담당자 확인 필요':
      return 'bg-risk-officer/10 text-risk-officer border-risk-officer/30'
    default:
      return 'bg-gray-100 text-gray-500 border-gray-200'
  }
}
