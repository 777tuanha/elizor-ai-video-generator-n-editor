import { useState } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Copy, Trash2, CopyPlus, Check } from 'lucide-react'

export function ShotEditor() {
  const project = useProjectStore(state => state.project)
  const getSelectedShot = useProjectStore(state => state.getSelectedShot)
  const deleteShot = useProjectStore(state => state.deleteShot)
  const duplicateShot = useProjectStore(state => state.duplicateShot)
  const selectShot = useProjectStore(state => state.selectShot)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [copied, setCopied] = useState(false)

  const selectedShot = getSelectedShot()

  const handleCopyPrompt = async () => {
    if (!selectedShot) return

    const prompt = `Shot ${selectedShot.index + 1} (${selectedShot.duration}s)

Visual: ${selectedShot.visual}

Camera: ${selectedShot.camera}

Transition: ${selectedShot.transition}`

    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleDelete = () => {
    if (!selectedShot) return
    deleteShot(selectedShot.id)
    selectShot(null)
    setShowDeleteConfirm(false)
  }

  const handleDuplicate = () => {
    if (!selectedShot) return
    duplicateShot(selectedShot.id)
  }

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">No project loaded</p>
      </div>
    )
  }

  if (!selectedShot) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Select a shot from the list to view details
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Left Panel: Shot Material */}
      <div className="flex-1 border-r p-4 overflow-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Shot {selectedShot.index + 1}
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPrompt}
                disabled={copied}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Prompt
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
              >
                <CopyPlus className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <Card className="p-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Duration
                </label>
                <p className="text-sm mt-1">{selectedShot.duration} seconds</p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Visual Description
                </label>
                <p className="text-sm mt-1">{selectedShot.visual}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Camera Instruction
                </label>
                <p className="text-sm mt-1">{selectedShot.camera}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Transition
                </label>
                <p className="text-sm mt-1">{selectedShot.transition}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Status
                </label>
                <p className="text-sm mt-1 capitalize">{selectedShot.status}</p>
              </div>
            </div>
          </Card>

          {selectedShot.index > 0 && (
            <Card className="p-4 border-primary/50">
              <h4 className="text-sm font-medium mb-2">Continuity Guide</h4>
              <p className="text-xs text-muted-foreground">
                This shot follows Shot {selectedShot.index}. Ensure visual
                continuity between shots for smooth transitions.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Right Panel: Generated Videos */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Video Uploads</h3>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              Video upload functionality coming in Phase 5
            </p>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Shot?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete Shot {selectedShot.index + 1}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
