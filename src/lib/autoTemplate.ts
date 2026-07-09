import type { CaseType } from '../types'

// 민원유형 + 키워드 조합에 따라 메모 초안을 제안한다.
// 자동으로 저장하지 않고, 사용자가 "적용" 을 눌러야 메모에 들어간다.

export function suggestMemo(caseType: CaseType, keywords: string[]): string | null {
  const kw = keywords.join(' ')

  if (caseType === '하이코리아 예약' && /계정|분실|비밀번호|로그인/.test(kw)) {
    return '하이코리아 계정 문제로 방문예약 방법을 안내함. 예약과 체류기간·신고·허가 기한은 별도일 수 있음을 안내함.'
  }
  if (caseType === '하이코리아 예약') {
    return '하이코리아 방문예약 방법을 안내함. 예약과 신고·허가 기한은 별도일 수 있음을 안내함.'
  }
  if (caseType === '체류기간 연장') {
    return '체류기간 연장 관련 방문예약 및 필요 서류 확인을 안내함. 근무처 변경/자격외활동 등 별도 신고·허가 사항은 담당자 확인이 필요할 수 있음을 안내함.'
  }
  if (caseType === '근무처 변경/추가') {
    return '근무처 변경/추가 가능성이 있어 단순 예약 안내로 종결하지 않고 담당자 확인 또는 인계를 안내함.'
  }
  if (caseType === '자격외활동/취업허가') {
    return '자격외활동 또는 취업허가 관련 사항은 허가 전 활동 시 불이익이 있을 수 있음을 안내하고 담당자 확인을 권장함.'
  }
  return null
}
