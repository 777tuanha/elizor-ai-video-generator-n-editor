import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { Keyboard } from 'lucide-react'

interface ShortcutItem {
  keys: string
  description: string
  category: string
}

const shortcuts: ShortcutItem[] = [
  { keys: 'Space', description: 'Play/Pause video', category: 'Playback' },
  { keys: '←', description: 'Previous shot', category: 'Navigation' },
  { keys: '→', description: 'Next shot', category: 'Navigation' },
  { keys: 'Delete', description: 'Delete selected shot', category: 'Editing' },
  { keys: 'Cmd/Ctrl+S', description: 'Save project', category: 'Project' },
  { keys: '?', description: 'Show keyboard shortcuts', category: 'Help' },
]

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false)

  useKeyboardShortcuts([
    {
      key: '?',
      callback: () => setOpen(true),
      description: 'Show keyboard shortcuts',
    },
  ])

  const categories = Array.from(new Set(shortcuts.map(s => s.category)))

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors z-50"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="h-5 w-5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Boost your productivity with these keyboard shortcuts
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {categories.map(category => (
              <div key={category}>
                <h3 className="text-sm font-semibold mb-2">{category}</h3>
                <div className="space-y-2">
                  {shortcuts
                    .filter(s => s.category === category)
                    .map((shortcut, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {shortcut.description}
                        </span>
                        <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">
                          {shortcut.keys}
                        </kbd>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
