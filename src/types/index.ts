// DeskShield data models.
// 원칙: 민원인을 식별할 수 있는 어떤 값도 이 모델에 저장하지 않는다.
// 모든 값은 비식별 분류값 또는 자유 메모(개인정보 스캔 대상)이다.

export type VisaStatus =
  | 'E-2'
  | 'E-7'
  | 'D-2'
  | 'D-4'
  | 'F-4'
  | 'F-6'
  | 'H-2'
  | '기타'

// 국적: 민원인 식별 목적이 아니라 업무 패턴 분석용 비식별 분류값
export type NationalityMode =
  | 'not_recorded' // 미기재
  | 'unknown' // 국적 미확인
  | 'specified' // 특정 국가 지정 (countryCode 사용)
  | 'multiple_possible' // 복수국적 가능성
  | 'stateless_or_refugee_related' // 무국적/난민 관련
  | 'other' // 기타

export interface Nationality {
  mode: NationalityMode
  countryCode?: string // ISO 3166-1 alpha-2 (specified 일 때만)
  countryNameKo?: string
}

export type CaseType =
  | '체류기간 연장'
  | '외국인등록'
  | '근무처 변경/추가'
  | '자격외활동/취업허가'
  | '체류지 변경'
  | '하이코리아 예약'
  | '사범/범칙금 가능성'
  | '기타'

export type GuidanceScope =
  | '단순 위치/번호표 안내'
  | '방문예약 방법 안내'
  | '하이코리아 계정/예약 문제 안내'
  | '서류 일반 안내'
  | '체류기간 만료 관련 일반 안내'
  | '신고·허가 기한 관련 일반 주의 안내'
  | '법적 판단은 담당자 확인 안내'
  | '담당자에게 직접 인계'
  | '1345 안내'
  | '접수 불가 또는 재방문 안내'
  | '민원인이 주장한 내용만 청취'
  | '기타'

// 번호표 부여 유형 — 실제 순번/호출번호는 저장하지 않는다. 유형만 저장.
export type QueueTicketType =
  | 'not_issued' // 미부여
  | 'unknown' // 기억 안 남
  | 'non_reservation' // 비예약
  | 'reservation_confirmed' // 예약 확인 후 부여
  | 'visa' // 사증
  | 'counter_8' // 8번
  | 'counter_7' // 7번
  | 'nationality' // 국적
  | 'general_information' // 일반 안내
  | 'officer_handoff' // 담당자 인계
  | 'other' // 기타

export type SafetyPhraseTag =
  | '예약과 신고기한 별도 안내'
  | '허가 전 활동 금지 안내'
  | '담당자 확인 안내'
  | '1345 안내'
  | '미사용'

export type RiskLevel = '낮음' | '주의' | '높음' | '담당자 확인 필요'

export type ConfidenceLevel =
  | '확실함'
  | '일반 안내 수준'
  | '헷갈림'
  | '담당자 확인 필요'
  | '내가 판단하면 안 되는 영역'

export type ReviewFlag =
  | '나중에 보완'
  | '헷갈림'
  | '담당자 확인 필요'
  | '매뉴얼 업데이트 필요'
  | '사건성 있음'
  | '수동 보존'

export type HandedOff = 'true' | 'false' | 'unknown'

export interface UsedPhraseSnapshot {
  phraseId: string
  version: number
  title: string
  text: string
}

export interface LogEntry {
  id: string
  createdAt: string // ISO
  updatedAt: string // ISO
  visaStatus: VisaStatus
  nationality: Nationality
  caseType: CaseType
  guidanceScope: GuidanceScope[]
  queueTicketType: QueueTicketType
  nonIdentifyingKeywords: string[]
  safetyPhraseUsed: SafetyPhraseTag[]
  usedPhraseIds: string[]
  usedPhraseSnapshots: UsedPhraseSnapshot[]
  handedOffToOfficer: HandedOff
  riskLevel: RiskLevel | null
  confidenceLevel: ConfidenceLevel | null
  reviewFlags: ReviewFlag[]
  memo: string
  privacyWarningAcknowledged: boolean
  detectedRiskKeywords: string[]
  detectedPrivacyPatterns: string[]
  detectedRiskCombinations: string[]
  retentionUntil?: string // ISO
  isPinnedForRetention: boolean
  incomplete: boolean // "나중에 보완"으로 저장된 미완성 로그
}

export interface Phrase {
  id: string
  category: string
  title: string
  text: string
  version: number
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export interface ManualEntry {
  id: string
  topic: string
  summary: string
  legalBasis: string
  source: string
  checkedDate: string
  version: string
  notes: string
  tags: string[]
}

export interface WorkSession {
  date: string // YYYY-MM-DD
  defaults: {
    visaStatus?: VisaStatus
    nationality?: Nationality
    caseType?: CaseType
    queueTicketType?: QueueTicketType
    guidanceScope?: GuidanceScope[]
    safetyPhraseUsed?: SafetyPhraseTag[]
  }
}

export interface AuditHistory {
  id: string
  logId: string
  changedAt: string
  changedFields: string[]
  reason?: string
}

export interface Preset {
  id: string
  label: string
  patch: Partial<
    Pick<
      LogEntry,
      | 'visaStatus'
      | 'nationality'
      | 'caseType'
      | 'queueTicketType'
      | 'guidanceScope'
      | 'safetyPhraseUsed'
      | 'riskLevel'
      | 'reviewFlags'
    >
  >
}

export interface ChecklistTemplate {
  id: string
  title: string
  appliesTo?: CaseType
  items: string[]
}

export type RetentionDays = 30 | 60 | 90 | 180
