// 전역 키보드 단축키. 개인정보와 무관한 UI 네비게이션만 담당.

export interface ShortcutHandlers {
  save?: () => void // Cmd/Ctrl + Enter
  saveAndContinue?: () => void // Cmd/Ctrl + Shift + Enter
  openSearch?: () => void // Cmd/Ctrl + K
  openQuickLog?: () => void // Cmd/Ctrl + N
  openReviewQueue?: () => void // Cmd/Ctrl + R
}

export function attachShortcuts(handlers: ShortcutHandlers): () => void {
  const onKey = (e: KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey
    if (!mod) return
    const key = e.key.toLowerCase()

    if (key === 'enter' && e.shiftKey) {
      if (handlers.saveAndContinue) {
        e.preventDefault()
        handlers.saveAndContinue()
      }
      return
    }
    if (key === 'enter') {
      if (handlers.save) {
        e.preventDefault()
        handlers.save()
      }
      return
    }
    if (key === 'k') {
      if (handlers.openSearch) {
        e.preventDefault()
        handlers.openSearch()
      }
      return
    }
    if (key === 'n') {
      if (handlers.openQuickLog) {
        e.preventDefault()
        handlers.openQuickLog()
      }
      return
    }
    if (key === 'r') {
      if (handlers.openReviewQueue) {
        e.preventDefault()
        handlers.openReviewQueue()
      }
      return
    }
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}
