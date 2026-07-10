import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export function Chip({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  title?: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`chip ${active ? 'chip-on' : 'chip-off'}`}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}

// 단일 선택 칩 그룹
export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  render,
}: {
  options: readonly T[]
  value: T | null
  onChange: (v: T) => void
  render?: (v: T) => string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o} active={value === o} onClick={() => onChange(o)}>
          {render ? render(o) : o}
        </Chip>
      ))}
    </div>
  )
}

// 다중 선택 칩 그룹
export function MultiChipGroup<T extends string>({
  options,
  values,
  onToggle,
}: {
  options: readonly T[]
  values: T[]
  onToggle: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o} active={values.includes(o)} onClick={() => onToggle(o)}>
          {o}
        </Chip>
      ))}
    </div>
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="label">{label}</span>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

export function Banner({
  tone,
  children,
}: {
  tone: 'info' | 'warn' | 'danger'
  children: ReactNode
}) {
  const cls =
    tone === 'danger'
      ? 'border-risk-high/30 bg-risk-high/5 text-risk-high'
      : tone === 'warn'
        ? 'border-risk-caution/30 bg-risk-caution/5 text-risk-caution'
        : 'border-line bg-slatebg text-muted'
  return <div className={`rounded-lg border px-3 py-2 text-sm font-medium leading-6 ${cls}`}>{children}</div>
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose?: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/35 p-3 sm:p-8">
      <div className={`card my-0 max-h-[calc(100vh-1.5rem)] w-full overflow-y-auto sm:my-auto ${wide ? 'max-w-4xl' : 'max-w-xl'}`}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">{title}</h2>
          {onClose && (
            <button onClick={onClose} className="icon-btn h-9 w-9" aria-label="닫기">
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

export function StatCard({ label, value, tone }: { label: string; value: ReactNode; tone?: 'danger' | 'warn' }) {
  const valueCls = tone === 'danger' ? 'text-risk-high' : tone === 'warn' ? 'text-risk-caution' : 'text-ink'
  return (
    <div className="card">
      <div className="label">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${valueCls}`}>{value}</div>
    </div>
  )
}
