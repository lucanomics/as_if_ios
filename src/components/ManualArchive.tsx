import { useState } from 'react'
import type { ManualEntry } from '../types'
import { useStore } from '../app/store'
import { newId } from '../lib/storage'
import { Banner, Field } from './ui'

const emptyManual = (): ManualEntry => ({
  id: newId('man'),
  topic: '',
  summary: '',
  legalBasis: '',
  source: '',
  checkedDate: new Date().toISOString().slice(0, 10),
  version: 'draft-1',
  notes: '',
  tags: [],
})

export function ManualArchive() {
  const { manuals, saveManual, deleteManual } = useStore()
  const [editing, setEditing] = useState<ManualEntry | null>(null)

  const commit = () => {
    if (!editing) return
    saveManual({ ...editing, tags: editing.tags.filter(Boolean) })
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">매뉴얼 아카이브</h2>
          <p className="text-sm text-gray-500">법령 전문을 대량 저장하지 말고, 요약과 출처 중심으로 관리합니다. 확인일과 버전을 반드시 기록하세요.</p>
        </div>
        <button className="btn-ghost" onClick={() => setEditing(emptyManual())}>
          항목 추가
        </button>
      </div>

      <Banner tone="warn">내부 지시사항이나 민감한 내용은 외부로 내보내지 마세요.</Banner>

      {editing && (
        <div className="card space-y-3">
          <Field label="주제(topic)">
            <input className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" value={editing.topic} onChange={(e) => setEditing({ ...editing, topic: e.target.value })} />
          </Field>
          <Field label="요약(summary)">
            <textarea rows={3} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" value={editing.summary} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="법령 근거(legalBasis)">
              <input className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" value={editing.legalBasis} onChange={(e) => setEditing({ ...editing, legalBasis: e.target.value })} />
            </Field>
            <Field label="출처(source)">
              <input className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" value={editing.source} onChange={(e) => setEditing({ ...editing, source: e.target.value })} />
            </Field>
            <Field label="확인일(checkedDate)">
              <input type="date" className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" value={editing.checkedDate} onChange={(e) => setEditing({ ...editing, checkedDate: e.target.value })} />
            </Field>
            <Field label="버전(version)">
              <input className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" value={editing.version} onChange={(e) => setEditing({ ...editing, version: e.target.value })} />
            </Field>
          </div>
          <Field label="태그(쉼표로 구분)">
            <input className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" value={editing.tags.join(', ')} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(',').map((t) => t.trim()) })} />
          </Field>
          <Field label="메모(notes)">
            <textarea rows={2} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
          </Field>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={commit} disabled={!editing.topic}>저장</button>
            <button className="btn-ghost" onClick={() => setEditing(null)}>취소</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {manuals.map((m) => (
          <div key={m.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{m.topic}</div>
                <p className="mt-1 text-sm text-gray-600">{m.summary}</p>
                <div className="mt-2 text-xs text-gray-400">
                  근거: {m.legalBasis || '—'} · 출처: {m.source || '—'} · 확인일 {m.checkedDate} · {m.version}
                </div>
                {m.tags.length > 0 && <div className="mt-1 text-xs text-gray-400">#{m.tags.join(' #')}</div>}
                {m.notes && <div className="mt-1 text-xs text-gray-400">메모: {m.notes}</div>}
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button className="text-xs text-ink underline" onClick={() => setEditing(m)}>편집</button>
                <button className="text-xs text-risk-high underline" onClick={() => deleteManual(m.id)}>삭제</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
