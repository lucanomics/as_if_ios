import type { Preset } from '../types'

export const PRESETS: Preset[] = [
  {
    id: 'preset-e2-extend',
    label: 'E-2 연장 예약 안내',
    patch: {
      visaStatus: 'E-2',
      nationality: { mode: 'not_recorded' },
      caseType: '체류기간 연장',
      queueTicketType: 'not_issued',
      guidanceScope: ['방문예약 방법 안내'],
      safetyPhraseUsed: ['예약과 신고기한 별도 안내'],
      riskLevel: '낮음',
    },
  },
  {
    id: 'preset-e2-hikorea',
    label: 'E-2 하이코리아 계정 분실 예약',
    patch: {
      visaStatus: 'E-2',
      nationality: { mode: 'not_recorded' },
      caseType: '하이코리아 예약',
      queueTicketType: 'reservation_confirmed',
      guidanceScope: ['하이코리아 계정/예약 문제 안내'],
      safetyPhraseUsed: ['예약과 신고기한 별도 안내'],
      riskLevel: '낮음',
    },
  },
  {
    id: 'preset-e2-workplace',
    label: 'E-2 근무처 변경 의심',
    patch: {
      visaStatus: 'E-2',
      nationality: { mode: 'not_recorded' },
      caseType: '근무처 변경/추가',
      queueTicketType: 'officer_handoff',
      guidanceScope: ['담당자에게 직접 인계'],
      safetyPhraseUsed: ['담당자 확인 안내'],
      riskLevel: '담당자 확인 필요',
      reviewFlags: ['담당자 확인 필요'],
    },
  },
  {
    id: 'preset-activity',
    label: '자격외활동/취업허가 문의',
    patch: {
      caseType: '자격외활동/취업허가',
      guidanceScope: ['법적 판단은 담당자 확인 안내'],
      safetyPhraseUsed: ['허가 전 활동 금지 안내'],
      riskLevel: '담당자 확인 필요',
      reviewFlags: ['담당자 확인 필요'],
    },
  },
  {
    id: 'preset-simple-queue',
    label: '단순 번호표/위치 안내',
    patch: {
      caseType: '기타',
      guidanceScope: ['단순 위치/번호표 안내'],
      queueTicketType: 'general_information',
      riskLevel: '낮음',
    },
  },
]
