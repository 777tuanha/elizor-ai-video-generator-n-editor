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
  "title": "Down the Rabbit Hole: Alice's Jobless Wonderland",
  "shots": [
    {
      "duration": 6,
      "visual": "Stunning young Asian woman sitting alone in a modern apartment, staring at a laptop screen showing a layoff email, expression shifting from shock to despair",
      "camera": "Slow push in from wide shot to extreme close-up on her teary eyes",
      "dialogue": "Alice (soft whisper): '...Due to restructuring... your position has been eliminated...'",
      "transition": "Soft dissolve"
    },
    {
      "duration": 6,
      "visual": "Alice walking aimlessly through a lush city park in golden afternoon light, looking lost and frustrated",
      "camera": "Steadicam tracking beside her, keeping her in medium shot",
      "dialogue": "Alice (muttering): 'What now? Everything gone... just like that.'",
      "transition": "Quick cut"
    },
    {
      "duration": 6,
      "visual": "A white rabbit in a waistcoat frantically checks a pocket watch, then hops toward a large tree with a glowing hole",
      "camera": "Low-angle shot emphasizing urgency, then whip pan to Alice's surprised reaction",
      "dialogue": "White Rabbit: 'I'm late! I'm late! For a very important date!'",
      "transition": "Match cut on movement"
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
          {!showConfirm && (
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">Script format:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs ml-2">
                <li>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">duration</code>{' '}
                  (required): Shot duration in seconds
                </li>
                <li>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">visual</code>{' '}
                  (required): Visual description
                </li>
                <li>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">camera</code>{' '}
                  (required): Camera movement/angle
                </li>
                <li>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">transition</code>{' '}
                  (required): Transition to next shot
                </li>
                <li>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">dialogue</code>{' '}
                  (optional): Character dialogue/voiceover
                </li>
              </ul>
              <p className="text-xs italic mt-2">
                You can include any additional optional fields (e.g., location, music,
                notes) - they will be displayed in the shot details.
              </p>
            </div>
          )}

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
