// Desksht data models.
// 원칙: 민원인을 식별할 수 있는 어떤 값도 이 모델에 저장하지 않는다.
// 모든 값은 비식별 분류값 또는 자유 메모(개인정보 스캔 대상)이다.

// 출입국 현장에서는 예외/세부 체류자격이 많으므로 추천값 외 직접 입력을 허용한다.
export type VisaStatus = string

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

export type CaseType = string

export type GuidanceScope = string

// 번호표 부여 유형 — 실제 순번/호출번호는 저장하지 않는다. 유형만 저장.
export type QueueTicketType = string

// 창구 안내 기록 — 실제 대기순번이 아니라 안내한 창구 번호/라벨만 저장한다.
export type CounterReferralMode =
  | 'not_referred' // 창구로 보내지 않음
  | 'referred' // 창구로 안내함
  | 'unknown' // 기억 안 남

export interface CounterReferral {
  mode: CounterReferralMode
  counterNumber?: string
  counterLabel?: string
}

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
  counterReferral: CounterReferral
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
    counterReferral?: CounterReferral
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
      | 'counterReferral'
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
