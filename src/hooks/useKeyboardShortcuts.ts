import { useEffect } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  callback: () => void
  description: string
}

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return
      }

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : true
        const metaMatches = shortcut.metaKey ? event.metaKey : true
        const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey

        if (keyMatches && ctrlMatches && metaMatches && shiftMatches) {
          event.preventDefault()
          shortcut.callback()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

/**
 * Get formatted shortcut display text
 */
export function getShortcutText(shortcut: KeyboardShortcut): string {
  const parts: string[] = []

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

  if (shortcut.ctrlKey || shortcut.metaKey) {
    parts.push(isMac ? '⌘' : 'Ctrl')
  }
  if (shortcut.shiftKey) {
    parts.push(isMac ? '⇧' : 'Shift')
  }

  // Format key name
  let keyDisplay = shortcut.key
  if (shortcut.key === ' ') keyDisplay = 'Space'
  else if (shortcut.key === 'ArrowLeft') keyDisplay = '←'
  else if (shortcut.key === 'ArrowRight') keyDisplay = '→'
  else if (shortcut.key === 'ArrowUp') keyDisplay = '↑'
  else if (shortcut.key === 'ArrowDown') keyDisplay = '↓'
  else keyDisplay = shortcut.key.toUpperCase()

  parts.push(keyDisplay)

  return parts.join('+')
}
