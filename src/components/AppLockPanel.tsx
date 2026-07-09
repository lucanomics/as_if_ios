import { useState } from 'react'
import { useStore } from '../app/store'
import { createLock, lockSupported, verifyPin } from '../lib/appLock'
import { Banner, Field } from './ui'

const AUTO_LOCK_OPTIONS = [1, 3, 5, 10, 15, 30]

export function AppLockPanel({ onLockNow }: { onLockNow: () => void }) {
  const { settings, updateSettings } = useStore()
  const lock = settings.lock
  const [pin, setPin] = useState('')
  const [pin2, setPin2] = useState('')
  const [currentPin, setCurrentPin] = useState('')
  const [msg, setMsg] = useState<{ tone: 'info' | 'danger'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  if (!lockSupported()) {
    return (
      <section className="card space-y-2">
        <h3 className="font-semibold">앱 잠금</h3>
        <Banner tone="warn">이 브라우저에서는 Web Crypto를 사용할 수 없어 앱 잠금을 사용할 수 없습니다.</Banner>
      </section>
    )
  }

  const enabled = Boolean(lock?.enabled)

  const setNewPin = async () => {
    setMsg(null)
    if (!/^\d{4,12}$/.test(pin)) {
      setMsg({ tone: 'danger', text: 'PIN은 숫자 4~12자리로 설정하세요.' })
      return
    }
    if (pin !== pin2) {
      setMsg({ tone: 'danger', text: '두 PIN이 일치하지 않습니다.' })
      return
    }
    setBusy(true)
    const newLock = await createLock(pin, lock?.autoLockMinutes ?? 5)
    setBusy(false)
    updateSettings({ lock: newLock })
    setPin('')
    setPin2('')
    setMsg({ tone: 'info', text: '앱 잠금이 설정되었습니다.' })
  }

  const removePin = async () => {
    setMsg(null)
    if (!lock) return
    setBusy(true)
    const ok = await verifyPin(currentPin, lock)
    setBusy(false)
    if (!ok) {
      setMsg({ tone: 'danger', text: '현재 PIN이 올바르지 않습니다.' })
      return
    }
    updateSettings({ lock: undefined })
    setCurrentPin('')
    setMsg({ tone: 'info', text: '앱 잠금이 해제되었습니다.' })
  }

  return (
    <section className="card space-y-3">
      <h3 className="font-semibold">앱 잠금 (PIN)</h3>
      <p className="text-sm text-gray-500">
        일정 시간 미사용 시 자동으로 잠깁니다. PIN은 평문으로 저장되지 않으며(PBKDF2 해시), 이 기기에만
        보관됩니다.
      </p>

      {msg && <Banner tone={msg.tone === 'danger' ? 'danger' : 'info'}>{msg.text}</Banner>}

      {!enabled ? (
        <div className="space-y-2">
          <Field label="새 PIN (숫자 4~12자리)">
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 12))}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              placeholder="••••"
            />
          </Field>
          <Field label="PIN 확인">
            <input
              type="password"
              inputMode="numeric"
              value={pin2}
              onChange={(e) => setPin2(e.target.value.replace(/\D/g, '').slice(0, 12))}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              placeholder="••••"
            />
          </Field>
          <button className="btn-primary" onClick={() => void setNewPin()} disabled={busy}>
            앱 잠금 설정
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <Banner tone="info">앱 잠금이 켜져 있습니다.</Banner>
          <Field label="자동 잠금 시간">
            <select
              value={lock?.autoLockMinutes ?? 5}
              onChange={(e) =>
                lock && updateSettings({ lock: { ...lock, autoLockMinutes: Number(e.target.value) } })
              }
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
            >
              {AUTO_LOCK_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}분 미사용 시 잠금
                </option>
              ))}
            </select>
          </Field>
          <button className="btn-ghost" onClick={onLockNow}>
            지금 잠그기
          </button>
          <div className="rounded-xl border border-gray-200 p-3">
            <Field label="앱 잠금 해제 (현재 PIN 입력)">
              <div className="flex gap-2">
                <input
                  type="password"
                  inputMode="numeric"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm"
                  placeholder="현재 PIN"
                />
                <button className="btn-ghost text-risk-high" onClick={() => void removePin()} disabled={busy}>
                  잠금 해제
                </button>
              </div>
            </Field>
          </div>
        </div>
      )}
    </section>
  )
}
