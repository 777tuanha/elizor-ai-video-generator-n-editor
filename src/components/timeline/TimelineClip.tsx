import { Shot } from '@/types/shot'
import { VideoClip } from '@/types/video'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { GripVertical } from 'lucide-react'

interface TimelineClipProps {
  shot: Shot
  video: VideoClip
  isSelected: boolean
  onSelect: () => void
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  index: number
}

export function TimelineClip({
  shot,
  video,
  isSelected,
  onSelect,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  index,
}: TimelineClipProps) {
  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onSelect}
      className={cn(
        'relative cursor-pointer transition-all border-2 hover:border-primary/50',
        isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
      )}
      style={{
        // Base width of 120px per second of video
        width: `${Math.max(video.duration * 120, 80)}px`,
        minWidth: '80px',
      }}
    >
      <div className="h-full flex flex-col p-2">
        {/* Drag Handle */}
        <div className="flex items-center gap-1 mb-1">
          <GripVertical className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-medium">Shot {shot.index + 1}</span>
        </div>

        {/* Thumbnail */}
        {video.thumbnailUrl ? (
          <div className="relative flex-1 rounded overflow-hidden bg-muted mb-1">
            <img
              src={video.thumbnailUrl}
              alt={`Shot ${shot.index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="flex-1 rounded bg-muted mb-1 flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground">No thumb</span>
          </div>
        )}

        {/* Duration */}
        <div className="text-[10px] text-muted-foreground text-center">
          {video.duration.toFixed(1)}s
        </div>
      </div>

      {/* Timeline Position Indicator */}
      <div className="absolute -top-2 left-0 bg-primary text-primary-foreground px-1 rounded-t text-[9px] font-medium">
        {index + 1}
      </div>
    </Card>
  )
}
