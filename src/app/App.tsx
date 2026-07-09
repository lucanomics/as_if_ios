import { useEffect, useState } from 'react'
import type { LogEntry } from '../types'
import { StoreProvider, useStore } from './store'
import { APP_NAME, APP_SUBTITLE, DEPLOY_NOTICE, FIXED_NOTICE } from '../data/constants'
import { attachShortcuts } from '../lib/keyboardShortcuts'
import { Modal } from '../components/ui'
import { QuickLogForm } from '../components/QuickLogForm'
import { Dashboard } from '../components/Dashboard'
import { ReviewQueue } from '../components/ReviewQueue'
import { WorkSessionPanel } from '../components/WorkSessionPanel'
import { PrivacyCleanup } from '../components/PrivacyCleanup'
import { PhraseLibrary } from '../components/PhraseLibrary'
import { ManualArchive } from '../components/ManualArchive'
import { ChecklistPanel } from '../components/ChecklistPanel'
import { SearchPanel } from '../components/SearchPanel'
import { ReconstructionMode } from '../components/ReconstructionMode'
import { ExportPanel } from '../components/ExportPanel'
import { DeployNotice } from '../components/DeployNotice'
import { LockScreen } from '../components/LockScreen'

type View =
  | 'dashboard'
  | 'review'
  | 'session'
  | 'privacy'
  | 'phrases'
  | 'manuals'
  | 'checklists'
  | 'reconstruction'
  | 'export'
  | 'settings'

const NAV: { id: View; label: string }[] = [
  { id: 'dashboard', label: '대시보드' },
  { id: 'review', label: 'Review Queue' },
  { id: 'session', label: '근무 세션' },
  { id: 'privacy', label: '개인정보 청소' },
  { id: 'phrases', label: '안전문구' },
  { id: 'manuals', label: '매뉴얼' },
  { id: 'checklists', label: '체크리스트' },
  { id: 'reconstruction', label: '사건 재구성' },
  { id: 'export', label: '내보내기' },
  { id: 'settings', label: '설정·안내' },
]

function Shell() {
  const store = useStore()
  const [view, setView] = useState<View>('dashboard')
  const [quickOpen, setQuickOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [editing, setEditing] = useState<LogEntry | null>(null)
  const [locked, setLocked] = useState(false)

  const lock = store.settings.lock

  // 잠금이 켜져 있으면 로드 직후 잠긴 상태로 시작
  useEffect(() => {
    if (store.ready && lock?.enabled) setLocked(true)
    // 최초 준비 시 1회만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.ready])

  // 자동 잠금: 미사용 타이머. 활동이 있으면 리셋한다.
  useEffect(() => {
    if (!lock?.enabled || locked) return
    const minutes = lock.autoLockMinutes || 5
    let timer: number
    const reset = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setLocked(true), minutes * 60_000)
    }
    const events: (keyof WindowEventMap)[] = ['mousedown', 'keydown', 'touchstart', 'pointerdown']
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    reset()
    return () => {
      window.clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [lock?.enabled, lock?.autoLockMinutes, locked])

  // 세션 기본값으로부터 prefill 구성
  const sessionPrefill = (): Partial<LogEntry> => {
    const d = store.session?.defaults
    if (!d) return {}
    return {
      visaStatus: d.visaStatus,
      nationality: d.nationality,
      caseType: d.caseType,
      queueTicketType: d.queueTicketType,
      guidanceScope: d.guidanceScope,
      safetyPhraseUsed: d.safetyPhraseUsed,
    }
  }

  // 전역 단축키 (네비게이션)
  useEffect(() => {
    return attachShortcuts({
      openSearch: () => setSearchOpen(true),
      openQuickLog: () => {
        setEditing(null)
        setQuickOpen(true)
      },
      openReviewQueue: () => setView('review'),
    })
  }, [])

  const openEdit = (l: LogEntry) => {
    setEditing(l)
    setSearchOpen(false)
    setQuickOpen(true)
  }

  if (!store.ready) {
    return <div className="flex h-full items-center justify-center text-gray-400">불러오는 중…</div>
  }

  // 잠긴 상태면 다른 화면을 렌더링하지 않아 업무 데이터가 노출되지 않는다.
  if (locked && lock?.enabled) {
    return <LockScreen lock={lock} onUnlock={() => setLocked(false)} />
  }

  return (
    <div className="min-h-full">
      {/* 첫 실행 온보딩 */}
      <Modal open={!store.settings.onboardingAcknowledged} title={`${APP_NAME} 시작하기`}>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">{APP_SUBTITLE}</p>
          <div className="rounded-xl border border-risk-high/30 bg-risk-high/5 p-3 text-sm text-risk-high">
            {DEPLOY_NOTICE}
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">{FIXED_NOTICE}</div>
          <button
            className="btn-primary w-full"
            onClick={() => store.updateSettings({ onboardingAcknowledged: true })}
          >
            이해했습니다. 시작하기
          </button>
        </div>
      </Modal>

      {/* 헤더 */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-ink">{APP_NAME}</span>
              <span className="hidden text-xs text-gray-400 sm:inline">{APP_SUBTITLE}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost" onClick={() => setSearchOpen(true)} title="검색 (⌘/Ctrl+K)">
              검색
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                setEditing(null)
                setQuickOpen(true)
              }}
              title="빠른 기록 (⌘/Ctrl+N)"
            >
              + 빠른 기록
            </button>
          </div>
        </div>
        {/* 네비게이션 */}
        <nav className="mx-auto max-w-6xl overflow-x-auto px-2 pb-2">
          <div className="flex gap-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setView(n.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
                  view === n.id ? 'bg-ink text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* 본문 */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {view === 'dashboard' && (
          <Dashboard onOpenReview={() => setView('review')} onOpenSession={() => setView('session')} />
        )}
        {view === 'review' && <ReviewQueue onEdit={openEdit} />}
        {view === 'session' && <WorkSessionPanel />}
        {view === 'privacy' && <PrivacyCleanup onEdit={openEdit} />}
        {view === 'phrases' && <PhraseLibrary />}
        {view === 'manuals' && <ManualArchive />}
        {view === 'checklists' && <ChecklistPanel />}
        {view === 'reconstruction' && <ReconstructionMode onEdit={openEdit} />}
        {view === 'export' && <ExportPanel onEdit={openEdit} />}
        {view === 'settings' && <DeployNotice onLockNow={() => setLocked(true)} />}
      </main>

      {/* 고정 주의문 */}
      <footer className="mx-auto max-w-6xl px-4 pb-24 pt-4">
        <p className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-center text-xs text-gray-500">
          {FIXED_NOTICE}
        </p>
      </footer>

      {/* 빠른 기록 / 편집 모달 */}
      <Modal
        open={quickOpen}
        title={editing ? '로그 수정' : '빠른 기록'}
        wide
        onClose={() => {
          setQuickOpen(false)
          setEditing(null)
        }}
      >
        <QuickLogForm
          key={editing?.id ?? 'new'}
          initial={editing ?? undefined}
          prefill={editing ? undefined : sessionPrefill()}
          onClose={() => {
            setQuickOpen(false)
            setEditing(null)
          }}
        />
      </Modal>

      {/* 검색 모달 */}
      <Modal open={searchOpen} title="검색" wide onClose={() => setSearchOpen(false)}>
        <SearchPanel onEdit={openEdit} />
      </Modal>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
