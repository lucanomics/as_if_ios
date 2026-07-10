import { useEffect, useState } from 'react'
import {
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  Download,
  FileSearch,
  Home,
  ListChecks,
  LockKeyhole,
  MessageSquareText,
  Plus,
  Search,
  Settings,
  Shield,
  type LucideIcon,
} from 'lucide-react'
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

const NAV: { id: View; label: string; shortLabel: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: '오늘', shortLabel: '오늘', icon: Home },
  { id: 'review', label: '검토', shortLabel: '검토', icon: ClipboardCheck },
  { id: 'session', label: '세션', shortLabel: '세션', icon: CalendarClock },
  { id: 'privacy', label: '청소', shortLabel: '청소', icon: Shield },
  { id: 'phrases', label: '안전문구', shortLabel: '문구', icon: MessageSquareText },
  { id: 'manuals', label: '매뉴얼', shortLabel: '자료', icon: BookOpen },
  { id: 'checklists', label: '체크리스트', shortLabel: '체크', icon: ListChecks },
  { id: 'reconstruction', label: '사건 재구성', shortLabel: '재구성', icon: FileSearch },
  { id: 'export', label: '내보내기', shortLabel: '백업', icon: Download },
  { id: 'settings', label: '설정·안내', shortLabel: '설정', icon: Settings },
]

function NavButton({
  item,
  active,
  onClick,
  compact,
}: {
  item: (typeof NAV)[number]
  active: boolean
  onClick: () => void
  compact?: boolean
}) {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className={compact ? `mobile-nav-item ${active ? 'is-active' : ''}` : `rail-item ${active ? 'is-active' : ''}`}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={compact ? 17 : 19} strokeWidth={2.2} aria-hidden="true" />
      <span>{compact ? item.shortLabel : item.label}</span>
    </button>
  )
}

function Shell() {
  const store = useStore()
  const [view, setView] = useState<View>('dashboard')
  const [quickOpen, setQuickOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [editing, setEditing] = useState<LogEntry | null>(null)
  const [locked, setLocked] = useState(false)

  const lock = store.settings.lock

  useEffect(() => {
    if (store.ready && lock?.enabled) setLocked(true)
    // 최초 준비 시 1회만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.ready])

  useEffect(() => {
    if (!lock?.enabled || locked) return
    const minutes = lock.autoLockMinutes || 5
    let timer: number
    const reset = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setLocked(true), minutes * 60_000)
    }
    const events: (keyof WindowEventMap)[] = ['mousedown', 'keydown', 'touchstart', 'pointerdown']
    events.forEach((eventName) => window.addEventListener(eventName, reset, { passive: true }))
    reset()
    return () => {
      window.clearTimeout(timer)
      events.forEach((eventName) => window.removeEventListener(eventName, reset))
    }
  }, [lock?.enabled, lock?.autoLockMinutes, locked])

  const sessionPrefill = (): Partial<LogEntry> => {
    const defaults = store.session?.defaults
    if (!defaults) return {}
    return {
      visaStatus: defaults.visaStatus,
      nationality: defaults.nationality,
      caseType: defaults.caseType,
      queueTicketType: defaults.queueTicketType,
      counterReferral: defaults.counterReferral,
      handlingCounter: defaults.handlingCounter,
      visitStatus: defaults.visitStatus,
      guidanceScope: defaults.guidanceScope,
      safetyPhraseUsed: defaults.safetyPhraseUsed,
    }
  }

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

  const openQuickLog = () => {
    setEditing(null)
    setQuickOpen(true)
  }

  const openEdit = (log: LogEntry) => {
    setEditing(log)
    setSearchOpen(false)
    setQuickOpen(true)
  }

  if (!store.ready) {
    return (
      <div className="flex h-full items-center justify-center bg-slatebg text-sm font-medium text-muted">
        불러오는 중...
      </div>
    )
  }

  if (locked && lock?.enabled) {
    return <LockScreen lock={lock} onUnlock={() => setLocked(false)} />
  }

  return (
    <div className="min-h-full bg-slatebg text-ink">
      <Modal open={!store.settings.onboardingAcknowledged} title={`${APP_NAME} 시작하기`}>
        <div className="space-y-3">
          <p className="text-sm text-muted">{APP_SUBTITLE}</p>
          <div className="rounded-lg border border-risk-high/30 bg-risk-high/5 p-3 text-sm text-risk-high">
            {DEPLOY_NOTICE}
          </div>
          <div className="rounded-lg border border-line bg-white p-3 text-sm text-muted">{FIXED_NOTICE}</div>
          <button
            className="btn-primary w-full"
            onClick={() => store.updateSettings({ onboardingAcknowledged: true })}
          >
            이해했습니다. 시작하기
          </button>
        </div>
      </Modal>

      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="text-2xl font-extrabold tracking-normal text-ink">{APP_NAME}</span>
              <span className="text-sm font-medium text-muted">{APP_SUBTITLE}</span>
            </div>
            <p className="mt-1 text-xs font-medium text-accent-strong">
              브라우저 로컬 저장 · 공식 기록 아님 · 개인정보 입력 금지
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            {lock?.enabled && (
              <button className="icon-btn" type="button" onClick={() => setLocked(true)} title="앱 잠금">
                <LockKeyhole size={18} aria-hidden="true" />
                <span className="sr-only">앱 잠금</span>
              </button>
            )}
            <button className="btn-ghost flex-1 sm:flex-none" type="button" onClick={() => setSearchOpen(true)} title="검색 (Ctrl/Command+K)">
              <Search size={18} aria-hidden="true" />
              검색
            </button>
            <button className="btn-primary flex-1 sm:flex-none" type="button" onClick={openQuickLog} title="빠른 기록 (Ctrl/Command+N)">
              <Plus size={18} aria-hidden="true" />
              빠른 기록
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        <aside className="sticky top-[73px] hidden h-[calc(100vh-73px)] w-56 shrink-0 border-r border-line bg-white px-3 py-5 md:block">
          <nav className="space-y-1" aria-label="주요 화면">
            {NAV.map((item) => (
              <NavButton key={item.id} item={item} active={view === item.id} onClick={() => setView(item.id)} />
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <nav className="mobile-nav md:hidden" aria-label="주요 화면">
            <div className="flex min-w-max gap-2 px-4 py-3">
              {NAV.map((item) => (
                <NavButton
                  key={item.id}
                  item={item}
                  compact
                  active={view === item.id}
                  onClick={() => setView(item.id)}
                />
              ))}
            </div>
          </nav>

          <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
            {view === 'dashboard' && (
              <Dashboard
                onOpenQuickLog={openQuickLog}
                onOpenReview={() => setView('review')}
                onOpenSession={() => setView('session')}
                onOpenPrivacy={() => setView('privacy')}
              />
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

          <footer className="px-4 pb-24 pt-2 sm:px-6 lg:px-8">
            <p className="rounded-lg border border-line bg-white px-3 py-2 text-center text-xs text-muted">
              {FIXED_NOTICE}
            </p>
          </footer>
        </div>
      </div>

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
