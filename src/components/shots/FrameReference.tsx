import { Card } from '@/components/ui/card'
import { Image as ImageIcon } from 'lucide-react'

interface FrameReferenceProps {
  frameUrl: string | undefined
  previousShotIndex: number
  continuityText: string
}

export function FrameReference({
  frameUrl,
  previousShotIndex,
  continuityText,
}: FrameReferenceProps) {
  return (
    <Card className="p-4 border-primary/50">
      <h4 className="text-sm font-medium mb-3">Continuity Reference</h4>

      {/* Frame Preview */}
      <div className="mb-3">
        {frameUrl ? (
          <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
            <img
              src={frameUrl}
              alt={`Last frame from Shot ${previousShotIndex + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              Shot {previousShotIndex + 1} - Last Frame
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-muted rounded-md flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <ImageIcon className="h-8 w-8 mx-auto mb-2" />
              <p className="text-xs">
                No frame available from Shot {previousShotIndex + 1}
              </p>
              <p className="text-xs mt-1">
                Mark a video as Used to extract reference frame
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Continuity Instruction */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          Continuity Instruction
        </label>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {continuityText}
        </p>
      </div>
    </Card>
  )
}
