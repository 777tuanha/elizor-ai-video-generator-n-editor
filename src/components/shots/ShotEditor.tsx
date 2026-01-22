import { useState } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { VideoGrid } from './VideoGrid'
import { FrameReference } from './FrameReference'
import { Copy, Trash2, CopyPlus, Check, MoveRight } from 'lucide-react'
import { Shot } from '@/types/shot'

// Helper function to generate JSON prompt
const generateJsonPrompt = (shot: Shot): string => {
  // Filter out system fields
  const systemFields = ['id', 'index', 'status', 'usedVideoId', 'lastFrameUrl']

  const shotData: Record<string, any> = {}
  Object.entries(shot)
    .filter(([key]) => !systemFields.includes(key))
    .forEach(([key, value]) => {
      shotData[key] = value
    })

  return JSON.stringify(shotData, null, 2)
}

export function ShotEditor() {
  const project = useProjectStore(state => state.project)
  const getSelectedShot = useProjectStore(state => state.getSelectedShot)
  const deleteShot = useProjectStore(state => state.deleteShot)
  const duplicateShot = useProjectStore(state => state.duplicateShot)
  const selectShot = useProjectStore(state => state.selectShot)
  const toggleShotEditorPosition = useProjectStore(state => state.toggleShotEditorPosition)
  const shotEditorPosition = useProjectStore(state => state.shotEditorPosition)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [jsonCopied, setJsonCopied] = useState(false)

  const selectedShot = getSelectedShot()

  // Get previous shot for continuity reference
  const previousShot =
    selectedShot && selectedShot.index > 0 && project
      ? project.shots[selectedShot.index - 1]
      : null

  const handleCopyPrompt = async () => {
    if (!selectedShot) return

    const parts = [
      `Shot ${selectedShot.index + 1} (${selectedShot.duration}s)`,
      ``,
      `Visual: ${selectedShot.visual}`,
      ``,
      `Camera: ${selectedShot.camera}`,
    ]

    // Add dialogue with special formatting
    if (selectedShot.dialogue) {
      parts.push(``, `Dialogue: "${selectedShot.dialogue}"`)
    }

    // Add all other optional fields dynamically
    const systemFields = ['id', 'index', 'status', 'usedVideoId', 'lastFrameUrl']
    const displayedFields = ['duration', 'visual', 'camera', 'transition', 'dialogue']

    Object.entries(selectedShot)
      .filter(([key]) => !systemFields.includes(key) && !displayedFields.includes(key))
      .forEach(([key, value]) => {
        if (value && typeof value === 'string') {
          parts.push(``, `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
        }
      })

    parts.push(``, `Transition: ${selectedShot.transition}`)

    // Add continuity reference if this shot follows another shot
    if (previousShot) {
      parts.push(``, `Continuity: This shot follows Shot ${previousShot.index + 1}. `)
      if (previousShot.lastFrameUrl) {
        parts.push(`Reference the last frame from the previous shot to ensure visual continuity. Match lighting, subject position, and environmental details for a smooth transition.`)
      } else {
        parts.push(`Ensure visual continuity with the previous shot for smooth transition. Note: No reference frame available yet.`)
      }
    }

    const prompt = parts.join('\n')

    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleCopyJsonPrompt = async () => {
    if (!selectedShot) return

    const jsonPrompt = generateJsonPrompt(selectedShot)

    try {
      await navigator.clipboard.writeText(jsonPrompt)
      setJsonCopied(true)
      setTimeout(() => setJsonCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy JSON:', error)
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
    <div className="flex flex-col h-full p-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between mb-4">
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
            onClick={handleCopyJsonPrompt}
            disabled={jsonCopied}
          >
            {jsonCopied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy JSON
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
          <Button
            variant="outline"
            size="sm"
            onClick={toggleShotEditorPosition}
          >
            <MoveRight className="h-4 w-4 mr-2" />
            {shotEditorPosition === 'bottom' ? 'Move Right' : 'Move Bottom'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
        <TabsList>
          <TabsTrigger value="details">Shot Details</TabsTrigger>
          <TabsTrigger value="videos">Video Uploads</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="flex-1 overflow-auto space-y-4 mt-4">
          {/* Shot Details Card */}

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

              {/* Dialogue (with special formatting) */}
              {selectedShot.dialogue && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Dialogue
                  </label>
                  <div className="text-sm italic mt-1 pl-3 border-l-2 border-purple-400">
                    "{selectedShot.dialogue}"
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Transition
                </label>
                <p className="text-sm mt-1">{selectedShot.transition}</p>
              </div>

              {/* Display any other optional fields dynamically */}
              {Object.entries(selectedShot)
                .filter(([key]) => {
                  // Exclude system fields and known fields already displayed
                  const systemFields = ['id', 'index', 'status', 'usedVideoId', 'lastFrameUrl']
                  const displayedFields = ['duration', 'visual', 'camera', 'transition', 'dialogue']
                  return !systemFields.includes(key) && !displayedFields.includes(key)
                })
                .map(([key, value]) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-muted-foreground">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    <p className="text-sm mt-1">{String(value)}</p>
                  </div>
                ))}

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Status
                </label>
                <p className="text-sm mt-1 capitalize">{selectedShot.status}</p>
              </div>
            </div>
          </Card>

          {/* JSON Prompt Display */}
          <Card className="p-4">
            <label className="text-xs font-medium text-muted-foreground">
              JSON Prompt
            </label>
            <Textarea
              value={generateJsonPrompt(selectedShot)}
              readOnly
              className="font-mono text-xs mt-2 min-h-[200px]"
            />
          </Card>

          {/* Frame Reference */}
          {selectedShot.index > 0 && previousShot && (
            <FrameReference
              frameUrl={previousShot.lastFrameUrl}
              previousShotIndex={previousShot.index}
              continuityText={
                previousShot.lastFrameUrl
                  ? `This shot follows Shot ${previousShot.index + 1}. Use the reference frame above to ensure visual continuity. Match lighting, subject position, and environmental details for a smooth ${selectedShot.transition.toLowerCase()} transition.`
                  : `This shot follows Shot ${previousShot.index + 1}. Mark a video as Used in the previous shot to extract a reference frame for better continuity guidance.`
              }
            />
          )}
        </TabsContent>

        <TabsContent value="videos" className="flex-1 overflow-auto mt-4">
          <VideoGrid shotId={selectedShot.id} />
        </TabsContent>
      </Tabs>

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
