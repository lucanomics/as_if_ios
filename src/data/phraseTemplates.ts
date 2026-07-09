import type { Phrase } from '../types'

const now = '2026-01-01T00:00:00.000Z'

// 표준 안내문구 기본 세트. 사용자가 편집하면 version 이 올라가고,
// 로그에는 사용 당시 스냅샷이 저장된다.
export const DEFAULT_PHRASES: Phrase[] = [
  {
    id: 'phrase-1',
    category: '예약과 신고기한 별도 안내',
    title: '예약은 신고·허가 기한과 별도',
    text: '방문예약은 접수 편의를 위한 절차이고, 체류기간·신고·허가 기한과는 별도일 수 있습니다. 근무처 변경, 사업장 변경, 자격외활동, 취업허가 관련 사항은 지연 시 불이익이 생길 수 있으므로 담당 창구 또는 1345를 통해 즉시 확인하시기 바랍니다.',
    version: 1,
    createdAt: now,
    updatedAt: now,
    isActive: true,
  },
  {
    id: 'phrase-2',
    category: '예약과 신고기한 별도 안내',
    title: '근무처 변경 시 예약일 기다리지 말 것',
    text: '예약일과 신고·허가 기한은 다를 수 있습니다. 근무처나 사업장이 바뀐 경우에는 예약일을 기다리지 말고 담당자 확인을 받으셔야 합니다.',
    version: 1,
    createdAt: now,
    updatedAt: now,
    isActive: true,
  },
  {
    id: 'phrase-3',
    category: '담당자 확인 안내',
    title: '기한/범칙금 여부는 담당자 확인',
    text: '저는 방문예약 및 일반 안내만 도와드릴 수 있으며, 기한 도과 여부나 범칙금 여부는 담당자가 확인해야 합니다.',
    version: 1,
    createdAt: now,
    updatedAt: now,
    isActive: true,
  },
  {
    id: 'phrase-4',
    category: '허가 전 활동 금지 안내',
    title: '허가·신고 전 활동 금지',
    text: '허가 또는 신고가 필요한 활동은 처리 전 임의로 시작하면 불이익이 생길 수 있습니다. 담당자 확인 후 진행하시기 바랍니다.',
    version: 1,
    createdAt: now,
    updatedAt: now,
    isActive: true,
  },
]
