import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useProjectStore } from '@/stores/projectStore'
import { parseStoryScript } from '@/services/scriptParser'
import { AlertCircle } from 'lucide-react'

interface LoadScriptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SAMPLE_SCRIPT = `{
  "title": "Product Launch Teaser",
  "shots": [
    {
      "duration": 3,
      "visual": "Close-up of mysterious box on table, dramatic lighting",
      "camera": "Slow push in, shallow depth of field",
      "transition": "Quick cut"
    },
    {
      "duration": 4,
      "visual": "Hands opening the box, revealing golden light",
      "camera": "Eye-level, steady shot",
      "transition": "Match cut on light"
    },
    {
      "duration": 5,
      "visual": "Product reveal with particle effects",
      "camera": "360 degree orbit shot",
      "transition": "Fade to white"
    }
  ]
}`

export function LoadScriptDialog({ open, onOpenChange }: LoadScriptDialogProps) {
  const [scriptText, setScriptText] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [showConfirm, setShowConfirm] = useState(false)

  const project = useProjectStore(state => state.project)
  const loadStoryScript = useProjectStore(state => state.loadStoryScript)
  const hasExistingShots = project && project.shots.length > 0

  const handleValidateAndLoad = () => {
    setErrors([])

    if (!scriptText.trim()) {
      setErrors(['Please paste a story script JSON'])
      return
    }

    const result = parseStoryScript(scriptText)

    if (!result.success) {
      const errorMessages = result.errors.map(e => e.message)
      setErrors(errorMessages)
      return
    }

    // If project has existing shots, ask for confirmation
    if (hasExistingShots && !showConfirm) {
      setShowConfirm(true)
      return
    }

    // Load the script
    if (result.script) {
      loadStoryScript(result.script)
      setScriptText('')
      setErrors([])
      setShowConfirm(false)
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setScriptText('')
    setErrors([])
    setShowConfirm(false)
    onOpenChange(false)
  }

  const handleUseSample = () => {
    setScriptText(SAMPLE_SCRIPT)
    setErrors([])
    setShowConfirm(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Load Story Script</DialogTitle>
          <DialogDescription>
            Paste your AI-generated story script in JSON format. The script will
            define all shots for your video.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {showConfirm ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Replace Existing Shots?</AlertTitle>
              <AlertDescription>
                This project already has {project?.shots.length} shot(s). Loading
                a new script will replace all existing shots. This action cannot
                be undone.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Textarea
                value={scriptText}
                onChange={e => setScriptText(e.target.value)}
                placeholder="Paste JSON here..."
                className="min-h-[300px] font-mono text-xs"
              />

              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validation Errors</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-1">
                      {errors.map((error, index) => (
                        <div key={index} className="text-xs">
                          • {error}
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {showConfirm ? (
            <>
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleValidateAndLoad}
                className="w-full sm:w-auto"
              >
                Replace Shots
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleUseSample}
                className="w-full sm:w-auto"
              >
                Use Sample
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleValidateAndLoad}
                disabled={!scriptText.trim()}
                className="w-full sm:w-auto"
              >
                Load Script
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
