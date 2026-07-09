import { useState } from 'react'
import { CHECKLISTS } from '../data/checklistTemplates'

export function ChecklistPanel() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const toggle = (id: string) => setChecked((c) => ({ ...c, [id]: !c[id] }))

  return (
    <div className="space-y-4">
      <div>
        <h2 className="section-title">체크리스트</h2>
        <p className="text-sm text-gray-500">
          위험 민원을 놓치지 않기 위한 확인 목록입니다. 체크 상태는 저장되지 않으며 참고용입니다.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {CHECKLISTS.map((cl) => (
          <div key={cl.id} className="card">
            <h3 className="font-semibold">{cl.title}</h3>
            {cl.appliesTo && <div className="mt-0.5 text-xs text-gray-400">적용: {cl.appliesTo}</div>}
            <ul className="mt-3 space-y-2">
              {cl.items.map((item, i) => {
                const id = `${cl.id}-${i}`
                return (
                  <li key={id}>
                    <label className="flex cursor-pointer items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={Boolean(checked[id])}
                        onChange={() => toggle(id)}
                      />
                      <span className={checked[id] ? 'text-gray-400 line-through' : 'text-gray-700'}>{item}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
