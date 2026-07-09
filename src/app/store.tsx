import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  LogEntry,
  Phrase,
  ManualEntry,
  WorkSession,
  AuditHistory,
} from '../types'
import * as storage from '../lib/storage'
import type { AppSettings } from '../lib/storage'
import { SAMPLE_MANUALS, makeSampleLogs } from '../data/sampleData'
import { diffChangedFields, makeAuditRecord } from '../lib/audit'

interface StoreValue {
  ready: boolean
  logs: LogEntry[]
  phrases: Phrase[]
  manuals: ManualEntry[]
  session: WorkSession | null
  settings: AppSettings
  audits: AuditHistory[]
  // logs
  addLog: (log: LogEntry) => void
  updateLog: (log: LogEntry) => void
  deleteLog: (id: string) => void
  deleteLogs: (ids: string[]) => void
  replaceLogs: (logs: LogEntry[]) => void
  // phrases
  savePhrase: (p: Phrase) => void
  // manuals
  saveManual: (m: ManualEntry) => void
  deleteManual: (id: string) => void
  // session
  setSession: (s: WorkSession | null) => void
  // settings
  updateSettings: (patch: Partial<AppSettings>) => void
  pushRecentCountry: (code: string) => void
  pushRecentPreset: (id: string) => void
  // bulk
  loadSampleData: () => void
  wipeAll: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [phrases, setPhrases] = useState<Phrase[]>([])
  const [manuals, setManuals] = useState<ManualEntry[]>([])
  const [session, setSessionState] = useState<WorkSession | null>(null)
  const [settings, setSettings] = useState<AppSettings>({
    onboardingAcknowledged: false,
    retentionDays: 90,
    recentCountryCodes: [],
    recentPresetIds: [],
  })
  const [audits, setAudits] = useState<AuditHistory[]>([])

  // 초기 로드
  useEffect(() => {
    let alive = true
    ;(async () => {
      const [l, p, mRaw, s, st, a] = await Promise.all([
        storage.loadLogs(),
        storage.loadPhrases(),
        storage.loadManuals(),
        storage.loadSession(),
        storage.loadSettings(),
        storage.loadAudits(),
      ])
      if (!alive) return
      setLogs(l)
      setPhrases(p)
      // 매뉴얼은 최초 1회 샘플 시드
      if (mRaw && mRaw.length) {
        setManuals(mRaw)
      } else {
        setManuals(SAMPLE_MANUALS)
        void storage.saveManuals(SAMPLE_MANUALS)
      }
      // 근무 세션은 당일만 유효
      const today = new Date().toISOString().slice(0, 10)
      setSessionState(s && s.date === today ? s : null)
      setSettings(st)
      setAudits(a)
      setReady(true)
    })()
    return () => {
      alive = false
    }
  }, [])

  // ---- persist helpers ----
  const persistLogs = (next: LogEntry[]) => {
    setLogs(next)
    void storage.saveLogs(next)
  }
  const persistAudits = (next: AuditHistory[]) => {
    setAudits(next)
    void storage.saveAudits(next)
  }

  const value: StoreValue = {
    ready,
    logs,
    phrases,
    manuals,
    session,
    settings,
    audits,
    addLog: (log) => persistLogs([log, ...logs]),
    updateLog: (log) => {
      const prev = logs.find((l) => l.id === log.id)
      const stamped = { ...log, updatedAt: storage.nowISO() }
      persistLogs(logs.map((l) => (l.id === log.id ? stamped : l)))
      if (prev) {
        const changed = diffChangedFields(prev, stamped)
        if (changed.length) persistAudits([makeAuditRecord(log.id, changed), ...audits])
      }
    },
    deleteLog: (id) => persistLogs(logs.filter((l) => l.id !== id)),
    deleteLogs: (ids) => {
      const set = new Set(ids)
      persistLogs(logs.filter((l) => !set.has(l.id)))
    },
    replaceLogs: (next) => persistLogs(next),
    savePhrase: (p) => {
      const exists = phrases.some((x) => x.id === p.id)
      const next = exists ? phrases.map((x) => (x.id === p.id ? p : x)) : [...phrases, p]
      setPhrases(next)
      void storage.savePhrases(next)
    },
    saveManual: (m) => {
      const exists = manuals.some((x) => x.id === m.id)
      const next = exists ? manuals.map((x) => (x.id === m.id ? m : x)) : [...manuals, m]
      setManuals(next)
      void storage.saveManuals(next)
    },
    deleteManual: (id) => {
      const next = manuals.filter((m) => m.id !== id)
      setManuals(next)
      void storage.saveManuals(next)
    },
    setSession: (s) => {
      setSessionState(s)
      void storage.saveSession(s)
    },
    updateSettings: (patch) => {
      const next = { ...settings, ...patch }
      setSettings(next)
      void storage.saveSettings(next)
    },
    pushRecentCountry: (code) => {
      const next = {
        ...settings,
        recentCountryCodes: [code, ...settings.recentCountryCodes.filter((c) => c !== code)].slice(0, 8),
      }
      setSettings(next)
      void storage.saveSettings(next)
    },
    pushRecentPreset: (id) => {
      const next = {
        ...settings,
        recentPresetIds: [id, ...settings.recentPresetIds.filter((x) => x !== id)].slice(0, 5),
      }
      setSettings(next)
      void storage.saveSettings(next)
    },
    loadSampleData: () => {
      const samples = makeSampleLogs()
      persistLogs([...samples, ...logs])
    },
    wipeAll: () => {
      const freshSettings: AppSettings = {
        onboardingAcknowledged: settings.onboardingAcknowledged,
        retentionDays: 90,
        recentCountryCodes: [],
        recentPresetIds: [],
        lock: settings.lock, // 잠금 설정(PIN 해시)은 초기화하지 않는다
      }
      // 전체 삭제가 끝난 뒤에만 재시드해 삭제/쓰기 경쟁을 막는다.
      void (async () => {
        await storage.wipeAllData()
        await storage.saveManuals(SAMPLE_MANUALS)
        await storage.saveSettings(freshSettings)
      })()
      setLogs([])
      setAudits([])
      setSessionState(null)
      setPhrases([])
      setManuals(SAMPLE_MANUALS)
      setSettings(freshSettings)
    },
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

// 파생 통계 유틸
export function useToday() {
  return useMemo(() => new Date().toISOString().slice(0, 10), [])
}
