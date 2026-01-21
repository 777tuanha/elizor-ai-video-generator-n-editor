import { VideoClip } from '@/types/video'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, CheckCircle, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatFileSize } from '@/utils/fileHelpers'

interface VideoThumbnailProps {
  video: VideoClip
  onPlay: () => void
  onMarkAsUsed: () => void
  onDelete: () => void
}

export function VideoThumbnail({
  video,
  onPlay,
  onMarkAsUsed,
  onDelete,
}: VideoThumbnailProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden transition-all',
        video.isUsed && 'ring-2 ring-green-500'
      )}
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-video bg-muted cursor-pointer group"
        onClick={onPlay}
      >
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.fileName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="h-12 w-12 text-white" />
        </div>

        {/* Used badge */}
        {video.isUsed && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Used
          </div>
        )}
      </div>

      {/* Info and actions */}
      <div className="p-3 space-y-2">
        <div className="space-y-1">
          <p className="text-sm font-medium truncate" title={video.fileName}>
            {video.fileName}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{video.duration.toFixed(1)}s</span>
            <span>{formatFileSize(video.blob.size)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={video.isUsed ? 'secondary' : 'default'}
            className="flex-1"
            onClick={onMarkAsUsed}
          >
            {video.isUsed ? 'Used' : 'Mark as Used'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
