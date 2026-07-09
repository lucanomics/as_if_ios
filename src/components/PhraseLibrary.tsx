import { useState } from 'react'
import type { Phrase } from '../types'
import { useStore } from '../app/store'
import { SAFETY_PHRASE_TAGS } from '../data/constants'
import { newId, nowISO } from '../lib/storage'
import { Banner, Field } from './ui'

export function PhraseLibrary() {
  const { phrases, savePhrase } = useStore()
  const [editing, setEditing] = useState<Phrase | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (p: Phrase) => {
    try {
      await navigator.clipboard.writeText(p.text)
      setCopied(p.id)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      setCopied(null)
    }
  }

  const startNew = () =>
    setEditing({
      id: newId('phrase'),
      category: SAFETY_PHRASE_TAGS[0],
      title: '',
      text: '',
      version: 1,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      isActive: true,
    })

  const commit = () => {
    if (!editing) return
    const existing = phrases.find((p) => p.id === editing.id)
    const next: Phrase = {
      ...editing,
      version: existing ? existing.version + 1 : 1,
      updatedAt: nowISO(),
    }
    savePhrase(next)
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">안전문구 라이브러리</h2>
          <p className="text-sm text-gray-500">표준 안내문구를 복사하거나 편집합니다. 편집 시 버전이 올라가며, 과거 로그에는 사용 당시 문구가 보존됩니다.</p>
        </div>
        <button className="btn-ghost" onClick={startNew}>
          문구 추가
        </button>
      </div>

      {editing && (
        <div className="card space-y-3">
          <Field label="분류(카테고리)">
            <select
              value={editing.category}
              onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
            >
              {SAFETY_PHRASE_TAGS.filter((t) => t !== '미사용').map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="제목">
            <input
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="문구">
            <textarea
              value={editing.text}
              onChange={(e) => setEditing({ ...editing, text: e.target.value })}
              rows={4}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
            />
          </Field>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={commit} disabled={!editing.title || !editing.text}>
              저장
            </button>
            <button className="btn-ghost" onClick={() => setEditing(null)}>
              취소
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {phrases
          .filter((p) => p.isActive)
          .map((p) => (
            <div key={p.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-gray-400">
                    {p.category} · v{p.version}
                  </div>
                  <div className="font-semibold">{p.title}</div>
                  <p className="mt-1 text-sm text-gray-600">{p.text}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button className="text-xs text-ink underline" onClick={() => copy(p)}>
                    {copied === p.id ? '복사됨' : '복사'}
                  </button>
                  <button className="text-xs text-ink underline" onClick={() => setEditing(p)}>
                    편집
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      <Banner tone="warn">
        내부 지시사항이나 민감한 내용은 외부로 내보내지 마세요. 이 문구는 안내 품질관리용입니다.
      </Banner>
    </div>
  )
}
