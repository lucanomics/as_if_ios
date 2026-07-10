import { useMemo, useState } from 'react'
import type { LogEntry } from '../types'
import { useStore } from '../app/store'
import {
  EXPORT_WARNING,
  downloadFile,
  parseImportedJSON,
  scanBeforeExport,
  toCSV,
  toJSON,
} from '../lib/exportUtils'
import { Banner } from './ui'
import { LogCard } from './LogCard'

export function ExportPanel({ onEdit }: { onEdit: (l: LogEntry) => void }) {
  const { logs, replaceLogs } = useStore()
  const [forced, setForced] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importMsg, setImportMsg] = useState<string | null>(null)

  const scan = useMemo(() => scanBeforeExport(logs), [logs])
  const blocked = !scan.clean && !forced

  const stamp = () => new Date().toISOString().slice(0, 16).replace(/[:T]/g, '')

  const exportJSON = () => downloadFile(`desksht-backup-${stamp()}.json`, toJSON(logs), 'application/json')
  const exportCSV = () => downloadFile(`desksht-backup-${stamp()}.csv`, toCSV(logs), 'text/csv;charset=utf-8')

  const onImport = async (file: File) => {
    setImportError(null)
    setImportMsg(null)
    try {
      const text = await file.text()
      const imported = parseImportedJSON(text)
      // 기존 + 가져온 것 병합 (id 중복 제거)
      const existing = new Set(logs.map((l) => l.id))
      const merged = [...logs, ...imported.filter((l) => !existing.has(l.id))]
      replaceLogs(merged)
      setImportMsg(`${imported.length}건을 확인했고, 새 로그 ${merged.length - logs.length}건을 가져왔습니다.`)
    } catch (e) {
      setImportError(e instanceof Error ? e.message : '가져오기 실패')
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="section-title">내보내기 / 백업</h2>
        <p className="text-sm text-gray-500">로컬 백업 전용입니다. 파일은 이 기기에만 생성되며 어디로도 전송되지 않습니다.</p>
      </div>

      <Banner tone="warn">{EXPORT_WARNING}</Banner>

      {scan.clean ? (
        <Banner tone="info">개인정보 의심 패턴이 발견되지 않았습니다. 그래도 파일을 다시 확인하세요.</Banner>
      ) : (
        <div className="space-y-3">
          <Banner tone="danger">
            내보내기 전 스캔에서 개인정보 의심 패턴이 있는 로그 {scan.offending.length}건이 발견되었습니다.
            수정 후 내보내기를 권장합니다.
          </Banner>
          <div className="space-y-2">
            {scan.offending.map(({ log, hits }) => (
              <LogCard key={log.id} log={log} onEdit={onEdit}>
                <div className="mt-2 text-xs text-risk-high">의심: {hits.map((h) => h.label).join(', ')}</div>
              </LogCard>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-risk-high">
            <input type="checkbox" checked={forced} onChange={(e) => setForced(e.target.checked)} />
            경고를 이해했으며, 그래도 내보내기를 진행합니다.
          </label>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" disabled={blocked} onClick={exportJSON}>
          JSON 내보내기
        </button>
        <button className="btn-ghost" disabled={blocked} onClick={exportCSV}>
          CSV 내보내기
        </button>
      </div>

      <div className="card space-y-2">
        <div className="label">JSON 가져오기 (로컬 파일 복원)</div>
        <input
          type="file"
          accept="application/json,.json"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void onImport(f)
          }}
          className="text-sm"
        />
        {importMsg && <Banner tone="info">{importMsg}</Banner>}
        {importError && <Banner tone="danger">{importError}</Banner>}
      </div>
    </div>
  )
}
