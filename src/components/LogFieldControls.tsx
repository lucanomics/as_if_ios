import { useState } from 'react'
import type { CounterReferral, Nationality } from '../types'
import { COUNTER_SUGGESTIONS } from '../data/constants'
import { Chip, ChipGroup } from './ui'

function normalizeInput(value: string, maxLength = 48): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

export function DirectValueInput({
  placeholder,
  buttonLabel = '직접 입력',
  maxLength = 48,
  transform,
  onSubmit,
}: {
  placeholder: string
  buttonLabel?: string
  maxLength?: number
  transform?: (value: string) => string
  onSubmit: (value: string) => void
}) {
  const [value, setValue] = useState('')
  const commit = () => {
    const normalized = normalizeInput(value, maxLength)
    if (!normalized) return
    onSubmit(transform ? transform(normalized) : normalized)
    setValue('')
  }

  return (
    <div className="direct-input-row">
      <input
        value={value}
        maxLength={maxLength}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
          }
        }}
        placeholder={placeholder}
        className="input direct-input"
      />
      <button type="button" className="btn-ghost direct-input-button" onClick={commit}>
        {buttonLabel}
      </button>
    </div>
  )
}

export function NationalityDirectInput({
  onSubmit,
}: {
  onSubmit: (nationality: Nationality) => void
}) {
  return (
    <DirectValueInput
      placeholder="국적 직접 입력 예: 네팔, 카자흐스탄"
      buttonLabel="국적 입력"
      maxLength={32}
      onSubmit={(countryNameKo) => onSubmit({ mode: 'specified', countryNameKo })}
    />
  )
}

export function counterReferralLabel(value?: CounterReferral): string {
  if (!value || value.mode === 'not_referred') return '창구 안내 없음'
  if (value.mode === 'unknown') return '창구 안내 기억 안 남'
  return value.counterLabel ?? (value.counterNumber ? `${value.counterNumber}번 창구` : '창구 안내')
}

export function CounterReferralControl({
  value,
  onChange,
}: {
  value?: CounterReferral
  onChange: (value: CounterReferral) => void
}) {
  const current = value ?? { mode: 'not_referred' as const }
  const setCounter = (raw: string) => {
    const normalized = normalizeInput(raw, 24)
    if (!normalized) return
    const numeric = /^\d+$/.test(normalized)
    onChange({
      mode: 'referred',
      counterNumber: numeric ? normalized : undefined,
      counterLabel: numeric ? `${normalized}번 창구` : normalized,
    })
  }

  return (
    <div className="space-y-2">
      <ChipGroup
        options={['not_referred', 'referred', 'unknown'] as const}
        value={current.mode}
        onChange={(mode) =>
          onChange(
            mode === 'referred'
              ? { mode, counterNumber: current.counterNumber, counterLabel: current.counterLabel }
              : { mode },
          )
        }
        render={(mode) =>
          mode === 'not_referred' ? '창구 안 보냄' : mode === 'referred' ? '창구로 안내' : '기억 안 남'
        }
      />
      {current.mode === 'referred' && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {COUNTER_SUGGESTIONS.map((counter) => (
              <Chip
                key={counter}
                active={current.counterNumber === counter || current.counterLabel === counter || current.counterLabel === `${counter}번 창구`}
                onClick={() => setCounter(counter)}
              >
                {counter}
              </Chip>
            ))}
          </div>
          <DirectValueInput
            placeholder="창구 직접 입력 예: 12, 국적, 사증"
            buttonLabel="창구 입력"
            maxLength={24}
            onSubmit={setCounter}
          />
          <p className="text-xs font-semibold text-muted">현재: {counterReferralLabel(current)}</p>
        </div>
      )}
    </div>
  )
}
