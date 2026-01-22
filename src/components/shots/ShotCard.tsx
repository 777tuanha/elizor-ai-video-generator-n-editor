import { Shot } from '@/types/shot'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ShotCardProps {
  shot: Shot
  isSelected: boolean
  onSelect: () => void
}

export function ShotCard({ shot, isSelected, onSelect }: ShotCardProps) {
  const statusColors = {
    empty: 'bg-gray-400',
    'has-video': 'bg-yellow-500',
    used: 'bg-green-500',
  }

  return (
    <Card
      className={cn(
        'p-3 cursor-pointer transition-colors hover:bg-accent',
        isSelected && 'ring-2 ring-primary bg-accent'
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted flex items-center justify-center">
          <span className="text-xs font-semibold text-muted-foreground">
            #{shot.index + 1}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-medium line-clamp-2 leading-tight">
              {shot.visual}
            </p>
            <div
              className={cn(
                'flex-shrink-0 w-2 h-2 rounded-full mt-1',
                statusColors[shot.status]
              )}
              title={shot.status}
            />
          </div>

          {shot.dialogue && (
            <div className="text-xs italic text-purple-400 line-clamp-1 mb-1">
              "{shot.dialogue}"
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{shot.duration}s</span>
            <span className="truncate">{shot.camera}</span>
          </div>

          <div className="mt-1 text-xs text-muted-foreground truncate">
            {shot.transition}
          </div>
        </div>
      </div>
    </Card>
  )
}
