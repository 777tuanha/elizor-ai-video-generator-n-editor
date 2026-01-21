import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { VideoClip } from '@/types/video'

interface VideoPreviewDialogProps {
  video: VideoClip | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VideoPreviewDialog({
  video,
  open,
  onOpenChange,
}: VideoPreviewDialogProps) {
  if (!video) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{video.fileName}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <video
            src={video.blobUrl}
            controls
            autoPlay
            className="w-full h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
