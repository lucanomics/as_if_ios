import { useState } from 'react'
import type { LockSettings } from '../lib/storage'
import { verifyPin } from '../lib/appLock'
import { APP_NAME } from '../data/constants'

// 잠금 화면. 잠긴 동안 업무 데이터가 뒤에 보이지 않도록 불투명 전체 화면으로 덮는다.
export function LockScreen({ lock, onUnlock }: { lock: LockSettings; onUnlock: () => void }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (busy || pin.length === 0) return
    setBusy(true)
    const ok = await verifyPin(pin, lock)
    setBusy(false)
    if (ok) {
      setPin('')
      setError(false)
      onUnlock()
    } else {
      setError(true)
      setPin('')
    }
  }

  const press = (d: string) => {
    setError(false)
    setPin((p) => (p.length < 12 ? p + d : p))
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink px-6 text-white">
      <div className="mb-2 text-2xl font-bold">🛡️ {APP_NAME}</div>
      <p className="mb-6 text-sm text-white/70">PIN을 입력해 잠금을 해제하세요.</p>

      <div className="mb-4 flex gap-2" aria-hidden>
        {Array.from({ length: Math.max(4, pin.length) }).map((_, i) => (
          <span
            key={i}
            className={`h-3 w-3 rounded-full ${i < pin.length ? 'bg-white' : 'bg-white/25'}`}
          />
        ))}
      </div>

      <input
        aria-label="PIN"
        type="password"
        inputMode="numeric"
        autoFocus
        value={pin}
        onChange={(e) => {
          setError(false)
          setPin(e.target.value.replace(/\D/g, '').slice(0, 12))
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void submit()
        }}
        className="mb-4 w-48 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-center text-lg tracking-widest text-white placeholder-white/40"
        placeholder="••••"
      />

      {error && <p className="mb-3 text-sm text-red-300">PIN이 올바르지 않습니다.</p>}

      <div className="grid grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button
            key={d}
            onClick={() => press(d)}
            className="h-14 w-14 rounded-full bg-white/10 text-xl font-semibold hover:bg-white/20"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => setPin((p) => p.slice(0, -1))}
          className="h-14 w-14 rounded-full bg-white/5 text-sm hover:bg-white/15"
        >
          ⌫
        </button>
        <button
          onClick={() => press('0')}
          className="h-14 w-14 rounded-full bg-white/10 text-xl font-semibold hover:bg-white/20"
        >
          0
        </button>
        <button
          onClick={() => void submit()}
          disabled={busy || pin.length === 0}
          className="h-14 w-14 rounded-full bg-white text-ink disabled:opacity-40"
        >
          ✓
        </button>
      </div>

      <p className="mt-8 max-w-xs text-center text-xs text-white/40">
        PIN은 이 기기에만 저장되며 평문으로 보관되지 않습니다. PIN을 잊으면 브라우저 데이터를 초기화해야
        하며, 이 경우 기록도 함께 사라집니다.
      </p>
    </div>
  )
}
