import { useState } from 'react'
import type { Nationality } from '../types'
import { COUNTRIES, SPECIAL_NATIONALITY, countryNameByCode } from '../data/countries'
import { useStore } from '../app/store'
import { Chip } from './ui'

export function nationalityLabel(n: Nationality): string {
  switch (n.mode) {
    case 'not_recorded':
      return '미기재'
    case 'unknown':
      return '국적 미확인'
    case 'multiple_possible':
      return '복수국적 가능성'
    case 'stateless_or_refugee_related':
      return '무국적/난민 관련'
    case 'other':
      return '기타'
    case 'specified':
      return n.countryNameKo ?? countryNameByCode(n.countryCode) ?? '지정 국가'
  }
}

const SPECIAL_CHIPS: { mode: Nationality['mode']; label: string }[] = [
  { mode: 'not_recorded', label: SPECIAL_NATIONALITY.not_recorded.nameKo },
  { mode: 'unknown', label: SPECIAL_NATIONALITY.unknown.nameKo },
  { mode: 'multiple_possible', label: SPECIAL_NATIONALITY.multiple_possible.nameKo },
  { mode: 'stateless_or_refugee_related', label: SPECIAL_NATIONALITY.stateless_or_refugee_related.nameKo },
  { mode: 'other', label: SPECIAL_NATIONALITY.other.nameKo },
]

export function NationalityPicker({
  value,
  onChange,
}: {
  value: Nationality
  onChange: (n: Nationality) => void
}) {
  const { settings, pushRecentCountry } = useStore()
  const [query, setQuery] = useState('')

  const selectCountry = (code: string, nameKo: string) => {
    onChange({ mode: 'specified', countryCode: code, countryNameKo: nameKo })
    pushRecentCountry(code)
    setQuery('')
  }

  const recent = settings.recentCountryCodes
    .map((c) => COUNTRIES.find((x) => x.code === c))
    .filter((x): x is (typeof COUNTRIES)[number] => Boolean(x))

  const filtered = query
    ? COUNTRIES.filter((c) => c.nameKo.includes(query) || c.code.toLowerCase().includes(query.toLowerCase()))
    : COUNTRIES

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400">
        국적은 민원인 식별 목적이 아니라 업무 패턴 분석용 비식별 분류값입니다.
      </p>
      <div className="flex flex-wrap gap-2">
        {SPECIAL_CHIPS.map((s) => (
          <Chip key={s.mode} active={value.mode === s.mode} onClick={() => onChange({ mode: s.mode })}>
            {s.label}
          </Chip>
        ))}
      </div>

      {recent.length > 0 && (
        <div>
          <div className="label mb-1">최근 사용</div>
          <div className="flex flex-wrap gap-2">
            {recent.map((c) => (
              <Chip
                key={c.code}
                active={value.mode === 'specified' && value.countryCode === c.code}
                onClick={() => selectCountry(c.code, c.nameKo)}
              >
                {c.nameKo}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="국가 검색 (예: 베트남)"
        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
      />
      <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
        {filtered.map((c) => (
          <Chip
            key={c.code}
            active={value.mode === 'specified' && value.countryCode === c.code}
            onClick={() => selectCountry(c.code, c.nameKo)}
          >
            {c.nameKo}
          </Chip>
        ))}
      </div>

      <p className="text-xs text-risk-caution">
        소수 국적 또는 특이 사건이 포함된 경우, 국적 + 체류자격 + 날짜 + 기관명 조합으로 개인 식별
        위험이 생길 수 있습니다. 메모에 구체 정보를 적지 마세요.
      </p>
    </div>
  )
}
