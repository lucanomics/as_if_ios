import { useMemo } from 'react'
import type { LogEntry } from '../types'
import { useStore } from '../app/store'
import { needsReview } from '../lib/analytics'
import { LogCard } from './LogCard'
import { Banner } from './ui'

const SOFT_FLAGS = ['나중에 보완', '헷갈림', '담당자 확인 필요', '매뉴얼 업데이트 필요'] as const

export function ReviewQueue({ onEdit }: { onEdit: (l: LogEntry) => void }) {
  const { logs, updateLog } = useStore()
  const queue = useMemo(() => logs.filter(needsReview), [logs])

  const resolve = (log: LogEntry) => {
    updateLog({
      ...log,
      incomplete: false,
      reviewFlags: log.reviewFlags.filter((f) => !SOFT_FLAGS.includes(f as (typeof SOFT_FLAGS)[number])),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="section-title">Review Queue</h2>
        <p className="text-sm text-gray-500">
          보완/확인이 필요한 로그를 모았습니다. 빠르게 수정하거나 "보완 불필요"로 닫으세요.
        </p>
      </div>
      {queue.length === 0 ? (
        <Banner tone="info">보완이 필요한 로그가 없습니다.</Banner>
      ) : (
        <div className="space-y-3">
          {queue.map((log) => (
            <LogCard key={log.id} log={log} onEdit={onEdit}>
              <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                <button className="btn-primary" onClick={() => onEdit(log)}>
                  보완하기
                </button>
                <button className="btn-ghost" onClick={() => resolve(log)}>
                  보완 불필요로 닫기
                </button>
              </div>
            </LogCard>
          ))}
        </div>
      )}
    </div>
  )
}
